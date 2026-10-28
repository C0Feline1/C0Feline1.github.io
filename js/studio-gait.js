/* Shared twelve-pose locomotion, expressed on the native 48 x 64 grid.
 * The shoe anchor is its ankle; render the sole four pixels below that point.
 * All limbs keep their segment lengths. Contact and recovery are separate
 * phases: a planted foot travels backwards on one ground plane, while its
 * partner bends at the knee to clear that plane before the next contact. */
(function () {
  'use strict';

  var COUNT = 12, NEAR_LENGTH = 6.25, FAR_LENGTH = 5.8;
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
    body: [0.55, 0.8, 0.1, -0.65, -0.25, 0.15, 0.55, 0.8, 0.1, -0.65, -0.25, 0.15],
    arm: [-4, -3, -1.5, 0, 1.5, 3, 4, 3, 1.5, 0, -1.5, -3],
    hair: [0, 0, 0.5, 1, 1, 0.5, 0, 0, -0.5, -1, -1, -0.5],
    planted: [true, true, true, true, true, true, false, false, false, false, false, false],
    roll: ['heel', 'flat', 'flat', 'flat', 'flat', 'toe', 'air', 'air', 'air', 'air', 'air', 'air'],
    tilt: [-1, -0.5, 0, 0, 0.5, 1, 1, 0.5, 0, -0.5, -1, -1],
    nearLength: NEAR_LENGTH,
    farLength: FAR_LENGTH
  };
  var run = {
    // Three grounded poses and three flight poses per half-cycle. The second
    // leg takes over at +6; contact, compression and drive are separate poses.
    // Recovery ankle rises behind the knee, then swings under the body.
    x: [3, 0, -3, -5.5, -4.5, -3.5, -1, 2, 4.5, 6, 5, 4],
    y: [59, 59, 59, 56.5, 53.5, 51.5, 51, 51.5, 53, 55.5, 57.5, 58.5],
    body: [0, 0.8, 0.35, -0.6, -1.5, -0.8, 0, 0.8, 0.35, -0.6, -1.5, -0.8],
    arm: [-6, -4.5, -2, 0, 2.5, 4.5, 6, 4.5, 2, 0, -2.5, -4.5],
    hair: [1, 1, 0.75, 0.25, -0.5, -1, -1, -1, -0.75, -0.25, 0.5, 1],
    planted: [true, true, true, false, false, false, false, false, false, false, false, false],
    roll: ['heel', 'flat', 'toe', 'air', 'air', 'air', 'air', 'air', 'air', 'air', 'air', 'air'],
    tilt: [-0.5, 0, 1, 1, 0.5, 0, -0.5, -1, -1, -0.5, 0, -0.5],
    nearLength: NEAR_LENGTH,
    farLength: FAR_LENGTH
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
    // In a right-front three-quarter view the camera-near side is screen-left.
    // Forward stride remains +X; exchanging depth must not reverse the gait.
    var hip = point(far ? 26 : 21, (far ? 47 : 48) + bodyY);
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
    var nearHip=point(21,48),nearAnkle=point(21,59),farHip=point(26,47),farAnkle=point(26,57);
    return {
      phase: 0, phaseName: 'neutral', bodyY: 0, lean: 0, armSwing: 0,
      hairLag: 0, stridePixels: 0, flight: false,
      near: { hip: nearHip, knee: knee(nearHip,nearAnkle,NEAR_LENGTH), ankle: nearAnkle, planted: true, roll: 'flat', footTilt: 0 },
      far: { hip: farHip, knee: knee(farHip,farAnkle,FAR_LENGTH), ankle: farAnkle, planted: true, roll: 'flat', footTilt: 0 }
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

  // Moving arms use two fixed segments, with angles measured from vertical.
  // This keeps the elbow attached without lengthening the upper arm at the
  // ends of its swing. Authored gestures keep their own hand targets.
  function arm(state, pose, shoulder, far, options) {
    options = options || {};
    var running = state === 'run';
    var upperLength = options.upperLength || 5;
    var foreLength = options.foreLength || 5;
    var drive = (pose.armSwing || 0) * (far ? -1 : 1);
    var ratio = Math.max(-1, Math.min(1, drive / (running ? 6 : 4)));
    var theta = ratio * (running ? 45 : 24) * Math.PI / 180;
    var foreTheta = theta + (running ? 95 : 12) * Math.PI / 180;
    var elbow = point(shoulder.x + Math.sin(theta) * upperLength,
      shoulder.y + Math.cos(theta) * upperLength);
    var wrist = point(elbow.x + Math.sin(foreTheta) * foreLength,
      elbow.y + Math.cos(foreTheta) * foreLength);
    return { shoulder: point(shoulder.x, shoulder.y), elbow: elbow, wrist: wrist,
      upperLength: upperLength, foreLength: foreLength };
  }

  window.StudioGait = { states: states, sample: sample, arm: arm };
})();
