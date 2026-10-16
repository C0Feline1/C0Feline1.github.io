/* KITTY RUNNER — a tiny GBA-style endless runner, all pixels drawn in code. */
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

  var XIAN = {
    key: 'xian', name: '云桥 · 修仙界', en: 'CLOUD BRIDGE · HOLD TO FLY', len: 260, seed: 801, line: '御剑飞行！', rift: true, mode: 'fly', speedMul: 0.92,
    sky: withSky(['#3a5a9a', '#7aa6d8', '#f4d8b0', '#ffeec8'], function (x) {
      disc(x, 190, 34, 12, '#fff2c0'); disc(x, 190, 34, 9, '#fffbe8');
      x.fillStyle = 'rgba(255,255,255,.35)'; for (var k = 0; k < 3; k++) x.fillRect(0, 52 + k * 9, W, 2);
    }),
    far: layer(256, function (x, w) {
      var r = PX.rng(811);
      for (var i = 0; i < 4; i++) {
        var cx = 20 + i * 64 + Math.floor(r() * 20), top = 40 + Math.floor(r() * 30), hw = 12 + Math.floor(r() * 10), depth = 22 + Math.floor(r() * 14);
        for (var yy = 0; yy < depth; yy++) { var half = Math.round(hw * (1 - yy / depth)); x.fillStyle = yy < 3 ? '#6ab06a' : (yy % 5 === 0 ? '#5a6a8a' : '#6e7ea0'); x.fillRect(cx - half, top + yy, half * 2 + 1, 1); }
        x.fillStyle = '#4a8a5a'; x.fillRect(cx - hw, top, hw * 2 + 1, 2);
        x.fillStyle = '#2e5a3e'; x.fillRect(cx - 5, top - 6, 3, 6); x.fillRect(cx - 7, top - 4, 7, 2);
        if (i % 2 === 0) {
          x.fillStyle = '#a03a3a'; x.fillRect(cx + 2, top - 8, 6, 8); x.fillStyle = '#2a2a3a'; x.fillRect(cx, top - 9, 10, 1); x.fillRect(cx + 1, top - 12, 8, 1);
          x.fillStyle = '#a03a3a'; x.fillRect(cx + 3, top - 11, 4, 2); x.fillStyle = '#ffd45e'; x.fillRect(cx + 4, top - 6, 2, 2);
        } else { x.fillStyle = 'rgba(255,255,255,.75)'; x.fillRect(cx + hw - 6, top + 2, 2, depth + 12); }
      }
    }),
    mid: layer(240, function (x, w) {
      var r = PX.rng(822);
      for (var i = 0; i < 10; i++) cloudPuff(x, Math.floor(r() * w), 96 + Math.floor(r() * 28), 6 + Math.floor(r() * 6), ['#ffffff', '#f0e8f4', '#c8c0dc']);
      var gx = 150;
      x.fillStyle = '#b03a3a'; x.fillRect(gx, 66, 3, 36); x.fillRect(gx + 26, 66, 3, 36);
      x.fillStyle = '#2a2a3a'; x.fillRect(gx - 6, 60, 41, 2); x.fillRect(gx - 4, 63, 37, 2);
      x.fillStyle = '#b03a3a'; x.fillRect(gx - 1, 70, 31, 2);
      x.fillStyle = '#ffd45e'; x.fillRect(gx + 11, 64, 7, 5);
    }),
    anim: function (b, scroll) {
      var off = (scroll * 1.25) % 170;
      for (var k = -1; k < 3; k++) { var wx = Math.round(40 - off + k * 170); g.fillStyle = 'rgba(255,255,255,.55)'; g.fillRect(wx, GY - 8, 46, 3); g.fillRect(wx + 8, GY - 10, 20, 2); }
    },
    tile: function (x) { x.fillStyle = '#d4cce8'; x.fillRect(0, 0, 32, H - GY); for (var i = 0; i < 4; i++) disc(x, i * 9 + 4, 5, 5, '#ffffff'); x.fillStyle = '#e8e4f4'; x.fillRect(0, 10, 32, 3); },
    ground: { top: ['#ffffff', '#e8e4f4'], dirt: '#d4cce8', dirt2: '#c8c0dc', speck: '#ffffff' },
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
        g.drawImage(s.stand, X, Y - 24);
      } else if (id === 'Feline1') {
        g.drawImage(s.jump, X, Y - 24);
        g.fillStyle = '#8a5a2a'; g.fillRect(X + 7, Y - 29, 2, 5);
        var bl = [9, 5, 1, 5][frame % 4]; g.fillStyle = '#ffd45e'; g.fillRect(X + 8 - bl, Y - 30, bl * 2, 1); g.fillStyle = '#c8a040'; g.fillRect(X + 7, Y - 30, 2, 1);
      } else {
        g.drawImage(s.stand, X, Y - 24);
        g.fillStyle = '#c8c0dc'; g.fillRect(X - 3, Y + 1, 22, 3); g.fillStyle = '#ffffff'; g.fillRect(X - 2, Y - 2, 20, 4); g.fillRect(X + 1, Y - 4, 7, 2); g.fillRect(X + 10, Y - 3, 6, 2);
        g.fillStyle = '#f0e8f4'; g.fillRect(X - 7, Y, 4, 2); g.fillRect(X - 11, Y + 1, 3, 1);
      }
      return;
    }
    if (mode === 'jet') {
      g.fillStyle = '#6a4a2a'; g.fillRect(X - 3, Y - 18, 5, 11); g.fillStyle = '#c8904a'; g.fillRect(X - 3, Y - 18, 5, 1); g.fillRect(X - 2, Y - 16, 1, 7);
      g.fillStyle = '#3a2414'; g.fillRect(X - 3, Y - 7, 5, 2);
      g.drawImage(airborne ? s.jump : s.run[Math.floor(frame / 5) % 4], X, Y - 24);
      g.fillStyle = '#8a5a2a'; g.fillRect(X + 3, Y - 17, 11, 1); g.fillStyle = '#7fd3ff'; g.fillRect(X + 9, Y - 18, 2, 2); g.fillRect(X + 12, Y - 18, 2, 2);
      if (thrust) { var fl = 3 + frame % 3; g.fillStyle = '#ff6a2a'; g.fillRect(X - 3, Y - 5, 5, fl); g.fillStyle = '#ffb84f'; g.fillRect(X - 2, Y - 5, 3, fl - 1); g.fillStyle = '#fff2a8'; g.fillRect(X - 1, Y - 5, 1, 2); }
      return;
    }
    if (mode === 'flip') {
      var img = airborne ? s.jump : s.run[Math.floor(frame / 4) % 4];
      if (gdir < 0) { g.save(); g.translate(X, Y + 24); g.scale(1, -1); g.drawImage(img, 0, 0); g.restore(); }
      else g.drawImage(img, X, Y - 24);
      var fy = gdir < 0 ? Y : Y - 1;
      g.fillStyle = 'rgba(79,227,255,.9)'; g.fillRect(X + 3, fy, 10, 1); g.fillStyle = 'rgba(255,42,138,.7)'; g.fillRect(X + 5, fy + (gdir < 0 ? -1 : 1), 6, 1);
      return;
    }
    if (mode === 'swim') {
      g.save(); g.translate(X + 8, Y - 12); g.rotate(clamp((vy || 0) * 0.15, -0.45, 0.45));
      g.drawImage(s.run[Math.floor(frame / 8) % 4], -8, -12);
      g.fillStyle = 'rgba(200,240,255,.75)';
      for (var a = 0; a < 28; a++) { var an = a / 28 * Math.PI * 2; g.fillRect(Math.round(Math.cos(an) * 8), Math.round(-5 + Math.sin(an) * 8), 1, 1); }
      g.fillStyle = 'rgba(255,255,255,.9)'; g.fillRect(-4, -11, 2, 1); g.fillRect(-5, -10, 1, 2);
      g.restore();
      return;
    }
    drawChar(id, x, y, frame, airborne);
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
  var fox = P.wolf.map(function (c) { var t2 = PX.make(c.width, c.height), x = t2.getContext('2d'); x.drawImage(c, 0, 0); x.globalCompositeOperation = 'source-atop'; x.fillStyle = 'rgba(255,140,60,.55)'; x.fillRect(0, 0, c.width, c.height); return t2; });
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
    custom: { toro: function (x) { return obj(toro, x); }, fox: function (x) { return { type: 'fox', anim: fox, x: x, y: GY, w: 18, h: 11, vx: 0.8, hb: [2, 3, 3, 0] }; } }
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
    key: 'skycity', name: '天空之城', en: 'SKY CITY · HOLD TO FLY', seed: 1701, line: '坐热气球去！', rift: true, mode: 'fly', speedMul: 0.95,
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
    mid: XIAN.mid, tile: XIAN.tile,
    ground: XIAN.ground, particle: null, pillarDraw: drawTower, flyer: balloon
  };

  var SPACE = {
    key: 'space', name: '星海 · 轨道站', en: 'STAR SEA · HOLD JETPACK', seed: 1801, line: '失重了～', rift: true, mode: 'jet',
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
  BIOMES = [HOME, byKey.park, MARKET, XIAN, INK, SAKURA, CYBER, BIT8, STEAM, DESERT, SEA, SKYCITY, VOLCANO, SPACE, MIRROR, CANDY, HAUNT, byKey.snow, CABIN, RIDGE, CAVE, byKey.peak, LAKE];
  var LENS = [200, 200, 180, 240, 200, 180, 240, 180, 240, 180, 220, 220, 200, 220, 220, 200, 200, 220, 180, 220, 220, 300, 200];
  BIOMES.forEach(function (b, i) { b.len = LENS[i]; });
  BIOMES.forEach(function (b) { byKey[b.key] = b; });
  var CYCLE = BIOMES.reduce(function (s, b) { return s + b.len; }, 0);
  function biomeAt(d) {
    var loop = Math.floor(d / CYCLE), p = d - loop * CYCLE;
    for (var i = 0; i < BIOMES.length; i++) { if (p < BIOMES[i].len) return [loop, i]; p -= BIOMES[i].len; }
    return [loop, BIOMES.length - 1];
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
  var darkC = PX.make(W, H), dg = darkC.getContext('2d');
  function drawDark(amount, lights) {
    dg.globalCompositeOperation = 'source-over'; dg.clearRect(0, 0, W, H);
    dg.fillStyle = 'rgba(4,2,10,' + (0.86 * amount) + ')'; dg.fillRect(0, 0, W, H);
    dg.globalCompositeOperation = 'destination-out';
    lights.forEach(function (l) {
      var gr = dg.createRadialGradient(l[0], l[1], 0, l[0], l[1], l[2]);
      gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(0.55, 'rgba(0,0,0,.7)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
      dg.fillStyle = gr; dg.fillRect(l[0] - l[2], l[1] - l[2], l[2] * 2, l[2] * 2);
    });
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

  SFX.flip = function () { beep(300, 0.12, 'square', 0.04, 900); };
  SFX.slow = function () { beep(880, 0.25, 'triangle', 0.05, 220); };
  SFX.swim = function () { beep(520, 0.09, 'sine', 0.05, 300); };
  /* ---------- state ---------- */
  var best = +(localStorage.getItem('runner-best') || 0);
  var st = { mode: 'title', sel: 0, t: 0 };
  var game;
  function newGame() {
    var id = PX.ORDER[st.sel];
    game = {
      id: id, x: 58, y: GY, vy: 0, gdir: 1, hp: id === 'Feline1' ? 4 : 3, maxHp: id === 'Feline1' ? 4 : 3, slowT: 0, slowCd: 0, grace: 0, airFlip: false, cps: [], onGround: true, jumps: 0, holdT: 0, coyote: 0, buffer: 0, gliding: false,
      shield: id === 'X0' ? 1 : 0, shieldAt: 0, inv: 0, dist: 0, shards: 0, speed: 1.7, scroll: 0,
      obs: [], items: [], parts: [], gap: 140, hist: [], biome: 0, loop: 0, bossT: 120, bossThrow: 0, prevBiome: -1, blend: 1, flash: 0, banner: null,
      shake: 0, dieT: 0, frame: 0, nextMilestone: 100, combo: 0
    };
    for (var i = 0; i < 80; i++) game.hist.push([GY, 1]);
    showBanner(BIOMES[0].name, BIOMES[0].en);
    st.mode = 'play';
    emit({ type: 'start', id: id });
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
  function pauseChoose() { var s = st.psel || 0; if (s === 0) st.mode = 'play'; else if (s === 1) newGame(); else { st.mode = 'title'; st.t = 0; } SFX.select(); }
  function bButton() {
    if (st.mode === 'title') { st.sel = (st.sel + 1) % 3; SFX.select(); }
    else if (st.mode === 'play') { st.mode = 'paused'; st.psel = 0; }
    else if (st.mode === 'paused') st.mode = 'play';
    else if (st.mode === 'over') { st.mode = 'title'; st.t = 0; }
  }
  function dpad(dir) {
    if (st.mode === 'paused' && (dir === 'up' || dir === 'down')) { st.psel = ((st.psel || 0) + (dir === 'up' ? 2 : 1)) % 3; SFX.select(); return; }
    if (dir === 'up') { onAction(); return; }
    if (st.mode === 'title' && (dir === 'left' || dir === 'right')) { st.sel = (st.sel + (dir === 'left' ? 2 : 1)) % 3; SFX.select(); }
    else if (st.mode === 'over' && dir === 'down') { st.mode = 'title'; st.t = 0; }
  }
  cv.addEventListener('keydown', function (e) {
    var k = e.key;
    if (st.mode === 'paused') {
      if (k === 'ArrowUp' || k === 'w' || k === 'ArrowDown' || k === 's') { e.preventDefault(); dpad(k === 'ArrowUp' || k === 'w' ? 'up' : 'down'); return; }
      if (k === ' ' || k === 'Enter' || k === 'z') { e.preventDefault(); if (!e.repeat) pauseChoose(); return; }
      if (k === 'Escape' || k === 'x' || k === 'p') { st.mode = 'play'; return; }
    }
    if (k === ' ' || k === 'ArrowUp' || k === 'w' || k === 'Enter' || k === 'z') {
      e.preventDefault(); if (!e.repeat) onAction();
    } else if (k === 'ArrowLeft' || k === 'ArrowRight' || k === 'ArrowDown') {
      e.preventDefault(); dpad(k === 'ArrowLeft' ? 'left' : k === 'ArrowRight' ? 'right' : 'down');
    } else if (st.mode === 'title' && '123'.indexOf(k) >= 0) { st.sel = +k - 1; SFX.select(); }
    else if (k === 'Escape') { if (st.mode === 'play') { st.mode = 'paused'; st.psel = 0; } else if (st.mode !== 'title') { st.mode = 'title'; st.t = 0; } }
    else if (k === 'x' || k === 'p') bButton();
    else if (k === 'm') toggleMute();
  });
  cv.addEventListener('keyup', function (e) { if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w' || e.key === 'Enter' || e.key === 'z') release(); });
  document.addEventListener('visibilitychange', function () { if (document.hidden && st.mode === 'play') { st.mode = 'paused'; st.psel = 0; } });
  function toggleMute() {
    muted = !muted; localStorage.setItem('runner-muted', muted ? '1' : '0');
    var b = document.getElementById('muteBtn'); if (b) b.textContent = muted ? '♪ OFF' : '♪ ON';
  }
  var mb = document.getElementById('muteBtn');
  if (mb) { mb.textContent = muted ? '♪ OFF' : '♪ ON'; mb.addEventListener('click', toggleMute); }

  /* ---------- spawning ---------- */
  function spawn() {
    var mode = BIOMES[game.biome].mode || 'run';
    if (mode === 'fly') spawnFly(); else if (mode === 'jet') spawnJet(); else if (mode === 'flip') spawnFlip(); else if (mode === 'swim') spawnSwim(); else spawnRun();
  }
  function spawnRun() {
    var b = BIOMES[game.biome], list = b.obstacles, type = list[Math.floor(R() * list.length)], o;
    var x = W + 12;
    if (b.custom && b.custom[type]) { o = b.custom[type](x); o.type = o.type || type; }
    else if (type === 'cone') o = { type: type, img: P.cone, x: x, y: GY, w: 8, h: 8, hb: [1, 1, 1, 0] };
    else if (type === 'box') o = { type: type, img: P.box, x: x, y: GY, w: 16, h: 13, hb: [1, 2, 1, 0] };
    else if (type === 'spike') { var sp = spikes[Math.floor(R() * spikes.length)]; o = { type: type, img: sp, x: x, y: GY, w: sp.width, h: sp.height, hb: [2, 4, 2, 0] }; }
    else if (type === 'wolf') o = { type: type, anim: P.wolf, x: x, y: GY, w: 18, h: 11, vx: 0.9, hb: [2, 3, 3, 0] };
    else if (type === 'beetle') o = { type: type, anim: P.beetle, x: x, y: GY, w: 14, h: 9, vx: 0.25, hb: [1, 1, 1, 0] };
    else if (type === 'inkrock') { var ir = inkRocks[Math.floor(R() * inkRocks.length)]; o = { type: type, img: ir, x: x, y: GY, w: ir.width, h: ir.height, hb: [2, 4, 2, 0] }; }
    else if (type === 'rock') { var rk = rocks[Math.floor(R() * rocks.length)]; o = { type: type, img: rk, x: x, y: GY, w: rk.width, h: rk.height, hb: [2, 4, 2, 0] }; }
    else if (type === 'pit') o = { type: type, pit: true, x: x, y: GY, w: 18 + Math.floor(R() * 10) + Math.floor(game.speed * 3), h: 0 };
    else { var fy = GY - 32 - Math.floor(R() * 12); o = { type: type, anim: type === 'crow' ? P.crow : type === 'inkcrow' ? inkCrow : P.bat, x: x, y: fy, w: 10, h: 5, vx: 0.5, fly: true, base: fy, hb: [0, 0, 0, 0] }; }
    game.obs.push(o);
    if (!o.fly && !o.pit && R() < 0.22 && game.dist > 120) {
      var o2 = Object.assign({}, o, { x: x + o.w + 4 + Math.floor(R() * 6) });
      if (o.type === 'spike' || o.type === 'rock') { var pool = o.type === 'spike' ? spikes : rocks; o2.img = pool[Math.floor(R() * pool.length)]; o2.w = o2.img.width; o2.h = o2.img.height; }
      game.obs.push(o2);
    }
    if (R() < 0.45) {
      var n = 3 + Math.floor(R() * 3), arc = o.fly ? 0 : 1;
      for (var i = 0; i < n; i++) {
        var t = n === 1 ? 0.5 : i / (n - 1);
        game.items.push({ x: x - 12 + i * 11, y: arc ? GY - 30 - Math.sin(t * Math.PI) * 22 : GY - 14, ph: R() * 6 });
      }
    }
    game.gap = 86 + R() * 110 + game.speed * 24 + (o.pit ? o.w : 0);
  }
  function shardRow(x, y, n, dx) { for (var i = 0; i < n; i++) game.items.push({ x: x + i * dx, y: y, ph: R() * 6 }); }
  function spawnFly() {
    var G = game, x = W + 12, b = BIOMES[G.biome], fl = b.flyer || talisman;
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

  /* ---------- update ---------- */
  var HEART = [PX.fromRows(['.oo.oo.', 'orrorro', 'orwrrro', 'orrrrro', '.orrro.', '..oro..', '...o...'], { o: '#3a0a1a', r: '#ff4f7a', w: '#ffffff' }),
    PX.fromRows(['.oo.oo.', 'orrorro', 'orrrrro', 'orrrrro', '.orrro.', '..oro..', '...o...'], { o: '#3a0a1a', r: '#3a2a4a' })];
  function skillLabel(G, mode) {
    if (G.id === 'C0') return G.slowT > 0 ? 'OVERCLOCK!' : (G.slowCd > 0 ? 'OVERCLOCK ' + Math.ceil(G.slowCd / 60) + 'S' : 'OVERCLOCK READY');
    if (G.id === 'X0') return G.shield ? 'SHIELD ON + MAGNET' : 'SHIELD ' + Math.max(0, Math.ceil(150 - (G.dist - G.shieldAt))) + 'M';
    return { run: 'DOUBLE JUMP', fly: 'NIMBLE: SMALL HITBOX', flip: 'AIR FLIP', jet: 'FEATHER FALL', swim: 'STRONG PAW' }[mode];
  }
  function pbox() {
    var G = game, sm = G.id === 'Feline1' && (BIOMES[G.biome].mode || 'run') !== 'run';
    if (sm) return G.gdir < 0 ? [G.x + 4, G.y + 3, 8, 15] : [G.x + 4, G.y - 18, 8, 15];
    return G.gdir < 0 ? [G.x + 3, G.y + 1, 10, 19] : [G.x + 3, G.y - 20, 10, 19];
  }
  function hit(o) {
    var p = pbox();
    var ox = o.x + o.hb[0], oy = o.y - o.h + o.hb[1], ow = o.w - o.hb[0] - o.hb[2], oh = o.h - o.hb[1] - o.hb[3];
    return p[0] < ox + ow && p[0] + p[2] > ox && p[1] < oy + oh && p[1] + p[3] > oy;
  }
  function update() {
    st.t++;
    if (st.mode !== 'play' && st.mode !== 'dying') { pressed = false; return; }
    var G = game; G.frame++;
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
      if (G.slowCd > 0) G.slowCd--;
      if (G.slowT > 0) G.slowT--;
      else if (G.slowCd <= 0 && G.inv <= 0 && G.grace <= 0) {
        var pp = pbox();
        for (var q = 0; q < G.obs.length; q++) {
          var oo = G.obs[q]; if (oo.safe) continue;
          var ox1 = oo.x + (oo.hb ? oo.hb[0] : 0), ahead = ox1 - (pp[0] + pp[2]);
          if (ahead < 0 || ahead > 34) continue;
          var oy1 = oo.y - oo.h + (oo.hb ? oo.hb[1] : 0), oy2 = oo.y - (oo.hb ? oo.hb[3] : 0);
          if (oo.pit ? G.onGround : (oy1 < pp[1] + pp[3] + 10 && oy2 > pp[1] - 10)) { G.slowT = 55; G.slowCd = 300; SFX.slow(); break; }
        }
      }
    }
    G.speed = Math.min(4.2, 1.6 + Math.min(2.2, G.dist / 900) + G.loop * 0.15) * (CB.speedMul || 1) * (G.slowT > 0 ? 0.42 : 1);
    G.scroll += G.speed; G.dist += G.speed / 8;

    if (mode === 'run') {
    G.gdir = 1;
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
    var prevY = G.y;
    G.y += G.vy;
    var overPit = false;
    for (var pi = 0; pi < G.obs.length; pi++) { var po = G.obs[pi]; if (po.pit && G.x + 5 >= po.x && G.x + 11 <= po.x + po.w) { overPit = true; break; } }
    if (G.y >= GY) {
      if (overPit || prevY > GY + 0.5) {
        G.onGround = false;
        if (G.y > H + 12) {
          if (G.shield) { G.shield = 0; G.shieldAt = G.dist; G.inv = 70; G.vy = -7.6; SFX.shield(); burst(G.x + 8, H - 4, 16, ['#b48cff', '#ffffff'], 2); }
          else if (--G.hp > 0) { G.inv = 100; G.vy = -7.6; SFX.hit(); }
          else { G.pitDeath = true; die(); return; }
        }
      } else {
        if (!G.onGround && G.vy > 2) for (d = 0; d < 5; d++) particle(G.x + 4 + R() * 8, GY, (R() - 0.5) * 2, -R(), 12, BIOMES[G.biome].ground.top[1]);
        G.y = GY; G.vy = 0; G.onGround = true;
      }
    } else G.onGround = false;
    } else if (mode === 'fly') {
      pressed = false;
      var tv = holding ? -2.0 : 1.7; G.vy += (tv - G.vy) * 0.16; G.y += G.vy;
      if (G.y < 30) { G.y = 30; G.vy = 0; } if (G.y > GY) { G.y = GY; G.vy = 0; }
      G.onGround = false;
    } else if (mode === 'jet') {
      pressed = false;
      if (holding) { G.vy -= 0.34; if (G.frame % 2 === 0) particle(G.x - 1, G.y - 4, -1 - R(), 1.2 + R(), 14, R() < 0.5 ? '#ffb84f' : '#ff6a2a', 1, 0); } else G.vy += G.id === 'Feline1' ? 0.19 : 0.24;
      G.vy = clamp(G.vy, -3, 3.2); G.y += G.vy;
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
      G.vy = Math.min(1.5, G.vy + 0.1); G.y += G.vy;
      if (G.y < 30) { G.y = 30; G.vy = Math.max(0, G.vy); }
      if (G.y >= GY) { G.y = GY; G.vy = 0; G.onGround = true; } else G.onGround = false;
    }
    G.hist.unshift([G.y, G.gdir]); G.hist.length = 80;

    var ba = biomeAt(G.dist), nb = ba[1];
    if (nb !== G.biome || ba[0] !== G.loop) {
      var from = BIOMES[G.biome], nbm = BIOMES[nb];
      G.prevBiome = G.biome; G.biome = nb; G.loop = ba[0]; G.blend = 0;
      G.obs = G.obs.filter(function (o) { return o.x < G.x - 24; }); G.items = []; G.gap = 200; G.grace = 90;
      if ((from.mode || 'run') !== (nbm.mode || 'run')) { if (nbm.mode !== 'flip' && G.gdir < 0) { G.y += 20; G.gdir = 1; } if (nbm.mode) G.vy = 0; G.airFlip = false; }
      if (G.hp < G.maxHp && R() < 0.5) G.items.push({ x: W + 120, y: 70, ph: 0, heart: true });
      G.cps.push([Math.floor(G.dist), G.frame]);
      if (nbm.rift) { G.flash = 0.65; SFX.rift(); } else { beep(523, 0.1, 'triangle', 0.05); setTimeout(function () { beep(784, 0.16, 'triangle', 0.05); }, 90); }
      var en = nbm.en;
      if (from.boss) { G.shards += 10; en = 'CORE SHATTERED! +10'; burst(170, 60, 30, ['#7fd3ff', '#ffffff', '#b48cff'], 2.5); }
      if (nb === 0 && G.loop > 0) en = 'LOOP ' + (G.loop + 1) + ' · FASTER!';
      if (nbm.warm) en = 'REST POINT · SHIELD UP';
      showBanner(nbm.name, en);
      emit({ type: 'biome', id: id, name: nbm.name, line: nbm.line });
      if (id === 'X0' && !G.shield) G.shield = 1;
      if (nbm.boss) G.bossT = 90;
    }
    if (BIOMES[G.biome].boss && G.blend > 0.5) {
      if (--G.bossT <= 0) { spawnIce(); G.bossThrow = 24; G.bossT = 100 + R() * 70 - Math.min(40, G.loop * 12); }
    }
    if (G.bossThrow > 0) G.bossThrow--;
    if (G.blend < 1) G.blend = Math.min(1, G.blend + 1 / 90);
    if (G.flash > 0) G.flash = Math.max(0, G.flash - 0.05);
    if (G.dist >= G.nextMilestone) { emit({ type: 'milestone', id: id, dist: G.nextMilestone }); G.nextMilestone += 100; }
    if (id === 'X0' && !G.shield && G.dist - G.shieldAt > 150) { G.shield = 1; SFX.shield(); }
    if (G.inv > 0) G.inv--;
    if (G.banner) { G.banner.t++; if (G.banner.t > 170) G.banner = null; }
    if (G.shake > 0) G.shake *= 0.85;

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
      if (o.x < -40) { G.obs.splice(i, 1); continue; }
      if (o.pit || o.safe || (o.type === 'ice' && o.warn > 0)) continue;
      if (G.inv <= 0 && G.grace <= 0 && hit(o)) {
        if (G.shield) {
          G.shield = 0; G.shieldAt = G.dist; G.inv = 70; G.shake = 4; SFX.shield();
          burst(o.x + o.w / 2, o.y - o.h / 2, 18, ['#b48cff', '#ffffff', '#7fd3ff'], 2);
          G.obs.splice(i, 1); continue;
        }
        if (--G.hp > 0) { G.inv = 100; G.shake = 6; SFX.hit(); burst(G.x + 8, G.y - 10, 14, ['#ff4f7a', '#ffffff'], 1.6); G.obs.splice(i, 1); continue; }
        die(); return;
      }
    }
    for (i = G.items.length - 1; i >= 0; i--) {
      var it = G.items[i]; it.x -= G.speed;
      if (G.id === 'X0' && !it.heart) { var mp = pbox(), mdx = mp[0] + 5 - (it.x + 4), mdy = mp[1] + 10 - (it.y + 4); if (mdx * mdx + mdy * mdy < 44 * 44) { it.x += mdx * 0.16; it.y += mdy * 0.16; } }
      if (it.x < -10) { G.items.splice(i, 1); continue; }
      var cx = it.x + 4, cy = it.y + Math.sin(G.frame * 0.1 + it.ph) * 2;
      var pb0 = pbox();
      if (cx > pb0[0] - 5 && cx < pb0[0] + pb0[2] + 5 && cy > pb0[1] - 5 && cy < pb0[1] + pb0[3] + 5) {
        if (it.heart) { G.hp = Math.min(G.maxHp, G.hp + 1); SFX.shield(); burst(cx, cy, 10, ['#ff4f7a', '#ffffff'], 1.2); G.items.splice(i, 1); continue; }
        G.shards++; G.items.splice(i, 1); SFX.shard();
        burst(cx, cy, 8, ['#ffd45e', '#ff4fa3', '#ffffff'], 1.1);
      }
    }
    var b = BIOMES[G.biome];
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
    if (ps.length > 400) ps.splice(0, ps.length - 400);
  }
  function score() { return Math.floor(game.dist) + game.shards * 25; }
  function die() {
    var G = game; st.mode = 'dying'; G.dieT = 0; G.vy = -3.5; G.shake = 7; SFX.hit();
    burst(G.x + 8, G.y - 10, 22, ['#ffffff', '#ff4f7a', '#7fd3ff'], 2.2);
    var sc = score(), isBest = sc > best;
    if (isBest) { best = sc; localStorage.setItem('runner-best', best); }
    G.isBest = isBest;
    emit({ type: 'over', id: G.id, score: sc, dist: Math.floor(G.dist), shards: G.shards, frames: G.frame, cps: G.cps.slice(), best: best, isBest: isBest, where: BIOMES[G.biome].name });
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
    if (b.boss && st.mode !== 'title') drawBoss(alpha);
    g.globalAlpha = alpha;
    drawLayer(b.mid, scroll * 0.45);
    if (b.anim) b.anim(b, scroll);
    g.globalAlpha = alpha;
    drawLayer(b.groundTile, scroll, GY);
    if (b.ceil) drawLayer(b.ceil, scroll * (b.ceilSpeed || 0.9), 0);
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
    drawBiome(BIOMES[Math.floor(t / 300) % BIOMES.length], t * 0.6, 1);
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
    drawCN(d.cn + ' · ' + d.perk, W / 2, 125, 6, '#ffffff', 'center', '#000');
    var hint = Math.floor(t / 120) % 2 ? '< > OR B: CHOOSE   A: START' : 'CLICK / SPACE TO START';
    if (Math.floor(t / 30) % 4 !== 3) PX.text(g, hint, W / 2 - PX.textWidth(hint) / 2, 148, '#ffd45e', '#3a1a40');
  }

  function drawPlay() {
    var G = game, b = BIOMES[G.biome], mode = b.mode || 'run';
    g.save();
    if (G.shake > 0.3) g.translate(Math.round((R() - 0.5) * G.shake), Math.round((R() - 0.5) * G.shake));
    if (G.blend < 1 && G.prevBiome >= 0) { drawBiome(BIOMES[G.prevBiome], G.scroll, 1); drawBiome(b, G.scroll, G.blend); }
    else drawBiome(b, G.scroll, 1);

    G.items.forEach(function (it) {
      var y = it.y + Math.sin(G.frame * 0.1 + it.ph) * 2;
      if (it.heart) { g.save(); g.translate(Math.round(it.x), Math.round(y)); g.scale(2, 2); g.drawImage(HEART[0], 0, 0); g.restore(); return; }
      g.fillStyle = 'rgba(255,212,94,.18)'; g.fillRect(Math.round(it.x) - 1, Math.round(y) - 1, 11, 11);
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
    G.obs.forEach(function (o) {
      if (o.pit) return;
      if (o.draw) { o.draw(o); return; }
      if (o.type === 'ice') {
        var cx = Math.round(o.x + o.w / 2);
        if (o.warn > 0 || !o.landed) {
          if (G.frame % 8 < 5) { g.fillStyle = 'rgba(127,211,255,.35)'; for (var yy = 0; yy < GY; yy += 4) g.fillRect(cx, yy, 1, 2); PX.text(g, '!', cx - 1, GY - 10, '#ff4f6a', '#000'); }
          g.fillStyle = 'rgba(20,10,40,.4)'; g.fillRect(cx - 4, GY - 1, 8, 2);
        }
        if (o.warn <= 0) g.drawImage(o.landed ? o.img : o.fall, Math.round(o.x), Math.round(o.y - o.h));
        return;
      }
      var img = o.img || o.anim[Math.floor(G.frame / (o.fly ? 8 : 6)) % 2];
      if (!o.fly && !o.noShadow && o.y >= GY - 1) { g.fillStyle = 'rgba(20,10,40,.3)'; g.fillRect(Math.round(o.x) + 1, GY - 1, o.w - 2, 2); }
      g.drawImage(img, Math.round(o.x), Math.round(o.y - o.h));
    });

    var mode = b.mode || 'run', dl = Math.round(20 / G.speed), dl2 = Math.round(38 / G.speed), others = PX.ORDER.filter(function (x) { return x !== G.id; });
    if (st.mode === 'play') {
      [[others[1], 38, dl2], [others[0], 20, dl]].forEach(function (c) {
        var h = G.hist[c[2]] || [GY, 1], h2 = G.hist[c[2] + 3] || h, y = h[0], gd = h[1];
        if (mode !== 'flip' && gd < 0) { y += 20; gd = 1; }
        if (mode === 'run') y = Math.min(GY, y);
        var air = mode === 'flip' ? !(gd > 0 ? y >= GY : y <= CY) : y < GY - 0.5;
        drawRider(c[0], G.x - c[1], y, G.frame + c[1], mode, gd, air, y - h2[0] < -0.4, (y - h2[0]) / 3);
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
      drawRider(G.id, G.x, G.y, G.frame, mode, G.gdir, !G.onGround, holding, G.vy);
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
    var pb = G.prevBiome >= 0 && G.blend < 1 ? BIOMES[G.prevBiome] : null;
    var dk = (b.dark ? G.blend : 0) + (pb && pb.dark ? 1 - G.blend : 0);
    if (dk > 0.01) {
      var lights = [[G.x + 8, G.y - 12, 44]];
      [b, pb].forEach(function (bb) { if (bb && bb.dark && bb.lights) lights = lights.concat(bb.lights); });
      G.items.forEach(function (it) { lights.push([it.x + 4, it.y + 4, 12]); });
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

    if (G.slowT > 0) {
      g.fillStyle = 'rgba(79,227,255,.12)'; g.fillRect(0, 0, W, H);
      g.fillStyle = 'rgba(79,227,255,.25)'; for (var sl2 = (st.t * 2) % 6; sl2 < H; sl2 += 6) g.fillRect(0, sl2, W, 1);
      if (st.t % 20 < 14) PX.text(g, 'OVERCLOCK', W / 2 - PX.textWidth('OVERCLOCK', 2) / 2, 74, '#ffffff', '#0a4a6a', 2);
    }
    if (G.flash > 0) {
      g.fillStyle = 'rgba(255,255,255,' + G.flash * 0.8 + ')'; g.fillRect(0, 0, W, H);
      for (var k = 0; k < 6; k++) { g.fillStyle = 'rgba(180,140,255,' + G.flash + ')'; g.fillRect(0, 20 + k * 22 + Math.sin(st.t * 0.3 + k) * 6, W, 2); }
    }
    PX.text(g, String(score()).padStart(5, '0'), 6, 6, '#ffffff', '#1a0f30', 2);
    PX.text(g, 'HI ' + String(best).padStart(5, '0'), 6, 19, '#ffd45e', '#1a0f30');
    g.drawImage(P.shard[0], W - 44, 5);
    PX.text(g, 'X' + G.shards, W - 32, 7, '#ffffff', '#1a0f30');
    PX.text(g, Math.floor(G.dist) + 'M', W - 6 - PX.textWidth(Math.floor(G.dist) + 'M'), 17, '#7fe0ff', '#1a0f30');
    var d = PX.CHARS[G.id];
    var MH = { fly: 'HOLD: RISE', jet: 'HOLD: THRUST', flip: 'TAP: FLIP GRAVITY', swim: 'TAP: SWIM' };
    if (MH[mode]) PX.text(g, MH[mode], 6, H - 9, '#ffffff', '#1a0f30');
    PX.text(g, skillLabel(G, mode), 6, 28, d.color, '#1a0f30');
    for (var hi = 0; hi < G.maxHp; hi++) g.drawImage(hi < G.hp ? HEART[0] : HEART[1], W - 6 - (G.maxHp - hi) * 8, 26);
    for (var wi = 0; wi < BIOMES.length; wi++) { g.fillStyle = wi === G.biome ? '#ffffff' : (wi < G.biome ? '#ff9fc4' : 'rgba(255,255,255,.25)'); g.fillRect(W / 2 - BIOMES.length * 2.5 + wi * 5, 5, 3, 3); }
    if (G.loop > 0) PX.text(g, 'LOOP ' + (G.loop + 1), W / 2 - PX.textWidth('LOOP ' + (G.loop + 1)) / 2, 11, '#ffd45e', '#1a0f30');
    if (G.banner) {
      var bt = G.banner.t, sl = bt < 20 ? (20 - bt) * 6 : (bt > 150 ? (bt - 150) * 6 : 0);
      box(W / 2 - 56, 42 - sl, 112, 26, 'rgba(18,13,36,.9)');
      drawCN(G.banner.cn, W / 2, 45 - sl, 9, '#ffffff', 'center');
      PX.text(g, G.banner.en, W / 2 - PX.textWidth(G.banner.en) / 2, 60 - sl, '#ff9fc4');
    }
    if (st.mode === 'paused') {
      g.fillStyle = 'rgba(10,6,30,.6)'; g.fillRect(0, 0, W, H);
      PX.text(g, 'PAUSE', W / 2 - PX.textWidth('PAUSE', 3) / 2, 38, '#ffffff', '#ff4fa3', 3);
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
  window.KittyRunner = { lens: LENS, action: function () { onAction(); }, release: release, b: bButton, dpad: dpad, state: st, best: function () { return best; } };
})();
