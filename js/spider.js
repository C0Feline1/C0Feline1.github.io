/* 小八 v3: a long-legged pixel spider that roams the page but never walks over the game console.
   Random behaviours: watch things, weave webs that form little pictures, swing on silk,
   dig a tunnel (always used to get past the console), nap, dance and wave at the cursor. */
(function () {
  if (!window.PX) return;
  var LS = 72, K = window.matchMedia('(max-width: 600px)').matches ? 2 : 3, CSS = LS * K, HALF = CSS / 2;
  var R = Math.random, pick = function (a) { return a[Math.floor(R() * a.length)]; };
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  var css = document.createElement('style');
  css.textContent =
    '.spider{position:absolute;left:0;top:0;width:' + CSS + 'px;height:' + CSS + 'px;image-rendering:pixelated;z-index:40;pointer-events:none;will-change:transform}' +
    '.silk{position:absolute;left:0;top:0;width:' + Math.max(1, K - 1) + 'px;background:linear-gradient(rgba(235,225,255,.25),rgba(235,225,255,.9));z-index:39;pointer-events:none;display:none;transform-origin:50% 0}' +
    '.spider-web{position:absolute;left:0;top:0;image-rendering:pixelated;z-index:38;pointer-events:none;transition:opacity 2s}' +
    '.spider-hole{position:absolute;left:0;top:0;image-rendering:pixelated;z-index:39;pointer-events:none;transform-origin:50% 50%}' +
    '.spider-dirt{position:absolute;left:0;top:0;width:' + K + 'px;height:' + K + 'px;z-index:41;pointer-events:none}' +
    '.spider-bub{position:absolute;left:0;top:0;z-index:41;pointer-events:none;background:#fff;color:#1a1030;font:13px/1.3 "DotGothic16",monospace;padding:3px 8px;border:2px solid #1a1030;box-shadow:3px 3px 0 #ff4fa3;white-space:nowrap;opacity:0;transition:opacity .15s}' +
    '.spider-bub::after{content:"";position:absolute;left:50%;bottom:-8px;margin-left:-4px;border:4px solid transparent;border-top-color:#1a1030}' +
    '.spider-bub.on{opacity:1}' +
    '.spider-snd{position:fixed;left:10px;bottom:10px;z-index:60;width:34px;height:34px;border:2px solid #1a1030;background:#2a1648;color:#fff;font-size:17px;line-height:28px;padding:0;cursor:pointer;box-shadow:2px 2px 0 #ff4fa3;opacity:.75;-webkit-tap-highlight-color:transparent}' +
    '.spider-snd:hover{opacity:1}.spider-snd.off{filter:grayscale(1);opacity:.45}.spider-snd.off::after{content:"";position:absolute;left:3px;right:3px;top:14px;height:2px;background:#ff4f6a;transform:rotate(-40deg)}' +
    /* phones: keep it away from the console d-pad; it sits in the header corner and scrolls away */
    '@media (max-width:640px){.spider-snd{position:absolute;left:auto;right:24px;top:22px;bottom:auto}}';
  document.head.appendChild(css);
  var cv = PX.make(LS, LS), g = cv.getContext('2d');
  cv.className = 'spider'; cv.setAttribute('aria-hidden', 'true'); document.body.appendChild(cv);
  var silk = document.createElement('div'); silk.className = 'silk'; document.body.appendChild(silk);
  var bub = document.createElement('div'); bub.className = 'spider-bub'; document.body.appendChild(bub);
  cv.style.transform = 'translate(-400px,-400px)';
  /* 小八's own little sound switch (independent of the game's SOUND switch) */
  var sndBtn = document.createElement('button'); sndBtn.className = 'spider-snd'; sndBtn.type = 'button'; sndBtn.textContent = '🕷';
  document.body.appendChild(sndBtn);
  function sndLabel(v) { sndBtn.classList.toggle('off', !v); sndBtn.title = sndBtn.ariaLabel = '小八的声音：' + (v ? '开' : '关'); sndBtn.setAttribute('aria-pressed', v ? 'true' : 'false'); }
  if (window.SND && SND.onSpider) SND.onSpider(sndLabel); else sndBtn.hidden = true;
  sndBtn.addEventListener('click', function (e) { e.stopPropagation(); if (window.SND) SND.toggleSpider(); });
  function snd(kind, opt) { if (window.SND && SND.spider) SND.spider(kind, opt); }

  var COL = { o: '#efe4ff', b: '#2a1648', B: '#4a2f7a', h: '#9a78e0', leg: '#d8c8ff', legD: '#a08cd8', knee: '#ff9fc4', eye: '#ffffff', mark: '#ff4fa3' };
  var S = { x: -300, y: -300, a: Math.PI / 2, v: 0, mode: 'off', t: 0, tx: 0, ty: 0, wait: 0, burst: 0, rest: 0, target: null, idleOff: 0, twitch: 0, look: 0,
    scale: 1, hop: 0, sink: 0, jx: 0, tuck: false, act: null, anchorY: 0 };
  var mouse = { x: -999, y: -999, t: 0, vx: 0, vy: 0 };
  var last = { web: -1e9, swing: -1e9, dig: -1e9, sleep: -1e9 };

  /* ---------- legs: planted feet + two-bone IK, long thin legs ---------- */
  var LEGS = [];
  [-1, 1].forEach(function (side) {
    [[2.2, 0.62, 18], [1.2, 1.25, 15.5], [0.2, 1.95, 15.5], [-0.8, 2.55, 18.5]].forEach(function (d, i) {
      LEGS.push({ side: side, i: i, hu: d[0], hv: side * 1.7, ang: d[1], rad: d[2], group: (i + (side > 0 ? 1 : 0)) % 2, fx: 0, fy: 0, sx: 0, sy: 0, ex: 0, ey: 0, t: 1 });
    });
  });
  function rot(u, v, a) { var c = Math.cos(a), s = Math.sin(a); return [u * c - v * s, u * s + v * c]; }
  function restWorld(L, tuck, extra) {
    var r = L.rad * (tuck ? 0.5 : 1), u = Math.cos(L.ang) * r, v = L.side * Math.sin(L.ang) * r;
    if (extra) { u += extra[0]; v += extra[1] * L.side; }
    var w = rot(u, v, S.a); return [S.x + w[0] * K, S.y + w[1] * K];
  }
  function plantAll(tuck) { LEGS.forEach(function (L) { var p = restWorld(L, tuck); L.fx = L.ex = p[0]; L.fy = L.ey = p[1]; L.t = 1; }); }
  function legOverride(L) {
    if (S.mode === 'wave' && L.i === 0) { var w = Math.sin(S.t * 0.35); return restWorld(L, false, [7 + w * 2, -5 + w * 6]); }
    if (S.mode === 'dance') { var ph = S.t * 0.3 + L.group * Math.PI; return restWorld(L, false, [Math.cos(ph) * 3, Math.sin(ph) * 4]); }
    return null;
  }
  function updateLegs(dt) {
    var stepping = [false, false], vx = Math.cos(S.a) * S.v, vy = Math.sin(S.a) * S.v;
    LEGS.forEach(function (L) { if (L.t < 1) stepping[L.group] = true; });
    LEGS.forEach(function (L) {
      var ov = legOverride(L);
      if (ov) { L.fx += (ov[0] - L.fx) * 0.35; L.fy += (ov[1] - L.fy) * 0.35; L.t = 1; return; }
      if (L.t < 1) {
        L.t = Math.min(1, L.t + 0.18 * dt * (S.v > 3 ? 1.7 : 1));
        var e = L.t * L.t * (3 - 2 * L.t); L.fx = L.sx + (L.ex - L.sx) * e; L.fy = L.sy + (L.ey - L.sy) * e; return;
      }
      var p = restWorld(L, S.tuck), dx = p[0] - L.fx, dy = p[1] - L.fy, d = Math.hypot(dx, dy);
      if (S.tuck) { L.fx += dx * 0.3; L.fy += dy * 0.3; return; }
      var thr = S.v > 0.2 ? 16 : 6;
      if ((d > thr && !stepping[1 - L.group]) || d > 50) { L.sx = L.fx; L.sy = L.fy; L.ex = p[0] + vx * 7; L.ey = p[1] + vy * 7; L.t = 0; stepping[L.group] = true; }
    });
    if (S.twitch > 0) {
      S.twitch -= dt;
      if (R() < 0.08) { var L = pick(LEGS); if (L.t >= 1) { var p = restWorld(L, S.tuck); L.sx = L.fx; L.sy = L.fy; L.ex = p[0] + (R() - .5) * 9; L.ey = p[1] + (R() - .5) * 9; L.t = 0; } }
    }
  }

  /* ---------- drawing ---------- */
  function px(x, y, c) { if (x < 0 || y < 0 || x >= LS || y >= LS) return; g.fillStyle = c; g.fillRect(x, y, 1, 1); }
  function line(x0, y0, x1, y1, c, put) {
    put = put || px; x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
    var dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1, e = dx + dy, n = 0;
    for (; n < 400; n++) { put(x0, y0, c); if (x0 === x1 && y0 === y1) break; var e2 = 2 * e; if (e2 >= dy) { e += dy; x0 += sx; } if (e2 <= dx) { e += dx; y0 += sy; } }
  }
  var C = LS / 2;
  function draw() {
    g.clearRect(0, 0, LS, LS);
    var ca = Math.cos(S.a), sa = Math.sin(S.a);
    LEGS.forEach(function (L) {
      var hx = C + L.hu * ca - L.hv * sa, hy = C + L.hu * sa + L.hv * ca;
      var fx = C + (L.fx - S.x) / K, fy = C + (L.fy - S.y) / K;
      var l1 = 11, l2 = 13, dx = fx - hx, dy = fy - hy, d = Math.max(0.01, Math.hypot(dx, dy));
      if (d > l1 + l2 - 0.3) { fx = hx + dx / d * (l1 + l2 - 0.3); fy = hy + dy / d * (l1 + l2 - 0.3); d = l1 + l2 - 0.3; }
      var a = (l1 * l1 - l2 * l2 + d * d) / (2 * d), h = Math.sqrt(Math.max(0, l1 * l1 - a * a)), ux = dx / d, uy = dy / d;
      var kx1 = hx + ux * a - uy * h, ky1 = hy + uy * a + ux * h, kx2 = hx + ux * a + uy * h, ky2 = hy + uy * a - ux * h, kx, ky;
      if (Math.hypot(kx1 - C, ky1 - C) > Math.hypot(kx2 - C, ky2 - C)) { kx = kx1; ky = ky1; } else { kx = kx2; ky = ky2; }
      var lift = L.t < 1 ? Math.sin(L.t * Math.PI) : 0;
      if (lift) { kx += (kx - C) * 0.1 * lift; ky += (ky - C) * 0.1 * lift; }
      line(hx, hy, kx, ky, COL.leg); line(kx, ky, fx, fy, COL.legD);
      px(Math.round(kx), Math.round(ky), COL.knee);
    });
    for (var y = C - 12; y < C + 12; y++) for (var x = C - 12; x < C + 12; x++) {
      var rx = x + 0.5 - C, ry = y + 0.5 - C, u = rx * ca + ry * sa, v = -rx * sa + ry * ca;
      var head = (u - 3) * (u - 3) / 9 + v * v / 6.8, abd = (u + 4.6) * (u + 4.6) / 21 + v * v / 11.5, waist = (u + 0.4) * (u + 0.4) / 2 + v * v / 1.4;
      var inside = head <= 1 || abd <= 1 || waist <= 1, near = head <= 1.55 || abd <= 1.35 || waist <= 2;
      if (!inside) { if (near) px(x, y, COL.o); continue; }
      var c = COL.b;
      if (abd <= 1 && (u + 4.6) * (u + 4.6) + v * v * 1.6 < 3.2) c = COL.mark;
      else if (v < -0.6 && (head < 0.6 || abd < 0.55)) c = COL.h;
      else if (v < 0.4) c = COL.B;
      px(x, y, c);
    }
    var lk = S.look || 0, closed = S.mode === 'sleep';
    [[4.6, -1.2], [4.6, 1.2], [3.6, -2], [3.6, 2]].forEach(function (e, k) {
      var u = e[0], v = e[1] + (k < 2 ? lk * 0.4 : 0), xx = Math.floor(C + u * ca - v * sa), yy = Math.floor(C + u * sa + v * ca);
      px(xx, yy, closed ? COL.B : (k < 2 ? COL.eye : '#d8c8ff'));
    });
  }

  /* ---------- speech ---------- */
  var sayUntil = 0;
  function say(text, ms) { var n = String(text).replace(/[^\u4e00-\u9fffA-Za-z]/g, '').length; if (n <= 1) snd('chirp'); else snd('babble', { n: Math.ceil(n / 1.5) }); bub.textContent = text; bub.classList.add('on'); sayUntil = performance.now() + (ms || 2400); placeBubble(); }
  function placeBubble() {
    var w = bub.offsetWidth, dw = document.documentElement.scrollWidth;
    var bx = clamp(S.x - w / 2, 4, dw - w - 4), by = S.y - S.hop - 26 * K;
    /* keep the bubble off the header clock/ticker: flip it below 小八 when it would overlap the top bar */
    var hd = document.querySelector('.top'); if (hd) { var hr = hd.getBoundingClientRect(), hb = hr.bottom + window.scrollY; if (by < hb + 4 && S.y < hb + 140) by = S.y + 14 * K; }
    bub.style.transform = 'translate(' + Math.round(bx) + 'px,' + Math.round(by) + 'px)';
  }

  /* ---------- geometry: the game console is off limits ---------- */
  var NG = null;
  function refreshNoGo() {
    var e = document.querySelector('.gba');
    if (!e) { NG = null; return; }
    var r = e.getBoundingClientRect();
    NG = { l: r.left + window.scrollX, t: r.top + window.scrollY, r: r.right + window.scrollX, b: r.bottom + window.scrollY };
  }
  function noGo(pad) { return NG ? { l: NG.l - pad, t: NG.t - pad, r: NG.r + pad, b: NG.b + pad } : null; }
  function inR(x, y, Q) { return !!Q && x > Q.l && x < Q.r && y > Q.t && y < Q.b; }
  function rectsOverlap(a, b) { return !!a && !!b && a.l < b.r && a.r > b.l && a.t < b.b && a.b > b.t; }
  function crosses(x0, y0, x1, y1, pad) {
    var Q = noGo(pad); if (!Q) return false;
    for (var i = 0; i <= 40; i++) { var t = i / 40; if (inR(x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, Q)) return true; }
    return false;
  }
  function view() { var de = document.documentElement; return { x: window.scrollX, y: window.scrollY, w: de.clientWidth, h: window.innerHeight, dw: de.scrollWidth, dh: de.scrollHeight }; }
  function okSpot(x, y) { var v = view(); return x > 24 && y > 24 && x < v.dw - 24 && y < v.dh - 24 && !inR(x, y, noGo(44)); }
  function onScreen(x, y, m) { var v = view(); m = m || 0; return x > v.x + m && x < v.x + v.w - m && y > v.y + m && y < v.y + v.h - m; }
  function nearestOutside(x, y) {
    var Q = noGo(56); if (!Q || !inR(x, y, Q)) return [x, y];
    var c = [[Q.l, y], [Q.r, y], [x, Q.t], [x, Q.b]].filter(function (p) { return okSpot(p[0], p[1]); });
    c.sort(function (a, b) { return Math.hypot(a[0] - x, a[1] - y) - Math.hypot(b[0] - x, b[1] - y); });
    return c[0] || null;
  }
  function randomSpot(far) {
    var v = view();
    for (var k = 0; k < 30; k++) {
      var x = v.x + 50 + R() * (v.w - 100), y = v.y + 70 + R() * (v.h - 140);
      if (okSpot(x, y) && (!far || Math.hypot(x - S.x, y - S.y) > 260)) return [x, y];
    }
    return null;
  }
  function angDiff(a, b) { var d = b - a; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; return d; }

  /* ---------- walking ---------- */
  var SPOTS = [
    { sel: '.gba', border: true, lines: ['加油！', '跳啊！', '前面有障碍！', '猫娘好快……', '我也想玩', '我在旁边看着～'] },
    { sel: '#studio', lines: ['他们在摸鱼吗？', 'X0 画得真好看', '猫猫又睡了', '咖啡好香'] },
    { sel: '#chart', lines: ['灵感涨了！', '这曲线是真的吗？', '梭哈灵感！'] },
    { sel: '#log', lines: ['日志好长', 'fixed？真的假的', '又在 commit 了'] },
    { sel: '#lbList', lines: ['第一名是谁？', '我也想上榜', '排行榜好热闹'] },
    { sel: '#cards', lines: ['bug 怎么又多了', '咖啡喝太多啦'] },
    { sel: '.works', lines: ['星梦画廊！', '？？？是什么呀', '期待新作品'] },
    { sel: '.links', lines: ['全是绿灯 ✓', '验证通过！'] },
    { sel: '#clock', lines: ['几点啦？', '该睡觉了吧'] },
    { sel: '#adBox', lines: ['这个风车好好看', '广告位？我能租吗', '小鱼干租金……付不起', '转啊转～'] }
  ];
  var IDLE = ['我叫小八', '这里风景不错', '八条腿也跑不过猫娘', '巡逻中', '嗯……', '今天也是好天气'];
  var CURIOUS = ['你在看什么？', '嗨～', '你的鼠标好大', '一起玩吗？'];
  var SCARED = ['哇！', '别抓我！', '溜了溜了', '！！'];
  function spotPoint(sp, r, v) {
    if (sp.border) {
      var side = pick(['top', 'left', 'right', 'bottom']);
      if (side === 'top') return [v.x + r.left + 40 + R() * Math.max(0, r.width - 80), v.y + r.top - 50];
      if (side === 'bottom') return [v.x + r.left + 40 + R() * Math.max(0, r.width - 80), v.y + r.bottom + 50];
      if (side === 'left') return [v.x + r.left - 52, v.y + r.top + 40 + R() * Math.max(0, r.height - 80)];
      return [v.x + r.right + 52, v.y + r.top + 40 + R() * Math.max(0, r.height - 80)];
    }
    var edge = R() < 0.6;
    return [v.x + r.left + 20 + R() * Math.max(0, r.width - 40), v.y + (edge ? r.top + 2 : r.top + 20 + R() * Math.max(0, r.height - 40))];
  }
  function goto(x, y, target, mode) {
    if (!okSpot(x, y)) { var n = nearestOutside(x, y); if (!n || !okSpot(n[0], n[1])) return false; x = n[0]; y = n[1]; }
    if (crosses(S.x, S.y, x, y, 30)) { startDig(x, y, target); return true; }
    S.tx = x; S.ty = y; S.target = target || null; S.mode = mode || 'walk'; S.burst = 30 + R() * 50; S.rest = 0; S.tuck = false; S.act = null;
    return true;
  }
  function chooseTarget() {
    var v = view(), vis = [];
    SPOTS.forEach(function (sp) { var e = document.querySelector(sp.sel); if (!e) return; var r = e.getBoundingClientRect(); if (r.width && r.bottom > 60 && r.top < v.h - 60) vis.push({ sp: sp, r: r }); });
    var fresh = performance.now() - mouse.t < 3000 && onScreen(mouse.x, mouse.y);
    if (fresh && R() < 0.18) {
      var ang = Math.atan2(S.y - mouse.y, S.x - mouse.x);
      if (goto(mouse.x + Math.cos(ang) * 80, mouse.y + Math.sin(ang) * 80, { curious: true })) return;
    }
    var pc = spinCenter();
    if (pc && R() < 0.14 && pc[1] > v.y + 40 && pc[1] < v.y + v.h - 40 && goto(pc[0] + (R() - 0.5) * 30, pc[1] + (R() - 0.5) * 30, { lines: ['风车！', '让我摸摸看'] })) return;
    for (var k = 0; k < 10; k++) {
      var p, tgt = null;
      if (vis.length && R() < 0.8) { var c = pick(vis); p = spotPoint(c.sp, c.r, v); tgt = c.sp; } else { p = randomSpot(); if (!p) continue; }
      if (okSpot(p[0], p[1]) && goto(p[0], p[1], tgt)) return;
    }
    S.mode = 'idle'; S.wait = 60;
  }
  function scare(fx, fy, text) {
    var base = Math.atan2(S.y - fy, S.x - fx), offs = [0, 0.6, -0.6, 1.2, -1.2, 1.8, -1.8];
    for (var k = 0; k < offs.length; k++) {
      var ang = base + offs[k], dist = 170 + R() * 140, x = S.x + Math.cos(ang) * dist, y = S.y + Math.sin(ang) * dist;
      if (okSpot(x, y) && !crosses(S.x, S.y, x, y, 30)) {
        S.tx = x; S.ty = y; S.mode = 'flee'; S.target = null; S.rest = 0; S.tuck = false; S.act = null; S.hop = 0; snd('hop'); say(text || pick(SCARED), 1300); return;
      }
    }
    var p = randomSpot(true); if (p) { say(text || '挖洞逃跑！', 1300); startDig(p[0], p[1], null); }
  }

  /* ---------- digging (also the only way past the console) ---------- */
  var holes = [], dirt = [];
  function makeHole(x, y) {
    var c = PX.make(24, 10), hx = c.getContext('2d');
    for (var yy = 0; yy < 10; yy++) for (var xx = 0; xx < 24; xx++) {
      var dx = (xx + 0.5 - 12) / 12, dy = (yy + 0.5 - 5) / 5, d = dx * dx + dy * dy;
      if (d <= 1) { hx.fillStyle = d > 0.7 ? (dy < 0 ? '#5a3a7a' : '#ff4fa3') : (d > 0.42 ? '#120a1e' : '#030208'); hx.fillRect(xx, yy, 1, 1); }
    }
    hx.fillStyle = '#ff9fc4'; [[0, 5], [1, 3], [23, 6], [22, 8], [11, 0], [6, 9], [17, 9]].forEach(function (p) { hx.fillRect(p[0], p[1], 1, 1); });
    c.className = 'spider-hole'; c.style.width = 24 * K + 'px'; c.style.height = 10 * K + 'px'; document.body.appendChild(c);
    var h = { el: c, x: x, y: y, s: 0 }; holes.push(h); holeTf(h); return h;
  }
  function holeTf(h) { h.el.style.transform = 'translate(' + Math.round(h.x - 12 * K) + 'px,' + Math.round(h.y - 5 * K) + 'px) scale(' + h.s.toFixed(3) + ',' + (h.s * h.s).toFixed(3) + ')'; }
  function dropHole(h) { h.el.remove(); var i = holes.indexOf(h); if (i >= 0) holes.splice(i, 1); }
  function spray(x, y, n) {
    var cols = ['#ff4fa3', '#4fe3ff', '#b48cff', '#ffd45e', '#5a3a7a'];
    for (var i = 0; i < n; i++) {
      var d = document.createElement('div'); d.className = 'spider-dirt'; d.style.background = pick(cols); document.body.appendChild(d);
      dirt.push({ el: d, x: x + (R() - 0.5) * 8 * K, y: y, vx: (R() - 0.5) * 5, vy: -2 - R() * 4, life: 36 + R() * 20 });
    }
  }
  function updateDirt(dt) {
    for (var i = dirt.length - 1; i >= 0; i--) {
      var p = dirt[i]; p.vy += 0.25 * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt;
      if (p.life <= 0) { p.el.remove(); dirt.splice(i, 1); continue; }
      p.el.style.transform = 'translate(' + Math.round(p.x) + 'px,' + Math.round(p.y) + 'px)'; p.el.style.opacity = Math.min(1, p.life / 15);
    }
  }
  function startDig(x, y, target) {
    S.mode = 'dig'; S.v = 0; S.tuck = false; S.hop = 0; last.dig = performance.now();
    S.act = { phase: 'in', t: 0, hole: makeHole(S.x, S.y + 4 * K), dest: [x, y], target: target };
    say(pick(['挖个洞过去～', '抄近路！', '游戏机挡路了，挖过去', '嘿咻嘿咻']), 1800);
  }
  function stepDig(dt) {
    var A = S.act; A.t += dt;
    if (A.phase === 'in') {
      A.hole.s = Math.min(1, A.t / 18); holeTf(A.hole);
      if (A.t < 50) { S.jx = (R() - 0.5) * 2 * K; if ((A.t % 6) < dt) spray(S.x, S.y + 4 * K, 3); S.twitch = 2; }
      else { S.jx = 0; S.scale = Math.max(0, 1 - (A.t - 50) / 22); S.sink = (A.t - 50) * 0.35 * K / 3; }
      if (A.t >= 72) { S.scale = 0; A.phase = 'close'; A.t = 0; }
    } else if (A.phase === 'close') {
      A.hole.s = Math.max(0, 1 - A.t / 14); holeTf(A.hole);
      if (A.t >= 14) { dropHole(A.hole); A.phase = 'tunnel'; A.t = 0; }
    } else if (A.phase === 'tunnel') {
      if (A.t >= 34) { S.x = A.dest[0]; S.y = A.dest[1]; S.sink = 0; S.a = Math.PI / 2 + (R() - 0.5); plantAll(); A.hole = makeHole(S.x, S.y + 4 * K); A.phase = 'open'; A.t = 0; }
    } else if (A.phase === 'open') {
      A.hole.s = Math.min(1, A.t / 14); holeTf(A.hole);
      if (A.t >= 14) { A.phase = 'out'; A.t = 0; spray(S.x, S.y + 4 * K, 10); }
    } else if (A.phase === 'out') {
      S.scale = Math.min(1, A.t / 18); S.hop = Math.sin(Math.min(1, A.t / 24) * Math.PI) * 10;
      if (A.t >= 24) { A.phase = 'shut'; A.t = 0; S.hop = 0; S.scale = 1; }
    } else if (A.phase === 'shut') {
      A.hole.s = Math.max(0, 1 - A.t / 14); holeTf(A.hole);
      if (A.t >= 14) {
        dropHole(A.hole); S.mode = 'idle'; S.wait = 90 + R() * 80; S.act = null;
        say(A.target && A.target.lines ? pick(A.target.lines) : pick(['挖通了！', '我又出来啦', '哈，从这里冒出来']), 2000);
      }
    }
  }

  /* ---------- weaving a web that turns into a little picture ---------- */
  var WS = 56, web = null;
  function arc(cx, cy, rx, ry, a0, a1, n) { var p = []; for (var i = 0; i <= n; i++) { var a = a0 + (a1 - a0) * i / n; p.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]); } return p; }
  var SHAPES = [
    { msg: '送你一颗心 ♥', strokes: function () { var p = []; for (var i = 0; i <= 48; i++) { var t = i / 48 * Math.PI * 2; p.push([28 + 16.5 * Math.pow(Math.sin(t), 3), 26 - (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * 1.05]); } return [p]; } },
    { msg: '是星星！', strokes: function () { var p = []; for (var i = 0; i <= 10; i++) { var a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 8 : 20; p.push([28 + Math.cos(a) * r, 29 + Math.sin(a) * r]); } return [p]; } },
    { msg: '笑一个～', strokes: function () { return [arc(28, 28, 18, 18, 0, Math.PI * 2, 40), [[22, 21], [22, 26]], [[34, 21], [34, 26]], arc(28, 29, 10, 8, 0.15 * Math.PI, 0.85 * Math.PI, 14)]; } },
    { msg: '喵～是猫猫', strokes: function () { return [arc(28, 33, 15, 13, 0, Math.PI * 2, 36), [[16, 26], [17, 11], [25, 21]], [[31, 21], [39, 11], [40, 26]], [[22, 30], [22, 33]], [[34, 30], [34, 33]], [[26, 38], [28, 39], [30, 38]], [[5, 35], [17, 36]], [[5, 40], [17, 39]], [[51, 35], [39, 36]], [[51, 40], [39, 39]]]; } },
    { msg: 'C0 的签名～', strokes: function () { return [arc(19, 28, 10, 13, Math.PI * 0.28, Math.PI * 1.72, 22), arc(39, 28, 8, 13, -Math.PI / 2, Math.PI * 1.5, 26)]; } },
    { msg: '♪ 啦啦啦～', strokes: function () { return [arc(20, 40, 6, 4.5, 0, Math.PI * 2, 16), [[26, 39], [26, 12]], [[26, 12], [38, 17], [37, 24], [26, 20]]]; } }
  ];
  function webPx(x, y, c) { if (x < 0 || y < 0 || x >= WS || y >= WS) return; web.ctx.fillStyle = c; web.ctx.fillRect(x, y, 1, 1); }
  function removeWeb(w) { if (!w) return; w.el.style.opacity = 0; setTimeout(function () { w.el.remove(); }, 2100); }
  function tryWeave() {
    var v = view(), x0 = S.x - 28 * K, y0 = S.y - 28 * K, box = { l: x0, t: y0, r: x0 + WS * K, b: y0 + WS * K };
    if (box.l < v.x + 4 || box.t < v.y + 4 || box.r > v.x + v.w - 4 || box.b > v.y + v.h - 4 || rectsOverlap(box, noGo(8))) return false;
    if (web) { removeWeb(web); web = null; }
    var c = PX.make(WS, WS); c.className = 'spider-web'; c.style.width = WS * K + 'px'; c.style.height = WS * K + 'px';
    c.style.transform = 'translate(' + Math.round(x0) + 'px,' + Math.round(y0) + 'px)'; document.body.appendChild(c);
    web = { el: c, ctx: c.getContext('2d'), x0: x0, y0: y0 };
    var shape = pick(SHAPES), path = [], spokes = [], k;
    for (k = 0; k < 8; k++) { var a = k * Math.PI / 4 + (R() - 0.5) * 0.25; spokes.push([28 + Math.cos(a) * 26, 28 + Math.sin(a) * 26]); }
    for (k = 0; k <= 90; k++) { var t = k / 90, ang = t * Math.PI * 6, r = 5 + t * 20; path.push([28 + Math.cos(ang) * r, 28 + Math.sin(ang) * r, 'spiral']); }
    shape.strokes().forEach(function (st) { st.forEach(function (p, i) { path.push([p[0], p[1], i === 0 ? 'jump' : 'draw']); }); });
    S.mode = 'weave'; S.tuck = false; S.v = 0; last.web = performance.now();
    S.act = { phase: 'spokes', t: 0, spokes: spokes, path: path, i: 0, pos: [28, 28], shape: shape };
    say(pick(['织个网～', '看我的手艺', '要织什么好呢']), 1600);
    return true;
  }
  function stepWeave(dt) {
    var A = S.act, base = '#9a8fc8', bright = '#ffe4f4', glow = '#c03a7a';
    A.t += dt;
    if (A.phase === 'spokes') {
      var k = Math.min(7, Math.floor(A.t / 6)), f = Math.min(1, (A.t - k * 6) / 6), sp = A.spokes[k];
      S.a += angDiff(S.a, Math.atan2(sp[1] - 28, sp[0] - 28)) * 0.3;
      line(28, 28, 28 + (sp[0] - 28) * f, 28 + (sp[1] - 28) * f, base, webPx);
      if (A.t >= 48) { A.spokes.forEach(function (s2) { line(28, 28, s2[0], s2[1], base, webPx); }); A.phase = 'path'; A.t = 0; }
    } else if (A.phase === 'path') {
      var budget = (A.path[A.i] && A.path[A.i][2] === 'spiral' ? 2.4 : 1.6) * dt;
      while (budget > 0 && A.i < A.path.length) {
        var tg = A.path[A.i], dx = tg[0] - A.pos[0], dy = tg[1] - A.pos[1], d = Math.hypot(dx, dy), stp = Math.min(d, budget);
        var nx = A.pos[0] + (d ? dx / d * stp : 0), ny = A.pos[1] + (d ? dy / d * stp : 0);
        if (tg[2] === 'spiral') line(A.pos[0], A.pos[1], nx, ny, base, webPx);
        else if (tg[2] === 'draw') { line(A.pos[0], A.pos[1] + 1, nx, ny + 1, glow, webPx); line(A.pos[0], A.pos[1], nx, ny, bright, webPx); }
        if (d > 0.01) S.a += angDiff(S.a, Math.atan2(dy, dx)) * 0.25;
        A.pos = [nx, ny]; budget -= stp;
        if (stp >= d) A.i++;
      }
      S.v = 1.4;
      if (A.i >= A.path.length) { A.phase = 'done'; A.t = 0; S.v = 0; }
    } else if (A.phase === 'done') {
      if (A.t < dt * 1.5) {
        for (var n = 0; n < 6; n++) { var s3 = pick(A.spokes), q = 0.3 + R() * 0.6; webPx(Math.round(28 + (s3[0] - 28) * q), Math.round(28 + (s3[1] - 28) * q), '#9ae8ff'); }
        say(A.shape.msg, 2600);
        var w = web; setTimeout(function () { if (web === w) web = null; removeWeb(w); }, 16000);
      }
      if (A.t > 70) { S.mode = 'idle'; S.wait = 60; S.act = null; }
    }
    S.x = web.x0 + A.pos[0] * K; S.y = web.y0 + A.pos[1] * K;
  }

  /* ---------- swinging on a silk thread ---------- */
  function trySwing() {
    var L = 85 + R() * 50, ax = S.x, ay = S.y - L, v = view();
    if (ay < v.y + 16 || !onScreen(S.x, S.y, 40)) return false;
    for (var k = -6; k <= 6; k++) { var th = k / 6 * 0.8, x = ax + Math.sin(th) * L, y = ay + Math.cos(th) * L; if (!okSpot(x, y)) return false; }
    if (crosses(ax, ay, ax, S.y, 24)) return false;
    S.mode = 'swing'; S.tuck = true; S.v = 0; last.swing = performance.now();
    S.act = { phase: 'shoot', t: 0, ax: ax, ay: ay, L: L, len: 0, th: 0, w: 0 };
    say('吐丝～', 1200);
    return true;
  }
  function stepSwing(dt) {
    var A = S.act; A.t += dt;
    if (A.phase === 'shoot') {
      A.len = Math.min(A.L, A.L * A.t / 14); S.a += angDiff(S.a, -Math.PI / 2) * 0.2;
      if (A.t >= 16) { A.phase = 'swing'; A.t = 0; A.w = 0.05 * (R() < 0.5 ? 1 : -1); say(pick(['荡秋千～', '呼～～', '飞起来啦']), 1600); }
      return;
    }
    if (A.phase === 'swing') {
      A.w += -0.0049 * (100 / A.L) * Math.sin(A.th) * dt; A.w *= Math.pow(0.9982, dt); A.th = clamp(A.th + A.w * dt, -0.85, 0.85);
      if (A.t > 320) { A.phase = 'climb'; A.t = 0; say(pick(['好晕……', '再来一次！', '好高～']), 1500); }
    } else if (A.phase === 'climb') {
      A.th *= Math.pow(0.9, dt); A.L = Math.max(4, A.L - 1.8 * dt);
      if (A.L <= 4.5) { S.x = A.ax; S.y = A.ay; S.mode = 'idle'; S.tuck = false; S.wait = 60; S.act = null; plantAll(); return; }
    }
    S.x = A.ax + Math.sin(A.th) * A.L; S.y = A.ay + Math.cos(A.th) * A.L; S.a = Math.PI / 2 - A.th;
  }

  /* ---------- small moods ---------- */
  function startMood(mode, dur, lines) { S.mode = mode; S.act = { t: 0, dur: dur }; S.v = 0; if (lines) say(pick(lines), 1600); }
  function stepMood(dt, now) {
    var A = S.act; A.t += dt;
    var md = Math.hypot(mouse.x - S.x, mouse.y - S.y), fresh = now - mouse.t < 700;
    if (S.mode === 'sleep') {
      S.tuck = true; S.hop = Math.sin(S.t * 0.05) * 1.2;
      if (Math.floor(A.t / 110) !== Math.floor((A.t - dt) / 110)) say('Zzz…', 1300);
      if (A.t > A.dur || (fresh && md < 90)) { S.mode = 'idle'; S.tuck = false; S.hop = 0; S.wait = 50; S.act = null; plantAll(); say(pick(['醒了！', '啊，睡着了', '嗯？']), 1400); }
    } else if (S.mode === 'dance') {
      S.hop = Math.abs(Math.sin(A.t * 0.25)) * 7; S.a += Math.sin(A.t * 0.12) * 0.05 * dt;
      if (Math.floor(A.t / 70) !== Math.floor((A.t - dt) / 70)) say(pick(['♪', '♫', '♪♪']), 900);
      if (A.t > A.dur) { S.mode = 'idle'; S.hop = 0; S.wait = 60; S.act = null; }
    } else if (S.mode === 'wave') {
      if (now - mouse.t < 4000) S.a += angDiff(S.a, Math.atan2(mouse.y - S.y, mouse.x - S.x)) * 0.15;
      if (A.t > A.dur) { S.mode = 'idle'; S.wait = 60; S.act = null; }
    }
  }
  function nextAction(now) {
    var r = R(), fresh = now - mouse.t < 3000;
    if (r < 0.15 && now - last.web > 25000 && tryWeave()) return;
    if (r < 0.28 && now - last.swing > 20000 && trySwing()) return;
    if (r < 0.34 && now - last.sleep > 30000 && onScreen(S.x, S.y, 30)) { last.sleep = now; startMood('sleep', 420 + R() * 300, ['好困……', '打个盹']); return; }
    if (r < 0.40) { startMood('dance', 200, ['跳个舞～', '♪～', '♫ 嗒嗒嗒']); return; }
    if (r < 0.46 && fresh) { startMood('wave', 130, ['嗨～', '你好呀！', '看这里看这里']); return; }
    if (r < 0.52 && now - last.dig > 15000) { var p = randomSpot(true); if (p) { startDig(p[0], p[1], null); return; } }
    chooseTarget();
  }

  /* ---------- drop in from the top when off screen ---------- */
  function dropIn() {
    var v = view();
    for (var k = 0; k < 14; k++) {
      var x = v.x + 60 + R() * Math.max(10, v.w - 120), ty = v.y + 80 + R() * Math.min(240, v.h * 0.4);
      if (okSpot(x, ty) && !crosses(x, v.y, x, ty, 24)) {
        S.x = x; S.anchorY = v.y; S.y = v.y - 30; S.ty = ty; S.a = Math.PI / 2; S.v = 0; S.mode = 'dangle'; S.wait = 0; S.tuck = true; S.scale = 1; S.hop = 0; S.act = null;
        plantAll(true); return true;
      }
    }
    return false;
  }

  /* ---------- input + game events ---------- */
  document.addEventListener('pointermove', function (e) {
    var now = performance.now(), dt = Math.max(1, now - mouse.t);
    mouse.vx = (e.pageX - mouse.x) / dt * 16; mouse.vy = (e.pageY - mouse.y) / dt * 16; mouse.x = e.pageX; mouse.y = e.pageY; mouse.t = now;
  }, { passive: true });
  var CALM = { off: 1, dangle: 1, dig: 1, swing: 1, fling: 1 };
  document.addEventListener('pointerdown', function (e) {
    if (CALM[S.mode]) { if (S.mode === 'swing' && Math.hypot(e.pageX - S.x, e.pageY - S.y) < 50) say('别推我！', 1200); return; }
    if (Math.hypot(e.pageX - S.x, e.pageY - S.y) < 50) {
      snd('squeak');
      if (S.mode === 'weave' && web) { var w = web; web = null; setTimeout(function () { removeWeb(w); }, 6000); }
      scare(e.pageX, e.pageY, pick(['别戳我！', '痒……', '我是好蜘蛛！', '不吃 bug，只看 bug']));
    }
  });
  window.addEventListener('runner', function (e) {
    var d = e.detail; if (!onScreen(S.x, S.y) || S.mode === 'dig') return;
    if (d.type === 'over') say(d.isBest ? '新纪录！好厉害！' : pick(['啊……再来一次？', '差一点点！', '小心脚下！']), 2600);
    else if (d.type === 'biome') say(d.line || d.name, 2400);
  });
  window.addEventListener('leaderboard', function (e) { if (onScreen(S.x, S.y)) say('上榜啦！第 ' + e.detail.rank + ' 名！', 3000); });

  /* ---------- the AD SPACE pinwheel: touch it and get flung away (toss physics), then recover ---------- */
  var lastFling = -1e9;
  function spinCenter() {
    var el = window.AdSpin && AdSpin.el; if (!el) return null;
    var r = el.getBoundingClientRect(); if (!r.width) return null;
    return [r.left + window.scrollX + r.width / 2, r.top + window.scrollY + r.height / 2, r.width * 0.42];
  }
  function checkSpin(now) {
    if (CALM[S.mode] || S.scale < 0.9 || now - lastFling < 3000) return;
    var c = spinCenter(); if (!c || Math.hypot(S.x - c[0], S.y - c[1]) > c[2] + 6 * K) return;
    lastFling = now; var dir = S.x < c[0] ? -1 : 1; if (Math.abs(S.x - c[0]) < 4) dir = R() < 0.5 ? -1 : 1;
    if (web && S.mode === 'weave') { var w = web; web = null; removeWeb(w); }
    S.mode = 'fling'; S.tuck = true; S.v = 0; S.hop = 0; S.target = null;
    S.act = { vx: dir * (6 + R() * 3), vy: -10 - R() * 3, spin: dir * (0.3 + R() * 0.15), floor: Math.min(view().y + view().h - 50, S.y + 90 + R() * 140), bounce: 0, t: 0 };
    if (window.AdSpin) AdSpin.kick = 0.6;
    snd('whee'); say(pick(['哇啊啊——！', '呀～～飞了！', '风车好凶！']), 1500);
  }
  function stepFling(dt) {
    var A = S.act, v = view(); A.t += dt;
    A.vy += 0.45 * dt; S.x += A.vx * dt; S.y += A.vy * dt; S.a += A.spin * dt;
    if (S.x < v.x + 20) { S.x = v.x + 20; A.vx = Math.abs(A.vx) * 0.7; snd('bonk'); }
    if (S.x > v.x + v.w - 20) { S.x = v.x + v.w - 20; A.vx = -Math.abs(A.vx) * 0.7; snd('bonk'); }
    if (A.vy > 0 && S.y >= A.floor) {
      S.y = A.floor;
      if (A.bounce < 1 && A.vy > 4) { A.bounce++; A.vy = -A.vy * 0.38; A.vx *= 0.6; A.spin *= 0.5; snd('bonk'); }
      else {
        S.mode = 'idle'; S.tuck = false; S.act = null; S.wait = 130; S.twitch = 60; S.a = Math.PI / 2 + (R() - 0.5) * 0.6; plantAll();
        snd('dizzy'); say(pick(['头好晕……', '@_@ 转晕了', '再也不碰风车了……']), 2200);
        if (inR(S.x, S.y, noGo(30))) { var o = nearestOutside(S.x, S.y) || randomSpot(); if (o) startDig(o[0], o[1], null); }
      }
    }
    if (A.t > 400) { S.mode = 'idle'; S.tuck = false; S.act = null; S.wait = 60; plantAll(); }
  }

  /* ---------- main loop ---------- */
  var lastT = performance.now(), chatter = 500, guard = 0, sndMode = null, sndT = 0;
  function tick(now) {
    requestAnimationFrame(tick);
    var dt = Math.min(3, (now - lastT) / 16.67); lastT = now;
    if (document.hidden) return;
    refreshNoGo(); S.t += dt; updateDirt(dt);
    if (onScreen(S.x, S.y)) {
      if (S.mode !== sndMode) { var M = { swing: 'swing', dangle: 'swing', dig: 'dig', weave: 'web', wave: 'wave', dance: 'dance' }; if (M[S.mode]) snd(M[S.mode]); sndMode = S.mode; sndT = 0; }
      sndT += dt;
      if ((S.mode === 'walk' || S.mode === 'flee') && S.v > 0.6) snd('step');
      if (S.mode === 'weave' && sndT > 22) { sndT = 0; snd('web'); }
      if (S.mode === 'dig' && sndT > 14) { sndT = 0; snd('dig'); }
      if (S.mode === 'sleep' && sndT > 150) { sndT = 0; snd('snore'); setTimeout(function () { if (S.mode === 'sleep') snd('pop'); }, 2300); }
      if (S.mode === 'dance' && sndT > 48) { sndT = 0; snd('dance'); }
      if (S.mode === 'swing' && S.act && S.act.phase === 'swing' && Math.abs(S.act.w) < 0.004 && sndT > 40) { sndT = 0; snd('swing'); }
    }
    checkSpin(now);
    if (S.mode === 'dangle') {
      S.y += Math.max(0.6, (S.ty - S.y) * 0.05) * dt; S.a += angDiff(S.a, Math.PI / 2 + Math.sin(now / 300) * 0.15) * 0.1;
      if (S.y >= S.ty) { S.y = S.ty; S.wait += dt; if (S.wait > 40) { S.mode = 'idle'; S.wait = 40; S.twitch = 30; S.tuck = false; plantAll(); say(pick(['嗨～', '我来巡逻了', '大家在干嘛？']), 1800); } }
    } else if (S.mode === 'walk' || S.mode === 'flee') {
      var dx = S.tx - S.x, dy = S.ty - S.y, dist = Math.hypot(dx, dy), diff = angDiff(S.a, Math.atan2(dy, dx)), flee = S.mode === 'flee', maxV = flee ? 6 : 3;
      S.a += clamp(diff, -1, 1) * (flee ? 0.35 : 0.18) * dt;
      if (!flee) { if (S.rest > 0) { S.rest -= dt; if (S.rest <= 0) S.burst = 25 + R() * 60; } else { S.burst -= dt; if (S.burst <= 0) { S.rest = 8 + R() * 28; if (R() < 0.3) S.twitch = 10; } } }
      var go = (flee || S.rest <= 0) && Math.abs(diff) < 0.9, tv = go ? Math.min(maxV, dist / 12 + 0.6) : 0;
      S.v += (tv - S.v) * (tv > S.v ? 0.25 : 0.45) * dt;
      var nx = S.x + Math.cos(S.a) * S.v * dt, ny = S.y + Math.sin(S.a) * S.v * dt;
      if (inR(nx, ny, noGo(32))) { S.v = 0; startDig(S.tx, S.ty, S.target); }
      else { S.x = nx; S.y = ny; }
      if (S.mode !== 'dig' && dist < 6) {
        S.v = 0; S.mode = 'idle'; S.twitch = 20;
        if (S.target && S.target.curious) { S.wait = 90 + R() * 60; say(pick(CURIOUS)); }
        else if (S.target) { S.wait = 160 + R() * 200; if (R() < 0.9) say(pick(S.target.lines)); }
        else { S.wait = 60 + R() * 120; if (R() < 0.4) say(pick(IDLE)); }
      }
    } else if (S.mode === 'idle') {
      S.v = 0; S.wait -= dt;
      var mx = mouse.x - S.x, my = mouse.y - S.y, md = Math.hypot(mx, my), fr = now - mouse.t < 2500;
      if (fr && md < 220) {
        S.a += angDiff(S.a, Math.atan2(my, mx)) * 0.08 * dt; S.look = clamp(angDiff(S.a, Math.atan2(my, mx)) * 2, -1, 1);
        if (md < 60 && Math.hypot(mouse.vx, mouse.vy) > 6) scare(mouse.x, mouse.y);
      } else if (R() < 0.01) S.a += (R() - 0.5) * 1.2;
      if (R() < 0.006) S.twitch = 12;
      if (S.mode === 'idle' && S.wait <= 0) nextAction(now);
    } else if (S.mode === 'dig') stepDig(dt);
    else if (S.mode === 'weave') { if (web) stepWeave(dt); else { S.mode = 'idle'; S.act = null; } }
    else if (S.mode === 'swing') stepSwing(dt);
    else if (S.mode === 'fling') stepFling(dt);
    else if (S.mode === 'sleep' || S.mode === 'dance' || S.mode === 'wave') stepMood(dt, now);

    if (S.mode !== 'off') {
      if (++guard % 20 === 0 && !CALM[S.mode] && S.mode !== 'weave' && inR(S.x, S.y, noGo(20))) {
        var out = nearestOutside(S.x, S.y) || randomSpot(); if (out) startDig(out[0], out[1], null);
      }
      chatter -= dt;
      if (chatter <= 0) { chatter = 600 + R() * 600; if (onScreen(S.x, S.y) && !bub.classList.contains('on') && (S.mode === 'idle' || S.mode === 'walk')) say(pick(IDLE)); }
      if (!onScreen(S.x, S.y, -40) && S.mode !== 'dangle' && S.mode !== 'dig') { S.idleOff += dt; if (S.idleOff > 150) { S.idleOff = 0; dropIn(); } } else S.idleOff = 0;
      if (S.mode !== 'dig') updateLegs(dt);
      else if (S.act && S.act.phase === 'in') updateLegs(dt);
    }
    render(now);
  }
  function showSilk(x, y, h, rad) {
    silk.style.display = 'block'; silk.style.height = Math.max(0, Math.round(h)) + 'px';
    silk.style.transform = 'translate(' + Math.round(x) + 'px,' + Math.round(y) + 'px) rotate(' + (rad * 180 / Math.PI).toFixed(2) + 'deg)';
  }
  function render(now) {
    var sx = S.x + (S.jx || 0), sy = S.y - (S.hop || 0) + (S.sink || 0);
    cv.style.transform = 'translate(' + Math.round(sx - HALF) + 'px,' + Math.round(sy - HALF) + 'px) scale(' + S.scale.toFixed(3) + ')';
    if (S.mode === 'dangle') showSilk(S.x, S.anchorY, S.y - S.anchorY - 4 * K, 0);
    else if (S.mode === 'swing' && S.act) {
      if (S.act.phase === 'shoot') showSilk(S.x, S.y - S.act.len, S.act.len - 3 * K, 0);
      else showSilk(S.act.ax, S.act.ay, Math.max(0, S.act.L - 3 * K), -S.act.th);
    } else silk.style.display = 'none';
    if (S.scale > 0.02) draw();
    if (bub.classList.contains('on')) { if (now > sayUntil || S.scale < 0.3) bub.classList.remove('on'); else placeBubble(); }
  }
  setTimeout(function () { refreshNoGo(); if (!dropIn()) { var p = randomSpot(); if (p) { S.x = p[0]; S.y = p[1]; S.mode = 'idle'; S.wait = 30; plantAll(); } } requestAnimationFrame(tick); }, 1500);
  window.Xiaoba = {
    say: say, state: S,
    force: function (what) {
      refreshNoGo();
      if (what === 'weave') return tryWeave();
      if (what === 'swing') return trySwing();
      if (what === 'dig') { var p = randomSpot(true); if (p) { startDig(p[0], p[1], null); return true; } return false; }
      if (what === 'fling') { var c = spinCenter(); if (!c) return false; lastFling = -1e9; S.x = c[0] - 30; S.y = c[1]; S.mode = 'idle'; S.scale = 1; plantAll(); checkSpin(performance.now()); return S.mode === 'fling'; }
      if (what === 'sleep' || what === 'dance' || what === 'wave') { startMood(what, what === 'sleep' ? 400 : 200, ['…']); return true; }
      if (what === 'cross') {
        var Q = noGo(60); if (!Q) return false;
        var cx = (Q.l + Q.r) / 2, cy = (Q.t + Q.b) / 2;
        var pairs = [[[Q.l - 10, cy], [Q.r + 10, cy]], [[cx, Q.t - 10], [cx, Q.b + 10]]];
        for (var i = 0; i < pairs.length; i++) {
          var a = pairs[i][0], b = pairs[i][1];
          if (okSpot(a[0], a[1]) && okSpot(b[0], b[1])) { S.x = a[0]; S.y = a[1]; S.mode = 'idle'; S.scale = 1; plantAll(); return goto(b[0], b[1], null); }
        }
        return false;
      }
      return false;
    }
  };
})();
