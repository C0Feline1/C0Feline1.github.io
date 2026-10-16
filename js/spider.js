/* 小八: a slim pixel spider that roams the whole page, with planted-foot leg IK. */
(function () {
  if (!window.PX) return;
  var LS = 64, K = 3, CSS = LS * K, HALF = CSS / 2;
  var cv = PX.make(LS, LS), g = cv.getContext('2d');
  cv.className = 'spider'; cv.setAttribute('aria-hidden', 'true');
  var silk = document.createElement('div'); silk.className = 'silk';
  var bub = document.createElement('div'); bub.className = 'spider-bub';
  var css = document.createElement('style');
  css.textContent =
    '.spider{position:absolute;left:0;top:0;width:' + CSS + 'px;height:' + CSS + 'px;image-rendering:pixelated;z-index:40;pointer-events:none;will-change:transform}' +
    '.silk{position:absolute;left:0;top:0;width:1px;background:linear-gradient(rgba(230,220,255,.15),rgba(230,220,255,.8));z-index:39;pointer-events:none;display:none}' +
    '.spider-bub{position:absolute;left:0;top:0;z-index:41;pointer-events:none;background:#fff;color:#1a1030;font:13px/1.3 "DotGothic16",monospace;padding:3px 8px;border:2px solid #1a1030;box-shadow:3px 3px 0 #ff4fa3;white-space:nowrap;opacity:0;transition:opacity .15s}' +
    '.spider-bub::after{content:"";position:absolute;left:50%;bottom:-8px;margin-left:-4px;border:4px solid transparent;border-top-color:#1a1030}' +
    '.spider-bub.on{opacity:1}';
  document.head.appendChild(css);
  document.body.appendChild(silk); document.body.appendChild(cv); document.body.appendChild(bub);
  cv.style.transform = 'translate(-300px,-300px)';

  var R = Math.random, pick = function (a) { return a[Math.floor(R() * a.length)]; };
  var COL = { o: '#efe4ff', b: '#2a1648', B: '#4a2f7a', h: '#9a78e0', leg: '#cdb8ff', knee: '#ff9fc4', eye: '#ffffff', mark: '#ff4fa3' };

  /* ---------- state ---------- */
  var S = { x: -200, y: -200, a: Math.PI / 2, v: 0, mode: 'off', tx: 0, ty: 0, wait: 0, burst: 0, rest: 0, target: null, anchorY: 0, idleOff: 0, twitch: 0 };
  var mouse = { x: -999, y: -999, t: 0, vx: 0, vy: 0 };

  /* legs: hip in body frame (logical px, +u forward, +v right), rest foot as angle/radius */
  var LEGS = [];
  [-1, 1].forEach(function (side) {
    [[1.8, 0.6, 13], [1.0, 1.2, 11], [0.2, 1.9, 11], [-0.6, 2.5, 13]].forEach(function (d, i) {
      LEGS.push({ side: side, i: i, hu: d[0], hv: side * 1.6, ang: d[1], rad: d[2], group: (i + (side > 0 ? 1 : 0)) % 2, fx: 0, fy: 0, sx: 0, sy: 0, ex: 0, ey: 0, t: 1 });
    });
  });
  function rot(u, v, a) { var c = Math.cos(a), s = Math.sin(a); return [u * c - v * s, u * s + v * c]; }
  function restWorld(L, tuck) {
    var r = L.rad * (tuck ? 0.55 : 1), u = Math.cos(L.ang) * r, v = L.side * Math.sin(L.ang) * r;
    var w = rot(u, v, S.a); return [S.x + w[0] * K, S.y + w[1] * K];
  }
  function plantAll(tuck) { LEGS.forEach(function (L) { var p = restWorld(L, tuck); L.fx = L.ex = p[0]; L.fy = L.ey = p[1]; L.t = 1; }); }

  function updateLegs(dt, tuck) {
    var stepping = [false, false];
    LEGS.forEach(function (L) { if (L.t < 1) stepping[L.group] = true; });
    var vx = Math.cos(S.a) * S.v, vy = Math.sin(S.a) * S.v;
    LEGS.forEach(function (L) {
      if (L.t < 1) {
        L.t = Math.min(1, L.t + 0.2 * dt * (S.v > 2.5 ? 1.6 : 1));
        var e = L.t * L.t * (3 - 2 * L.t);
        L.fx = L.sx + (L.ex - L.sx) * e; L.fy = L.sy + (L.ey - L.sy) * e;
        return;
      }
      var p = restWorld(L, tuck), dx = p[0] - L.fx, dy = p[1] - L.fy, d = Math.hypot(dx, dy);
      if (tuck) { L.fx += dx * 0.3; L.fy += dy * 0.3; return; }
      var thr = S.v > 0.2 ? 12 : 5;
      if (d > thr && !stepping[1 - L.group] || d > 36) {
        L.sx = L.fx; L.sy = L.fy; L.ex = p[0] + vx * 6; L.ey = p[1] + vy * 6; L.t = 0; stepping[L.group] = true;
      }
    });
    if (S.twitch > 0) {
      S.twitch -= dt;
      if (R() < 0.08) { var L = pick(LEGS); if (L.t >= 1) { var p = restWorld(L); L.sx = L.fx; L.sy = L.fy; L.ex = p[0] + (R() - .5) * 6; L.ey = p[1] + (R() - .5) * 6; L.t = 0; } }
    }
  }

  /* ---------- drawing ---------- */
  function px(x, y, c) { if (x < 0 || y < 0 || x >= LS || y >= LS) return; g.fillStyle = c; g.fillRect(x, y, 1, 1); }
  function line(x0, y0, x1, y1, c) {
    x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
    var dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1, e = dx + dy, n = 0;
    for (; n < 200; n++) { px(x0, y0, c); if (x0 === x1 && y0 === y1) break; var e2 = 2 * e; if (e2 >= dy) { e += dy; x0 += sx; } if (e2 <= dx) { e += dx; y0 += sy; } }
  }
  var C = LS / 2;
  function draw() {
    g.clearRect(0, 0, LS, LS);
    var ca = Math.cos(S.a), sa = Math.sin(S.a);
    // legs
    LEGS.forEach(function (L) {
      var hx = C + L.hu * ca - L.hv * sa, hy = C + L.hu * sa + L.hv * ca;
      var fx = C + (L.fx - S.x) / K, fy = C + (L.fy - S.y) / K;
      var l1 = 7, l2 = 8, dx = fx - hx, dy = fy - hy, d = Math.max(0.01, Math.hypot(dx, dy));
      if (d > l1 + l2 - 0.2) { fx = hx + dx / d * (l1 + l2 - 0.2); fy = hy + dy / d * (l1 + l2 - 0.2); d = l1 + l2 - 0.2; }
      var a = (l1 * l1 - l2 * l2 + d * d) / (2 * d), h = Math.sqrt(Math.max(0, l1 * l1 - a * a));
      var ux = dx / d, uy = dy / d, sgn = L.side * (L.i < 2 ? -1 : 1);
      var pxv = -uy * sgn * -1, pyv = ux * sgn * -1;
      // knee bends away from body centre
      var kx1 = hx + ux * a + pxv * h, ky1 = hy + uy * a + pyv * h, kx2 = hx + ux * a - pxv * h, ky2 = hy + uy * a - pyv * h;
      var kx, ky; if (Math.hypot(kx1 - C, ky1 - C) > Math.hypot(kx2 - C, ky2 - C)) { kx = kx1; ky = ky1; } else { kx = kx2; ky = ky2; }
      var lift = L.t < 1 ? Math.sin(L.t * Math.PI) : 0;
      if (lift) { kx += (kx - C) * 0.12 * lift; ky += (ky - C) * 0.12 * lift; }
      line(hx, hy, kx, ky, COL.leg); line(kx, ky, fx, fy, COL.leg);
      px(Math.round(kx), Math.round(ky), COL.knee);
    });
    // body
    for (var y = C - 12; y < C + 12; y++) for (var x = C - 12; x < C + 12; x++) {
      var rx = x + 0.5 - C, ry = y + 0.5 - C, u = rx * ca + ry * sa, v = -rx * sa + ry * ca;
      var head = (u - 3) * (u - 3) / 9 + v * v / 6.8, abd = (u + 4.6) * (u + 4.6) / 21 + v * v / 11.5, waist = (u + 0.4) * (u + 0.4) / 2 + v * v / 1.4;
      var inside = head <= 1 || abd <= 1 || waist <= 1;
      var near = head <= 1.55 || abd <= 1.35 || waist <= 2;
      if (!inside) { if (near) px(x, y, COL.o); continue; }
      var c = COL.b;
      if (abd <= 1 && (u + 4.6) * (u + 4.6) + v * v * 1.6 < 3.2) c = COL.mark;
      else if (v < -0.6 && (head < 0.6 || abd < 0.55)) c = COL.h;
      else if (v < 0.4) c = COL.B;
      px(x, y, c);
    }
    var look = S.look || 0;
    [[4.6, -1.2], [4.6, 1.2], [3.6, -2], [3.6, 2]].forEach(function (e, k) {
      var u = e[0], v = e[1] + (k < 2 ? look * 0.4 : 0);
      px(Math.floor(C + u * ca - v * sa), Math.floor(C + u * sa + v * ca), k < 2 ? COL.eye : '#d8c8ff');
    });
  }

  /* ---------- speech ---------- */
  var sayUntil = 0;
  function say(text, ms) { bub.textContent = text; bub.classList.add('on'); sayUntil = performance.now() + (ms || 2400); placeBubble(); }
  function placeBubble() {
    var w = bub.offsetWidth, dw = document.documentElement.scrollWidth;
    var bx = Math.max(4, Math.min(dw - w - 4, S.x - w / 2)), by = S.y - 74;
    bub.style.transform = 'translate(' + Math.round(bx) + 'px,' + Math.round(by) + 'px)';
  }

  var SPOTS = [
    { sel: '#game', lines: ['加油！', '跳啊！', '前面有狼！', '猫娘好快……', '我也想玩'] },
    { sel: '#studio', lines: ['他们在摸鱼吗？', 'X0 画得真好看', '猫猫又睡了', '咖啡好香'] },
    { sel: '#chart', lines: ['灵感涨了！', '这曲线是真的吗？', '梭哈灵感！'] },
    { sel: '#log', lines: ['日志好长', 'fixed？真的假的', '又在 commit 了'] },
    { sel: '#cards', lines: ['bug 怎么又多了', '咖啡喝太多啦'] },
    { sel: '.works', lines: ['星梦画廊！', '？？？是什么呀', '期待新作品'] },
    { sel: '.links', lines: ['全是绿灯 ✓', '验证通过！'] },
    { sel: '#clock', lines: ['几点啦？', '该睡觉了吧'] }
  ];
  var IDLE = ['我叫小八', '这里风景不错', '八条腿也跑不过猫娘', '找个角落织网', '嗯……', '巡逻中'];
  var CURIOUS = ['你在看什么？', '嗨～', '你的鼠标好大', '一起玩吗？'];
  var SCARED = ['哇！', '别抓我！', '溜了溜了', '！！'];

  /* ---------- behaviour ---------- */
  function view() { var de = document.documentElement; return { x: window.scrollX, y: window.scrollY, w: de.clientWidth, h: window.innerHeight, dw: de.scrollWidth, dh: de.scrollHeight }; }
  function clampT() { var v = view(); S.tx = Math.max(20, Math.min(v.dw - 20, S.tx)); S.ty = Math.max(20, Math.min(v.dh - 20, S.ty)); }
  function goto(x, y, target, mode) { S.tx = x; S.ty = y; S.target = target || null; S.mode = mode || 'walk'; S.burst = 30 + R() * 50; S.rest = 0; clampT(); }
  function chooseTarget() {
    var v = view(), vis = [];
    SPOTS.forEach(function (sp) {
      var el = document.querySelector(sp.sel); if (!el) return;
      var r = el.getBoundingClientRect(); if (r.bottom > 60 && r.top < v.h - 60) vis.push({ sp: sp, r: r });
    });
    var mouseFresh = performance.now() - mouse.t < 3000 && mouse.y > v.y && mouse.y < v.y + v.h;
    var roll = R();
    if (mouseFresh && roll < 0.2) {
      var ang = Math.atan2(S.y - mouse.y, S.x - mouse.x);
      goto(mouse.x + Math.cos(ang) * 70, mouse.y + Math.sin(ang) * 70, { curious: true });
    } else if (vis.length && roll < 0.8) {
      var c = pick(vis), r = c.r, edge = R() < 0.6;
      goto(v.x + r.left + 20 + R() * Math.max(0, r.width - 40), v.y + (edge ? r.top + 2 : r.top + 20 + R() * Math.max(0, r.height - 40)), c.sp);
    } else goto(v.x + 40 + R() * (v.w - 80), v.y + 60 + R() * (v.h - 120));
  }
  function dropIn() {
    var v = view();
    S.x = v.x + 60 + R() * Math.max(10, v.w - 120); S.anchorY = v.y; S.y = v.y - 30; S.ty = v.y + 90 + R() * Math.min(220, v.h * 0.35);
    S.a = Math.PI / 2; S.v = 0; S.mode = 'dangle'; S.wait = 0; plantAll(true);
  }
  function onscreen() { var v = view(); return S.y > v.y - 40 && S.y < v.y + v.h + 40; }
  function angDiff(a, b) { var d = b - a; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; return d; }
  function scare(fromX, fromY, text) {
    var ang = Math.atan2(S.y - fromY, S.x - fromX) + (R() - 0.5) * 0.8, dist = 160 + R() * 160;
    goto(S.x + Math.cos(ang) * dist, S.y + Math.sin(ang) * dist, null, 'flee');
    say(text || pick(SCARED), 1400);
  }

  document.addEventListener('pointermove', function (e) {
    var now = performance.now(), dt = Math.max(1, now - mouse.t);
    mouse.vx = (e.pageX - mouse.x) / dt * 16; mouse.vy = (e.pageY - mouse.y) / dt * 16;
    mouse.x = e.pageX; mouse.y = e.pageY; mouse.t = now;
  }, { passive: true });
  document.addEventListener('pointerdown', function (e) {
    if (S.mode === 'off' || S.mode === 'dangle') return;
    if (Math.hypot(e.pageX - S.x, e.pageY - S.y) < 45) scare(e.pageX, e.pageY, pick(['别戳我！', '痒……', '我是好蜘蛛！', '不吃 bug，只看 bug']));
  });
  window.addEventListener('runner', function (e) {
    var d = e.detail;
    if (!onscreen()) return;
    if (d.type === 'over') say(d.isBest ? '新纪录！好厉害！' : pick(['啊……再来一次？', '差一点点！', '小心脚下！']), 2600);
    else if (d.type === 'biome') say(d.name.indexOf('峰') >= 0 ? '哇，极光！' : '下雪了！', 2400);
  });

  var last = performance.now(), chatter = 400;
  function tick(now) {
    requestAnimationFrame(tick);
    var dt = Math.min(3, (now - last) / 16.67); last = now;
    if (document.hidden) return;

    if (S.mode === 'dangle') {
      S.y += Math.max(0.6, (S.ty - S.y) * 0.05) * dt;
      S.a += angDiff(S.a, Math.PI / 2 + Math.sin(now / 300) * 0.15) * 0.1;
      if (S.y >= S.ty) { S.y = S.ty; S.wait += dt; if (S.wait > 40) { S.mode = 'idle'; S.wait = 40; S.twitch = 30; plantAll(); say(pick(['嗨～', '我来巡逻了', '大家在干嘛？']), 1800); } }
      updateLegs(dt, true);
    } else if (S.mode === 'walk' || S.mode === 'flee') {
      var dx = S.tx - S.x, dy = S.ty - S.y, dist = Math.hypot(dx, dy), want = Math.atan2(dy, dx), diff = angDiff(S.a, want);
      var flee = S.mode === 'flee', maxV = flee ? 5.5 : 2.6;
      S.a += Math.max(-1, Math.min(1, diff)) * (flee ? 0.35 : 0.18) * dt;
      if (!flee) { if (S.rest > 0) { S.rest -= dt; if (S.rest <= 0) S.burst = 25 + R() * 60; } else { S.burst -= dt; if (S.burst <= 0) { S.rest = 8 + R() * 28; if (R() < 0.3) S.twitch = 10; } } }
      var go = (flee || S.rest <= 0) && Math.abs(diff) < 0.9;
      var targetV = go ? Math.min(maxV, dist / 12 + 0.6) : 0;
      S.v += (targetV - S.v) * (targetV > S.v ? 0.25 : 0.45) * dt;
      S.x += Math.cos(S.a) * S.v * dt; S.y += Math.sin(S.a) * S.v * dt;
      if (dist < 5) {
        S.v = 0; S.mode = 'idle'; S.twitch = 20;
        if (S.target && S.target.curious) { S.wait = 90 + R() * 60; say(pick(CURIOUS)); }
        else if (S.target) { S.wait = 160 + R() * 200; if (R() < 0.9) say(pick(S.target.lines)); }
        else { S.wait = 60 + R() * 120; if (R() < 0.4) say(pick(IDLE)); }
      }
      updateLegs(dt);
    } else if (S.mode === 'idle') {
      S.v = 0; S.wait -= dt;
      var mx = mouse.x - S.x, my = mouse.y - S.y, md = Math.hypot(mx, my), fresh = now - mouse.t < 2500;
      if (fresh && md < 220) {
        S.a += angDiff(S.a, Math.atan2(my, mx)) * 0.08 * dt;
        S.look = Math.max(-1, Math.min(1, angDiff(S.a, Math.atan2(my, mx)) * 2));
        if (md < 60 && Math.hypot(mouse.vx, mouse.vy) > 6) scare(mouse.x, mouse.y);
      } else if (R() < 0.01) S.a += (R() - 0.5) * 1.2;
      if (R() < 0.006) S.twitch = 12;
      if (S.wait <= 0) chooseTarget();
      updateLegs(dt);
    }
    if (S.mode !== 'off') {
      chatter -= dt;
      if (chatter <= 0) { chatter = 500 + R() * 600; if (onscreen() && !bub.classList.contains('on')) say(pick(IDLE)); }
      if (!onscreen() && S.mode !== 'dangle') { S.idleOff += dt; if (S.idleOff > 150) { S.idleOff = 0; dropIn(); } } else S.idleOff = 0;
    }

    if (S.mode === 'dangle') {
      silk.style.display = 'block';
      silk.style.transform = 'translate(' + Math.round(S.x) + 'px,' + Math.round(S.anchorY) + 'px)';
      silk.style.height = Math.max(0, Math.round(S.y - S.anchorY - 6)) + 'px';
    } else silk.style.display = 'none';
    cv.style.transform = 'translate(' + Math.round(S.x - HALF) + 'px,' + Math.round(S.y - HALF) + 'px)';
    draw();
    if (bub.classList.contains('on')) { if (now > sayUntil) bub.classList.remove('on'); else placeBubble(); }
  }
  setTimeout(function () { dropIn(); requestAnimationFrame(tick); }, 1500);
  window.Xiaoba = { say: say, state: S };
})();
