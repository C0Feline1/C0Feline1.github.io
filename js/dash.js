/* Fake "control room" dashboard: all numbers are theatre. */
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var R = Math.random, pick = function (a) { return a[Math.floor(R() * a.length)]; };
  function pad(n) { return String(n).padStart(2, '0'); }
  function now() { var d = new Date(); return pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds()); }
  function fmt(n) { return Math.round(n).toLocaleString('en-US'); }

  /* logo: Feline1's face */
  (function () {
    var c = $('logoPx').getContext('2d'), s = PX.buildChar('Feline1').stand;
    c.drawImage(s, 0, 0, 16, 16, 0, 0, 16, 16);
  })();

  /* clock + mood */
  setInterval(function () {
    $('clock').textContent = now();
    var m = 60 + Math.sin(Date.now() / 9000) * 18 + R() * 4;
    $('moodTxt').textContent = m.toFixed(1) + '%'; $('moodBar').style.width = m + '%';
  }, 1000);
  $('clock').textContent = now();
  $('verifyTime').textContent = new Date().toLocaleString('zh-CN', { hour12: false });

  $('ticker').innerHTML = [
    '<em>BUILD</em> 归途的余温 v0.7.3 编译通过', '<em>星梦画廊</em> 封闭测试进行中', '<em>Feline1</em> 又把咖啡打翻了',
    '<em>X0</em> 今日份可爱已送达 ♥', '<em>C0</em> 提交了 17 次 "fix typo"', '<em>app-ads.txt</em> ✓ 200 OK',
    '<em>猫猫</em> 已连续睡眠 6 小时', '<em>天气</em> 霜脊方向有异常降雪', '<em>提示</em> 下面的跑酷可以玩'
  ].join('　·　');

  /* stat cards */
  var cards = [
    { id: 'coffee', t: 'COFFEE · 咖啡', tag: 'CAFFEINE', col: '#ffd45e', v: 3, unit: ' 杯', sub: '今日摄入', meter: 0.6 },
    { id: 'bugs', t: 'BUGS · 剩余', tag: 'TRACKER', col: '#ff4f6a', v: 12, unit: '', sub: '修一个冒两个', meter: 0.4 },
    { id: 'pixels', t: 'PIXELS · 已绘制', tag: 'CANVAS', col: '#4fe3ff', v: 128402, unit: '', sub: '全部由代码生成', meter: 0.8 },
    { id: 'best', t: 'YOUR BEST · 跑酷', tag: 'LOCAL', col: '#ff6fa6', v: (window.KittyRunner ? KittyRunner.best() : 0), unit: ' 分', sub: '去下面刷新纪录', meter: 0.3 }
  ];
  $('cards').innerHTML = cards.map(function (c) {
    return '<div class="panel card"><div class="ph"><h2 style="color:' + c.col + '">' + c.t + '</h2><span class="tag" style="color:' + c.col + '">' + c.tag +
      '</span></div><div class="big" id="cv-' + c.id + '">' + fmt(c.v) + c.unit + '</div><div class="sub" id="cs-' + c.id + '">' + c.sub +
      '</div><div class="meter"><i id="cm-' + c.id + '" style="width:' + c.meter * 100 + '%;background:' + c.col + '"></i></div></div>';
  }).join('');
  function setCard(id, v, sub, meter) {
    var c = cards.filter(function (x) { return x.id === id; })[0]; c.v = v;
    $('cv-' + id).textContent = fmt(v) + c.unit;
    if (sub) $('cs-' + id).innerHTML = sub;
    if (meter !== undefined) $('cm-' + id).style.width = Math.max(3, Math.min(100, meter * 100)) + '%';
  }
  setInterval(function () { setCard('pixels', cards[2].v > 999999 ? 128402 : cards[2].v + Math.floor(R() * 40), null, 0.5 + R() * 0.5); }, 700);
  setInterval(function () {
    var b = cards[1].v, d = R() < 0.55 ? -1 : 1, nb = Math.max(3, b + d);
    setCard('bugs', nb, d < 0 ? '<span class="up">▼ 修好一个</span>' : '<span class="down">▲ 又冒出一个</span>', nb / 20);
    if (d < 0) log('ok', 'fixed  #' + (200 + Math.floor(R() * 99)) + ' ' + pick(['跳跃判定偏移 1px', '猫耳穿模', '雪花不下了', '存档读不出来', '狼跑得太快']));
  }, 6500);
  setInterval(function () {
    if (R() > 0.4) return;
    if (cards[0].v >= 6) { setCard('coffee', 0, '咖啡因超标，改喝水', 0.05); log('ok', 'reset  咖啡计数器归零，C0 改喝白开水'); return; }
    setCard('coffee', cards[0].v + 1, '续了一杯 ☕', (cards[0].v + 1) / 6); log('w', 'coffee++  C0 去续了一杯咖啡');
  }, 15000);

  /* terminal */
  var logEl = $('log'), MAXL = 40, cur = document.createElement('span');
  cur.className = 'cursor'; logEl.textContent = ''; logEl.appendChild(cur);
  function esc(s) { return s.replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); }
  function log(cls, msg) {
    /* append one line, drop the oldest beyond MAXL: fixed-size DOM, no growing arrays */
    var d = document.createElement('div');
    d.innerHTML = '<span class="t">[' + now() + ']</span> <span class="' + cls + '">' + esc(msg) + '</span>';
    logEl.insertBefore(d, cur);
    while (logEl.childElementCount - 1 > MAXL) logEl.removeChild(logEl.firstElementChild);
    logEl.scrollTop = logEl.scrollHeight;
  }
  var boot = [
    ['c', 'boot   C0 STUDIO OS 2.6 ...'], ['ok', 'mount  /works/stardream-gallery  ✓'], ['ok', 'mount  /works/归途的余温  ✓'],
    ['ok', 'check  app-ads.txt → 200 OK'], ['ok', 'check  privacy-policy → 200 OK'], ['p', 'spawn  Feline1 / C0 / X0 已就位'],
    ['c', 'arcade KITTY RUNNER 已加载，等待玩家']
  ];
  boot.forEach(function (b, i) { setTimeout(function () { log(b[0], b[1]); }, 250 + i * 320); });
  setTimeout(function loop() {
    var m = BuildLog.next();
    log(m[0], m[1]);
    setTimeout(loop, BuildLog.inStory() ? 900 + R() * 900 : 2400 + R() * 3600);
  }, 3200);

  window.addEventListener('runner', function (e) {
    var d = e.detail;
    if (d.type === 'over' && d.practice) log('c', 'arcade ' + d.id + ' 练习「' + d.where + '」' + (d.clear ? '通关 ✓' : '倒下了') + ' · 不计分');
    else if (d.type === 'over') {
      log(d.isBest ? 'ok' : 'w', 'arcade ' + d.id + ' 在「' + d.where + '」跑了 ' + d.dist + 'm · ' + d.score + ' 分' + (d.isBest ? '  ★ 新纪录' : ''));
      setCard('best', d.best, d.isBest ? '<span class="up">▲ 新纪录！</span>' : '本次 ' + d.score + ' 分', Math.min(1, d.best / 3000));
    } else if (d.type === 'biome') log('p', 'arcade 抵达 → ' + d.name);
    else if (d.type === 'milestone' && d.dist % 300 === 0) log('c', 'arcade ' + d.id + ' 已跑出 ' + d.dist + 'm');
  });

  /* A / B / D-pad */
  function bindBtn(el, fn) {
    el.addEventListener('pointerdown', function (e) { e.preventDefault(); $('game').focus({ preventScroll: true }); fn(); });
  }
  /* Switch layout: A = jump / confirm, B = skill (back in menus), X = attack (hold: auto / Feline1 switches claw-yarn), Y = interact,
     - = back / change character, + = pause / start */
  bindBtn($('aBtn'), function () { KittyRunner.action(); });
  bindBtn($('bBtn'), function () { KittyRunner.bPress(); });
  if ($('yBtn')) bindBtn($('yBtn'), function () { KittyRunner.y(); });
  if ($('minusBtn')) bindBtn($('minusBtn'), function () { KittyRunner.b(); });
  if ($('plusBtn')) bindBtn($('plusBtn'), function () { KittyRunner.plus(); });
  if ($('xBtn')) { bindBtn($('xBtn'), function () { KittyRunner.fire(true); }); ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (ev) { $('xBtn').addEventListener(ev, function () { KittyRunner.fire(false); }); }); }
  document.querySelectorAll('.dpad button').forEach(function (b) { bindBtn(b, function () { KittyRunner.dpad(b.dataset.d); }); });
  document.querySelectorAll('.dpad button[data-d=left], .dpad button[data-d=right], .dpad button[data-d=down]').forEach(function (b) {
    b.addEventListener('pointerdown', function () { if (KittyRunner.hold) KittyRunner.hold(b.dataset.d, true); });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (ev) { b.addEventListener(ev, function () { if (KittyRunner.hold) KittyRunner.hold(b.dataset.d, false); }); });
  });

  /* tapping anywhere on the console shell focuses the game; on the title screen it also starts.
     Buttons and the screen handle themselves (no double trigger); during play the shell only focuses. */
  var shell = document.querySelector('.gba');
  if (shell) shell.addEventListener('click', function (e) {
    if (e.target.closest('button, canvas, a, input')) return;
    $('game').focus({ preventScroll: true });
    if (KittyRunner.state && KittyRunner.state.mode === 'title') KittyRunner.action();
  });

  /* phase3C: Switch console. Picks "row" (Joy-Cons beside the screen) unless stacking gives a clearly (15 %) bigger screen than
     "stack" (screen on top, Joy-Cons below), then sizes the screen: as wide as the panel allows while the screen (with the
     panel title and its bezel) still fits the window height. Desktop snaps to an integer device-pixel scale of 240 px
     when that costs less than 10 %, so the pixels stay crisp. Phones (<= 520 px) always stack and use the full width. */
  var scrCv = $('game'), lastScr = 0;
  function sizeScreen() {
    if (!shell || !scrCv) return;
    var panel = shell.parentElement, ph = panel.querySelector('.ph');
    var ps = getComputedStyle(panel), innerW = panel.clientWidth - parseFloat(ps.paddingLeft) - parseFloat(ps.paddingRight);
    var ch = scrCv.offsetHeight || 1, scr = shell.querySelector('.scr'), jc = shell.querySelector('.jc');
    /* bezel from the computed padding + border, not offsetWidth - canvas: in the stack layout the bezel stretches to the grid width,
       which made a too-small screen a stable answer (320 px phones got a 160 px screen) */
    var scs = getComputedStyle(scr), bezelX = parseFloat(scs.paddingLeft) + parseFloat(scs.paddingRight) + parseFloat(scs.borderLeftWidth) + parseFloat(scs.borderRightWidth);
    var jcW = jc ? jc.offsetWidth : 0;
    if (shell.classList.contains('stack')) jcW = parseFloat(getComputedStyle(shell).getPropertyValue('--jcw')) || 152; /* joy-con width in the row layout (CSS --jcw) */
    var extraY = scr.offsetHeight - ch + parseFloat(getComputedStyle(shell).paddingTop) + 12; /* never the (auto, centring) margin: no feedback */
    var stackW = Math.max(160, innerW - bezelX), rowW = innerW - bezelX - 2 * jcW, maxW = stackW, row = false;
    if (window.innerWidth > 520) {
      var availH = window.innerHeight - extraY - (ph ? ph.offsetHeight + 6 : 0) - parseFloat(ps.paddingTop) - 6, hW = Math.max(360, availH * 1.5);
      /* stacked: the Joy-Cons sit below the screen, so they take height too (~200 px incl. gaps) */
      var jcH = shell.classList.contains('stack') && jc ? jc.offsetHeight + 12 : 200;
      var sW = Math.min(stackW, Math.max(360, (availH - jcH) * 1.5)), rW = Math.min(rowW, hW);
      row = rW >= 300 && sW < rW * 1.15; maxW = row ? rW : sW; /* the full Switch look unless stacking gives a clearly bigger screen */
    }
    shell.classList.toggle('row', row); shell.classList.toggle('stack', !row);
    var dpr = window.devicePixelRatio || 1, s = Math.floor(maxW * dpr / 240), iw = s * 240 / dpr;
    var w = window.innerWidth > 520 && s >= 2 && iw >= maxW * 0.9 ? iw : Math.floor(maxW);
    if (Math.abs(w - lastScr) < 0.5) return;
    lastScr = w; shell.style.setProperty('--scrw', w + 'px'); shell.classList.add('sized');
  }
  if (shell && scrCv) {
    var scrT = 0, kickScr = function () { cancelAnimationFrame(scrT); scrT = requestAnimationFrame(function () { sizeScreen(); requestAnimationFrame(sizeScreen); }); };
    window.addEventListener('resize', kickScr);
    if (window.ResizeObserver) new ResizeObserver(kickScr).observe(shell.parentElement);
    sizeScreen(); if (document.fonts && document.fonts.ready) document.fonts.ready.then(kickScr);
  }

  /* ad box: a pixel pinwheel that never stops spinning (小八 gets flung if it touches it) */
  var spin = $('adSpin');
  if (spin) {
    var pg = spin.getContext('2d'), sa = 0, SC = ['#ff4fa3', '#4fe3ff', '#ffd45e', '#5dff8f']; /* own name: the studio cam below has its own `sg` */
    window.AdSpin = { el: spin, speed: 0.09, kick: 0 }; /* spider.js adds a kick when 小八 bumps into it */
    var spinVis = true, spinT = -1e9, spinOn = false;
    var drawSpin = function (ts) {
      if (document.hidden || !spinVis) { spinOn = false; return; } /* off-screen / hidden tab: loop stops, restarted below */
      requestAnimationFrame(drawSpin);
      if (ts - spinT < 40) return; /* ~25 fps */
      spinT = ts;
      sa += window.AdSpin.speed + window.AdSpin.kick; window.AdSpin.kick *= 0.97; pg.clearRect(0, 0, 40, 40);
      pg.fillStyle = '#3d2a66'; pg.fillRect(19, 20, 2, 20); pg.fillStyle = '#2a1648'; pg.fillRect(14, 38, 12, 2);
      for (var k = 0; k < 4; k++) {
        var a0 = sa + k * Math.PI / 2;
        for (var r = 2; r < 16; r++) for (var w = 0; w <= r * 0.7; w += 0.6) {
          var a = a0 + w / r, x = Math.round(20 + Math.cos(a) * r), y = Math.round(20 + Math.sin(a) * r);
          pg.fillStyle = w > r * 0.55 || r > 14 ? '#1a1030' : SC[k]; pg.fillRect(x, y, 1, 1);
        }
      }
      pg.fillStyle = '#ffffff'; pg.fillRect(19, 19, 2, 2);
    };
    var spinGo = function () { if (!spinOn && spinVis && !document.hidden) { spinOn = true; requestAnimationFrame(drawSpin); } };
    if (window.IntersectionObserver) new IntersectionObserver(function (en) { spinVis = en[en.length - 1].isIntersecting; spinGo(); }).observe(spin);
    document.addEventListener('visibilitychange', spinGo);
    spinGo();
  }

  /* inspiration chart */
  var ch = $('chart'), cg = ch.getContext('2d'), data = [], v = 70000;
  for (var i = 0; i < 90; i++) { v += (R() - 0.46) * 1800; data.push(v); }
  var chartVis = true;
  if (window.IntersectionObserver) new IntersectionObserver(function (en) { chartVis = en[en.length - 1].isIntersecting; if (chartVis) drawChart(); }).observe(ch);
  function drawChart() {
    var box = ch.parentNode, dpr = window.devicePixelRatio || 1, w = box.clientWidth, h = box.clientHeight;
    if (!w || !h) return;
    var bw0 = Math.round(w * dpr), bh0 = Math.round(h * dpr);
    if (ch.width !== bw0 || ch.height !== bh0) { ch.width = bw0; ch.height = bh0; }
    cg.setTransform(dpr, 0, 0, dpr, 0, 0); cg.clearRect(0, 0, w, h);
    var mn = Math.min.apply(null, data), mx = Math.max.apply(null, data), lh = h * 0.68;
    cg.strokeStyle = 'rgba(139,127,168,.15)'; cg.lineWidth = 1;
    for (var k = 0; k < 5; k++) { cg.beginPath(); cg.moveTo(0, k * lh / 4 + .5); cg.lineTo(w, k * lh / 4 + .5); cg.stroke(); }
    var px = function (i) { return i / (data.length - 1) * w; }, py = function (d) { return 6 + (1 - (d - mn) / (mx - mn || 1)) * (lh - 12); };
    var grd = cg.createLinearGradient(0, 0, 0, lh); grd.addColorStop(0, 'rgba(93,255,143,.35)'); grd.addColorStop(1, 'rgba(93,255,143,0)');
    cg.beginPath(); cg.moveTo(0, lh);
    data.forEach(function (d, i) { cg.lineTo(px(i), py(d)); });
    cg.lineTo(w, lh); cg.closePath(); cg.fillStyle = grd; cg.fill();
    cg.beginPath(); data.forEach(function (d, i) { i ? cg.lineTo(px(i), py(d)) : cg.moveTo(px(i), py(d)); });
    cg.strokeStyle = '#5dff8f'; cg.lineWidth = 2; cg.stroke();
    var lx = px(data.length - 1), ly = py(data[data.length - 1]);
    cg.fillStyle = '#5dff8f'; cg.beginPath(); cg.arc(lx - 2, ly, 3, 0, 7); cg.fill();
    var bw = w / data.length;
    data.forEach(function (d, i) {
      if (!i) return; var up = d >= data[i - 1], bh = Math.min(h - lh - 4, Math.abs(d - data[i - 1]) / 60 + 2);
      cg.fillStyle = up ? 'rgba(93,255,143,.75)' : 'rgba(255,79,106,.75)'; cg.fillRect(i * bw, h - bh, Math.max(1, bw - 1), bh);
    });
    cg.fillStyle = '#ff9fc4'; cg.font = '11px DotGothic16, monospace';
    cg.fillText('灵感', 6, 14);
  }
  setInterval(function () {
    var last = data[data.length - 1], nv = last + (R() - 0.47) * 2000;
    data.push(nv); data.shift(); if (chartVis) drawChart();
    var pct = (nv - data[0]) / data[0] * 100;
    $('chartVal').textContent = '✦ ' + fmt(nv);
    $('chartTag').textContent = (pct >= 0 ? '+' : '') + pct.toFixed(2) + '%';
    $('chartTag').style.color = pct >= 0 ? 'var(--green)' : 'var(--red)';
  }, 900);
  if (window.ResizeObserver) new ResizeObserver(function () { drawChart(); }).observe(ch.parentNode); /* box is out of the canvas' reach: no loop */
  else window.addEventListener('resize', drawChart);
  drawChart();

  /* ---------- studio cam ---------- */
  var scView = $('studio'), svg = scView.getContext('2d'), SW = 320, SH = 180, FY = 128;
  var sc = PX.make(SW, SH), sg = sc.getContext('2d');
  sg.imageSmoothingEnabled = false;
  var SP = {}; PX.ORDER.forEach(function (id) { SP[id] = PX.buildChar(id); });
  var props = PX.buildProps();
  var bg = (function () {
    var c = PX.skyGradient(SW, SH, ['#120c22', '#1e1534', '#2a1d45']), x = c.getContext('2d');
    for (var yy = FY; yy < SH; yy++) for (var xx = 0; xx < SW; xx++) {
      var plank = Math.floor((xx + (Math.floor((yy - FY) / 6) % 2) * 23) / 46);
      x.fillStyle = (yy - FY) % 6 === 0 || (xx + (Math.floor((yy - FY) / 6) % 2) * 23) % 46 === 0 ? '#1e1220' : (plank % 2 ? '#3a2436' : '#33202f');
      x.fillRect(xx, yy, 1, 1);
    }
    x.fillStyle = '#4a2e44'; x.fillRect(0, FY, SW, 2);
    x.fillStyle = '#ff4fa3'; x.fillRect(0, FY - 3, SW, 1);
    x.fillStyle = '#3a1838'; x.fillRect(0, FY - 2, SW, 2);
    // window frame
    x.fillStyle = '#0b0716'; x.fillRect(12, 16, 64, 58);
    x.fillStyle = '#4a3a6a'; x.fillRect(12, 16, 64, 2); x.fillRect(12, 72, 64, 2); x.fillRect(12, 16, 2, 58); x.fillRect(74, 16, 2, 58); x.fillRect(43, 16, 2, 58); x.fillRect(12, 44, 64, 2);
    x.fillStyle = '#5a4a7a'; x.fillRect(8, 74, 72, 3);
    // posters
    x.fillStyle = '#ff4fa3'; x.fillRect(90, 20, 30, 40); x.fillStyle = '#1a1030'; x.fillRect(91, 21, 28, 38);
    for (var s = 0; s < 14; s++) { x.fillStyle = s % 3 ? '#ffd45e' : '#fff'; x.fillRect(93 + (s * 7) % 24, 24 + (s * 11) % 22, 1, 1); }
    x.drawImage(props.shard[0], 100, 30);
    PX.text(x, 'STAR', 97, 49, '#ff9fc4'); PX.text(x, 'DREAM', 95, 54, '#ff9fc4');
    x.fillStyle = '#4fe3ff'; x.fillRect(126, 26, 22, 28); x.fillStyle = '#0c1a2a'; x.fillRect(127, 27, 20, 26);
    x.fillStyle = '#5a6fa8'; for (var m = 0; m < 20; m++) { var hh = 6 + Math.abs(10 - m) % 7; x.fillRect(127 + m, 53 - hh, 1, hh); }
    x.fillStyle = '#f4f8ff'; x.fillRect(135, 40, 3, 1); x.fillRect(134, 41, 5, 1);
    PX.text(x, 'V07', 131, 29, '#4fe3ff');
    // shelf with books
    x.fillStyle = '#4a2e44'; x.fillRect(196, 58, 60, 3); x.fillStyle = '#2a1828'; x.fillRect(196, 61, 60, 1);
    var bc = ['#ff4fa3', '#4fe3ff', '#ffd45e', '#b48cff', '#5dff8f', '#ff9f4f'];
    for (var b = 0; b < 8; b++) { var bh = 8 + (b * 5) % 5; x.fillStyle = bc[b % 6]; x.fillRect(226 + b * 3 + (b > 4 ? 2 : 0), 58 - bh, 2, bh); }
    // server rack
    x.fillStyle = '#0a0812'; x.fillRect(284, 52, 30, FY - 52); x.fillStyle = '#2a2240'; x.fillRect(284, 52, 30, 2); x.fillRect(284, 52, 2, FY - 52); x.fillRect(312, 52, 2, FY - 52);
    for (var u = 0; u < 9; u++) { x.fillStyle = '#17122a'; x.fillRect(288, 58 + u * 7, 22, 5); }
    // plant
    x.fillStyle = '#7a3a2a'; x.fillRect(262, FY - 10, 12, 10); x.fillStyle = '#5a2a20'; x.fillRect(262, FY - 10, 12, 2);
    [[268, FY - 22, '#3fae6a'], [263, FY - 17, '#2f8a55'], [272, FY - 18, '#2f8a55'], [266, FY - 28, '#5ad08a']].forEach(function (l) { x.fillStyle = l[2]; x.fillRect(l[0], l[1], 4, 9); x.fillRect(l[0] + 1, l[1] - 2, 2, 2); });
    return c;
  })();
  var desks = [
    { id: 'C0', x: 22, role: 'CODE', screen: '#4fe3ff' },
    { id: 'X0', x: 112, role: '', screen: '#b48cff' },
    { id: 'Feline1', x: 202, role: 'QA', screen: '#ff6fa6' }
  ];
  var bubbles = [], snow = [];
  for (var sn = 0; sn < 30; sn++) snow.push([R() * 60, R() * 54, 0.2 + R() * 0.4]);
  var codeLines = desks.map(function () { var a = []; for (var i = 0; i < 8; i++) a.push([Math.floor(R() * 4), 4 + Math.floor(R() * 14)]); return a; });
  var SAY = { C0: ['BUG!', 'PUSH!', 'HMM...', 'LGTM', '404?'], X0: ['NICE', 'YAY!', 'CUTE!', 'HMM'], Feline1: ['MEOW!', 'JUMP!', 'NYA?', 'OK!', 'FISH?'] };
  setInterval(function () { var d = pick(desks); bubbles = bubbles.filter(function (b) { return b.d !== d; }); bubbles.push({ d: d, text: pick(SAY[d.id]), t: 0 }); if (bubbles.length > 2) bubbles.shift(); }, 2200);
  var steam = [], tk = 0, lastS = 0;
  var studioVis = true, scW = 0, studioOn = false;
  function studioGo() { if (!studioOn && studioVis && !document.hidden) { studioOn = true; requestAnimationFrame(studio); } }
  if (window.IntersectionObserver) new IntersectionObserver(function (en) { studioVis = en[en.length - 1].isIntersecting; studioGo(); }).observe(scView);
  document.addEventListener('visibilitychange', studioGo);
  if (window.ResizeObserver) new ResizeObserver(function () { scW = scView.clientWidth; }).observe(scView);
  function studio(ts) {
    if (!studioVis || document.hidden) { studioOn = false; return; } /* off-screen: loop stops (studioGo restarts it) */
    requestAnimationFrame(studio);
    if (ts - lastS < 40) return; /* ~25 fps */
    lastS = ts; tk++;
    sg.drawImage(bg, 0, 0);
    // window: moon + snow
    sg.fillStyle = '#fff6d8'; sg.fillRect(56, 22, 6, 6); sg.fillRect(55, 23, 8, 4); sg.fillStyle = '#e8dcb0'; sg.fillRect(57, 24, 2, 1);
    snow.forEach(function (s) {
      s[1] += s[2]; s[0] += Math.sin((tk + s[1] * 9) * 0.02) * 0.15; if (s[1] > 54) { s[1] = 0; s[0] = R() * 60; }
      var px = 14 + Math.floor(s[0]), py = 18 + Math.floor(s[1]);
      if (px > 43 && px < 45 || py > 44 && py < 46) return;
      sg.fillStyle = '#e6eeff'; sg.fillRect(px, py, 1, 1);
    });
    // clock
    var d = new Date(), cx = 168, cy = 34;
    sg.fillStyle = '#ffd45e'; for (var a = 0; a < 40; a++) sg.fillRect(Math.round(cx + Math.cos(a / 40 * 6.283) * 10), Math.round(cy + Math.sin(a / 40 * 6.283) * 10), 1, 1);
    sg.fillStyle = '#1a1030'; for (var yy = -9; yy <= 9; yy++) for (var xx = -9; xx <= 9; xx++) if (xx * xx + yy * yy < 81) sg.fillRect(cx + xx, cy + yy, 1, 1);
    function hand(ang, len, col) { sg.fillStyle = col; for (var r = 0; r < len; r++) sg.fillRect(Math.round(cx + Math.sin(ang) * r), Math.round(cy - Math.cos(ang) * r), 1, 1); }
    hand((d.getHours() % 12 + d.getMinutes() / 60) / 12 * 6.283, 5, '#ffffff');
    hand(d.getMinutes() / 60 * 6.283, 7, '#ff9fc4');
    hand(d.getSeconds() / 60 * 6.283, 8, '#ff4f6a');
    // sleeping cat on shelf
    sg.drawImage(props.cat[Math.floor(tk / 40) % 2], 204, 52);
    if (tk % 75 < 60) PX.text(sg, 'Z', 218 + Math.floor((tk % 75) / 20) * 3, 46 - Math.floor((tk % 75) / 10), '#b8bce0');
    // rack LEDs
    for (var u = 0; u < 9; u++) for (var l = 0; l < 4; l++) {
      var on = ((tk >> 4) * (u + 3) * (l + 7)) % 5 > 1;
      sg.fillStyle = on ? (l === 3 ? '#ff4f6a' : '#5dff8f') : '#1a3a24'; sg.fillRect(290 + l * 3, 60 + u * 7, 2, 1);
    }
    // lamp light cones
    desks.forEach(function (dk) {
      sg.fillStyle = 'rgba(255,212,140,.05)';
      for (var k = 0; k < 10; k++) sg.fillRect(dk.x + 30 - k * 3, 74 + k * 4, 12 + k * 6, 4);
    });
    desks.forEach(function (dk, i) {
      var x = dk.x, s = SP[dk.id], typing = Math.floor((tk + i * 7) / 9) % 2;
      // chair
      sg.fillStyle = '#1a1226'; sg.fillRect(x + 2, 92, 4, 24); sg.fillRect(x + 2, 114, 18, 3); sg.fillRect(x + 10, 117, 2, 10); sg.fillRect(x + 4, 126, 14, 2);
      // character (upper body) facing the monitor
      var head = (tk + i * 40) % 220 < 6 ? s.blink : s.stand, bob = typing && i !== 2 ? 1 : 0;
      if (dk.id === 'Feline1' && Math.floor(tk / 75) % 4 === 3) bob = -Math.abs(Math.round(Math.sin(tk * 0.12) * 2));
      sg.drawImage(head, 0, 0, 16, 19, x + 8, 93 + bob, 16, 19);
      // desk
      sg.fillStyle = '#5a3a52'; sg.fillRect(x, 111, 70, 3); sg.fillStyle = '#3a2438'; sg.fillRect(x, 114, 70, 2); sg.fillRect(x + 2, 116, 3, FY - 116); sg.fillRect(x + 65, 116, 3, FY - 116);
      // hands on keyboard
      sg.fillStyle = '#0a0812'; sg.fillRect(x + 26, 109, 16, 2);
      sg.fillStyle = PX.CHARS[dk.id].pal.s; sg.fillRect(x + 24 + typing * 2, 108, 3, 2); sg.fillRect(x + 33 - typing * 2, 108, 3, 2);
      // monitor
      var mx = x + 38, my = 82;
      sg.fillStyle = '#0a0812'; sg.fillRect(mx, my, 30, 22); sg.fillRect(mx + 13, my + 22, 4, 5); sg.fillRect(mx + 9, my + 27, 12, 2);
      sg.fillStyle = '#0d1424'; sg.fillRect(mx + 1, my + 1, 28, 20);
      var lines = codeLines[i], off = Math.floor(tk / 25) % 8;
      for (var ln = 0; ln < 6; ln++) {
        var L = lines[(ln + off) % 8];
        sg.fillStyle = ['#4a5a7a', dk.screen, '#ffd45e', '#5dff8f'][L[0]];
        if (dk.id === 'X0') { sg.fillStyle = ['#ff9fc4', '#b48cff', '#ffd45e', '#4fe3ff'][(ln + off) % 4]; sg.fillRect(mx + 3 + (ln % 3) * 8, my + 3 + Math.floor(ln / 3) * 8, 7, 7); continue; }
        if (dk.id === 'Feline1') { sg.drawImage(SP.Feline1.run[Math.floor(tk / 5) % 4], 0, 0, 16, 24, mx + 9, my + 1, 12, 18); sg.fillStyle = '#7fd06a'; sg.fillRect(mx + 1, my + 18, 28, 3); break; }
        sg.fillRect(mx + 3 + L[0] * 2, my + 3 + ln * 3, L[1], 1);
      }
      if (dk.id === 'C0' && tk % 24 < 12) { sg.fillStyle = '#ffffff'; sg.fillRect(mx + 4, my + 18, 3, 1); }
      // name chip
      var lab = dk.role ? dk.id + ' ' + dk.role : dk.id, lw = PX.textWidth(lab) + 6, col = PX.CHARS[dk.id].color;
      sg.fillStyle = col; sg.fillRect(x + 4, 78, lw, 9); sg.fillStyle = '#0a0712'; sg.fillRect(x + 5, 79, lw - 2, 7);
      PX.text(sg, lab, x + 7, 80, col);
    });
    // coffee on C0's desk
    var mx0 = desks[0].x + 8;
    sg.fillStyle = '#ffffff'; sg.fillRect(mx0, 105, 6, 6); sg.fillRect(mx0 + 6, 106, 2, 3); sg.fillStyle = '#5a3020'; sg.fillRect(mx0 + 1, 105, 4, 1);
    if (tk % 5 === 0) steam.push([mx0 + 2 + R() * 2, 103, 40]);
    steam = steam.filter(function (p) { p[1] -= 0.35; p[0] += Math.sin(p[1] * 0.4) * 0.2; p[2]--; if (p[2] > 0) { sg.fillStyle = 'rgba(255,255,255,' + p[2] / 60 + ')'; sg.fillRect(Math.round(p[0]), Math.round(p[1]), 1, 1); } return p[2] > 0; });
    // speech bubbles
    bubbles.forEach(function (b) {
      b.t++; if (b.t > 75) return;
      var w = PX.textWidth(b.text) + 6, bx = b.d.x + 20, by = 62 - Math.min(3, Math.floor(b.t / 4));
      sg.fillStyle = '#ffffff'; sg.fillRect(bx, by, w, 9); sg.fillRect(bx + 2, by + 9, 2, 2);
      PX.text(sg, b.text, bx + 3, by + 2, '#1a1030');
    });
    // vignette scanlines
    sg.fillStyle = 'rgba(0,0,0,.12)'; for (var sy = 0; sy < SH; sy += 2) sg.fillRect(0, sy, SW, 1);
    PX.text(sg, 'CAM 01  ' + now(), 6, 4, '#ff4f6a', '#000');
    PX.text(sg, 'REC', SW - 18, 4, tk % 30 < 15 ? '#ff4f6a' : '#5a1a2a', '#000');
    var dpr = window.devicePixelRatio || 1, want = (scW || scView.clientWidth || SW) * dpr, s = Math.max(1, Math.min(8, Math.ceil(want / SW - 0.01)));
    if (scView.width !== SW * s) { scView.width = SW * s; scView.height = SH * s; }
    var ir = Math.abs(SW * s - want) < 1 ? 'pixelated' : 'auto';
    if (scView.style.imageRendering !== ir) scView.style.imageRendering = ir;
    svg.imageSmoothingEnabled = false; svg.drawImage(sc, 0, 0, SW * s, SH * s);
  }
  studioGo();
})();
