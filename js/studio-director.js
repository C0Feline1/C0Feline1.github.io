/* Quiet, local choreography for the shared studio. This module chooses poses;
 * the host keeps ownership of navigation, collision, camera and user input. */
(function () {
  'use strict';
  var STORIES = [
    { id: 'art-share', actors: ['X0', 'Feline1'], stages: [
      { actions: ['x0_sketch', 'f1_paws'], delays: [0, 480], moods: ['symbols', 'heart'] },
      { actions: ['cheer', 'f1_paws'], delays: [0, 240], moods: ['music', 'heart'] }
    ] },
    { id: 'cookie-share', actors: ['doubao', 'gemini'], stages: [
      { actions: ['doubao_cookie', 'gemini_twins'], delays: [0, 520], moods: ['heart', 'symbols'] },
      { actions: ['doubao_idea', 'cheer'], delays: [0, 260], moods: ['music', 'heart'] }
    ] },
    { id: 'fish-watch', actors: ['deepseek', 'grok'], stages: [
      { actions: ['deepseek_fish', 'grok_smirk'], delays: [0, 420], moods: ['symbols', 'angry'] },
      { actions: ['deepseek_bowl', 'talk'], delays: [0, 320], moods: ['heart', 'music'] }
    ] },
    { id: 'tea-break', actors: ['gpt', 'kimi'], stages: [
      { actions: ['gpt_tea', 'coffee'], delays: [0, 600], moods: ['symbols', 'heart'] },
      { actions: ['coffee', 'kimi_moon'], delays: [0, 380], moods: ['heart', 'music'] }
    ] }
  ];
  function finite(value, fallback) { var n = Number(value); return Number.isFinite(n) ? n : fallback; }
  function create(options) {
    options = options || {};
    var actors = options.actors || [], byId = Object.create(null), jobs = [], pending = null;
    var cursor = 0, storyCursor = 0, serial = 0, tick = 0, now = 0, context = {}, firstStory = true;
    var nextSolo = 30, nextDuo = 190, nextAction = Object.create(null), cooldown = Object.create(null), duoCooldown = Object.create(null), played = Object.create(null), storyStarted = Object.create(null);
    var isMoving = options.isMoving || function (a) { return !!(a.path && a.path.length); };
    actors.forEach(function (a) { byId[a.id] = a; nextAction[a.id] = 0; played[a.id] = 0; cooldown[a.id] = 0; duoCooldown[a.id] = 0; });
    STORIES.forEach(function (story) { storyStarted[story.id] = 0; });
    var order = actors.slice().sort(function (a, b) { return a.id === 'Feline1' ? -1 : b.id === 'Feline1' ? 1 : 0; });
    function actor(value) { return typeof value === 'string' ? byId[value] : value; }
    function kit(a) { return options.getKit ? options.getKit(a) : a.ai ? window.AIStudioSprites : window.StudioHeroSprites; }
    function meta(a, state) { var k = kit(a); return k && k.states && k.states[state]; }
    function cycle(a, state) { var m = meta(a, state); return m && m.count > 0 && m.frameMs > 0 ? m.count * m.frameMs : 0; }
    function signatures(a) { var k = kit(a); return k && typeof k.uniqueActions === 'function' ? k.uniqueActions(a.id) : []; }
    function blocked(a, ctx) { return !!(ctx.blocked && ctx.blocked.indexOf(a.id) >= 0); }
    function owns(value) { var a = actor(value); return !!a && jobs.some(function (j) { return j.actors.indexOf(a) >= 0; }); }
    function suspended(ctx) { return !!(ctx.reduced || ctx.photo || ctx.paused || ctx.hidden); }
    function free(a, ctx, manual) {
      return !!a && !owns(a) && !blocked(a, ctx) && (manual || !isMoving(a) && !(a.waveUntil > tick) && a.state !== 'chat' && a.state !== 'wave' && now >= cooldown[a.id]);
    }
    function emit(job, type, phase, extra) {
      if (!options.onEvent) return;
      var detail = { type: type, phase: phase, actors: job.actors.map(function (a) { return a.id; }), action: job.actions[0], scene: job.story ? job.story.id : null, stage: job.stage || 0, job: job.id };
      if (extra) Object.keys(extra).forEach(function (key) { detail[key] = extra[key]; });
      options.onEvent(detail);
    }
    function remove(job, cancelled, reason, preserve) {
      var index = jobs.indexOf(job); if (index < 0) return [];
      jobs.splice(index, 1);
      var ids = job.actors.map(function (a) { return a.id; });
      job.actors.forEach(function (a, i) {
        // Do not touch position, state, or a new host navigation command.
        if (job.saved[i] && job.phase !== 'approach' && !isMoving(a)) {
          a.direction = job.saved[i].direction; a.facingLeft = job.saved[i].facingLeft;
        }
        a.until = Math.max(finite(a.until, 0), tick + (cancelled ? 55 : 100));
        cooldown[a.id] = now + (cancelled ? 3500 : 14000 + finite(a.index, 0) * 370);
        // A short rest after a solo still leaves a real invitation window before
        // the host's normal departure. Duets have their own, longer cooldown.
        duoCooldown[a.id] = now + (cancelled ? 2000 : job.story ? 6000 : 900);
      });
      if (cancelled && options.onCancel) options.onCancel({ actors: ids.slice(), approaching: job.phase === 'approach' ? ids.slice() : [], reason: reason || 'cancelled', preserve: (preserve || []).slice() });
      if (job.story) nextDuo = tick + (cancelled ? 180 : 340);
      nextSolo = Math.max(nextSolo, tick + (cancelled ? 30 : 55));
      return ids;
    }
    function cancel(value, reason) {
      var a = actor(value), released = [];
      if (value !== undefined && value !== null && !a) return released;
      if (pending && (!a || pending.actor === a)) { released.push(pending.actor.id); pending = null; }
      jobs.slice().forEach(function (job) { if (!a || job.actors.indexOf(a) >= 0) released = released.concat(remove(job, true, reason)); });
      return released.filter(function (id, i, list) { return list.indexOf(id) === i; });
    }
    function destination(a, ctx, action) {
      if (options.findSoloStage) return options.findSoloStage(a, ctx, action);
      return { x: a.x, y: a.y };
    }
    function pointValid(point) { return !!point && Number.isFinite(point.x) && Number.isFinite(point.y); }
    function arrived(job) {
      return job.actors.every(function (a, i) { return !isMoving(a) && Math.hypot(a.x - job.targets[i].x, a.y - job.targets[i].y) <= 3; });
    }
    function orient(job) {
      job.actors.forEach(function (a, i) {
        if (job.story) { var other = job.actors[1 - i]; a.direction = other.x < a.x ? 'left' : 'right'; }
        else if (a.direction === 'back' || a.direction === 'front') a.direction = 'right';
        a.facingLeft = a.direction === 'left';
      });
    }
    function startStage(job, stage) {
      job.phase = 'perform'; job.stage = stage; job.startMs = now;
      if (job.story && stage === 0) { firstStory = false; storyStarted[job.story.id]++; }
      var spec = job.story ? job.story.stages[stage] : { actions: job.actions, delays: [0], moods: [job.mood] };
      job.actions = spec.actions.slice(); job.delays = spec.delays.slice(); job.moods = spec.moods.slice();
      job.loops = job.actions.map(function () { return 2; });
      job.durations = job.actions.map(function (state, i) { return cycle(job.actors[i], state) * job.loops[i]; });
      job.endMs = now + Math.max.apply(null, job.durations.map(function (duration, i) { return duration + job.delays[i]; }));
      orient(job);
      if (!job.story) {
        var a = job.actors[0]; nextAction[a.id] = (nextAction[a.id] + 1) % Math.max(1, signatures(a).length); played[a.id]++;
      }
      emit(job, job.story ? 'scene' : 'perform', stage ? 'stage-start' : 'start');
    }
    function prepare(job) {
      if (job.actors.some(function (a, i) { return job.manual || Math.hypot(a.x - job.targets[i].x, a.y - job.targets[i].y) > 2; }) && typeof options.navigate !== 'function') return false;
      jobs.push(job);
      job.actors.forEach(function (a, i) {
        if (job.manual || Math.hypot(a.x - job.targets[i].x, a.y - job.targets[i].y) > 2) options.navigate(a, job.targets[i].x, job.targets[i].y, 'rest', false);
      });
      if (arrived(job)) startStage(job, 0);
      return true;
    }
    function solo(a, ctx, manual) {
      if (!a || jobs.some(function (j) { return !!j.story; }) || jobs.length >= 2 || !manual && !free(a, ctx, false)) return false;
      var list = signatures(a); if (!list.length) return false;
      var state = list[nextAction[a.id] % list.length].id, target = destination(a, ctx, state);
      if (!pointValid(target) || !cycle(a, state)) return false;
      return prepare({ id: ++serial, actors: [a], story: null, phase: 'approach', actions: [state], targets: [target], saved: [{ direction: a.direction, facingLeft: a.facingLeft }], createdMs: now, approachUntil: now + 20000, manual: !!manual, mood: ['symbols', 'music', 'heart'][nextAction[a.id] % 3] });
    }
    function duo(ctx) {
      if (jobs.length || ctx.pairActive || !options.findStage) return false;
      var supported = STORIES.filter(function (story) { return story.actors.every(function (id) { return !!byId[id]; }); });
      if (!supported.length) return false;
      var fewest = Math.min.apply(null, supported.map(function (story) { return storyStarted[story.id]; }));
      for (var offset = 0; offset < STORIES.length; offset++) {
        var index = (storyCursor + offset) % STORIES.length, story = STORIES[index], members = story.actors.map(function (id) { return byId[id]; });
        if (firstStory && story.id !== 'art-share') continue;
        // An easy repeated story cannot take every slot from a still unseen one.
        if (storyStarted[story.id] !== fewest) continue;
        if (!members.every(function (a) { return !!a && !owns(a) && !blocked(a, ctx) && !isMoving(a) && !(a.waveUntil > tick) && a.state !== 'chat' && (firstStory || now >= duoCooldown[a.id]); })) continue;
        if (!story.stages.every(function (s) { return s.actions.every(function (state, i) { return cycle(members[i], state) > 0; }); })) continue;
        var targets = options.findStage(members[0], members[1], ctx);
        if (!Array.isArray(targets) || targets.length !== 2 || !targets.every(pointValid) || Math.hypot(targets[0].x - targets[1].x, targets[0].y - targets[1].y) < 32) continue;
        storyCursor = (index + 1) % STORIES.length;
        var journey = Math.max.apply(null, members.map(function (a, i) {
          var speed = a.id === 'gpt' ? .88 * .58 : a.ai ? .88 : 1.05;
          return Math.hypot(a.x - targets[i].x, a.y - targets[i].y) / speed * 55 * 1.35 + 4000;
        }));
        return prepare({ id: ++serial, actors: members, story: story, phase: 'approach', actions: story.stages[0].actions.slice(), targets: targets, saved: members.map(function (a) { return { direction: a.direction, facingLeft: a.facingLeft }; }), createdMs: now, approachUntil: now + Math.min(50000, Math.max(12000, journey)) });
      }
      return false;
    }
    function update(t, milliseconds, ctx) {
      tick = finite(t, tick); now = finite(milliseconds, now); context = ctx || {};
      if (suspended(context)) { cancel(null, 'suspended'); return; }
      jobs.slice().forEach(function (job) {
        var reserved = job.actors.filter(function (a) { return blocked(a, context); }).map(function (a) { return a.id; });
        if (reserved.length) { remove(job, true, 'host-reservation', reserved); return; }
        if (job.phase === 'approach') {
          if (arrived(job)) startStage(job, 0);
          else if (now >= job.approachUntil || job.actors.some(function (a, i) { return !isMoving(a) && Math.hypot(a.x - job.targets[i].x, a.y - job.targets[i].y) > 3; })) remove(job, true, 'unreachable');
        } else if (job.actors.some(isMoving)) remove(job, true, 'host-navigation');
        else if (now >= job.endMs) {
          emit(job, job.story ? 'scene' : 'perform', 'stage', { complete: true });
          if (job.story && job.stage + 1 < job.story.stages.length) startStage(job, job.stage + 1);
          else { emit(job, job.story ? 'scene' : 'perform', 'complete'); remove(job, false); }
        }
      });
      if (pending && now >= pending.expiresMs) pending = null;
      if (pending && !blocked(pending.actor, context) && solo(pending.actor, context, true)) pending = null;
      if (context.canStart === false || pending) return;
      if (tick >= nextDuo && !jobs.length && !context.pairActive) {
        if (duo(context)) return;
        nextDuo = tick + 55;
      }
      if (tick < nextSolo || jobs.length >= 2 || jobs.some(function (job) { return !!job.story; })) return;
      // Give an imminent conversation enough quiet time for solo acts to finish.
      if (tick >= nextDuo - 45 && !context.pairActive && jobs.length) { nextSolo = tick + 20; return; }
      var least = Infinity;
      order.forEach(function (a) { if (free(a, context, false)) least = Math.min(least, played[a.id]); });
      var candidates = [];
      for (var i = 0; i < order.length; i++) { var a = order[(cursor + i) % order.length]; if (free(a, context, false) && played[a.id] === least) candidates.push(a); }
      if (!serial && context.followedId) candidates.sort(function (a, b) { return a.id === context.followedId ? -1 : b.id === context.followedId ? 1 : 0; });
      for (var c = 0; c < candidates.length; c++) if (solo(candidates[c], context, false)) { cursor = (order.indexOf(candidates[c]) + 1) % Math.max(1, order.length); break; }
      nextSolo = tick + 85;
    }
    function pose(value, atMs) {
      var a = actor(value), job = a && jobs.filter(function (j) { return j.actors.indexOf(a) >= 0; })[0];
      if (!job || job.phase !== 'perform') return null;
      var sampleMs = finite(atMs, now);
      var i = job.actors.indexOf(a), elapsed = sampleMs - job.startMs - job.delays[i], state = job.actions[i], timing = meta(a, state), complete = elapsed >= job.durations[i];
      var waiting = elapsed < 0 || complete;
      if (waiting) { state = 'idle'; timing = meta(a, state); }
      var local = elapsed < 0 ? sampleMs - job.startMs : complete ? elapsed - job.durations[i] : elapsed;
      var frame = timing ? Math.floor(Math.max(0, local) / timing.frameMs) % timing.count : 0;
      var speaking = !job.story || (sampleMs - job.startMs) / Math.max(1, job.endMs - job.startMs) < .5 ? i === 0 : i === 1;
      return { isDirector: true, job: job.id, state: state, action: job.actions[i], frame: frame, direction: a.direction, mood: speaking ? job.moods[i] : null, waiting: waiting, loops: Math.min(job.loops[i], Math.max(0, Math.floor(elapsed / Math.max(1, cycle(a, job.actions[i]))))), startMs: job.startMs + job.delays[i], scene: job.story ? job.story.id : null, stage: job.stage };
    }
    function requestSolo(value, t, milliseconds, ctx) {
      tick = finite(t, tick); now = finite(milliseconds, now); context = ctx || context;
      var a = actor(value); if (!a || suspended(context) || !signatures(a).length) return false;
      cancel(a, 'manual-performance');
      // Automatic preparations yield to an explicit user request. A duet that
      // has already begun keeps its complete cycles and the request waits.
      jobs.slice().forEach(function (job) { if (job.story && job.phase === 'approach') remove(job, true, 'manual-priority'); });
      if (solo(a, context, true)) return true;
      // Existing solos may still be walking, while an already performing duet
      // keeps both short stages. Automatic duet preparations yielded above;
      // new user input removes this request immediately through cancel(actor).
      pending = { actor: a, expiresMs: now + 45000 }; return true;
    }
    function snapshot() {
      return { tick: tick, timeMs: now, nextSolo: nextSolo, nextDuo: nextDuo, pending: pending ? { actor: pending.actor.id, expiresMs: pending.expiresMs } : null,
        jobs: jobs.map(function (job) { return { id: job.id, type: job.story ? 'duo' : 'solo', scene: job.story ? job.story.id : null, phase: job.phase, stage: job.stage || 0, actions: job.actions.slice(), actors: job.actors.map(function (a) { return a.id; }), targets: job.targets.map(function (p) { return { x: p.x, y: p.y }; }), startMs: job.startMs === undefined ? null : job.startMs, remainingMs: Math.max(0, (job.phase === 'approach' ? job.approachUntil : job.endMs) - now), poses: job.actors.map(function (a) { return pose(a); }) }; }),
        played: Object.assign({}, played), nextAction: Object.assign({}, nextAction), storyStarted: Object.assign({}, storyStarted) };
    }
    return { update: update, pose: pose, owns: owns, cancel: cancel, cancelAll: function (reason) { return cancel(null, reason); }, requestSolo: requestSolo, snapshot: snapshot };
  }
  window.StudioDirector = { create: create, stories: STORIES.map(function (s) { return { id: s.id, actors: s.actors.slice() }; }) };
}());
