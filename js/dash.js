/* Fake "control room" dashboard: all numbers are theatre. */
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var R = Math.random, pick = function (a) { return a[Math.floor(R() * a.length)]; };
  var T = function (key, vars) { return window.I18N ? I18N.t(key, vars) : key; };
  function LT(key, vars, zh) { return window.I18N && I18N.getLocale() !== 'zh-CN' ? I18N.log(key, vars) : zh; }
  function pad(n) { return String(n).padStart(2, '0'); }
  function now() { var d = new Date(); return pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds()); }
  function fmt(n) { return Math.round(n).toLocaleString(window.I18N ? I18N.getLocale() : 'en-US'); }

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
  function updateVerifyTime() { $('verifyTime').textContent = new Date().toLocaleString(window.I18N ? I18N.getLocale() : 'zh-CN', { hour12: false }); }
  updateVerifyTime();

  var tickerItems = [
    ['BUILD', 'ticker.build'], ['Stardream Gallery', 'ticker.gallery'], ['Feline1', 'ticker.feline'],
    ['X0', 'ticker.x0'], ['C0', 'ticker.commits'], ['app-ads.txt', 'ticker.ads'],
    ['CAT', 'ticker.sleep'], ['WEATHER', 'ticker.snow'], ['INFO', 'ticker.arcade']
  ];
  function renderTicker() {
    $('ticker').innerHTML = tickerItems.map(function (item) { return '<em>' + item[0] + '</em> ' + T(item[1]); }).join('　·　');
  }
  renderTicker();

  /* stat cards */
  var cards = [
    { id: 'coffee', title: 'card.coffee.title', tag: 'card.coffee.tag', col: '#ffd45e', v: 3, unit: 'card.coffee.unit', sub: 'card.coffee.sub', meter: 0.6 },
    { id: 'bugs', title: 'card.bugs.title', tag: 'card.bugs.tag', col: '#ff4f6a', v: 12, unit: '', sub: 'card.bugs.new', tone: 'down', meter: 0.4 },
    { id: 'pixels', title: 'card.pixels.title', tag: 'card.pixels.tag', col: '#4fe3ff', v: 128402, unit: '', sub: 'card.pixels.sub', meter: 0.8 },
    { id: 'best', title: 'card.best.title', tag: 'card.best.tag', col: '#ff6fa6', v: (window.KittyRunner ? KittyRunner.best() : 0), unit: 'card.best.unit', sub: 'card.best.sub', meter: 0.3 }
  ];
  function renderCards() {
    $('cards').innerHTML = cards.map(function (c) {
      return '<div class="panel card"><div class="ph"><h2 style="color:' + c.col + '">' + T(c.title) + '</h2><span class="tag" style="color:' + c.col + '">' + T(c.tag) +
        '</span></div><div class="big" id="cv-' + c.id + '">' + fmt(c.v) + T(c.unit) + '</div><div class="sub ' + (c.tone || '') + '" id="cs-' + c.id + '">' + T(c.sub, c.subVars) +
        '</div><div class="meter"><i id="cm-' + c.id + '" style="width:' + c.meter * 100 + '%;background:' + c.col + '"></i></div></div>';
    }).join('');
  }
  renderCards();
  function setCard(id, v, subKey, meter, tone, vars) {
    var c = cards.filter(function (x) { return x.id === id; })[0]; c.v = v;
    if (subKey) { c.sub = subKey; c.tone = tone || ''; c.subVars = vars || null; }
    $('cv-' + id).textContent = fmt(v) + T(c.unit);
    var sub = $('cs-' + id); sub.textContent = T(c.sub, c.subVars); sub.className = 'sub ' + (c.tone || '');
    if (meter !== undefined) { c.meter = meter; $('cm-' + id).style.width = Math.max(3, Math.min(100, meter * 100)) + '%'; }
  }
  if (window.I18N) window.addEventListener('c0-language-change', renderCards);
  setInterval(function () { setCard('pixels', cards[2].v > 999999 ? 128402 : cards[2].v + Math.floor(R() * 40), null, 0.5 + R() * 0.5); }, 700);
  setInterval(function () {
    var b = cards[1].v, d = R() < 0.55 ? -1 : 1, nb = Math.max(3, b + d);
    setCard('bugs', nb, d < 0 ? 'card.bugs.fixed' : 'card.bugs.new', nb / 20, d < 0 ? 'up' : 'down');
    if (d < 0) {
      var bugNo = 200 + Math.floor(R() * 99), bug = pick(['跳跃判定偏移 1px', '猫耳穿模', '雪花不下了', '存档读不出来', '狼跑得太快']);
      log('ok', LT('bugFixed', { num: bugNo }, 'fixed  #' + bugNo + ' ' + bug));
    }
  }, 6500);
  setInterval(function () {
    if (R() > 0.4) return;
    if (cards[0].v >= 6) { setCard('coffee', 0, 'card.coffee.over', 0.05); log('ok', LT('coffeeReset', null, 'reset  咖啡计数器归零，C0 改喝白开水')); return; }
    setCard('coffee', cards[0].v + 1, 'card.coffee.brew', (cards[0].v + 1) / 6); log('w', LT('coffeeBrew', null, 'coffee++  C0 去续了一杯咖啡'));
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
  var terminalEpoch = 0, bootTimers = [], terminalTimer = 0, logCursor = 0;
  function startTerminal() {
    var epoch = ++terminalEpoch;
    bootTimers.forEach(clearTimeout); bootTimers = [];
    clearTimeout(terminalTimer);
    logCursor = 0;
    logEl.textContent = ''; logEl.appendChild(cur);
    var localized = window.I18N && I18N.getLocale() !== 'zh-CN';
    var startLines = localized ? I18N.getLogLines('boot') : boot;
    startLines.forEach(function (b, i) {
      bootTimers.push(setTimeout(function () { if (epoch === terminalEpoch) log(b[0], b[1]); }, 250 + i * 320));
    });
    function loop() {
      if (epoch !== terminalEpoch) return;
      var m, delay;
      if (localized) {
        var lines = I18N.getLogLines('stream');
        if (!lines.length) lines = [['c', 'build.log']];
        m = lines[logCursor++ % lines.length];
        delay = 2400 + R() * 3600;
      } else {
        m = BuildLog.next();
        delay = BuildLog.inStory() ? 900 + R() * 900 : 2400 + R() * 3600;
      }
      log(m[0], m[1]);
      terminalTimer = setTimeout(loop, delay);
    }
    terminalTimer = setTimeout(loop, 3200);
  }
  startTerminal();

  window.addEventListener('runner', function (e) {
    var d = e.detail;
    if (d.type === 'over' && d.practice) {
      var practiceResult = d.clear ? (window.I18N ? I18N.log('practiceClear') : '通关 ✓') : (window.I18N ? I18N.log('practiceFail') : '倒下了');
      log('c', LT('practice', { id: d.id, where: d.where, result: practiceResult }, 'arcade ' + d.id + ' 练习「' + d.where + '」' + (d.clear ? '通关 ✓' : '倒下了') + ' · 不计分'));
    }
    else if (d.type === 'over') {
      var recordSuffix = d.isBest && window.I18N ? I18N.log('newRecord') : (d.isBest ? '  ★ 新纪录' : '');
      log(d.isBest ? 'ok' : 'w', LT('run', { id: d.id, where: d.where, distance: d.dist, score: d.score, record: recordSuffix }, 'arcade ' + d.id + ' 在「' + d.where + '」跑了 ' + d.dist + 'm · ' + d.score + ' 分' + (d.isBest ? '  ★ 新纪录' : '')));
      setCard('best', d.best, d.isBest ? 'card.best.new' : 'card.best.score', Math.min(1, d.best / 3000), d.isBest ? 'up' : '', { score: d.score });
    } else if (d.type === 'biome') log('p', LT('biome', { name: d.name }, 'arcade 抵达 → ' + d.name));
    else if (d.type === 'milestone' && d.dist % 300 === 0) log('c', LT('milestone', { id: d.id, distance: d.dist }, 'arcade ' + d.id + ' 已跑出 ' + d.dist + 'm'));
  });

  if (window.I18N) window.addEventListener('c0-language-change', function () {
    renderTicker(); updateVerifyTime(); startTerminal();
  });

  /* A / B / D-pad */
  function bindBtn(el, fn) {
    /* pointerdown only (no click handler anywhere on the console, so a tap can't fire twice); left button / primary touch only */
    el.addEventListener('pointerdown', function (e) { if (e.button > 0) return; e.preventDefault(); e.stopPropagation(); $('game').focus({ preventScroll: true }); fn(); });
  }
  /* Switch layout: A = jump / confirm, B = skill (back in menus), X = attack (hold: switch melee / ranged once, then auto attack), Y = interact,
     - = back / change character, + = pause / start */
  bindBtn($('aBtn'), function () { KittyRunner.action(); });
  bindBtn($('bBtn'), function () { KittyRunner.bPress(); });
  if ($('yBtn')) bindBtn($('yBtn'), function () { KittyRunner.y(); });
  if ($('minusBtn')) bindBtn($('minusBtn'), function () { KittyRunner.b(); });
  if ($('plusBtn')) bindBtn($('plusBtn'), function () { KittyRunner.plus(); });
  if ($('xBtn')) {
    /* X: hold = switch attack mode once, then auto attack. The pointer is captured so sliding a finger / the mouse a little
       off the button does not end the hold (that used to split one hold into several and flip the mode back and forth) */
    bindBtn($('xBtn'), function () { KittyRunner.fire(true); });
    $('xBtn').addEventListener('pointerdown', function (e) { try { $('xBtn').setPointerCapture(e.pointerId); } catch (er) { } });
    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(function (ev) { $('xBtn').addEventListener(ev, function () { KittyRunner.fire(false); }); });
  }
  /* mobile: a long press on the console must not select text, open the callout menu or the magnifier, and a double tap must
     not zoom. touchstart is cancelled on the console buttons and the screen (they work from pointer events); the music tab
     keeps its click */
  var conEl = document.querySelector('.gba');
  if (conEl) {
    conEl.addEventListener('contextmenu', function (e) { e.preventDefault(); });
    conEl.addEventListener('touchstart', function (e) { var t = e.target.closest && e.target.closest('button, canvas'); if (t && !t.classList.contains('mtab')) e.preventDefault(); }, { passive: false });
  }
  document.querySelectorAll('.dpad button').forEach(function (b) { bindBtn(b, function () { KittyRunner.dpad(b.dataset.d); }); });
  document.querySelectorAll('.dpad button[data-d=left], .dpad button[data-d=right], .dpad button[data-d=down]').forEach(function (b) {
    b.addEventListener('pointerdown', function () { if (KittyRunner.hold) KittyRunner.hold(b.dataset.d, true); });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (ev) { b.addEventListener(ev, function () { if (KittyRunner.hold) KittyRunner.hold(b.dataset.d, false); }); });
  });

  /* the console shell / Joy-Con bodies do nothing when clicked: only the real buttons act, and the screen starts a run from the title */
  var shell = document.querySelector('.gba');

  /* phase3C: Switch console. Picks "row" (Joy-Cons beside the screen) whenever the panel is >= 700 px wide, else
     "stack" (screen on top, Joy-Cons below), then sizes the screen: as wide as the panel allows while the screen (with the
     panel title and its bezel) still fits the window height. Desktop snaps to an integer device-pixel scale of 240 px
     when that costs less than 10 %, so the pixels stay crisp. Phones (<= 520 px) always stack and use the full width. */
  /* tabbed dock inside the fixed frame: which panels share the dock depends on the frame (portrait / phone landscape: all of
     them; landscape: everything except the stats and the studio cam) */
  var DOCK = { land: ['lb', 'term', 'chart', 'works', 'legal', 'ad'], port: ['cards', 'cam', 'lb', 'term', 'chart', 'works', 'legal', 'ad'] };
  DOCK.phl = DOCK.port;
  var docRoot = document.documentElement, dockTab = 'lb';
  try { dockTab = localStorage.getItem('dash-tab') || 'lb'; } catch (e) { }
  function dockSync() {
    var F = window.KR_FRAME; if (!F) return;
    var set = DOCK[F.mode] || [];
    if (set.indexOf(dockTab) < 0) dockTab = set.indexOf('lb') >= 0 ? 'lb' : set[0];
    docRoot.classList.toggle('dock', set.length > 0);
    document.querySelectorAll('[data-tab]').forEach(function (p) { var t = p.getAttribute('data-tab'); p.classList.toggle('tp', set.indexOf(t) >= 0); p.classList.toggle('tab-on', t === dockTab); });
    document.querySelectorAll('.dock-tabs button[data-t]').forEach(function (b) { var t = b.getAttribute('data-t'); b.hidden = t !== 'close' && set.indexOf(t) < 0; b.classList.toggle('on', t === dockTab); });
  }
  document.querySelectorAll('.dock-tabs button[data-t]').forEach(function (b) {
    b.addEventListener('click', function () {
      var t = b.getAttribute('data-t');
      if (t === 'close') { docRoot.classList.remove('dock-shown'); return; }
      dockTab = t; try { localStorage.setItem('dash-tab', t); } catch (e) { }
      dockSync(); window.dispatchEvent(new Event('resize'));
    });
  });
  if ($('dockOpen')) $('dockOpen').addEventListener('click', function () { docRoot.classList.add('dock-shown'); dockSync(); window.dispatchEvent(new Event('resize')); });
  dockSync();

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
    var F = window.KR_FRAME, vW = F ? F.w : window.innerWidth, vH = F ? F.h : window.innerHeight, force = ps.getPropertyValue('--force').trim();
    if (vW > 520) {
      /* height budget (CSS --fit on the arcade panel): "panel" = the panel's own (CSS-fixed) height, "view" = what is left of the
         first screen below the panel's top, default = the window height */
      var fit = ps.getPropertyValue('--fit').trim(), help = panel.querySelector('.help');
      var helpH = help && help.offsetParent ? help.offsetHeight + parseFloat(getComputedStyle(help).marginTop) + parseFloat(getComputedStyle(help).marginBottom) : 0;
      var chrome = extraY + (ph ? ph.offsetHeight + 6 : 0) + parseFloat(ps.paddingTop) + 6;
      var availH = vH - chrome;
      if (fit === 'panel') availH = panel.clientHeight - parseFloat(ps.paddingBottom) - helpH - chrome;
      else if (fit === 'view') availH = vH - (panel.getBoundingClientRect().top + window.scrollY) - parseFloat(ps.paddingBottom) - helpH - chrome - 8;
      var hW = Math.max(F ? 200 : 360, availH * 1.5);
      /* stacked: the Joy-Cons sit below the screen, so they take height too (~200 px incl. gaps) */
      var jcH = shell.classList.contains('stack') && jc ? jc.offsetHeight + 12 : 200;
      var sW = Math.min(stackW, Math.max(360, (availH - jcH) * 1.5)), rW = Math.min(rowW, hW);
      /* the full Switch look (Joy-Cons beside the screen) whenever the panel is at least ~700 px wide and the screen still gets
         >= 360 px; stacked only on narrow panels and phones, even if stacking would give a bigger screen */
      row = innerW >= 700 && rW >= 360; maxW = row ? rW : sW;
    }
    /* the fixed frame decides the console form itself (CSS --force): landscape frames always use the full Switch row,
       the portrait frame stacks the Joy-Cons under a full-width screen */
    if (force === 'row') { row = true; maxW = Math.max(160, Math.min(rowW, fit === 'panel' ? hW : rowW)); }
    else if (force === 'stack') { row = false; maxW = stackW; }
    shell.classList.toggle('row', row); shell.classList.toggle('stack', !row);
    var dpr = (window.devicePixelRatio || 1) * (F ? F.s : 1), s = Math.floor(maxW * dpr / 240), iw = s * 240 / dpr;
    var w = vW > 520 && s >= 2 && iw >= maxW * (F ? 0.95 : 0.9) ? iw : Math.floor(maxW); /* in the scaled frame only a near-free snap */
    if (Math.abs(w - lastScr) < 0.5) return;
    lastScr = w; shell.style.setProperty('--scrw', w + 'px'); shell.classList.add('sized');
  }
  if (shell && scrCv) {
    var scrT = 0, kickScr = function () { cancelAnimationFrame(scrT); scrT = requestAnimationFrame(function () { sizeScreen(); requestAnimationFrame(sizeScreen); }); };
    window.addEventListener('resize', function () { if (window.KR_FIT) KR_FIT(); dockSync(); kickScr(); });
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
    var box = ch.parentNode, dpr = (window.devicePixelRatio || 1) * (window.KR_FRAME ? KR_FRAME.s : 1), w = box.clientWidth, h = box.clientHeight;
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


})();
