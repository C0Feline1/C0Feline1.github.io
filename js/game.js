/* KITTY RUNNER — a tiny GBA-style endless runner, all pixels drawn in code. */
(function () {
  var cv = document.getElementById('game');
  if (!cv) return;
  var dctx = cv.getContext('2d');
  var W = 240, H = 160, S = 2, GY = 134;
  cv.width = W * S; cv.height = H * S;
  /* everything is drawn at 240x160 into buf, then blitted at an integer scale (crisp, even pixels) */
  var buf = document.createElement('canvas'); buf.width = W; buf.height = H;
  var g = buf.getContext('2d', { willReadFrequently: true });
  g.imageSmoothingEnabled = false;
  (function () {
    var fr = g.fillRect.bind(g);
    g.fillRect = function (x, y, w, h) { var x0 = Math.round(x), y0 = Math.round(y); fr(x0, y0, Math.round(x + w) - x0, Math.round(y + h) - y0); };
  })();
  var TQ = [];
  function roundRects(c) { var fr = c.fillRect.bind(c); c.fillRect = function (x, y, w, h) { var x0 = Math.round(x), y0 = Math.round(y); fr(x0, y0, Math.round(x + w) - x0, Math.round(y + h) - y0); }; return c; }
  var cvW = 0; /* canvas CSS width, cached by a ResizeObserver: reading clientWidth every frame forces a layout */
  if (window.ResizeObserver) new ResizeObserver(function () { cvW = cv.clientWidth; }).observe(cv);
  function fit() {
    var dpr = window.devicePixelRatio || 1, want = (cvW || cv.clientWidth || W * 2) * dpr;
    var s = Math.max(1, Math.min(10, Math.ceil(want / W - 0.01)));
    if (s !== S || cv.width !== W * s) { S = s; cv.width = W * S; cv.height = H * S; }
    var ir = Math.abs(W * S - want) < 1 ? 'pixelated' : 'auto';
    if (cv.style.imageRendering !== ir) cv.style.imageRendering = ir;
  }
  var R = Math.random;
  var FONT_CN = '"DotGothic16", "Zpix", "Microsoft YaHei", monospace';

  var SPR = {}; PX.ORDER.forEach(function (id) { SPR[id] = PX.buildChar(id); });
  var P = PX.buildProps();
  var spikes = [];
  for (var si = 0; si < 6; si++) spikes.push(P.spike(10 + (si % 3) * 4, 14 + (si % 2) * 6 + (si > 3 ? 4 : 0), 7 + si * 13));

  /* ---------- biomes (parallax layers generated procedurally) ---------- */
  function oasisPalm(x, px, base, h, trunk, leaf) {
    for (var k = 0; k < h; k++) { x.fillStyle = k % 3 ? trunk : '#3a2418'; x.fillRect(px + Math.round(Math.sin(k / h * 1.6) * 4), base - k, 2, 1); }
    var tx = px + Math.round(Math.sin(1.6) * 4), ty = base - h;
    [[-10, 3], [-7, -2], [7, -2], [10, 3], [0, -5], [-4, 5], [4, 5]].forEach(function (l) { for (var k2 = 0; k2 < 10; k2++) { x.fillStyle = leaf; x.fillRect(tx + Math.round(l[0] * k2 / 9), ty + Math.round(l[1] * k2 / 9 + k2 * k2 * 0.06), 2, 1); } });
    x.fillStyle = '#8a5a2a'; x.fillRect(tx - 1, ty + 1, 2, 2); x.fillRect(tx + 2, ty + 2, 2, 2);
  }
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

  /* ---------- more worlds (story order of 归途的余温) ---------- */
  function stars(x, n, seed, maxY) { var r = PX.rng(seed); for (var i = 0; i < n; i++) { x.fillStyle = r() < 0.8 ? '#ffffff' : '#ffd45e'; x.fillRect(Math.floor(r() * W), Math.floor(r() * maxY), 1, 1); } }
  function withSky(stops, extra) { var c = PX.skyGradient(W, H, stops); if (extra) extra(c.getContext('2d')); return c; }
  function disc(x, cx, cy, r, col, test) { x.fillStyle = col; for (var yy = -r; yy <= r; yy++) for (var xx = -r; xx <= r; xx++) if (xx * xx + yy * yy <= r * r && (!test || test(xx, yy))) x.fillRect(cx + xx, cy + yy, 1, 1); }
  function pines(x, w, seed, n, base, minH, varH, cols) {
    var r = PX.rng(seed);
    for (var t = 0; t < n; t++) {
      var tx = Math.floor((t + 0.5) * w / n + (r() - 0.5) * 10), th = minH + Math.floor(r() * varH);
      for (var yy = 0; yy < th; yy++) {
        var half = Math.floor((yy % 7) * 0.7 + yy * 0.22) + 1;
        for (var xx = -half; xx <= half; xx++) {
          x.fillStyle = (yy % 7 === 0 || (yy % 7 === 1 && Math.abs(xx) < half)) ? cols[0] : (xx < 0 ? cols[1] : cols[2]);
          x.fillRect((tx + xx + w) % w, base - th + yy, 1, 1);
        }
      }
      x.fillStyle = cols[3]; x.fillRect(tx, base, 1, 3);
    }
  }
  function cabin(x, cx, base, w, h) {
    var left = cx - (w >> 1), top = base - h;
    x.fillStyle = '#5a2e22'; x.fillRect(left, top, w, h);
    x.fillStyle = '#43201a'; for (var yy = top + 2; yy < base; yy += 3) x.fillRect(left, yy, w, 1);
    x.fillStyle = '#3a2a2a'; x.fillRect(left + w - 9, top - 14, 4, 10);
    for (var k = 0; k < 12; k++) { x.fillStyle = k < 2 ? '#ffffff' : (k < 4 ? '#e8e0f4' : '#3a2036'); x.fillRect(left - 3 + k, top - k, w + 6 - k * 2, 1); }
    x.fillStyle = 'rgba(255,200,96,.25)'; x.fillRect(left + 4, top + 4, 12, 10);
    x.fillStyle = '#ffc860'; x.fillRect(left + 6, top + 6, 8, 6);
    x.fillStyle = '#43201a'; x.fillRect(left + 9, top + 6, 1, 6); x.fillRect(left + 6, top + 8, 8, 1);
    x.fillStyle = '#2a140e'; x.fillRect(left + w - 12, base - 11, 7, 11);
    x.fillStyle = '#ffc860'; x.fillRect(left + w - 7, base - 6, 1, 1);
  }
  function vflip(src) { var c = PX.make(src.width, src.height), x = c.getContext('2d'); x.translate(0, src.height); x.scale(1, -1); x.drawImage(src, 0, 0); return c; }
  var rocks = [];
  for (var ri = 0; ri < 4; ri++) rocks.push(P.spike(10 + (ri % 2) * 6, 12 + ri * 3, 91 + ri * 7, ['#0e0a14', '#9a8ab4', '#7a6a98', '#4a3e5e']));
  var icicles = spikes.map(vflip);

  var HOME = {
    key: 'home', name: '现代 · 公寓街区', en: 'HOME STREET', len: 220, seed: 101, line: '那是她们的公寓！', rift: true,
    sky: withSky(['#0b0a24', '#1e1846', '#3e2766', '#6e3a72'], function (x) {
      stars(x, 40, 9, 70);
      disc(x, 40, 26, 7, '#fff3c8', function (xx, yy) { return (xx + 3) * (xx + 3) + (yy + 2) * (yy + 2) > 30; });
    }),
    far: layer(256, function (x, w) {
      var r = PX.rng(202), px = 0;
      while (px < w) {
        var bw = 14 + Math.floor(r() * 22), bh = 40 + Math.floor(r() * 60), top = GY - 10 - bh;
        x.fillStyle = '#1c1636'; x.fillRect(px, top, bw, H - top);
        for (var wy = top + 3; wy < GY - 12; wy += 4) for (var wx = px + 2; wx < px + bw - 2; wx += 3) if (r() < 0.22) { x.fillStyle = r() < 0.7 ? '#6a5a9a' : '#ffd27a'; x.fillRect(wx, wy, 1, 1); }
        if (r() < 0.35) { x.fillStyle = '#ff4f7a'; x.fillRect(px + (bw >> 1), top - 3, 1, 3); }
        px += bw + 1 + Math.floor(r() * 4);
      }
    }),
    mid: layer(220, function (x, w) {
      function bld(bx, bw, floors, col, col2, seed, special) {
        var r = PX.rng(seed), top = GY - floors * 18 - 6;
        x.fillStyle = col; x.fillRect(bx, top, bw, GY - top);
        x.fillStyle = col2; x.fillRect(bx, top, bw, 2); x.fillRect(bx, top, 1, GY - top);
        for (var f = 0; f < floors; f++) for (var c = 0; c < Math.floor((bw - 4) / 14); c++) {
          var wx = bx + 5 + c * 14, wy = top + 6 + f * 18, lit = r() < 0.55;
          x.fillStyle = '#120c20'; x.fillRect(wx - 1, wy - 1, 10, 10);
          if (special && f === 1 && c === 1) {
            x.fillStyle = '#ff9fc4'; x.fillRect(wx, wy, 8, 8);
            x.fillStyle = '#3a1a40'; x.fillRect(wx, wy + 5, 2, 3); x.fillRect(wx, wy + 4, 1, 1); x.fillRect(wx + 1, wy + 4, 1, 1);
            x.fillRect(wx + 3, wy + 5, 2, 3); x.fillStyle = '#4fe3ff'; x.fillRect(wx + 3, wy + 4, 2, 1);
            x.fillStyle = '#3a1a40'; x.fillRect(wx + 6, wy + 5, 2, 3); x.fillStyle = '#ff4f7a'; x.fillRect(wx + 7, wy + 4, 1, 1);
          } else {
            x.fillStyle = lit ? (r() < 0.5 ? '#ffd27a' : '#ffb07a') : '#2a2448'; x.fillRect(wx, wy, 8, 8);
            if (lit) { x.fillStyle = 'rgba(255,255,255,.35)'; x.fillRect(wx, wy, 8, 1); }
          }
          x.fillStyle = col2; x.fillRect(wx - 2, wy + 7, 12, 1);
          for (var k = 0; k < 12; k += 3) x.fillRect(wx - 2 + k, wy + 7, 1, 3);
        }
      }
      bld(4, 62, 3, '#2e2448', '#463a6a', 3, true);
      bld(72, 46, 2, '#34284e', '#4c3e70', 5);
      x.fillStyle = '#241c36'; x.fillRect(150, GY - 26, 48, 26);
      x.fillStyle = '#4fe3ff'; x.fillRect(150, GY - 30, 48, 5);
      PX.text(x, '24H', 166, GY - 29, '#0b0a24');
      x.fillStyle = 'rgba(255,255,220,.85)'; x.fillRect(154, GY - 20, 18, 14); x.fillRect(176, GY - 20, 16, 20);
      x.fillStyle = '#c02a4a'; x.fillRect(200, GY - 13, 7, 13); x.fillStyle = '#ffe0e8'; x.fillRect(201, GY - 12, 5, 4);
      [128, 212].forEach(function (lx) {
        x.fillStyle = '#14101e'; x.fillRect(lx, GY - 34, 2, 34); x.fillRect(lx - 4, GY - 35, 8, 2);
        x.fillStyle = '#ffe9a8'; x.fillRect(lx - 3, GY - 33, 6, 1);
        x.fillStyle = 'rgba(255,220,150,.08)'; for (var k = 0; k < 15; k++) x.fillRect(lx - 3 - k, GY - 32 + k * 2, 6 + k * 2, 2);
      });
    }),
    ground: { top: ['#a8a4c8', '#78749a'], dirt: '#2a2638', dirt2: '#322e44', speck: '#4a4660' },
    particle: null, obstacles: ['cone', 'box', 'crow', 'cone', 'box']
  };

  var CABIN = {
    key: 'cabin', name: '守山屋', en: 'MOUNTAIN LODGE', len: 260, seed: 303, line: '好暖和～歇一会儿', warm: true,
    sky: withSky(['#1c1840', '#3e3270', '#a0607a', '#f0a070']),
    far: layer(256, function (x, w) { mountains(x, w, GY - 16, 70, '#4a3e78', ['#f8e8f0', '#c8a8c8'], 13, '#3e3468'); }),
    mid: layer(200, function (x, w) {
      pines(x, w, 41, 4, GY - 2, 16, 14, ['#f8f0ff', '#2c4a5a', '#1f3644', '#3a2a2a']);
      cabin(x, 70, GY, 40, 24); cabin(x, 160, GY, 30, 18);
      [112, 196].forEach(function (lx) { x.fillStyle = '#2a1a1a'; x.fillRect(lx, GY - 14, 1, 14); x.fillStyle = '#ffc860'; x.fillRect(lx - 1, GY - 17, 3, 3); x.fillStyle = 'rgba(255,200,96,.2)'; x.fillRect(lx - 4, GY - 20, 9, 9); });
    }),
    anim: function (b, scroll) {
      var off = (scroll * 0.45) % 200;
      for (var k = 0; k < 3; k++) [[70 + 11, 24], [160 + 6, 18]].forEach(function (c) {
        var cx = c[0] - off + k * 200 - 200, cy = GY - c[1] - 15;
        for (var p = 0; p < 5; p++) {
          var ph = ((st.t * 0.4 + p * 12) % 60) / 60;
          g.fillStyle = 'rgba(230,220,240,' + (0.5 * (1 - ph)) + ')';
          var s = 1 + Math.floor(ph * 3);
          g.fillRect(Math.round(cx + Math.sin(ph * 6 + p) * 2 - ph * 10), Math.round(cy - ph * 26), s, s);
        }
      });
    },
    ground: { top: ['#ffffff', '#e0d8f0'], dirt: '#5a4a6a', dirt2: '#6a5878', speck: '#c49a6a' },
    particle: 'snowlight', obstacles: ['box', 'spike', 'wolf', 'box', 'spike']
  };

  var RIDGE = {
    key: 'ridge', name: '风雪山脊', en: 'STORM RIDGE', len: 300, seed: 404, line: '风好大！小心断崖', fog: true,
    sky: withSky(['#232c48', '#3c4866', '#6e7c98', '#aab4c6']),
    far: layer(256, function (x, w) { mountains(x, w, GY - 6, 95, '#4a5672', ['#dfe6f2', '#9aa6bc'], 17, '#3e4964'); }),
    mid: layer(180, function (x, w) {
      mountains(x, w, GY + 8, 34, '#2e3850', ['#e8eef8', '#a8b4c8'], 23, '#262f44');
      var fc = ['#ff4f7a', '#ffd45e', '#4fe3ff', '#5dff8f', '#b48cff'];
      for (var k = 0; k < 3; k++) {
        var px = 20 + k * 60;
        x.fillStyle = '#2a1e22'; x.fillRect(px, GY - 26, 2, 26);
        for (var f = 0; f < 10; f++) { var fx = px + 2 + f * 4, fy = GY - 25 + Math.floor(f * f * 0.12); x.fillStyle = '#7a6a6a'; x.fillRect(fx, fy, 4, 1); x.fillStyle = fc[f % 5]; x.fillRect(fx + 1, fy + 1, 2, 3); }
      }
    }),
    ground: { top: ['#eef3fa', '#aeb9cc'], dirt: '#30384e', dirt2: '#3a4460', speck: '#6a7896' },
    particle: 'blizzard', obstacles: ['pit', 'spike', 'pit', 'wolf', 'beetle', 'bat', 'spike']
  };

  var CAVE = {
    key: 'cave', name: '岩洞营火', en: 'EMBER CAVE', len: 300, seed: 505, line: '至少我们三个还在一起。', dark: true,
    sky: (function () {
      var c = PX.skyGradient(W, H, ['#07050c', '#120c1a', '#1c1426', '#241a30']), x = c.getContext('2d'), r = PX.rng(55);
      for (var i = 0; i < 260; i++) { x.fillStyle = r() < 0.5 ? '#2a2036' : '#0e0a14'; x.fillRect(Math.floor(r() * W), Math.floor(r() * H), 2 + Math.floor(r() * 3), 1); }
      return c;
    })(),
    far: layer(200, function (x, w) {
      var r = PX.rng(66);
      for (var k = 0; k < 9; k++) {
        var cx = Math.floor(r() * w), hgt = 20 + Math.floor(r() * 40), half = 3 + Math.floor(r() * 5);
        for (var yy = 0; yy < hgt; yy++) { var hw = Math.round(half * yy / hgt); x.fillStyle = '#1a1424'; x.fillRect(cx - hw, GY - hgt + yy, hw * 2 + 1, 1); }
      }
    }),
    mid: layer(160, function (x, w) {
      for (var yy = -40; yy <= 10; yy++) for (var xx = -50; xx <= 50; xx++) {
        var d = Math.sqrt(xx * xx + yy * yy * 2) / 50;
        if (d < 1 && PX.dither(xx + 80, yy + 80) > d) { x.fillStyle = d < 0.5 ? '#4a2a2a' : '#30202a'; x.fillRect(80 + xx, GY - 6 + yy, 1, 1); }
      }
      x.fillStyle = '#4a4458'; [[70, 0], [74, -1], [86, -1], [90, 0], [78, -2], [82, -2]].forEach(function (s) { x.fillRect(s[0], GY - 3 + s[1], 3, 3); });
      x.fillStyle = '#5a3020'; x.fillRect(73, GY - 4, 16, 2); x.fillStyle = '#7a4a2a'; x.fillRect(75, GY - 5, 12, 1);
      x.fillStyle = '#3a3048'; x.fillRect(50, GY - 8, 10, 8); x.fillRect(104, GY - 6, 12, 6);
      x.fillStyle = '#ff6fa6'; x.fillRect(106, GY - 9, 7, 3);
      [[20, '#4fe3ff'], [140, '#b48cff']].forEach(function (c) {
        for (var k = 0; k < 4; k++) { var h = 4 + k * 2; x.fillStyle = k % 2 ? c[1] : '#e8fbff'; x.fillRect(c[0] + k * 3 - 6, GY - h, 2, h); }
      });
    }),
    ceil: (function () {
      var c = PX.make(200, 40), x = c.getContext('2d'), r = PX.rng(77);
      x.fillStyle = '#0a0710'; x.fillRect(0, 0, 200, 6);
      for (var k = 0; k < 14; k++) {
        var cx = Math.floor(r() * 200), hgt = 8 + Math.floor(r() * 30), half = 2 + Math.floor(r() * 4);
        for (var yy = 0; yy < hgt; yy++) { var hw = Math.round(half * (1 - yy / hgt)); x.fillStyle = yy > hgt - 3 ? '#3a2e48' : '#120c1a'; x.fillRect(cx - hw, 5 + yy, hw * 2 + 1, 1); }
      }
      return c;
    })(),
    anim: function (b, scroll) {
      var off = (scroll * 0.45) % 160; b.lights = [];
      for (var k = -1; k < 3; k++) {
        var fx = Math.round(81 - off + k * 160), fy = GY - 5;
        if (fx < -20 || fx > W + 20) continue;
        b.lights.push([fx, fy, 62]);
        for (var yy = 0; yy < 11; yy++) {
          var wob = Math.sin(st.t * 0.3 + yy * 0.9) * (yy / 6), hw = Math.max(0, Math.round((11 - yy) * 0.45 + Math.sin(st.t * 0.5 + yy) * 0.6));
          g.fillStyle = '#ff4f2a'; g.fillRect(Math.round(fx - hw + wob), fy - yy, hw * 2 + 1, 1);
          if (hw > 1) { g.fillStyle = '#ffb84f'; g.fillRect(Math.round(fx - hw + 1 + wob), fy - yy, hw * 2 - 1, 1); }
          if (hw > 2 && yy < 6) { g.fillStyle = '#fff2a8'; g.fillRect(Math.round(fx - 1 + wob), fy - yy, 3, 1); }
        }
      }
    },
    ground: { top: ['#5a4a6e', '#3e3252'], dirt: '#140f1c', dirt2: '#1c1626', speck: '#2e2440' },
    particle: 'ember', obstacles: ['bat', 'rock', 'beetle', 'bat', 'rock']
  };

  var LAKE = {
    key: 'lake', name: '归途 · 冰湖', en: 'FROZEN LAKE', len: 260, seed: 707, line: '有鱼！',
    sky: withSky(['#2a2a5e', '#5e5096', '#d890a8', '#ffd8a0'], function (x) {
      disc(x, 176, GY - 34, 13, '#ffe8b0'); disc(x, 176, GY - 34, 10, '#fff6d8');
      stars(x, 14, 31, 40);
    }),
    far: layer(256, function (x, w) { mountains(x, w, GY - 26, 40, '#7a6aa8', ['#ffe0e8', '#d8b0c8'], 29, '#6e5e9a'); }),
    mid: layer(200, function (x, w) {
      var r = PX.rng(88);
      for (var yy = GY - 24; yy < GY; yy++) for (var xx = 0; xx < w; xx++) {
        var tt = (yy - (GY - 24)) / 24; x.fillStyle = PX.dither(xx, yy) < tt ? '#9ac8e8' : '#c8e6f8'; x.fillRect(xx, yy, 1, 1);
      }
      x.fillStyle = '#e8f8ff'; x.fillRect(0, GY - 25, w, 1);
      for (var i = 0; i < 18; i++) { x.fillStyle = r() < 0.5 ? '#ffffff' : '#ffe8d0'; x.fillRect(Math.floor(r() * w), GY - 22 + Math.floor(r() * 20), 2 + Math.floor(r() * 5), 1); }
      x.fillStyle = '#8a2a3a'; x.fillRect(110, GY - 30, 20, 13);
      for (var k = 0; k < 7; k++) { x.fillStyle = k < 2 ? '#ffffff' : '#4a1a2a'; x.fillRect(108 + k, GY - 30 - 7 + k, 24 - k * 2, 1); }
      x.fillStyle = '#ffc860'; x.fillRect(114, GY - 26, 4, 4);
      x.fillStyle = '#1e2a4a'; x.fillRect(150, GY - 12, 8, 3);
      x.fillStyle = '#3a2a2a'; for (var s = 0; s < 14; s++) x.fillRect(146 + s, GY - 12 - Math.floor(s * 1.2), 1, 1);
      x.fillStyle = '#ffffff'; for (s = 0; s < 8; s++) x.fillRect(159, GY - 28 + s * 2, 1, 1);
    }),
    anim: function (b, scroll) {
      var off = (scroll * 0.45) % 200, ph = (st.t % 150) / 30;
      if (ph > 1) return;
      for (var k = 0; k < 3; k++) {
        var fx = Math.round(154 - off + k * 200 - 200 + ph * 10), fy = Math.round(GY - 12 - Math.sin(ph * Math.PI) * 14);
        g.fillStyle = '#ff9f4f'; g.fillRect(fx, fy, 4, 2); g.fillRect(fx - 1, fy - 1, 1, 1); g.fillRect(fx - 1, fy + 2, 1, 1);
        g.fillStyle = '#1a1030'; g.fillRect(fx + 3, fy, 1, 1);
      }
    },
    ground: { top: ['#f0faff', '#b0dcf2'], dirt: '#3a5a7a', dirt2: '#46688a', speck: '#cfefff' },
    particle: 'sparkle', obstacles: ['beetle', 'spike', 'crow', 'box', 'spike']
  };


  /* ---------- the four "折光层" worlds, each with its own way to move ---------- */
  var CY = 24;
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function tileFrom(w, h, fn) { var c = PX.make(w, h), x = c.getContext('2d'); fn(x, w, h); return c; }
  function cloudPuff(x, cx, cy, r, cols) { disc(x, cx, cy + 1, r, cols[2]); disc(x, cx, cy, r, cols[1]); disc(x, cx - 1, cy - 1, Math.max(1, r - 2), cols[0]); }
  function fillCircle(cx, cy, r, col) { g.fillStyle = col; for (var yy = -r; yy <= r; yy++) { var hw = Math.floor(Math.sqrt(r * r - yy * yy)); g.fillRect(cx - hw, cy + yy, hw * 2 + 1, 1); } }
  function makeGear(r, teeth, holes, cols, nf) {
    var frames = [], size = 2 * r + 7, c0 = size / 2;
    for (var f = 0; f < nf; f++) {
      var ph = f / nf * (2 * Math.PI / holes), c = PX.make(size, size), x = c.getContext('2d');
      for (var yy = 0; yy < size; yy++) for (var xx = 0; xx < size; xx++) {
        var dx = xx + 0.5 - c0, dy = yy + 0.5 - c0, d = Math.sqrt(dx * dx + dy * dy), a = Math.atan2(dy, dx) - ph, col = null;
        if (d <= r) {
          col = (dx + dy < -r * 0.3) ? cols[0] : (dx + dy > r * 0.5 ? cols[2] : cols[1]);
          if (d > r * 0.38 && d < r * 0.72 && Math.cos(holes * a) > 0.35) col = null;
          if (d < r * 0.22 || d > r - 1.2) col = cols[3];
        } else if (d <= r + 2.5 && Math.cos(teeth * a) > 0.2) col = cols[1];
        if (col) { x.fillStyle = col; x.fillRect(xx, yy, 1, 1); }
      }
      frames.push(c);
    }
    return frames;
  }
  var gearBig = makeGear(22, 18, 6, ['#8a6038', '#6a4628', '#4a3018', '#2a1a10'], 8);
  var gearMid = makeGear(12, 12, 6, ['#9a7040', '#7a5430', '#5a3a1e', '#2a1a10'], 8);
  var gearHaz = makeGear(10, 12, 6, ['#ffe0a0', '#d8a050', '#9a6428', '#3a2414'], 8);
  var inkRocks = []; for (var ii = 0; ii < 4; ii++) inkRocks.push(P.spike(10 + (ii % 2) * 6, 12 + ii * 3, 131 + ii * 7, ['#141210', '#7a766c', '#4a4842', '#2a2724']));
  var inkCrow = P.crow.map(function (c) { return PX.tint(c, '#141210'); });
  var coral = []; for (ii = 0; ii < 4; ii++) coral.push(P.spike(12 + (ii % 2) * 4, 22 + ii * 4, 171 + ii * 5, ['#5a1a3a', '#ffc0d4', '#ff6f9a', '#d04a7a']));
  var stal = []; for (ii = 0; ii < 4; ii++) stal.push(vflip(P.spike(12 + (ii % 2) * 6, 18 + ii * 4, 191 + ii * 3, ['#06122a', '#3a6a9a', '#24507a', '#163a5e'])));
  var talisman = PX.fromRows(['oooooo', 'oyyyyo', 'oyrryo', 'oyyryo', 'oyrryo', 'oyyyyo', 'oyryyo', 'oyrryo', 'oyyyyo', 'oooooo'], { o: '#7a4a10', y: '#ffe08a', r: '#d02a2a' });
  var DRONE = { o: '#0a0418', m: '#5a4a8a', r: '#ff2a8a', c: '#4fe3ff' };
  var drone = [
    PX.fromRows(['cccc....cccc', '..o......o..', '..oooooooo..', '.ommmmmmmmo.', '.ommmrrmmmo.', '..oommmmoo..', '...o....o...'], DRONE),
    PX.fromRows(['.cc......cc.', '..o......o..', '..oooooooo..', '.ommmmmmmmo.', '.ommrrrrmmo.', '..oommmmoo..', '...o....o...'], DRONE)
  ];
  var JELLY = { o: '#a03a8a', p: 'rgba(255,140,220,.85)', P: '#ffd0f0', w: '#ffffff' };
  var jelly = [
    PX.fromRows(['....oooo....', '..oppppppo..', '.opPPppPPpo.', '.oppppppppo.', 'oppwppppwppo', 'oooooooooooo', '.p.p.pp.p.p.', '.p..p..p..p.', 'p..p.pp.p..p', '.p..p..p..p.', '..p.p..p.p..', '...p....p...'], JELLY),
    PX.fromRows(['............', '....oooo....', '..oppppppo..', '.opPPppPPpo.', 'oppwppppwppo', 'oooooooooooo', '..p.p..p.p..', '.p..p..p..p.', '..p.p..p.p..', '.p..p..p..p.', 'p..p....p..p', '............'], JELLY)
  ];
  var CRAB = { o: '#4a0a10', r: '#e8404a', w: '#ffffff' };
  var crab = [
    PX.fromRows(['.o..........o.', 'oro........oro', '.oo.oooooo.oo.', '..orrrrrrrro..', '.orrwrrrrwrro.', '.orrrrrrrrrro.', '..o.o.oo.o.o..', '.o..o....o..o.'], CRAB),
    PX.fromRows(['o............o', 'oro........oro', '.oo.oooooo.oo.', '..orrrrrrrro..', '.orrwrrrrwrro.', '.orrrrrrrrrro.', '..o.o.oo.o.o..', '..o.o....o.o..'], CRAB)
  ].map(PX.flip);
  function inkPine(x, bx, by) {
    x.fillStyle = '#1a1816'; for (var k = 0; k < 30; k++) x.fillRect(bx + Math.round(Math.sin(k * 0.15) * 4), by - k, 2, 1);
    [[0, -30, 12], [-8, -22, 9], [7, -18, 8]].forEach(function (p) {
      for (var yy = -2; yy <= 2; yy++) for (var xx = -p[2]; xx <= p[2]; xx++)
        if (xx * xx / (p[2] * p[2]) + yy * yy / 6 <= 1 && PX.dither(xx + 40, yy + 40) < 0.85) { x.fillStyle = yy < 0 ? '#2a2724' : '#141210'; x.fillRect(bx + p[0] + xx, by + p[1] + yy, 1, 1); }
    });
  }

  function pagoda(x, cx, by, tiers, sc) {
    /* small multi-roof pagoda; sc = [roof, wall, light] */
    var w = 5 + tiers * 2, y = by;
    for (var t = 0; t < tiers; t++) {
      var ww = w - t * 2;
      x.fillStyle = sc[1]; x.fillRect(cx - ww / 2 + 1, y - 4, ww - 2, 4);
      x.fillStyle = sc[2]; if (t % 2 === 0) x.fillRect(cx - 1, y - 3, 2, 2);
      x.fillStyle = sc[0]; x.fillRect(cx - ww / 2 - 2, y - 5, ww + 4, 1); x.fillRect(cx - ww / 2 - 3, y - 6, 2, 1); x.fillRect(cx + ww / 2 + 1, y - 6, 2, 1);
      y -= 6;
    }
    x.fillStyle = sc[0]; x.fillRect(cx, y - 4, 1, 4);
  }
  function peakAt(x, w, col) { /* first opaque row in a column */
    var d = x.getImageData(col, 0, 1, H).data; for (var yy = 0; yy < H; yy++) if (d[yy * 4 + 3] > 0) return yy; return H;
  }
  function xianIsle(x, cx, cy, hw, r, pine) {
    for (var yy = 0; yy < hw * 1.4; yy++) {
      var half = Math.round(hw * Math.pow(1 - yy / (hw * 1.4), 0.8)) + (r() < 0.3 ? 1 : 0);
      x.fillStyle = yy < 2 ? '#7ac27a' : (yy < 4 ? '#4e8e5e' : (PX.dither(cx, yy) < 0.5 ? '#6a6e8e' : '#5a5e7e')); x.fillRect(cx - half, cy + yy, half * 2, 1);
      if (yy > 3 && r() < 0.15) { x.fillStyle = '#8a8eae'; x.fillRect(cx - half + 1, cy + yy, 2, 1); }
    }
    if (pine) for (var k = 0; k < 3; k++) { var px = cx - hw + 3 + k * Math.max(3, Math.floor(hw / 1.5)); x.fillStyle = '#3a2a2a'; x.fillRect(px, cy - 5, 1, 5); x.fillStyle = '#2e5e4a'; x.fillRect(px - 3, cy - 6, 7, 2); x.fillRect(px - 2, cy - 8, 5, 2); x.fillStyle = '#4a8a64'; x.fillRect(px - 2, cy - 6, 3, 1); }
  }
  var XIAN = {
    key: 'xian', name: '云桥 · 修仙界', en: 'CLOUD BRIDGE · SWORD FLIGHT', len: 260, seed: 801, line: '御剑飞行！', rift: true, mode: 'fly', speedMul: 0.92, sub: 'sword',
    sky: withSky(['#24305e', '#5a5aa0', '#d88aa0', '#ffd0a0'], function (x) {
      disc(x, 176, 46, 16, 'rgba(255,230,180,.35)'); disc(x, 176, 46, 11, '#ffe6b0'); disc(x, 176, 46, 9, '#fff6dc');
      var r = PX.rng(805); x.fillStyle = 'rgba(255,255,255,.7)'; for (var k = 0; k < 26; k++) x.fillRect(Math.floor(r() * W), Math.floor(r() * 36), 1, 1);
      x.fillStyle = 'rgba(255,220,200,.45)'; [[20, 30, 60], [120, 22, 50], [60, 60, 90]].forEach(function (c) { x.fillRect(c[0], c[1], c[2], 1); x.fillRect(c[0] + 6, c[1] + 1, c[2] - 12, 1); });
    }),
    far: layer(320, function (x, w) {
      mountains(x, w, 120, 70, '#7c7cb8', ['#c8b8e0', '#a898cc'], 811, '#7070aa');
      var a = peakAt(x, w, 70), b2 = peakAt(x, w, 230);
      pagoda(x, 70, a + 1, 5, ['#3a2a4a', '#8a4a5a', '#ffd88a']); pagoda(x, 230, b2 + 1, 3, ['#3a2a4a', '#8a4a5a', '#ffd88a']);
      mountains(x, w, 132, 46, '#5a6a9e', null, 812, '#50608e');
    }),
    haze: (function () { var c = PX.make(W, H), x = c.getContext('2d');
      for (var yy = 0; yy < H; yy++) { var a = Math.max(0, 1 - Math.abs(yy - 104) / 22) * 0.42; if (a > 0.01) for (var xx = 0; xx < W; xx++) if (PX.dither(xx, yy) < a * 1.6) { x.fillStyle = 'rgba(255,230,235,.55)'; x.fillRect(xx, yy, 1, 1); } }
      return c; })(),
    mid: layer(300, function (x, w) {
      var r = PX.rng(822);
      xianIsle(x, 40, 58, 18, r, true); xianIsle(x, 150, 78, 12, r, true); xianIsle(x, 236, 46, 22, r, true);
      pagoda(x, 236, 41, 4, ['#2a1a3a', '#b03a3a', '#ffd45e']);
      x.fillStyle = 'rgba(255,255,255,.8)'; x.fillRect(250, 50, 1, 34); x.fillRect(251, 52, 1, 30); /* waterfall off the big isle */
      x.fillStyle = 'rgba(255,255,255,.35)'; x.fillRect(248, 84, 6, 2);
      var gx = 120; x.fillStyle = '#b03a3a'; x.fillRect(gx, 96, 2, 22); x.fillRect(gx + 18, 96, 2, 22);
      x.fillStyle = '#2a1a3a'; x.fillRect(gx - 4, 92, 28, 2); x.fillStyle = '#b03a3a'; x.fillRect(gx - 1, 98, 22, 2);
      for (var i = 0; i < 12; i++) cloudPuff(x, Math.floor(r() * w), 112 + Math.floor(r() * 18), 5 + Math.floor(r() * 7), ['#fff4f4', '#f0d8e4', '#c8b0cc']);
    }),
    anim: function (b, scroll) {
      /* foreground mist ribbons + drifting cloud sea */
      for (var k = 0; k < 3; k++) {
        var off = (scroll * (0.8 + k * 0.35)) % 200, yy = 70 + k * 18 + Math.round(Math.sin(st.t * 0.01 + k) * 3);
        g.fillStyle = 'rgba(255,240,245,' + (0.18 - k * 0.04) + ')';
        for (var wx = -off; wx < W; wx += 200) { g.fillRect(Math.round(wx), yy, 90, 2); g.fillRect(Math.round(wx) + 20, yy + 2, 50, 1); }
      }
      var off2 = (scroll * 1.25) % 170;
      for (var j = -1; j < 3; j++) { var cx = Math.round(40 - off2 + j * 170); g.fillStyle = 'rgba(255,255,255,.6)'; g.fillRect(cx, GY - 8, 46, 3); g.fillRect(cx + 8, GY - 10, 20, 2); }
    },
    tile: function (x) { x.fillStyle = '#e4d4e8'; x.fillRect(0, 0, 32, H - GY); for (var i = 0; i < 4; i++) disc(x, i * 9 + 4, 5, 5, '#fff6fa'); x.fillStyle = '#f0e4f0'; x.fillRect(0, 10, 32, 3); },
    ground: { top: ['#fff6fa', '#f0e0ee'], dirt: '#e4d4e8', dirt2: '#d0bcd8', speck: '#ffffff' },
    particle: 'gold'
  };

  var INK = {
    key: 'ink', name: '水墨 · 山水间', en: 'INK LANDSCAPE', len: 220, seed: 851, line: '走进画里了……', mode: 'run',
    sky: (function () {
      var c = PX.make(W, H), x = c.getContext('2d'), r = PX.rng(5);
      x.fillStyle = '#efe6d2'; x.fillRect(0, 0, W, H);
      for (var i = 0; i < 600; i++) { x.fillStyle = r() < 0.5 ? '#e6dcc4' : '#f6eedc'; x.fillRect(Math.floor(r() * W), Math.floor(r() * H), 1, 1); }
      disc(x, 186, 30, 9, '#d8402e');
      x.fillStyle = '#c0302a'; x.fillRect(20, 40, 12, 12); x.fillStyle = '#efe6d2'; x.fillRect(21, 41, 10, 10); x.fillStyle = '#c0302a'; x.fillRect(22, 42, 8, 8);
      PX.text(x, 'C0', 23, 44, '#efe6d2');
      x.fillStyle = '#2a2724'; for (var k = 0; k < 4; k++) x.fillRect(26, 10 + k * 7, 1 + (k % 2), 5);
      return c;
    })(),
    far: layer(256, function (x, w) {
      mountains(x, w, GY - 22, 92, '#a8a498', null, 61, '#96928a');
      for (var yy = GY - 56; yy < H; yy++) for (var xx = 0; xx < w; xx++) if (PX.dither(xx, yy) < (yy - (GY - 56)) / 40) { x.fillStyle = '#efe6d2'; x.fillRect(xx, yy, 1, 1); }
    }),
    mid: layer(200, function (x, w) {
      mountains(x, w, GY + 4, 42, '#4a4842', null, 67, '#34322e');
      for (var yy = GY - 22; yy < GY; yy++) for (var xx = 0; xx < w; xx++) if (PX.dither(xx + 1, yy) < (yy - (GY - 22)) / 26) { x.fillStyle = '#e6dcc4'; x.fillRect(xx, yy, 1, 1); }
      inkPine(x, 40, GY - 2); inkPine(x, 150, GY - 6);
      x.fillStyle = '#2a2724'; x.fillRect(96, GY - 14, 14, 2); x.fillRect(99, GY - 16, 8, 2); x.fillRect(102, GY - 24, 1, 8);
    }),
    tile: function (x) {
      x.fillStyle = '#efe6d2'; x.fillRect(0, 0, 32, H - GY); x.fillStyle = '#1a1816'; x.fillRect(0, 0, 32, 3);
      for (var i = 0; i < 32; i++) if (PX.dither(i, 3) < 0.6) x.fillRect(i, 3, 1, 1);
      x.fillStyle = '#8a867c'; for (i = 0; i < 32; i += 5) x.fillRect(i, 7 + (i % 3) * 3, 3, 1);
    },
    ground: { top: ['#1a1816', '#4a4842'], dirt: '#efe6d2', dirt2: '#e6dcc4', speck: '#8a867c' },
    particle: null, obstacles: ['inkrock', 'inkrock', 'inkcrow', 'inkrock', 'inkcrow']
  };

  var CYBER = {
    key: 'cyber', name: '雨城 · 不眠街', en: 'RAIN CITY · TAP TO FLIP', len: 260, seed: 901, line: '重力反过来了！', rift: true, mode: 'flip',
    sky: withSky(['#0a0418', '#1a0a36', '#3a0e4a', '#6a1450']),
    far: layer(256, function (x, w) {
      var r = PX.rng(911), px = 0;
      while (px < w) {
        var bw = 10 + Math.floor(r() * 18), bh = 60 + Math.floor(r() * 70), top = GY - bh;
        x.fillStyle = '#160a2a'; x.fillRect(px, top, bw, H - top);
        if (r() < 0.6) { x.fillStyle = r() < 0.5 ? '#ff2a8a' : '#2af0ff'; x.fillRect(px, top, bw, 1); }
        for (var wy = top + 3; wy < GY; wy += 3) for (var wx = px + 1; wx < px + bw - 1; wx += 2) if (r() < 0.18) { x.fillStyle = r() < 0.5 ? '#ff4fd8' : '#4fe3ff'; x.fillRect(wx, wy, 1, 1); }
        px += bw + Math.floor(r() * 3);
      }
    }),
    mid: layer(220, function (x, w) {
      function sign(sx, sy, txt, col) { var sw = PX.textWidth(txt) + 4; x.fillStyle = col; x.fillRect(sx, sy, sw, 9); x.fillStyle = '#05020c'; x.fillRect(sx + 1, sy + 1, sw - 2, 7); PX.text(x, txt, sx + 2, sy + 2, col); }
      x.fillStyle = '#0e0620'; x.fillRect(0, 72, 52, H); x.fillRect(82, 56, 44, H); x.fillRect(160, 84, 60, H);
      var r = PX.rng(921);
      [[0, 72, 52], [82, 56, 44], [160, 84, 60]].forEach(function (b) { for (var wy = b[1] + 14; wy < GY; wy += 5) for (var wx = b[0] + 3; wx < b[0] + b[2] - 3; wx += 4) if (r() < 0.3) { x.fillStyle = '#3a2a5a'; x.fillRect(wx, wy, 2, 2); } });
      sign(6, 80, 'NOISE', '#ff2a8a'); sign(86, 62, 'NO SIGNAL', '#4fe3ff'); sign(168, 92, 'RAMEN', '#ffd45e'); sign(190, 106, '24H', '#5dff8f');
      x.fillStyle = '#ff2a8a'; x.fillRect(130, 70, 2, 30); x.fillStyle = '#4fe3ff'; x.fillRect(135, 64, 2, 36);
    }),
    anim: function () {
      var cx = Math.round(W + 30 - (st.t * 1.4) % (W + 80));
      g.fillStyle = '#2a1a48'; g.fillRect(cx, 44, 16, 4); g.fillRect(cx + 3, 42, 8, 2);
      g.fillStyle = '#4fe3ff'; g.fillRect(cx, 48, 4, 1); g.fillStyle = '#ff2a8a'; g.fillRect(cx + 14, 45, 2, 1);
    },
    ceil: tileFrom(32, CY, function (x, w, h) {
      x.fillStyle = '#1a1030'; x.fillRect(0, 0, w, h); x.fillStyle = '#0a0418'; for (var i = 0; i < w; i += 16) x.fillRect(i, 0, 2, h - 5);
      x.fillStyle = '#2a1a48'; x.fillRect(0, h - 5, w, 3); x.fillStyle = '#ff2a8a'; x.fillRect(0, h - 1, w, 1);
      x.fillStyle = '#4fe3ff'; for (i = 0; i < w; i += 8) x.fillRect(i + 2, h - 4, 3, 1);
    }), ceilSpeed: 1,
    tile: function (x) {
      x.fillStyle = '#120a22'; x.fillRect(0, 0, 32, H - GY); x.fillStyle = '#4fe3ff'; x.fillRect(0, 0, 32, 1); x.fillStyle = '#2a1a48'; x.fillRect(0, 1, 32, 2);
      for (var i = 0; i < 6; i++) { x.fillStyle = i % 2 ? 'rgba(255,42,138,.5)' : 'rgba(79,227,255,.4)'; x.fillRect((i * 11) % 32, 6 + i * 3, 4 + (i % 3) * 3, 1); }
    },
    ground: { top: ['#4fe3ff', '#2a1a48'], dirt: '#120a22', dirt2: '#1a1030', speck: '#ff2a8a' },
    particle: 'rain'
  };

  var STEAM = {
    key: 'steam', name: '锅炉厅 · 第二次呼吸', en: 'BOILER HALL · HOLD JETPACK', len: 260, seed: 951, line: '喷射背包，点火！', rift: true, mode: 'jet',
    sky: withSky(['#2a1a10', '#5a3418', '#a0602a', '#e0a050']),
    far: layer(256, function (x, w) {
      var r = PX.rng(961);
      for (var i = 0; i < 6; i++) { var cx = 10 + i * 42 + Math.floor(r() * 10), ch = 50 + Math.floor(r() * 50); x.fillStyle = '#3a2216'; x.fillRect(cx, GY - ch, 8, ch); x.fillStyle = '#5a3420'; x.fillRect(cx - 1, GY - ch, 10, 3); x.fillStyle = '#ff8a3a'; x.fillRect(cx + 3, GY - ch + 10, 2, 2); }
      x.fillStyle = '#2e1a10'; x.fillRect(0, GY - 30, w, 30);
      for (i = 0; i < w; i += 12) if (r() < 0.6) { x.fillStyle = '#ffb060'; x.fillRect(i + 3, GY - 24, 4, 3); }
    }),
    mid: layer(200, function (x, w) {
      x.fillStyle = '#6a4a2a'; x.fillRect(0, 60, w, 5); x.fillStyle = '#c8904a'; x.fillRect(0, 60, w, 1); x.fillStyle = '#3a2414'; x.fillRect(0, 64, w, 1);
      for (var i = 0; i < w; i += 25) { x.fillStyle = '#c8904a'; x.fillRect(i, 58, 3, 9); }
      x.fillStyle = '#6a4a2a'; x.fillRect(39, 65, 3, 9); disc(x, 40, 80, 6, '#3a2414'); disc(x, 40, 80, 5, '#f0e0c0'); x.fillStyle = '#c03020'; x.fillRect(40, 77, 1, 4); x.fillRect(41, 77, 2, 1);
      x.fillStyle = '#7a5a30'; x.fillRect(120, 64, 6, GY - 64); x.fillStyle = '#c8904a'; x.fillRect(120, 64, 1, GY - 64);
      disc(x, 123, 96, 5, '#a02a1a'); x.fillStyle = '#3a1a10'; x.fillRect(118, 96, 11, 1); x.fillRect(123, 91, 1, 11);
    }),
    anim: function (b, scroll) {
      var off = (scroll * 0.45) % 200, f = Math.floor(st.t / 6) % 8;
      for (var k = -1; k < 2; k++) {
        g.drawImage(gearBig[f], Math.round(170 - off + k * 200 - 25), 78);
        g.drawImage(gearMid[(8 - f) % 8], Math.round(196 - off + k * 200 - 15), 62);
      }
    },
    ceil: tileFrom(32, 14, function (x, w, h) {
      x.fillStyle = '#2a1a10'; x.fillRect(0, 0, w, h); x.fillStyle = '#7a5428'; x.fillRect(0, h - 7, w, 5); x.fillStyle = '#c8904a'; x.fillRect(0, h - 7, w, 1);
      x.fillStyle = '#4a3018'; x.fillRect(0, h - 2, w, 2); x.fillStyle = '#a07038'; x.fillRect(12, h - 9, 6, 9);
    }), ceilSpeed: 1,
    tile: function (x) {
      x.fillStyle = '#5a3a1e'; x.fillRect(0, 0, 32, H - GY); x.fillStyle = '#c8904a'; x.fillRect(0, 0, 32, 2); x.fillStyle = '#8a5a2a'; x.fillRect(0, 2, 32, 2);
      x.fillStyle = '#3a2414'; x.fillRect(0, 4, 32, 1); x.fillRect(15, 4, 1, H - GY);
      x.fillStyle = '#e8b868'; [[3, 8], [27, 8], [3, 20], [27, 20]].forEach(function (p) { x.fillRect(p[0], p[1], 1, 1); });
    },
    ground: { top: ['#c8904a', '#8a5a2a'], dirt: '#5a3a1e', dirt2: '#4a3018', speck: '#e8b868' },
    particle: 'steam'
  };

  var SEA = {
    key: 'sea', name: '珊瑚遗迹 · 潮汐', en: 'CORAL RUINS · TAP TO SWIM', len: 240, seed: 981, line: '咕噜咕噜……', rift: true, mode: 'swim', speedMul: 0.85,
    sky: withSky(['#1a7ab0', '#0a4a7a', '#082a56', '#06163a'], function (x) {
      for (var xx = 0; xx < W; xx++) { var yy = 5 + Math.round(Math.sin(xx * 0.2) * 1.5); x.fillStyle = '#9ad8f8'; x.fillRect(xx, yy, 1, 1); x.fillStyle = 'rgba(200,240,255,.5)'; x.fillRect(xx, 0, 1, yy); }
    }),
    far: layer(256, function (x, w) {
      var r = PX.rng(991);
      x.fillStyle = '#0a2a4a'; for (var yy = 0; yy < 18; yy++) x.fillRect(150 + yy, GY - 30 + yy, 70 - yy * 2, 1);
      x.fillRect(180, GY - 64, 3, 36); x.fillRect(166, GY - 56, 22, 2);
      [[30, 50], [52, 34], [90, 44]].forEach(function (c) {
        x.fillStyle = '#0e3458'; x.fillRect(c[0], GY - c[1], 8, c[1]); x.fillStyle = '#14406a'; x.fillRect(c[0] - 2, GY - c[1], 12, 3);
        x.fillStyle = '#0a2a4a'; for (var k = 2; k < 8; k += 2) x.fillRect(c[0] + k, GY - c[1] + 4, 1, c[1] - 4);
      });
      for (var i = 0; i < 10; i++) { var cx = Math.floor(r() * w), ch = 8 + Math.floor(r() * 16); x.fillStyle = '#0c3050'; for (var k = 0; k < ch; k++) { x.fillRect(cx + Math.round(Math.sin(k * 0.5) * 2), GY - k, 2, 1); if (k % 5 === 3) x.fillRect(cx + 2, GY - k - 2, 4, 1); } }
    }),
    mid: layer(200, function (x, w) {
      var r = PX.rng(995), cols = ['#ff6f9a', '#ffb84f', '#b48cff', '#5dd8c0'];
      for (var i = 0; i < 8; i++) {
        var cx = Math.floor(r() * w), c = cols[i % 4], kind = i % 3;
        if (kind === 0) { disc(x, cx, GY - 3, 5, '#3a1a3a'); disc(x, cx, GY - 4, 4, c); x.fillStyle = 'rgba(255,255,255,.4)'; x.fillRect(cx - 2, GY - 6, 2, 1); }
        else if (kind === 1) { x.fillStyle = c; for (var k = 0; k < 12; k++) { x.fillRect(cx + Math.round(Math.sin(k) * k * 0.4), GY - k, 1, 1); x.fillRect(cx - Math.round(Math.sin(k) * k * 0.4), GY - k, 1, 1); } }
        else { x.fillStyle = c; for (var a = 0; a < 6; a++) x.fillRect(cx - 5 + a * 2, GY - 6 - (a % 2) * 2, 1, 6 + (a % 2) * 2); }
      }
      x.fillStyle = '#5a3a1a'; x.fillRect(100, GY - 8, 12, 8); x.fillStyle = '#ffd45e'; x.fillRect(100, GY - 8, 12, 2); x.fillRect(105, GY - 5, 2, 2);
    }),
    anim: function (b, scroll) {
      for (var k = 0; k < 4; k++) { var x0 = ((k * 70 - st.t * 0.2) % 300 + 300) % 300 - 40; g.fillStyle = 'rgba(160,220,255,.07)'; for (var yy = 0; yy < 110; yy += 2) g.fillRect(Math.round(x0 + yy * 0.35), yy, 14, 2); }
      var off = (scroll * 0.6) % 120;
      for (var kk = -1; kk < 3; kk++) {
        var bx = Math.round(30 - off + kk * 120);
        for (var s = 0; s < 22; s++) { var sw = Math.round(Math.sin(st.t * 0.03 + s * 0.35 + kk) * s * 0.25); g.fillStyle = s % 4 === 0 ? '#3a9a5a' : '#2a7a4a'; g.fillRect(bx + sw, GY - s * 2, 2, 2); if (s % 4 === 2) { g.fillStyle = '#4aba6a'; g.fillRect(bx + sw + 2, GY - s * 2, 2, 1); } }
      }
    },
    tile: function (x) {
      x.fillStyle = '#c8a870'; x.fillRect(0, 0, 32, H - GY); x.fillStyle = '#e8d098'; x.fillRect(0, 0, 32, 2);
      for (var i = 0; i < 32; i++) for (var yy = 3; yy < H - GY; yy++) if (PX.dither(i, yy) < 0.12) { x.fillStyle = '#a88850'; x.fillRect(i, yy, 1, 1); }
      x.fillStyle = '#fff0e0'; x.fillRect(9, 5, 2, 1); x.fillRect(22, 14, 2, 1);
    },
    ground: { top: ['#e8d098', '#c8a870'], dirt: '#c8a870', dirt2: '#a88850', speck: '#fff0e0' },
    particle: 'bubble', dim: 'rgba(10,40,90,.12)'
  };

  function drawPillar(o) {
    var X = Math.round(o.x), top = Math.round(o.y - o.h), h = Math.round(o.h), w = o.w;
    g.fillStyle = '#4a5470'; g.fillRect(X + 1, top, w - 2, h);
    g.fillStyle = '#7a86a8'; g.fillRect(X + 2, top, 4, h); g.fillStyle = '#353c54'; g.fillRect(X + w - 5, top, 3, h);
    g.fillStyle = '#2a3046'; for (var yy = top + 3; yy < top + h; yy += 9) g.fillRect(X + 1, yy, w - 2, 1);
    g.fillStyle = '#5a9a5a'; for (yy = top; yy < top + h; yy += 5) if ((yy + X) % 3 === 0) g.fillRect(X + 1 + ((yy * 7) % (w - 4)), yy, 2, 3);
    var cy = o.cap === 'bottom' ? top + h - 5 : top;
    g.fillStyle = '#1e2a3a'; g.fillRect(X - 2, cy - 1, w + 4, 7);
    g.fillStyle = '#5ad0a0'; g.fillRect(X - 1, cy, w + 2, 5); g.fillStyle = '#b8ffe0'; g.fillRect(X - 1, cy, w + 2, 1);
    g.fillStyle = '#ffd45e'; g.fillRect(X + (w >> 1) - 1, cy + 2, 2, 2);
  }
  function drawPipe(o) {
    var X = Math.round(o.x), top = Math.round(o.y - o.h), h = Math.round(o.h), w = o.w;
    g.fillStyle = '#7a5428'; g.fillRect(X, top, w, h);
    g.fillStyle = '#c8904a'; g.fillRect(X + 2, top, 3, h); g.fillStyle = '#ffd08a'; g.fillRect(X + 3, top, 1, h);
    g.fillStyle = '#4a3018'; g.fillRect(X + w - 3, top, 3, h);
    for (var yy = top + 8; yy < top + h; yy += 14) { g.fillStyle = '#4a3018'; g.fillRect(X, yy, w, 2); g.fillStyle = '#ffd08a'; g.fillRect(X + 1, yy, 1, 1); g.fillRect(X + w - 3, yy, 1, 1); }
    var fy = o.cap === 'bottom' ? top + h - 5 : top;
    g.fillStyle = '#3a2414'; g.fillRect(X - 3, fy - 1, w + 6, 7); g.fillStyle = '#a07038'; g.fillRect(X - 2, fy, w + 4, 5); g.fillStyle = '#e8b868'; g.fillRect(X - 2, fy, w + 4, 1);
    g.fillStyle = '#3a2414'; for (var k = 0; k < w + 4; k += 4) g.fillRect(X - 1 + k, fy + 2, 1, 1);
  }
  function drawVent(o) {
    var X = Math.round(o.x);
    g.fillStyle = '#3a2414'; g.fillRect(X - 1, GY - 4, o.w + 2, 4); g.fillStyle = '#8a5a2a'; g.fillRect(X, GY - 3, o.w, 2);
    g.fillStyle = '#1a0e08'; for (var k = 1; k < o.w; k += 3) g.fillRect(X + k, GY - 3, 1, 2);
    if (o.on) {
      for (var yy = GY - 4; yy > GY - o.h; yy -= 2) {
        var sp = 2 + Math.round(Math.sin(yy * 0.3 + game.frame * 0.5) * 1.5) + Math.round((GY - yy) / 16);
        g.fillStyle = (yy >> 1) % 3 ? 'rgba(240,235,225,.75)' : 'rgba(255,255,255,.95)'; g.fillRect(X + (o.w >> 1) - sp, yy, sp * 2, 2);
      }
    } else if (o.cyc > 40) {
      g.fillStyle = 'rgba(240,235,225,.7)'; g.fillRect(X + 4 + (game.frame % 3), GY - 8 - (game.frame % 6), 3, 3);
      if (game.frame % 10 < 6) PX.text(g, '!', X + (o.w >> 1) - 1, GY - 16, '#ff4f6a', '#000');
    }
  }
  function drawFence(o) {
    var X = Math.round(o.x), top = Math.round(o.y - o.h), h = Math.round(o.h);
    g.fillStyle = 'rgba(255,42,138,.16)'; g.fillRect(X - 2, top, o.w + 4, h);
    g.fillStyle = '#2a1a48'; g.fillRect(X, top, 2, h); g.fillRect(X + o.w - 2, top, 2, h);
    var ey = o.ceil ? top + h - 1 : top; g.fillStyle = '#4fe3ff'; g.fillRect(X - 1, ey, 4, 1); g.fillRect(X + o.w - 3, ey, 4, 1);
    for (var yy = top + 2; yy < top + h - 1; yy += 3) { if ((game.frame + yy) % 9 === 0) continue; g.fillStyle = ((yy + game.frame) >> 2) % 2 ? '#ff2a8a' : '#ff9ad0'; g.fillRect(X + 2, yy, o.w - 4, 1); }
  }
  function drawMine(o) {
    var cx = Math.round(o.x + 6), cy = Math.round(o.y - 6);
    g.fillStyle = '#2a4a5a'; for (var yy = cy + 6; yy < GY; yy += 3) g.fillRect(cx + ((yy >> 2) % 2), yy, 1, 2);
    g.fillStyle = '#1a2430'; [[0, -8], [0, 7], [-8, 0], [7, 0], [-6, -6], [5, -6], [-6, 5], [5, 5]].forEach(function (p) { g.fillRect(cx + p[0], cy + p[1], 2, 2); });
    fillCircle(cx, cy, 5, '#1a2430'); fillCircle(cx - 1, cy - 1, 2, '#4a5a6a');
    g.fillStyle = game.frame % 30 < 15 ? '#ff3a4a' : '#5a1a1a'; g.fillRect(cx, cy - 3, 2, 2);
  }
  function drawGearHaz(o) { g.drawImage(gearHaz[Math.floor(game.frame / 3) % 8], Math.round(o.x - 2), Math.round(o.y - o.h - 2)); }

  function drawRider(id, x, y, frame, mode, gdir, airborne, thrust, vy) {
    var s = SPR[id], X = Math.round(x), Y = Math.round(y);
    if (mode === 'fly') {
      var bob = Math.round(Math.sin(frame * 0.12 + x * 0.1));
      Y += bob;
      if (id === 'X0') {
        g.fillStyle = 'rgba(180,140,255,.4)'; g.fillRect(X - 12, Y + 1, 12, 1); g.fillRect(X - 18, Y + 1, 4, 1);
        g.fillStyle = '#e6eeff'; g.fillRect(X - 2, Y, 22, 1); g.fillStyle = '#9fb0d0'; g.fillRect(X - 2, Y + 1, 21, 1); g.fillStyle = '#ffffff'; g.fillRect(X + 20, Y, 2, 1);
        g.fillStyle = '#b48cff'; g.fillRect(X - 4, Y - 1, 2, 4); g.fillStyle = '#5a3a2a'; g.fillRect(X - 8, Y, 4, 2); g.fillStyle = '#ff5f8f'; g.fillRect(X - 10, Y + 1, 2, 2);
        g.drawImage(s.ride || s.stand, X, Y - 24);
      } else if (id === 'Feline1') {
        g.drawImage(s.jump, X, Y - 24);
        g.fillStyle = '#8a5a2a'; g.fillRect(X + 7, Y - 29, 2, 5);
        var bl = [9, 5, 1, 5][frame % 4]; g.fillStyle = '#ffd45e'; g.fillRect(X + 8 - bl, Y - 30, bl * 2, 1); g.fillStyle = '#c8a040'; g.fillRect(X + 7, Y - 30, 2, 1);
      } else {
        g.drawImage(s.ride || s.stand, X, Y - 24);
        g.fillStyle = '#c8c0dc'; g.fillRect(X - 3, Y + 1, 22, 3); g.fillStyle = '#ffffff'; g.fillRect(X - 2, Y - 2, 20, 4); g.fillRect(X + 1, Y - 4, 7, 2); g.fillRect(X + 10, Y - 3, 6, 2);
        g.fillStyle = '#f0e8f4'; g.fillRect(X - 7, Y, 4, 2); g.fillRect(X - 11, Y + 1, 3, 1);
      }
      return;
    }
    if (mode === 'jet') {
      g.fillStyle = '#6a4a2a'; g.fillRect(X - 3, Y - 18, 5, 11); g.fillStyle = '#c8904a'; g.fillRect(X - 3, Y - 18, 5, 1); g.fillRect(X - 2, Y - 16, 1, 7);
      g.fillStyle = '#3a2414'; g.fillRect(X - 3, Y - 7, 5, 2);
      g.drawImage(airborne ? s.jet || s.jump : s.run[Math.floor(frame / 5) % 4], X, Y - 24);
      g.fillStyle = '#8a5a2a'; g.fillRect(X + 3, Y - 17, 11, 1); g.fillStyle = '#7fd3ff'; g.fillRect(X + 9, Y - 18, 2, 2); g.fillRect(X + 12, Y - 18, 2, 2);
      if (thrust) { var fl = 3 + frame % 3; g.fillStyle = '#ff6a2a'; g.fillRect(X - 3, Y - 5, 5, fl); g.fillStyle = '#ffb84f'; g.fillRect(X - 2, Y - 5, 3, fl - 1); g.fillStyle = '#fff2a8'; g.fillRect(X - 1, Y - 5, 1, 2); }
      return;
    }
    if (mode === 'flip') {
      var img = airborne ? s.fall : s.run[Math.floor(frame / 4) % 4]; /* mid-flip: hair and skirt float the other way */
      if (gdir < 0) { g.save(); g.translate(X, Y + 24); g.scale(1, -1); g.drawImage(img, 0, 0); g.restore(); }
      else g.drawImage(img, X, Y - 24);
      var fy = gdir < 0 ? Y : Y - 1;
      g.fillStyle = 'rgba(79,227,255,.9)'; g.fillRect(X + 3, fy, 10, 1); g.fillStyle = 'rgba(255,42,138,.7)'; g.fillRect(X + 5, fy + (gdir < 0 ? -1 : 1), 6, 1);
      return;
    }
    if (mode === 'swim') {
      g.save(); g.translate(X + 8, Y - 12); g.rotate(clamp((vy || 0) * 0.15, -0.45, 0.45));
      g.drawImage(s.swim ? s.swim[Math.floor(frame / 10) % 2] : s.run[Math.floor(frame / 8) % 4], -8, -12);
      g.fillStyle = 'rgba(200,240,255,.75)';
      for (var a = 0; a < 28; a++) { var an = a / 28 * Math.PI * 2; g.fillRect(Math.round(Math.cos(an) * 8), Math.round(-5 + Math.sin(an) * 8), 1, 1); }
      g.fillStyle = 'rgba(255,255,255,.9)'; g.fillRect(-4, -11, 2, 1); g.fillRect(-5, -10, 1, 2);
      g.restore();
      return;
    }
    drawChar(id, x, y, frame, airborne, null, vy);
  }
  var byKey = {}; BIOMES.forEach(function (b) { byKey[b.key] = b; });
  byKey.park.len = 240; byKey.park.line = '公园的花开了';
  byKey.snow.len = 300; byKey.snow.rift = true; byKey.snow.name = '霜脊 · 雪原入口'; byKey.snow.en = 'SNOWFIELD'; byKey.snow.line = '下雪了！';
  byKey.peak.len = 360; byKey.peak.boss = true; byKey.peak.en = 'BOSS: FROST WARDEN'; byKey.peak.line = '是霜脊守望者！';
  byKey.peak.obstacles = ['spike', 'pit', 'wolf', 'beetle', 'bat', 'spike'];

  /* ---------- 10 more worlds ---------- */
  function rowsPal(rows, pal) { return PX.fromRows(rows, pal); }
  function spikePal(n, base, pal, seed) { var a = []; for (var i = 0; i < n; i++) a.push(P.spike(10 + (i % 2) * 5, base + i * 3, seed + i * 7, pal)); return a; }
  var cart = rowsPal(['oooooooooooooooo', 'orrwrrwrrwrrwrro', 'oooooooooooooooo', '.o............o.', '.obbbbbbbbbbbbo.', '.obyybbbbbyybbo.', '.obbbbbbbbbbbbo.', '.oooooooooooooo.', '..ooo......ooo..', '..oko......oko..', '...o........o...'],
    { o: '#2a1410', r: '#e8404a', w: '#ffffff', b: '#a0602a', y: '#ffd45e', k: '#5a5a6a' });
  var lantern = rowsPal(['..ooo..', '.orrro.', 'orrYrro', 'orYYYro', 'orrYrro', '.orrro.', '..ooo..', '...y...', '...y...'], { o: '#5a1010', r: '#e8303a', Y: '#ffd45e', y: '#ffb84f' });
  var toro = rowsPal(['..oooo..', '.oGGGGo.', 'oooooooo', '.oGGGGo.', '.oGyyGo.', '.oGyyGo.', '.oooooo.', '..oGGo..', '..oGGo..', '.oooooo.', 'oGGGGGGo', 'oooooooo'], { o: '#3a3a48', G: '#9a98a8', y: '#ffd45e' });
  var fox = P.fox;
  var GB = ['#0f380f', '#306230', '#8bac0f', '#9bbc0f'];
  var blob8 = [
    rowsPal(['....oooo....', '..oollllloo.', '.olllllllllo', 'olwwollowwlo', 'olwkollokwlo', 'ollllllllllo', '.olllllllll.', '..oooooooo..', '.oo......oo.', 'ooo......ooo'], { o: GB[0], l: GB[1], w: GB[3], k: GB[0] }),
    rowsPal(['....oooo....', '..oollllloo.', '.olllllllllo', 'olwwollowwlo', 'olwkollokwlo', 'ollllllllllo', '.olllllllll.', '..oooooooo..', '..oo....oo..', '..ooo..ooo..'], { o: GB[0], l: GB[1], w: GB[3], k: GB[0] })
  ];
  var pipe8 = (function () { var r = ['oooooooooooooo', 'olwllllllllllo', 'olwllllllllllo', 'olwllllllllllo', 'oooooooooooooo']; for (var i = 0; i < 11; i++) r.push('.olwlllllllo..'.slice(0, 14)); return rowsPal(r, { o: GB[0], l: GB[1], w: GB[2] }); })();
  var cactus = rowsPal(['....oo....', '...oGGo...', '...oGgo...', '.o.oGgo...', 'oGooGgo.o.', 'oGgoGgooGo', 'oGgGGgoGgo', '.ooGGgGGgo', '...oGgooo.', '...oGgo...', '...oGgo...', '...oGgo...', '...oGgo...', '..ooooooo.'], { o: '#1a3a1a', G: '#5ab04a', g: '#3a8a3a' });
  var scorp = [
    rowsPal(['.........oo...', '........o..o..', '.........o.o..', '..oooooooo....', '.obbbbbbbbo...', 'obkbbbbbbbbo..', '.oo.o.o.o.oo..', 'o..o.o.o.o..o.'], { o: '#3a1a0a', b: '#c8803a', k: '#1a0a0a' }),
    rowsPal(['.........oo...', '........o..o..', '.........o.o..', '..oooooooo....', '.obbbbbbbbo...', 'obkbbbbbbbbo..', '.oo.o.o.o.oo..', '.o.o.o.o.o.o..'], { o: '#3a1a0a', b: '#c8803a', k: '#1a0a0a' })
  ].map(PX.flip);
  var magma = spikePal(4, 12, ['#1a0806', '#ff8a3a', '#e85a1a', '#5a2010'], 211);
  var tomb = rowsPal(['...oooo...', '..oGGGGo..', '.oGGGGGGo.', '.oGGkGGGo.', '.oGkkkGGo.', '.oGGkGGGo.', '.oGGGGGGo.', '.oGGGGGGo.', '.oGGGGGGo.', 'oooooooooo', 'oggggggggo', 'oooooooooo'], { o: '#1a1424', G: '#6a6a80', k: '#2a2438', g: '#3a3448' });
  var pumpkin = rowsPal(['....gg....', '.oooggooo.', 'oPPoPPoPPo', 'oPkkPPkkPo', 'oPPPPPPPPo', 'oPkPkkPkPo', 'oPPkPPkPPo', '.oooooooo.'], { o: '#5a2a0a', P: '#ff8a1a', k: '#ffe04a', g: '#3a8a3a' });
  var ghost = [
    rowsPal(['...oooo...', '..owwwwo..', '.owwwwwwo.', '.owkwwkwo.', '.owwwwwwo.', '.owwoowwo.', '.owwwwwwo.', '.owwwwwwo.', '.owowwowo.', '.o.o..o.o.'], { o: 'rgba(160,150,220,.8)', w: 'rgba(240,240,255,.8)', k: '#1a1430' }),
    rowsPal(['...oooo...', '..owwwwo..', '.owwwwwwo.', '.owkwwkwo.', '.owwwwwwo.', '.owwoowwo.', '.owwwwwwo.', '.owwwwwwo.', '..owowwo..', '..o.o..o..'], { o: 'rgba(160,150,220,.8)', w: 'rgba(240,240,255,.8)', k: '#1a1430' })
  ];
  var balloon = rowsPal(['..oooo..', '.oRRRRo.', 'oRwRRRRo', 'oRRRRRRo', 'oRRRRRRo', '.oRRRRo.', '..oRRo..', '...oo...', '...k....', '....k...', '...k....', '....k...'], { o: '#7a1a2a', R: '#ff5a6a', w: '#ffffff', k: '#5a5a6a' });
  var butterfly = [
    rowsPal(['oo.......oo', 'oPPo...oPPo', 'oPwPo.oPwPo', '.oPPPoPPPo.', '.oPPo.oPPo.', '..oo...oo..'], { o: '#2a6a9a', P: '#9ae8ff', w: '#ffffff' }),
    rowsPal(['...........', '.oo.....oo.', '.oPPo.oPPo.', '..oPPoPPo..', '..oPo.oPo..', '...o...o...'], { o: '#2a6a9a', P: '#9ae8ff', w: '#ffffff' })
  ];
  var bear = rowsPal(['.oo....oo.', 'oGGo..oGGo', '.oGGGGGGo.', '.oGkGGkGo.', '.oGGwwGGo.', '..oGGGGo..', '.oGGGGGGo.', 'oGGoGGoGGo', 'oGGGGGGGGo', '.oGGooGGo.', '..oo..oo..'], { o: '#8a1a3a', G: 'rgba(255,110,150,.9)', k: '#3a0a1a', w: '#ffffff' });
  var cupcake = [
    rowsPal(['....oooo....', '..owwwwwwo..', '.owwpwwpwwo.', 'owwwwwwwwwwo', 'oooooooooooo', '.ocCcCcCcCo.', '.oCcCcCcCco.', '..ocCcCcCo..', '..oooooooo..', '..o.o..o.o..'], { o: '#5a2a1a', w: '#fff0f6', p: '#ff6f9a', c: '#c8804a', C: '#a0602a' }),
    rowsPal(['....oooo....', '..owwwwwwo..', '.owwpwwpwwo.', 'owwwwwwwwwwo', 'oooooooooooo', '.ocCcCcCcCo.', '.oCcCcCcCco.', '..ocCcCcCo..', '..oooooooo..', '.o.o....o.o.'], { o: '#5a2a1a', w: '#fff0f6', p: '#ff6f9a', c: '#c8804a', C: '#a0602a' })
  ].map(PX.flip);
  var caneCoral = spikePal(4, 22, ['#8a1a2a', '#ffffff', '#ff4f6a', '#ffd0d8'], 241);
  var icing = spikePal(4, 18, ['#c87aa0', '#fff0f6', '#ffd0e8', '#ffb0d0'], 251).map(vflip);
  var asteroid = (function () {
    var c = PX.make(22, 22), x = c.getContext('2d'), r = PX.rng(7);
    for (var yy = 0; yy < 22; yy++) for (var xx = 0; xx < 22; xx++) {
      var dx = xx - 10.5, dy = yy - 10.5, a = Math.atan2(dy, dx), rr = 9 + Math.sin(a * 3) * 1.5 + Math.cos(a * 5) * 0.8, d = Math.sqrt(dx * dx + dy * dy);
      if (d < rr) { x.fillStyle = d > rr - 1.2 ? '#2a2430' : (dx + dy < -4 ? '#9a8a9a' : '#6a5a6a'); x.fillRect(xx, yy, 1, 1); }
    }
    [[7, 8, 2], [13, 12, 3], [9, 15, 1]].forEach(function (k) { disc(x, k[0], k[1], k[2], '#4a3e4a'); });
    return c;
  })();

  function obj(img, x, extra) { var o = { img: img, x: x, y: GY, w: img.width, h: img.height, hb: [1, 2, 1, 0] }; for (var k in extra) o[k] = extra[k]; return o; }
  function flyer(anim, x, lo, hi, amp, extra) {
    var fy = lo + R() * (hi - lo), o = { anim: anim, x: x, y: fy, base: fy, ph: R() * 6, w: anim[0].width, h: anim[0].height, vx: 0.4, noShadow: true, hb: [1, 1, 1, 1], upd: function (q) { q.y = q.base + Math.sin(game.frame * 0.06 + q.ph) * amp; } };
    for (var k in extra) o[k] = extra[k]; return o;
  }
  function drawFireball(o) {
    if (o.y > GY + 2) return;
    var cx = Math.round(o.x + 4), cy = Math.round(o.y - 4);
    fillCircle(cx, cy, 4, '#ff5a1a'); fillCircle(cx, cy, 3, '#ffb84f'); fillCircle(cx, cy - 1, 1, '#fff2a8');
    g.fillStyle = 'rgba(255,120,40,.6)'; g.fillRect(cx - 1, cy + 4, 3, 3 + (game.frame % 3));
  }
  function drawTower(o) {
    var X = Math.round(o.x), top = Math.round(o.y - o.h), h = Math.round(o.h), w = o.w;
    g.fillStyle = '#c87a5a'; g.fillRect(X, top, w, h);
    g.fillStyle = '#8a4a3a'; for (var yy = top + 3; yy < top + h; yy += 4) { g.fillRect(X, yy, w, 1); for (var xx = ((yy >> 2) % 2) * 3; xx < w; xx += 6) g.fillRect(X + xx, yy - 3, 1, 3); }
    g.fillStyle = '#e8a080'; g.fillRect(X + 1, top, 2, h);
    g.fillStyle = '#2a1a3a'; for (yy = top + 10; yy < top + h - 6; yy += 18) g.fillRect(X + 7, yy, 4, 6);
    g.fillStyle = '#ffd45e'; for (yy = top + 11; yy < top + h - 6; yy += 36) g.fillRect(X + 8, yy, 2, 2);
    if (o.cap === 'top') { for (var k = 0; k < 10; k++) { g.fillStyle = k < 2 ? '#8aa8ff' : '#4a6ad8'; g.fillRect(X - 3 + k, top - 10 + k, w + 6 - k * 2, 1); } g.fillStyle = '#ff5a6a'; g.fillRect(X + 8, top - 18, 1, 8); g.fillRect(X + 9, top - 18, 4, 3); }
    else { g.fillStyle = '#6e7ea0'; for (k = 0; k < 8; k++) g.fillRect(X - 2 + k, top + h + k - 1, w + 4 - k * 2, 1); g.fillStyle = '#4a8a5a'; g.fillRect(X - 3, top + h - 2, w + 6, 2); }
  }
  function drawTruss(o) {
    var X = Math.round(o.x), top = Math.round(o.y - o.h), h = Math.round(o.h), w = o.w;
    g.fillStyle = '#8a96b0'; g.fillRect(X, top, 2, h); g.fillRect(X + w - 2, top, 2, h);
    g.fillStyle = '#5a6680'; for (var yy = top; yy < top + h; yy += 12) { for (var k = 0; k < 12 && yy + k < top + h; k++) { g.fillRect(X + 2 + Math.round(k * (w - 4) / 12), yy + k, 1, 1); g.fillRect(X + w - 3 - Math.round(k * (w - 4) / 12), yy + k, 1, 1); } g.fillStyle = '#cfd8f0'; g.fillRect(X, yy, w, 1); g.fillStyle = '#5a6680'; }
    var fy = o.cap === 'bottom' ? top + h - 4 : top;
    g.fillStyle = '#2a3a6a'; g.fillRect(X - 6, fy, w + 12, 4); g.fillStyle = '#4a7ad8'; for (k = 0; k < w + 12; k += 3) g.fillRect(X - 6 + k, fy + 1, 2, 2);
    g.fillStyle = game.frame % 40 < 20 ? '#ff4f6a' : '#5a1a2a'; g.fillRect(X + (w >> 1), o.cap === 'bottom' ? fy + 4 : fy - 2, 2, 2);
  }
  function drawAsteroid(o) {
    g.save(); g.translate(Math.round(o.x + 11), Math.round(o.y - 11)); g.rotate(game.frame * 0.03 + (o.ph || 0)); g.drawImage(asteroid, -11, -11); g.restore();
  }
  function drawLaser(o) {
    var X = Math.round(o.x);
    g.fillStyle = '#2a3048'; g.fillRect(X, GY - 5, o.w, 5); g.fillStyle = o.on ? '#4fe3ff' : (o.cyc > 40 && game.frame % 8 < 4 ? '#ff4f6a' : '#3a4a6a'); g.fillRect(X + 4, GY - 6, o.w - 8, 2);
    if (o.on) { var cx = X + (o.w >> 1); g.fillStyle = 'rgba(79,227,255,.35)'; g.fillRect(cx - 4, GY - o.h, 8, o.h - 5); g.fillStyle = '#9af0ff'; g.fillRect(cx - 2, GY - o.h, 4, o.h - 5); g.fillStyle = '#ffffff'; g.fillRect(cx - 1, GY - o.h, 1 + (game.frame % 2), o.h - 5); }
    else if (o.cyc > 40 && game.frame % 10 < 6) PX.text(g, '!', X + (o.w >> 1) - 1, GY - 16, '#ff4f6a', '#000');
  }
  function drawCrystal(o) {
    var X = Math.round(o.x), top = Math.round(o.y - o.h), h = Math.round(o.h), w = o.w;
    for (var k = 0; k < h; k++) {
      var tt = o.ceil ? k / h : 1 - k / h, hw = Math.max(1, Math.round(w / 2 * (0.25 + 0.75 * tt))), cx = X + (w >> 1);
      g.fillStyle = '#2a6a9a'; g.fillRect(cx - hw, top + k, hw * 2, 1);
      g.fillStyle = '#bff4ff'; g.fillRect(cx - hw + 1, top + k, Math.max(1, hw - 1), 1);
      g.fillStyle = '#ffffff'; g.fillRect(cx - 1, top + k, 1, 1);
    }
    g.fillStyle = 'rgba(191,244,255,.15)'; g.fillRect(X - 3, top, w + 6, h);
  }
  function drawLolli(o) {
    var cx = Math.round(o.x + 6), cy = Math.round(o.y - 6);
    g.fillStyle = '#fff0f6'; g.fillRect(cx, cy + 6, 1, GY - cy - 6);
    fillCircle(cx, cy, 6, '#8a1a3a'); fillCircle(cx, cy, 5, '#ff6fa6'); fillCircle(cx, cy, 3, '#ffffff'); fillCircle(cx, cy, 1, '#5ad0ff');
    g.fillStyle = '#ffffff'; g.fillRect(cx - 3, cy - 4, 2, 1);
  }

  var MARKET = {
    key: 'market', name: '夜市 · 灯笼街', en: 'NIGHT MARKET', seed: 1101, line: '好香！想吃烤鱼！',
    sky: withSky(['#0e0a2a', '#2a1440', '#5a1e48', '#8a3a4a'], function (x) { stars(x, 30, 3, 50); }),
    far: layer(256, function (x, w) {
      var r = PX.rng(1111), px = 0;
      while (px < w) {
        var bw = 30 + Math.floor(r() * 24), top = GY - 40 - Math.floor(r() * 26);
        x.fillStyle = '#1a1030'; x.fillRect(px, top, bw, H - top);
        for (var k = 0; k < 6; k++) { x.fillStyle = '#2a1a40'; x.fillRect(px - 4 + k, top - 6 + k, bw + 8 - k * 2, 1); }
        x.fillStyle = '#2a1a40'; x.fillRect(px - 6, top - 7, 3, 1); x.fillRect(px + bw + 3, top - 7, 3, 1);
        for (var wy = top + 6; wy < GY - 8; wy += 9) for (var wx = px + 4; wx < px + bw - 4; wx += 8) if (r() < 0.5) { x.fillStyle = '#ffb060'; x.fillRect(wx, wy, 4, 4); }
        px += bw + 6;
      }
    }),
    mid: layer(200, function (x, w) {
      for (var s = 0; s < 3; s++) {
        var sx = 10 + s * 66; x.fillStyle = '#3a1a1a'; x.fillRect(sx, GY - 30, 2, 30); x.fillRect(sx + 46, GY - 30, 2, 30);
        for (var k = 0; k < 48; k += 4) { x.fillStyle = (k / 4) % 2 ? '#e8404a' : '#fff0e0'; x.fillRect(sx + k, GY - 34, 4, 5); }
        x.fillStyle = '#5a2a1a'; x.fillRect(sx + 2, GY - 14, 44, 3); x.fillStyle = 'rgba(255,200,120,.25)'; x.fillRect(sx + 2, GY - 29, 44, 15);
        x.fillStyle = '#ffd45e'; x.fillRect(sx + 8, GY - 17, 4, 3); x.fillRect(sx + 20, GY - 18, 6, 4); x.fillStyle = '#ff9a5a'; x.fillRect(sx + 32, GY - 17, 5, 3);
      }
      for (var lx = 0; lx < w; lx += 12) { var ly = 44 + Math.round(Math.sin(lx / w * Math.PI * 4) * 4); x.fillStyle = '#2a1a1a'; x.fillRect(lx, ly - 2, 12, 1); x.drawImage(lantern, lx + 3, ly - 1); }
    }),
    anim: function () { if (st.t % 90 < 4) { g.fillStyle = 'rgba(255,200,120,.06)'; g.fillRect(0, 0, W, H); } },
    tile: function (x) { x.fillStyle = '#3a3048'; x.fillRect(0, 0, 32, H - GY); x.fillStyle = '#5a4a6a'; x.fillRect(0, 0, 32, 2); x.fillStyle = '#2a2238'; x.fillRect(0, 9, 32, 1); x.fillRect(0, 18, 32, 1); x.fillRect(10, 2, 1, 7); x.fillRect(26, 10, 1, 8); x.fillRect(4, 19, 1, 7); x.fillStyle = 'rgba(255,180,100,.25)'; x.fillRect(14, 4, 6, 1); },
    ground: { top: ['#5a4a6a', '#3a3048'], dirt: '#3a3048', dirt2: '#2a2238', speck: '#ffb060' },
    particle: 'gold', obstacles: ['cart', 'lanternF', 'box', 'cart', 'lanternF'],
    custom: { cart: function (x) { return obj(cart, x, { hb: [1, 3, 1, 0] }); }, lanternF: function (x) { return flyer([lantern, lantern], x, GY - 46, GY - 30, 4, { vx: 0.3 }); } }
  };

  var SAKURA = {
    key: 'sakura', name: '樱花 · 狐之社', en: 'SAKURA SHRINE', seed: 1201, line: '花瓣好漂亮～',
    sky: withSky(['#6a8ad8', '#c8a8e8', '#ffc8d8', '#ffe8e0']),
    far: layer(256, function (x, w) {
      for (var yy = 0; yy < 70; yy++) { var hw = Math.round(yy * 1.5); x.fillStyle = yy < 14 ? '#ffffff' : (yy < 16 ? '#dde4f8' : '#8a8ac8'); x.fillRect(128 - hw, GY - 92 + yy, hw * 2, 1); }
      x.fillStyle = '#8a8ac8'; x.fillRect(0, GY - 22, w, 22);
      mountains(x, w, GY - 4, 22, '#9a8ad0', null, 1211, '#8a7ac0');
    }),
    mid: layer(220, function (x, w) {
      var r = PX.rng(1221);
      [[30, 30], [120, 36], [190, 28]].forEach(function (tr) {
        x.fillStyle = '#4a2a2a'; x.fillRect(tr[0], GY - tr[1], 3, tr[1]); x.fillRect(tr[0] - 6, GY - tr[1] + 6, 8, 2);
        for (var k = 0; k < 7; k++) disc(x, tr[0] + Math.floor(r() * 26) - 13, GY - tr[1] - 4 + Math.floor(r() * 12) - 6, 6 + Math.floor(r() * 4), k % 2 ? '#ffb0c8' : '#ff8ab0');
        for (k = 0; k < 10; k++) { x.fillStyle = '#ffe0ea'; x.fillRect(tr[0] + Math.floor(r() * 30) - 15, GY - tr[1] - 10 + Math.floor(r() * 16), 2, 1); }
      });
      var gx = 70; x.fillStyle = '#d83a3a'; x.fillRect(gx, GY - 36, 4, 36); x.fillRect(gx + 30, GY - 36, 4, 36); x.fillRect(gx - 2, GY - 30, 38, 3);
      x.fillStyle = '#2a1a1a'; x.fillRect(gx - 6, GY - 40, 46, 3); x.fillStyle = '#d83a3a'; x.fillRect(gx - 4, GY - 37, 42, 2);
    }),
    tile: function (x) { x.fillStyle = '#7ab05a'; x.fillRect(0, 0, 32, H - GY); x.fillStyle = '#a8a098'; x.fillRect(0, 2, 32, 8); x.fillStyle = '#8a8278'; x.fillRect(7, 2, 1, 8); x.fillRect(22, 2, 1, 8); x.fillStyle = '#5a9a4a'; x.fillRect(0, 10, 32, 2); x.fillStyle = '#ffb0c8'; x.fillRect(5, 14, 2, 1); x.fillRect(19, 20, 2, 1); },
    ground: { top: ['#a8a098', '#7ab05a'], dirt: '#7ab05a', dirt2: '#5a9a4a', speck: '#ffb0c8' },
    particle: 'petal', obstacles: ['toro', 'fox', 'rock', 'toro', 'crow'],
    custom: { toro: function (x) { return obj(toro, x); }, fox: function (x) { return { type: 'fox', anim: fox, x: x, y: GY, w: 22, h: 13, vx: 0.8, hb: [3, 4, 4, 1] }; } }
  };

  var BIT8 = {
    key: 'bit8', name: '像素 · 8-BIT 世界', en: 'GAME BOY ZONE', seed: 1301, line: '画面变成绿色的了？！',
    sky: (function () { var c = PX.make(W, H), x = c.getContext('2d'); x.fillStyle = GB[3]; x.fillRect(0, 0, W, H); x.fillStyle = GB[2]; for (var yy = 0; yy < H; yy += 2) x.fillRect(0, yy, W, 1); x.fillStyle = GB[3]; x.fillRect(0, 0, W, 60); return c; })(),
    far: layer(256, function (x, w) {
      for (var i = 0; i < 4; i++) { var cx = 30 + i * 64, rr = 18 + (i % 2) * 8; for (var yy = -rr; yy <= 0; yy++) { var hw = Math.floor(Math.sqrt(rr * rr - yy * yy)); x.fillStyle = GB[1]; x.fillRect(cx - hw, GY + yy, hw * 2, 1); } x.fillStyle = GB[0]; x.fillRect(cx - 4, GY - rr + 6, 2, 4); x.fillRect(cx + 3, GY - rr + 6, 2, 4); }
      for (i = 0; i < 3; i++) { var cx2 = 40 + i * 90; x.fillStyle = GB[3]; x.fillRect(cx2, 20 + i * 8, 26, 8); x.fillRect(cx2 + 6, 16 + i * 8, 12, 4); x.fillStyle = GB[2]; x.fillRect(cx2, 27 + i * 8, 26, 1); }
    }),
    mid: layer(160, function (x, w) {
      [[20, 3], [100, 2]].forEach(function (b) { for (var k = 0; k < b[1]; k++) { x.fillStyle = GB[0]; x.fillRect(b[0] + k * 10, GY - 8, 10, 8); x.fillStyle = GB[1]; x.fillRect(b[0] + k * 10 + 1, GY - 7, 8, 6); } });
      x.fillStyle = GB[0]; x.fillRect(60, 60, 12, 12); x.fillStyle = GB[2]; x.fillRect(61, 61, 10, 10); PX.text(x, '?', 65, 63, GB[0]);
      x.fillStyle = GB[0]; x.fillRect(72, 60, 24, 12); x.fillStyle = GB[1]; for (var k = 0; k < 2; k++) x.fillRect(73 + k * 12, 61, 10, 10);
    }),
    tile: function (x) { x.fillStyle = GB[1]; x.fillRect(0, 0, 32, H - GY); x.fillStyle = GB[0]; for (var yy = 0; yy < H - GY; yy += 6) { x.fillRect(0, yy, 32, 1); for (var xx = (yy / 6 % 2) * 8; xx < 32; xx += 16) x.fillRect(xx, yy, 1, 6); } x.fillStyle = GB[2]; x.fillRect(0, 1, 32, 1); },
    ground: { top: [GB[2], GB[1]], dirt: GB[1], dirt2: GB[0], speck: GB[2] },
    particle: null, obstacles: ['blob', 'pipe8', 'blob', 'pipe8', 'crow'], gb: true,
    custom: { blob: function (x) { return { type: 'blob', anim: blob8, x: x, y: GY, w: 12, h: 10, vx: 0.35, hb: [1, 2, 1, 0] }; }, pipe8: function (x) { return obj(pipe8, x, { hb: [1, 0, 1, 0] }); } }
  };

  var DESERT = {
    key: 'desert', name: '黄沙遗迹', en: 'SAND RUINS', seed: 1401, line: '好热……想回海底',
    sky: withSky(['#3a7ad8', '#8ac0f0', '#ffe0a0', '#ffc070'], function (x) { disc(x, 60, 30, 10, '#fff8d0'); }),
    far: layer(256, function (x, w) {
      [[60, 50], [110, 34], [190, 60]].forEach(function (p) { for (var yy = 0; yy < p[1]; yy++) { x.fillStyle = '#d8a060'; x.fillRect(p[0] - yy, GY - 14 - p[1] + yy, yy, 1); x.fillStyle = '#b07a40'; x.fillRect(p[0], GY - 14 - p[1] + yy, yy, 1); } });
      for (var xx = 0; xx < w; xx++) { var hh = 14 + Math.round(Math.sin(xx * 0.05) * 5); x.fillStyle = '#e8b878'; x.fillRect(xx, GY - hh, 1, hh); }
    }),
    mid: layer(200, function (x, w) {
      for (var xx = 0; xx < w; xx++) { var hh = 8 + Math.round(Math.sin(xx * 0.08 + 1) * 4); x.fillStyle = '#f0c888'; x.fillRect(xx, GY - hh, 1, hh); }
      [[40, 30], [52, 18], [140, 26]].forEach(function (c) { x.fillStyle = '#c89a68'; x.fillRect(c[0], GY - c[1], 8, c[1]); x.fillStyle = '#e8c098'; x.fillRect(c[0], GY - c[1], 2, c[1]); x.fillStyle = '#a07a50'; x.fillRect(c[0] - 1, GY - c[1], 10, 2); });
      x.fillStyle = '#6a4a2a'; for (var k = 0; k < 28; k++) x.fillRect(176 + Math.round(Math.sin(k * 0.1) * 3), GY - k, 2, 1);
      [[-8, -2], [-6, 2], [6, -2], [8, 2], [0, -4]].forEach(function (l) { x.fillStyle = '#3a8a3a'; for (var k2 = 0; k2 < 9; k2++) x.fillRect(177 + Math.round(l[0] * k2 / 8), GY - 28 + Math.round(l[1] * k2 / 8 + k2 * k2 * 0.05), 2, 1); });
    }),
    tile: function (x) { x.fillStyle = '#e8b878'; x.fillRect(0, 0, 32, H - GY); x.fillStyle = '#f8d098'; x.fillRect(0, 0, 32, 2); for (var i = 0; i < 32; i++) for (var yy = 3; yy < H - GY; yy += 4) if (PX.dither(i, yy) < 0.2) { x.fillStyle = '#c89858'; x.fillRect(i, yy, 1, 1); } },
    ground: { top: ['#f8d098', '#e8b878'], dirt: '#e8b878', dirt2: '#c89858', speck: '#ffffff' },
    particle: 'sand', obstacles: ['cactus', 'scorp', 'rock', 'cactus', 'scorp', 'crow'],
    custom: { cactus: function (x) { return obj(cactus, x, { hb: [2, 2, 2, 0] }); }, scorp: function (x) { return { type: 'scorp', anim: scorp, x: x, y: GY, w: 14, h: 8, vx: 0.45, hb: [1, 2, 1, 0] }; } }
  };

  var VOLCANO = {
    key: 'volcano', name: '熔岩火山', en: 'MAGMA PEAK', seed: 1501, line: '脚底好烫！', rift: true,
    sky: withSky(['#0a0408', '#2a0a0a', '#5a140a', '#a0300a']),
    far: layer(256, function (x, w) {
      for (var yy = 0; yy < 80; yy++) { var hw = 10 + yy; x.fillStyle = '#2a1414'; x.fillRect(128 - hw, GY - 80 + yy, hw * 2, 1); }
      x.fillStyle = '#ff5a1a'; x.fillRect(120, GY - 82, 16, 3); x.fillStyle = '#ffb84f'; x.fillRect(124, GY - 83, 8, 2);
      x.fillStyle = '#ff5a1a'; for (yy = 0; yy < 50; yy++) x.fillRect(128 + Math.round(Math.sin(yy * 0.2) * 3) + (yy >> 2), GY - 80 + yy, 2, 1);
      mountains(x, w, GY + 2, 30, '#1a0a0a', null, 1511, '#140808');
    }),
    mid: layer(180, function (x, w) {
      var r = PX.rng(1521);
      for (var i = 0; i < 5; i++) { var cx = Math.floor(r() * w), hh = 10 + Math.floor(r() * 20); for (var yy = 0; yy < hh; yy++) { var hw = Math.round((hh - yy) * 0.5) + 2; x.fillStyle = yy % 4 === 0 ? '#3a1a14' : '#2a1010'; x.fillRect(cx - hw, GY - yy, hw * 2, 1); } x.fillStyle = '#ff5a1a'; x.fillRect(cx - 1, GY - hh + 2, 2, hh - 2); }
    }),
    anim: function () { var p = 0.1 + Math.sin(st.t * 0.05) * 0.05; g.fillStyle = 'rgba(255,80,20,' + p + ')'; g.fillRect(0, GY - 20, W, 20); },
    tile: function (x) { x.fillStyle = '#1a0e0e'; x.fillRect(0, 0, 32, H - GY); x.fillStyle = '#3a1a14'; x.fillRect(0, 0, 32, 2); x.fillStyle = '#ff5a1a'; x.fillRect(4, 5, 7, 1); x.fillRect(10, 6, 1, 5); x.fillRect(20, 14, 9, 1); x.fillRect(24, 10, 1, 4); x.fillStyle = '#ffb84f'; x.fillRect(6, 5, 2, 1); },
    ground: { top: ['#3a1a14', '#1a0e0e'], dirt: '#1a0e0e', dirt2: '#140808', speck: '#ff5a1a' },
    particle: 'ash', obstacles: ['lava', 'fireball', 'magma', 'lava', 'magma', 'bat'],
    custom: {
      lava: function (x) { return { type: 'pit', pit: true, lava: true, x: x, y: GY, w: 20 + Math.floor(R() * 10) + Math.floor(game.speed * 3), h: 0 }; },
      fireball: function (x) { return { type: 'fireball', x: x, y: GY + 10, w: 8, h: 8, ph: Math.floor(R() * 60), hb: [1, 1, 1, 1], draw: drawFireball, upd: function (o) { var c = (game.frame + o.ph) % 90; o.y = c < 60 ? GY + 4 - Math.sin(c / 60 * Math.PI) * 64 : GY + 10; o.safe = o.y > GY; } }; },
      magma: function (x) { return obj(magma[Math.floor(R() * magma.length)], x, { hb: [2, 4, 2, 0] }); }
    }
  };

  var HAUNT = {
    key: 'haunt', name: '幽灵古宅', en: 'HAUNTED MANOR', seed: 1601, line: '有……有鬼！', dark: true,
    sky: withSky(['#0a0614', '#1a0e2a', '#2a1440', '#3a1a4a'], function (x) { disc(x, 190, 30, 14, '#f8f0c8'); disc(x, 196, 26, 12, '#2a1440'); stars(x, 30, 61, 60); }),
    far: layer(256, function (x, w) {
      var mx = 80; x.fillStyle = '#120a1e'; x.fillRect(mx, GY - 70, 80, 70); x.fillRect(mx + 10, GY - 92, 16, 22); x.fillRect(mx + 54, GY - 86, 14, 16);
      for (var k = 0; k < 12; k++) { x.fillRect(mx + 8 - k + 10, GY - 92 - 12 + k, 2 + k * 2 - 4 > 0 ? k * 2 : 1, 1); }
      for (var wy = 0; wy < 3; wy++) for (var wx = 0; wx < 5; wx++) { x.fillStyle = (wx + wy) % 3 === 0 ? '#ffd45e' : '#2a1a3a'; x.fillRect(mx + 8 + wx * 14, GY - 60 + wy * 18, 6, 9); }
      mountains(x, w, GY + 2, 18, '#0e0818', null, 1611, '#0a0612');
    }),
    mid: layer(200, function (x, w) {
      [[30, 40], [150, 34]].forEach(function (tr) { x.fillStyle = '#1a1020'; for (var k = 0; k < tr[1]; k++) x.fillRect(tr[0] + Math.round(Math.sin(k * 0.2) * 2), GY - k, 3, 1); [[-12, -30], [10, -26], [-8, -18], [8, -36]].forEach(function (b) { for (var s = 0; s < 12; s++) x.fillRect(tr[0] + Math.round(b[0] * s / 12), GY + b[1] - Math.round(s * 0.6), 1, 1); }); });
      x.fillStyle = '#1a1020'; for (var fx = 0; fx < w; fx += 6) { x.fillRect(fx, GY - 12, 2, 12); x.fillRect(fx, GY - 14, 1, 2); } x.fillRect(0, GY - 9, w, 1);
    }),
    anim: function (b, scroll) {
      var off = (scroll * 0.45) % 200; b.lights = [[190, 30, 50]];
      for (var k = -1; k < 2; k++) { var cx = Math.round(100 - off + k * 200); if (cx < -10 || cx > W + 10) continue; g.fillStyle = '#e8e0d0'; g.fillRect(cx, GY - 8, 2, 5); g.fillStyle = st.t % 6 < 3 ? '#ffd45e' : '#ff9a3a'; g.fillRect(cx, GY - 10, 2, 2); b.lights.push([cx + 1, GY - 9, 30]); }
    },
    tile: function (x) { x.fillStyle = '#2a1e2a'; x.fillRect(0, 0, 32, H - GY); x.fillStyle = '#3a2e3a'; x.fillRect(0, 0, 32, 2); x.fillStyle = '#4a7a3a'; for (var i = 0; i < 32; i += 3) x.fillRect(i, 0, 1, 1 + (i % 2)); x.fillStyle = '#1a121a'; x.fillRect(6, 10, 3, 2); x.fillRect(20, 18, 2, 2); },
    ground: { top: ['#3a2e3a', '#2a1e2a'], dirt: '#2a1e2a', dirt2: '#1a121a', speck: '#4a7a3a' },
    particle: null, obstacles: ['tomb', 'ghost', 'pumpkin', 'tomb', 'ghost', 'bat'],
    custom: { tomb: function (x) { return obj(tomb, x, { hb: [1, 2, 1, 0] }); }, pumpkin: function (x) { return obj(pumpkin, x); }, ghost: function (x) { return flyer(ghost, x, GY - 44, GY - 26, 8, { vx: 0.5 }); } }
  };

  var SKYCITY = {
    key: 'skycity', name: '天空之城', en: 'SKY CITY · TAP TO PUFF', seed: 1701, line: '坐热气球去！', rift: true, mode: 'fly', speedMul: 0.95,
    sky: withSky(['#2a6ad8', '#5aa0f0', '#a8d8ff', '#e8f6ff'], function (x) { disc(x, 40, 30, 10, '#ffffff'); }),
    far: layer(256, function (x, w) {
      var r = PX.rng(1711);
      for (var i = 0; i < 3; i++) {
        var cx = 40 + i * 86, top = 60 + Math.floor(r() * 20), hw = 20;
        for (var yy = 0; yy < 24; yy++) { var half = Math.round(hw * (1 - yy / 24)); x.fillStyle = '#8a9ac0'; x.fillRect(cx - half, top + yy, half * 2, 1); }
        x.fillStyle = '#6ab06a'; x.fillRect(cx - hw, top - 2, hw * 2, 3);
        for (var h2 = 0; h2 < 3; h2++) { var hx = cx - 14 + h2 * 10; x.fillStyle = '#f0e8d8'; x.fillRect(hx, top - 10, 7, 8); x.fillStyle = '#d85a4a'; x.fillRect(hx - 1, top - 12, 9, 2); x.fillStyle = '#4a6ad8'; x.fillRect(hx + 2, top - 7, 2, 2); }
        x.fillStyle = '#e8e0d0'; x.fillRect(cx + 12, top - 22, 2, 20); x.fillStyle = '#ffffff'; x.fillRect(cx + 6, top - 23, 14, 1); x.fillRect(cx + 12, top - 29, 1, 14);
      }
    }),
    mid: layer(240, function (x, w) { var r = PX.rng(1722); for (var i = 0; i < 12; i++) cloudPuff(x, Math.floor(r() * w), 92 + Math.floor(r() * 34), 6 + Math.floor(r() * 7), ['#ffffff', '#eaf4ff', '#b8d0ec']); }),
    tile: function (x) { x.fillStyle = '#d8e8f8'; x.fillRect(0, 0, 32, H - GY); for (var i = 0; i < 4; i++) disc(x, i * 9 + 4, 5, 5, '#ffffff'); },
    ground: { top: ['#ffffff', '#e4f0fc'], dirt: '#d8e8f8', dirt2: '#c0d4ec', speck: '#ffffff' }, particle: null, pillarDraw: drawTower, flyer: balloon, sub: 'balloon'
  };

  var SPACE = {
    key: 'space', name: '星海 · 轨道站', en: 'STAR SEA · ZERO-G JETPACK', seed: 1801, line: '失重了～', rift: true, mode: 'jet', sub: 'zerog',
    sky: (function () {
      var c = PX.skyGradient(W, H, ['#02010a', '#08041a', '#140a2a', '#0a0620']), x = c.getContext('2d'), r = PX.rng(1811);
      for (var i = 0; i < 120; i++) { x.fillStyle = r() < 0.8 ? '#ffffff' : (r() < 0.5 ? '#9ae8ff' : '#ffd0f0'); x.fillRect(Math.floor(r() * W), Math.floor(r() * H), 1, 1); }
      for (i = 0; i < 400; i++) { var a = r() * 6.28, d = r() * 40; x.fillStyle = 'rgba(180,90,255,' + (0.15 * (1 - d / 40)) + ')'; x.fillRect(Math.round(60 + Math.cos(a) * d * 1.6), Math.round(50 + Math.sin(a) * d * 0.7), 2, 1); }
      return c;
    })(),
    far: layer(256, function (x, w) {
      disc(x, 180, 70, 22, '#3a5ad8'); disc(x, 176, 66, 18, '#5a8af0'); x.fillStyle = '#9ad0ff'; x.fillRect(166, 58, 8, 2); x.fillRect(184, 74, 10, 2);
      x.fillStyle = 'rgba(220,200,255,.8)'; for (var k = -34; k <= 34; k++) x.fillRect(180 + k, 70 + Math.round(k * 0.18), 1, 1);
    }),
    mid: layer(220, function (x, w) {
      x.fillStyle = '#1a1e30'; x.fillRect(20, 80, 90, 14); x.fillRect(50, 66, 30, 14); x.fillStyle = '#2a3a6a'; for (var k = 0; k < 6; k++) x.fillRect(0 + k * 3, 82, 2, 10); for (k = 0; k < 6; k++) x.fillRect(112 + k * 3, 82, 2, 10);
      x.fillStyle = '#4fe3ff'; for (k = 0; k < 8; k++) x.fillRect(26 + k * 10, 86, 3, 2);
    }),
    ceil: tileFrom(32, 14, function (x, w, h) { x.fillStyle = '#1a1e30'; x.fillRect(0, 0, w, h); x.fillStyle = '#3a4260'; x.fillRect(0, h - 4, w, 2); x.fillStyle = '#4fe3ff'; x.fillRect(4, h - 2, 3, 1); x.fillRect(20, h - 2, 3, 1); x.fillStyle = '#0a0e1a'; x.fillRect(15, 0, 1, h - 4); }), ceilSpeed: 1,
    tile: function (x) { x.fillStyle = '#2a3048'; x.fillRect(0, 0, 32, H - GY); x.fillStyle = '#5a6680'; x.fillRect(0, 0, 32, 2); x.fillStyle = '#1a1e30'; x.fillRect(15, 2, 1, H - GY); x.fillStyle = '#4fe3ff'; x.fillRect(6, 6, 2, 1); x.fillStyle = '#ffd45e'; x.fillRect(24, 6, 2, 1); },
    ground: { top: ['#5a6680', '#2a3048'], dirt: '#2a3048', dirt2: '#1a1e30', speck: '#4fe3ff' },
    particle: 'star', pipeDraw: drawTruss, gearDraw: drawAsteroid, ventDraw: drawLaser
  };

  var MIRROR = {
    key: 'mirror', name: '镜湖 · 倒影', en: 'MIRROR LAKE · TAP TO FLIP', seed: 1901, line: '上下颠倒的世界', rift: true, mode: 'flip',
    sky: (function () {
      var top = PX.skyGradient(W, H / 2, ['#2a2a6a', '#6a6ac8', '#c8b8f0']), c = PX.make(W, H), x = c.getContext('2d');
      x.drawImage(top, 0, 0); x.save(); x.translate(0, H); x.scale(1, -1); x.drawImage(top, 0, 0); x.restore();
      x.fillStyle = 'rgba(40,60,120,.3)'; x.fillRect(0, H / 2, W, H / 2); x.fillStyle = '#ffffff'; x.fillRect(0, H / 2, W, 1);
      return c;
    })(),
    far: layer(256, function (x, w) {
      var tmp = PX.make(w, H), tx = tmp.getContext('2d'); mountains(tx, w, H / 2, 40, '#4a4a8a', ['#e8e8ff', '#b8b8e8'], 1911, '#3e3e7a');
      x.drawImage(tmp, 0, 0, w, H / 2, 0, 0, w, H / 2); x.save(); x.globalAlpha = 0.5; x.translate(0, H); x.scale(1, -1); x.drawImage(tmp, 0, 0, w, H / 2, 0, 0, w, H / 2); x.restore();
    }),
    mid: layer(200, function (x, w) {
      [[40, 1], [130, 1], [170, 0]].forEach(function (p) { var bx = p[0]; x.fillStyle = '#bff4ff'; for (var k = 0; k < 14; k++) { x.fillRect(bx - Math.round(k * 0.3), H / 2 - k * 2, 2, 2); x.fillRect(bx - Math.round(k * 0.3), H / 2 + k * 2, 2, 2); } });
    }),
    ceil: tileFrom(32, CY, function (x, w, h) { x.fillStyle = '#4a5aa8'; x.fillRect(0, 0, w, h); x.fillStyle = '#8a9ae8'; x.fillRect(0, h - 3, w, 2); x.fillStyle = '#ffffff'; x.fillRect(0, h - 1, w, 1); x.fillStyle = '#bff4ff'; x.fillRect(5, h - 6, 3, 1); x.fillRect(20, h - 8, 2, 1); }), ceilSpeed: 1,
    tile: function (x) { x.fillStyle = '#4a5aa8'; x.fillRect(0, 0, 32, H - GY); x.fillStyle = '#ffffff'; x.fillRect(0, 0, 32, 1); x.fillStyle = '#8a9ae8'; x.fillRect(0, 1, 32, 2); x.fillStyle = '#bff4ff'; x.fillRect(8, 8, 3, 1); x.fillRect(22, 14, 2, 1); },
    ground: { top: ['#ffffff', '#8a9ae8'], dirt: '#4a5aa8', dirt2: '#3a4a98', speck: '#bff4ff' },
    particle: 'sparkle', fenceDraw: drawCrystal, droneAnim: butterfly
  };

  var CANDY = {
    key: 'candy', name: '棉花糖梦境', en: 'CANDY DREAM · TAP TO FLOAT', seed: 2001, line: '软绵绵的！', rift: true, mode: 'swim', speedMul: 0.9,
    sky: withSky(['#a8d8ff', '#d8c8ff', '#ffc8e8', '#fff0f6'], function (x) { var r = PX.rng(2011); for (var i = 0; i < 6; i++) cloudPuff(x, Math.floor(r() * W), 20 + Math.floor(r() * 40), 6 + Math.floor(r() * 5), ['#ffffff', '#ffe8f4', '#f0c8e0']); }),
    far: layer(256, function (x, w) {
      for (var i = 0; i < 5; i++) { var cx = 20 + i * 56, rr = 20 + (i % 3) * 6; for (var yy = -rr; yy <= 0; yy++) { var hw = Math.floor(Math.sqrt(rr * rr - yy * yy)); x.fillStyle = ['#ffb0d0', '#c8b0ff', '#a8e8d0'][i % 3]; x.fillRect(cx - hw, GY - 6 + yy, hw * 2, 1); } x.fillStyle = '#ffffff'; x.fillRect(cx - 6, GY - 6 - rr + 3, 12, 2); }
    }),
    mid: layer(200, function (x, w) {
      [[40, '#ff6fa6'], [120, '#5ad0ff'], [170, '#ffd45e']].forEach(function (l) { x.fillStyle = '#fff0f6'; x.fillRect(l[0], GY - 30, 2, 30); disc(x, l[0] + 1, GY - 34, 7, l[1]); disc(x, l[0] + 1, GY - 34, 4, '#ffffff'); disc(x, l[0] + 1, GY - 34, 2, l[1]); });
      for (var k = 0; k < 4; k++) { var cx = 70 + k * 12; x.fillStyle = '#c8804a'; x.fillRect(cx, GY - 6, 8, 6); x.fillStyle = '#fff0f6'; x.fillRect(cx - 1, GY - 9, 10, 4); x.fillStyle = '#ff4f6a'; x.fillRect(cx + 3, GY - 11, 2, 2); }
    }),
    tile: function (x) { x.fillStyle = '#6a3a2a'; x.fillRect(0, 0, 32, H - GY); x.fillStyle = '#fff0f6'; for (var i = 0; i < 32; i++) x.fillRect(i, 0, 1, 3 + Math.round(Math.sin(i * 0.8) * 1.5)); x.fillStyle = '#4a2a1a'; x.fillRect(0, 12, 32, 1); x.fillRect(15, 6, 1, 20); var c = ['#ff6fa6', '#5ad0ff', '#ffd45e', '#5dff8f']; for (i = 0; i < 4; i++) { x.fillStyle = c[i]; x.fillRect(4 + i * 7, 1 + (i % 2), 2, 1); } },
    ground: { top: ['#fff0f6', '#6a3a2a'], dirt: '#6a3a2a', dirt2: '#4a2a1a', speck: '#ff6fa6' },
    particle: 'sprinkle', jellyAnim: [bear, bear], mineDraw: drawLolli, crabAnim: cupcake, coral: caneCoral, stal: icing
  };
  var COURT = {
    /* G8: the free-roam stop between the sand ruins and the coral ruins is now a desert oasis (same key, same rules and rewards) */
    key: 'court', name: '绿洲 · 歇脚处', en: 'OASIS · FREE ROAM', seed: 1251, line: '有水！歇一会儿，到处逛逛～', roam: true, mode: 'run', warm: false, oasis: true,
    sky: withSky(['#2a2a6a', '#7a5aa8', '#ffa070', '#ffd890'], function (x) { disc(x, 70, 100, 15, '#ffc070'); disc(x, 70, 100, 12, '#fff0c0'); for (var k = 0; k < 3; k++) { x.fillStyle = 'rgba(255,210,170,.5)'; x.fillRect(20 + k * 70, 40 + k * 9, 46, 2); } }),
    far: layer(256, function (x, w) {
      for (var xx = 0; xx < w; xx++) { var hh = 22 + Math.round(Math.sin(xx * 0.03) * 8 + Math.sin(xx * 0.09) * 3); x.fillStyle = '#c88a5a'; x.fillRect(xx, GY - hh, 1, hh); x.fillStyle = '#e0a06a'; x.fillRect(xx, GY - hh, 1, 2); }
      [[40, 1], [170, 0.8], [220, 1.1]].forEach(function (p) { oasisPalm(x, p[0], GY - 20, Math.round(16 * p[1]), '#5a3a3a', '#3a5a4a'); });
    }),
    mid: layer(320, function (x, w) {
      for (var xx = 0; xx < w; xx++) { var hh = 6 + Math.round(Math.sin(xx * 0.05 + 2) * 3); x.fillStyle = '#e8c088'; x.fillRect(xx, GY - hh, 1, hh); }
      x.fillStyle = '#2a6aa8'; x.fillRect(96, GY - 6, 70, 6); x.fillStyle = '#5ab0e8'; x.fillRect(100, GY - 6, 62, 2); x.fillStyle = '#ffffff'; x.fillRect(112, GY - 5, 6, 1); x.fillRect(140, GY - 4, 4, 1);
      x.fillStyle = '#3a8a3a'; for (var r = 0; r < 12; r++) x.fillRect(92 + r * 7, GY - 8 - (r % 3), 2, 3);
      oasisPalm(x, 90, GY - 4, 34, '#6a4a2a', '#2e8a3e'); oasisPalm(x, 172, GY - 4, 28, '#6a4a2a', '#3a9a4a'); oasisPalm(x, 300, GY - 4, 30, '#6a4a2a', '#2e8a3e');
      /* striped tent */
      for (var ty = 0; ty < 22; ty++) for (var tx = -ty; tx <= ty; tx++) { x.fillStyle = ((tx + 40) >> 2) % 2 ? '#e8e0d0' : '#c84a4a'; x.fillRect(230 + tx, GY - 26 + ty, 1, 1); }
      x.fillStyle = '#3a2418'; x.fillRect(229, GY - 30, 2, 6); x.fillStyle = '#2a1830'; x.fillRect(226, GY - 12, 8, 8);
      /* stone well */
      x.fillStyle = '#8a7a6a'; x.fillRect(20, GY - 12, 22, 12); x.fillStyle = '#b0a090'; for (var s = 0; s < 4; s++) x.fillRect(21 + s * 5, GY - 12, 4, 3); x.fillStyle = '#5a3a28'; x.fillRect(22, GY - 30, 2, 18); x.fillRect(38, GY - 30, 2, 18); x.fillRect(19, GY - 32, 24, 3);
    }),
    tile: function (x) { DESERT.tile(x); for (var i = 0; i < 32; i += 5) { x.fillStyle = '#7ab05a'; x.fillRect(i + 1, 0, 1, 2); x.fillRect(i + 3, 0, 1, 1); } },
    ground: { top: ['#f0d090', '#d8b070'], dirt: '#e0b878', dirt2: '#b08850', speck: '#ffffff' }, particle: 'sand'
  };
  BIOMES = [HOME, byKey.park, MARKET, XIAN, INK, SAKURA, CYBER, BIT8, STEAM, DESERT, COURT, SEA, SKYCITY, VOLCANO, SPACE, MIRROR, CANDY, HAUNT, byKey.snow, CABIN, RIDGE, CAVE, byKey.peak, LAKE];
  var LENS = [200, 200, 180, 240, 200, 180, 240, 180, 240, 180, 220, 220, 200, 220, 220, 200, 200, 220, 180, 220, 220, 300, 200];
  var RAMP = 2600;
  function baseSpeed(d, loop) { return Math.min(4.2, 1.6 + Math.min(2.2, d / RAMP) + (loop || 0) * 0.15); }
  (function () { var acc = 0; BIOMES.forEach(function (b, i) { var sp = baseSpeed(acc) * (b.speedMul || 1); b.len = b.roam ? 10 : Math.round(25 * 60 * sp / 8 / 10) * 10; LENS[i] = b.len; acc += b.len; }); })();
  if (window.SND) SND.setWorlds(BIOMES.map(function (b) { return b.key; }));
  BIOMES.forEach(function (b) { byKey[b.key] = b; });
  /* A3: a third parallax layer (between far and mid, scroll 0.3) for four worlds that looked flat */
  byKey.desert.mid2 = layer(300, function (x, w) {
    for (var xx = 0; xx < w; xx++) { var hh = 16 + Math.round(Math.sin(xx * 0.021 + 1) * 7 + Math.sin(xx * 0.07) * 2); x.fillStyle = '#e0a868'; x.fillRect(xx, GY - 6 - hh, 1, hh); x.fillStyle = '#f0c080'; x.fillRect(xx, GY - 6 - hh, 1, 1); }
    [0, 1, 2].forEach(function (k) { /* camel caravan on the dune crest */
      var cx = 150 + k * 22, cy = GY - 30 + k;
      x.fillStyle = '#7a5030'; x.fillRect(cx, cy, 12, 4); x.fillRect(cx + 3, cy - 2, 3, 2); x.fillRect(cx + 7, cy - 2, 3, 2); x.fillRect(cx + 11, cy - 4, 2, 4); x.fillRect(cx + 12, cy - 6, 3, 2);
      x.fillRect(cx + 1, cy + 4, 1, 4); x.fillRect(cx + 4, cy + 4, 1, 4); x.fillRect(cx + 8, cy + 4, 1, 4); x.fillRect(cx + 10, cy + 4, 1, 4);
      if (k === 0) { x.fillStyle = '#3a2a4a'; x.fillRect(cx + 4, cy - 6, 3, 4); x.fillStyle = '#e8e0d0'; x.fillRect(cx + 4, cy - 7, 3, 1); }
    });
  });
  byKey.mirror.mid2 = layer(280, function (x, w) {
    var r = PX.rng(1907); /* a city on the far shore and its upside-down twin in the water */
    for (var bx = 0; bx < w; bx += 10 + Math.floor(r() * 8)) {
      var bw = 7 + Math.floor(r() * 8), bh = 10 + Math.floor(r() * 26), base = 86;
      x.fillStyle = 'rgba(70,80,140,.85)'; x.fillRect(bx, base - bh, bw, bh);
      x.fillStyle = 'rgba(70,80,140,.35)'; x.fillRect(bx, base + 2, bw, Math.round(bh * 0.8));
      for (var wy = base - bh + 3; wy < base - 2; wy += 4) for (var wx = bx + 1; wx < bx + bw - 1; wx += 3) if (r() < 0.35) { x.fillStyle = '#ffe9a8'; x.fillRect(wx, wy, 1, 1); x.fillStyle = 'rgba(255,233,168,.35)'; x.fillRect(wx, base + 2 + (base - wy), 1, 1); }
    }
    x.fillStyle = 'rgba(200,220,255,.5)'; x.fillRect(0, 87, w, 1);
  });
  byKey.haunt.mid2 = layer(260, function (x, w) {
    var r = PX.rng(1611);
    [20, 95, 150, 215].forEach(function (tx, k) { /* dead trees */
      var th = 34 + k * 5 % 12; x.fillStyle = '#1a1424'; x.fillRect(tx, GY - th, 3, th);
      for (var b2 = 0; b2 < 4; b2++) { var by = GY - th + 4 + b2 * 6, dir = b2 % 2 ? 1 : -1; for (var s = 0; s < 8 - b2; s++) x.fillRect(tx + 1 + dir * s, by - Math.floor(s / 2), 1, 1); }
    });
    for (var f = 0; f < 5; f++) { var fy = GY - 30 + f * 5, fx = Math.floor(r() * w); x.fillStyle = 'rgba(180,170,210,.10)'; x.fillRect(fx, fy, 70, 3); x.fillRect((fx + 130) % w, fy + 2, 50, 2); }
  });
  byKey.lake.mid2 = layer(300, function (x, w) {
    var r = PX.rng(7011);
    for (var p = 0; p < 9; p++) { var px = Math.floor(r() * w), ph = 12 + Math.floor(r() * 10); for (var yy = 0; yy < ph; yy++) { var hw = Math.floor((yy / ph) * 5) + 1; x.fillStyle = '#2a4a5a'; x.fillRect(px - hw, GY - 16 - ph + yy, hw * 2, 1); } x.fillStyle = '#ffffff'; x.fillRect(px - 1, GY - 16 - ph, 2, 1); }
    [[60, '#c84a4a'], [190, '#4a7ac8']].forEach(function (hut) { /* ice-fishing huts */
      var hx = hut[0]; x.fillStyle = hut[1]; x.fillRect(hx, GY - 26, 14, 10); x.fillStyle = '#e8f0ff'; x.fillRect(hx - 1, GY - 28, 16, 2); x.fillStyle = '#1a2a3a'; x.fillRect(hx + 5, GY - 22, 4, 6); x.fillStyle = '#ffd45e'; x.fillRect(hx + 10, GY - 24, 2, 2);
      x.fillStyle = '#5a5a6a'; x.fillRect(hx + 18, GY - 26, 1, 10); x.fillStyle = '#e8e8e8'; for (var l = 0; l < 6; l++) x.fillRect(hx + 18 + l, GY - 26 + l, 1, 1);
    });
  });
  var SKC = document.createElement('canvas'); SKC.width = SKC.height = 1; var SKX = SKC.getContext('2d', { willReadFrequently: true });
  BIOMES.forEach(function (b) { try { SKX.clearRect(0, 0, 1, 1); SKX.drawImage(b.sky, 0, 0); var d = SKX.getImageData(0, 0, 1, 1).data; b.skyTop = 'rgb(' + d[0] + ',' + d[1] + ',' + d[2] + ')'; } catch (e) { } });
  var CYCLE = BIOMES.reduce(function (s, b) { return s + b.len; }, 0);
  /* ---------- loop plan: lap 1 is the fixed story order; from lap 2 on the worlds are shuffled ----------
     The leaderboard server keeps a copy of these rules and of every world length (server/kr_server.py).
     Changing BIOMES, lengths, rest stops or room rewards REQUIRES bumping GAME_VERSION and the server table. */
  var GAME_VERSION = 'kr2-20261017';
  var HOUSE_THEME = { home: 'apt', park: 'apt', market: 'apt', sakura: 'tea', ink: 'tea', snow: 'lodge', ridge: 'lodge', lake: 'lodge', cabin: 'cabin', cave: 'cabin' };
  var LOOP1_HOUSES = { home: 1, sakura: 1, snow: 1, cave: 1 };
  var ROOM_MAX_F = 4 * 60 * 60, CLIMB_MAX_F = 45 * 60; /* rooms and wall climbs pause the road, but never for longer than this */
  var PLANS = [];
  function keyIdx(k) { for (var i = 0; i < BIOMES.length; i++) if (BIOMES[i].key === k) return i; return -1; }
  function makePlan(loop) {
    var n = BIOMES.length, order, houses = {}, i;
    if (loop === 0) { order = BIOMES.map(function (b, k) { return k; }); for (i = 0; i < n; i++) if (LOOP1_HOUSES[BIOMES[i].key]) houses[i] = HOUSE_THEME[BIOMES[i].key]; }
    else {
      var home = keyIdx('home'), lake = keyIdx('lake'), peak = keyIdx('peak'), court = keyIdx('court'), rest = [];
      for (i = 0; i < n; i++) if (i !== home && i !== lake && i !== peak && i !== court) rest.push(i);
      for (i = rest.length - 1; i > 0; i--) { var j = Math.floor(R() * (i + 1)), t = rest[i]; rest[i] = rest[j]; rest[j] = t; }
      order = [home].concat(rest);
      order.splice(8 + Math.floor(R() * 8), 0, court);            /* courtyard somewhere in the middle (slot 8..15) */
      order.splice(order.length - (R() < 0.5 ? 1 : 0), 0, peak);   /* the boss is the 2nd or 3rd last world */
      order.push(lake);                                            /* the frozen lake always closes the lap */
      var cs = order.indexOf(court), last = 0, cnt = 0;            /* slot 0 = the celebration room, it counts as a rest stop */
      for (i = 1; i < n - 1; i++) {
        var th = HOUSE_THEME[BIOMES[order[i]].key];
        if (th && i - last >= 4 && Math.abs(i - cs) >= 4 && cnt < 4) { houses[i] = th; last = i; cnt++; }
        if (i === cs) last = i;
      }
    }
    var starts = [], acc = 0; order.forEach(function (bi) { starts.push(acc); acc += BIOMES[bi].len; });
    return { order: order, starts: starts, houses: houses };
  }
  function plan(loop) { while (PLANS.length <= loop) PLANS.push(makePlan(PLANS.length)); return PLANS[loop]; }
  function slotEnd(loop, slot) { var P = plan(loop); return loop * CYCLE + P.starts[slot] + BIOMES[P.order[slot]].len; }
  function biomeAt(d) {
    var loop = Math.floor(d / CYCLE), p = d - loop * CYCLE, P = plan(loop);
    for (var s = 0; s < P.order.length; s++) { var L = BIOMES[P.order[s]].len; if (p < L) return [loop, s, P.order[s]]; p -= L; }
    return [loop, P.order.length - 1, P.order[P.order.length - 1]];
  }
  function cp(G, key) { G.cps.push([Math.floor(G.dist), G.frame, key, G.shards]); }
  function armHouse(G) {
    var P = plan(G.loop), th = P.houses[G.slot];
    G.houseAt = th ? { theme: th, at: G.loop * CYCLE + P.starts[G.slot] + BIOMES[P.order[G.slot]].len * (0.3 + R() * 0.2) } : null;
  }

  function drawBoss(alpha) {
    var bx = 168, by = GY - 18 + Math.round(Math.sin(st.t * 0.03) * 2), up = game && game.bossThrow > 0;
    var C1 = 'rgba(16,20,52,' + (0.92 * alpha) + ')';
    g.fillStyle = C1;
    g.fillRect(bx - 22, by - 60, 44, 44); g.fillRect(bx - 14, by - 78, 28, 20); g.fillRect(bx - 18, by - 16, 14, 30); g.fillRect(bx + 4, by - 16, 14, 30);
    if (up) { g.fillRect(bx - 36, by - 96, 12, 44); g.fillRect(bx + 24, by - 96, 12, 44); }
    else { g.fillRect(bx - 36, by - 58, 12, 44); g.fillRect(bx + 24, by - 58, 12, 44); }
    g.fillStyle = 'rgba(207,217,255,' + (0.5 * alpha) + ')'; g.fillRect(bx - 14, by - 78, 28, 2); g.fillRect(bx - 22, by - 60, 44, 2);
    var pulse = 0.6 + Math.sin(st.t * 0.12) * 0.4;
    g.fillStyle = 'rgba(127,211,255,' + (alpha * pulse) + ')'; g.fillRect(bx - 5, by - 46, 10, 10);
    g.fillStyle = 'rgba(255,255,255,' + (alpha * pulse) + ')'; g.fillRect(bx - 2, by - 43, 4, 4);
    g.fillStyle = 'rgba(127,211,255,' + alpha + ')'; g.fillRect(bx - 8, by - 70, 4, 2); g.fillRect(bx + 4, by - 70, 4, 2);
  }
  /* ---------- A1: hazard rim. Everything that hurts gets a 1 px coloured outline so it reads against busy backgrounds ---------- */
  var RIM_COL = { snow: '#c8143c', peak: '#c8143c', lake: '#c8143c', ridge: '#c8143c', cabin: '#d81a44', cave: '#ffe08a', haunt: '#ffe08a', space: '#ffd45e', bit8: '#0f380f', mirror: '#ff5a8a' };
  function rimCol(b) { return RIM_COL[b.key] || '#ff3d6e'; }
  var rimCache = new WeakMap();
  function rimImg(img, col) {
    var m = rimCache.get(img); if (!m) { m = {}; rimCache.set(img, m); }
    if (m[col]) return m[col];
    var w = img.width + 2, h = img.height + 2, c = PX.make(w, h), x = c.getContext('2d');
    [[0, 1], [2, 1], [1, 0], [1, 2]].forEach(function (d) { x.drawImage(img, d[0], d[1]); });
    x.globalCompositeOperation = 'source-in'; x.fillStyle = col; x.fillRect(0, 0, w, h);
    x.globalCompositeOperation = 'source-over'; x.drawImage(img, 1, 1);
    return (m[col] = c);
  }
  var rimA = PX.make(W, H), rimAx = roundRects(rimA.getContext('2d')), rimB = PX.make(W, H), rimBx = rimB.getContext('2d');
  rimAx.imageSmoothingEnabled = false;
  /* procedural hazards (vents, fences, mines, fireballs, bars) draw straight into g: render them into a scratch canvas, outline the result */
  function drawRimmed(o, col) {
    var g0 = g, tf = g0.getTransform();
    rimAx.setTransform(1, 0, 0, 1, 0, 0); rimAx.clearRect(0, 0, W, H); rimAx.setTransform(tf);
    rimAx.globalAlpha = 1; g = rimAx;
    try { o.draw(o); } finally { g = g0; }
    rimBx.globalCompositeOperation = 'copy'; rimBx.drawImage(rimA, 0, 0);
    rimBx.globalCompositeOperation = 'source-in'; rimBx.fillStyle = col; rimBx.fillRect(0, 0, W, H);
    rimBx.globalCompositeOperation = 'source-over';
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
    g.drawImage(rimB, -1, 0); g.drawImage(rimB, 1, 0); g.drawImage(rimB, 0, -1); g.drawImage(rimB, 0, 1); g.drawImage(rimA, 0, 0);
    g.restore();
  }
  function isHazard(o) { return !o.pit && !o.safe && !o.gate && o.type !== 'tower' && o.type !== 'house' && !(o.ghost > 0); }
  var darkC = PX.make(W, H), dg = darkC.getContext('2d');
  var LIGHT = (function () { var c = PX.make(64, 64), x = c.getContext('2d'), gr = x.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(0.55, 'rgba(0,0,0,.7)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = gr; x.fillRect(0, 0, 64, 64); return c; })();
  function drawDark(amount, lights) {
    dg.globalCompositeOperation = 'source-over'; dg.clearRect(0, 0, W, H);
    dg.fillStyle = 'rgba(4,2,10,' + (0.86 * amount) + ')'; dg.fillRect(0, 0, W, H);
    dg.globalCompositeOperation = 'destination-out';
    lights.forEach(function (l) { dg.drawImage(LIGHT, Math.round(l[0] - l[2]), Math.round(l[1] - l[2]), l[2] * 2, l[2] * 2); });
    dg.globalCompositeOperation = 'source-over';
    g.drawImage(darkC, 0, 0);
  }
  BIOMES.forEach(function (b) {
    var gc = PX.make(32, H - GY), x = gc.getContext('2d'), r = PX.rng((b.seed || b.at || 0) + 3), gr = b.ground;
    x.fillStyle = gr.dirt; x.fillRect(0, 0, 32, H - GY);
    for (var yy = 4; yy < H - GY; yy++) for (var xx = 0; xx < 32; xx++) if (PX.dither(xx, yy) < (yy - 4) / 40) { x.fillStyle = gr.dirt2; x.fillRect(xx, yy, 1, 1); }
    for (var i = 0; i < 14; i++) { x.fillStyle = gr.speck; x.fillRect(Math.floor(r() * 32), 5 + Math.floor(r() * 20), 2, 1); }
    x.fillStyle = gr.top[1]; x.fillRect(0, 0, 32, 4);
    x.fillStyle = gr.top[0]; x.fillRect(0, 0, 32, 2);
    for (xx = 0; xx < 32; xx += 3) { x.fillStyle = gr.top[(xx / 3) % 2]; x.fillRect(xx, 4, 2, 1 + Math.floor(r() * 2)); }
    x.fillStyle = 'rgba(255,255,255,.6)'; for (xx = 1; xx < 32; xx += 7) x.fillRect(xx, 0, 2, 1);
    if (b.tile) b.tile(x);
    b.groundTile = gc;
  });

  /* ---------- colour grading: per-world ambient tone, horizon haze, vignette, Game Boy palette ---------- */
  var TONES = { home: ['#5a3a9a', 0.18], park: ['#ff9a6a', 0.14], market: ['#ff8a5a', 0.15], xian: ['#ffd8a0', 0.14], sakura: ['#ffb0c8', 0.12],
    cyber: ['#c050ff', 0.16], steam: ['#ffa040', 0.16], desert: ['#ffc070', 0.14], sea: ['#2a8ad8', 0.22], skycity: ['#a0d0ff', 0.1], volcano: ['#ff4a1a', 0.18],
    space: ['#6a4aff', 0.14], mirror: ['#a0a0ff', 0.12], candy: ['#ffb0e0', 0.12], haunt: ['#6a4aa0', 0.2], snow: ['#a0c0ff', 0.12], cabin: ['#ffb080', 0.12],
    ridge: ['#c0d0f0', 0.1], cave: ['#ff8a4a', 0.1], peak: ['#8a8aff', 0.12], lake: ['#ffb0a0', 0.12] };
  BIOMES.forEach(function (b) {
    var tn = TONES[b.key]; if (tn) { b.tone = tn[0]; b.toneA = tn[1]; }
    if (b.key === 'ink' || b.key === 'bit8' || b.key === 'mirror' || b.key === 'space') return;
    var px0 = b.sky.getContext('2d').getImageData(W >> 1, GY - 30, 1, 1).data, hz = PX.make(W, H), hx = hz.getContext('2d');
    var gr = hx.createLinearGradient(0, GY - 76, 0, GY);
    gr.addColorStop(0, 'rgba(' + px0[0] + ',' + px0[1] + ',' + px0[2] + ',0)');
    gr.addColorStop(0.75, 'rgba(' + px0[0] + ',' + px0[1] + ',' + px0[2] + ',.32)');
    gr.addColorStop(1, 'rgba(' + px0[0] + ',' + px0[1] + ',' + px0[2] + ',.12)');
    hx.fillStyle = gr; hx.fillRect(0, GY - 76, W, 76); b.haze = hz;
  });
  var VIG = (function () {
    var c = PX.make(W, H), x = c.getContext('2d'), gr = x.createRadialGradient(W / 2, H / 2 + 8, 50, W / 2, H / 2, 160);
    gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(8,2,20,.45)'); x.fillStyle = gr; x.fillRect(0, 0, W, H); return c;
  })();
  var GBP = [[15, 56, 15], [48, 98, 48], [139, 172, 15], [155, 188, 15]];
  var GBD = new Float32Array(W * H); for (var gi = 0; gi < W * H; gi++) GBD[gi] = (PX.dither(gi % W, (gi / W) | 0) - 0.5) * 0.7;
  var GBR = GBP.map(function (c) { return c[0]; }), GBG = GBP.map(function (c) { return c[1]; }), GBB = GBP.map(function (c) { return c[2]; });
  function gbMap(k) {
    var im = g.getImageData(0, 0, W, H), d = im.data, n = W * H, full = k >= 0.999;
    for (var i = 0, p = 0; i < n; i++, p += 4) {
      var q = ((d[p] * 0.01176 + d[p + 1] * 0.02314 + d[p + 2] * 0.004314) + GBD[i]) | 0; /* = floor(luma * 4 + dither) */
      if (q < 0) q = 0; else if (q > 3) q = 3;
      if (full) { d[p] = GBR[q]; d[p + 1] = GBG[q]; d[p + 2] = GBB[q]; }
      else { d[p] += (GBR[q] - d[p]) * k; d[p + 1] += (GBG[q] - d[p + 1]) * k; d[p + 2] += (GBB[q] - d[p + 2]) * k; }
    }
    g.putImageData(im, 0, 0);
  }
  function gradeWorld(b, k) {
    if (!b || k <= 0.01) return;
    if (b.tone) { g.save(); g.globalCompositeOperation = 'soft-light'; g.globalAlpha = b.toneA * k; g.fillStyle = b.tone; g.fillRect(0, 0, W, H); g.restore(); }
    if (b.gb) gbMap(k);
  }

  /* ---------- audio ---------- */
  function beep(f, d, type, vol, slide) { if (window.SND) SND.beep(f, d, type, vol, slide); }
  var duckAt = 0; function duckM() { var n = Date.now(); if (n - duckAt > 90 && window.SND && SND.duck) { duckAt = n; SND.duck(); } }
  var SFX = {
    jump: function () { beep(420, 0.12, 'square', 0.04, 760); duckM(); },
    jump2: function () { beep(620, 0.12, 'square', 0.04, 1100); },
    shard: function () { duckM(); beep(988, 0.06, 'square', 0.04); setTimeout(function () { beep(1319, 0.1, 'square', 0.04); }, 60); },
    hit: function () { beep(220, 0.3, 'sawtooth', 0.06, 60); duckM(); },
    shield: function () { beep(880, 0.2, 'triangle', 0.07, 300); },
    rift: function () { beep(200, 0.6, 'triangle', 0.06, 1200); },
    select: function () { beep(660, 0.05, 'square', 0.03); }
  };

  SFX.flip = function () { beep(300, 0.12, 'square', 0.04, 900); };
  SFX.ready = function () { beep(1320, 0.07, 'square', 0.03); setTimeout(function () { beep(1760, 0.1, 'square', 0.03); }, 70); };
  SFX.heal = function () { beep(660, 0.14, 'triangle', 0.05, 990); };
  SFX.slow = function () { beep(880, 0.25, 'triangle', 0.05, 220); };
  SFX.swim = function () { beep(520, 0.09, 'sine', 0.05, 300); };
  SFX.shoot = function () { beep(1200, 0.06, 'square', 0.04, 500); }; /* +4 dB */
  SFX.kill = function () { beep(300, 0.12, 'square', 0.04, 80); if (window.SND) SND.noise(0.12, 0.08, 1500); setTimeout(function () { beep(1568, 0.06, 'square', 0.03); }, 60); };
  SFX.power = function () { [523, 659, 784, 1047].forEach(function (f, i) { setTimeout(function () { beep(f, 0.08, 'square', 0.035); }, i * 55); }); };
  SFX.spring = function () { beep(200, 0.25, 'triangle', 0.07, 900); };
  SFX.wall = function () { beep(700, 0.07, 'square', 0.03, 1000); };
  SFX.slide = function () { if (window.SND) SND.noise(0.18, 0.16, 900); beep(160, 0.08, 'triangle', 0.03, 110); }; /* +10 dB, plus a soft thump */
  SFX.land = function () { beep(110, 0.05, 'triangle', 0.05, 70); };
  SFX.dash = function () { beep(180, 0.4, 'sawtooth', 0.04, 900); };
  /* ---------- state ---------- */
  var best = +(localStorage.getItem('runner-best') || 0);
  var st = { mode: 'title', sel: 0, t: 0, trow: 0, msel: 0, pcur: 0, acur: 0, pbi: -1 };
  /* ---------- phase3 meta: practice (G10), album (G6), badges (G7) - all local, nothing is sent anywhere ---------- */
  function lsGet(k, d) { try { var v = JSON.parse(localStorage.getItem(k)); return v === null || v === undefined ? d : v; } catch (e) { return d; } }
  function lsSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } }
  var ALBUM = lsGet('runner-album', {}), BADGES = lsGet('runner-badges', {});
  var MENUS = { practice: 1, album: 1, badges: 1 };
  var ALBUM_ROOMS = ['apt', 'tea', 'lodge', 'cabin', 'party', 'court'];
  var BADGE_DEF = [{ bit: 1, n: 'NO HIT', col: '#7fe0ff' }, { bit: 2, n: '90% SHARDS', col: '#ffd45e' }, { bit: 4, n: '5 KILLS', col: '#ff8a3a' }];
  function freshWst() { return { hits: 0, got: 0, miss: 0, kills: 0 }; }
  function toast(G, text, col) { if (!G) return; (G.toasts = G.toasts || []).push({ text: text, col: col || '#ffd45e', t: 0 }); }
  var game;
  function newGame() {
    var id = PX.ORDER[st.sel], pbi = st.pbi >= 0 && BIOMES[st.pbi] && !BIOMES[st.pbi].roam ? st.pbi : -1;
    game = {
      id: id, x: 58, y: GY, vy: 0, gdir: 1, hp: id === 'Feline1' ? 4 : 3, maxHp: id === 'Feline1' ? 4 : 3, regenAt: 0, gFlash: 0, slowT: 0, slowCd: 0, grace: 0, airFlip: false, cps: [], onGround: true, jumps: 0, holdT: 0, coyote: 0, buffer: 0, gliding: false,
      shield: id === 'X0' ? 1 : 0, shieldAt: 0, inv: 0, dist: 0, shards: 0, speed: 1.7, scroll: 0,
      obs: [], items: [], parts: [], gap: 140, hist: [], biome: 0, loop: 0, bossT: 120, bossThrow: 0, prevBiome: -1, blend: 1, flash: 0, banner: null,
      shake: 0, dieT: 0, frame: 0, nextMilestone: 100, combo: 0,
      plats: [], shots: [], fireCd: 0, setCd: 2, setIdx: 0, sliding: false, dropT: 0, sq: 0, onPlat: null, climb: null, fadeIn: 24, pop: null,
      magnet: 0, x2: 0, rocket: 0, bubble: 0, shieldF: 0, regenF: 0, tips: {}, slot: 0, houseAt: null, lap0: { f: 0, s: 0, d: 0 },
      practice: null, wst: freshWst(), lapSt: { hits: 0, got: 0, miss: 0 }, toasts: [], toyMem: {}, newBadges: []
    };
    PLANS = []; CAMY = 0;
    if (pbi >= 0) { /* G10 practice: start at the beginning of the chosen world (lap-1 layout and speed), end at its exit */
      var P0 = plan(0), sl = P0.order.indexOf(pbi);
      game.practice = { bi: pbi, slot: sl }; game.slot = sl; game.biome = pbi; game.dist = P0.starts[sl] + 0.5; game.nextMilestone = 1e9;
    }
    armHouse(game); cp(game, BIOMES[game.biome].key);
    for (var i = 0; i < 80; i++) game.hist.push([GY, 1]);
    showBanner(BIOMES[game.biome].name, game.practice ? 'PRACTICE · ' + BIOMES[game.biome].en : BIOMES[game.biome].en, game.practice ? game.biome : undefined);
    if (window.SND) SND.world(game.biome, true);
    st.mode = 'play'; seenRun = onScreen; autoPaused = false; game.hintF = 0; countHint(game);
    emit(game.practice ? { type: 'start', id: id, practice: true } : { type: 'start', id: id });
  }
  function showBanner(cn, en, bi) { if (game) game.banner = { cn: cn, en: en, t: 0, bi: bi === undefined ? -1 : bi }; }
  function emit(dash) { window.dispatchEvent(new CustomEvent('runner', { detail: dash })); }

  /* ---------- input ---------- */
  var holding = false, pressed = false, downHeld = false, downPressed = false, leftHeld = false, rightHeld = false, fireHeld = false, nudge = 0;
  function press() { pressed = true; holding = true; }
  function release() { holding = false; }
  var locked = false; /* set by the leaderboard while its name box is open: no new run can start */
  function kick() { if (!loopOn) { loopOn = true; last = performance.now(); acc = 0; requestAnimationFrame(frame); } } /* input while off-screen restarts the loop */
  function onAction(px, py) {
    kick();
    if (locked && st.mode !== 'play') return;
    if (MENUS[st.mode]) { if (py !== undefined) menuTap(px, py); else menuConfirm(); return; }
    if (st.mode === 'title') {
      if (py !== undefined && py >= 132 && py < 147) { var mi = Math.floor((px - 34) / 60); if (mi >= 0 && mi < 3 && px - 34 - mi * 60 < 54) { st.trow = 1; st.msel = mi; openMenu(mi); } return; }
      if (py !== undefined && py > 52 && py < 128) {
        var slot = Math.floor((px - 30) / 60);
        if (slot >= 0 && slot < 3) { st.trow = 0; if (slot !== st.sel) { st.sel = slot; SFX.select(); return; } }
      }
      if (py === undefined && st.trow === 1) { openMenu(st.msel); return; }
      st.pbi = -1; newGame(); return;
    }
    if (st.mode === 'over') { if (st.t > 30) newGame(); return; } /* st.pbi still set after practice: AGAIN replays that world */
    if (st.mode === 'paused') {
      if (py !== undefined) { var pi2 = Math.floor((py - 66) / 18); if (pi2 >= 0 && pi2 < 3) st.psel = pi2; else return; }
      pauseChoose(); return;
    }
    press();
  }
  function canvasPos(e) {
    var r = cv.getBoundingClientRect(), p = e.touches ? e.touches[0] : e;
    return [(p.clientX - r.left) / r.width * W, (p.clientY - r.top) / r.height * H];
  }
  cv.addEventListener('pointerdown', function (e) { e.preventDefault(); cv.focus(); var p = canvasPos(e); onAction(p[0], p[1]); });
  window.addEventListener('pointerup', release);
  window.addEventListener('pointercancel', release);
  function pauseChoose() { autoPaused = false; var s = st.psel || 0; if (s === 0) st.mode = 'play'; else if (s === 1) newGame(); else { st.mode = 'title'; st.t = 0; } SFX.select(); }
  function bButton() {
    kick();
    if (MENUS[st.mode]) { if (st.zoom) st.zoom = false; else menuBack(); return; }
    if (st.mode === 'over' && game && game.practice) { st.mode = 'practice'; st.t = 0; return; }
    if (st.mode === 'title' && st.trow === 1) { st.trow = 0; SFX.select(); return; }
    if (st.mode === 'title') { st.sel = (st.sel + 1) % 3; SFX.select(); }
    else if (st.mode === 'play') { st.mode = 'paused'; st.psel = 0; }
    else if (st.mode === 'paused') st.mode = 'play';
    else if (st.mode === 'over') { st.mode = 'title'; st.t = 0; }
  }
  function dpad(dir) {
    kick();
    if (MENUS[st.mode]) { if (!st.zoom) menuNav(dir); return; }
    if (st.mode === 'title' && (dir === 'down' || (dir === 'up' && st.trow === 1))) { st.trow = dir === 'down' ? 1 - st.trow : 0; SFX.select(); return; }
    if (st.mode === 'title' && st.trow === 1 && (dir === 'left' || dir === 'right')) { st.msel = (st.msel + (dir === 'left' ? 2 : 1)) % 3; SFX.select(); return; }
    if (st.mode === 'paused' && (dir === 'up' || dir === 'down')) { st.psel = ((st.psel || 0) + (dir === 'up' ? 2 : 1)) % 3; SFX.select(); return; }
    if (dir === 'up') { onAction(); return; }
    if (st.mode === 'play') {
      if (dir === 'down') { downPressed = true; downHeld = true; } /* released by hold('down', false) */
      else nudge += dir === 'left' ? -14 : 14;
      return;
    }
    if (st.mode === 'title' && (dir === 'left' || dir === 'right')) { st.sel = (st.sel + (dir === 'left' ? 2 : 1)) % 3; SFX.select(); }
    else if (st.mode === 'over' && dir === 'down') { st.mode = 'title'; st.t = 0; }
  }
  /* keyboard: Z = A (jump / confirm), X = B (select / pause), A = SKILL, S = FIRE, arrows move, DOWN crouches.
     Space / Up / Enter also jump-confirm; P / Esc also pause; M toggles sound. No WASD aliases. */
  function keyOf(e) { return e.key && e.key.length === 1 ? e.key.toLowerCase() : e.key; }
  cv.addEventListener('keydown', function (e) {
    var k = keyOf(e); kick();
    if (MENUS[st.mode] || (st.mode === 'title' && (k === 'ArrowDown' || (k === 'ArrowUp' && st.trow === 1)))) {
      if (k === 'ArrowUp' || k === 'ArrowDown' || k === 'ArrowLeft' || k === 'ArrowRight') { e.preventDefault(); dpad(k.slice(5).toLowerCase()); return; }
      if (k === ' ' || k === 'Enter' || k === 'z') { e.preventDefault(); if (!e.repeat) onAction(); return; }
      if (k === 'Escape' || k === 'x' || k === 'p' || k === 'Backspace') { e.preventDefault(); bButton(); return; }
    }
    if (st.mode === 'paused') {
      if (k === 'ArrowUp' || k === 'ArrowDown') { e.preventDefault(); dpad(k === 'ArrowUp' ? 'up' : 'down'); return; }
      if (k === ' ' || k === 'Enter' || k === 'z') { e.preventDefault(); if (!e.repeat) pauseChoose(); return; }
      if (k === 'Escape' || k === 'x' || k === 'p') { st.mode = 'play'; return; }
    }
    if (k === ' ' || k === 'ArrowUp' || k === 'Enter' || k === 'z') {
      e.preventDefault(); if (!e.repeat) onAction();
    } else if (st.mode === 'play' && (k === 'ArrowLeft' || k === 'ArrowRight' || k === 'ArrowDown')) {
      e.preventDefault();
      if (k === 'ArrowDown') { if (!e.repeat) downPressed = true; downHeld = true; }
      else if (k === 'ArrowLeft') leftHeld = true; else rightHeld = true;
    } else if (st.mode === 'play' && k === 'a') { e.preventDefault(); if (!e.repeat) skill(); }
    else if (st.mode === 'play' && k === 's') { e.preventDefault(); fireHeld = true; if (!e.repeat) fire(); }
    else if (k === 'ArrowLeft' || k === 'ArrowRight' || k === 'ArrowDown') {
      e.preventDefault(); dpad(k === 'ArrowLeft' ? 'left' : k === 'ArrowRight' ? 'right' : 'down');
    } else if (st.mode === 'title' && '123'.indexOf(k) >= 0) { st.sel = +k - 1; SFX.select(); }
    else if (k === 'Escape' || k === 'p') { if (st.mode === 'play') { st.mode = 'paused'; st.psel = 0; } else if (k === 'Escape') { if (st.mode !== 'title') { st.mode = 'title'; st.t = 0; } } else bButton(); }
    else if (k === 'x') { e.preventDefault(); if (!e.repeat) bButton(); }
    else if (k === 'm') toggleMute();
  });
  cv.addEventListener('keyup', function (e) {
    var k = keyOf(e);
    if (k === ' ' || k === 'ArrowUp' || k === 'Enter' || k === 'z') release();
    if (k === 'ArrowDown') downHeld = false;
    if (k === 'ArrowLeft') leftHeld = false;
    if (k === 'ArrowRight') rightHeld = false;
    if (k === 's') fireHeld = false;
  });
  window.addEventListener('blur', function () { downHeld = leftHeld = rightHeld = fireHeld = holding = false; swDown = false; });
  /* touch: swipe down on the screen = down action */
  var swY = null, swDown = false;
  cv.addEventListener('pointerdown', function (e) { swY = e.clientY; });
  cv.addEventListener('pointermove', function (e) {
    if (swY !== null && st.mode === 'play' && e.clientY - swY > 28) { swY = null; swDown = true; downPressed = true; downHeld = true; holding = false; } /* swipe-and-hold: crouch until the finger lifts */
  });
  ['pointerup', 'pointercancel'].forEach(function (ev) { window.addEventListener(ev, function () { swY = null; if (swDown) { swDown = false; downHeld = false; } }); });
  document.addEventListener('visibilitychange', function () { if (document.hidden && st.mode === 'play') { st.mode = 'paused'; st.psel = 0; } });
  function toggleMute() { if (window.SND) SND.toggle(); }

  /* ---------- spawning ---------- */
  /* G2 difficulty curve: sky city was the hardest world of lap 1, the last five worlds were the easiest.
     GAPMUL scales the gap between normal spawns; loose-shard rows are scaled by the same factor so shard totals stay put. */
  var GAPMUL = { skycity: 1.45, snow: 0.86, cabin: 0.84, ridge: 0.82, cave: 0.82, lake: 0.8 };
  var MAXHAZ = { skycity: 5 };
  function wprog(G) { return 1 - toBoundary() / BIOMES[G.biome].len; } /* 0..1 through the current world */
  function hazOnScreen(G) { var n = 0; for (var i = 0; i < G.obs.length; i++) { var o = G.obs[i]; if (!o.safe && !o.pit && !o.ghost && o.x > -24) n++; } return n; }
  function spawn() {
    var mode = BIOMES[game.biome].mode || 'run', G0 = game, mh = MAXHAZ[BIOMES[game.biome].key];
    if (mh && hazOnScreen(G0) >= mh) { G0.gap = 24; return; }
    if (G0.houseAt && mode === 'run' && G0.blend >= 1 && !G0.climb && G0.dist >= G0.houseAt.at && toBoundary() > 150) { var th = G0.houseAt.theme; G0.houseAt = null; setPiece(mode, 'house', th); return; }
    if (game.blend >= 1 && --game.setCd <= 0 && !game.climb && toBoundary() > PIT_SAFE + 30) { if (setPiece(mode)) return; }
    if (mode === 'fly') spawnFly(); else if (mode === 'jet') spawnJet(); else if (mode === 'flip') spawnFlip(); else if (mode === 'swim') spawnSwim(); else spawnRun();
    game.gap *= GAPMUL[BIOMES[game.biome].key] || 1;
  }
  /* G2: each of the last five worlds has a short climax between 60 % and 80 % of its length (no shards in it) */
  var CLIMAX = { snow: 'pack', cabin: 'logs', ridge: 'icefall', cave: 'swarm', lake: 'crack' };
  var CLIMAX_TXT = { pack: 'WOLF PACK!', logs: 'ROLLING LOGS!', icefall: 'ICEFALL!', swarm: 'BAT SWARM!', crack: 'THE ICE CRACKS!' };
  function climax(G, kind) {
    var x = W + 12, i, k = G.loop + ':' + G.slot;
    if (G.climaxAt !== k) { G.climaxAt = k; popText(CLIMAX_TXT[kind], '#ff8a5a'); beep(330, 0.25, 'sawtooth', 0.04, 160); }
    if (kind === 'pack') { var n = 2 + (R() < 0.5 ? 1 : 0); for (i = 0; i < n; i++) G.obs.push({ type: 'wolf', anim: P.wolf, x: x + i * 34, y: GY, w: 22, h: 13, vx: 0.9, hb: [3, 4, 4, 1] }); G.gap = 120 + n * 34 + G.speed * 18; }
    else if (kind === 'logs') { G.obs.push({ type: 'log', x: x, y: GY, w: 14, h: 13, vx: 1.15, rot: 0, hb: [2, 2, 2, 0], draw: drawLog, upd: function (o) { o.rot += 0.18; } }); G.gap = 110 + R() * 50 + G.speed * 16; }
    else if (kind === 'icefall') { spawnIce(); if (R() < 0.6) { spawnIce(); game.obs[game.obs.length - 1].x += 46; } G.gap = 120 + R() * 40 + G.speed * 16; }
    else if (kind === 'swarm') { for (i = 0; i < 4; i++) { var fy = GY - 36 - Math.floor(R() * 26); G.obs.push({ type: 'bat', anim: P.bat, x: x + i * 22, y: fy, w: 16, h: 10, vx: 0.6, fly: true, base: fy, hb: [3, 2, 3, 2] }); } G.gap = 150 + G.speed * 16; }
    else if (kind === 'crack') { if (toBoundary() < PIT_SAFE + 40) { G.gap = 40; return; } var pw = 16 + Math.floor(G.speed * 3); G.obs.push({ type: 'pit', pit: true, x: x, y: GY, w: pw, h: 0 }); G.obs.push({ type: 'pit', pit: true, x: x + pw + 40, y: GY, w: pw, h: 0 }); G.gap = 2 * pw + 40 + 120 + G.speed * 16; }
  }
  function drawLog(o) {
    var X = Math.round(o.x), Y = Math.round(o.y - o.h), r = o.rot;
    g.fillStyle = '#5a3418'; g.fillRect(X + 2, Y, 10, 13); g.fillRect(X, Y + 2, 14, 9); g.fillRect(X + 1, Y + 1, 12, 11);
    g.fillStyle = '#c8904a'; g.fillRect(X + 3, Y + 2, 8, 9); g.fillRect(X + 2, Y + 3, 10, 7);
    g.fillStyle = '#8a5a2a'; g.fillRect(X + 5, Y + 4, 4, 5);
    g.fillStyle = '#5a3418'; g.fillRect(Math.round(X + 7 + Math.cos(r) * 4), Math.round(Y + 6 + Math.sin(r) * 4), 1, 1); g.fillRect(Math.round(X + 7 - Math.cos(r) * 3), Math.round(Y + 6 - Math.sin(r) * 3), 1, 1);
    g.fillStyle = '#ffffff'; g.fillRect(X + 3, Y + 1, 3, 1);
  }
  /* metres left until the next world boundary */
  function toBoundary() { var G = game; return slotEnd(G.loop, G.slot) - G.dist; }
  var PIT_SAFE = 60; /* no pit may spawn this close to a boundary: it would still be on screen at the switch */
  function pitNear(G) { for (var i = 0; i < G.obs.length; i++) { var o = G.obs[i]; if (o.pit && o.x < W && o.x + o.w > G.x - 12) return true; } return false; }
  function spawnRun() {
    var b = BIOMES[game.biome], list = b.obstacles, type = list[Math.floor(R() * list.length)], o, ck = CLIMAX[b.key], wp = wprog(game);
    if (ck && game.loop >= 0 && wp > 0.6 && wp < 0.8) { climax(game, ck); return; }
    var x = W + 12;
    if (b.custom && b.custom[type]) { o = b.custom[type](x); o.type = o.type || type; }
    else if (type === 'cone') o = { type: type, img: P.cone, x: x, y: GY, w: 8, h: 8, hb: [1, 1, 1, 0] };
    else if (type === 'box') o = { type: type, img: P.box, x: x, y: GY, w: 16, h: 13, hb: [1, 2, 1, 0] };
    else if (type === 'spike') { var sp = spikes[Math.floor(R() * spikes.length)]; o = { type: type, img: sp, x: x, y: GY, w: sp.width, h: sp.height, hb: [2, 4, 2, 0] }; }
    else if (type === 'wolf') o = { type: type, anim: P.wolf, x: x, y: GY, w: 22, h: 13, vx: 0.9, hb: [3, 4, 4, 1] };
    else if (type === 'beetle') o = { type: type, anim: P.beetle, x: x, y: GY, w: 14, h: 9, vx: 0.25, hb: [1, 1, 1, 0] };
    else if (type === 'inkrock') { var ir = inkRocks[Math.floor(R() * inkRocks.length)]; o = { type: type, img: ir, x: x, y: GY, w: ir.width, h: ir.height, hb: [2, 4, 2, 0] }; }
    else if (type === 'rock') { var rk = rocks[Math.floor(R() * rocks.length)]; o = { type: type, img: rk, x: x, y: GY, w: rk.width, h: rk.height, hb: [2, 4, 2, 0] }; }
    else if (type === 'pit') o = { type: type, pit: true, x: x, y: GY, w: 18 + Math.floor(R() * 10) + Math.floor(game.speed * 3), h: 0 };
    else { var fy = GY - 32 - Math.floor(R() * 12); o = { type: type, anim: type === 'crow' ? P.crow : type === 'inkcrow' ? inkCrow : P.bat, x: x, y: fy, w: type === 'bat' ? 16 : 14, h: 10, vx: 0.5, fly: true, base: fy, hb: [3, 2, 3, 2] }; }
    if (o.pit && toBoundary() < PIT_SAFE) { game.gap = 40; return; }
    game.obs.push(o);
    if (!o.fly && !o.pit && R() < 0.22 && game.dist > 120) {
      var o2 = Object.assign({}, o, { x: x + o.w + 4 + Math.floor(R() * 6) });
      if (o.type === 'spike' || o.type === 'rock') { var pool = o.type === 'spike' ? spikes : rocks; o2.img = pool[Math.floor(R() * pool.length)]; o2.w = o2.img.width; o2.h = o2.img.height; }
      game.obs.push(o2);
    }
    if (R() < 0.41 * (GAPMUL[b.key] || 1)) { /* 0.45 before phase 3: a little headroom under the server's shard caps */
      var n = 3 + Math.floor(R() * 3), arc = o.fly ? 0 : 1;
      for (var i = 0; i < n; i++) {
        var t = n === 1 ? 0.5 : i / (n - 1);
        game.items.push({ x: x - 12 + i * 11, y: arc ? GY - 30 - Math.sin(t * Math.PI) * 22 : GY - 14, ph: R() * 6 });
      }
    }
    var lz = game.loop === 0 ? 1.3 : game.loop === 1 ? 1.1 : Math.max(0.85, 1 - (game.loop - 2) * 0.05); /* first lap is airy, density ramps per lap */
    game.gap = (86 + R() * 110 + game.speed * 24) * lz + (o.pit ? o.w : 0);
  }
  function shardRow(x, y, n, dx) { for (var i = 0; i < n; i++) game.items.push({ x: x + i * dx, y: y, ph: R() * 6 }); }
  var ROCKS_X = [0, 1, 2].map(function (k) { var w = 14 + k * 6, c = PX.make(w, w), x = c.getContext('2d'), r = PX.rng(870 + k); xianIsleTo(x, w, r); return c; });
  function xianIsleTo(x, w, r) { for (var yy = 0; yy < w; yy++) { var half = Math.round(w / 2 * Math.pow(1 - yy / w, 0.7)); x.fillStyle = yy < 2 ? '#7ac27a' : (yy < 3 ? '#3a5e4a' : '#5a5e7e'); x.fillRect(w / 2 - half, yy, half * 2, 1); } x.fillStyle = '#1a1030'; x.fillRect(0, 0, w, 0); }
  function spawnSword() {
    var G = game, x = W + 12, k = R();
    if (wprog(G) < 0.3) k = R() < 0.22 ? R() * 0.4 : 0.4 + R() * 0.4; /* G2: the first stretch of sword flight is rocks and qi rings only (ring share tuned so the shard rate stays the same) */
    if (k < 0.4) { /* qi rings on a sine path */
      var cy = 50 + R() * 50; for (var i = 0; i < 4; i++) G.items.push({ x: x + i * 34, y: cy + Math.sin(i * 1.1) * 18, ph: 0, ring: 1 });
      G.gap = 170; return;
    }
    if (k < 0.8) { /* drifting floating rocks */
      var n = 1 + Math.floor(R() * 2);
      for (var j = 0; j < n; j++) { var im = ROCKS_X[Math.floor(R() * 3)], ry = 36 + R() * 80; G.obs.push({ type: 'isle', img: im, x: x + j * 60, y: ry + im.height, base: ry + im.height, ph: R() * 6, w: im.width, h: im.height, vx: 0.2, hb: [2, 2, 2, 3], upd: function (o) { o.y = o.base + Math.sin(G.frame * 0.03 + o.ph) * 8; } }); }
      shardRow(x + 20, 40 + R() * 70, 3, 12); G.gap = 120 + R() * 40; return;
    }
    var fy = 46 + R() * 70; for (var t = 0; t < 3; t++) G.obs.push({ type: 'talisman', img: talisman, x: x + t * 26, y: fy + t * 6, base: fy + t * 6, ph: R() * 6, w: talisman.width, h: talisman.height, vx: 0.6, hb: [0, 0, 0, 0], upd: function (o) { o.y = o.base + Math.sin(G.frame * 0.06 + o.ph) * 14; } });
    G.gap = 130;
  }
  function spawnFly() {
    var G = game, x = W + 12, b = BIOMES[G.biome], fl = b.flyer || talisman;
    if (b.sub === 'sword') { spawnSword(); return; }
    if (b.sub === 'balloon' && R() < 0.3 && hazOnScreen(G) <= 1) { var by0 = 40 + R() * 60; for (var q = 0; q < 4; q++) G.obs.push({ type: 'bird', anim: P.crow, x: x + q * 14, y: by0 + (q % 2) * 8, base: by0 + (q % 2) * 8, w: 14, h: 10, vx: 1.2, fly: true, hb: [3, 2, 3, 2] }); G.gap = 120; return; }
    if (R() < 0.25) {
      var n = 2 + Math.floor(R() * 2);
      for (var i = 0; i < n; i++) { var fy = 46 + R() * 70; G.obs.push({ type: 'talisman', img: fl, x: x + i * 30, y: fy, base: fy, ph: R() * 6, w: fl.width, h: fl.height, vx: 0.5, hb: [0, 0, 0, 0], upd: function (o) { o.y = o.base + Math.sin(G.frame * 0.06 + o.ph) * 14; } }); }
      shardRow(x + 10, 40 + R() * 70, 3, 12);
      G.gap = 100 + R() * 40; return;
    }
    var gapH = Math.max(62, 76 - G.loop * 4), c = 50 + R() * 64, tb = Math.round(c - gapH / 2), bt = Math.round(c + gapH / 2);
    G.obs.push({ type: 'pillar', x: x, y: tb, w: 18, h: tb, cap: 'bottom', hb: [1, 0, 1, 0], draw: b.pillarDraw || drawPillar });
    G.obs.push({ type: 'pillar', x: x, y: H + 2, w: 18, h: H + 2 - bt, cap: 'top', hb: [1, 0, 1, 0], draw: b.pillarDraw || drawPillar });
    if (R() < 0.75) shardRow(x + 5, c - 4, 1, 0);
    G.gap = 118 + R() * 44 + G.speed * 10;
  }
  function spawnJet() {
    var G = game, x = W + 12, r = R(), b = BIOMES[G.biome], pd = b.pipeDraw || drawPipe;
    if (r < 0.5) {
      var kind = R(), gapH = Math.max(64, 76 - G.loop * 4);
      if (kind < 0.45) {
        var c = 50 + R() * 34, tb = Math.round(c - gapH / 2), bt = Math.round(c + gapH / 2);
        G.obs.push({ type: 'pipe', x: x, y: tb, w: 16, h: tb, cap: 'bottom', hb: [0, 0, 0, 0], draw: pd });
        G.obs.push({ type: 'pipe', x: x, y: GY, w: 16, h: GY - bt, cap: 'top', hb: [0, 0, 0, 0], draw: pd });
        shardRow(x + 4, c - 4, 1, 0);
      } else if (kind < 0.75) {
        var hh = 74 + Math.floor(R() * 24);
        G.obs.push({ type: 'pipe', x: x, y: hh, w: 16, h: hh, cap: 'bottom', hb: [0, 0, 0, 0], draw: pd });
        shardRow(x - 6, GY - 14, 3, 12);
      } else {
        var bh = 48 + Math.floor(R() * 30);
        G.obs.push({ type: 'pipe', x: x, y: GY, w: 16, h: bh, cap: 'top', hb: [0, 0, 0, 0], draw: pd });
        shardRow(x - 6, GY - bh - 22, 3, 12);
      }
    } else if (r < 0.75) {
      var gy = 50 + R() * 64;
      G.obs.push({ type: 'gear', x: x, y: gy + 11, base: gy + 11, ph: R() * 6, w: 22, h: 22, hb: [4, 4, 4, 4], draw: b.gearDraw || drawGearHaz, upd: function (o) { o.y = o.base + Math.sin(G.frame * 0.04 + o.ph) * 16; } });
    } else {
      G.obs.push({ type: 'vent', x: x, y: GY, w: 14, h: 84, ph: Math.floor(R() * 60), cyc: 0, hb: [3, 0, 3, 0], draw: b.ventDraw || drawVent, upd: function (o) { o.cyc = (G.frame + o.ph) % 110; o.on = o.cyc > 64; o.safe = !o.on; } });
      shardRow(x + 3, 46, 1, 0);
    }
    G.gap = 112 + R() * 50 + G.speed * 10;
  }
  function spawnFlip() {
    var G = game, x = W + 12, b = BIOMES[G.biome], dr = b.droneAnim || drone;
    function fence(ceil, xx) { var h = 18 + Math.floor(R() * 12); G.obs.push({ type: 'fence', x: xx, y: ceil ? CY + h : GY, w: 10, h: h, ceil: ceil, hb: [1, 0, 1, 0], draw: b.fenceDraw || drawFence }); }
    if (R() < 0.78) {
      var first = R() < 0.5;
      fence(first, x);
      shardRow(x - 2, first ? GY - 14 : CY + 6, 2, 10);
      if (R() < 0.45) { var x2 = x + 84 + R() * 30; fence(!first, x2); shardRow(x2 - 2, first ? CY + 6 : GY - 14, 2, 10); x = x2; }
    } else {
      var dy = 66 + R() * 30;
      G.obs.push({ type: 'drone', anim: dr, x: x, y: dy, base: dy, ph: R() * 6, w: dr[0].width, h: dr[0].height, vx: 0.4, fly: false, hb: [1, 0, 1, 0], upd: function (o) { o.y = o.base + Math.sin(G.frame * 0.05 + o.ph) * 26; } });
    }
    G.gap = (x - W - 12) + 104 + R() * 50 + G.speed * 10;
  }
  function spawnSwim() {
    var G = game, x = W + 12, r = R(), b = BIOMES[G.biome], ja = b.jellyAnim || jelly, ca = b.crabAnim || crab, cl = b.coral || coral, stl = b.stal || stal;
    if (r < 0.35) {
      var fy = 50 + R() * 60;
      G.obs.push({ type: 'jelly', anim: ja, x: x, y: fy, base: fy, ph: R() * 6, w: ja[0].width, h: ja[0].height, vx: 0.15, hb: [2, 1, 2, 3], upd: function (o) { o.y = o.base + Math.sin(G.frame * 0.04 + o.ph) * 14; } });
      shardRow(x, fy > 80 ? 36 : GY - 16, 2, 12);
    } else if (r < 0.58) {
      var by = 60 + R() * 50;
      G.obs.push({ type: 'mine', x: x, y: by + 6, w: 12, h: 12, hb: [1, 1, 1, 1], draw: b.mineDraw || drawMine });
      shardRow(x + 2, by > 85 ? 34 : GY - 14, 1, 0);
    } else if (r < 0.72) {
      G.obs.push({ type: 'crab', anim: ca, x: x, y: GY, w: ca[0].width, h: ca[0].height, vx: 0.3, hb: [1, 1, 1, 0] });
    } else {
      var cr = cl[Math.floor(R() * cl.length)], sl = stl[Math.floor(R() * stl.length)];
      G.obs.push({ type: 'coral', img: cr, x: x, y: GY, w: cr.width, h: cr.height, hb: [2, 4, 2, 0] });
      G.obs.push({ type: 'stal', img: sl, x: x + 2, y: sl.height, w: sl.width, h: sl.height, hb: [2, 0, 2, 4] });
      shardRow(x + 2, (sl.height + GY - cr.height) / 2 - 4, 1, 0);
    }
    G.gap = 100 + R() * 50 + G.speed * 10;
  }
  function spawnIce() {
    var k = Math.floor(R() * spikes.length), sp = spikes[k];
    game.obs.push({ type: 'ice', img: sp, fall: icicles[k], x: W + 4 + R() * 30, y: -2, w: sp.width, h: sp.height, vy: 1, warn: 28, hb: [2, 3, 2, 0] });
  }
  function particle(x, y, vx, vy, life, col, size, grav) { game.parts.push({ x: x, y: y, vx: vx, vy: vy, life: life, max: life, col: col, s: size || 1, gr: grav === undefined ? 0.08 : grav }); }
  function burst(x, y, n, cols, spd) { for (var i = 0; i < n; i++) { var a = R() * Math.PI * 2, s = (spd || 1.6) * (0.3 + R()); particle(x, y, Math.cos(a) * s, Math.sin(a) * s - 0.6, 20 + R() * 20, cols[i % cols.length], R() < 0.3 ? 2 : 1); } }

  /* ================= overhaul: set pieces, platforms, wall-climb, shooting, power-ups, skills ================= */
  var GUN = { xian: 1, bit8: 1, skycity: 1, volcano: 1, space: 1, haunt: 1, peak: 1 };
  /* per-world set-piece rotation (run worlds get platform/climb/slide pieces; others get item & arena moments) */
  var SETS = {
    home: ['stairs', 'gift', 'bars', 'springs'], park: ['stairs', 'springs', 'gift', 'bridge'], market: ['bars', 'stairs', 'shaft', 'gift'],
    xian: ['arena', 'gift', 'arena'], ink: ['bridge', 'springs', 'stairs', 'gift'], sakura: ['stairs', 'shaft', 'gift', 'springs'],
    cyber: ['dualgate', 'gift', 'chain'], bit8: ['arena', 'stairs', 'springs', 'arena'], steam: ['valves', 'gift', 'geartunnel'], desert: ['bridge', 'bars', 'shaft', 'gift'],
    sea: ['current', 'gift', 'bubblecol'], skycity: ['arena', 'gift'], volcano: ['arena', 'bridge', 'springs', 'arena'], space: ['arena', 'valves', 'gift', 'geartunnel'],
    mirror: ['mirrormaze', 'gift', 'dualgate'], candy: ['jellybounce', 'gift', 'pinwheel'], haunt: ['arena', 'bars', 'shaft', 'arena'], snow: ['stairs', 'springs', 'bridge', 'gift'],
    cabin: ['gift', 'stairs', 'springs'], ridge: ['shaft', 'bridge', 'bars', 'gift'], cave: ['bars', 'stairs', 'gift', 'shaft'],
    peak: ['arena', 'gift'], lake: ['stairs', 'gift', 'bridge', 'shaft']
  };
  var PWK = ['magnet', 'x2', 'bubble', 'rocket'];
  var PWD = {
    magnet: { col: '#ff4f7a', t: 600, label: 'MAGNET!', icon: PX.fromRows(['w.....w', 'r.....r', 'r.....r', 'r.....r', 'rr...rr', '.rrrrr.', '..rrr..'], { r: '#ff4f7a', w: '#ffffff' }) },
    x2: { col: '#ffd45e', t: 600, label: 'X2 SHARDS!', icon: PX.fromRows(['y...y..', '.y.y...', '..y....', '.y.y.yy', 'y...y.y', '.....y.', '....yyy'], { y: '#ffd45e' }) },
    bubble: { col: '#7fd3ff', t: 0, label: 'BUBBLE!', icon: PX.fromRows(['..ccc..', '.c..wc.', 'c....wc', 'c.....c', 'c.....c', '.c...c.', '..ccc..'], { c: '#7fd3ff', w: '#ffffff' }) },
    rocket: { col: '#ff8a3a', t: 200, label: 'MINI ROCKET!', icon: PX.fromRows(['...w...', '..www..', '..wbw..', '..www..', '.wwwww.', '..r.r..', '.r...r.'], { w: '#ffffff', b: '#4fe3ff', r: '#ff8a3a' }) }
  };
  function plat(x, y, w, o) { var p = { x: x, y: y, w: w, base: y }; if (o) for (var k in o) p[k] = o[k]; game.plats.push(p); return p; }
  function pwItem(x, y, k) { game.items.push({ x: x, y: y, ph: 0, pw: k || PWK[Math.floor(R() * PWK.length)] }); }
  function tip(key, text) { if (!game.tips[key]) { game.tips[key] = 1; popText(text, '#ffffff'); } }
  function popText(text, col) { game.pop = { text: text, col: col || '#ffd45e', t: 0 }; }
  function setPiece(mode, force, theme) {
    var G = game, b = BIOMES[G.biome], list = SETS[b.key] || ['gift'], name = force || list[G.setIdx++ % list.length], x = W + 12, i;
    if (mode !== 'run' && name !== 'gift' && name !== 'arena' && SET_MODE[name] !== mode) name = 'gift';
    if (mode === 'run' && SET_MODE[name]) name = 'gift';
    if (name === 'arena' && b.key === 'xian' && wprog(G) < 0.3) { G.setCd = 1; return false; } /* no fight in the first stretch of sword flight */
    if (name === 'arena' && !GUN[b.key]) name = 'gift';
    G.setCd = 3 + Math.floor(R() * 2);
    if (name === 'stairs') {
      for (i = 0; i < 4; i++) { plat(x + i * 46, GY - 16 - i * 12, 30); shardRow(x + i * 46 + 6, GY - 30 - i * 12, 3, 9); }
      G.obs.push({ type: 'pit', pit: true, x: x + 50, y: GY, w: 104, h: 0 });
      if (R() < 0.6) pwItem(x + 3 * 46 + 8, GY - 80);
      G.gap = 4 * 46 + 70;
    } else if (name === 'bridge') {
      plat(x + 6, GY - 18, 46); plat(x + 74, GY - 28, 40, { bob: 1, ph: R() * 6 }); plat(x + 136, GY - 18, 34);
      G.obs.push({ type: 'pit', pit: true, x: x + 14, y: GY, w: 168, h: 0 });
      shardRow(x + 54, GY - 44, 2, 9); shardRow(x + 118, GY - 48, 2, 9);
      G.gap = 230;
    } else if (name === 'bars') {
      for (i = 0; i < 3; i++) { G.obs.push({ type: 'bar', x: x + i * 74, y: GY - 11, w: 14, h: 64, hb: [1, 0, 1, 0], safe: false, draw: drawBar }); shardRow(x + i * 74 - 6, GY - 7, 3, 9); }
      tip('bars', 'v  SLIDE: DOWN');
      G.gap = 3 * 74 + 60;
    } else if (name === 'springs') {
      plat(x, GY - 3, 18, { spring: 1 });
      for (i = 0; i < 7; i++) G.items.push({ x: x + 24 + i * 12, y: GY - 40 - Math.sin(i / 6 * Math.PI) * 50, ph: R() * 6 });
      plat(x + 112, GY - 64, 44); pwItem(x + 128, GY - 80);
      tip('spring', 'SPRING!');
      G.gap = 200;
    } else if (name === 'gift') {
      if (mode === 'run') { plat(x + 10, GY - 34, 36); pwItem(x + 24, GY - 50); shardRow(x + 12, GY - 44, 1, 9); }
      else { pwItem(x + 10, 50 + Math.floor(R() * 60)); shardRow(x + 30, 60 + Math.floor(R() * 40), 4, 10); }
      G.gap = 130;
    } else if (name === 'arena') {
      tip('gun', 'SHOOT!  S / FIRE');
      var fl = mode === 'run' ? [GY - 34, GY - 52, GY] : [50, 80, 110];
      for (i = 0; i < 5; i++) {
        var ey = fl[i % 3], walker = mode === 'run' && ey === GY;
        G.obs.push({ type: 'foe', anim: walker ? P.wolf : P.bat, x: x + i * 46, y: ey, base: ey, w: walker ? 22 : 16, h: walker ? 13 : 10, vx: walker ? 0.4 : 0.25, fly: !walker, hb: [3, 2, 3, 1], hp: 1, foe: 1 });
      }
      G.gap = 5 * 46 + 60;
    } else if (name === 'shaft') {
      if (G.dist < 60) return false;
      var lay = shaftLayout(G.loop), tx = x + 30, top = GY - lay.goal, cx = tx + 14 + SH_GAP, len = 260 + Math.floor(R() * 80), skin = CLIMB_SKIN[b.key] || 'plain';
      climbHazards(lay, G.loop, skin);
      G.obs.push({ type: 'tower', x: tx, y: GY, w: 14 + SH_GAP, h: lay.goal, safe: true, lay: lay, draw: drawShaftTower });
      G.plats.push({ x: cx, y: top, w: len, solid: 1, cliff: 1, skin: skin, face: 1 });
      G.plats.push({ x: cx + len, y: GY - Math.round(lay.goal * 0.62), w: 60, solid: 1, cliff: 1, skin: skin }); /* steps back down to the road */
      G.plats.push({ x: cx + len + 60, y: GY - Math.round(lay.goal * 0.3), w: 60, solid: 1, cliff: 1, skin: skin });
      len += 60;
      for (i = 0; i < 6; i++) G.items.push({ x: cx + 40 + i * 40, y: top - 22 - Math.round(Math.sin(i / 5 * Math.PI) * 14), ph: i });
      tip('shaft', 'WALL JUMP!');
      G.gap = 30 + 14 + SH_GAP + len + 56 + 90;
    } else if (SET_MODE[name]) {
      nonRunPiece(G, b, name, x);
    } else if (name === 'house') {
      G.obs.push({ type: 'house', x: x + 20, y: GY, w: 70, h: 56, safe: true, theme: theme || 'apt', draw: drawHouse });
      tip('house', 'REST HOUSE');
      G.gap = 200;
    }
    return true;
  }
  /* G1: every non-run world gets its own set pieces (each pays at most 4 shards, like the gift it replaces) */
  var SET_MODE = { dualgate: 'flip', chain: 'flip', mirrormaze: 'flip', valves: 'jet', geartunnel: 'jet', current: 'swim', bubblecol: 'swim', jellybounce: 'swim', pinwheel: 'swim' };
  function flipFence(b, ceil, xx, h) { h = h || 18 + Math.floor(R() * 12); game.obs.push({ type: 'fence', x: xx, y: ceil ? CY + h : GY, w: 10, h: h, ceil: ceil, hb: [1, 0, 1, 0], draw: b.fenceDraw || drawFence }); }
  function pinBubble(G, xx) { return function (o) { var p = pbox(); if (p[0] + p[2] > o.x && p[0] < o.x + o.w) xx(o, p); }; }
  function nonRunPiece(G, b, name, x) {
    var i, n;
    if (name === 'dualgate' || name === 'mirrormaze') { /* fences that alternate floor / ceiling: flip on the beat */
      n = name === 'mirrormaze' ? 4 : 3; var sp = name === 'mirrormaze' ? 96 : 84, c0 = R() < 0.5;
      for (i = 0; i < n; i++) { var ce = (i % 2 === 0) === c0; flipFence(b, ce, x + i * sp, 22 + Math.floor(R() * 8)); shardRow(x + i * sp, ce ? GY - 14 : CY + 6, 1, 0); }
      tip('dualgate', 'FLIP ON THE BEAT!');
      G.gap = (n - 1) * sp + 120 + G.speed * 10;
    } else if (name === 'chain') { /* three drones swimming in a wave */
      var dr = b.droneAnim || drone;
      for (i = 0; i < 3; i++) { var dy = 64 + R() * 24; G.obs.push({ type: 'drone', anim: dr, x: x + i * 46, y: dy, base: dy, ph: i * 1.3, w: dr[0].width, h: dr[0].height, vx: 0.4, fly: false, hb: [1, 0, 1, 0], upd: function (o) { o.y = o.base + Math.sin(game.frame * 0.05 + o.ph) * 26; } }); }
      G.gap = 2 * 46 + 140 + G.speed * 10;
    } else if (name === 'valves') { /* vents that fire one after another */
      var vd = b.ventDraw || drawVent, ph0 = Math.floor(R() * 110);
      for (i = 0; i < 3; i++) { G.obs.push({ type: 'vent', x: x + i * 46, y: GY, w: 14, h: 84, ph: (ph0 + i * 22) % 110, cyc: 0, hb: [3, 0, 3, 0], draw: vd, upd: function (o) { o.cyc = (game.frame + o.ph) % 110; o.on = o.cyc > 64; o.safe = !o.on; } }); shardRow(x + i * 46 + 3, 42, 1, 0); }
      tip('valves', 'VENTS FIRE IN A ROW');
      G.gap = 2 * 46 + 130 + G.speed * 10;
    } else if (name === 'geartunnel') { /* a short pipe tunnel that bends; from lap 2 a gear waits behind it */
      var pd = b.pipeDraw || drawPipe, gapH = Math.max(66, 80 - G.loop * 4), c0 = 54 + R() * 30;
      for (i = 0; i < 3; i++) {
        var c = Math.round(c0 + Math.sin(i * 1.2) * 9), tb = Math.round(c - gapH / 2), bt = Math.round(c + gapH / 2);
        G.obs.push({ type: 'pipe', x: x + i * 18, y: tb, w: 16, h: tb, cap: 'bottom', hb: [0, 0, 0, 0], draw: pd });
        G.obs.push({ type: 'pipe', x: x + i * 18, y: GY, w: 16, h: GY - bt, cap: 'top', hb: [0, 0, 0, 0], draw: pd });
        shardRow(x + i * 18 + 4, c - 4, 1, 0);
      }
      var gx = 0;
      if (G.loop >= 1) { gx = 70; G.obs.push({ type: 'gear', x: x + 54 + gx, y: c0 + 11, base: c0 + 11, ph: R() * 6, w: 22, h: 22, hb: [4, 4, 4, 4], draw: b.gearDraw || drawGearHaz, upd: function (o) { o.y = o.base + Math.sin(game.frame * 0.04 + o.ph) * 16; } }); }
      G.gap = 54 + gx + 130 + G.speed * 10;
    } else if (name === 'current') { /* coral corridor */
      var cl = b.coral || coral, stl = b.stal || stal, ph = R() * 6;
      for (i = 0; i < 3; i++) {
        var cr = cl[Math.floor(R() * cl.length)], sl = stl[Math.floor(R() * stl.length)];
        G.obs.push({ type: 'coral', img: cr, x: x + i * 30, y: GY, w: cr.width, h: cr.height, hb: [2, 4, 2, 0] });
        G.obs.push({ type: 'stal', img: sl, x: x + i * 30 + 2, y: sl.height, w: sl.width, h: sl.height, hb: [2, 0, 2, 4] });
        shardRow(x + i * 30 + 3, Math.round((sl.height + GY - cr.height) / 2 - 4 + Math.sin(ph + i) * 6), 1, 0);
      }
      G.gap = 60 + 130 + G.speed * 10;
    } else if (name === 'bubblecol') { /* a column of bubbles lifts you over a mine */
      G.obs.push({ type: 'bubbles', x: x, y: GY, w: 26, h: GY - 30, safe: true, draw: drawBubbles, upd: pinBubble(G, function () { game.vy = Math.max(-2.6, game.vy - 0.34); }) });
      for (i = 0; i < 3; i++) shardRow(x + 9, 40 + i * 13, 1, 0);
      G.obs.push({ type: 'mine', x: x + 80, y: GY - 6, w: 12, h: 12, hb: [1, 1, 1, 1], draw: b.mineDraw || drawMine });
      G.obs.push({ type: 'mine', x: x + 96, y: GY - 26, w: 12, h: 12, hb: [1, 1, 1, 1], draw: b.mineDraw || drawMine });
      tip('bubbles', 'BUBBLES LIFT YOU!');
      G.gap = 110 + 120 + G.speed * 10;
    } else if (name === 'jellybounce') { /* jelly pads on the floor bounce you up */
      for (i = 0; i < 2; i++) {
        G.obs.push({ type: 'pad', x: x + i * 96, y: GY, w: 24, h: 7, safe: true, sq: 0, draw: drawPad, upd: pinBubble(G, function (o) { if (game.y > GY - 6 && game.vy >= 0) { game.vy = -3.6; o.sq = 8; SFX.spring(); burst(o.x + 12, GY - 4, 8, ['#ff9ad0', '#ffffff'], 1); } if (o.sq) o.sq--; }) });
        shardRow(x + i * 96 + 4, GY - 70, 2, 12);
      }
      tip('pads', 'BOUNCE!');
      G.gap = 96 + 140 + G.speed * 10;
    } else if (name === 'pinwheel') { /* spinning candy pinwheels drifting up and down */
      for (i = 0; i < 2; i++) { var py = 54 + R() * 50; G.obs.push({ type: 'pinwheel', x: x + i * 64, y: py + 16, base: py + 16, ph: R() * 6, w: 16, h: 16, hb: [2, 2, 2, 2], draw: drawPinwheel, upd: function (o) { o.y = o.base + Math.sin(game.frame * 0.035 + o.ph) * 18; } }); }
      shardRow(x + 26, 50 + Math.floor(R() * 50), 2, 12);
      G.gap = 64 + 130 + G.speed * 10;
    }
  }
  function drawBubbles(o) {
    var X = Math.round(o.x), f = game.frame;
    g.fillStyle = 'rgba(200,240,255,.10)'; g.fillRect(X, 30, o.w, GY - 30);
    for (var k = 0; k < 14; k++) { var by = GY - ((f * 1.6 + k * 37) % (GY - 30)), bx = X + 3 + (k * 7) % (o.w - 6) + Math.round(Math.sin(f * 0.1 + k) * 2); g.fillStyle = k % 3 ? 'rgba(220,250,255,.8)' : '#ffffff'; g.fillRect(bx, Math.round(by), k % 4 ? 1 : 2, k % 4 ? 1 : 2); }
    g.fillStyle = '#7fd3ff'; g.fillRect(X + 4, GY - 3, o.w - 8, 3); g.fillStyle = '#2a5a8a'; g.fillRect(X + 6, GY - 1, o.w - 12, 1);
  }
  function drawPad(o) {
    var X = Math.round(o.x), s = o.sq > 0 ? 2 : 0;
    g.fillStyle = '#c84a8a'; g.fillRect(X, GY - 5 + s, o.w, 5 - s); g.fillStyle = '#ff9ad0'; g.fillRect(X + 1, GY - 7 + s, o.w - 2, 3); g.fillStyle = '#ffffff'; g.fillRect(X + 3, GY - 6 + s, 4, 1);
  }
  function drawPinwheel(o) {
    var cx = Math.round(o.x + 8), cy = Math.round(o.y - 8), a = game.frame * 0.12 + o.ph, CL = ['#ff6fa8', '#7fe0ff', '#ffd45e', '#9cff8a'];
    for (var k = 0; k < 4; k++) for (var r = 1; r < 8; r++) { var an = a + k * Math.PI / 2 + r * 0.12; g.fillStyle = r > 5 ? '#ffffff' : CL[k]; g.fillRect(Math.round(cx + Math.cos(an) * r), Math.round(cy + Math.sin(an) * r), 2, 2); }
    g.fillStyle = '#ffffff'; g.fillRect(cx - 1, cy - 1, 3, 3);
  }
  function updatePlats(G) {
    for (var i = G.plats.length - 1; i >= 0; i--) {
      var p = G.plats[i]; p.x -= G.speed;
      if (p.bob) { var ny = p.base + Math.round(Math.sin(G.frame * 0.05 + p.ph) * 8); if (G.onPlat === p) G.y = ny; p.y = ny; }
      if (p.squish) p.squish--;
      if (p.ghost && ++p.ghost > 30) { if (G.onPlat === p) G.onPlat = null; G.plats.splice(i, 1); continue; }
      if (p.x + p.w < -20) G.plats.splice(i, 1);
    }
  }
  function drawPlats(G, b) {
    var top = b.ground.top, dk = b.ground.dirt2 || '#1a1030';
    G.plats.forEach(function (p) {
      var x = Math.round(p.x), y = Math.round(p.y);
      g.globalAlpha = p.ghost ? Math.max(0, 1 - p.ghost / 30) : 1;
      if (p.cliff) {
        g.fillStyle = '#100a1c'; g.fillRect(x - 1, y - 1, p.w + 2, GY - y + 1);
        if (!(p.skin && wallFill(p.skin, x, x, y + 3, p.w, GY - y - 3))) {
          g.fillStyle = dk; g.fillRect(x, y + 3, p.w, GY - y - 3);
          g.fillStyle = 'rgba(255,255,255,.06)'; for (var yy = y + 7; yy < GY; yy += 6) g.fillRect(x, yy, p.w, 1);
        } else if (p.face) { g.fillStyle = 'rgba(0,0,0,.22)'; g.fillRect(x, y + 3, 2, GY - y - 3); }
        g.fillStyle = top[0]; g.fillRect(x, y, p.w, 3); g.fillStyle = top[1] || top[0]; g.fillRect(x, y + 3, p.w, 1);
        if (p.skin) wallTrim(p.skin, x, y, p.w);
        g.globalAlpha = 1; return;
      }
      if (p.spring) {
        var sq = p.squish ? 3 : 0;
        g.fillStyle = '#2a1648'; g.fillRect(x, y + 1, p.w, 3);
        g.fillStyle = '#c8c8d8'; for (var k = 0; k < 3; k++) g.fillRect(x + 3 + k * 5, y - 3 + sq, 2, 4 - sq);
        g.fillStyle = '#ff4f7a'; g.fillRect(x, y - 4 + sq, p.w, 2); g.fillStyle = '#ffd45e'; g.fillRect(x + 1, y - 4 + sq, p.w - 2, 1);
      } else {
        g.fillStyle = 'rgba(10,6,24,.35)'; g.fillRect(x + 2, y + 6, p.w - 2, 2);
        g.fillStyle = '#100a1c'; g.fillRect(x - 1, y - 1, p.w + 2, 7);
        g.fillStyle = dk; g.fillRect(x, y + 2, p.w, 3);
        g.fillStyle = top[0]; g.fillRect(x, y, p.w, 2); g.fillStyle = top[1] || top[0]; for (var j = 2; j < p.w - 2; j += 6) g.fillRect(x + j, y + 2, 2, 1);
        g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect(x, y, p.w, 1);
      }
      g.globalAlpha = 1;
    });
  }
  function drawBar(o) {
    var x = Math.round(o.x), y0 = Math.round(o.y - o.h);
    g.fillStyle = '#100a1c'; g.fillRect(x - 1, 0, o.w + 2, Math.round(o.y) + 1);
    g.fillStyle = '#ff4f6a'; g.fillRect(x, 0, o.w, Math.round(o.y));
    g.fillStyle = '#ffd45e'; for (var yy = (G_frame() >> 1) % 8 - 8; yy < o.y; yy += 8) g.fillRect(x, Math.round(yy), o.w, 3);
    g.fillStyle = '#100a1c'; g.fillRect(x - 2, Math.round(o.y) - 2, o.w + 4, 3);
    if (G_frame() % 30 < 18) PX.text(g, 'v', x + 4, Math.round(o.y) + 2, '#ffffff', '#000');
  }
  function G_frame() { return game ? game.frame : 0; }
  function drawShaftTower(o) {
    var x = Math.round(o.x), b = BIOMES[game.biome], c = b.ground.dirt2 || '#2a1648', t = b.ground.top, L = o.lay, top = GY - L.goal - 8, lw = x + 14, C = game.climb;
    /* left pillar: open arch at the bottom so you run in underneath */
    g.fillStyle = '#100a1c'; g.fillRect(x - 1, top - 1, 16, GY - 30 - top + 2);
    if (!(L.skin && wallFill(L.skin, x, x, top, 14, GY - 30 - top))) {
      g.fillStyle = c; g.fillRect(x, top, 14, GY - 30 - top);
      g.fillStyle = 'rgba(255,255,255,.08)'; for (var yy = top + 4; yy < GY - 30; yy += 6) g.fillRect(x, yy, 14, 1);
    }
    g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(x + 12, top, 2, GY - 30 - top);
    g.fillStyle = t[0]; g.fillRect(x - 1, top - 2, 16, 3); g.fillRect(x + 13, top, 1, GY - 30 - top);
    if (L.skin) wallTrim(L.skin, x - 1, top - 2, 16);
    g.fillStyle = '#100a1c'; g.fillRect(x, GY - 31, 14, 2);
    /* ice holds (lake, from lap 2): crack while you hang on, break, grow back */
    (L.ice || []).forEach(function (ic) {
      var wx = ic.side < 0 ? lw : lw + SH_GAP - 4, y0 = GY - ic.h1;
      if (ic.broken) { g.fillStyle = 'rgba(158,210,236,.35)'; g.fillRect(wx, y0, 4, ic.h1 - ic.h0); return; }
      g.fillStyle = '#d8f4ff'; g.fillRect(wx, y0, 4, ic.h1 - ic.h0); g.fillStyle = '#ffffff'; g.fillRect(wx + (ic.side < 0 ? 0 : 3), y0, 1, ic.h1 - ic.h0);
      g.fillStyle = '#6aa6c8'; var cr = Math.floor(ic.hold / 7); for (var k = 0; k < cr; k++) g.fillRect(wx + 1 + (k % 2), y0 + 3 + k * 5, 2, 1);
    });
    /* falling rocks: shake at the top while warning, then drop */
    if (C && C.o === o && C.rocks) C.rocks.forEach(function (rk) {
      var ry = GY - rk.h, sx = rk.warn > 0 ? Math.round(Math.sin(rk.warn * 1.7)) : 0;
      if (rk.warn > 0 && rk.warn % 8 < 5) { g.fillStyle = 'rgba(255,79,106,.55)'; for (var d = 12; d < 60; d += 8) g.fillRect(rk.x + 3, ry + d, 2, 3); }
      g.fillStyle = '#100a1c'; g.fillRect(rk.x - 1 + sx, ry - 9, 10, 10); g.fillStyle = L.skin === 'sand' ? '#b8864a' : L.skin === 'granite' ? '#8a90a8' : '#4a4862'; g.fillRect(rk.x + sx, ry - 8, 8, 8);
      g.fillStyle = 'rgba(255,255,255,.3)'; g.fillRect(rk.x + 1 + sx, ry - 7, 3, 1);
    });
    /* spikes on the inner walls (only from lap 2 on; they slide up and down in the town / wood / brick worlds) */
    L.spikes.forEach(function (sp) {
      var hh = spikeAt(sp, G_frame()), wx = sp.side < 0 ? lw : lw + SH_GAP, y1 = GY - hh[1] - 18, y0 = GY - hh[0];
      if (sp.amp) { g.fillStyle = 'rgba(40,30,50,.5)'; g.fillRect(sp.side < 0 ? wx : wx - 2, GY - sp.h1 - 18 - sp.amp, 2, sp.h1 - sp.h0 + 18 + sp.amp * 2); }
      for (var yy = y1; yy < y0; yy += 5) {
        g.fillStyle = '#e6e8f0'; for (var k = 0; k < 6; k++) g.fillRect(sp.side < 0 ? wx : wx - k, yy + (k < 3 ? k : 5 - k) + 1, k, 1);
        g.fillStyle = '#ff4f6a'; g.fillRect(sp.side < 0 ? wx : wx - 2, yy + 2, 2, 1);
      }
    });
    L.coins.forEach(function (cn) { if (!cn.got) g.drawImage(P.shard[Math.floor(G_frame() / 6) % 4], lw + cn.dx, GY - cn.h - 4 + Math.round(Math.sin(G_frame() * 0.1 + cn.h) * 2)); });
    if (!o.done && !C && G_frame() % 30 < 20) { g.fillStyle = '#ffffff'; for (var a = 0; a < 3; a++) g.fillRect(lw + SH_GAP / 2 - 3 + a * 3, GY - L.goal - 14 - Math.abs(1 - a) * 2, 2, 2); }
  }
  /* cosy rest house on the roadside: run into the door to take a break */
  var HOUSE_COL = { apt: ['#9aa8d0', '#4a5a9a', '#5a6aaa'], tea: ['#efe2c4', '#3a3a4a', '#4a4a5a'], lodge: ['#8a6a48', '#e8f0ff', '#ffffff'], cabin: ['#a86a3a', '#6a3a2a', '#7a4a32'] };
  function drawHouse(o) {
    var x = Math.round(o.x), y = GY, f = G_frame(), hc = HOUSE_COL[o.theme] || HOUSE_COL.apt;
    g.fillStyle = '#100a1c'; g.fillRect(x - 1, y - 39, o.w + 2, 39);
    g.fillStyle = hc[0]; g.fillRect(x, y - 38, o.w, 38);
    g.fillStyle = 'rgba(0,0,0,.12)'; for (var yy = y - 34; yy < y; yy += 5) g.fillRect(x, yy, o.w, 1);
    for (var r = 0; r < 14; r++) { g.fillStyle = r % 2 ? hc[1] : hc[2]; g.fillRect(x - 6 + r, y - 40 - r, o.w + 12 - r * 2, 1); }
    g.fillStyle = '#100a1c'; g.fillRect(x + o.w - 18, y - 60, 8, 14); g.fillStyle = '#6a4a4a'; g.fillRect(x + o.w - 17, y - 59, 6, 13);
    if (f % 40 < 30) { g.fillStyle = 'rgba(230,230,240,.5)'; g.fillRect(x + o.w - 15 + Math.round(Math.sin(f * 0.05) * 2), y - 66 - (f % 40) / 6, 3, 3); }
    g.fillStyle = '#3a2418'; g.fillRect(x + 8, y - 26, 16, 26); g.fillStyle = '#5a3a28'; g.fillRect(x + 9, y - 25, 14, 25); g.fillStyle = '#ffd45e'; g.fillRect(x + 20, y - 13, 2, 2);
    g.fillStyle = '#100a1c'; g.fillRect(x + 34, y - 30, 26, 16); g.fillStyle = f % 60 < 50 ? '#ffd47a' : '#ffe6a0'; g.fillRect(x + 35, y - 29, 24, 14);
    g.fillStyle = '#100a1c'; g.fillRect(x + 46, y - 29, 1, 14); g.fillRect(x + 35, y - 23, 24, 1);
    g.fillStyle = 'rgba(255,212,122,.15)'; g.fillRect(x + 30, y - 34, 34, 24);
    if (!o.done && f % 40 < 28) PX.text(g, 'REST', x + 4, y - 36 - 22 + (f % 40 < 14 ? 0 : 1), '#ffffff', '#000');
  }
  /* ---------- shooting ---------- */
  function fire() {
    var G = game; if (!G || G.climb || G.fireCd > 0 || !GUN[BIOMES[G.biome].key]) return;
    G.fireCd = 10; G.shots.push({ x: G.x + 14, y: G.y + (G.gdir < 0 ? 10 : -12) - (G.sliding ? -6 : 0), vx: 5, life: 60 });
    SFX.shoot(); particle(G.x + 16, G.y - 12, 1, 0, 6, '#ffffff', 2, 0);
  }
  function updateShots(G) {
    for (var i = G.shots.length - 1; i >= 0; i--) {
      var s = G.shots[i]; s.x += s.vx; s.life--;
      /* gentle aim assist toward the nearest creature ahead */
      var tgt = null, bd = 1e9; G.obs.forEach(function (o) { if ((o.anim || o.foe) && !o.ghost && o.x > s.x && o.x - s.x < 120) { var dy = (o.y - o.h / 2) - s.y; if (Math.abs(dy) < 44 && o.x - s.x < bd) { bd = o.x - s.x; tgt = dy; } } });
      if (tgt !== null) s.y += clamp(tgt * 0.12, -1.6, 1.6);
      var gone = s.x > W + 8 || s.life <= 0;
      for (var j = G.obs.length - 1; j >= 0 && !gone; j--) {
        var o = G.obs[j]; if (o.pit || o.safe || o.ghost || o.type === 'tower') continue;
        if (s.x + 4 > o.x && s.x < o.x + o.w && s.y + 2 > o.y - o.h && s.y < o.y) {
          gone = true;
          if (o.anim || o.foe || o.type === 'talisman' || o.type === 'gear') {
            G.obs.splice(j, 1); SFX.kill(); G.shake = Math.max(G.shake, 2); if (G.wst) G.wst.kills++;
            burst(o.x + o.w / 2, o.y - o.h / 2, 14, ['#ffd45e', '#ffffff', '#ff4fa3'], 1.8);
            G.items.push({ x: o.x + o.w / 2 - 4, y: o.y - o.h / 2 - 4, ph: 0 });
          } else burst(s.x + 3, s.y, 4, ['#ffffff', '#ffb84f'], 0.8);
        }
      }
      if (gone) G.shots.splice(i, 1);
    }
  }
  function drawShots(G) {
    G.shots.forEach(function (s) {
      var x = Math.round(s.x), y = Math.round(s.y);
      g.fillStyle = 'rgba(255,184,79,.45)'; g.fillRect(x - 4, y, 4, 2);
      g.fillStyle = '#ffd45e'; g.fillRect(x, y - 1, 5, 4); g.fillStyle = '#ffffff'; g.fillRect(x + 1, y, 3, 2);
    });
  }
  /* ---------- power-ups ---------- */
  function givePower(G, k) {
    var d = PWD[k]; SFX.power(); popText(d.label, d.col); burst(G.x + 8, G.y - 12, 18, [d.col, '#ffffff'], 1.6); G.gFlash = 20;
    if (k === 'magnet') G.magnet = d.t; else if (k === 'x2') G.x2 = d.t; else if (k === 'bubble') G.bubble = 1;
    else if (k === 'rocket') { G.rocket = d.t; SFX.dash(); G.sliding = false; G.onPlat = null; }
  }
  function drawPowerItem(it, y) {
    var d = PWD[it.pw], x = Math.round(it.x) - 2, yy = Math.round(y) - 2, f = G_frame();
    g.fillStyle = '#100a1c'; g.fillRect(x, yy + 1, 13, 11); g.fillRect(x + 1, yy, 11, 13);
    g.fillStyle = f % 20 < 10 ? d.col : '#ffffff'; g.fillRect(x + 1, yy + 1, 11, 11);
    g.fillStyle = '#1a1030'; g.fillRect(x + 2, yy + 2, 9, 9);
    g.drawImage(d.icon, x + 3, yy + 3);
    if (f % 40 < 4) { g.fillStyle = '#ffffff'; g.fillRect(x + 11, yy - 2, 1, 3); g.fillRect(x + 10, yy - 1, 3, 1); }
  }
  function drawPowers(G) {
    var list = [], y = 30;
    if (G.magnet > 0) list.push(['magnet', G.magnet / PWD.magnet.t]);
    if (G.x2 > 0) list.push(['x2', G.x2 / PWD.x2.t]);
    if (G.rocket > 0) list.push(['rocket', G.rocket / PWD.rocket.t]);
    if (G.bubble) list.push(['bubble', 1]);
    list.forEach(function (l, i) {
      var d = PWD[l[0]], x = 3 + i * 22; hudPanel(x, y, 20, 13);
      g.drawImage(d.icon, x + 2, y + 2); g.fillStyle = '#05030a'; g.fillRect(x + 11, y + 4, 7, 5);
      g.fillStyle = d.col; g.fillRect(x + 11, y + 4, Math.max(1, Math.round(7 * l[1])), 5);
      if (l[1] < 0.25 && G.frame % 10 < 5) { g.fillStyle = '#ffffff'; g.fillRect(x + 11, y + 4, 7, 5); }
    });
  }
  function drawRocket(G) {
    var x = Math.round(G.x) - 4, y = Math.round(G.y) - 6, f = G.frame;
    g.fillStyle = '#100a1c'; g.fillRect(x - 1, y - 1, 20, 7);
    g.fillStyle = '#e6eeff'; g.fillRect(x, y, 16, 5); g.fillStyle = '#ff4f6a'; g.fillRect(x + 16, y + 1, 3, 3); g.fillRect(x + 2, y - 2, 4, 2);
    g.fillStyle = '#4fe3ff'; g.fillRect(x + 10, y + 1, 3, 2);
    g.fillStyle = f % 4 < 2 ? '#ffd45e' : '#ff6a2a'; g.fillRect(x - 5, y + 1, 5, 3); g.fillStyle = '#ffffff'; g.fillRect(x - 2, y + 2, 2, 1);
  }
  /* ---------- skills ---------- */
  function skill() {
    var G = game; if (!G || st.mode !== 'play') return;
    if (G.id === 'C0') {
      if (G.slowT > 0 || G.slowCd > 0) { popText('COOLDOWN ' + Math.ceil(G.slowCd / 60) + 'S', '#7fa0c0'); return; }
      G.slowT = 150; G.slowCd = 600; SFX.slow(); G.gFlash = 30; G.flash = 0.2; burst(G.x + 8, G.y - 12, 20, ['#4fe3ff', '#ffffff'], 2); popText('OVERCLOCK!', '#4fe3ff');
    } else if (G.id === 'X0') popText(G.shield ? 'SHIELD READY' : 'SHIELD CHARGING', '#b48cff');
    else popText('NINE LIVES: PASSIVE', '#ff6fa6');
  }
  /* ---------- wall-jump climbing shaft (vertical mini-stage) ---------- */
  /* (old separate climb room removed: wall-jump now happens on the road) */
  function hurt(G) {
    if (G.inv > 0) return false;
    if (G.wst) { G.wst.hits++; G.lapSt.hits++; }
    if (G.bubble) { G.bubble = 0; G.inv = 70; SFX.shield(); return false; }
    if (G.shield) { G.shield = 0; G.shieldF = G.frame; G.inv = 70; SFX.shield(); return false; }
    G.shake = 6; SFX.hit();
    if (--G.hp > 0) { G.inv = 100; return false; }
    G.climb = null; die(); return true;
  }
  var SH_GAP = 108;
  function shaftLayout(loop) {
    var goal = loop === 0 ? 150 : loop === 1 ? 200 : 250, spikes = [], coins = []; /* tall climbs: the camera pans up with you */
    var nsp = loop === 0 ? 0 : loop === 1 ? 2 : Math.min(4, loop + 1); /* lap 1: no hazards at all */
    for (var i = 0; i < nsp; i++) { var h0 = 20 + Math.floor((goal - 46) * (i + 1) / (nsp + 1)); spikes.push({ side: i % 2 ? 1 : -1, h0: h0, h1: h0 + 12 }); }
    for (var h = 24; h < goal - 6; h += 22) coins.push({ dx: SH_GAP / 2 - 4 + Math.round((R() - 0.5) * 40), h: h, got: 0 });
    return { goal: goal, spikes: spikes, coins: coins };
  }
  /* G9: every climbing world has its own wall, and from lap 2 its own extra trouble.
     None of it changes the goal height, the coins or the time limit (the helping paw still comes at 45 s). */
  var CLIMB_SKIN = { market: 'shop', sakura: 'wood', desert: 'sand', haunt: 'brick', ridge: 'granite', cave: 'rock', lake: 'ice' };
  var CLIMB_HAZ = { shop: 'movespike', wood: 'movespike', brick: 'movespike', sand: 'rocks', rock: 'rocks', granite: 'rocks', ice: 'crumble' };
  function climbHazards(lay, loop, skin) {
    lay.skin = skin; lay.haz = loop > 0 ? CLIMB_HAZ[skin] || null : null; lay.ice = [];
    if (lay.haz === 'movespike') lay.spikes.forEach(function (sp, i) { sp.amp = Math.min(16, 8 + loop * 4); sp.ph = i * 1.9; });
    if (lay.haz === 'crumble') for (var i = 0, n = Math.min(4, loop + 1); i < n; i++) {
      var h0 = 30 + Math.floor((lay.goal - 70) * (i + 0.5) / n); lay.ice.push({ side: i % 2 ? -1 : 1, h0: h0, h1: h0 + 26, hold: 0, broken: 0 });
    }
    if (lay.haz === 'rocks') lay.rockGap = loop > 1 ? 80 : 110;
  }
  function spikeAt(sp, f) { if (!sp.amp) return [sp.h0, sp.h1]; var d = Math.round(Math.sin(f * 0.035 + sp.ph) * sp.amp); return [sp.h0 + d, sp.h1 + d]; }
  var WALLPAT = {};
  function wallTile(skin) {
    if (WALLPAT[skin] !== undefined) return WALLPAT[skin];
    var c = PX.make(16, 24), x = c.getContext('2d'), r = PX.rng(skin.length * 977 + skin.charCodeAt(0)), i, j;
    function px(a, b, w, h, col) { x.fillStyle = col; x.fillRect(a, b, w, h); }
    if (skin === 'sand') { px(0, 0, 16, 24, '#c8965a'); for (j = 0; j < 24; j += 6) { for (i = 0; i < 16; i++) px(i, j + (i % 5 === 0 ? 1 : 0), 1, 1, '#a87440'); } px(4, 9, 2, 3, '#8a5a30'); px(10, 15, 3, 1, '#8a5a30'); px(11, 14, 1, 3, '#8a5a30'); px(0, 2, 16, 1, '#dcae74'); }
    else if (skin === 'brick') { px(0, 0, 16, 24, '#241c2c'); for (j = 0; j < 24; j += 5) for (i = (j / 5) % 2 ? -4 : 0; i < 16; i += 8) { if (r() < 0.15) continue; px(i + 1, j + 1, 6, 3, r() < 0.5 ? '#5a4a5c' : '#4a3c4e'); px(i + 1, j + 1, 6, 1, '#6a5a6c'); } px(3, 12, 1, 4, '#120c18'); px(4, 15, 2, 1, '#120c18'); }
    else if (skin === 'rock') { px(0, 0, 16, 24, '#2a2838'); for (i = 0; i < 7; i++) { var a = Math.floor(r() * 14), b = Math.floor(r() * 22); px(a, b, 3, 2, '#3a3850'); px(a, b, 2, 1, '#4a4862'); } px(Math.floor(r() * 14), Math.floor(r() * 22), 1, 1, '#7fd3ff'); px(Math.floor(r() * 14), Math.floor(r() * 22), 1, 1, '#c89cff'); }
    else if (skin === 'ice') { px(0, 0, 16, 24, '#9ed2ec'); for (i = 0; i < 24; i += 8) { px(0, i, 16, 1, '#c8ecfa'); } for (i = 0; i < 6; i++) px(2 + i * 2, 4 + i * 3, 2, 1, '#e8faff'); px(11, 6, 1, 5, '#6aa6c8'); px(12, 10, 1, 4, '#6aa6c8'); px(5, 17, 4, 1, '#6aa6c8'); }
    else if (skin === 'shop') { px(0, 0, 16, 24, '#3a1c1c'); for (j = 0; j < 24; j += 4) for (i = (j / 4) % 2 ? -3 : 0; i < 16; i += 6) { px(i + 1, j + 1, 4, 2, r() < 0.5 ? '#8a3a2a' : '#7a3024'); } }
    else if (skin === 'wood') { px(0, 0, 16, 24, '#6a3a2a'); for (i = 0; i < 16; i += 4) { px(i, 0, 1, 24, '#3a1c14'); px(i + 1, 0, 1, 24, '#8a4e36'); } px(2, 7, 1, 3, '#4a2618'); px(10, 15, 1, 4, '#4a2618'); px(6, 20, 1, 1, '#ffb8d0'); }
    else if (skin === 'granite') { px(0, 0, 16, 24, '#5a6078'); for (j = 0; j < 24; j += 8) for (i = (j / 8) % 2 ? -5 : 0; i < 16; i += 10) { px(i + 1, j + 1, 8, 6, '#6a7088'); px(i + 1, j + 1, 8, 1, '#8a90a8'); } px(3, 0, 2, 3, '#e8f0ff'); px(12, 12, 1, 4, '#e8f0ff'); }
    else return (WALLPAT[skin] = null);
    return (WALLPAT[skin] = g.createPattern(c, 'repeat'));
  }
  /* fill a wall rect with the world's texture, anchored to the wall so it scrolls with it */
  function wallFill(skin, ax, x, y, w, h) {
    var pt = wallTile(skin); if (!pt) return false;
    g.save(); g.translate(ax, GY); g.fillStyle = pt; g.fillRect(x - ax, y - GY, w, h); g.restore(); return true;
  }
  function wallTrim(skin, x, y, w) { /* decorations on the top edge */
    var f = G_frame(), i;
    if (skin === 'rock') { g.fillStyle = '#2a2838'; for (i = 3; i < w - 3; i += 9) { var l = 3 + (i * 7) % 5; g.fillRect(x + i, y + 4, 3, l); g.fillRect(x + i + 1, y + 4 + l, 1, 2); } }
    else if (skin === 'ice') { g.fillStyle = '#d8f4ff'; for (i = 2; i < w - 2; i += 7) { var il = 2 + (i * 5) % 4; g.fillRect(x + i, y + 4, 2, il); g.fillRect(x + i, y + 4 + il, 1, 2); } }
    else if (skin === 'granite' || skin === 'ice') { g.fillStyle = '#f0f6ff'; g.fillRect(x, y - 1, w, 2); }
    else if (skin === 'wood') { g.fillStyle = '#ffb8d0'; for (i = 4; i < w - 2; i += 11) g.fillRect(x + i, y - 1 - ((i + (f >> 4)) % 3 === 0 ? 1 : 0), 2, 1); }
    else if (skin === 'brick') { g.fillStyle = 'rgba(220,220,240,.35)'; g.fillRect(x + 2, y + 4, 6, 1); g.fillRect(x + 3, y + 5, 1, 4); g.fillRect(x + 6, y + 5, 1, 3); }
    else if (skin === 'sand') { g.fillStyle = '#e8c48a'; g.fillRect(x, y + 3, w, 1); }
    else if (skin === 'shop' && w > 40) { g.fillStyle = '#e8303a'; g.fillRect(x + 12, y + 10, 5, 7); g.fillStyle = '#ffd45e'; g.fillRect(x + 13, y + 12, 3, 3); g.fillStyle = '#5a1010'; g.fillRect(x + 14, y + 7, 1, 3); }
  }
  function enterClimb(G, o) {
    var lw = Math.round(o.x) + 14, C = { o: o, lw: lw, rw: lw + SH_GAP, ch: Math.max(0, GY - G.y), vx: 0, vh: 0, side: -1, cling: false, goal: o.lay.goal, t: 0, exit: 0, spikes: o.lay.spikes, coins: o.lay.coins, trail: [] };
    C.x = clamp(G.x, C.lw, C.rw - 16); if (C.ch <= 0 && C.x <= C.lw + 2) { C.cling = true; C.x = C.lw; }
    G.climb = C; G.sliding = false; G.onPlat = null; G.shots = []; G.vy = 0; G.rocket = 0; holding = false; SFX.wall(); cp(G, 'C');
  }
  function updateClimb(G) {
    var C = G.climb; C.t++; G.dist -= G.speed / 8; G.scroll -= G.speed; /* the road pauses while you climb */
    if (C.t > CLIMB_MAX_F && !C.exit && !C.helped) { C.helped = 1; C.ch = C.goal - 3; C.cling = false; C.vh = 1; C.vx = 0; C.x = C.rw - 18; popText('HELPING PAW!', '#ffffff'); }
    if (G.inv > 0) G.inv--; if (G.grace > 0) G.grace--;
    if (G.banner) { G.banner.t++; if (G.banner.t > 150) G.banner = null; }
    if (G.pop) { G.pop.t++; if (G.pop.t > 70) G.pop = null; }
    var easy = G.loop === 0;
    if (pressed && !C.exit && (C.cling || C.ch <= 0)) {
      C.cling = false; C.side = -C.side; C.vx = C.side * 4.2; C.vh = 4.4; SFX.wall(); G.sq = -0.3;
      burst(C.x + (C.side > 0 ? 0 : 16), GY - C.ch - 10, 6, ['#ffffff', '#cfc3ea'], 1);
    }
    pressed = false; downPressed = false;
    if (C.cling) C.vh = downHeld ? -2 : (easy ? -0.12 : -0.3); else C.vh = Math.max(-6, C.vh - 0.2);
    C.ch += C.vh; C.x += C.vx;
    if (C.exit && C.x >= C.rw + 4) { C.x = C.rw + 4; C.vx = 0; } /* stop on the ledge lip, then settle */
    if (C.exit && C.ch < C.goal && C.x > C.rw - 16 && C.x < C.rw + 1) { C.exit = 0; C.x = C.rw - 16; C.cling = true; C.vx = 0; C.side = 1; }
    if (!C.cling && !C.exit) {
      if (C.side > 0 && C.x >= C.rw - 16) { C.x = C.rw - 16; C.cling = true; C.vx = 0; G.sq = 0.25; }
      if (C.side < 0 && C.x <= C.lw) { C.x = C.lw; C.cling = true; C.vx = 0; G.sq = 0.25; }
    }
    if (C.ch <= 0) { C.ch = 0; C.vh = 0; }
    var Lh = C.o.lay, live = !C.exit && !C.helped;
    if (live && Lh.haz === 'rocks') { /* a loose rock shakes (warning), then drops down one column */
      if (!C.rocks) { C.rocks = []; C.rockT = 70; }
      if (--C.rockT <= 0 && C.ch > 10 && C.ch < C.goal - 40) { C.rockT = Lh.rockGap + Math.floor(R() * 40); var rx = C.lw + 6 + Math.floor(R() * (SH_GAP - 20)); if (R() < 0.5) rx = clamp(C.x + 2, C.lw + 4, C.rw - 12); C.rocks.push({ x: rx, h: C.ch + 52, warn: 40, vy: 0 }); }
      for (var ri = C.rocks.length - 1; ri >= 0; ri--) {
        var rk = C.rocks[ri];
        if (rk.warn > 0) { rk.warn--; continue; }
        rk.vy = Math.min(3.2, rk.vy + 0.18); rk.h -= rk.vy;
        if (rk.h < 0) { C.rocks.splice(ri, 1); continue; }
        if (G.inv <= 0 && G.grace <= 0 && rk.x + 8 > C.x + 3 && rk.x < C.x + 13 && rk.h > C.ch + 1 && rk.h - 8 < C.ch + 19) {
          C.rocks.splice(ri, 1); burst(rk.x + 4, GY - rk.h, 10, ['#c8a070', '#ffffff'], 1.3);
          if (hurt(G)) return;
          G.inv = Math.max(G.inv, 40);
        }
      }
    } else if (C.rocks) C.rocks.length = 0;
    if (live && Lh.haz === 'crumble') Lh.ice.forEach(function (ic) { /* ice holds crack while you hang on them, then break and grow back */
      if (ic.broken > 0) { ic.broken--; if (!ic.broken) ic.hold = 0; }
      var on = C.cling && C.side === ic.side && C.ch + 10 > ic.h0 && C.ch + 4 < ic.h1;
      if (on && !ic.broken) { if (++ic.hold > 34) { ic.broken = 150; C.cling = false; C.vh = -1; C.vx = -C.side * 0.6; SFX.slide(); burst(C.x + (C.side > 0 ? 14 : 2), GY - C.ch - 8, 10, ['#d8f4ff', '#9ed2ec', '#ffffff'], 1.2); } }
      else if (on && ic.broken) C.vh = Math.min(C.vh, -1.6); /* broken ice: you slide down it */
      else if (!on && ic.hold > 0 && !ic.broken) ic.hold = Math.max(0, ic.hold - 0.5);
    });
    for (var i = 0; i < C.spikes.length; i++) {
      var sp = C.spikes[i], sh = spikeAt(sp, G.frame);
      if (C.cling && sp.side === C.side && C.ch + 18 > sh[0] && C.ch < sh[1] && G.inv <= 0 && G.grace <= 0) {
        if (hurt(G)) return;
        C.cling = false; C.side = -C.side; C.vx = C.side * 3; C.vh = 2;
        burst(C.x + 8, GY - C.ch - 10, 12, ['#ff4f7a', '#ffffff'], 1.4);
      }
    }
    C.coins.forEach(function (c) {
      if (c.got) return;
      if (Math.abs(C.x + 8 - (C.lw + c.dx + 4)) < 11 && Math.abs(C.ch + 10 - c.h) < 12) { c.got = 1; G.shards += G.x2 > 0 ? 2 : 1; SFX.shard(); burst(C.lw + c.dx + 4, GY - c.h, 8, ['#ffd45e', '#ffffff'], 1.1); }
    });
    /* top reached: hop over onto the raised ledge and keep running */
    if (!C.exit && C.ch >= C.goal - 4) { C.exit = 1; C.cling = false; C.vx = 5; C.vh = Math.max(C.vh, 3); C.side = 1; G.shards += 3; popText('UP! +3', '#ffd45e'); SFX.power(); }
    if (C.exit && C.x >= C.rw + 1 && C.vh <= 0 && C.ch <= C.goal + 0.5) {
      var top = GY - C.goal, ledge = null; G.plats.forEach(function (pl) { if (pl.cliff && Math.abs(pl.y - top) < 1 && !ledge) ledge = pl; });
      C.o.done = 1; G.climb = null; cp(G, 'c'); G.x = C.x; G.y = top; G.vy = 0; G.onGround = true; G.onPlat = ledge; G.jumps = 0; G.coyote = 0; G.grace = 30; G.sq = 0.3; SFX.land();
      return;
    }
    G.x = C.x; G.y = GY - C.ch; G.onGround = C.ch <= 0; G.vy = -C.vh;
    C.trail.unshift([C.x, C.ch]); C.trail.length = 30;
    G.hist.unshift([G.y, 1, 0]); G.hist.length = 80;
    if (G.sq) { G.sq *= 0.8; if (Math.abs(G.sq) < 0.02) G.sq = 0; }
  }
  /* ---------- free-roam courtyard: no auto-scroll, walk left/right, exit through the gate on the right ---------- */
  var ROAM_W = 980;
  function enterRoam(G) {
    var R0 = {
      px: 40, py: GY, vx: 0, vy: 0, on: true, plat: null, drop: 0, jumps: 0, face: 1, cam: 0, t: 0, exit: 0, trail: [],
      plats: [[110, GY - 24, 44], [180, GY - 46, 34], [250, GY - 68, 40], [370, GY - 30, 54], [462, GY - 54, 32], [560, GY - 26, 64], [700, GY - 84, 54], [800, GY - 40, 44]].map(function (p) { return { x: p[0], y: p[1], w: p[2] }; }),
      items: [], lanterns: [{ x: 150, lit: 0 }, { x: 420, lit: 0 }, { x: 620, lit: 0 }, { x: 870, lit: 0 }],
      bell: { x: 470, y: GY - 92, cd: 0, rings: 0 }, cat: { x: 320, pets: 0, heart: 0 }, spring: { x: 652, sq: 0 }, chest: { x: 262, y: GY - 68, open: 0 }, done: 0
    };
    R0.plats.forEach(function (p) { for (var i = 0; i < Math.floor(p.w / 12); i++) R0.items.push({ x: p.x + 4 + i * 12, y: p.y - 14 }); });
    for (var i = 0; i < 6; i++) R0.items.push({ x: 640 + i * 10, y: GY - 60 - Math.sin(i / 5 * Math.PI) * 40 });
    G.roam = R0; G.obs = []; G.plats = []; G.items = []; G.shots = []; G.sliding = false; G.onPlat = null; G.fadeIn = 24; G.rocket = 0;
    popText('< > MOVE   A JUMP', '#ffffff');
  }
  /* ================= themed rest rooms: every location has its own house with 5-8 toys (DOWN = use) ================= */
  function rr(x, y, w, h, c) { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), w, h); }
  function tune(notes, ms, type, vol) { notes.forEach(function (n, i) { if (n == null) return; setTimeout(function () { beep(440 * Math.pow(2, (n - 69) / 12), Math.max(0.06, ms / 1000 * 1.5), type || 'triangle', vol || 0.04); }, i * ms); }); }
  function payOnce(G, t, n, text, col, heart) {
    if (t.paid) return false; t.paid = 1;
    if (heart && G.hp < G.maxHp) { G.hp++; popText(text + ' +1 HEART', '#ff6fa6'); SFX.heal(); }
    else { G.shards += n; popText(text + ' +' + n, col || '#ffd45e'); SFX.power(); }
    return true;
  }
  function roomBurst(Rm, x, y, n, cols) { burst(x - Rm.cam, y, n, cols || ['#ffd45e', '#ffffff'], 1.2); }
  var PENT_N = [69, 72, 74, 76, 79, 81, 84, 86];
  /* shared furniture bits */
  function shelfPlat(x, y, w, top, side) { rr(x - 1, y - 1, w + 2, 4, '#100a1c'); rr(x, y, w, 3, top); rr(x + 2, y + 3, 3, GY - y - 3, side); rr(x + w - 5, y + 3, 3, GY - y - 3, side); }
  function window4(x, y, w, h, frame, sky, f, snow) {
    rr(x - 2, y - 2, w + 4, h + 4, '#100a1c'); rr(x, y, w, h, sky);
    for (var i = 0; i < 6; i++) { var sx0 = (i * 37 + (snow ? f * 0.3 : 0)) % w, sy0 = (i * 23 + (snow ? f * 0.5 : 0)) % h; rr(x + sx0, y + sy0, 1, 1, snow ? '#ffffff' : ((f >> 4) % 6 === i ? sky : '#ffffff')); }
    rr(x + w / 2 - 1, y, 2, h, frame); rr(x, y + h / 2 - 1, w, 2, frame);
  }
  var ROOMS = {
    apt: {
      name: '公寓 · 小家', en: 'APARTMENT', W: 400, plats: [[226, GY - 24, 22], [262, GY - 50, 40]], items: [[266, GY - 62], [276, GY - 62], [286, GY - 62], [296, GY - 62]],
      bg: function (Rm, sx, f) {
        rr(0, 0, W, GY, '#2a3352'); for (var x0 = -(Math.round(Rm.cam) % 16); x0 < W; x0 += 16) rr(x0, 0, 8, GY - 20, '#303a5c');
        rr(0, GY - 20, W, 20, '#3a3a5a'); rr(0, GY - 20, W, 2, '#4a4a70'); rr(0, GY, W, H - GY, '#8a6a4a');
        for (var x1 = -(Math.round(Rm.cam) % 20); x1 < W; x1 += 20) rr(x1, GY + 3, 19, 2, '#9a7a56');
        var lx = sx(150); rr(lx, 0, 1, 14, '#100a1c'); rr(lx - 6, 14, 13, 5, '#ffd47a'); rr(lx - 14, 19, 29, 1, 'rgba(255,212,122,.25)');
      },
      toys: [
        { id: 'tv', x: 22, w: 36, label: 'GAME', max: 3, draw: function (X, t, f) {
            rr(X - 1, GY - 15, 38, 15, '#100a1c'); rr(X, GY - 14, 36, 14, '#5a3a5a'); rr(X + 4, GY - 9, 10, 3, '#2a2a3a'); rr(X + 6, GY - 8, 2, 1, '#ff4f7a');
            rr(X + 2, GY - 41, 32, 26, '#100a1c'); rr(X + 4, GY - 39, 28, 21, t.s ? '#1a3a2a' : '#22263a');
            if (t.s) { var bx = X + 6 + Math.abs((f % 40) - 20), by = GY - 37 + Math.abs(((f * 1.3) % 30) - 15); rr(bx, by, 3, 3, '#9bbc0f'); rr(X + 6, GY - 22, 6, 2, '#ffd45e'); rr(X + 24, GY - 22 - ((f >> 3) % 3), 4, 2, '#ff6fa6'); for (var sl = 0; sl < 21; sl += 3) rr(X + 4, GY - 39 + sl, 28, 1, 'rgba(0,0,0,.18)'); }
            else rr(X + 7, GY - 36, 6, 2, 'rgba(255,255,255,.18)');
          }, use: function (t, G) { t.s = 1; t.n = (t.n || 0) + 1; tune([72, 76, 79, 84, 79, 88], 80, 'square', 0.035); if (t.n >= 3) payOnce(G, t, 3, 'HIGH SCORE!'); else popText('PLAYING... ' + t.n + '/3', '#9bbc0f'); } },
        { id: 'fridge', x: 68, w: 24, label: 'FRIDGE', max: 3, draw: function (X, t, f) {
            rr(X - 1, GY - 49, 26, 49, '#100a1c'); rr(X, GY - 48, 24, 48, '#dfe8f0'); rr(X, GY - 30, 24, 1, '#9aa8b8'); rr(X + 19, GY - 44, 2, 8, '#9aa8b8'); rr(X + 19, GY - 26, 2, 10, '#9aa8b8');
            rr(X + 4, GY - 44, 4, 4, '#ff6fa6'); rr(X + 10, GY - 42, 4, 3, '#ffd45e');
            if (t.a > 0) { t.a--; rr(X + 24, GY - 29, 10, 29, '#c8d0dc'); rr(X + 1, GY - 29, 22, 28, '#fff8d0'); rr(X + 4, GY - 20, 6, 4, '#ff8a3a'); rr(X + 13, GY - 10, 6, 6, '#7fd3ff'); rr(X + 4, GY - 9, 4, 5, '#5dbf6a'); }
          }, use: function (t, G) { t.a = 50; beep(180, 0.08, 'square', 0.04); setTimeout(function () { beep(880, 0.05, 'sine', 0.03); }, 90); payOnce(G, t, 3, 'SNACK!', '#ff8a3a', true); } },
        { id: 'plant', x: 104, w: 16, label: 'WATER', max: 3, draw: function (X, t, f) {
            rr(X + 2, GY - 10, 12, 10, '#c86a3a'); rr(X + 1, GY - 11, 14, 2, '#e88a4a'); var hgt = 6 + (t.s || 0) * 7;
            rr(X + 7, GY - 10 - hgt, 2, hgt, '#3a8a3a'); for (var k = 0; k < (t.s || 0) + 1; k++) { var ly = GY - 14 - k * 7, sd = k % 2 ? -1 : 1; rr(X + 8 + sd * 2 + (sd < 0 ? -3 : 0), ly + Math.round(Math.sin(f * 0.05 + k)), 4, 2, '#5dbf6a'); }
            if (t.s >= 3) { var fy = GY - 12 - hgt; rr(X + 5, fy - 2, 6, 6, '#ff6fa6'); rr(X + 7, fy, 2, 2, '#ffd45e'); }
            if (t.a > 0) { t.a--; for (var d = 0; d < 3; d++) rr(X + 4 + d * 4, GY - 34 + ((30 - t.a) * 1.2 + d * 5) % 22, 1, 2, '#7fd3ff'); }
          }, use: function (t, G) { if ((t.s || 0) >= 3) { popText('IT LOVES YOU', '#5dbf6a'); return; } t.s = (t.s || 0) + 1; t.a = 30; tune([76 + t.s * 2, 79 + t.s * 2], 90, 'sine', 0.04); if (t.s >= 3) payOnce(G, t, 3, 'BLOOM!', '#ff6fa6'); else popText('GROWING ' + t.s + '/3', '#5dbf6a'); } },
        { id: 'cat', x: 138, w: 28, label: 'PET', max: 3, draw: function (X, t, f) {
            rr(X, GY - 5, 28, 5, '#a83a4a'); rr(X + 2, GY - 7, 24, 3, '#c84a5a'); g.drawImage(P.cat[Math.floor(f / (t.paid ? 12 : 30)) % 2], X + 8, GY - 9);
            if (t.paid && f % 50 < 30) PX.text(g, 'Z', X + 20, GY - 20 - (f % 50) / 10, '#ffffff', '#000');
          }, step: function (t, G, Rm, near, f) {
            if (!near || !Rm.on || Rm.plat) return; if (Rm.t % 24 === 0) { t.n = (t.n || 0) + 1; particle(t.x + 14 - Rm.cam, GY - 14, 0, -0.5, 40, '#ff6fa6', 2, 0); beep(880 + t.n * 40, 0.06, 'sine', 0.03); }
            if (t.n >= 5) payOnce(G, t, 3, 'PURR~', '#ff6fa6', true);
          }, use: function (t) { beep(1200, 0.05, 'sine', 0.03); popText('STAY CLOSE TO PET', '#ff6fa6'); } },
        { id: 'window', x: 180, w: 36, label: 'CURTAIN', max: 1, draw: function (X, t, f) {
            window4(X + 2, GY - 84, 32, 30, '#6e6a8a', t.s ? '#1a2a5a' : '#ff9f6a', f);
            if (t.s) { rr(X + 22, GY - 80, 5, 5, '#fff1a8'); rr(X + 23, GY - 80, 5, 4, '#1a2a5a'); }
            var op = t.s ? 4 : 15; rr(X - 2, GY - 88, op, 36, '#c84a5a'); rr(X + 38 - op, GY - 88, op, 36, '#c84a5a'); rr(X - 4, GY - 89, 44, 2, '#100a1c');
          }, use: function (t, G) { t.s = !t.s; beep(t.s ? 660 : 520, 0.08, 'triangle', 0.03); if (t.s) payOnce(G, t, 1, 'STARRY NIGHT', '#b48cff'); } },
        { id: 'radio', x: 226, w: 22, label: 'RADIO', max: 1, draw: function (X, t, f) {
            rr(X + 2, GY - 34, 18, 12, '#100a1c'); rr(X + 3, GY - 33, 16, 10, '#c8804a'); rr(X + 5, GY - 31, 6, 6, '#3a2418'); rr(X + 13, GY - 31, 4, 2, '#ffd45e'); rr(X + 15, GY - 40, 1, 6, '#100a1c');
            if (t.a > 0) { t.a--; if (f % 16 < 8) PX.text(g, '+', X + 20, GY - 44 - (f % 16) / 3, '#ffd45e', '#000'); }
          }, use: function (t, G) { var songs = [[72, 74, 76, 79, 76, 74, 72], [67, 71, 74, 79, 78, 74], [76, 76, 79, 81, 79, 76, 74, 72]]; t.k = ((t.k || 0) + 1) % 3; t.a = 150; tune(songs[t.k], 150, 'triangle', 0.04); payOnce(G, t, 1, 'GROOVY'); } },
        { id: 'shelf', x: 262, w: 40, label: 'BOOKS', max: 0, draw: function (X, t, f) {
            rr(X - 1, GY - 51, 42, 51, '#100a1c'); rr(X, GY - 50, 40, 50, '#5a3a28'); var bc = ['#c84a5a', '#4a8ad4', '#e8b04a', '#5dbf6a', '#b48cff'];
            for (var s2 = 0; s2 < 3; s2++) { rr(X + 2, GY - 48 + s2 * 16 + 13, 36, 2, '#3a2418'); for (var b2 = 0; b2 < 8; b2++) { var out = t.paid && s2 === 1 && b2 === 5 ? 3 : 0; rr(X + 3 + b2 * 4 + out, GY - 48 + s2 * 16 + 3 + (b2 % 3), 3, 10 - (b2 % 3), bc[(b2 + s2 * 3) % 5]); } }
            if (!t.paid && f % 90 < 6) rr(X + 24, GY - 30, 1, 1, '#ffffff');
          }, use: function (t, G) { if (t.paid) { popText('JUST BOOKS NOW', '#ffffff'); return; } t.paid = 1; SFX.power(); popText('SECRET BOOK!', '#ffd45e'); givePower(G, PWK[Math.floor(R() * 3)]); } }
      ]
    },
    tea: {
      name: '樱之茶室', en: 'SAKURA TEA HOUSE', W: 400, plats: [[290, GY - 24, 30], [326, GY - 48, 26]], items: [[328, GY - 60], [336, GY - 60], [344, GY - 60], [352, GY - 60]],
      bg: function (Rm, sx, f) {
        rr(0, 0, W, GY, '#efe2c4'); var cm = Math.round(Rm.cam);
        for (var x0 = -(cm % 24); x0 < W; x0 += 24) rr(x0, 0, 2, GY, '#6a4a30'); for (var y0 = 12; y0 < GY - 16; y0 += 18) rr(0, y0, W, 1, '#8a6a48');
        rr(0, GY - 16, W, 16, '#7a5a3a'); rr(0, GY, W, H - GY, '#c8b878'); for (var x1 = -(cm % 48); x1 < W; x1 += 48) rr(x1, GY, 2, H - GY, '#6a5a30');
        for (var p = 0; p < 5; p++) { var px0 = ((p * 83 - cm * 0.3 + f * 0.4) % (W + 20) + W + 20) % (W + 20) - 10, py0 = (p * 31 + f * 0.35) % (GY - 10); rr(px0, py0, 2, 1, '#ff9fc4'); }
      },
      toys: [
        { id: 'tea', x: 28, w: 30, label: 'TEA', max: 5, draw: function (X, t, f) {
            rr(X, GY - 10, 30, 3, '#3a2418'); rr(X + 3, GY - 7, 3, 7, '#3a2418'); rr(X + 24, GY - 7, 3, 7, '#3a2418');
            rr(X + 4, GY - 16, 8, 6, '#2a2a2a'); rr(X + 11, GY - 15, 3, 1, '#2a2a2a'); rr(X + 18, GY - 14, 8, 4, '#5dbf6a'); rr(X + 19, GY - 15, 6, 1, '#9fe0a0');
            var s = t.s || 0; if (s >= 1 && s < 3 && f % 8 < 4) rr(X + 21, GY - 17, 2, 1, '#e8ffe8');
            if (s === 2 && t.a > 0) rr(X + 14, GY - 20 + (f % 4), 1, 4, '#9fe0a0');
            if (s >= 3) for (var k = 0; k < 3; k++) rr(X + 20 + k * 2, GY - 20 - ((f + k * 9) % 14), 1, 2, 'rgba(255,255,255,.7)');
            if (t.a > 0) t.a--;
          }, use: function (t, G) { var s = t.s || 0; if (s >= 3) { popText('ICHIGO ICHIE', '#5dbf6a'); return; } t.s = s + 1; t.a = 40; tune([PENT_N[s * 2], PENT_N[s * 2 + 1]], 160, 'triangle', 0.045);
            popText(['WHISK...', 'POUR...', 'SIP~'][s], '#5dbf6a'); if (t.s >= 3) payOnce(G, t, 5, 'TEA CEREMONY', '#5dbf6a'); } },
        { id: 'koi', x: 70, w: 50, label: 'FEED KOI', max: 3, draw: function (X, t, f) {
            rr(X, GY - 2, 50, 4, '#3a5a6a'); rr(X + 2, GY - 1, 46, 3, '#4a8ad4'); rr(X - 2, GY - 4, 4, 4, '#8a8a8a'); rr(X + 48, GY - 4, 4, 4, '#8a8a8a');
            for (var k = 0; k < 2; k++) { var a = f * (0.03 + (t.n || 0) * 0.01) + k * 3.1, kx = X + 25 + Math.cos(a) * 18, ky = GY + Math.sin(a) * 1; rr(kx, ky, 4, 1, k ? '#ffffff' : '#ff8a3a'); rr(kx + (Math.sin(a) > 0 ? -1 : 4), ky, 1, 1, '#ff4f6a'); }
            if (t.a > 0) { t.a--; rr(X + 25 + Math.sin(t.a) * 6, GY - 3 + (40 - t.a) % 3, 1, 1, '#ffd45e'); }
          }, use: function (t, G) { t.n = (t.n || 0) + 1; t.a = 40; window.SND && SND.noise(0.12, 0.05, 1200); beep(300, 0.1, 'sine', 0.03, 600); if (t.n >= 3) payOnce(G, t, 3, 'HAPPY KOI', '#ff8a3a'); else popText('NOM ' + t.n + '/3', '#ff8a3a'); } },
        { id: 'chime', x: 130, w: 12, label: 'CHIME', max: 1, draw: function (X, t, f) {
            var sw = t.a > 0 ? Math.sin(t.a * 0.4) * 3 * t.a / 60 : Math.sin(f * 0.03); if (t.a > 0) t.a--;
            rr(X + 6, 0, 1, GY - 78, '#6a4a30'); rr(X + 1 + sw, GY - 78, 10, 4, '#7fd3ff'); rr(X + 6 + sw * 1.5, GY - 74, 1, 10, '#e8e8e8'); rr(X + 3 + sw * 2, GY - 64, 6, 8, '#fff8f0'); rr(X + 4 + sw * 2, GY - 62, 4, 1, '#ff6fa6');
          }, use: function (t, G) { t.a = 60; var seq = [0, 1, 2, 3, 4].map(function () { return PENT_N[2 + Math.floor(R() * 6)] + 12; }); tune(seq, 110, 'sine', 0.03); payOnce(G, t, 1, 'RIN~', '#7fd3ff'); } },
        { id: 'bonsai', x: 154, w: 20, label: 'TRIM', max: 1, draw: function (X, t, f) {
            rr(X + 3, GY - 6, 14, 6, '#4a4a6a'); rr(X + 9, GY - 14, 2, 8, '#6a4a30'); rr(X + 5, GY - 16, 5, 2, '#6a4a30');
            var trim = t.paid ? 0 : 2; rr(X + 1 - trim, GY - 22 - trim, 10 + trim * 2, 6 + trim, '#3a8a3a'); rr(X + 9, GY - 20, 9, 5, '#5dbf6a');
            if (t.a > 0) { t.a--; for (var k = 0; k < 3; k++) rr(X + 3 + k * 5, GY - 20 + (30 - t.a) * 0.6 + k, 2, 1, '#5dbf6a'); }
          }, use: function (t, G) { t.a = 30; beep(1400, 0.03, 'square', 0.02); setTimeout(function () { beep(1500, 0.03, 'square', 0.02); }, 80); payOnce(G, t, 1, 'NEAT!', '#5dbf6a'); } },
        { id: 'scroll', x: 184, w: 22, label: 'READ', max: 1, draw: function (X, t, f, Rm) {
            rr(X, GY - 88, 22, 2, '#6a4a30'); rr(X + 2, GY - 86, 18, 42, '#fff8e8'); rr(X, GY - 44, 22, 2, '#6a4a30'); rr(X + 9, GY - 82, 4, 32, 'rgba(26,16,48,.12)');
            for (var k = 0; k < 4; k++) rr(X + 9, GY - 80 + k * 9, 4, 5, '#1a1030');
            if (t.a > 0) { t.a--; drawCN('一期一会', W / 2, 60, 10, '#1a1030', 'center', '#ffffff'); }
          }, use: function (t, G) { t.a = 150; tune([69, 74, 76], 220, 'triangle', 0.035); payOnce(G, t, 1, 'ONE CHANCE, ONE MEETING', '#ffffff'); } },
        { id: 'taiko', x: 218, w: 24, label: 'DRUM', max: 2, draw: function (X, t, f) {
            var b = t.a > 0 ? 1 : 0; if (t.a > 0) t.a--;
            rr(X + 2, GY - 6, 3, 6, '#3a2418'); rr(X + 19, GY - 6, 3, 6, '#3a2418'); rr(X, GY - 24 + b, 24, 18, '#a83a2a'); rr(X + 1, GY - 23 + b, 22, 3, '#f0e0c0'); rr(X + 1, GY - 10 + b, 22, 2, '#f0e0c0');
            for (var k = 0; k < 4; k++) rr(X + 3 + k * 6, GY - 19 + b, 2, 2, '#ffd45e');
          }, use: function (t, G) { t.a = 8; t.n = (t.n || 0) + 1; beep(90, 0.22, 'sine', 0.09, 50); window.SND && SND.noise(0.06, 0.06, 500); if (t.n >= 4) payOnce(G, t, 2, 'DON DON!', '#ff4f6a'); } },
        { id: 'lantern', x: 254, w: 14, label: 'LIGHT', max: 1, draw: function (X, t, f) {
            rr(X + 6, 0, 1, GY - 72, '#3a2418'); rr(X + 1, GY - 72, 12, 16, '#100a1c'); rr(X + 2, GY - 71, 10, 14, t.s ? (f % 20 < 10 ? '#ffb84f' : '#ffd45e') : '#d8c8a8'); rr(X + 2, GY - 66, 10, 1, '#a83a2a');
            if (t.s) rr(X - 8, GY - 78, 30, 28, 'rgba(255,184,79,.15)');
          }, use: function (t, G) { t.s = !t.s; beep(t.s ? 880 : 440, 0.1, 'triangle', 0.03); if (t.s) payOnce(G, t, 1, 'GLOW', '#ffb84f'); } }
      ]
    },
    lodge: {
      name: '雪原小屋', en: 'SNOW LODGE', W: 400, plats: [[280, GY - 24, 30], [318, GY - 48, 28]], items: [[320, GY - 60], [328, GY - 60], [336, GY - 60], [344, GY - 60]],
      bg: function (Rm, sx, f) {
        rr(0, 0, W, GY, '#5a3a28'); for (var y0 = 4; y0 < GY; y0 += 10) { rr(0, y0, W, 1, '#3a2418'); rr(0, y0 + 1, W, 2, '#6a4a32'); }
        rr(0, GY, W, H - GY, '#7a5a3a'); rr(0, GY, W, 2, '#8a6a48'); var wx = sx(330); window4(wx, GY - 84, 28, 26, '#3a2418', '#2a3a6a', f, true);
        rr(sx(60) - 30, GY - 1, 70, 2, '#3a6a9a');
      },
      toys: [
        { id: 'fire', x: 22, w: 40, label: 'STOKE', max: 2, draw: function (X, t, f) {
            rr(X - 1, GY - 46, 42, 46, '#100a1c'); rr(X, GY - 45, 40, 45, '#7a7a8a'); for (var k = 0; k < 5; k++) rr(X + (k % 2) * 6, GY - 44 + k * 9, 40 - (k % 2) * 6, 1, '#5a5a6a');
            rr(X + 8, GY - 26, 24, 26, '#1a0a0a'); rr(X - 3, GY - 48, 46, 4, '#5a3a28'); var lv = (t.s || 0) + 1;
            for (var k2 = 0; k2 < 5; k2++) { var fh = 3 + lv * 3 + Math.round(Math.sin(f * 0.3 + k2 * 2) * 2); rr(X + 10 + k2 * 4, GY - 3 - fh, 3, fh, k2 % 2 ? '#ff8a3a' : '#ffd45e'); }
            rr(X + 10, GY - 3, 20, 3, '#6a3a1a'); if (lv > 2) rr(X - 10, GY - 40, 60, 40, 'rgba(255,140,60,.08)');
          }, use: function (t, G) { if ((t.s || 0) >= 3) { popText('TOASTY', '#ff8a3a'); return; } t.s = (t.s || 0) + 1; window.SND && SND.noise(0.3, 0.06, 900); tune([62 + t.s * 3], 100, 'triangle', 0.04); if (t.s >= 3) payOnce(G, t, 2, 'COZY FIRE', '#ff8a3a', true); else popText('CRACKLE ' + t.s + '/3', '#ff8a3a'); } },
        { id: 'cocoa', x: 72, w: 20, label: 'COCOA', max: 3, draw: function (X, t, f) {
            shelfPlat(X - 4, GY - 16, 28, '#a86a3a', '#7a4a28'); rr(X + 4, GY - 24, 9, 8, '#ffffff'); rr(X + 13, GY - 22, 2, 4, '#ffffff'); rr(X + 5, GY - 23, 7, 2, '#7a4a28');
            if (!t.paid || f % 60 < 40) for (var k = 0; k < 2; k++) rr(X + 6 + k * 3, GY - 28 - ((f + k * 11) % 12), 1, 2, 'rgba(255,255,255,.7)');
          }, use: function (t, G) { beep(500, 0.25, 'sine', 0.04, 300); payOnce(G, t, 3, 'HOT COCOA', '#c8804a'); } },
        { id: 'globe', x: 102, w: 14, label: 'SHAKE', max: 1, draw: function (X, t, f) {
            shelfPlat(X - 2, GY - 16, 18, '#a86a3a', '#7a4a28'); var jx = t.a > 60 ? Math.round(Math.sin(t.a) * 2) : 0;
            rr(X + 2 + jx, GY - 19, 10, 3, '#8a4a2a'); rr(X + 2 + jx, GY - 29, 10, 10, '#bfe8ff'); rr(X + 6 + jx, GY - 24, 2, 4, '#ffffff');
            if (t.a > 0) { t.a--; for (var k = 0; k < 5; k++) rr(X + 3 + jx + (k * 7 + t.a) % 8, GY - 28 + (k * 3 + (90 - t.a) * 0.15) % 8, 1, 1, '#ffffff'); }
          }, use: function (t, G) { t.a = 90; tune([96, 93, 91, 88, 86], 70, 'sine', 0.025); payOnce(G, t, 1, 'SNOW DAY', '#bfe8ff'); } },
        { id: 'skis', x: 128, w: 16, label: 'SKIS', max: 1, draw: function (X, t, f) {
            var j = t.a > 0 ? Math.round(Math.sin(t.a * 0.8) * 1.5) : 0; if (t.a > 0) t.a--;
            rr(X + 3 + j, GY - 70, 3, 52, '#c84a5a'); rr(X + 9 - j, GY - 70, 3, 52, '#4a8ad4'); rr(X + 2 + j, GY - 72, 4, 3, '#c84a5a'); rr(X + 8 - j, GY - 72, 4, 3, '#4a8ad4'); rr(X, GY - 50, 16, 2, '#3a2418');
          }, use: function (t, G) { t.a = 30; beep(300, 0.05, 'square', 0.03); setTimeout(function () { beep(260, 0.05, 'square', 0.03); }, 60); payOnce(G, t, 1, 'NEXT WINTER!', '#4a8ad4'); } },
        { id: 'chair', x: 154, w: 26, label: 'ROCK', max: 1, draw: function (X, t, f) {
            var r = t.a > 0 ? Math.sin(t.a * 0.12) * 3 : 0; if (t.a > 0) { t.a--; if (f % 50 < 25) PX.text(g, 'Z', X + 22, GY - 40 - (f % 50) / 8, '#ffffff', '#000'); }
            rr(X + 2 + r, GY - 36, 4, 30, '#7a4a28'); rr(X + 2 + r, GY - 14, 22, 4, '#a86a3a'); rr(X + 4, GY - 3, 20, 2, '#7a4a28'); rr(X + 4 + r * 0.5, GY - 10, 3, 8, '#7a4a28'); rr(X + 19 + r * 0.5, GY - 10, 3, 8, '#7a4a28'); rr(X + 6 + r, GY - 18, 16, 4, '#c84a5a');
          }, use: function (t, G) { t.a = 200; [0, 600, 1200].forEach(function (d) { setTimeout(function () { beep(140, 0.12, 'triangle', 0.025, 110); }, d); }); payOnce(G, t, 1, 'SO RELAXING', '#c84a5a'); } },
        { id: 'snowman', x: 192, w: 38, label: 'WAVE', max: 1, draw: function (X, t, f) {
            window4(X + 2, GY - 86, 34, 32, '#3a2418', '#2a3a6a', f, true); rr(X + 2, GY - 58, 34, 4, '#ffffff');
            rr(X + 14, GY - 70, 10, 10, '#ffffff'); rr(X + 15, GY - 77, 8, 7, '#ffffff'); rr(X + 17, GY - 75, 1, 1, '#100a1c'); rr(X + 20, GY - 75, 1, 1, '#100a1c'); rr(X + 18, GY - 73, 3, 1, '#ff8a3a');
            var arm = t.a > 0 ? Math.round(Math.sin(t.a * 0.4) * 3) : 0; if (t.a > 0) t.a--; rr(X + 24, GY - 68 - arm, 6, 1, '#6a4a30'); rr(X + 8, GY - 68, 6, 1, '#6a4a30');
          }, use: function (t, G) { t.a = 90; tune([79, 76, 84], 120, 'square', 0.03); payOnce(G, t, 1, 'HI SNOWMAN', '#ffffff'); } },
        { id: 'phono', x: 240, w: 22, label: 'MUSIC', max: 1, draw: function (X, t, f) {
            shelfPlat(X - 2, GY - 18, 26, '#a86a3a', '#7a4a28'); rr(X + 2, GY - 24, 16, 6, '#3a2418'); rr(X + 4, GY - 25, 12, 2, '#100a1c');
            rr(X + 10, GY - 36, 2, 12, '#e8b04a'); rr(X + 8, GY - 44, 10, 9, '#e8b04a'); rr(X + 10, GY - 42, 6, 5, '#7a4a28');
            if (t.a > 0) { t.a--; if (f % 18 < 9) PX.text(g, '+', X + 20, GY - 50 - (f % 18) / 3, '#e8b04a', '#000'); }
          }, use: function (t, G) { t.a = 200; tune([67, null, 71, 74, null, 74, 72, null, 71, 69, null, 67], 160, 'triangle', 0.035); payOnce(G, t, 1, 'WALTZ', '#e8b04a'); } }
      ]
    },
    cabin: {
      name: '山间木屋', en: 'MOUNTAIN CABIN', W: 400, plats: [[270, GY - 24, 30], [310, GY - 48, 30]], items: [[312, GY - 60], [320, GY - 60], [328, GY - 60], [336, GY - 60]],
      bg: function (Rm, sx, f) {
        rr(0, 0, W, GY, '#6a4a2e'); var cm = Math.round(Rm.cam); for (var x0 = -(cm % 14); x0 < W; x0 += 14) { rr(x0, 0, 1, GY, '#4a3020'); rr(x0 + 5, 20 + (x0 * 7 & 31), 2, 2, '#4a3020'); }
        rr(0, GY, W, H - GY, '#5a3e26'); rr(0, GY, W, 2, '#7a5636'); var wx = sx(196); window4(wx, GY - 84, 30, 28, '#3a2418', '#1a1a4a', f);
        var ax = sx(150); rr(ax, GY - 90, 12, 3, '#d8c8a8'); rr(ax - 2, GY - 96, 2, 8, '#d8c8a8'); rr(ax + 12, GY - 96, 2, 8, '#d8c8a8');
      },
      toys: [
        { id: 'guitar', x: 22, w: 18, label: 'STRUM', max: 3, draw: function (X, t, f) {
            var v = t.a > 0 ? Math.round(Math.sin(t.a * 1.3)) : 0; if (t.a > 0) t.a--;
            rr(X + 3, GY - 18, 12, 14, '#c8804a'); rr(X + 4, GY - 24, 10, 7, '#c8804a'); rr(X + 7, GY - 14, 4, 4, '#3a2418'); rr(X + 8, GY - 46, 2, 24, '#7a4a28'); rr(X + 7, GY - 50, 4, 5, '#3a2418');
            rr(X + 8 + v, GY - 44, 1, 32, '#e8e8e8');
          }, use: function (t, G) { var ch = [[60, 64, 67, 72], [55, 59, 62, 67], [57, 60, 64, 69], [53, 57, 60, 65]][(t.n || 0) % 4]; t.n = (t.n || 0) + 1; t.a = 30; tune(ch, 45, 'triangle', 0.035);
            if (t.n >= 4) payOnce(G, t, 3, 'CAMPFIRE SONG', '#c8804a'); else popText('STRUM ' + t.n + '/4', '#c8804a'); } },
        { id: 'map', x: 52, w: 36, label: 'MAP', max: 2, draw: function (X, t, f) {
            rr(X, GY - 76, 36, 26, '#100a1c'); rr(X + 1, GY - 75, 34, 24, '#e8d8a8'); rr(X + 4, GY - 66, 10, 6, '#7ac27a'); rr(X + 18, GY - 72, 8, 5, '#8a8a9a'); rr(X + 6, GY - 58, 24, 1, '#4a8ad4');
            if ((t.s || 0) >= 1) for (var k = 0; k < 6; k++) rr(X + 6 + k * 4, GY - 62 - (k % 2) * 3, 2, 1, '#c84a5a');
            if ((t.s || 0) >= 2) { rr(X + 28, GY - 68, 1, 1, '#c84a5a'); PX.text(g, 'X', X + 27, GY - 70, f % 20 < 10 ? '#ff4f6a' : '#ffd45e'); }
          }, use: function (t, G) { var s = t.s || 0; if (s >= 2) { popText('ALREADY FOUND IT', '#e8d8a8'); return; } t.s = s + 1; beep(600, 0.06, 'triangle', 0.03);
            if (t.s === 1) popText('A TRAIL... LOOK AGAIN', '#e8d8a8'); else { payOnce(G, t, 2, 'SECRET SPOT!', '#ff4f6a'); givePower(G, PWK[Math.floor(R() * 3)]); } } },
        { id: 'stove', x: 98, w: 28, label: 'COOK', max: 3, draw: function (X, t, f) {
            rr(X, GY - 22, 28, 22, '#2a2a3a'); rr(X + 1, GY - 21, 26, 2, '#4a4a5a'); rr(X + 4, GY - 14, 20, 10, '#1a1a24'); rr(X + 12, GY - 60, 4, 38, '#2a2a3a');
            var s = t.s || 0; if (s > 0) { rr(X + 6, GY - 12, 16, 6, f % 6 < 3 ? '#ff8a3a' : '#ffd45e'); rr(X + 4, GY - 25, 18, 3, '#5a5a6a'); rr(X + 22, GY - 24, 6, 1, '#5a5a6a');
              rr(X + 8, GY - 28, 10, 3, s >= 3 ? '#c8804a' : '#bfe8ff'); if (f % 10 < 5) rr(X + 10 + (f % 7), GY - 32 - (f % 5), 1, 1, '#ffffff'); }
          }, use: function (t, G) { var s = t.s || 0; if (s >= 3) { popText('YUM, ALL GONE', '#c8804a'); return; } t.s = s + 1; window.SND && SND.noise(0.35, 0.05, 3000); beep(200 + s * 80, 0.1, 'square', 0.025);
            if (t.s >= 3) payOnce(G, t, 3, 'GRILLED FISH', '#c8804a', true); else popText(['SIZZLE...', 'FLIP!'][s], '#ff8a3a'); } },
        { id: 'wood', x: 136, w: 26, label: 'CHOP', max: 1, draw: function (X, t, f) {
            for (var k = 0; k < 3; k++) { rr(X + k * 8, GY - 7, 7, 7, '#a86a3a'); rr(X + 2 + k * 8, GY - 5, 3, 3, '#e8b070'); } rr(X + 4, GY - 13, 7, 6, '#a86a3a'); rr(X + 12, GY - 13, 7, 6, '#a86a3a');
            var up = t.a > 10; if (t.a > 0) t.a--; rr(X + 22, GY - (up ? 30 : 20), 2, 16, '#7a4a28'); rr(X + 19, GY - (up ? 32 : 22), 6, 4, '#c8c8d8');
          }, use: function (t, G) { t.a = 20; setTimeout(function () { beep(120, 0.08, 'square', 0.05, 60); window.SND && SND.noise(0.08, 0.08, 1500); }, 150); payOnce(G, t, 1, 'THWACK', '#a86a3a'); } },
        { id: 'lamp', x: 170, w: 14, label: 'LAMP', max: 1, draw: function (X, t, f) {
            rr(X + 6, 0, 1, GY - 66, '#2a2a2a'); rr(X + 2, GY - 66, 10, 12, '#100a1c'); rr(X + 3, GY - 65, 8, 10, t.s ? '#ffd47a' : '#5a5a4a'); rr(X + 2, GY - 54, 10, 2, '#2a2a2a');
            if (t.s) rr(X - 14, GY - 70, 42, 40, 'rgba(255,212,122,.12)');
          }, use: function (t, G) { t.s = !t.s; beep(t.s ? 1000 : 600, 0.04, 'square', 0.03); if (t.s) payOnce(G, t, 1, 'WARM LIGHT', '#ffd47a'); } },
        { id: 'scope', x: 230, w: 22, label: 'LOOK', max: 1, draw: function (X, t, f) {
            rr(X + 4, GY - 16, 2, 16, '#3a2418'); rr(X + 14, GY - 16, 2, 16, '#3a2418'); rr(X + 9, GY - 18, 2, 18, '#3a2418');
            g.save(); g.translate(X + 10, GY - 20); g.rotate(-0.5); rr(-10, -2, 22, 5, '#c8a050'); rr(10, -3, 3, 7, '#8a6a30'); g.restore();
            if (t.a > 0) { t.a--; var r = 2 + Math.round(Math.sin(t.a * 0.2) * 2); rr(sxStar(X) - r, GY - 74 - r / 2, r * 2 + 1, 1, '#ffffff'); rr(sxStar(X), GY - 74 - r, 1, r * 2 + 1, '#ffffff'); }
          }, use: function (t, G) { t.a = 120; tune([84, 88, 91, 96], 90, 'sine', 0.025); payOnce(G, t, 1, 'SHOOTING STAR', '#ffffff'); } },
        { id: 'cuckoo', x: 252, w: 16, label: 'CLOCK', max: 1, draw: function (X, t, f) {
            rr(X, GY - 84, 16, 18, '#7a4a28'); rr(X - 2, GY - 86, 20, 3, '#4a2a18'); rr(X + 4, GY - 80, 8, 8, '#e8d8a8'); rr(X + 7, GY - 79, 1, 4, '#100a1c'); rr(X + 7, GY - 76, 3, 1, '#100a1c');
            rr(X + 7, GY - 66, 1, 8 + Math.round(Math.sin(f * 0.1) * 2), '#e8b04a');
            if (t.a > 0) { t.a--; var o = Math.min(6, (60 - Math.abs(t.a - 60)) / 3); rr(X + 6, GY - 90 - o, 5, 4, '#ffd45e'); rr(X + 11, GY - 89 - o, 2, 1, '#ff8a3a'); }
          }, use: function (t, G) { t.a = 120; [0, 400].forEach(function (d) { setTimeout(function () { tune([84, 79], 140, 'sine', 0.035); }, d); }); payOnce(G, t, 1, 'CUCKOO!', '#ffd45e'); } }
      ]
    },
    party: {
      name: '一圈完成！', en: 'LOOP CLEAR PARTY', W: 380, plats: [], items: [[318, GY - 40], [330, GY - 46], [342, GY - 40]],
      bg: function (Rm, sx, f) {
        rr(0, 0, W, GY, '#2a1a4a'); var cm = Math.round(Rm.cam);
        for (var k = 0; k < 6; k++) { var lx = ((k * 70 - cm * 0.5) % 420 + 420) % 420 - 20, c = ['#ff4fa3', '#4fe3ff', '#ffd45e'][(k + (f >> 4)) % 3]; g.fillStyle = c; g.globalAlpha = 0.18; g.beginPath(); g.moveTo(lx, 0); g.lineTo(lx - 30, GY); g.lineTo(lx + 30, GY); g.fill(); g.globalAlpha = 1; }
        for (var x0 = -(cm % 16); x0 < W; x0 += 16) { rr(x0, 6, 16, 1, '#8a6aba'); g.fillStyle = ['#ff4fa3', '#ffd45e', '#4fe3ff', '#5dbf6a'][((x0 + cm) >> 4 & 3)]; g.beginPath(); g.moveTo(x0 + 2, 7); g.lineTo(x0 + 14, 7); g.lineTo(x0 + 8, 15); g.fill(); }
        rr(0, GY, W, H - GY, '#3a2a5a'); for (var x1 = -(cm % 16); x1 < W; x1 += 16) rr(x1 + (((x1 + cm) >> 4) % 2) * 8, GY, 8, H - GY, '#4a3a6a');
        for (var c2 = 0; c2 < 14; c2++) { var cx = ((c2 * 53 - cm + f * (0.3 + (c2 % 3) * 0.2)) % (W + 10) + W + 10) % (W + 10) - 5, cy = (c2 * 29 + f * (0.4 + (c2 % 4) * 0.15)) % GY; rr(cx, cy, 2, 2, ['#ff4fa3', '#4fe3ff', '#ffd45e', '#ffffff'][c2 % 4]); }
      },
      toys: [
        { id: 'cake', x: 30, w: 28, label: 'CANDLES', max: 5, draw: function (X, t, f) {
            shelfPlat(X - 4, GY - 14, 36, '#e8e8f8', '#b8b8d8'); rr(X + 2, GY - 26, 24, 12, '#ff9fc4'); rr(X + 2, GY - 26, 24, 2, '#ffffff'); rr(X + 2, GY - 19, 24, 2, '#c84a8a');
            for (var k = 0; k < 4; k++) { rr(X + 5 + k * 6, GY - 32, 1, 6, '#7fd3ff'); if (!t.paid) rr(X + 5 + k * 6, GY - 35 + (f + k) % 2, 1, 2, '#ffd45e'); }
          }, use: function (t, G, Rm) { if (t.paid) { popText('HAPPY LOOP DAY!', '#ff9fc4'); return; } tune([67, 67, 69, 67, 72, 71, null, 67, 67, 69, 67, 74, 72], 140, 'triangle', 0.04); roomBurst(Rm, t.x + 14, GY - 34, 30, ['#ff4fa3', '#4fe3ff', '#ffd45e', '#ffffff']); payOnce(G, t, 5, 'WISH MADE', '#ff9fc4'); } },
        { id: 'balloons', x: 72, w: 74, label: 'JUMP!', max: 5, draw: function (X, t, f) {
            if (!t.b) t.b = [0, 0, 0, 0, 0];
            for (var k = 0; k < 5; k++) { if (t.b[k]) continue; var bx = X + 4 + k * 15, by = GY - 44 - (k % 2) * 8 + Math.round(Math.sin(f * 0.05 + k) * 2), c = ['#ff4fa3', '#4fe3ff', '#ffd45e', '#5dbf6a', '#b48cff'][k];
              rr(bx + 4, by + 10, 1, 22 + (k % 2) * 8, '#e8e8e8'); rr(bx + 1, by, 7, 9, c); rr(bx, by + 2, 9, 5, c); rr(bx + 2, by + 1, 2, 2, '#ffffff'); rr(bx + 4, by + 9, 1, 1, c); }
          }, step: function (t, G, Rm) {
            if (!t.b) return; for (var k = 0; k < 5; k++) { if (t.b[k]) continue; var bx = t.x + 8 + k * 15, by = GY - 40 - (k % 2) * 8;
              if (Math.abs(Rm.px + 8 - bx) < 8 && Rm.py - 24 < by + 6 && Rm.py > by - 4) { t.b[k] = 1; G.shards += 1; t.n = (t.n || 0) + 1; popText('POP! +1', '#ffd45e'); window.SND && SND.noise(0.08, 0.1, 4000); beep(900 + k * 120, 0.06, 'square', 0.03); roomBurst(Rm, bx, by, 10, ['#ff4fa3', '#ffffff', '#ffd45e']); } }
          }, use: function () { popText('JUMP INTO THEM!', '#ffd45e'); } },
        { id: 'trophy', x: 160, w: 18, label: 'TROPHY', max: 2, draw: function (X, t, f) {
            shelfPlat(X - 4, GY - 18, 26, '#8a6aba', '#5a3a8a'); rr(X + 3, GY - 22, 12, 4, '#a87a2a'); rr(X + 7, GY - 28, 4, 6, '#e8b04a'); rr(X + 2, GY - 40, 14, 12, '#ffd45e'); rr(X - 1, GY - 38, 3, 6, '#ffd45e'); rr(X + 16, GY - 38, 3, 6, '#ffd45e');
            if (f % 60 < 8) rr(X + 5 + (f % 60), GY - 38, 2, 8, '#ffffff');
          }, use: function (t, G) { tune([72, 76, 79, 84], 90, 'square', 0.035); payOnce(G, t, 2, 'CHAMPION', '#ffd45e'); } },
        { id: 'board', x: 196, w: 92, label: '', max: 0, draw: function (X, t, f, Rm, G) {
            rr(X - 2, GY - 88, 96, 62, '#100a1c'); rr(X, GY - 86, 92, 58, '#1a3a2a'); rr(X, GY - 86, 92, 2, '#5dbf6a'); var s = Rm.sum || {};
            PX.text(g, 'LOOP ' + (s.lap || 1) + ' CLEAR!', X + 6, GY - 82, '#ffd45e', '#000');
            PX.text(g, 'DIST  ' + (s.dist || 0) + 'M', X + 6, GY - 75, '#ffffff'); PX.text(g, 'SHARD +' + (s.shards || 0), X + 6, GY - 69, '#ffffff');
            PX.text(g, 'GOT ' + (s.rate || 0) + '%  HITS ' + (s.hits || 0), X + 6, GY - 63, (s.hits || 0) === 0 ? '#5dff8f' : '#ffffff');
            PX.text(g, 'TIME  ' + (s.time || '0:00'), X + 6, GY - 57, '#ffffff');
            PX.text(g, s.newBest ? 'NEW BEST LAP!' : 'BEST  ' + (s.best || '-'), X + 6, GY - 51, s.newBest ? (f % 20 < 12 ? '#ff6fa6' : '#ffffff') : '#c8bce8');
            PX.text(g, 'SCORE ' + (s.score || 0), X + 6, GY - 45, '#ffffff');
            PX.text(g, 'NEXT LAP:', X + 6, GY - 38, f % 30 < 20 ? '#4fe3ff' : '#ff4fa3');
            var NP = plan(s.next || 1), cx0 = X + 10;
            NP.order.forEach(function (bi, k) { var bb = BIOMES[bi], c = chipCol(bi), xx = cx0 + k * 3; rr(xx, GY - 31, 2, 3, c);
              var mk = bb.boss ? '#ff4f6a' : bb.roam ? '#5dff8f' : NP.houses[k] ? '#ffd45e' : null; if (mk) rr(xx, GY - 27, 2, 1, mk); });
          } },
        { id: 'gift', x: 296, w: 18, label: 'GIFT', max: 0, draw: function (X, t, f) {
            if (t.paid) { rr(X, GY - 10, 18, 10, '#c84a8a'); rr(X - 2, GY - 13 - 4, 22, 3, '#ff4fa3'); return; }
            rr(X, GY - 14, 18, 14, '#ff4fa3'); rr(X + 8, GY - 14, 2, 14, '#ffd45e'); rr(X - 1, GY - 17, 20, 4, '#c84a8a'); rr(X + 8, GY - 17, 2, 4, '#ffd45e'); rr(X + 5, GY - 20, 3, 3, '#ffd45e'); rr(X + 10, GY - 20, 3, 3, '#ffd45e');
          }, use: function (t, G) { if (t.paid) return; t.paid = 1; SFX.power(); popText('PRESENT!', '#ff4fa3'); givePower(G, PWK[Math.floor(R() * 3)]); } }
      ]
    }
  };
  var CHIPS = {};
  function chipCol(bi) { /* one representative colour per world: the average of its thumbnail */
    if (CHIPS[bi]) return CHIPS[bi];
    var c = '#888888'; try { var d = thumb(bi, 6, 4).getContext('2d').getImageData(0, 0, 6, 4).data, r = 0, gg = 0, bb = 0; for (var i = 0; i < d.length; i += 4) { r += d[i]; gg += d[i + 1]; bb += d[i + 2]; }
      var n = d.length / 4, k = 1.35; c = 'rgb(' + Math.min(255, Math.round(r / n * k)) + ',' + Math.min(255, Math.round(gg / n * k)) + ',' + Math.min(255, Math.round(bb / n * k)) + ')'; } catch (e) { }
    return (CHIPS[bi] = c);
  }
  function sxStar(X) { return X - 18; } /* the star shows up in the cabin window next to the telescope */
  /* maximum shards a room can ever give (toy rewards + its loose shards at x2); the server keeps the same numbers */
  function roomMax(theme) { var T = ROOMS[theme]; return T.toys.reduce(function (s, t) { return s + (t.max || 0); }, 0) + T.items.length * 2; }
  var COURT_MAX = 32 * 2 + 3 * 3 + 5 + 10;
  function enterHouse(G, theme) {
    theme = ROOMS[theme] ? theme : 'apt';
    var T = ROOMS[theme];
    var R0 = {
      house: 1, theme: theme, W: T.W, px: 30, py: GY, vx: 0, vy: 0, on: true, plat: null, drop: 0, jumps: 0, face: 1, cam: 0, t: 0, exit: 0, trail: [],
      items: T.items.map(function (p) { return { x: p[0], y: p[1] }; }), plats: T.plats.map(function (p) { return { x: p[0], y: p[1], w: p[2] }; }),
      toys: T.toys.map(function (d) { return { d: d, x: d.x, w: d.w, s: 0, a: 0, n: 0, paid: 0 }; })
    };
    var mem = G.toyMem && G.toyMem[theme]; /* A5: lamps, lanterns and curtains stay the way you left them (this run) */
    if (mem && theme !== 'party') R0.toys.forEach(function (t) { if (mem[t.d.id] !== undefined) t.s = mem[t.d.id]; });
    if (theme === 'party') {
      var L = G.lap0 || { f: 0, s: 0, d: 0 }, secs = Math.round((G.frame - L.f) / 60), ls = G.lapSt || { hits: 0, got: 0, miss: 0 };
      var bl = lsGet('runner-bestlap', 0), nb = secs > 30 && (!bl || secs < bl);
      if (nb) lsSet('runner-bestlap', secs);
      R0.sum = { lap: G.loop, dist: Math.floor(G.dist - L.d), shards: G.shards - L.s, time: mmss(secs), score: score(), hits: ls.hits, rate: ls.got + ls.miss ? Math.round(ls.got / (ls.got + ls.miss) * 100) : 0,
        best: mmss(nb ? secs : bl), newBest: nb && !!bl, next: G.loop };
      G.lap0 = { f: G.frame, s: G.shards, d: G.dist }; G.lapSt = { hits: 0, got: 0, miss: 0 };
    }
    G.roam = R0; G.obs = []; G.plats = []; G.items = []; G.shots = []; G.sliding = false; G.onPlat = null; G.fadeIn = 24; G.rocket = 0; G.climb = null;
    cp(G, 'H:' + theme);
    showBanner(T.name, T.en);
    popText(theme === 'party' ? 'LOOP CLEAR!  V: USE' : 'REST STOP  -  V: USE', '#ffd47a');
    if (theme === 'party') tune([72, 76, 79, 84, 79, 84, 88], 110, 'square', 0.04);
  }
  function mmss(s) { return Math.floor(s / 60) + ':' + ('0' + s % 60).slice(-2); }
  var TOY_KEEP = { window: 1, lantern: 1, lamp: 1 };
  function unlockPhoto(G, th) {
    if (ALBUM[th]) return;
    var d = new Date(); ALBUM[th] = { d: d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2), ch: G.id }; lsSet('runner-album', ALBUM);
    delete PHOTOS[th]; toast(G, 'PHOTO UNLOCKED!  (TITLE > ALBUM)', '#ff9fc4'); SFX.power();
  }
  function nearToy(Rm) {
    var best = null, bd = 1e9;
    Rm.toys.forEach(function (t) { if (!t.d.use) return; var c = t.x + t.w / 2, d = Math.abs(Rm.px + 8 - c); if (d < t.w / 2 + 8 && d < bd) { bd = d; best = t; } });
    return best;
  }
  function houseToys(G, Rm, use) {
    Rm.toys.forEach(function (t) { if (t.d.step) t.d.step(t, G, Rm, Math.abs(Rm.px + 8 - (t.x + t.w / 2)) < t.w / 2 + 4, G.frame); });
    if (!use) return;
    var t = nearToy(Rm); if (t) t.d.use(t, G, Rm);
  }
  function drawHouseRoom(G, Rm, sx, f) {
    var T = ROOMS[Rm.theme];
    T.bg(Rm, sx, f);
    g.fillStyle = '#100a1c'; g.fillRect(sx(0) - 10, 0, 10, H); g.fillRect(sx(Rm.W), 0, 10, H);
    Rm.plats.forEach(function (p) { shelfPlat(sx(p.x), p.y, p.w, '#a86a3a', '#7a4a28'); });
    Rm.toys.forEach(function (t) { var X = sx(t.x); if (X > -120 && X < W + 40) t.d.draw(X, t, f, Rm, G); });
    var dx = sx(Rm.W - 30); g.fillStyle = '#100a1c'; g.fillRect(dx - 1, GY - 33, 20, 33); g.fillStyle = '#5a3a28'; g.fillRect(dx, GY - 32, 18, 32); g.fillStyle = '#ffd45e'; g.fillRect(dx + 3, GY - 16, 2, 2);
    if (f % 40 < 26) PX.text(g, 'EXIT >', dx - 6, GY - 44, '#ffffff', '#000');
    Rm.items.forEach(function (it) { g.drawImage(P.shard[Math.floor((f + it.x) / 6) % 4], sx(it.x), Math.round(it.y + Math.sin(f * 0.1 + it.x) * 2)); });
    var nt = nearToy(Rm);
    if (nt && nt.d.label && Rm.on) { var lb = 'V ' + nt.d.label + (nt.paid && nt.d.max ? ' *' : ''), lw = PX.textWidth(lb); PX.text(g, lb, clamp(sx(nt.x + nt.w / 2) - lw / 2, 2, W - lw - 2), GY - 104 + (f % 30 < 15 ? 0 : 1), nt.paid ? '#9a8fc8' : '#ffffff', '#000'); }
    var paid = Rm.toys.filter(function (t) { return t.paid && t.d.max; }).length, tot = Rm.toys.filter(function (t) { return t.d.max; }).length;
    if (tot) { hudPanel(W - 63, 37, 60, 11); PX.text(g, 'TOYS ' + paid + '/' + tot, W - 33 - PX.textWidth('TOYS ' + paid + '/' + tot) / 2, 40, '#ffd47a', '#1a0f30'); }
  }
  function tickToasts(G) { var q = G.toasts; if (q && q.length && ++q[0].t > 150) q.shift(); }
  function drawToasts(G) {
    var q = G.toasts; if (!q || !q.length) return; var tt = q[0], a = tt.t < 10 ? tt.t / 10 : tt.t > 130 ? (150 - tt.t) / 20 : 1, w = PX.textWidth(tt.text) + 10, y = 54;
    g.globalAlpha = Math.max(0, a); hudPanel(Math.round(W / 2 - w / 2), y, w, 11, tt.col); PX.text(g, tt.text, Math.round(W / 2 - w / 2) + 5, y + 3, tt.col, '#1a0f30'); g.globalAlpha = 1;
  }
  function updateRoam(G) {
    var Rm = G.roam; Rm.t++; tickToasts(G); G.dist -= G.speed / 8; G.scroll -= G.speed;
    if (Rm.t > ROOM_MAX_F && !Rm.exit) { Rm.exit = 1; popText('TIME TO GO!', '#ffffff'); SFX.rift(); }
    if (G.inv > 0) G.inv--;
    if (G.banner) { G.banner.t++; if (G.banner.t > 150) G.banner = null; }
    if (G.pop) { G.pop.t++; if (G.pop.t > 70) G.pop = null; }
    if (G.fadeIn > 0) G.fadeIn--;
    if (G.blend < 1) G.blend = Math.min(1, G.blend + 1 / 90);
    if (Rm.exit > 0) {
      if (++Rm.exit > 26) {
        if (!Rm.house) G.dist = slotEnd(G.loop, G.slot) + 0.2; else { cp(G, 'h'); var mem = G.toyMem[Rm.theme] = {}; Rm.toys.forEach(function (t) { if (TOY_KEEP[t.d.id]) mem[t.d.id] = t.s; }); }
        G.roam = null; G.x = 58; G.y = GY; G.vy = 0; G.onGround = true; G.grace = 60; G.fadeIn = 24; G.gap = 120;
      }
      pressed = false; return;
    }
    var dir = (rightHeld ? 1 : 0) - (leftHeld ? 1 : 0); if (nudge) { dir = nudge > 0 ? 1 : -1; nudge -= dir * 2; if (Math.abs(nudge) < 2) nudge = 0; }
    Rm.vx += (dir * 1.6 - Rm.vx) * (dir ? 0.25 : 0.35); if (dir) Rm.face = dir;
    if (pressed) {
      if (Rm.on) { Rm.vy = -4.9; Rm.on = false; Rm.plat = null; Rm.jumps = 1; SFX.jump(); G.sq = -0.25; }
      else if (G.id === 'Feline1' && Rm.jumps === 1) { Rm.vy = -4.3; Rm.jumps = 2; SFX.jump2(); burst(Rm.px - Rm.cam + 8, Rm.py - 4, 10, ['#ff6fa6', '#ffffff'], 1.2); }
    }
    pressed = false;
    var use = downPressed && !!Rm.house;
    if (downPressed && Rm.on && Rm.plat && !Rm.house) { Rm.drop = 14; Rm.on = false; Rm.plat = null; Rm.py += 2; }
    downPressed = false; if (Rm.drop > 0) Rm.drop--;
    var grav = holding && Rm.vy < 0 ? 0.16 : 0.3; if (G.id === 'C0' && holding && Rm.vy > 0.6) { Rm.vy = 0.6; grav = 0; }
    Rm.vy = Math.min(5, Rm.vy + grav);
    var prevY = Rm.py; Rm.px = clamp(Rm.px + Rm.vx, 8, (Rm.W || ROAM_W) - 10); Rm.py += Rm.vy;
    var was = Rm.on; Rm.on = false;
    if (Rm.vy >= 0 && Rm.drop <= 0) Rm.plats.forEach(function (p) { if (!Rm.on && Rm.px + 12 > p.x && Rm.px + 4 < p.x + p.w && prevY <= p.y + 3 && Rm.py >= p.y) { Rm.py = p.y; Rm.vy = 0; Rm.on = true; Rm.plat = p; } });
    if (!Rm.on && Rm.py >= GY) { Rm.py = GY; Rm.vy = 0; Rm.on = true; Rm.plat = null; }
    if (Rm.on) Rm.jumps = 0;
    if (Rm.on && !was) { G.sq = 0.3; if (prevY < Rm.py - 1.5) SFX.land(); }
    if (Rm.house) {
      houseToys(G, Rm, use);
      if (!Rm.photo) { var need = Rm.toys.filter(function (t) { return t.d.max; }); if (need.length && need.every(function (t) { return t.paid; })) { Rm.photo = 1; unlockPhoto(G, Rm.theme); } }
    } else {
    if (!Rm.photo && Rm.done && Rm.bell.rings > 0 && Rm.cat.heart && Rm.chest.open) { Rm.photo = 1; unlockPhoto(G, 'court'); }
    /* spring */
    var spg = Rm.spring; if (Rm.on && !Rm.plat && Math.abs(Rm.px + 8 - (spg.x + 9)) < 10) { Rm.vy = -7.6; Rm.on = false; spg.sq = 8; SFX.spring(); G.sq = -0.35; }
    if (spg.sq) spg.sq--;
    /* bell: bonk it from below */
    var bl = Rm.bell; if (bl.cd > 0) bl.cd--;
    if (Rm.vy < 0 && bl.cd <= 0 && Math.abs(Rm.px + 8 - bl.x) < 10 && Rm.py - 20 < bl.y + 8 && Rm.py - 20 > bl.y - 6) {
      bl.cd = 40; bl.rings++; Rm.vy = 1; if (bl.rings <= 3) { G.shards += 3; popText('DING! +3', '#ffd45e'); } else popText('DING!', '#ffd45e');
      [784, 1047, 1319].forEach(function (f, i) { setTimeout(function () { beep(f, 0.5, 'triangle', 0.05); }, i * 70); });
      burst(bl.x - Rm.cam, bl.y, 14, ['#ffd45e', '#ffffff'], 1.6);
    }
    /* cat: stand next to it to get pets */
    var ct = Rm.cat; if (Rm.on && Math.abs(Rm.px - ct.x) < 14) { if (Rm.t % 24 === 0) { ct.pets++; particle(ct.x - Rm.cam + 6, GY - 12, 0, -0.5, 40, '#ff6fa6', 2, 0); beep(880 + ct.pets * 40, 0.06, 'sine', 0.03); }
      if (ct.pets >= 5 && !ct.heart) { ct.heart = 1; if (G.hp < G.maxHp) { G.hp++; popText('PURR~ +1 HEART', '#ff6fa6'); SFX.heal(); } else { G.shards += 5; popText('PURR~ +5', '#ff6fa6'); SFX.heal(); } } }
    /* lanterns */
    Rm.lanterns.forEach(function (l) { if (!l.lit && Math.abs(Rm.px + 8 - l.x) < 10 && Rm.py > GY - 40) { l.lit = 1; beep(523 + Rm.lanterns.filter(function (q) { return q.lit; }).length * 131, 0.2, 'triangle', 0.05); burst(l.x - Rm.cam, GY - 30, 10, ['#ffb84f', '#ffffff'], 1); } });
    if (!Rm.done && Rm.lanterns.every(function (l) { return l.lit; })) { Rm.done = 1; G.shards += 10; popText('ALL TORCHES LIT! +10', '#ffb84f'); SFX.power(); }
    /* chest on the high ledge */
    var ch = Rm.chest; if (!ch.open && Math.abs(Rm.px + 8 - (ch.x + 6)) < 10 && Math.abs(Rm.py - ch.y) < 3) { ch.open = 1; givePower(G, PWK[Math.floor(R() * PWK.length)] === 'rocket' ? 'magnet' : PWK[Math.floor(R() * 3)]); }
    }
    /* shards */
    for (var i = Rm.items.length - 1; i >= 0; i--) { var it = Rm.items[i]; if (Math.abs(Rm.px + 8 - (it.x + 4)) < 10 && Math.abs(Rm.py - 10 - (it.y + 4)) < 12) { Rm.items.splice(i, 1); G.shards += G.x2 > 0 ? 2 : 1; SFX.shard(); burst(it.x - Rm.cam + 4, it.y + 4, 6, ['#ffd45e', '#ffffff'], 1); } }
    if (G.x2 > 0) G.x2--; if (G.magnet > 0) G.magnet--;
    if (Rm.px > (Rm.W || ROAM_W) - 40) { Rm.exit = 1; SFX.rift(); }
    Rm.cam += (clamp(Rm.px - 100, 0, (Rm.W || ROAM_W) - W) - Rm.cam) * 0.12;
    Rm.trail.unshift([Rm.px, Rm.py, Rm.face]); Rm.trail.length = 40;
    /* the other two walk on their own feet: follow the leader's trail, jump up to ledges, land on ground/platforms */
    if (!Rm.fol) Rm.fol = [0, 1].map(function (k) { return { x: Rm.px - 18 - k * 16, y: GY, vy: 0, on: true, face: 1, mv: 0, drop: 0 }; });
    Rm.idle = Math.abs(Rm.vx) < 0.15 && Rm.on ? (Rm.idle || 0) + 1 : 0;
    Rm.fol.forEach(function (fo, k) {
      var tr = Rm.trail[14 + k * 12] || Rm.trail[0];
      if (Rm.house && Rm.idle > 150) {
        if (fo.goal === undefined || fo.goal === null) { var cand = Rm.toys.filter(function (t) { return t.w > 8 && Math.abs(t.x + t.w / 2 - Rm.px) > 20; }); if (cand.length) { var tg = cand[(k * 3 + Math.floor(Rm.t / 7)) % cand.length]; fo.goal = tg.x + tg.w / 2 - 8 + (k ? 5 : -5); fo.emo = TOY_EMO[tg.d.id] || 'star'; } else fo.goal = false; }
        if (fo.goal !== false) tr = [fo.goal, GY];
      } else { fo.goal = null; fo.emo = null; }
      fo.at = fo.goal ? Math.abs(fo.x - fo.goal) < 3 && fo.on : false;
      var tx = clamp(tr[0], 8, (Rm.W || ROAM_W) - 10), dx = clamp(tx - fo.x, -1.7, 1.7);
      if (Math.abs(tx - fo.x) > 2) { fo.x += dx; fo.face = dx > 0 ? 1 : -1; fo.mv = 1; } else fo.mv = 0;
      if (fo.on && tr[1] < fo.y - 8 && Math.abs(tx - fo.x) < 40) { fo.vy = -5.2; fo.on = false; }
      if (fo.on && tr[1] > fo.y + 8 && fo.y < GY) fo.drop = 14;
      if (fo.drop > 0) fo.drop--;
      var py = fo.y; fo.vy = Math.min(5, fo.vy + 0.3); fo.y += fo.vy; fo.on = false;
      if (fo.vy >= 0 && fo.drop <= 0) Rm.plats.forEach(function (p) { if (!fo.on && fo.x + 12 > p.x && fo.x + 4 < p.x + p.w && py <= p.y + 3 && fo.y >= p.y) { fo.y = p.y; fo.vy = 0; fo.on = true; } });
      if (!fo.on && fo.y >= GY) { fo.y = GY; fo.vy = 0; fo.on = true; }
    });
    G.x = Rm.px - Rm.cam; G.y = Rm.py; G.onGround = Rm.on; G.vy = Rm.vy;
    if (G.sq) { G.sq *= 0.78; if (Math.abs(G.sq) < 0.02) G.sq = 0; }
  }
  function drawRoam(G, b) {
    var Rm = G.roam, cm = Math.round(Rm.cam), f = G.frame, sx = function (x) { return Math.round(x - cm); };
    var eb = G.blend * G.blend * (3 - 2 * G.blend);
    if (G.blend < 1 && G.prevBiome >= 0) { drawBiome(BIOMES[G.prevBiome], cm, 1); drawBiome(b, cm, eb); } else drawBiome(b, cm, 1);
    if (Rm.house) drawHouseRoom(G, Rm, sx, f); else {
    /* gate at the exit */
    var gx = sx(ROAM_W - 34); g.fillStyle = '#a07a50'; g.fillRect(gx - 2, GY - 42, 6, 42); g.fillRect(gx + 21, GY - 42, 6, 42); g.fillStyle = '#d8b080'; g.fillRect(gx - 1, GY - 42, 2, 42); g.fillRect(gx + 22, GY - 42, 2, 42);
    g.fillStyle = '#a07a50'; g.fillRect(gx - 5, GY - 50, 35, 8); g.fillStyle = '#d8b080'; g.fillRect(gx - 5, GY - 50, 35, 2); g.fillStyle = '#5ab0e8'; g.fillRect(gx + 9, GY - 47, 7, 3);
    if (f % 40 < 26) PX.text(g, 'EXIT >', gx - 2, GY - 56, '#ffffff', '#000');
    Rm.plats.forEach(function (p) { drawPlats({ plats: [{ x: sx(p.x), y: p.y, w: p.w }] }, b); });
    var spg = Rm.spring; drawPlats({ plats: [{ x: sx(spg.x), y: GY - 3, w: 18, spring: 1, squish: spg.sq }] }, b);
    Rm.lanterns.forEach(function (l) { var x = sx(l.x); g.fillStyle = '#5a3a28'; g.fillRect(x, GY - 30, 2, 30); g.fillStyle = '#8a6a4a'; g.fillRect(x - 3, GY - 33, 8, 3); g.fillStyle = '#3a2418'; g.fillRect(x - 2, GY - 30, 6, 1); /* torch: brazier on a pole */
      if (l.lit) { var fl = (f >> 2) % 3; g.fillStyle = '#ff6a2a'; g.fillRect(x - 2, GY - 38 - fl, 6, 5 + fl); g.fillStyle = '#ffd45e'; g.fillRect(x - 1, GY - 37 - fl, 4, 4 + fl); g.fillStyle = '#fff2a8'; g.fillRect(x, GY - 35, 2, 2);
        g.fillStyle = 'rgba(255,160,80,.16)'; g.fillRect(x - 10, GY - 46, 22, 22); }
      else { g.fillStyle = '#3a2a2a'; g.fillRect(x - 2, GY - 35, 6, 2); } });
    var bl = Rm.bell, bx = sx(bl.x), sw = bl.cd > 0 ? Math.round(Math.sin(bl.cd * 0.6) * 2) : 0;
    g.fillStyle = '#5a3a2a'; g.fillRect(bx - 10, bl.y - 16, 21, 2); g.fillRect(bx, bl.y - 14, 1, 6);
    g.fillStyle = '#100a1c'; g.fillRect(bx - 5 + sw, bl.y - 9, 11, 11); g.fillStyle = '#e8b04a'; g.fillRect(bx - 4 + sw, bl.y - 8, 9, 9); g.fillStyle = '#fff1a8'; g.fillRect(bx - 3 + sw, bl.y - 7, 2, 5);
    var ct = Rm.cat, cx = sx(ct.x); g.drawImage(P.cat[Math.floor(f / 30) % 2], cx, GY - 6);
    var chs = Rm.chest, chx = sx(chs.x); g.fillStyle = '#100a1c'; g.fillRect(chx - 1, chs.y - 9, 14, 10); g.fillStyle = chs.open ? '#6a4a2a' : '#a86a2a'; g.fillRect(chx, chs.y - 8, 12, 8); g.fillStyle = '#ffd45e'; g.fillRect(chx + 5, chs.y - 6, 2, 3);
    if (!chs.open && f % 30 < 4) { g.fillStyle = '#ffffff'; g.fillRect(chx + 12, chs.y - 12, 1, 3); }
    Rm.items.forEach(function (it) { g.drawImage(P.shard[Math.floor((f + it.x) / 6) % 4], sx(it.x), Math.round(it.y + Math.sin(f * 0.1 + it.x) * 2)); });
    }
    /* the other two follow along the trail */
    var others = PX.ORDER.filter(function (x) { return x !== G.id; });
    others.forEach(function (oid, k) { var fo = (Rm.fol || [])[k]; if (!fo) return; var s = SPR[oid];
      var img = !fo.on ? s.jump : (fo.mv ? s.run[Math.floor((f + k * 7) / 5) % 4] : (fo.at ? s.idle[Math.floor((f + k * 11) / 22) % s.idle.length] : (Rm.theme === 'party' && Math.floor((f + k * 30) / 40) % 3 === 0 ? s.cheer : ((f + k * 50) % 170 < 7 ? s.blink : s.stand))));
      g.save(); g.translate(sx(fo.x) + 8, Math.round(fo.y)); g.scale(fo.face < 0 ? -1 : 1, 1); g.drawImage(img, -8, -24); g.restore();
      if (fo.at && fo.emo && EMO[fo.emo]) { var ey = Math.round(fo.y) - 34 - (Math.floor((f + k * 20) / 20) % 2); g.drawImage(EMO[fo.emo], sx(fo.x) + 5, ey); } });
    var blink = G.inv > 0 && Math.floor(G.inv / 3) % 2;
    if (!blink) { var s0 = SPR[G.id], im = !Rm.on ? s0.jump : (Math.abs(Rm.vx) > 0.3 ? s0.run[Math.floor(f / 5) % 4] : (Rm.idle > 90 ? s0.idle[Math.floor((Rm.idle - 90) / 22) % s0.idle.length] : (f % 160 < 7 ? s0.blink : s0.stand)));
      g.save(); g.translate(sx(Rm.px) + 8, Math.round(Rm.py)); g.scale((Rm.face < 0 ? -1 : 1) * (1 + G.sq * 0.6), 1 - G.sq); g.drawImage(im, -8, -24); g.restore(); }
    G.parts.forEach(function (p) { g.globalAlpha = Math.min(1, p.life / p.max * 2); g.fillStyle = p.col; g.fillRect(Math.round(p.x), Math.round(p.y), p.s, p.tall || p.s); }); g.globalAlpha = 1;
    gradeWorld(b, 1); g.drawImage(VIG, 0, 0);
    drawHUD(G, 'roam');
    if (Rm.lanterns) { var lit = Rm.lanterns.filter(function (l) { return l.lit; }).length; hudPanel(3, H - 32, 70, 12); PX.text(g, 'TORCHES ' + lit + '/4', 6, H - 29, '#ffb84f', '#1a0f30'); }
    if (G.banner) { var bt = G.banner.t, ba2 = bt < 16 ? bt / 16 : (bt > 120 ? Math.max(0, 1 - (bt - 120) / 30) : 1); if (ba2 > 0.01) { var bw = Math.max(112, PX.textWidth(G.banner.en) + 14); g.globalAlpha = ba2 * 0.92; box(W / 2 - bw / 2, 24, bw, 24, 'rgba(18,13,36,.9)'); g.globalAlpha = ba2; drawCN(G.banner.cn, W / 2, 26, 9, '#ffffff', 'center'); PX.text(g, G.banner.en, W / 2 - PX.textWidth(G.banner.en) / 2, 40, '#ff9fc4'); g.globalAlpha = 1; } }
    drawToasts(G);
    if (G.pop) { var pt = G.pop.t; g.globalAlpha = pt > 50 ? 1 - (pt - 50) / 20 : 1; PX.text(g, G.pop.text, W / 2 - PX.textWidth(G.pop.text) / 2, 46, G.pop.col, '#000'); g.globalAlpha = 1; }
    var fa = Math.max(G.fadeIn / 24, Rm.exit > 0 ? Math.min(1, Rm.exit / 22) : 0); if (fa > 0) { g.fillStyle = 'rgba(8,5,16,' + fa + ')'; g.fillRect(0, 0, W, H); }
  }

  /* ---------- update ---------- */
  var HEART = [PX.fromRows(['.oo.oo.', 'orrorro', 'orwrrro', 'orrrrro', '.orrro.', '..oro..', '...o...'], { o: '#3a0a1a', r: '#ff4f7a', w: '#ffffff' }),
    PX.fromRows(['.oo.oo.', 'orrorro', 'orrrrro', 'orrrrro', '.orrro.', '..oro..', '...o...'], { o: '#3a0a1a', r: '#3a2a4a' })];
  var ICON = {
    C0: PX.fromRows(['.....oo..', '....owo..', '...owwo..', '..owwoo..', '.owwwwwo.', '..oowwo..', '..owwo...', '..owo....', '..oo.....'], { o: '#06222e', w: '#4fe3ff' }),
    X0: PX.fromRows(['.ooooooo.', 'oVVVVVVVo', 'oVwVVVVVo', 'oVwVVVVVo', 'oVVVVVVVo', '.oVVVVVo.', '.oVVVVVo.', '..oVVVo..', '...ooo...'], { o: '#24103e', V: '#b48cff', w: '#ffffff' }),
    Feline1: PX.fromRows(['.oo...oo.', 'oPPo.oPPo', 'oPPo.oPPo', '.oo...oo.', '..ooooo..', '.oPPPPPo.', 'oPPwPPPPo', 'oPPPPPPPo', '.ooooooo.'], { o: '#4a1430', P: '#ff6fa6', w: '#ffffff' })
  };
  var TOY_EMO = { radio: 'note', phono: 'note', guitar: 'note', taiko: 'note', chime: 'note', cake: 'note', tv: 'star', cat: 'heart', koi: 'heart', snowman: 'heart', balloons: 'heart',
    fire: 'zz', chair: 'zz', cocoa: 'zz', tea: 'zz', lamp: 'zz', stove: 'heart', fridge: 'heart' };
  var EMO = {
    note: PX.fromRows(['..kkkk', '..kyyk', '..ky.k', '..ky.k', 'kkky.k', 'kyyykk', 'kyyyk.', 'kkkk..'].map(function (r) { return r; }), { k: '#1a0f30', y: '#ffd45e' }),
    heart: PX.fromRows(['.kk.kk.', 'kpkkpkk', 'kpppppk', 'kpppppk', '.kpppk.', '..kpk..', '...k...'], { k: '#1a0f30', p: '#ff6fa6' }),
    zz: PX.fromRows(['kkkkk..', 'kwwwk..', 'kkwk...', '.kwkkkk', 'kwwwkwk', 'kkkkkwk', '...kwwk', '...kkkk'], { k: '#1a0f30', w: '#c8e8ff' }),
    star: PX.fromRows(['...k...', '..kyk..', 'kkkykkk', 'kyyyyyk', '.kyyyk.', 'kykkkyk', 'kk...kk'], { k: '#1a0f30', y: '#fff2a8' })
  };
  var FPERK = { roam: 'DOUBLE JUMP', climb: 'WALL GRIP', run: 'DOUBLE JUMP', fly: 'NIMBLE BODY', flip: 'AIR FLIP', jet: 'FEATHER FALL', swim: 'STRONG PAW' };
  var MHINT = { roam: '< > WALK   EXIT AT RIGHT', balloon: 'TAP: PUFF UP', sword: 'HOLD: RISE  FLY THRU RINGS', climb: 'TAP: WALL JUMP', run: 'DOWN: SLIDE', fly: 'HOLD: RISE', jet: 'HOLD: THRUST', flip: 'TAP: FLIP GRAVITY', swim: 'TAP: SWIM' };
  var hintSeen = {}; try { hintSeen = JSON.parse(localStorage.getItem('runner-hints') || '{}') || {}; } catch (e) { }
  function countHint(G) { /* called once per world entry */
    var b = BIOMES[G.biome], mode = b.mode || 'run', hk = b.sub && MHINT[b.sub] ? b.sub : (b.roam ? 'roam' : mode);
    hintSeen[hk] = (hintSeen[hk] || 0) + 1; try { localStorage.setItem('runner-hints', JSON.stringify(hintSeen)); } catch (e) { }
  }
  function hudPanel(x, y, w, h, glow) {
    g.fillStyle = 'rgba(10,6,24,.58)'; g.fillRect(x + 1, y, w - 2, h); g.fillRect(x, y + 1, 1, h - 2); g.fillRect(x + w - 1, y + 1, 1, h - 2);
    g.fillStyle = 'rgba(255,255,255,.08)'; g.fillRect(x + 1, y, w - 2, 1);
    if (glow) { g.fillStyle = glow; g.fillRect(x + 1, y, w - 2, 1); g.fillRect(x + 1, y + h - 1, w - 2, 1); g.fillRect(x, y + 1, 1, h - 2); g.fillRect(x + w - 1, y + 1, 1, h - 2); }
  }
  function gaugeState(G) {
    if (G.id === 'C0') {
      if (G.slowT > 0) return { fill: G.slowT / 150, label: 'OVERCLOCK!!', active: true };
      if (G.slowCd > 0) return { fill: 1 - G.slowCd / 600, label: 'OVERCLOCK ' + Math.ceil(G.slowCd / 60) + 'S' };
      return { fill: 1, label: 'A: OVERCLOCK', ready: true };
    }
    if (G.id === 'X0') {
      if (G.shield) return { fill: 1, label: 'SHIELD READY', ready: true };
      return { fill: clamp((G.frame - G.shieldF) / 720, 0, 1), label: 'SHIELD ' + Math.ceil((720 - (G.frame - G.shieldF)) / 60) + 'S' };
    }
    if (G.hp >= G.maxHp) return { fill: 1, label: 'NINE LIVES', ready: true };
    return { fill: clamp((G.frame - G.regenF) / 1500, 0, 1), label: 'NINE LIVES +1' };
  }
  function drawHUD(G, mode) {
    var d = PX.CHARS[G.id], i;
    drawPowers(G);
    hudPanel(3, 3, 64, 24);
    PX.text(g, String(score()).padStart(5, '0'), 6, 6, '#ffffff', '#1a0f30', 2);
    PX.text(g, 'HI ' + String(best).padStart(5, '0'), 6, 19, '#ffd45e', '#1a0f30');
    hudPanel(W - 48, 3, 45, 32);
    g.drawImage(P.shard[0], W - 45, 5);
    PX.text(g, 'X' + G.shards, W - 33, 7, '#ffffff', '#1a0f30');
    PX.text(g, Math.floor(G.dist) + 'M', W - 6 - PX.textWidth(Math.floor(G.dist) + 'M'), 17, '#7fe0ff', '#1a0f30');
    for (i = 0; i < G.maxHp; i++) g.drawImage(i < G.hp ? HEART[0] : HEART[1], W - 6 - (G.maxHp - i) * 8, 26);
    /* F3: progress bar follows this lap's real order (it is shuffled from lap 2), with markers for rest houses, the courtyard,
       the boss and the party room; below it the slot number and lap */
    var PL = plan(G.loop), n = PL.order.length, dx = Math.round(W / 2 - n * 2), ft = st.t;
    if (G.practice) { var pw0 = PX.textWidth('PRACTICE'); hudPanel(W / 2 - pw0 / 2 - 4, 3, pw0 + 8, 9); PX.text(g, 'PRACTICE', W / 2 - pw0 / 2, 5, '#7fe0ff', '#1a0f30'); }
    else {
      hudPanel(dx - 3, 3, n * 4 + 5, 15);
      for (i = 0; i < n; i++) {
        var bi = PL.order[i], bb = BIOMES[bi], cur = i === G.slot, px0 = dx + i * 4;
        g.fillStyle = cur ? (ft % 30 < 20 ? '#ffffff' : '#ff9fc4') : (i < G.slot ? '#ff9fc4' : 'rgba(255,255,255,.22)'); g.fillRect(px0, 6, 3, 3);
        var mk = bb.boss ? '#ff4f6a' : bb.roam ? '#5dff8f' : PL.houses[i] ? '#ffd45e' : (i === 0 && G.loop > 0) ? '#b48cff' : null;
        if (mk) { g.fillStyle = mk; g.fillRect(px0, 10, 3, 1); if (bb.boss || PL.houses[i]) g.fillRect(px0 + 1, 11, 1, 1); }
      }
      var lb = (G.slot + 1) + '/' + n + (G.loop > 0 ? '  LOOP ' + (G.loop + 1) : '');
      PX.text(g, lb, W / 2 - PX.textWidth(lb) / 2, 20, G.loop > 0 ? '#ffd45e' : '#c8bce8', '#1a0f30');
    }
    /* bottom-left: one compact hint line. Shown for 10 s after entering a world, and only until the player has seen it 3 times */
    var lines = [], since = G.frame - (G.hintF || 0), narrow = cvW && cvW < 420;
    var hk = BIOMES[G.biome].sub && MHINT[BIOMES[G.biome].sub] ? BIOMES[G.biome].sub : mode, gun = GUN[BIOMES[G.biome].key];
    var seenN = hintSeen[hk] || 0, ctl = (MHINT[hk] || '') + (gun ? '  S: FIRE' : '');
    if (since < 240) {
      var perk = G.id === 'Feline1' ? 'PERK: ' + FPERK[mode] : G.id === 'C0' && mode === 'run' ? 'HOLD IN AIR: GLIDE' : G.id === 'X0' ? 'MINI MAGNET' : '';
      if (perk && !narrow && seenN <= 3) lines.push([perk, d.color]);
    }
    if (ctl && (since < 600 && seenN <= 3 || since < 240)) lines.push([ctl, gun && !MHINT[hk] ? '#ffb84f' : '#ffffff']);
    if (lines.length) {
      var lw = 0; lines.forEach(function (l) { lw = Math.max(lw, PX.textWidth(l[0])); });
      var ly = H - 4 - lines.length * 8;
      hudPanel(3, ly - 3, lw + 7, lines.length * 8 + 4);
      lines.forEach(function (l, k) { PX.text(g, l[0], 6, ly + k * 8, l[1], '#1a0f30'); });
    }
    /* bottom-right: skill charge gauge */
    var s = gaugeState(G), x = W - 79, y = H - 19, segs = 10, fill = clamp(s.fill, 0, 1);
    hudPanel(x - 3, y - 3, 79, 19, G.gFlash > 0 && G.gFlash % 8 < 5 ? d.color : null);
    g.drawImage(ICON[G.id], x, y + 2 + (s.ready && st.t % 60 < 6 ? -1 : 0));
    PX.text(g, s.label, x + 12, y, s.ready ? '#ffffff' : d.color, '#1a0f30');
    var bx = x + 12, by = y + 8;
    g.fillStyle = '#05030a'; g.fillRect(bx - 1, by - 1, segs * 6 + 1, 7);
    for (i = 0; i < segs; i++) {
      var f = clamp(fill * segs - i, 0, 1), sx = bx + i * 6;
      g.fillStyle = 'rgba(255,255,255,.08)'; g.fillRect(sx, by, 5, 5);
      if (f > 0) {
        var col = s.active ? (st.t % 8 < 4 ? '#ffffff' : d.color) : d.color;
        g.fillStyle = col; g.fillRect(sx, by, Math.max(1, Math.round(5 * f)), 5);
        g.fillStyle = 'rgba(255,255,255,.45)'; g.fillRect(sx, by, Math.max(1, Math.round(5 * f)), 1);
      }
    }
    if (s.ready) { var sh = (st.t * 1.5) % (segs * 6 + 30); if (sh < segs * 6) { g.fillStyle = 'rgba(255,255,255,.85)'; g.fillRect(bx + sh, by, 2, 5); } }
  }
  function skillLabel(G, mode) {
    if (G.id === 'C0') return G.slowT > 0 ? 'OVERCLOCK!' : (G.slowCd > 0 ? 'OVERCLOCK ' + Math.ceil(G.slowCd / 60) + 'S' : 'OVERCLOCK READY');
    if (G.id === 'X0') return G.shield ? 'SHIELD ON + MAGNET' : 'SHIELD ' + Math.max(0, Math.ceil(150 - (G.dist - G.shieldAt))) + 'M';
    return { run: 'DOUBLE JUMP', fly: 'NIMBLE: SMALL HITBOX', flip: 'AIR FLIP', jet: 'FEATHER FALL', swim: 'STRONG PAW' }[mode];
  }
  function pbox() {
    var G = game, sm = G.id === 'Feline1' && (BIOMES[G.biome].mode || 'run') !== 'run';
    if (sm) return G.gdir < 0 ? [G.x + 4, G.y + 3, 8, 15] : [G.x + 4, G.y - 18, 8, 15];
    if (G.sliding) return [G.x + 2, G.y - 9, 12, 9];
    return G.gdir < 0 ? [G.x + 3, G.y + 1, 10, 19] : [G.x + 3, G.y - 20, 10, 19];
  }
  function hit(o) {
    var p = pbox();
    var ox = o.x + o.hb[0], oy = o.y - o.h + o.hb[1], ow = o.w - o.hb[0] - o.hb[2], oh = o.h - o.hb[1] - o.hb[3];
    return p[0] < ox + ow && p[0] + p[2] > ox && p[1] < oy + oh && p[1] + p[3] > oy;
  }
  var CAMY = 0; /* vertical camera pan (world px): follows tall climbs and high ledges, 0 on the road */
  function camTarget(G) { if (G.roam || (BIOMES[G.biome].mode || 'run') !== 'run') return 0; return Math.max(0, GY - G.y - 78); }
  function update() {
    st.t++;
    if (st.mode !== 'play' && st.mode !== 'dying') { pressed = false; return; }
    autoPaused = false;
    var G = game; G.frame++;
    CAMY += (camTarget(G) - CAMY) * 0.12; if (CAMY < 0.3) CAMY = 0;
    if (st.mode === 'dying') {
      G.dieT++; G.vy += 0.25; G.y += G.vy; if (G.y > GY && !G.pitDeath) { G.y = GY; G.vy = -G.vy * 0.3; }
      G.speed *= 0.94; G.scroll += G.speed;
      updateParts();
      if (G.dieT > 60) { st.mode = 'over'; st.t = 0; }
      return;
    }
    var id = G.id;
    var CB = BIOMES[G.biome], mode = CB.mode || 'run';
    if (G.grace > 0) G.grace--;
    if (G.id === 'C0') {
      if (G.slowCd > 0 && --G.slowCd === 0 && G.slowT <= 0) { SFX.ready(); G.gFlash = 40; }
      if (G.slowT > 0) G.slowT--;
    }
    G.speed = baseSpeed(G.dist, G.loop) * (CB.speedMul || 1) * (G.slowT > 0 ? 0.42 : 1) * (G.rocket > 0 ? 1.5 : 1);
    G.scroll += G.speed; G.dist += G.speed / 8;

    if (G.climb) { updateClimb(G); updateParts(); return; }
    if (G.roam) { updateRoam(G); updateParts(); return; }
    if (G.fadeIn > 0) G.fadeIn--;
    /* left/right: small positioning nudge */
    var nx = (rightHeld ? 1.1 : 0) - (leftHeld ? 1.1 : 0) + clamp(nudge, -2, 2); nudge -= clamp(nudge, -2, 2);
    G.x = G.x > 118 ? Math.max(118, G.x - 1.4) : clamp(G.x + nx, 40, 118);
    if (G.dropT > 0) G.dropT--;
    if (G.fireCd > 0) G.fireCd--;
    if (fireHeld && G.fireCd <= 0) fire();
    var wasGround = G.onGround;
    if (G.rocket > 0) {
      pressed = false; downPressed = false; G.rocket--; if (G.gdir < 0) { G.gdir = 1; G.y += 20; }
      G.y += (GY - 46 - G.y) * 0.12; G.vy = 0; G.onGround = false; G.sliding = false;
      if (G.frame % 2 === 0) particle(G.x - 2, G.y - 8, -2 - R() * 2, (R() - 0.5), 16, R() < 0.5 ? '#ffd45e' : '#ff6a2a', 2, 0);
      if (G.rocket === 0) { G.grace = 45; G.vy = 0.5; if (mode === 'flip' || mode === 'swim' || mode === 'fly' || mode === 'jet') G.vy = 0; }
    } else if (mode === 'run') {
    G.gdir = 1;
    if (pressed) G.buffer = 7;
    if (G.onGround) { G.coyote = 6; G.jumps = 0; } else if (G.coyote > 0) G.coyote--;
    if (G.buffer > 0) {
      if (G.coyote > 0 && G.jumps === 0) {
        G.vy = -4.9; G.onGround = false; G.coyote = 0; G.jumps = 1; G.holdT = 12; G.buffer = 0; SFX.jump();
        for (var d = 0; d < 6; d++) particle(G.x + 6 + R() * 6, GY, -R() * 1.2, -R() * 0.8, 14, BIOMES[G.biome].ground.top[0]);
      } else if (pressed && id === 'Feline1' && G.jumps === 1 && !G.onGround) {
        G.vy = -4.3; G.jumps = 2; G.holdT = 8; G.buffer = 0; SFX.jump2(); G.spinF = G.frame;
        burst(G.x + 8, G.y - 4, 10, ['#ff6fa6', '#ffffff', '#ffd45e'], 1.2);
      }
    }
    if (G.buffer > 0) G.buffer--;
    pressed = false;
    if (downPressed) {
      if (G.onPlat && G.onGround && !G.onPlat.solid) { G.dropT = 14; G.onGround = false; G.onPlat = null; G.y += 2; G.vy = 1; }
      else if (!G.onGround) { G.vy = Math.max(G.vy, 4.6); G.holdT = 0; burst(G.x + 8, G.y - 20, 5, ['#ffffff', '#7fd3ff'], 0.8); }
    }
    /* hold-to-crouch: stay low while DOWN is held; never stand up into a low bar */
    var underBar = G.sliding && G.obs.some(function (o) { return o.type === 'bar' && !o.ghost && G.x + 14 > o.x && G.x + 2 < o.x + o.w; });
    var slideNow = (downHeld || underBar) && G.onGround && (!G.onPlat || G.onPlat.solid);
    if (slideNow && !G.sliding) { SFX.slide(); }
    G.sliding = slideNow;
    if (G.sliding && G.frame % 2 === 0) particle(G.x + 2 + R() * 10, GY - 1, -G.speed * 0.5 - R(), -R() * 0.8, 14, BIOMES[G.biome].ground.top[0], 1);
    var grav = 0.3;
    if (holding && G.vy < 0 && G.holdT > 0) { grav = 0.14; G.holdT--; } else if (!holding) G.holdT = 0;
    G.vy += grav;
    G.gliding = id === 'C0' && holding && G.vy > 0.6 && !G.onGround;
    if (G.gliding) { G.vy = 0.6; if (G.frame % 3 === 0) particle(G.x + 2, G.y - 8, -1, 0.2, 14, '#4fe3ff', 1, 0); }
    var prevY = G.y;
    G.y += G.vy;
    var landP = null;
    if (G.vy >= 0 && G.dropT <= 0) for (var lp = 0; lp < G.plats.length; lp++) {
      var pl = G.plats[lp]; if (pl.ghost) continue;
      if (G.x + 12 > pl.x && G.x + 4 < pl.x + pl.w && prevY <= pl.y + 3 && G.y >= pl.y - 0.01) { landP = pl; break; }
    }
    var overPit = false;
    for (var pi = 0; pi < G.obs.length; pi++) { var po = G.obs[pi]; if (po.pit && G.x + 5 >= po.x && G.x + 11 <= po.x + po.w) { overPit = true; break; } }
    if (landP) {
      G.y = landP.y; G.vy = 0; G.onGround = true; G.onPlat = landP;
      if (landP.spring) { G.vy = -7.4; G.onGround = false; G.onPlat = null; G.jumps = 1; G.holdT = 0; landP.squish = 8; G.sq = -0.35; SFX.spring(); burst(landP.x + landP.w / 2, landP.y, 10, ['#ffd45e', '#ffffff'], 1.4); }
    } else if (G.y >= GY) {
      G.onPlat = null;
      if (overPit || prevY > GY + 0.5) {
        G.onGround = false;
        if (G.y > H + 12) {
          if (G.shield) { G.shield = 0; G.shieldAt = G.dist; G.shieldF = G.frame; G.inv = 70; G.vy = -7.6; SFX.shield(); burst(G.x + 8, H - 4, 16, ['#b48cff', '#ffffff'], 2); }
          else if (--G.hp > 0) { G.inv = 100; G.vy = -7.6; SFX.hit(); }
          else { G.pitDeath = true; die(); return; }
        }
      } else {
        if (!G.onGround && G.vy > 2) for (d = 0; d < 5; d++) particle(G.x + 4 + R() * 8, GY, (R() - 0.5) * 2, -R(), 12, BIOMES[G.biome].ground.top[1]);
        G.y = GY; G.vy = 0; G.onGround = true;
      }
    } else { G.onGround = false; G.onPlat = null; }
    if (G.onGround && !wasGround) { G.sq = 0.3; if (prevY < G.y - 1.5) SFX.land(); }
    if (G.vy < -3 && wasGround) G.sq = -0.25;
    } else if (mode === 'fly') {
      var puff = pressed; pressed = false;
      if (CB.sub === 'balloon') {
        /* hot-air balloon: each tap puffs you up, then you sink slowly; updrafts drift you */
        if (puff) { G.vy = Math.max(-2.6, G.vy - 2.1); burst(G.x + 8, G.y - 34, 4, ['#ffd45e', '#ff8a3a'], 0.6); SFX.swim(); }
        var draft = Math.sin(G.scroll * 0.012) * 0.05; G.vy += 0.075 + (downHeld ? 0.2 : 0) + draft; G.vy *= 0.985; G.vy = clamp(G.vy, -2.6, 2); G.y += G.vy;
      } else if (CB.sub === 'sword') {
        /* sword flight: smooth momentum, banking trail; hold to climb */
        var tvs = holding ? -2.3 : (downHeld ? 3 : 1.3); G.vy += (tvs - G.vy) * 0.09; G.y += G.vy;
        if (G.frame % 2 === 0) particle(G.x - 6, G.y + 1, -1.5, 0, 22, R() < 0.5 ? '#9fe8ff' : '#ffffff', 1, 0);
      } else { var tv = holding ? -2.0 : (downHeld ? 3.2 : 1.7); G.vy += (tv - G.vy) * 0.16; G.y += G.vy; }
      if (G.y < 30) { G.y = 30; G.vy = 0; } if (G.y > GY) { G.y = GY; G.vy = 0; }
      G.onGround = false;
    } else if (mode === 'jet') {
      pressed = false;
      if (downHeld) G.vy += 0.3;
      var zg = CB.sub === 'zerog';
      if (holding) { G.vy -= zg ? 0.16 : 0.34; if (G.frame % 2 === 0) particle(G.x - 1, G.y - 4, -1 - R(), 1.2 + R(), 14, R() < 0.5 ? '#ffb84f' : '#ff6a2a', 1, 0); } else G.vy += zg ? 0.06 : (G.id === 'Feline1' ? 0.19 : 0.24);
      G.vy = clamp(G.vy, -3, 3.2); if (zg) G.vy *= 0.995; G.y += G.vy;
      if (G.y < 38) { G.y = 38; G.vy = 0; }
      if (G.y >= GY) { G.y = GY; G.vy = 0; G.onGround = true; } else G.onGround = false;
    } else if (mode === 'flip') {
      if (pressed) G.buffer = 7;
      pressed = false;
      var onS = (G.gdir > 0 && G.y >= GY) || (G.gdir < 0 && G.y <= CY);
      if (onS) G.airFlip = false;
      var canAir = G.id === 'Feline1' && !G.airFlip && !onS && G.coyote <= 0;
      if (G.buffer > 0 && (onS || G.coyote > 0 || canAir)) {
        if (canAir) G.airFlip = true;
        G.gdir = -G.gdir; G.y += G.gdir * 20; G.vy = G.gdir * 1.2; G.buffer = 0; G.coyote = 0; SFX.flip();
        burst(G.x + 8, G.gdir > 0 ? CY + 2 : GY - 2, 8, ['#4fe3ff', '#ff2a8a', '#ffffff'], 1);
      }
      if (G.buffer > 0) G.buffer--;
      G.vy = clamp(G.vy + 0.5 * G.gdir, -6, 6); G.y += G.vy;
      if (G.y >= GY) { G.y = GY; G.vy = 0; } if (G.y <= CY) { G.y = CY; G.vy = 0; }
      onS = (G.gdir > 0 && G.y >= GY) || (G.gdir < 0 && G.y <= CY);
      G.onGround = onS; G.coyote = onS ? 5 : Math.max(0, G.coyote - 1);
    } else if (mode === 'swim') {
      if (pressed) { G.vy = G.id === 'Feline1' ? -3 : -2.7; SFX.swim(); for (var bb = 0; bb < 4; bb++) particle(G.x + 4 + R() * 8, G.y - 2, (R() - 0.5), -0.4 - R() * 0.4, 50, 'rgba(220,250,255,.8)', 1, -0.01); }
      pressed = false;
      G.vy = Math.min(downHeld ? 3 : 1.5, G.vy + (downHeld ? 0.3 : 0.1)); G.y += G.vy;
      if (G.y < 30) { G.y = 30; G.vy = Math.max(0, G.vy); }
      if (G.y >= GY) { G.y = GY; G.vy = 0; G.onGround = true; } else G.onGround = false;
    }
    downPressed = false;
    if (G.sq) { G.sq *= 0.78; if (Math.abs(G.sq) < 0.02) G.sq = 0; }
    G.hist.unshift([G.y, G.gdir, G.sliding ? 1 : 0]); G.hist.length = 80;

    var gk = G.loop + ':' + G.slot, tb0 = toBoundary();
    if (G.gateFor !== gk && !G.climb && tb0 <= (W + 12 - G.x) / 8 && tb0 > 0) {
      G.gateFor = gk; var nx = nextSlot(G);
      G.obs.push({ type: 'gate', gate: 1, safe: true, x: G.x + tb0 * 8 - 13, y: GY, w: 42, h: 70, bi: nx.bi, style: gateStyle(BIOMES[nx.bi]), draw: drawGate });
    }
    var ba = biomeAt(G.dist), nb = ba[2];
    if ((ba[1] !== G.slot || ba[0] !== G.loop) && !pitNear(G)) {
      evalBadges(G, G.biome);
      if (G.practice) { practiceClear(G); return; }
      var from = BIOMES[G.biome], nbm = BIOMES[nb], newLoop = ba[0] !== G.loop;
      G.prevBiome = G.biome; G.biome = nb; G.slot = ba[1]; G.loop = ba[0]; G.blend = 0; armHouse(G);
      /* things already on screen fade out instead of vanishing (no popping) and stop colliding */
      G.obs.forEach(function (o) { if (o.x > G.x - 24 && !o.pit && !o.gate) o.ghost = o.ghost || 1; });
      G.obs = G.obs.filter(function (o) { return !(o.pit && o.x > W); });
      var modeChange = (from.mode || 'run') !== (nbm.mode || 'run');
      if (modeChange) G.plats.forEach(function (pl) { pl.ghost = pl.ghost || 1; });
      G.items.forEach(function (it) { if (it.x > W) it.dead = 1; }); G.items = G.items.filter(function (it) { return !it.dead; });
      G.shots = []; G.gap = 200; G.grace = 90; G.setCd = 1; G.setIdx = 0;
      if ((from.mode || 'run') !== (nbm.mode || 'run')) {
        if (nbm.mode !== 'flip' && G.gdir < 0) { G.y += 20; G.gdir = 1; }
        if (nbm.mode) G.vy = 0; G.airFlip = false; G.holdT = 0; G.jumps = 0; G.buffer = 0; G.coyote = 0; G.sliding = false; G.onPlat = null; G.dropT = 0; G.gliding = false;
        if ((nbm.mode || 'run') === 'run' && G.y < GY) G.vy = 0.5;
      }
      if (window.SND) SND.world(nb);
      if (nbm.roam) enterRoam(G);
      G.hintF = G.frame; countHint(G);
      if (G.hp < G.maxHp && R() < 0.5) G.items.push({ x: W + 120, y: 70, ph: 0, heart: true });
      if (nbm.rift) { G.flash = 0.35; SFX.rift(); } else { beep(523, 0.1, 'triangle', 0.05); setTimeout(function () { beep(784, 0.16, 'triangle', 0.05); }, 90); }
      var en = nbm.en;
      if (from.boss) { G.shards += 10; en = 'CORE SHATTERED! +10'; burst(170, 60, 30, ['#7fd3ff', '#ffffff', '#b48cff'], 2.5); }
      cp(G, nbm.key); /* checkpoint: [metres, frame, world key, shards so far] */
      if (G.slot === 0 && G.loop > 0) en = 'LOOP ' + (G.loop + 1) + ' · FASTER!';
      if (nbm.warm) en = 'REST POINT · SHIELD UP';
      showBanner(nbm.name, en, nb);
      emit({ type: 'biome', id: id, name: nbm.name, line: nbm.line });
      if (nbm.boss) G.bossT = 90;
      if (newLoop) enterHouse(G, 'party'); /* end of the lap: celebration room with the lap summary */
    }
    if (BIOMES[G.biome].boss && G.blend > 0.5) {
      if (--G.bossT <= 0) { spawnIce(); G.bossThrow = 24; G.bossT = 100 + R() * 70 - Math.min(40, G.loop * 12); }
    }
    if (G.bossThrow > 0) G.bossThrow--;
    if (G.blend < 1) G.blend = Math.min(1, G.blend + 1 / 90);
    if (G.flash > 0) G.flash = Math.max(0, G.flash - 0.05);
    if (G.dist >= G.nextMilestone && !G.practice) { emit({ type: 'milestone', id: id, dist: G.nextMilestone }); G.nextMilestone += 100; }
    if (id === 'X0' && !G.shield && G.frame - G.shieldF > 720) { G.shield = 1; SFX.shield(); G.gFlash = 40; }
    if (id === 'X0' && G.shield && !LOWFX && G.onGround && G.frame % 9 === 0) { var pc = ['#ff9fc4', '#b48cff', '#ffd45e', '#4fe3ff'][(G.frame / 9) % 4 | 0]; particle(G.x + 1, G.y - 6 - (G.frame * 7) % 9, -G.speed * 0.6, -0.2, 22, pc, 1, 0.01); } /* X0: a little trail of paint dots while the shield is up */
    if (G.gFlash > 0) G.gFlash--;
    if (id === 'Feline1') {
      if (G.hp >= G.maxHp) G.regenF = G.frame;
      else if (G.frame - G.regenF >= 1500) { G.hp++; G.regenF = G.frame; G.gFlash = 40; SFX.heal(); burst(G.x + 8, G.y - 12, 12, ['#ff6fa6', '#ffffff', '#ffd45e'], 1.3); }
    }
    if (G.inv > 0) G.inv--;
    if (G.banner) { G.banner.t++; if (G.banner.t > 170) G.banner = null; }
    if (G.shake > 0) G.shake *= 0.85;

    if (G.magnet > 0) G.magnet--; if (G.x2 > 0) G.x2--;
    if (G.pop) { G.pop.t++; if (G.pop.t > 70) G.pop = null; }
    tickToasts(G);
    updatePlats(G); updateShots(G);
    G.gap -= G.speed;
    if (G.gap <= 0) spawn();
    for (var i = G.obs.length - 1; i >= 0; i--) {
      var o = G.obs[i];
      o.x -= G.speed + (o.vx || 0) * (G.slowT > 0 ? 0.42 : 1);
      if (o.fly) o.y = o.base + Math.sin((G.frame + o.x) * 0.08) * 3;
      if (o.upd) o.upd(o);
      if (o.type === 'ice') {
        if (o.warn > 0) o.warn--;
        else if (!o.landed) {
          o.vy += 0.6; o.y += o.vy;
          if (o.y >= GY) { o.y = GY; o.landed = true; G.shake = Math.max(G.shake, 3); beep(140, 0.15, 'square', 0.05, 60); burst(o.x + o.w / 2, GY - 2, 10, ['#e6fbff', '#7fd3ff'], 1.4); }
        }
      }
      if (o.x + (o.w || 0) < -40) { G.obs.splice(i, 1); continue; }
      if (o.ghost) { if (++o.ghost > 30) G.obs.splice(i, 1); continue; }
      if (o.type === 'tower' && !o.done && o.x + 14 <= G.x + 2 && mode === 'run') { enterClimb(G, o); return; }
      if (o.type === 'house' && !o.done && o.x + 12 <= G.x + 8 && G.y >= GY - 40 && mode === 'run') { o.done = 1; enterHouse(G, o.theme); return; }
      if (o.pit || o.safe || (o.type === 'ice' && o.warn > 0)) continue;
      if (G.rocket > 0 && hit(o)) { burst(o.x + o.w / 2, o.y - o.h / 2, 16, ['#ffd45e', '#ff6a2a', '#ffffff'], 2); G.shake = 3; SFX.kill(); G.wst.kills++; G.obs.splice(i, 1); continue; }
      if (G.slowT > 0) continue; /* OVERCLOCK: C0 phases through everything */
      if (G.inv <= 0 && G.grace <= 0 && hit(o)) {
        G.wst.hits++; G.lapSt.hits++;
        if (G.bubble) {
          G.bubble = 0; G.inv = 70; G.shake = 4; SFX.shield(); burst(G.x + 8, G.y - 10, 20, ['#7fd3ff', '#ffffff'], 2); G.obs.splice(i, 1); continue;
        }
        if (G.shield) {
          G.shield = 0; G.shieldAt = G.dist; G.shieldF = G.frame; G.inv = 70; G.shake = 4; SFX.shield();
          burst(o.x + o.w / 2, o.y - o.h / 2, 18, ['#b48cff', '#ffffff', '#7fd3ff'], 2);
          G.obs.splice(i, 1); continue;
        }
        if (--G.hp > 0) { G.inv = 100; G.shake = 6; SFX.hit(); burst(G.x + 8, G.y - 10, 14, ['#ff4f7a', '#ffffff'], 1.6); G.obs.splice(i, 1); continue; }
        die(); return;
      }
    }
    for (i = G.items.length - 1; i >= 0; i--) {
      var it = G.items[i]; it.x -= G.speed;
      var mr = G.magnet > 0 ? 90 : (G.id === 'X0' ? 30 : 0);
      if (mr && !it.heart && !it.pw) { var mp = pbox(), mdx = mp[0] + 5 - (it.x + 4), mdy = mp[1] + 10 - (it.y + 4); if (mdx * mdx + mdy * mdy < mr * mr) { it.x += mdx * 0.18; it.y += mdy * 0.18; } }
      if (it.x < -10) { if (!it.heart && !it.pw) { G.wst.miss++; G.lapSt.miss++; } G.items.splice(i, 1); continue; }
      var cx = it.x + 4, cy = it.y + Math.sin(G.frame * 0.1 + it.ph) * 2;
      var pb0 = pbox();
      if (cx > pb0[0] - 5 && cx < pb0[0] + pb0[2] + 5 && cy > pb0[1] - 5 && cy < pb0[1] + pb0[3] + 5) {
        if (it.heart) { G.hp = Math.min(G.maxHp, G.hp + 1); SFX.shield(); burst(cx, cy, 10, ['#ff4f7a', '#ffffff'], 1.2); G.items.splice(i, 1); continue; }
        if (it.pw) { givePower(G, it.pw); G.items.splice(i, 1); continue; }
        if (it.ring) { G.wst.got++; G.lapSt.got++; G.shards += G.x2 > 0 ? 4 : 2; SFX.power(); popText('QI +2', '#9fe8ff'); burst(cx, cy, 14, ['#9fe8ff', '#ffffff', '#ffd45e'], 1.6); G.items.splice(i, 1); continue; }
        G.shards += G.x2 > 0 ? 2 : 1; G.items.splice(i, 1); SFX.shard(); G.wst.got++; G.lapSt.got++;
        burst(cx, cy, 8, ['#ffd45e', '#ff4fa3', '#ffffff'], 1.1);
      }
    }
    var b = BIOMES[G.biome];
    if (LOWFX) { updateParts(); return; } /* lite mode: no weather particles */
    if (b.particle === 'snow' && R() < 0.5) particle(R() * W * 1.3, -2, -0.4 - R() * 0.6, 0.3 + R() * 0.5, 400, R() < 0.5 ? '#ffffff' : '#cfe0ff', 1, 0);
    if (b.particle === 'snowlight' && R() < 0.18) particle(R() * W * 1.3, -2, -0.3 - R() * 0.4, 0.2 + R() * 0.3, 500, '#ffffff', 1, 0);
    if (b.particle === 'blizzard') for (var bz = 0; bz < 3; bz++) particle(W + 2, R() * H, -4 - R() * 3 - G.speed, 0.4 + R() * 0.6, 90, R() < 0.6 ? 'rgba(255,255,255,.85)' : '#dfe6f2', R() < 0.15 ? 2 : 1, 0);
    if (b.particle === 'ember' && R() < 0.35 && b.lights && b.lights.length) { var lt = b.lights[Math.floor(R() * b.lights.length)]; particle(lt[0] + (R() - 0.5) * 6, lt[1] - 6, (R() - 0.5) * 0.4 - G.speed * 0.45, -0.4 - R() * 0.6, 50, R() < 0.5 ? '#ffb84f' : '#ff6a2a', 1, -0.004); }
    if (b.particle === 'sparkle' && R() < 0.2) particle(R() * W, GY - 24 + R() * 22, -G.speed * 0.45, 0, 24, '#ffffff', 1, 0);
    if (b.particle === 'petal' && R() < 0.12) particle(W + 2, R() * 100, -0.8 - R(), 0.2 + R() * 0.3, 400, R() < 0.5 ? '#ffb3cf' : '#ffd6e6', 1, 0);
    if (b.particle === 'sand' && R() < 0.5) particle(W + 2, 40 + R() * (GY - 40), -3 - R() * 2 - G.speed, (R() - 0.5) * 0.3, 80, R() < 0.5 ? 'rgba(255,220,160,.7)' : 'rgba(230,180,120,.6)', 1, 0);
    if (b.particle === 'ash' && R() < 0.35) particle(R() * W * 1.2, GY, -G.speed * 0.4 - R() * 0.5, -0.6 - R() * 0.8, 120, R() < 0.6 ? '#ff7a2a' : '#5a4a4a', 1, -0.002);
    if (b.particle === 'star') for (var sx2 = 0; sx2 < 2; sx2++) G.parts.push({ x: W + 2, y: R() * H, vx: -4 - R() * 4 - G.speed, vy: 0, life: 70, max: 70, col: 'rgba(255,255,255,.7)', s: 3, gr: 0, tall: 1 });
    if (b.particle === 'sprinkle' && R() < 0.25) particle(R() * W * 1.3, -2, -0.5, 0.5 + R() * 0.4, 300, ['#ff6fa6', '#5ad0ff', '#ffd45e', '#5dff8f', '#ffffff'][Math.floor(R() * 5)], 1, 0);
    if (b.particle === 'gold' && R() < 0.15) particle(R() * W * 1.2, -2, -0.7, 0.3 + R() * 0.3, 400, R() < 0.5 ? '#ffe8a0' : '#ffffff', 1, 0);
    if (b.particle === 'rain') for (var rn = 0; rn < 3; rn++) G.parts.push({ x: R() * W * 1.4, y: -4, vx: -1.5 - G.speed * 0.5, vy: 5, life: 40, max: 40, col: R() < 0.7 ? 'rgba(140,200,255,.55)' : 'rgba(255,120,220,.5)', s: 1, gr: 0, tall: 3 });
    if (b.particle === 'steam' && R() < 0.12) particle(R() * W, GY - R() * 10, -G.speed * 0.45, -0.3 - R() * 0.3, 90, 'rgba(240,230,215,.35)', 3, -0.002);
    if (b.particle === 'bubble' && R() < 0.15) particle(R() * W, H, -G.speed * 0.3, -0.5 - R() * 0.6, 260, 'rgba(200,240,255,.6)', R() < 0.3 ? 2 : 1, 0);
    if (mode === 'swim' && G.frame % 45 === 0) particle(G.x + 14, G.y - 18, 0.3, -0.7, 80, 'rgba(220,250,255,.8)', 1, 0);
    if (mode === 'fly' && G.frame % 3 === 0) particle(G.x - 2, G.y, -1, 0, 18, G.id === 'X0' ? '#cdb8ff' : '#ffffff', 1, 0);
    if (G.frame % 4 === 0 && G.onGround && (mode === 'run' || mode === 'jet')) particle(G.x + 4, GY - 1, -G.speed * 0.4, -0.3, 10, 'rgba(255,255,255,.5)', 1, 0.02);
    updateParts();
  }
  function updateParts() {
    var ps = game.parts;
    for (var i = ps.length - 1; i >= 0; i--) {
      var p = ps[i]; p.x += p.vx; p.y += p.vy; p.vy += p.gr; p.life--;
      if (p.life <= 0 || p.y > H + 4 || p.x < -6) ps.splice(i, 1);
    }
    var cap = LOWFX ? 110 : 240; if (ps.length > cap) ps.splice(0, ps.length - cap);
  }
  function score() { return Math.floor(game.dist) + game.shards * 25; }
  /* G7: per-world challenges, judged when the world is left */
  function evalBadges(G, bi) {
    var b = BIOMES[bi], w = G.wst; G.wst = freshWst(); if (!w || b.roam) return;
    var got = 0, seen = w.got + w.miss;
    if (w.hits === 0) got |= 1;
    if (seen >= 15 && w.got / seen >= 0.9) got |= 2;
    if (GUN[b.key] && w.kills >= 5) got |= 4;
    var had = BADGES[b.key] || 0, nw = got & ~had;
    if (!nw) return;
    BADGES[b.key] = had | got; lsSet('runner-badges', BADGES);
    BADGE_DEF.forEach(function (d) { if (nw & d.bit) { toast(G, 'BADGE: ' + d.n + ' · ' + b.en.split(' · ')[0], d.col); G.newBadges.push(d.n); } });
    SFX.power();
  }
  function badgeCount() { var n = 0; for (var k in BADGES) for (var v = BADGES[k]; v; v >>= 1) n += v & 1; return n; }
  function badgeTotal() { return BIOMES.reduce(function (s, b) { return s + (b.roam ? 0 : GUN[b.key] ? 3 : 2); }, 0); }
  function practiceClear(G) {
    G.practiceClear = true; st.mode = 'over'; st.t = 0; SFX.power(); tune([72, 76, 79, 84], 100, 'square', 0.04);
    emit({ type: 'over', practice: true, clear: true, id: G.id, score: score(), dist: Math.floor(G.dist), shards: G.shards, best: best, isBest: false, where: BIOMES[G.biome].name });
  }
  function die() {
    var G = game; st.mode = 'dying'; G.dieT = 0; G.vy = -3.5; G.shake = 7; SFX.hit();
    burst(G.x + 8, G.y - 10, 22, ['#ffffff', '#ff4f7a', '#7fd3ff'], 2.2);
    var sc = score(), isBest = sc > best && !G.practice;
    if (isBest) { best = sc; localStorage.setItem('runner-best', best); }
    G.isBest = isBest;
    if (G.practice) { emit({ type: 'over', practice: true, id: G.id, score: sc, dist: Math.floor(G.dist), shards: G.shards, best: best, isBest: false, where: BIOMES[G.biome].name }); return; }
    emit({ type: 'over', v: GAME_VERSION, id: G.id, score: sc, dist: Math.floor(G.dist), shards: G.shards, frames: G.frame, cps: G.cps.slice(), best: best, isBest: isBest, where: BIOMES[G.biome].name });
  }

  /* ---------- draw ---------- */
  function drawLayer(img, off, y) {
    var w = img.width, o = -Math.floor(off % w);
    for (var x = o; x < W; x += w) g.drawImage(img, x, y || 0);
  }
  /* A4: small world thumbnails (banner, NEXT preview, practice menu, album) built from the static layers */
  var THUMBS = {}, thC = PX.make(W, H), thX = thC.getContext('2d');
  function thumb(bi, tw, th) {
    tw = tw || 36; th = th || 24; var k = bi + ':' + tw + 'x' + th; if (THUMBS[k]) return THUMBS[k];
    var b = BIOMES[bi], c = PX.make(tw, th), x = c.getContext('2d');
    try {
      thX.clearRect(0, 0, W, H); var g0 = g; g = thX;
      try { g.drawImage(b.sky, 0, 0); drawLayer(b.far, 0, 0); if (b.haze) g.drawImage(b.haze, 0, 0); if (b.mid2) drawLayer(b.mid2, 20, 0); drawLayer(b.mid, 30, 0); drawLayer(b.groundTile, 0, GY); if (b.ceil) drawLayer(b.ceil, 0, 0); } finally { g = g0; }
      x.imageSmoothingEnabled = true; var sh = Math.round(W * th / tw); x.drawImage(thC, 0, Math.max(0, H - sh - 8), W, Math.min(H, sh), 0, 0, tw, th); /* crop: the lower part of the scene, where the world is recognisable */
    } catch (e) { x.fillStyle = '#2a1648'; x.fillRect(0, 0, tw, th); }
    return (THUMBS[k] = c);
  }
  function nextSlot(G) { var P = plan(G.loop); return G.slot + 1 < P.order.length ? { bi: P.order[G.slot + 1], loop: G.loop } : { bi: plan(G.loop + 1).order[0], loop: G.loop + 1 }; }
  /* A4: a themed gate stands exactly on every world boundary */
  function gateStyle(b) { var m = b.mode || 'run'; return b.roam ? 'oasis' : m === 'flip' ? 'neon' : (m === 'swim' || m === 'fly' || m === 'jet') ? 'ring' : 'arch'; }
  function drawGate(o) {
    var X = Math.round(o.x), b = BIOMES[o.bi], c1 = b.ground.top[1] || '#ffd45e', c2 = b.ground.dirt2 || '#2a1648', f = game.frame, s = o.style;
    if (s === 'arch' || s === 'oasis') {
      var top = GY - 64;
      g.fillStyle = c2; g.fillRect(X, top, 5, 64); g.fillRect(X + 37, top, 5, 64);
      g.fillStyle = c1; g.fillRect(X + 1, top, 2, 64); g.fillRect(X + 38, top, 2, 64);
      g.fillStyle = s === 'oasis' ? '#c8904a' : '#ff4f7a'; g.fillRect(X - 6, top - 6, 54, 5); g.fillRect(X - 2, top + 4, 46, 3);
      g.fillStyle = '#ffffff'; g.fillRect(X - 6, top - 6, 54, 1);
      for (var k = 0; k < 5; k++) { g.fillStyle = (k + (f >> 3)) % 2 ? '#ffd45e' : '#fff2a8'; g.fillRect(X + 4 + k * 8, top + 9, 2, 2); }
    } else if (s === 'neon') {
      var a = (f >> 2) % 2 ? '#4fe3ff' : '#ff2a8a';
      g.fillStyle = 'rgba(79,227,255,.12)'; g.fillRect(X, CY, 30, GY - CY);
      g.fillStyle = a; g.fillRect(X, CY, 2, GY - CY); g.fillRect(X + 28, CY, 2, GY - CY);
      for (var yy = CY + 4; yy < GY; yy += 10) { g.fillStyle = 'rgba(255,255,255,.5)'; g.fillRect(X + 2, yy + ((f >> 1) % 10), 26, 1); }
    } else {
      var cx = X + 16, cy = 80;
      for (var i = 0; i < 40; i++) { var an = i / 40 * 6.283 + f * 0.02; g.fillStyle = i % 4 === 0 ? '#ffffff' : (i % 2 ? c1 : '#ffd45e'); g.fillRect(Math.round(cx + Math.cos(an) * 12), Math.round(cy + Math.sin(an) * 40), 2, 2); }
    }
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
    var cy = st.mode === 'title' ? 0 : Math.round(CAMY);
    drawLayer(b.far, scroll * 0.15, cy * 0.25);
    if (b.haze) g.drawImage(b.haze, 0, 0);
    if (b.boss && st.mode !== 'title') drawBoss(alpha);
    g.globalAlpha = alpha;
    if (b.mid2) drawLayer(b.mid2, scroll * 0.3, cy * 0.4);
    drawLayer(b.mid, scroll * 0.45, cy * 0.6);
    if (b.anim) b.anim(b, scroll);
    g.globalAlpha = alpha;
    drawLayer(b.groundTile, scroll, GY + cy);
    if (cy > H - GY) { g.fillStyle = b.ground.dirt || '#2a1648'; g.fillRect(0, GY + cy + 26, W, H); }
    if (b.ceil) drawLayer(b.ceil, scroll * (b.ceilSpeed || 0.9), 0);
    g.globalAlpha = 1;
  }
  var CADENCE = { C0: 4, X0: 6, Feline1: 5 }, drawLead = null; /* drawLead = the leader's game state while the leader is drawn */
  function drawChar(id, x, y, frame, airborne, tint, vy) {
    var s = SPR[id], img, L = drawLead && drawLead.id === id ? drawLead : null, run = L && L.slowT > 0 && s.glow ? s.glow : s.run;
    if (airborne) { img = vy > 0.6 && s.fall ? s.fall : s.jump; if (L) L.airF = L.frame; }
    else img = L && s.land && L.airF !== undefined && L.frame - L.airF > 0 && L.frame - L.airF < 10 ? s.land : run[Math.floor(frame / (CADENCE[id] || 5)) % 4]; /* Feline1: tail puffs up on landing */
    g.fillStyle = 'rgba(20,10,40,.35)';
    var sh = Math.max(4, 12 - (GY - y) / 6);
    g.fillRect(Math.round(x + 8 - sh / 2), GY - 1, Math.round(sh), 2);
    if (L && L.spinF !== undefined && airborne && L.frame - L.spinF < 18) { /* Feline1: forward flip on the double jump */
      g.save(); g.translate(Math.round(x + 8), Math.round(y - 12)); g.rotate((L.frame - L.spinF) / 18 * Math.PI * 2); g.drawImage(tint || s.skill || img, -8, -12); g.restore(); return;
    }
    g.drawImage(tint || img, Math.round(x), Math.round(y - 24));
  }
  function drawCN(text, x, y, size, color, align, shadow) { TQ.push([text, x, y, size, color, align, shadow]); }
  var CNC = {}, CNN = 0;
  if (document.fonts && document.fonts.load) document.fonts.load('16px "DotGothic16"').then(function () { CNC = {}; CNN = 0; }, function () { });
  function cnSprite(text, color) {
    var key = text + '|' + color; if (CNC[key]) return CNC[key];
    if (++CNN > 300) { CNC = {}; CNN = 0; }
    var m = PX.make(4, 4).getContext('2d'); m.font = '16px ' + FONT_CN; var w = Math.max(1, Math.ceil(m.measureText(text).width));
    var c = PX.make(w, 18), x = c.getContext('2d', { willReadFrequently: true }); x.font = '16px ' + FONT_CN; x.textBaseline = 'top'; x.fillStyle = color; x.fillText(text, 0, 1);
    var im = x.getImageData(0, 0, w, 18), d = im.data; for (var i = 3; i < d.length; i += 4) d[i] = d[i] > 110 ? 255 : 0; x.putImageData(im, 0, 0);
    return (CNC[key] = c);
  }
  function flushText() {
    dctx.save(); dctx.setTransform(1, 0, 0, 1, 0, 0); dctx.imageSmoothingEnabled = false;
    for (var i = 0; i < TQ.length; i++) {
      var q = TQ[i], k = Math.max(1, Math.round(q[3] * S / 16)), sp = cnSprite(q[0], q[4]), w = sp.width * k;
      var x0 = Math.round(q[1] * S - (q[5] === 'center' ? w / 2 : q[5] === 'right' ? w : 0)), y0 = Math.round(q[2] * S);
      if (q[6]) dctx.drawImage(cnSprite(q[0], q[6]), x0 + k, y0 + k, w, sp.height * k);
      dctx.drawImage(sp, x0, y0, w, sp.height * k);
    }
    dctx.restore(); TQ.length = 0;
  }
  function post() { }
  function box(x, y, w, h, fill, border) {
    g.fillStyle = border || '#ff4fa3'; g.fillRect(x, y, w, h);
    g.fillStyle = fill || '#120d24'; g.fillRect(x + 1, y + 1, w - 2, h - 2);
    g.fillStyle = 'rgba(255,255,255,.12)'; g.fillRect(x + 2, y + 2, w - 4, 1);
  }

  function drawTitle() {
    var t = st.t;
    var ti = Math.floor(t / 300) % BIOMES.length, tb = BIOMES[ti], tf = t % 300, tn = BIOMES[(ti + 1) % BIOMES.length];
    drawBiome(tb, t * 0.6, 1); gradeWorld(tb, 1);
    if (tf > 240) { var ta = (tf - 240) / 60; ta = ta * ta * (3 - 2 * ta); drawBiome(tn, t * 0.6, ta); gradeWorld(tn, ta); }
    g.drawImage(VIG, 0, 0);
    for (var i = 0; i < 3; i++) { var sx = (i * 97 + t * 0.3) % (W + 20) - 10, sy = (i * 53 + t * 0.4) % H; g.fillStyle = '#fff'; g.fillRect(W - sx, sy, 1, 1); }
    g.fillStyle = 'rgba(10,6,30,.45)'; g.fillRect(0, 0, W, H);
    var tw = PX.textWidth('KITTY RUNNER', 3), ty = 10 + (Math.floor(t / 20) % 2);
    PX.text(g, 'KITTY RUNNER', W / 2 - tw / 2 + 2, ty + 2, '#3a1a40', null, 3);
    PX.text(g, 'KITTY RUNNER', W / 2 - tw / 2, ty, '#ffffff', '#ff4fa3', 3);
    PX.text(g, '- A HOMEWARD TALE -', W / 2 - PX.textWidth('- A HOMEWARD TALE -') / 2, 31, '#ffd45e', '#3a1a40');
    PX.text(g, 'BEST ' + best, W - PX.textWidth('BEST ' + best) - 6, 4, '#7fe0ff', '#000');
    PX.ORDER.forEach(function (id, i) {
      var cx = 30 + i * 60, sel = i === st.sel, d = PX.CHARS[id];
      box(cx + 4, 46, 52, 76, sel ? '#2a1648' : '#140d26', sel ? d.color : '#4a3a6a');
      var s = SPR[id], img = sel ? s.run[Math.floor(t / 6) % 4] : ((t + i * 70) % 300 < 88 ? s.idle[Math.floor((t + i * 70) % 300 / 22)] : ((t + i * 40) % 160 < 8 ? s.blink : s.stand));
      g.save(); g.translate(cx + 14, 54 + (sel ? Math.round(Math.sin(t * 0.2)) : 0)); g.scale(2, 2); g.drawImage(img, 0, 0); g.restore();
      PX.text(g, d.label, cx + 30 - PX.textWidth(d.label) / 2, 106, sel ? '#ffffff' : '#9a8cc0', '#000');
      PX.text(g, String(i + 1), cx + 8, 50, sel ? d.color : '#6a5a8a');
      if (sel) {
        var ay = 40 + (Math.floor(t / 15) % 2);
        g.fillStyle = d.color; g.fillRect(cx + 28, ay, 5, 1); g.fillRect(cx + 29, ay + 1, 3, 1); g.fillRect(cx + 30, ay + 2, 1, 1);
      }
    });
    var d = PX.CHARS[PX.ORDER[st.sel]];
    drawCN(d.cn + ' · ' + d.perk, W / 2, 124, 6, '#ffffff', 'center', '#000');
    /* menu row: practice / album / badges (DOWN to reach it) */
    var al = ALBUM_ROOMS.filter(function (k) { return ALBUM[k]; }).length, ML = ['PRACTICE', 'ALBUM ' + al + '/6', 'BADGES ' + badgeCount()];
    ML.forEach(function (lb, i) {
      var mx = 34 + i * 60, on = st.trow === 1 && st.msel === i;
      box(mx, 134, 52, 11, on ? '#2a1648' : 'rgba(20,13,38,.85)', on ? '#ffd45e' : '#4a3a6a');
      PX.text(g, lb, mx + 26 - PX.textWidth(lb) / 2, 137, on ? '#ffffff' : '#9a8cc0', '#000');
    });
    var hint = st.trow === 1 ? '< >: PICK   Z: OPEN   X: BACK' : (Math.floor(t / 120) % 2 ? '< > OR X: CHOOSE  Z: START  v: MORE' : 'CLICK / Z / SPACE TO START');
    if (Math.floor(t / 30) % 4 !== 3) PX.text(g, hint, W / 2 - PX.textWidth(hint) / 2, 150, '#ffd45e', '#3a1a40');
  }
  /* ---------- G10 / G6 / G7 screens ---------- */
  var PRACTICE_LIST = BIOMES.map(function (b, i) { return i; }).filter(function (i) { return !BIOMES[i].roam; });
  function openMenu(i) { st.mode = ['practice', 'album', 'badges'][i]; st.t = 0; SFX.select(); }
  function menuBack() { st.mode = 'title'; st.trow = 1; st.pbi = -1; st.t = 0; SFX.select(); }
  function menuNav(dir) {
    if (st.mode === 'album') { var a = st.acur; a += dir === 'left' ? -1 : dir === 'right' ? 1 : dir === 'up' ? -3 : 3; st.acur = clamp(a, 0, ALBUM_ROOMS.length - 1); }
    else { var p = st.pcur; p += dir === 'left' ? -1 : dir === 'right' ? 1 : dir === 'up' ? -6 : 6; st.pcur = clamp(p, 0, PRACTICE_LIST.length - 1); }
    SFX.select();
  }
  function menuConfirm() { if (st.mode === 'practice') { st.pbi = PRACTICE_LIST[st.pcur]; newGame(); } else if (st.mode === 'album') { st.zoom = !st.zoom; SFX.select(); } }
  function menuTap(px, py) {
    if (py < 16) { menuBack(); return; }
    if (st.mode === 'album') { if (st.zoom) { st.zoom = false; return; } var c = Math.floor((px - 9) / 76), r = Math.floor((py - 22) / 62); if (c >= 0 && c < 3 && r >= 0 && r < 2) { var k = r * 3 + c; if (k === st.acur) menuConfirm(); else { st.acur = k; SFX.select(); } } return; }
    var cc = Math.floor((px - 6) / 38), rr0 = Math.floor((py - 20) / 29);
    if (cc >= 0 && cc < 6 && rr0 >= 0 && rr0 < 4) { var q = rr0 * 6 + cc; if (q < PRACTICE_LIST.length) { if (q === st.pcur && st.mode === 'practice') menuConfirm(); else { st.pcur = q; SFX.select(); } } }
  }
  function menuBg() {
    var t = st.t, tb = BIOMES[Math.floor(t / 600) % BIOMES.length];
    drawBiome(tb, t * 0.3, 1); g.fillStyle = 'rgba(10,6,30,.78)'; g.fillRect(0, 0, W, H);
  }
  function drawMenuHead(title, sub) {
    PX.text(g, title, 6, 5, '#ffffff', '#ff4fa3', 2);
    PX.text(g, sub, W - 6 - PX.textWidth(sub), 8, '#ffd45e', '#000');
  }
  function drawWorldGrid(badges) {
    PRACTICE_LIST.forEach(function (bi, q) {
      var c = q % 6, r = Math.floor(q / 6), x = 6 + c * 38, y = 20 + r * 29, on = q === st.pcur, bb = BIOMES[bi];
      g.fillStyle = on ? '#ffd45e' : '#2a1f48'; g.fillRect(x - 1, y - 1, 36, 24);
      g.drawImage(thumb(bi, 34, 22), x, y);
      PX.text(g, String(bi + 1), x + 1, y + 1, '#ffffff', '#000');
      var bits = BADGES[bb.key] || 0, n = GUN[bb.key] ? 3 : 2;
      for (var k = 0; k < n; k++) { var d = BADGE_DEF[k], have = bits & d.bit; g.fillStyle = '#000'; g.fillRect(x + 1 + k * 6, y + 23, 5, 5); g.fillStyle = have ? d.col : 'rgba(255,255,255,.18)'; g.fillRect(x + 2 + k * 6, y + 24, 3, 3); }
      if (bb.boss) PX.text(g, 'B', x + 28, y + 1, '#ff4f6a', '#000');
      if (!badges && (bb.mode || 'run') !== 'run') { g.fillStyle = '#4fe3ff'; g.fillRect(x + 31, y + 18, 2, 2); }
    });
    var sb = BIOMES[PRACTICE_LIST[st.pcur]];
    drawCN(sb.name, W / 2, 137, 7, '#ffffff', 'center', '#000');
    if (badges) {
      var bits2 = BADGES[sb.key] || 0, txt = BADGE_DEF.slice(0, GUN[sb.key] ? 3 : 2).map(function (d) { return (bits2 & d.bit ? '* ' : '- ') + d.n; }).join('  ');
      PX.text(g, txt, W / 2 - PX.textWidth(txt) / 2, 150, '#c8bce8', '#000');
    } else {
      var en = sb.en + '   Z: GO  X: BACK';
      PX.text(g, en.length > 52 ? sb.en.split(' · ')[0] + '   Z: GO  X: BACK' : en, W / 2 - PX.textWidth(en.length > 52 ? sb.en.split(' · ')[0] + '   Z: GO  X: BACK' : en) / 2, 150, '#ffd45e', '#000');
    }
  }
  var PHOTOS = {};
  function photo(th) { /* G6: a polaroid of the room with the three of them in it */
    if (PHOTOS[th]) return PHOTOS[th];
    var c = PX.make(68, 45), x = c.getContext('2d'), g0 = g;
    thX.clearRect(0, 0, W, H); g = thX;
    try {
      if (th === 'court') { var cb = BIOMES[keyIdx('court')]; g.drawImage(cb.sky, 0, 0); drawLayer(cb.far, 0, 0); drawLayer(cb.mid, 40, 0); drawLayer(cb.groundTile, 0, GY); }
      else {
        var T = ROOMS[th], Rm = { theme: th, W: T.W, cam: 20, t: 0, toys: [], items: [], plats: [], sum: { lap: 1, dist: 0, shards: 0, time: '0:00', score: 0, next: 1 } }, sx = function (v) { return Math.round(v - 20); };
        T.bg(Rm, sx, 0);
        T.toys.forEach(function (d) { var tt = { d: d, x: d.x, w: d.w, s: 1, a: 0, n: 0, paid: 1 }; try { if (d.id !== 'board') d.draw(sx(d.x), tt, 0, Rm, game || {}); } catch (e) { } });
      }
      var ids = PX.ORDER; ids.forEach(function (id, i) { var s = SPR[id]; g.drawImage(s.idle ? s.idle[1] : s.stand, 88 + i * 22, GY - 24); });
      g.fillStyle = 'rgba(255,200,150,.10)'; g.fillRect(0, 0, W, H);
    } catch (e) { } finally { g = g0; }
    x.imageSmoothingEnabled = true; x.drawImage(thC, 30, 40, 200, 132, 0, 0, 68, 45);
    return (PHOTOS[th] = c);
  }
  var ROOM_EN = { apt: 'HOME', tea: 'TEA HOUSE', lodge: 'SKI LODGE', cabin: 'CABIN', party: 'LAP PARTY', court: 'OASIS' };
  function drawAlbum() {
    ALBUM_ROOMS.forEach(function (th, k) {
      var c = k % 3, r = Math.floor(k / 3), x = 9 + c * 76, y = 22 + r * 62, on = k === st.acur, a = ALBUM[th];
      g.fillStyle = on ? '#ffd45e' : '#3a2f58'; g.fillRect(x - 2, y - 2, 76, 60);
      g.fillStyle = a ? '#f4efe6' : '#1a1430'; g.fillRect(x, y, 72, 56);
      if (a) { g.drawImage(photo(th), x + 2, y + 2); PX.text(g, ROOM_EN[th], x + 3, y + 48, '#3a2a4a'); }
      else { g.fillStyle = '#2a2244'; g.fillRect(x + 2, y + 2, 68, 45); PX.text(g, '?', x + 33, y + 20, '#6a5a8a', null, 2); PX.text(g, ROOM_EN[th], x + 3, y + 48, '#6a5a8a'); }
    });
    var th = ALBUM_ROOMS[st.acur], a = ALBUM[th];
    var info = a ? a.d + '  ' + ROOM_EN[th] + '  Z: ZOOM' : (th === 'court' ? 'LIGHT ALL TORCHES, RING THE BELL, PET THE CAT, OPEN THE CHEST' : 'USE EVERY TOY IN THIS ROOM IN ONE VISIT');
    PX.text(g, info, W / 2 - PX.textWidth(info) / 2, 150, a ? '#ffd45e' : '#c8bce8', '#000');
    if (st.zoom && a) { g.fillStyle = 'rgba(0,0,0,.7)'; g.fillRect(0, 0, W, H); g.fillStyle = '#f4efe6'; g.fillRect(48, 16, 144, 112); g.imageSmoothingEnabled = false; g.drawImage(photo(th), 52, 20, 136, 90); PX.text(g, ROOM_EN[th] + ' · ' + a.d, 54, 115, '#3a2a4a'); }
  }
  function drawMenu() {
    menuBg();
    if (st.mode === 'practice') { drawMenuHead('PRACTICE', 'NO SCORE · JUST PLAY'); drawWorldGrid(false); }
    else if (st.mode === 'badges') { drawMenuHead('BADGES', badgeCount() + '/' + badgeTotal()); drawWorldGrid(true); }
    else { drawMenuHead('ALBUM', ALBUM_ROOMS.filter(function (k) { return ALBUM[k]; }).length + '/6 PHOTOS'); drawAlbum(); }
  }

  function drawPlay() {
    var G = game, b = BIOMES[G.biome], mode = b.mode || 'run';
    if (G.roam) { drawRoam(G, b); return; }
    g.save();
    if (G.shake > 0.3 && !LOWFX) g.translate(Math.round((R() - 0.5) * G.shake), Math.round((R() - 0.5) * G.shake));
    var eb = G.blend * G.blend * (3 - 2 * G.blend);
    if (G.blend < 1 && G.prevBiome >= 0) { drawBiome(BIOMES[G.prevBiome], G.scroll, 1); drawBiome(b, G.scroll, eb); }
    else drawBiome(b, G.scroll, 1);
    var cy = Math.round(CAMY); if (cy) g.translate(0, cy);

    G.items.forEach(function (it) {
      var y = it.y + Math.sin(G.frame * 0.1 + it.ph) * 2;
      if (it.heart) { g.save(); g.translate(Math.round(it.x), Math.round(y)); g.scale(2, 2); g.drawImage(HEART[0], 0, 0); g.restore(); return; }
      if (it.pw) { drawPowerItem(it, y); return; }
      if (it.ring) { var rx = Math.round(it.x) + 4, ry = Math.round(it.y) + 4, f2 = G.frame;
        for (var ra = 0; ra < 20; ra++) { var an = ra / 20 * 6.283; g.fillStyle = (ra + (f2 >> 2)) % 4 === 0 ? '#ffffff' : (ra % 2 ? '#9fe8ff' : '#ffd45e'); g.fillRect(Math.round(rx + Math.cos(an) * 5), Math.round(ry + Math.sin(an) * 10), 1, 1); }
        return; }
      g.drawImage(P.shard[Math.floor((G.frame + it.ph * 10) / 6) % 4], Math.round(it.x), Math.round(y));
    });
    G.obs.forEach(function (o) {
      if (!o.pit) return;
      var px = Math.round(o.x);
      g.fillStyle = o.lava ? '#e8400a' : '#05030a'; g.fillRect(px, GY, o.w, H - GY);
      if (o.lava) { g.fillStyle = '#ffb84f'; for (var ly = 0; ly < 3; ly++) g.fillRect(px + ((G.frame >> 2) + ly * 7) % Math.max(1, o.w - 4), GY + 3 + ly * 6, 4, 1); }
      g.fillStyle = b.ground.dirt2; g.fillRect(px, GY, 1, H - GY); g.fillRect(px + o.w - 1, GY, 1, H - GY);
      g.fillStyle = b.ground.top[1]; g.fillRect(px - 1, GY, 2, 3); g.fillRect(px + o.w - 1, GY, 2, 3);
      g.fillStyle = 'rgba(120,140,200,.15)'; for (var yy = GY + 4; yy < H; yy += 4) g.fillRect(px + 2, yy, o.w - 4, 1);
    });
    drawPlats(G, b);
    var rc = rimCol(b);
    G.obs.forEach(function (o) {
      if (o.pit) return;
      g.globalAlpha = o.ghost ? Math.max(0, 1 - o.ghost / 30) : 1;
      if (o.draw) { if (!LOWFX && isHazard(o) && o.x > -40 && o.x < W + 10) drawRimmed(o, rc); else o.draw(o); g.globalAlpha = 1; return; }
      if (o.type === 'ice') {
        var cx = Math.round(o.x + o.w / 2);
        if (o.warn > 0 || !o.landed) {
          if (G.frame % 8 < 5) { g.fillStyle = 'rgba(127,211,255,.35)'; for (var yy = 0; yy < GY; yy += 4) g.fillRect(cx, yy, 1, 2); PX.text(g, '!', cx - 1, GY - 10, '#ff4f6a', '#000'); }
          g.fillStyle = 'rgba(20,10,40,.4)'; g.fillRect(cx - 4, GY - 1, 8, 2);
        }
        if (o.warn <= 0) { var ii = o.landed ? o.img : o.fall; if (isHazard(o)) g.drawImage(rimImg(ii, rc), Math.round(o.x) - 1, Math.round(o.y - o.h) - 1); else g.drawImage(ii, Math.round(o.x), Math.round(o.y - o.h)); }
        return;
      }
      var img = o.img || o.anim[Math.floor(G.frame / (o.fly ? 8 : 6)) % 2];
      if (!o.fly && !o.noShadow && o.y >= GY - 1) { g.fillStyle = 'rgba(20,10,40,.3)'; g.fillRect(Math.round(o.x) + 1, GY - 1, o.w - 2, 2); }
      if (isHazard(o)) g.drawImage(rimImg(img, rc), Math.round(o.x) - 1, Math.round(o.y - o.h) - 1);
      else g.drawImage(img, Math.round(o.x), Math.round(o.y - o.h));
      g.globalAlpha = 1;
    });
    drawShots(G);

    var mode = b.mode || 'run', dl = Math.round(20 / G.speed), dl2 = Math.round(38 / G.speed), others = PX.ORDER.filter(function (x) { return x !== G.id; });
    if (st.mode === 'play') {
      [[others[1], 38, dl2], [others[0], 20, dl]].forEach(function (c, ci) {
        if (G.climb) { var ct = G.climb.trail, tr = ct[16 - ci * 8] || ct[ct.length - 1] || [G.x, 0]; drawRider(c[0], tr[0], GY - tr[1], G.frame + c[1], mode, 1, tr[1] > 0, false, 0); return; }
        var h = G.hist[c[2]] || [GY, 1], h2 = G.hist[c[2] + 3] || h, y = h[0], gd = h[1];
        if (mode !== 'flip' && gd < 0) { y += 20; gd = 1; }
        if (mode === 'run') y = Math.min(GY, y);
        var air = mode === 'flip' ? !(gd > 0 ? y >= GY : y <= CY) : y < GY - 0.5;
        if (h[2] && mode === 'run') { /* follower slides too: same squash as the leader */
          g.drawImage(SPR[c[0]].slide, Math.round(G.x - c[1]), Math.round(y - 24));
          if (G.frame % 3 === 0) particle(G.x - c[1] + 2 + R() * 10, GY - 1, -G.speed * 0.5 - R(), -R() * 0.8, 12, BIOMES[G.biome].ground.top[0], 1);
        } else drawRider(c[0], G.x - c[1], y, G.frame + c[1], mode, gd, air, y - h2[0] < -0.4, (y - h2[0]) / 3);
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
      if (G.slowT > 0) for (var ai = 3; ai >= 1; ai--) { g.globalAlpha = 0.18 * ai; drawRider(G.id, G.x - ai * 7, G.hist[ai * 3] ? G.hist[ai * 3][0] : G.y, G.frame - ai * 2, mode, G.gdir, !G.onGround, holding, G.vy); } g.globalAlpha = 1;
      var slideP = G.sliding && mode === 'run' && !G.climb, sqx = slideP ? 1 : 1 + G.sq * 0.6, sqy = slideP ? 1 : 1 - G.sq;
      g.save(); g.translate(Math.round(G.x + 8), Math.round(G.y)); g.scale(sqx, sqy); g.translate(-Math.round(G.x + 8), -Math.round(G.y));
      if (G.climb) { var Cc = G.climb, sc = SPR[G.id]; g.translate(Math.round(G.x + 8), Math.round(G.y)); g.scale(Cc.side > 0 && Cc.cling ? -1 : 1, 1); g.drawImage(Cc.cling ? sc.climb[Math.floor(G.frame / 18) % 2] : sc.jump, -8, -24); }
      else if (slideP) { g.fillStyle = 'rgba(20,10,40,.35)'; g.fillRect(Math.round(G.x), GY - 1, 16, 2); g.drawImage(SPR[G.id].slide, Math.round(G.x), Math.round(G.y - 24)); }
      else { drawLead = G; drawRider(G.id, G.x, G.y, G.frame, mode, G.gdir, !G.onGround, holding, G.vy); drawLead = null; }
      g.restore();
      if (G.rocket > 0) drawRocket(G);
      if (G.bubble) { var br = 14 + Math.sin(G.frame * 0.2); g.strokeStyle = 'rgba(127,211,255,.8)'; g.lineWidth = 1; g.beginPath(); g.arc(G.x + 8, G.y + (G.gdir < 0 ? 11 : -11), br, 0, 7); g.stroke(); g.fillStyle = 'rgba(255,255,255,.8)'; g.fillRect(G.x + 2, G.y - 20, 2, 2); }
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
        g.fillRect(Math.round(G.x + 8 + Math.cos(an) * r), Math.round(G.y + (G.gdir < 0 ? 11 : -11) + Math.sin(an) * r), 1, 1);
      }
    }
    G.parts.forEach(function (p) {
      g.globalAlpha = Math.min(1, p.life / p.max * 2); g.fillStyle = p.col; g.fillRect(Math.round(p.x), Math.round(p.y), p.s, p.tall || p.s);
    });
    g.globalAlpha = 1;
    if (cy) g.translate(0, -cy);
    var pb = G.prevBiome >= 0 && G.blend < 1 ? BIOMES[G.prevBiome] : null;
    var dk = (b.dark ? G.blend : 0) + (pb && pb.dark ? 1 - G.blend : 0);
    if (dk > 0.01) {
      var lights = [[G.x + 8, G.y - 12 + cy, 44]];
      [b, pb].forEach(function (bb) { if (bb && bb.dark && bb.lights) lights = lights.concat(bb.lights); });
      G.items.forEach(function (it) { lights.push([it.x + 4, it.y + 4 + cy, 12]); });
      G.obs.forEach(function (o) { if (isHazard(o) && o.x > -20 && o.x < W + 20) lights.push([o.x + o.w / 2, o.y - o.h / 2 + cy, Math.max(12, Math.min(22, Math.max(o.w, o.h) * 0.8))]); });
      drawDark(dk, lights);
    }
    var fog = (b.fog ? G.blend : 0) + (pb && pb.fog ? 1 - G.blend : 0);
    if (fog > 0.01) {
      g.fillStyle = 'rgba(200,210,232,' + (0.12 * fog) + ')'; g.fillRect(0, 0, W, H);
      for (var fb = 0; fb < 4; fb++) {
        var fyy = 30 + fb * 26 + Math.round(Math.sin(st.t * 0.02 + fb * 1.7) * 6), fxx = -((G.scroll * (0.8 + fb * 0.3)) % 80);
        g.fillStyle = 'rgba(235,240,250,' + (0.1 * fog) + ')';
        for (var fx2 = fxx; fx2 < W; fx2 += 80) g.fillRect(Math.round(fx2), fyy, 56, 8);
      }
    }
    g.restore();
    if (G.blend < 1 && G.prevBiome >= 0) gradeWorld(BIOMES[G.prevBiome], 1 - eb);
    gradeWorld(b, G.prevBiome >= 0 && G.blend < 1 ? eb : 1);
    g.drawImage(VIG, 0, 0);

    if (G.slowT > 0) {
      g.fillStyle = 'rgba(79,227,255,.12)'; g.fillRect(0, 0, W, H);
      g.fillStyle = 'rgba(79,227,255,.25)'; for (var sl2 = (st.t * 2) % 6; sl2 < H; sl2 += 6) g.fillRect(0, sl2, W, 1);
      if (G.slowT > 120 && st.t % 20 < 14) PX.text(g, 'OVERCLOCK', W / 2 - PX.textWidth('OVERCLOCK', 2) / 2, 40, '#ffffff', '#0a4a6a', 2);
    }
    if (G.flash > 0) {
      g.fillStyle = 'rgba(255,255,255,' + G.flash * 0.8 + ')'; g.fillRect(0, 0, W, H);
      for (var k = 0; k < 6; k++) { g.fillStyle = 'rgba(180,140,255,' + G.flash + ')'; g.fillRect(0, 20 + k * 22 + Math.sin(st.t * 0.3 + k) * 6, W, 2); }
    }
    drawHUD(G, mode);
    var tbN = toBoundary(), secLeft = tbN * 8 / Math.max(0.5, G.speed) / 60;
    if (!G.practice && !G.climb && !G.banner && secLeft < 8 && secLeft > 0.3 && st.mode === 'play') {
      var nx = nextSlot(G), nbb = BIOMES[nx.bi], nm = nbb.en.split(' · ')[0], nw = Math.max(40, PX.textWidth(nm) + 6), nxx = W - 3 - nw, al = secLeft > 7.5 ? (8 - secLeft) * 2 : 1;
      g.globalAlpha = al; hudPanel(nxx, 38, nw, 40);
      PX.text(g, nx.loop > G.loop ? 'NEXT LAP' : 'NEXT ' + Math.ceil(secLeft) + 'S', nxx + 3, 41, '#ffd45e', '#1a0f30');
      g.drawImage(thumb(nx.bi, 32, 20), nxx + Math.round((nw - 32) / 2), 49);
      PX.text(g, nm, nxx + 3, 71, '#ffffff', '#1a0f30'); g.globalAlpha = 1;
    }
    if (G.banner && st.mode !== 'paused') {
      /* top-third banner: eases in, holds, fades out — never covers the running lane */
      var bt = G.banner.t, ba2 = bt < 16 ? bt / 16 : (bt > 120 ? Math.max(0, 1 - (bt - 120) / 30) : 1), eo = 1 - Math.pow(1 - Math.min(1, bt / 16), 3);
      var tbi = G.banner.bi, tw = tbi >= 0 ? 32 : 0, bw = Math.max(112, PX.textWidth(G.banner.en) + 14) + (tw ? tw + 6 : 0), byy = Math.round(24 + (1 - eo) * -10), bx0 = Math.round(W / 2 - bw / 2), tcx = W / 2 + (tw ? (tw + 6) / 2 : 0);
      if (ba2 > 0.01) {
        g.globalAlpha = ba2 * 0.92; box(bx0, byy, bw, 26, 'rgba(18,13,36,.9)'); g.globalAlpha = ba2;
        if (tw) { g.drawImage(thumb(tbi, 32, 20), bx0 + 4, byy + 3); g.fillStyle = 'rgba(255,255,255,.6)'; g.fillRect(bx0 + 4, byy + 3, 32, 1); }
        drawCN(G.banner.cn, tcx, byy + 3, 9, 'rgba(255,255,255,' + ba2 + ')', 'center');
        PX.text(g, G.banner.en, Math.round(tcx - PX.textWidth(G.banner.en) / 2), byy + 17, '#ff9fc4'); g.globalAlpha = 1;
      }
    }
    drawToasts(G);
    if (G.pop) { var pt = G.pop.t; g.globalAlpha = pt > 50 ? 1 - (pt - 50) / 20 : 1; PX.text(g, G.pop.text, Math.round(G.x + 8 - PX.textWidth(G.pop.text) / 2), Math.round(G.y - 34 - Math.min(10, pt / 3)), G.pop.col, '#000'); g.globalAlpha = 1; }
    if (G.fadeIn > 0) { g.fillStyle = 'rgba(8,5,16,' + (G.fadeIn / 24) + ')'; g.fillRect(0, 0, W, H); }
    if (st.mode === 'paused') {
      TQ.length = 0;
      g.fillStyle = 'rgba(10,6,30,.6)'; g.fillRect(0, 0, W, H);
      PX.text(g, 'PAUSE', W / 2 - PX.textWidth('PAUSE', 3) / 2, 38, '#ffffff', '#ff4fa3', 3);
      if (autoPaused) PX.text(g, 'AUTO-PAUSED (SCREEN SCROLLED AWAY)', W / 2 - PX.textWidth('AUTO-PAUSED (SCREEN SCROLLED AWAY)') / 2, 56, '#7fe0ff', '#000');
      ['继续游戏', '重新开始', '返回选人'].forEach(function (s, i) {
        var y = 66 + i * 18, sel = i === (st.psel || 0);
        box(W / 2 - 46, y, 92, 15, sel ? '#2a1648' : 'rgba(18,13,36,.92)', sel ? '#ff4fa3' : '#4a3a6a');
        drawCN(s, W / 2, y + 3, 8, sel ? '#ffffff' : '#9a8cc0', 'center');
        if (sel && st.t % 30 < 20) PX.text(g, '>', W / 2 - 40, y + 5, '#ffd45e');
      });
      PX.text(g, 'UP/DOWN: SELECT   A: OK   B: RESUME', W / 2 - PX.textWidth('UP/DOWN: SELECT   A: OK   B: RESUME') / 2, 128, '#ffd45e', '#000');
    }
  }
  function drawOver() {
    drawPlay(); TQ.length = 0;
    var G = game, t = st.t, y = Math.max(30, 90 - t * 4);
    if (G.practice) {
      g.fillStyle = 'rgba(10,6,30,.55)'; g.fillRect(0, 0, W, H);
      box(36, y, 168, 94, 'rgba(18,13,36,.95)');
      var hd = G.practiceClear ? 'PRACTICE CLEAR!' : 'PRACTICE OVER';
      PX.text(g, hd, W / 2 - PX.textWidth(hd, 2) / 2, y + 8, G.practiceClear ? '#5dff8f' : '#ff4fa3', '#000', 2);
      drawCN(BIOMES[G.practice.bi].name, W / 2, y + 24, 7, '#ffffff', 'center');
      var ls = G.lapSt, rate = ls.got + ls.miss ? Math.round(ls.got / (ls.got + ls.miss) * 100) : 0;
      PX.text(g, 'SHARDS ' + G.shards + '   GOT ' + rate + '%', 52, y + 40, '#ffd45e', '#000');
      PX.text(g, 'HITS ' + ls.hits + (G.practiceClear ? '' : '   ' + Math.round(wprog(G) * 100) + '% OF THE WAY'), 52, y + 50, '#7fe0ff', '#000');
      if (G.newBadges.length) PX.text(g, 'NEW BADGE: ' + G.newBadges.join(', '), W / 2 - PX.textWidth('NEW BADGE: ' + G.newBadges.join(', ')) / 2, y + 62, t % 30 < 20 ? '#ff6fa6' : '#ffffff', '#000');
      else PX.text(g, 'PRACTICE RUNS ARE NOT SCORED', W / 2 - PX.textWidth('PRACTICE RUNS ARE NOT SCORED') / 2, y + 62, '#8a7ab8', '#000');
      if (t > 30 && t % 40 < 28) PX.text(g, 'A: AGAIN    B: WORLD LIST', W / 2 - PX.textWidth('A: AGAIN    B: WORLD LIST') / 2, y + 80, '#ffffff', '#000');
      return;
    }
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

  var acc = 0, last = performance.now(), lastMode = null;
  /* P1: the game only renders while its screen is on-screen. A run that scrolls out of view pauses itself
     (it used to keep running unseen on phones). Paused frames are not counted, so the leaderboard check is unaffected. */
  var onScreen = true, seenRun = false, loopOn = true, autoPaused = false;
  if (window.IntersectionObserver) new IntersectionObserver(function (en) {
    var e = en[en.length - 1]; onScreen = e.isIntersecting && e.intersectionRatio >= 0.3;
    if (onScreen) { if (st.mode === 'play') seenRun = true; if (!loopOn) { loopOn = true; last = performance.now(); acc = 0; requestAnimationFrame(frame); } }
    else if (st.mode === 'play' && seenRun) { st.mode = 'paused'; st.psel = 0; autoPaused = true; }
  }, { threshold: [0, 0.3, 0.6, 1] }).observe(cv);
  /* P3: lite mode. If more than a quarter of the frames take > 20 ms for two 3-second windows in a row,
     weather particles, screen shake, music echo and the per-frame hazard outlines of procedural objects are switched off. */
  var LOWFX = false, perfN = 0, perfSlow = 0, perfBad = 0;
  function perfWatch(dt) {
    if (LOWFX || st.mode !== 'play' || !onScreen || document.hidden) return;
    perfN++; if (dt > 20.5) perfSlow++;
    if (perfN >= 180) { perfBad = perfSlow > 45 ? perfBad + 1 : 0; perfN = perfSlow = 0; if (perfBad >= 2) setLowFx(true); }
  }
  function setLowFx(v) { LOWFX = !!v; if (window.SND && SND.lowfx) SND.lowfx(LOWFX); if (LOWFX && game) popText('LITE MODE', '#7fe0ff'); }
  function frame(now) {
    if (!onScreen && st.mode !== 'play' && st.mode !== 'dying') { loopOn = false; return; } /* resumed by the observer */
    perfWatch(now - last);
    acc += Math.min(100, now - last); last = now;
    while (acc >= 1000 / 60) { update(); acc -= 1000 / 60; }
    fit(); TQ.length = 0;
    g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.imageSmoothingEnabled = false;
    if (st.mode !== lastMode) { var pm = lastMode; lastMode = st.mode; if (window.SND && !(MENUS[st.mode] && pm === 'title') && !(st.mode === 'title' && MENUS[pm])) SND.game(st.mode === 'dying' ? 'play' : MENUS[st.mode] ? 'title' : st.mode); }
    if (st.mode === 'title') drawTitle();
    else if (MENUS[st.mode]) drawMenu();
    else if (st.mode === 'over') drawOver();
    else drawPlay();
    post();
    dctx.setTransform(1, 0, 0, 1, 0, 0); dctx.imageSmoothingEnabled = false;
    dctx.drawImage(buf, 0, 0, W * S, H * S);
    flushText();
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  window.KittyRunner = { lock: function (v) { locked = !!v; }, version: GAME_VERSION, lowfx: function (v) { if (v !== undefined) setLowFx(v); return LOWFX; },
    meta: function () { var rm = {}; Object.keys(ROOMS).forEach(function (k) { rm[k] = roomMax(k); }); return { v: GAME_VERSION, keys: BIOMES.map(function (b) { return b.key; }), lens: BIOMES.map(function (b) { return b.len; }), speedMul: BIOMES.map(function (b) { return b.speedMul || 1; }), modes: BIOMES.map(function (b) { return b.mode || 'run'; }), boss: BIOMES.filter(function (b) { return b.boss; }).map(function (b) { return b.key; }), houseTheme: HOUSE_THEME, loop1Houses: Object.keys(LOOP1_HOUSES), roomMax: rm, courtMax: COURT_MAX, roomMaxF: ROOM_MAX_F, climbMaxF: CLIMB_MAX_F, climbMax: [0, 1, 2].map(function (l) { return shaftLayout(l).coins.length * 2 + 3; }), cycle: CYCLE }; }, lens: LENS, action: function () { onAction(); }, release: release, b: bButton, dpad: dpad, state: st, best: function () { return best; },
    skill: function () { if (st.mode === 'play') skill(); }, hold: function (d, on) { if (d === 'down') downHeld = !!on; else if (d === 'left') leftHeld = !!on; else if (d === 'right') rightHeld = !!on; }, fire: function (on) { fireHeld = !!on; if (on && st.mode === 'play') fire(); }, biomes: BIOMES.map(function (b) { return b.key; }) };
})();
