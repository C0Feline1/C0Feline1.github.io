/* Small fan-character comedy beats, drawn in pixels. These are fictional
 * personalities, never API availability indicators. No actor state is mutated. */
(function () {
  'use strict';

  var AI = { gpt: true, deepseek: true, claude: true, grok: true, gemini: true, kimi: true, doubao: true };
  var QUIET = { work: true, idle: true, rest: true };
  var INK = '#594a72', WHITE = '#f4efff', LILAC = '#c5b5e5';

  function time(tick) { return Math.max(0, Math.floor(Number(tick) || 0)); }
  function phase(tick, period) { return time(tick) % period; }
  function moving(actor) {
    return !!(actor && ((actor.path && actor.path.length) ||
      actor.state === 'walk' || actor.state === 'run' || actor.state === 'moving'));
  }
  function available(actor, tick) {
    return !!(actor && AI[actor.id] && QUIET[actor.state] && !moving(actor) &&
      !(Number(actor.waveUntil) > time(tick)));
  }
  function beat(actor, tick) {
    if (!available(actor, tick)) return null;
    var p;
    switch (actor.id) {
      case 'claude':
        p = phase(tick, 800);
        return p >= 180 && p < 260 ? { id: 'claude-soul-break', p: p - 180, span: 80 } : null;
      case 'deepseek':
        p = phase(tick, 620);
        return p >= 145 && p < 280 ? { id: 'deepseek-nap', p: p - 145, span: 135 } : null;
      case 'doubao':
        p = phase(tick, 530);
        if (p >= 72 && p < 166) return { id: 'doubao-daydream', p: p - 72, span: 94 };
        return p >= 166 && p < 214 ? { id: 'doubao-little-idea', p: p - 166, span: 48 } : null;
      case 'grok':
        p = phase(tick, 680);
        return p >= 330 && p < 385 ? { id: 'grok-spark', p: p - 330, span: 55 } : null;
      case 'gemini':
        p = phase(tick, 570);
        return p >= 240 && p < 330 ? { id: 'gemini-color-stars', p: p - 240, span: 90 } : null;
      case 'kimi':
        p = phase(tick, 760);
        return p >= 480 && p < 565 ? { id: 'kimi-moon-notes', p: p - 480, span: 85 } : null;
      default: return null;
    }
  }
  function pose(actor, tick, reduced) {
    var result = { alpha: 1, state: null, speed: 1 };
    if (reduced || !actor || !AI[actor.id]) return result;
    if (actor.id === 'gpt') result.speed = 0.58;
    var b = beat(actor, tick);
    if (!b) return result;
    if (actor.id === 'claude') {
      // Ease into and out of transparency; retain a visible body throughout.
      var envelope = Math.min(1, b.p / 12, (b.span - 1 - b.p) / 14);
      result.alpha = Math.max(0.35, 1 - Math.max(0, envelope) * 0.65);
      result.state = 'nap';
    } else if (actor.id === 'deepseek') {
      result.state = 'nap';
    }
    return result;
  }
  function box(g, x, y, w, h, color) {
    g.fillStyle = color;
    g.fillRect(Math.round(x), Math.round(y), w, h);
  }
  function stamp(g, rows, x, y, palette) {
    for (var j = 0; j < rows.length; j++) {
      for (var i = 0; i < rows[j].length; i++) {
        if (palette[rows[j][i]]) box(g, x + i, y + j, 1, 1, palette[rows[j][i]]);
      }
    }
  }
  function spark(g, x, y, color, small) {
    box(g, x, y - 1, 1, 3, color);
    box(g, x - 1, y, 3, 1, color);
    if (!small) {
      box(g, x, y - 2, 1, 1, color); box(g, x, y + 2, 1, 1, color);
      box(g, x - 2, y, 1, 1, color); box(g, x + 2, y, 1, 1, color);
      box(g, x, y, 1, 1, WHITE);
    }
  }
  function crescent(g, x, y) {
    stamp(g, ['..mm.', '.mm..', 'mm...', 'mm...', '.mm..', '..mm.'], x, y,
      { m: '#e2d8a8' });
  }
  function sleepyEyes(g, x, y, w, h, color) {
    // Facial accents stay at the eyes, clear of torso emblems and floating badges.
    var ey = Math.round(y + h * 0.36);
    box(g, x + w * 0.38, ey, 2, 1, color);
    box(g, x + w * 0.56, ey, 2, 1, color);
  }
  function ghost(g, x, y, w, h, b) {
    var arc = Math.sin(Math.PI * b.p / (b.span - 1));
    var fade = Math.max(0, Math.min(1, b.p / 10, (b.span - 1 - b.p) / 10));
    var lift = Math.round(arc * 14);
    var gx = Math.round(x - 7 + Math.sin(b.p * 0.055) * arc);
    var gy = Math.round(y + 7 - lift);
    // A cloud soul on the left of the head leaves the logo area unobscured.
    g.globalAlpha = (0.65 + arc * 0.3) * fade;
    stamp(g, [
      '....oooo.....',
      '..ooWWWWoo...',
      '.oWWWWWWWwo..',
      'oWWWWWWWWWwo.',
      'oWWWWWWWWWwo.',
      '.oWWWWWWWwo..',
      '..oWWWWWWo...',
      '..oWoWWoWo...',
      '...o.oo.o....'
    ], gx, gy, { o: '#9283b1', W: WHITE, w: LILAC });
    box(g, gx + 3, gy + 4, 2, 1, INK); box(g, gx + 8, gy + 4, 2, 1, INK);
    box(g, gx + 6, gy + 5, 1, 1, '#bc8ca9');
    if (lift > 5) {
      box(g, gx + 7, gy + 11, 1, 1, LILAC);
      box(g, gx + 9, gy + 14, 1, 1, '#9988b9');
    }
    g.globalAlpha = 0.62 * fade;
  }
  function nap(g, x, y, w, h, b) {
    var bob = Math.floor(b.p / 30) % 2;
    stamp(g, ['zzz', '..z', '.z.', 'z..', 'zzz'], x - 4, y + 7 - bob, { z: '#98b9ec' });
    if (b.p > 38 && b.p < 112) {
      stamp(g, ['zz', '.z', 'z.', 'zz'], x - 8, y + 1 - bob, { z: '#7894c9' });
    }
    // A tiny rice bowl appears beside the hem during the latter half of the nap.
    if (b.p > 70) {
      var bx = Math.round(x - 4), by = Math.round(y + h * 0.72);
      stamp(g, ['..ww..', '.wwww.', 'bbbbbb', '.bbbb.', '..bb..'], bx, by,
        { w: '#f2f0df', b: '#77a9c6' });
      box(g, bx + 1, by + 2, 4, 1, '#d0e3e8');
    }
  }
  function daydream(g, x, y, w, h, b, idea, direction) {
    var faceX = Math.round(x + w * (direction === 'right' ? 0.79 : direction === 'left' ? 0.21 : 0.53)), faceY = Math.round(y + h * 0.44);
    // Two blue pixels of drool, close to the mouth rather than the outfit.
    if (!idea) {
      if (direction !== 'back') {
        box(g, faceX, faceY, 1, 2, '#77cde6');
        box(g, faceX, faceY + 2, 2, 1, '#b3e9ee');
      }
      stamp(g, ['qqq', '..q', '.q.', '...', '.q.'], x - 1, y + 3, { q: '#a6d3eb' });
    } else {
      stamp(g, ['.yyy.', 'yyyyy', 'ywwwy', '.yyy.', '..y..', '.ooo.'], x - 3, y + 1,
        { y: '#ecd18c', w: '#fff4cc', o: '#8f8197' });
      if (b.p > 10 && b.p < 35) {
        box(g, x - 5, y + 3, 1, 1, '#f6e2a9'); box(g, x + 3, y, 1, 1, '#f6e2a9');
      }
    }
  }
  function mischief(g, x, y, w, h, b) {
    var ey = Math.round(y + h * 0.31);
    box(g, x + w * 0.56, ey - 1, 2, 1, '#78606a');
    box(g, x + w * 0.61, ey, 1, 1, '#78606a');
    stamp(g, ['...yy', '..yy.', '.yyyy', '..yy.', '.yy..', 'yy...'], x - 3, y + 6,
      { y: b.p % 24 < 12 ? '#e5adcf' : '#baa1d5' });
  }
  function colors(g, x, y, w, h, b) {
    var palette = ['#91ccec', '#ac9feb', '#e2a3cf'];
    var step = Math.floor(b.p / 24) % 3;
    spark(g, Math.round(x - 1), Math.round(y + 8), palette[step], false);
    spark(g, Math.round(x - 5), Math.round(y + 18), palette[(step + 1) % 3], true);
    if (b.p > 20 && b.p < 70) {
      spark(g, Math.round(x + 3), Math.round(y + 1), palette[(step + 2) % 3], true);
    }
  }
  function notes(g, x, y, w, h, b) {
    crescent(g, Math.round(x - 4), Math.round(y + 4));
    var nx = Math.round(x - 4), ny = Math.round(y + h * 0.63);
    stamp(g, [
      'obbbbbb', 'obwwwwb', 'obwwwwb', 'obwwwwb', 'obwwwwb', 'obwwwwb', 'obbbbbb'
    ], nx, ny, { o: '#6c6e99', b: '#969bc5', w: '#e6e3ed' });
    box(g, nx + 3, ny + 2, 2, 1, '#aaa0bd');
    if (b.p >= 28) box(g, nx + 3, ny + 4, 2, 1, '#aaa0bd');
  }
  function draw(ctx, actor, x, y, w, h, tick, reduced) {
    if (reduced || !ctx || !actor) return false;
    var b = beat(actor, tick);
    if (!b) return false;
    x = Math.round(x); y = Math.round(y);
    w = Math.max(1, Number(w) || 32); h = Math.max(1, Number(h) || 37);
    ctx.save();
    ctx.globalAlpha = 1;
    ctx.imageSmoothingEnabled = false;
    if (actor.id === 'claude') ghost(ctx, x, y, w, h, b);
    else if (actor.id === 'deepseek') nap(ctx, x, y, w, h, b);
    else if (actor.id === 'doubao') daydream(ctx, x, y, w, h, b, b.id === 'doubao-little-idea', actor.direction);
    else if (actor.id === 'grok') mischief(ctx, x, y, w, h, b);
    else if (actor.id === 'gemini') colors(ctx, x, y, w, h, b);
    else if (actor.id === 'kimi') notes(ctx, x, y, w, h, b);
    ctx.restore();
    return true;
  }
  function describe(actor, tick) {
    if (!actor || !AI[actor.id]) return null;
    if (actor.id === 'gpt' && moving(actor)) return 'gpt-slow-steps';
    var b = beat(actor, tick);
    return b ? b.id : null;
  }

  window.StudioPersonality = { pose: pose, draw: draw, describe: describe };
}());
