/* HALL OF FAME: global top-100 leaderboard backed by feline1.top. */
(function () {
  var API = 'https://feline1.top/api/kr';
  var $ = function (id) { return document.getElementById(id); };
  var T = function (key, vars) { return window.I18N ? I18N.t(key, vars) : key; };
  var listEl = $('lbList'), statusEl = $('lbStatus');
  if (!listEl) return;
  var pending = null, myName = localStorage.getItem('runner-name') || '', lastTop = null, listMessageKey = null;
  var NAMES = { Feline1: 'FELINE1', C0: 'C0', X0: 'X0' };

  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function req(path, body) {
    var opt = body ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) } : {};
    return fetch(API + path, opt).then(function (r) {
      var ct = r.headers.get('content-type') || '';
      if (ct.indexOf('json') < 0) throw new Error('bad response ' + r.status);
      return r.json().then(function (j) { j._status = r.status; if (!r.ok && !j.error) j.error = 'HTTP ' + r.status; j._ok = r.ok; return j; });
    });
  }

  /* ---------- countries: ISO 3166-1 alpha-2, Chinese names from the browser (Intl), flag = regional-indicator emoji.
     Windows has no flag emoji (it shows two letters), so there we draw a small code badge instead: zero downloads. ---------- */
  var ISO = ('AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ ' +
    'DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY HK HM HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP ' +
    'KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM ' +
    'PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG ' +
    'UM US UY UZ VA VC VE VG VI VN VU WF WS YE YT ZA ZM ZW').split(' ');
  var ISOSET = {}; ISO.forEach(function (c) { ISOSET[c] = 1; });
  var dnCache = {};
  function ccName(c, lang) {
    try {
      lang = lang || (window.I18N ? I18N.getLocale() : 'zh-CN');
      if (!dnCache[lang]) dnCache[lang] = new Intl.DisplayNames([lang, 'en'], { type: 'region' });
      return dnCache[lang].of(c) || c;
    } catch (e) { return c; }
  }
  function ccChinese(c) { try { if (!dnCache['zh-Hans']) dnCache['zh-Hans'] = new Intl.DisplayNames(['zh-Hans'], { type: 'region' }); return dnCache['zh-Hans'].of(c) || c; } catch (e) { return c; } }
  function flagEmoji(c) { return String.fromCodePoint(0x1F1E6 + c.charCodeAt(0) - 65, 0x1F1E6 + c.charCodeAt(1) - 65); }
  var emojiFlags = (function () { /* colour pixels => the OS really draws flags */
    try { var c = document.createElement('canvas'); c.width = c.height = 16; var x = c.getContext('2d', { willReadFrequently: true }); x.font = '14px sans-serif'; x.textBaseline = 'top'; x.fillText(flagEmoji('JP'), 0, 0);
      var d = x.getImageData(0, 0, 16, 16).data; for (var i = 0; i < d.length; i += 4) if (d[i + 3] && (Math.abs(d[i] - d[i + 1]) > 30 || Math.abs(d[i] - d[i + 2]) > 30)) return true; } catch (e) { }
    return false;
  })();
  function flagHTML(c) { if (!c || !ISOSET[c]) return ''; return emojiFlags ? '<span class="flag" title="' + esc(ccName(c)) + '">' + flagEmoji(c) + '</span>' : '<span class="flag-cc" title="' + esc(ccName(c)) + '">' + c + '</span>'; }
  function guessCC() {
    var saved = localStorage.getItem('runner-cc'); if (saved !== null) return ISOSET[saved] ? saved : '';
    var langs = navigator.languages || [navigator.language || ''];
    for (var i = 0; i < langs.length; i++) { var m = /[-_]([A-Za-z]{2})\b/.exec(langs[i] || ''); if (m && ISOSET[m[1].toUpperCase()]) return m[1].toUpperCase(); }
    var base = (langs[0] || '').slice(0, 2).toLowerCase();
    return { zh: 'CN', ja: 'JP', ko: 'KR', de: 'DE', fr: 'FR', ru: 'RU', it: 'IT', es: 'ES', pt: 'BR', vi: 'VN', th: 'TH', id: 'ID' }[base] || '';
  }

  var highlight = null;
  /* phase3C: when the score was set, in the viewer's own time zone: "MM-DD HH:mm" (this year) or "YYYY-MM-DD" (older);
     hover shows the full local date/time. Falls back to the server's UTC date for old API responses without ts. */
  var TF = null;
  function makeTimeFormatter() { try { return new Intl.DateTimeFormat(window.I18N ? I18N.getLocale() : undefined, { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }); } catch (e) { return null; } }
  TF = makeTimeFormatter();
  function when(r) {
    if (!r.ts || !TF || !TF.formatToParts) return { s: r.date ? String(r.date).slice(5) : '', t: r.date || '' };
    var d = new Date(r.ts * 1000), p = {}; TF.formatToParts(d).forEach(function (x) { p[x.type] = x.value; });
    var hh = p.hour === '24' ? '00' : p.hour;
    return { s: +p.year === new Date().getFullYear() ? p.month + '-' + p.day + ' ' + hh + ':' + p.minute : p.year + '-' + p.month + '-' + p.day, t: d.toLocaleString(window.I18N ? I18N.getLocale() : undefined) };
  }
  function render(top) {
    lastTop = top; listMessageKey = top.length ? null : 'board.empty';
    if (!top.length) { listEl.innerHTML = '<li class="lb-empty">' + esc(T('board.empty')) + '</li>'; return; }
    listEl.innerHTML = top.map(function (r) {
      var cls = r.rank <= 3 ? ' top' + r.rank : '';
      if (highlight && r.name === highlight.name && r.score === highlight.score) cls += ' me';
      return '<li class="lb-row' + cls + '"><span class="lb-rank">' + r.rank + '</span><span class="lb-name">' + flagHTML(r.cc) + esc(r.name) +
        '</span><span class="lb-char">' + (NAMES[r.char] || '') + '</span><span class="lb-time" title="' + esc(when(r).t) + '">' + esc(when(r).s) + '</span><span class="lb-score">' + r.score + '</span></li>';
    }).join('');
    var me = listEl.querySelector('.me'); if (me) me.scrollIntoView({ block: 'nearest' });
  }
  var noScore = false, online = false; /* this run can't be scored (no run token): board refreshes must not hide that */
  function setStatus(ok) {
    online = ok;
    if (noScore) { statusEl.textContent = T(online ? 'board.online' : 'board.offline') + ' · ' + T('board.noScore'); statusEl.style.color = 'var(--red)'; return; }
    statusEl.textContent = T(online ? 'board.online' : 'board.offline'); statusEl.style.color = online ? 'var(--green)' : 'var(--red)';
  }
  function load() {
    req('/top?limit=100').then(function (j) { if (!j._ok) throw new Error(j.error); render(j.top || []); setStatus(true); })
      .catch(function () { setStatus(false); if (!lastTop || !lastTop.length) { lastTop = null; listMessageKey = 'board.unavailable'; listEl.innerHTML = '<li class="lb-empty">' + esc(T(listMessageKey)) + '</li>'; } });
  }
  load(); setInterval(load, 60000);

  /* ---------- name box: opens the moment the run ends; the game can't start a new run while it's open ---------- */
  var modal = $('lbModal'), input = $('lbName'), msg = $('lbMsg'), sendBtn = $('lbSend'), skipBtn = $('lbSkip');
  var retryRow = $('lbRetry'), retryMsg = $('lbRetryMsg'), escArmed = 0, sendLabelKey = 'modal.submit', skipLabelKey = 'modal.skip';
  function lockGame(v) { if (window.KittyRunner && KittyRunner.lock) KittyRunner.lock(v); }
  var msgKey = '', msgVars = null, msgBad = false;
  function setMsg(key, vars, bad) {
    msgKey = key || ''; msgVars = vars || null; msgBad = !!bad;
    msg.textContent = msgKey ? T(msgKey, msgVars) : '';
    msg.style.setProperty('color', msgBad ? 'var(--red)' : 'var(--cyan)', 'important');
  }
  var ccSel = $('lbCc'), ccFind = $('lbCcFind'), ccFlag = $('lbCcFlag'), CCS = null;
  function ccList() {
    if (CCS) return CCS;
    CCS = ISO.map(function (c) { return { c: c, label: ccName(c), en: ccName(c, 'en'), zh: ccChinese(c) }; }).filter(function (o) { return o.label !== 'Unknown Region' && o.en !== 'Unknown Region'; });
    CCS.sort(function (a, b) { return a.label.localeCompare(b.label, window.I18N ? I18N.getLocale() : 'zh-Hans'); });
    return CCS;
  }
  function fillCC(q, keep) {
    q = (q || '').trim().toLowerCase(); var cur = keep !== undefined ? keep : ccSel.value;
    var list = ccList().filter(function (o) { return !q || o.c.toLowerCase() === q || o.label.toLowerCase().indexOf(q) >= 0 || o.zh.toLowerCase().indexOf(q) >= 0 || o.en.toLowerCase().indexOf(q) >= 0; });
    var html = '<option value="">' + esc(T('board.countryNone')) + '</option>' + list.map(function (o) { return '<option value="' + o.c + '">' + (emojiFlags ? flagEmoji(o.c) + ' ' : '') + esc(o.label) + ' · ' + o.c + '</option>'; }).join('');
    ccSel.innerHTML = html;
    if (q && list.length && !list.some(function (o) { return o.c === cur; })) cur = list[0].c;
    ccSel.value = cur; if (ccSel.value !== cur) ccSel.value = '';
    showFlag();
  }
  function showFlag() { var c = ccSel.value; ccFlag.innerHTML = c ? flagHTML(c) : '🏳️'; }
  ccFind.addEventListener('input', function () { fillCC(ccFind.value); });
  ccSel.addEventListener('change', showFlag);
  function openModal(d) {
    ccFind.value = ''; fillCC('', d.cc !== undefined ? d.cc : guessCC());
    $('lbScore').textContent = d.score; $('lbRankHint').textContent = '';
    input.value = d.name || myName; setMsg('board.connecting'); sendBtn.disabled = true; sendLabelKey = 'modal.submit'; sendBtn.textContent = T(sendLabelKey); sendBtn.classList.remove('retry');
    skipLabelKey = 'modal.skip'; skipBtn.textContent = T(skipLabelKey);
    modal.hidden = false; lockGame(true); escArmed = 0; retryRow.hidden = true;
    setTimeout(function () { input.focus(); input.select(); }, 50);
  }
  function ready(rank) {
    if (modal.hidden) return;
    $('lbRankHint').textContent = rank ? T('board.expectedRank', { rank: rank }) : '';
    setMsg(''); sendBtn.disabled = false;
  }
  function closeModal() {
    modal.hidden = true; lockGame(false);
    /* a failed submit stays retryable from the leaderboard panel */
    if (pending && pending.failed) { retryRow.hidden = false; retryMsg.textContent = T('board.previousFailed', { score: pending.score, reason: pending.failed }); }
    else { pending = null; retryRow.hidden = true; }
    var g = $('game'); if (g) g.focus({ preventScroll: true });
  }
  skipBtn.addEventListener('click', closeModal);
  $('lbRetryBtn').addEventListener('click', function () { if (!pending) { retryRow.hidden = true; return; } openModal(pending); ready(pending.rank); setMsg(pending.failed ? 'board.lastFailed' : '', { reason: pending.failed }, true); });
  modal.addEventListener('keydown', function (e) {
    e.stopPropagation();
    if (e.key === 'Escape') {
      /* Esc never silently throws the score away: first press asks, second press (within 3 s) closes */
      e.preventDefault();
      if (!pending || Date.now() - escArmed < 3000) closeModal();
      else { escArmed = Date.now(); setMsg('board.pressAgain', { skip: T(skipLabelKey) }, true); }
    }
    if (e.key === 'Enter') send();
  });
  sendBtn.addEventListener('click', send);
  function fail(text) {
    pending.failed = text; setMsg('board.submitFailed', { reason: text }, true);
    sendBtn.disabled = false; sendLabelKey = 'board.retryShort'; sendBtn.textContent = T(sendLabelKey); sendBtn.classList.add('retry');
  }
  function send() {
    if (!pending || sendBtn.disabled) return;
    var name = input.value.trim();
    if (!name) { setMsg('board.nameRequired', null, true); return; }
    sendBtn.disabled = true; sendLabelKey = 'modal.submit'; sendBtn.textContent = T(sendLabelKey); setMsg('board.submitting');
    var d = pending; d.name = name; d.cc = ccSel.value;
    req('/submit', { run: d.run.run, nonce: d.run.nonce, name: name, score: d.score, dist: d.dist, shards: d.shards, frames: d.frames, cps: d.cps, v: d.v, cc: d.cc })
      .then(function (j) {
        if (j.ok) {
          myName = name; localStorage.setItem('runner-name', name); localStorage.setItem('runner-cc', d.cc || ''); pending = null; retryRow.hidden = true;
          highlight = { name: name, score: d.score };
          setMsg('board.submitted', { rank: j.rank }); load();
          window.dispatchEvent(new CustomEvent('leaderboard', { detail: { name: name, rank: j.rank, score: d.score } }));
          setTimeout(function () { if (!pending) closeModal(); }, 1400);
        } else fail((j.error || '服务器拒绝') + (j._status ? '（' + j._status + '）' : ''));
      })
      .catch(function (e) { fail(T('board.networkError') + (e && e.message ? ': ' + e.message : '')); });
  }

  function startRun(id) {
    return req('/start', { char: id }).then(function (j) { if (j.run) return j; throw new Error('no run'); });
  }
  var startP = null;
  window.addEventListener('runner', function (e) {
    var d = e.detail;
    if (d.practice) return; /* practice runs never talk to the leaderboard server (no /start, /qualify or /submit) */
    if (d.type === 'start') {
      noScore = false; setStatus(online);
      startP = startRun(d.id).then(function (j) { return j; }, function () { return null; });
    } else if (d.type === 'over') {
      var p = startP || Promise.resolve(null); startP = null;
      if (d.score <= 0) return;
      var mine = { score: d.score, dist: d.dist, shards: d.shards, frames: d.frames, cps: d.cps, v: d.v };
      pending = mine; openModal(mine);
      p.then(function (r) {
        /* /start failed at game start: retry once now; a run token is required by the server */
        if (!r) return startRun(d.id).catch(function () { return null; });
        return r;
      }).then(function (r) {
        if (pending !== mine) return;
        if (!r) { noScore = true; setStatus(online); pending = null; setMsg('board.cannotScore', null, true); sendBtn.disabled = true; skipLabelKey = 'board.understood'; skipBtn.textContent = T(skipLabelKey); return; }
        mine.run = r;
        return req('/qualify?score=' + d.score).then(function (j) {
          if (pending !== mine) return;
          if (!j._ok) { fail(j.error || ('HTTP ' + j._status)); return; }
          if (!j.qualifies) { pending = null; setMsg('board.notQualified'); sendBtn.disabled = true; skipLabelKey = 'board.ok'; skipBtn.textContent = T(skipLabelKey); setTimeout(function () { if (!modal.hidden && !pending) closeModal(); }, 2200); return; }
          mine.rank = j.rank; ready(j.rank);
        });
      }).catch(function (e) { if (pending === mine) fail('网络错误'); })
        .then(function () { setTimeout(load, 300); });
    }
  });

  if (window.I18N) window.addEventListener('c0-language-change', function () {
    TF = makeTimeFormatter();
    setStatus(online);
    if (lastTop) render(lastTop);
    else if (listMessageKey) listEl.innerHTML = '<li class="lb-empty">' + esc(T(listMessageKey)) + '</li>';
    sendBtn.textContent = T(sendLabelKey); skipBtn.textContent = T(skipLabelKey);
    if (msgKey) { msg.textContent = T(msgKey, msgVars); msg.style.setProperty('color', msgBad ? 'var(--red)' : 'var(--cyan)', 'important'); }
    if (!retryRow.hidden && pending && pending.failed) retryMsg.textContent = T('board.previousFailed', { score: pending.score, reason: pending.failed });
    CCS = null;
    if (ccSel.options.length) fillCC(ccFind.value, ccSel.value);
  });
})();
