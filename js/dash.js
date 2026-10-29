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
    cg.fillText(T('chart.canvasLabel'), 6, 14);
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
  window.addEventListener('c0-language-change', function () { if (chartVis) drawChart(); });
  drawChart();


})();
