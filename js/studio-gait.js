/* Shared twelve-pose locomotion, expressed on the native 48 x 64 grid.
 * The shoe anchor is its ankle; render the sole four pixels below that point.
 * All limbs keep their segment lengths. Contact and recovery are separate
 * phases: a planted foot travels backwards on one ground plane, while its
 * partner bends at the knee to clear that plane before the next contact. */
(function () {
  'use strict';

  var COUNT = 12;
  var states = {
    walk: { count: COUNT, frameMs: 800 / COUNT, cycleMs: 800, stridePixels: 20,
      phaseLabels: ['右脚落地', '接住重心', '压低承重', '左脚经过', '右脚推离', '重心抬高', '左脚落地', '接住重心', '压低承重', '右脚经过', '左脚推离', '重心抬高'] },
    run: { count: COUNT, frameMs: 560 / COUNT, cycleMs: 560, stridePixels: 36,
      phaseLabels: ['右脚触地', '缓冲承重', '右脚蹬地', '离地腾空', '收起后脚', '左脚前摆', '左脚触地', '缓冲承重', '左脚蹬地', '离地腾空', '收起后脚', '右脚前摆'] }
  };
  var walkNames = ['contact', 'down', 'down', 'passing', 'up', 'up', 'contact', 'down', 'down', 'passing', 'up', 'up'];
  var runNames = ['contact', 'down', 'down', 'up', 'up', 'passing', 'contact', 'down', 'down', 'up', 'up', 'passing'];
  var walk = {
    // Stance travels exactly -20/12 native pixels per pose. That cancels the
    // map's authored 20px stride and keeps a planted shoe on its ground tile.
    // The other six poses recover through a bent-knee arc above that plane.
    x: [5, 10 / 3, 5 / 3, 0, -5 / 3, -10 / 3, -5, -4.5, -2, 1, 3.8, 5.2],
    y: [59, 59, 59, 59, 59, 59, 58, 55.5, 53.5, 53.8, 55.5, 58],
    body: [0, 0.6, 0.9, 0.4, -0.2, -0.6, 0, 0.6, 0.9, 0.4, -0.2, -0.6],
    arm: [-4, -3, -1.5, 0, 1.5, 3, 4, 3, 1.5, 0, -1.5, -3],
    hair: [0, 0, 0.5, 1, 1, 0.5, 0, 0, -0.5, -1, -1, -0.5],
    planted: [true, true, true, true, true, true, false, false, false, false, false, false],
    roll: ['heel', 'flat', 'flat', 'flat', 'flat', 'toe', 'air', 'air', 'air', 'air', 'air', 'air'],
    tilt: [-1, -0.5, 0, 0, 0.5, 1, 1, 0.5, 0, -0.5, -1, -1],
    nearLength: 6.25,
    farLength: 5.8
  };
  var run = {
    // Three grounded poses and three flight poses per half-cycle. The second
    // leg takes over at +6; contact, compression and drive are separate poses.
    // Recovery ankle rises behind the knee, then swings under the body.
    x: [9, 6, 3, 0, -4, -8, -10, -9, -6, -1, 4, 8],
    y: [59, 59, 59, 56, 52, 50, 49.5, 49.5, 50.5, 52.5, 55, 58],
    body: [0, 0.8, 1, 0, -1, -1.8, 0, 0.8, 1, 0, -1, -1.8],
    arm: [-6, -4.5, -2, 0, 2.5, 4.5, 6, 4.5, 2, 0, -2.5, -4.5],
    hair: [1, 1, 0.75, 0.25, -0.5, -1, -1, -1, -0.75, -0.25, 0.5, 1],
    planted: [true, true, true, false, false, false, false, false, false, false, false, false],
    roll: ['heel', 'flat', 'toe', 'air', 'air', 'air', 'air', 'air', 'air', 'air', 'air', 'air'],
    tilt: [-0.5, 0, 1, 1, 0.5, 0, -0.5, -1, -1, -0.5, 0, -0.5],
    nearLength: 7.5,
    farLength: 6.8
  };

  function point(x, y) { return { x: x, y: y }; }
  function knee(hip, ankle, length) {
    var dx = ankle.x - hip.x, dy = ankle.y - hip.y;
    var distance = Math.sqrt(dx * dx + dy * dy);
    // The hand-authored anchors are reachable. Guard the solver as well so
    // malformed caller input can never feed NaN into the pixel-art renderer.
    var safe = Math.max(0.001, Math.min(length * 2 - 0.001, distance));
    var along = safe / 2;
    var bend = Math.sqrt(Math.max(0, length * length - along * along));
    var ux = distance ? dx / distance : 0, uy = distance ? dy / distance : 1;
    // Bend toward the direction of travel, rather than letting a joint flip
    // across the hip/ankle line when the foot passes under the pelvis.
    return point(hip.x + ux * along + uy * bend, hip.y + uy * along - ux * bend);
  }

  function leg(data, phase, bodyY, far) {
    var hip = point(far ? 21 : 26, (far ? 47 : 48) + bodyY);
    var ankle = point(hip.x + data.x[phase], data.y[phase] - (far ? 2 : 0));
    return {
      hip: hip,
      knee: knee(hip, ankle, far ? data.farLength : data.nearLength),
      ankle: ankle,
      planted: data.planted[phase],
      roll: data.roll[phase],
      footTilt: data.tilt[phase]
    };
  }

  function neutral() {
    return {
      phase: 0, phaseName: 'neutral', bodyY: 0, lean: 0, armSwing: 0,
      hairLag: 0, stridePixels: 0, flight: false,
      near: { hip: point(26, 48), knee: point(26, 53), ankle: point(26, 59), planted: true, roll: 'flat', footTilt: 0 },
      far: { hip: point(21, 47), knee: point(21, 52), ankle: point(21, 57), planted: true, roll: 'flat', footTilt: 0 }
    };
  }

  function sample(state, index) {
    if (state !== 'walk' && state !== 'run') return neutral();
    var n = Number(index);
    if (!Number.isFinite(n)) n = 0;
    var phase = ((Math.floor(n) % COUNT) + COUNT) % COUNT;
    var data = state === 'run' ? run : walk;
    var bodyY = data.body[phase];
    var near = leg(data, phase, bodyY, false);
    var far = leg(data, (phase + COUNT / 2) % COUNT, bodyY, true);
    return {
      phase: phase,
      phaseName: (state === 'run' ? runNames : walkNames)[phase],
      phaseLabel: states[state].phaseLabels[phase],
      bodyY: bodyY,
      lean: state === 'run' ? 2 : 0,
      armSwing: data.arm[phase],
      hairLag: data.hair[phase],
      near: near,
      far: far,
      stridePixels: states[state].stridePixels,
      flight: !near.planted && !far.planted
    };
  }

  window.StudioGait = { states: states, sample: sample };
})();
