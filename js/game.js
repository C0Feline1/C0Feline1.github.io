/* 猫娘跑酷 · 归途的余温 MINI — a tiny GBA-style endless runner, all pixels drawn in code. */
(function () {
  var cv = document.getElementById('game');
  if (!cv) return;
  var g = cv.getContext('2d');
  var W = 240, H = 160, S = 2, GY = 134;
  cv.width = W * S; cv.height = H * S;
  g.imageSmoothingEnabled = false;
  var R = Math.random;
  var FONT_CN = '"DotGothic16", "Zpix", "Microsoft YaHei", monospace';

  var SPR = {}; PX.ORDER.forEach(function (id) { SPR[id] = PX.buildChar(id); });
  var P = PX.buildProps();
  var spikes = [];
  for (var si = 0; si < 6; si++) spikes.push(P.spike(10 + (si % 3) * 4, 14 + (si % 2) * 6 + (si > 3 ? 4 : 0), 7 + si * 13));

  /* ---------- biomes (parallax layers generated procedurally) ---------- */
  function layer(w, draw) { var c = PX.make(w, H), x = c.getContext('2d'); draw(x, w); return c; }
  function mountains(gx, w, base, amp, col, cap, seed, shade) {
    var r = PX.rng(seed), hm = [], y = base - amp * 0.5;
    var peaks = []; for (var k = 0; k <= w; k += 16 + Math.floor(r() * 24)) peaks.push([k, base - amp * (0.35 + r() * 0.65)]);
    peaks.push([w, peaks[0][1]]);
    for (var x = 0; x < w; x++) {
      for (var p = 0; p < peaks.length - 1 && peaks[p + 1][0] <= x; p++);
      var a = peaks[p], b = peaks[Math.min(p + 1, peaks.length - 1)], t = b[0] === a[0] ? 0 : (x - a[0]) / (b[0] - a[0]);
      hm[x] = Math.round(a[1] + (b[1] - a[1]) * t + (r() < 0.3 ? 1 : 0));
    }
    for (x = 0; x < w; x++) {
      var down = hm[(x + 1) % w] > hm[x];
      for (y = hm[x]; y < H; y++) {
        var c = col;
        if (cap && y < hm[x] + 5 + ((x * 7) % 4) && hm[x] < base - amp * 0.45) c = down ? cap[1] : cap[0];
        else if (shade && down && PX.dither(x, y) < 0.5) c = shade;
        gx.fillStyle = c; gx.fillRect(x, y, 1, 1);
      }
    }
  }
  var BIOMES = [
    {
      key: 'park', name: '现代 · 公园', en: 'MODERN PARK', at: 0,
      sky: PX.skyGradient(W, H, ['#1d1640', '#5a2f6e', '#c8577a', '#ffb07a']),
      far: layer(256, function (x, w) {
        var r = PX.rng(11), px = 0;
        while (px < w) {
          var bw = 12 + Math.floor(r() * 20), bh = 26 + Math.floor(r() * 46), top = GY - bh;
          x.fillStyle = '#2f2150'; x.fillRect(px, top, bw, bh + 30);
          x.fillStyle = '#3d2c66'; x.fillRect(px, top, 1, bh + 30);
          if (r() < 0.3) { x.fillStyle = '#2f2150'; x.fillRect(px + bw / 2 - 1, top - 6, 2, 6); x.fillStyle = '#ff4f7a'; x.fillRect(px + bw / 2 - 1, top - 7, 2, 1); }
          for (var wy = top + 3; wy < GY - 3; wy += 4) for (var wx = px + 2; wx < px + bw - 2; wx += 3) if (r() < 0.32) { x.fillStyle = r() < 0.8 ? '#ffd27a' : '#7fe0ff'; x.fillRect(wx, wy, 1, 2); }
          px += bw + Math.floor(r() * 3);
        }
      }),
      mid: layer(192, function (x, w) {
        var r = PX.rng(23);
        for (var t = 0; t < 4; t++) {
          var tx = 20 + t * 48 + Math.floor(r() * 12), th = 24 + Math.floor(r() * 12);
          x.fillStyle = '#2a1c2c'; x.fillRect(tx - 1, GY - th + 8, 3, th);
          var cy = GY - th;
          [[0, 0, 11], [-7, 5, 8], [7, 5, 8], [0, 8, 9]].forEach(function (b) {
            for (var yy = -b[2]; yy <= b[2]; yy++) for (var xx = -b[2]; xx <= b[2]; xx++) {
              if (xx * xx + yy * yy > b[2] * b[2]) continue;
              var lit = (xx + yy) < -b[2] * 0.3;
              x.fillStyle = lit ? (PX.dither(xx + 64, yy + 64) < 0.5 ? '#6b5a8a' : '#4f3f72') : '#3a2d5a';
              x.fillRect(tx + b[0] + xx, cy + b[1] + yy, 1, 1);
            }
          });
        }
        x.fillStyle = '#1e1530'; x.fillRect(150, GY - 36, 2, 36); x.fillRect(146, GY - 37, 8, 2);
        x.fillStyle = '#ffe9a8'; x.fillRect(147, GY - 35, 6, 2);
        x.fillStyle = 'rgba(255,220,150,.10)'; for (var k = 0; k < 14; k++) x.fillRect(146 - k, GY - 33 + k * 2, 8 + k * 2, 2);
      }),
      ground: { top: ['#7fd06a', '#4fa850'], dirt: '#4a2c3a', dirt2: '#5e3a48', speck: '#7a4e5e' },
      particle: 'petal', obstacles: ['cone', 'cone', 'box', 'crow']
    },
    {
      key: 'snow', name: '霜脊 · 雪原', en: 'FROST RIDGE', at: 450,
      sky: PX.skyGradient(W, H, ['#1a2a5a', '#3e5fa0', '#9cc0e8', '#e8f2ff']),
      far: layer(256, function (x, w) { mountains(x, w, GY - 10, 80, '#5a6fa8', ['#f4f8ff', '#c4d4f0'], 5, '#4a5c94'); }),
      mid: layer(160, function (x, w) {
        mountains(x, w, GY + 6, 24, '#8fa6d4', ['#ffffff', '#dbe6f8'], 9, '#7c93c4');
        var r = PX.rng(31);
        for (var t = 0; t < 5; t++) {
          var tx = 12 + t * 32 + Math.floor(r() * 10), th = 18 + Math.floor(r() * 14);
          for (var yy = 0; yy < th; yy++) {
            var half = Math.floor((yy % 7) * 0.7 + yy * 0.22) + 1;
            for (var xx = -half; xx <= half; xx++) {
              x.fillStyle = (yy % 7 === 0 || (yy % 7 === 1 && Math.abs(xx) < half)) ? '#f4f8ff' : (xx < 0 ? '#2c5a66' : '#1f4250');
              x.fillRect(tx + xx, GY - th + yy - 2, 1, 1);
            }
          }
          x.fillStyle = '#3a2a2a'; x.fillRect(tx, GY - 3, 1, 3);
        }
      }),
      ground: { top: ['#ffffff', '#d8e6fa'], dirt: '#5a6a96', dirt2: '#6d80b0', speck: '#9fb6e0' },
      particle: 'snow', obstacles: ['spike', 'spike', 'wolf', 'beetle', 'bat']
    },
    {
      key: 'peak', name: '冰封峰顶', en: 'FROZEN SUMMIT', at: 1200,
      sky: (function () {
        var c = PX.skyGradient(W, H, ['#070a1f', '#141a40', '#2a2560', '#4a3a7a']), x = c.getContext('2d'), r = PX.rng(77);
        for (var i = 0; i < 70; i++) { x.fillStyle = r() < 0.8 ? '#ffffff' : '#ffd45e'; x.fillRect(Math.floor(r() * W), Math.floor(r() * 90), 1, 1); }
        x.fillStyle = '#fff6d8'; for (var yy = -6; yy <= 6; yy++) for (var xx = -6; xx <= 6; xx++) if (xx * xx + yy * yy <= 36) x.fillRect(196 + xx, 26 + yy, 1, 1);
        x.fillStyle = '#e8dcb0'; x.fillRect(193, 24, 2, 2); x.fillRect(198, 29, 2, 1);
        return c;
      })(),
      aurora: true,
      far: layer(256, function (x, w) { mountains(x, w, GY - 4, 100, '#2a3366', ['#cfd9ff', '#8e9ad8'], 41, '#222a58'); }),
      mid: layer(128, function (x, w) {
        mountains(x, w, GY + 4, 30, '#3c4a86', ['#e6eeff', '#a9b8ec'], 51, '#334077');
        var r = PX.rng(61);
        for (var t = 0; t < 3; t++) {
          var tx = 20 + t * 42 + Math.floor(r() * 8), th = 20 + Math.floor(r() * 18);
          for (var yy = 0; yy < th; yy++) {
            var half = Math.max(1, Math.floor(4 - Math.abs(yy - th * 0.6) / th * 6));
            for (var xx = -half; xx <= half; xx++) { x.fillStyle = xx < 0 ? '#bfefff' : (xx === 0 ? '#7fd3ff' : '#4a8fd0'); x.fillRect(tx + xx, GY - th + yy, 1, 1); }
          }
        }
      }),
      ground: { top: ['#e6eeff', '#a9b8ec'], dirt: '#262c5a', dirt2: '#323a72', speck: '#7fd3ff' },
      particle: 'snow', obstacles: ['spike', 'spike', 'wolf', 'beetle', 'bat', 'wolf']
    }
  ];
  BIOMES.forEach(function (b) {
    var gc = PX.make(32, H - GY), x = gc.getContext('2d'), r = PX.rng(b.at + 3), gr = b.ground;
    x.fillStyle = gr.dirt; x.fillRect(0, 0, 32, H - GY);
    for (var yy = 4; yy < H - GY; yy++) for (var xx = 0; xx < 32; xx++) if (PX.dither(xx, yy) < (yy - 4) / 40) { x.fillStyle = gr.dirt2; x.fillRect(xx, yy, 1, 1); }
    for (var i = 0; i < 14; i++) { x.fillStyle = gr.speck; x.fillRect(Math.floor(r() * 32), 5 + Math.floor(r() * 20), 2, 1); }
    x.fillStyle = gr.top[1]; x.fillRect(0, 0, 32, 4);
    x.fillStyle = gr.top[0]; x.fillRect(0, 0, 32, 2);
    for (xx = 0; xx < 32; xx += 3) { x.fillStyle = gr.top[(xx / 3) % 2]; x.fillRect(xx, 4, 2, 1 + Math.floor(r() * 2)); }
    x.fillStyle = 'rgba(255,255,255,.6)'; for (xx = 1; xx < 32; xx += 7) x.fillRect(xx, 0, 2, 1);
    b.groundTile = gc;
  });

  /* ---------- audio ---------- */
  var AC = null, muted = localStorage.getItem('runner-muted') === '1';
  function beep(f, d, type, vol, slide) {
    if (muted) return;
    try {
      AC = AC || new (window.AudioContext || window.webkitAudioContext)();
      var o = AC.createOscillator(), v = AC.createGain(), t = AC.currentTime;
      o.type = type || 'square'; o.frequency.setValueAtTime(f, t);
      if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + d);
      v.gain.setValueAtTime(vol || 0.05, t); v.gain.exponentialRampToValueAtTime(0.0001, t + d);
      o.connect(v); v.connect(AC.destination); o.start(t); o.stop(t + d);
    } catch (e) { }
  }
  var SFX = {
    jump: function () { beep(420, 0.12, 'square', 0.04, 760); },
    jump2: function () { beep(620, 0.12, 'square', 0.04, 1100); },
    shard: function () { beep(988, 0.06, 'square', 0.04); setTimeout(function () { beep(1319, 0.1, 'square', 0.04); }, 60); },
    hit: function () { beep(220, 0.3, 'sawtooth', 0.06, 60); },
    shield: function () { beep(880, 0.2, 'triangle', 0.07, 300); },
    rift: function () { beep(200, 0.6, 'triangle', 0.06, 1200); },
    select: function () { beep(660, 0.05, 'square', 0.03); }
  };

  /* ---------- state ---------- */
  var best = +(localStorage.getItem('runner-best') || 0);
  var st = { mode: 'title', sel: 0, t: 0 };
  var game;
  function newGame() {
    var id = PX.ORDER[st.sel];
    game = {
      id: id, x: 58, y: GY, vy: 0, onGround: true, jumps: 0, holdT: 0, coyote: 0, buffer: 0, gliding: false,
      shield: id === 'X0' ? 1 : 0, shieldAt: 0, inv: 0, dist: 0, shards: 0, speed: 1.7, scroll: 0,
      obs: [], items: [], parts: [], gap: 140, hist: [], biome: 0, prevBiome: -1, blend: 1, flash: 0, banner: null,
      shake: 0, dieT: 0, frame: 0, nextMilestone: 100, combo: 0
    };
    for (var i = 0; i < 60; i++) game.hist.push(GY);
    showBanner(BIOMES[0].name, BIOMES[0].en);
    st.mode = 'play';
  }
  function showBanner(cn, en) { if (game) game.banner = { cn: cn, en: en, t: 0 }; }
  function emit(dash) { window.dispatchEvent(new CustomEvent('runner', { detail: dash })); }

  /* ---------- input ---------- */
  var holding = false, pressed = false;
  function press() { pressed = true; holding = true; }
  function release() { holding = false; }
  function onAction(px, py) {
    if (st.mode === 'title') {
      if (py !== undefined && py > 52 && py < 128) {
        var slot = Math.floor((px - 30) / 60);
        if (slot >= 0 && slot < 3) { if (slot !== st.sel) { st.sel = slot; SFX.select(); return; } }
      }
      newGame(); return;
    }
    if (st.mode === 'over') { if (st.t > 30) newGame(); return; }
    if (st.mode === 'paused') { st.mode = 'play'; return; }
    press();
  }
  function canvasPos(e) {
    var r = cv.getBoundingClientRect(), p = e.touches ? e.touches[0] : e;
    return [(p.clientX - r.left) / r.width * W, (p.clientY - r.top) / r.height * H];
  }
  cv.addEventListener('pointerdown', function (e) { e.preventDefault(); cv.focus(); var p = canvasPos(e); onAction(p[0], p[1]); });
  window.addEventListener('pointerup', release);
  window.addEventListener('pointercancel', release);
  function bButton() {
    if (st.mode === 'title') { st.sel = (st.sel + 1) % 3; SFX.select(); }
    else if (st.mode === 'play' || st.mode === 'paused') st.mode = st.mode === 'play' ? 'paused' : 'play';
    else if (st.mode === 'over') { st.mode = 'title'; st.t = 0; }
  }
  function dpad(dir) {
    if (dir === 'up') { onAction(); return; }
    if (st.mode === 'title' && (dir === 'left' || dir === 'right')) { st.sel = (st.sel + (dir === 'left' ? 2 : 1)) % 3; SFX.select(); }
    else if (st.mode === 'over' && dir === 'down') { st.mode = 'title'; st.t = 0; }
  }
  cv.addEventListener('keydown', function (e) {
    var k = e.key;
    if (k === ' ' || k === 'ArrowUp' || k === 'w' || k === 'Enter' || k === 'z') {
      e.preventDefault(); if (!e.repeat) onAction();
    } else if (k === 'ArrowLeft' || k === 'ArrowRight' || k === 'ArrowDown') {
      e.preventDefault(); dpad(k === 'ArrowLeft' ? 'left' : k === 'ArrowRight' ? 'right' : 'down');
    } else if (st.mode === 'title' && '123'.indexOf(k) >= 0) { st.sel = +k - 1; SFX.select(); }
    else if (k === 'Escape') { st.mode = 'title'; st.t = 0; }
    else if (k === 'x' || k === 'p') bButton();
    else if (k === 'm') toggleMute();
  });
  cv.addEventListener('keyup', function (e) { if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w' || e.key === 'Enter' || e.key === 'z') release(); });
  document.addEventListener('visibilitychange', function () { if (document.hidden && st.mode === 'play') st.mode = 'paused'; });
  function toggleMute() {
    muted = !muted; localStorage.setItem('runner-muted', muted ? '1' : '0');
    var b = document.getElementById('muteBtn'); if (b) b.textContent = muted ? '♪ OFF' : '♪ ON';
  }
  var mb = document.getElementById('muteBtn');
  if (mb) { mb.textContent = muted ? '♪ OFF' : '♪ ON'; mb.addEventListener('click', toggleMute); }

  /* ---------- spawning ---------- */
  function spawn() {
    var b = BIOMES[game.biome], list = b.obstacles, type = list[Math.floor(R() * list.length)], o;
    var x = W + 12;
    if (type === 'cone') o = { type: type, img: P.cone, x: x, y: GY, w: 8, h: 8, hb: [1, 1, 1, 0] };
    else if (type === 'box') o = { type: type, img: P.box, x: x, y: GY, w: 16, h: 13, hb: [1, 2, 1, 0] };
    else if (type === 'spike') { var sp = spikes[Math.floor(R() * spikes.length)]; o = { type: type, img: sp, x: x, y: GY, w: sp.width, h: sp.height, hb: [2, 4, 2, 0] }; }
    else if (type === 'wolf') o = { type: type, anim: P.wolf, x: x, y: GY, w: 18, h: 11, vx: 0.9, hb: [2, 3, 3, 0] };
    else if (type === 'beetle') o = { type: type, anim: P.beetle, x: x, y: GY, w: 14, h: 9, vx: 0.25, hb: [1, 1, 1, 0] };
    else { var fy = GY - 32 - Math.floor(R() * 12); o = { type: type, anim: type === 'crow' ? P.crow : P.bat, x: x, y: fy, w: 10, h: 5, vx: 0.5, fly: true, base: fy, hb: [0, 0, 0, 0] }; }
    game.obs.push(o);
    if (!o.fly && R() < 0.22 && game.dist > 120) {
      var o2 = Object.assign({}, o, { x: x + o.w + 4 + Math.floor(R() * 6) });
      if (o.type === 'spike') { o2.img = spikes[Math.floor(R() * spikes.length)]; o2.w = o2.img.width; o2.h = o2.img.height; }
      game.obs.push(o2);
    }
    if (R() < 0.45) {
      var n = 3 + Math.floor(R() * 3), arc = o.fly ? 0 : 1;
      for (var i = 0; i < n; i++) {
        var t = n === 1 ? 0.5 : i / (n - 1);
        game.items.push({ x: x - 12 + i * 11, y: arc ? GY - 30 - Math.sin(t * Math.PI) * 22 : GY - 14, ph: R() * 6 });
      }
    }
    game.gap = 70 + R() * 110 + game.speed * 26;
  }
  function particle(x, y, vx, vy, life, col, size, grav) { game.parts.push({ x: x, y: y, vx: vx, vy: vy, life: life, max: life, col: col, s: size || 1, gr: grav === undefined ? 0.08 : grav }); }
  function burst(x, y, n, cols, spd) { for (var i = 0; i < n; i++) { var a = R() * Math.PI * 2, s = (spd || 1.6) * (0.3 + R()); particle(x, y, Math.cos(a) * s, Math.sin(a) * s - 0.6, 20 + R() * 20, cols[i % cols.length], R() < 0.3 ? 2 : 1); } }

  /* ---------- update ---------- */
  function hit(o) {
    var px = game.x + 3, py = game.y - 20, pw = 10, ph = 19;
    var ox = o.x + o.hb[0], oy = o.y - o.h + o.hb[1], ow = o.w - o.hb[0] - o.hb[2], oh = o.h - o.hb[1] - o.hb[3];
    return px < ox + ow && px + pw > ox && py < oy + oh && py + ph > oy;
  }
  function update() {
    st.t++;
    if (st.mode !== 'play' && st.mode !== 'dying') { pressed = false; return; }
    var G = game; G.frame++;
    if (st.mode === 'dying') {
      G.dieT++; G.vy += 0.25; G.y += G.vy; if (G.y > GY) { G.y = GY; G.vy = -G.vy * 0.3; }
      G.speed *= 0.94; G.scroll += G.speed;
      updateParts();
      if (G.dieT > 60) { st.mode = 'over'; st.t = 0; }
      return;
    }
    var id = G.id;
    G.speed = 1.7 + Math.min(2.4, G.dist / 380);
    G.scroll += G.speed; G.dist += G.speed / 8;

    if (pressed) G.buffer = 7;
    if (G.onGround) { G.coyote = 6; G.jumps = 0; } else if (G.coyote > 0) G.coyote--;
    if (G.buffer > 0) {
      if (G.coyote > 0 && G.jumps === 0) {
        G.vy = -4.9; G.onGround = false; G.coyote = 0; G.jumps = 1; G.holdT = 12; G.buffer = 0; SFX.jump();
        for (var d = 0; d < 6; d++) particle(G.x + 6 + R() * 6, GY, -R() * 1.2, -R() * 0.8, 14, BIOMES[G.biome].ground.top[0]);
      } else if (pressed && id === 'Feline1' && G.jumps === 1 && !G.onGround) {
        G.vy = -4.3; G.jumps = 2; G.holdT = 8; G.buffer = 0; SFX.jump2();
        burst(G.x + 8, G.y - 4, 10, ['#ff6fa6', '#ffffff', '#ffd45e'], 1.2);
      }
    }
    if (G.buffer > 0) G.buffer--;
    pressed = false;
    var grav = 0.3;
    if (holding && G.vy < 0 && G.holdT > 0) { grav = 0.14; G.holdT--; } else if (!holding) G.holdT = 0;
    G.vy += grav;
    G.gliding = id === 'C0' && holding && G.vy > 0.6 && !G.onGround;
    if (G.gliding) { G.vy = 0.6; if (G.frame % 3 === 0) particle(G.x + 2, G.y - 8, -1, 0.2, 14, '#4fe3ff', 1, 0); }
    G.y += G.vy;
    if (G.y >= GY) {
      if (!G.onGround && G.vy > 2) for (d = 0; d < 5; d++) particle(G.x + 4 + R() * 8, GY, (R() - 0.5) * 2, -R(), 12, BIOMES[G.biome].ground.top[1]);
      G.y = GY; G.vy = 0; G.onGround = true;
    } else G.onGround = false;
    G.hist.unshift(G.y); G.hist.length = 80;

    var nb = G.biome;
    for (var bi = BIOMES.length - 1; bi >= 0; bi--) if (G.dist >= BIOMES[bi].at) { nb = bi; break; }
    if (nb !== G.biome) {
      G.prevBiome = G.biome; G.biome = nb; G.blend = 0; G.flash = 1; SFX.rift();
      showBanner(BIOMES[nb].name, BIOMES[nb].en);
      emit({ type: 'biome', id: id, name: BIOMES[nb].name });
      if (id === 'X0' && !G.shield) G.shield = 1;
    }
    if (G.blend < 1) G.blend = Math.min(1, G.blend + 1 / 90);
    if (G.flash > 0) G.flash = Math.max(0, G.flash - 0.03);
    if (G.dist >= G.nextMilestone) { emit({ type: 'milestone', id: id, dist: G.nextMilestone }); G.nextMilestone += 100; }
    if (id === 'X0' && !G.shield && G.dist - G.shieldAt > 250) { G.shield = 1; SFX.shield(); }
    if (G.inv > 0) G.inv--;
    if (G.banner) { G.banner.t++; if (G.banner.t > 170) G.banner = null; }
    if (G.shake > 0) G.shake *= 0.85;

    G.gap -= G.speed;
    if (G.gap <= 0) spawn();
    for (var i = G.obs.length - 1; i >= 0; i--) {
      var o = G.obs[i];
      o.x -= G.speed + (o.vx || 0);
      if (o.fly) o.y = o.base + Math.sin((G.frame + o.x) * 0.08) * 3;
      if (o.x < -30) { G.obs.splice(i, 1); continue; }
      if (G.inv <= 0 && hit(o)) {
        if (G.shield) {
          G.shield = 0; G.shieldAt = G.dist; G.inv = 70; G.shake = 4; SFX.shield();
          burst(o.x + o.w / 2, o.y - o.h / 2, 18, ['#b48cff', '#ffffff', '#7fd3ff'], 2);
          G.obs.splice(i, 1); continue;
        }
        die(); return;
      }
    }
    for (i = G.items.length - 1; i >= 0; i--) {
      var it = G.items[i]; it.x -= G.speed;
      if (it.x < -10) { G.items.splice(i, 1); continue; }
      var cx = it.x + 4, cy = it.y + Math.sin(G.frame * 0.1 + it.ph) * 2;
      if (Math.abs(cx - (G.x + 8)) < 10 && cy > G.y - 26 && cy < G.y + 2) {
        G.shards++; G.items.splice(i, 1); SFX.shard();
        burst(cx, cy, 8, ['#ffd45e', '#ff4fa3', '#ffffff'], 1.1);
      }
    }
    var b = BIOMES[G.biome];
    if (b.particle === 'snow' && R() < 0.5) particle(R() * W * 1.3, -2, -0.4 - R() * 0.6, 0.3 + R() * 0.5, 400, R() < 0.5 ? '#ffffff' : '#cfe0ff', 1, 0);
    if (b.particle === 'petal' && R() < 0.12) particle(W + 2, R() * 100, -0.8 - R(), 0.2 + R() * 0.3, 400, R() < 0.5 ? '#ffb3cf' : '#ffd6e6', 1, 0);
    if (G.frame % 4 === 0 && G.onGround) particle(G.x + 4, GY - 1, -G.speed * 0.4, -0.3, 10, 'rgba(255,255,255,.5)', 1, 0.02);
    updateParts();
  }
  function updateParts() {
    var ps = game.parts;
    for (var i = ps.length - 1; i >= 0; i--) {
      var p = ps[i]; p.x += p.vx; p.y += p.vy; p.vy += p.gr; p.life--;
      if (p.life <= 0 || p.y > H + 4 || p.x < -6) ps.splice(i, 1);
    }
    if (ps.length > 400) ps.splice(0, ps.length - 400);
  }
  function score() { return Math.floor(game.dist) + game.shards * 25; }
  function die() {
    var G = game; st.mode = 'dying'; G.dieT = 0; G.vy = -3.5; G.shake = 7; SFX.hit();
    burst(G.x + 8, G.y - 10, 22, ['#ffffff', '#ff4f7a', '#7fd3ff'], 2.2);
    var sc = score(), isBest = sc > best;
    if (isBest) { best = sc; localStorage.setItem('runner-best', best); }
    G.isBest = isBest;
    emit({ type: 'over', id: G.id, score: sc, dist: Math.floor(G.dist), shards: G.shards, best: best, isBest: isBest, where: BIOMES[G.biome].name });
  }

  /* ---------- draw ---------- */
  function drawLayer(img, off, y) {
    var w = img.width, o = -Math.floor(off % w);
    for (var x = o; x < W; x += w) g.drawImage(img, x, y || 0);
  }
  function drawBiome(b, scroll, alpha) {
    g.globalAlpha = alpha;
    g.drawImage(b.sky, 0, 0);
    if (b.aurora) {
      for (var x = 0; x < W; x += 2) {
        var y = 30 + Math.sin(x * 0.04 + st.t * 0.02) * 10 + Math.sin(x * 0.11 + st.t * 0.013) * 4;
        for (var k = 0; k < 18; k++) {
          if (PX.dither(x, k) > (1 - k / 18) * 0.7) continue;
          g.fillStyle = k < 6 ? 'rgba(120,255,200,.35)' : 'rgba(180,120,255,.22)';
          g.fillRect(x, y + k, 2, 1);
        }
      }
    }
    drawLayer(b.far, scroll * 0.15);
    drawLayer(b.mid, scroll * 0.45);
    drawLayer(b.groundTile, scroll, GY);
    g.globalAlpha = 1;
  }
  function drawChar(id, x, y, frame, airborne, tint) {
    var s = SPR[id], img;
    if (airborne) img = s.jump;
    else img = s.run[Math.floor(frame / 5) % 4];
    var bob = !airborne && (Math.floor(frame / 5) % 2) ? -1 : 0;
    g.fillStyle = 'rgba(20,10,40,.35)';
    var sh = Math.max(4, 12 - (GY - y) / 6);
    g.fillRect(Math.round(x + 8 - sh / 2), GY - 1, Math.round(sh), 2);
    g.drawImage(tint || img, Math.round(x), Math.round(y - 24 + bob));
  }
  function drawCN(text, x, y, size, color, align, shadow) {
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
    g.font = size * S + 'px ' + FONT_CN; g.textAlign = align || 'left'; g.textBaseline = 'top';
    if (shadow) { g.fillStyle = shadow; g.fillText(text, x * S + 2, y * S + 2); }
    g.fillStyle = color; g.fillText(text, x * S, y * S); g.restore();
  }
  function box(x, y, w, h, fill, border) {
    g.fillStyle = border || '#ff4fa3'; g.fillRect(x, y, w, h);
    g.fillStyle = fill || '#120d24'; g.fillRect(x + 1, y + 1, w - 2, h - 2);
    g.fillStyle = 'rgba(255,255,255,.12)'; g.fillRect(x + 2, y + 2, w - 4, 1);
  }

  function drawTitle() {
    var t = st.t;
    drawBiome(BIOMES[1], t * 0.6, 1);
    for (var i = 0; i < 3; i++) { var sx = (i * 97 + t * 0.3) % (W + 20) - 10, sy = (i * 53 + t * 0.4) % H; g.fillStyle = '#fff'; g.fillRect(W - sx, sy, 1, 1); }
    g.fillStyle = 'rgba(10,6,30,.45)'; g.fillRect(0, 0, W, H);
    drawCN('猫娘跑酷', W / 2, 10, 15, '#ffffff', 'center', '#ff4fa3');
    PX.text(g, 'KITTY RUNNER  MINI', W / 2 - PX.textWidth('KITTY RUNNER  MINI') / 2, 30, '#ffd45e', '#3a1a40');
    PX.text(g, 'BEST ' + best, W - PX.textWidth('BEST ' + best) - 6, 4, '#7fe0ff', '#000');
    PX.ORDER.forEach(function (id, i) {
      var cx = 30 + i * 60, sel = i === st.sel, d = PX.CHARS[id];
      box(cx + 4, 46, 52, 76, sel ? '#2a1648' : '#140d26', sel ? d.color : '#4a3a6a');
      var s = SPR[id], img = sel ? s.run[Math.floor(t / 6) % 4] : ((t + i * 40) % 160 < 8 ? s.blink : s.stand);
      g.save(); g.translate(cx + 14, 54 + (sel ? Math.round(Math.sin(t * 0.2)) : 0)); g.scale(2, 2); g.drawImage(img, 0, 0); g.restore();
      PX.text(g, d.label, cx + 30 - PX.textWidth(d.label) / 2, 106, sel ? '#ffffff' : '#9a8cc0', '#000');
      PX.text(g, String(i + 1), cx + 8, 50, sel ? d.color : '#6a5a8a');
      if (sel) {
        var ay = 40 + (Math.floor(t / 15) % 2);
        g.fillStyle = d.color; g.fillRect(cx + 28, ay, 5, 1); g.fillRect(cx + 29, ay + 1, 3, 1); g.fillRect(cx + 30, ay + 2, 1, 1);
      }
    });
    var d = PX.CHARS[PX.ORDER[st.sel]];
    drawCN(d.cn + ' · 特技：' + d.perk, W / 2, 125, 7, '#ffffff', 'center', '#000');
    var hint = Math.floor(t / 120) % 2 ? '< > OR B: CHOOSE   A: START' : 'CLICK / SPACE TO START';
    if (Math.floor(t / 30) % 4 !== 3) PX.text(g, hint, W / 2 - PX.textWidth(hint) / 2, 148, '#ffd45e', '#3a1a40');
  }

  function drawPlay() {
    var G = game, b = BIOMES[G.biome];
    g.save();
    if (G.shake > 0.3) g.translate(Math.round((R() - 0.5) * G.shake), Math.round((R() - 0.5) * G.shake));
    if (G.blend < 1 && G.prevBiome >= 0) { drawBiome(BIOMES[G.prevBiome], G.scroll, 1); drawBiome(b, G.scroll, G.blend); }
    else drawBiome(b, G.scroll, 1);

    G.items.forEach(function (it) {
      var y = it.y + Math.sin(G.frame * 0.1 + it.ph) * 2;
      g.fillStyle = 'rgba(255,212,94,.18)'; g.fillRect(Math.round(it.x) - 1, Math.round(y) - 1, 11, 11);
      g.drawImage(P.shard[Math.floor((G.frame + it.ph * 10) / 6) % 4], Math.round(it.x), Math.round(y));
    });
    G.obs.forEach(function (o) {
      var img = o.img || o.anim[Math.floor(G.frame / (o.fly ? 8 : 6)) % 2];
      if (!o.fly) { g.fillStyle = 'rgba(20,10,40,.3)'; g.fillRect(Math.round(o.x) + 1, GY - 1, o.w - 2, 2); }
      g.drawImage(img, Math.round(o.x), Math.round(o.y - o.h));
    });

    var dl = Math.round(20 / G.speed), dl2 = Math.round(38 / G.speed), others = PX.ORDER.filter(function (x) { return x !== G.id; });
    if (st.mode === 'play') {
      [[others[1], 38, dl2], [others[0], 20, dl]].forEach(function (c) {
        var y = G.hist[c[2]] || GY;
        drawChar(c[0], G.x - c[1], y, G.frame + c[1], y < GY - 0.5);
      });
    } else {
      others.forEach(function (oid, k) {
        var s = SPR[oid]; g.drawImage(s.stand, Math.round(G.x - 20 - k * 18), GY - 24);
        if (G.dieT > 10) PX.text(g, '!', G.x - 14 - k * 18, GY - 32 - (G.dieT % 20 < 10 ? 1 : 0), '#ffd45e', '#000');
      });
    }
    var blinkInv = G.inv > 0 && Math.floor(G.inv / 3) % 2;
    if (st.mode === 'dying') {
      g.save(); g.translate(Math.round(G.x + 8), Math.round(G.y - 12)); g.rotate(Math.min(1.4, G.dieT * 0.08)); g.drawImage(SPR[G.id].hurt, -8, -12); g.restore();
    } else if (!blinkInv) {
      drawChar(G.id, G.x, G.y, G.frame, !G.onGround);
      if (G.gliding) {
        var px = Math.round(G.x), py = Math.round(G.y - 32), sp = G.frame % 6 < 3;
        g.fillStyle = '#4fe3ff'; g.fillRect(px + 2, py, 12, 1);
        g.fillStyle = '#1c1824'; g.fillRect(px + 7, py + 1, 2, 3);
        g.fillStyle = '#ffffff'; g.fillRect(sp ? px + 3 : px + 9, py, 3, 1);
      }
    }
    if (G.shield && st.mode === 'play') {
      var r = 15 + Math.sin(G.frame * 0.15);
      for (var a = 0; a < 24; a++) {
        if ((a + (G.frame >> 2)) % 3 === 0) continue;
        var an = a / 24 * Math.PI * 2;
        g.fillStyle = a % 2 ? '#b48cff' : '#e6dcff';
        g.fillRect(Math.round(G.x + 8 + Math.cos(an) * r), Math.round(G.y - 11 + Math.sin(an) * r), 1, 1);
      }
    }
    G.parts.forEach(function (p) {
      g.globalAlpha = Math.min(1, p.life / p.max * 2); g.fillStyle = p.col; g.fillRect(Math.round(p.x), Math.round(p.y), p.s, p.s);
    });
    g.globalAlpha = 1;
    g.restore();

    if (G.flash > 0) {
      g.fillStyle = 'rgba(255,255,255,' + Math.min(1, G.flash * 1.4) + ')'; g.fillRect(0, 0, W, H);
      for (var k = 0; k < 6; k++) { g.fillStyle = 'rgba(180,140,255,' + G.flash + ')'; g.fillRect(0, 20 + k * 22 + Math.sin(st.t * 0.3 + k) * 6, W, 2); }
    }
    PX.text(g, String(score()).padStart(5, '0'), 6, 6, '#ffffff', '#1a0f30', 2);
    PX.text(g, 'HI ' + String(best).padStart(5, '0'), 6, 19, '#ffd45e', '#1a0f30');
    g.drawImage(P.shard[0], W - 44, 5);
    PX.text(g, 'X' + G.shards, W - 32, 7, '#ffffff', '#1a0f30');
    PX.text(g, Math.floor(G.dist) + 'M', W - 6 - PX.textWidth(Math.floor(G.dist) + 'M'), 17, '#7fe0ff', '#1a0f30');
    var d = PX.CHARS[G.id];
    PX.text(g, d.perkEn, 6, 28, d.color, '#1a0f30');
    if (G.banner) {
      var bt = G.banner.t, sl = bt < 20 ? (20 - bt) * 6 : (bt > 150 ? (bt - 150) * 6 : 0);
      box(W / 2 - 56, 42 - sl, 112, 26, 'rgba(18,13,36,.9)');
      drawCN(G.banner.cn, W / 2, 45 - sl, 9, '#ffffff', 'center');
      PX.text(g, G.banner.en, W / 2 - PX.textWidth(G.banner.en) / 2, 60 - sl, '#ff9fc4');
    }
    if (st.mode === 'paused') {
      g.fillStyle = 'rgba(10,6,30,.6)'; g.fillRect(0, 0, W, H);
      PX.text(g, 'PAUSE', W / 2 - PX.textWidth('PAUSE', 3) / 2, 62, '#ffffff', '#ff4fa3', 3);
      PX.text(g, 'A / B: CONTINUE', W / 2 - PX.textWidth('A / B: CONTINUE') / 2, 86, '#ffd45e', '#000');
    }
  }
  function drawOver() {
    drawPlay();
    var G = game, t = st.t, y = Math.max(30, 90 - t * 4);
    g.fillStyle = 'rgba(10,6,30,.55)'; g.fillRect(0, 0, W, H);
    box(36, y, 168, 94, 'rgba(18,13,36,.95)');
    PX.text(g, 'GAME OVER', W / 2 - PX.textWidth('GAME OVER', 2) / 2, y + 8, '#ff4fa3', '#000', 2);
    var lines = ['倒在了「' + BIOMES[G.biome].name + '」', '不过三个人还在一起。'];
    drawCN(lines[0], W / 2, y + 24, 7, '#ffffff', 'center');
    drawCN(lines[1], W / 2, y + 34, 7, '#c8b8ff', 'center');
    PX.text(g, 'SCORE ' + score(), 52, y + 50, '#ffffff', '#000');
    PX.text(g, 'BEST  ' + best, 52, y + 60, '#ffd45e', '#000');
    PX.text(g, Math.floor(G.dist) + 'M  *' + G.shards, 188 - PX.textWidth(Math.floor(G.dist) + 'M  *' + G.shards), y + 50, '#7fe0ff', '#000');
    if (G.isBest && t % 30 < 20) PX.text(g, 'NEW RECORD!', 188 - PX.textWidth('NEW RECORD!'), y + 60, '#ff6fa6', '#000');
    if (t > 30 && t % 40 < 28) PX.text(g, 'A: RETRY    B: CHANGE CHARACTER', W / 2 - PX.textWidth('A: RETRY    B: CHANGE CHARACTER') / 2, y + 80, '#ffffff', '#000');
  }

  var acc = 0, last = performance.now();
  function frame(now) {
    acc += Math.min(100, now - last); last = now;
    while (acc >= 1000 / 60) { update(); acc -= 1000 / 60; }
    g.setTransform(S, 0, 0, S, 0, 0); g.imageSmoothingEnabled = false;
    if (st.mode === 'title') drawTitle();
    else if (st.mode === 'over') drawOver();
    else drawPlay();
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  window.KittyRunner = { action: function () { onAction(); }, release: release, b: bButton, dpad: dpad, state: st, best: function () { return best; } };
})();
