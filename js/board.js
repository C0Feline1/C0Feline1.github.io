/* HALL OF FAME: global top-100 leaderboard backed by feline1.top. */
(function () {
  var API = 'https://feline1.top/api/kr';
  var $ = function (id) { return document.getElementById(id); };
  var listEl = $('lbList'), statusEl = $('lbStatus');
  if (!listEl) return;
  var run = null, pending = null, myName = localStorage.getItem('runner-name') || '';
  var NAMES = { Feline1: 'FELINE1', C0: 'C0', X0: 'X0' };

  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function req(path, body) {
    var opt = body ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) } : {};
    return fetch(API + path, opt).then(function (r) { return r.json().then(function (j) { j._status = r.status; return j; }); });
  }

  var highlight = null;
  function render(top) {
    if (!top.length) { listEl.innerHTML = '<li class="lb-empty">还没有人上榜，第一名等你来拿！</li>'; return; }
    listEl.innerHTML = top.map(function (r) {
      var cls = r.rank <= 3 ? ' top' + r.rank : '';
      if (highlight && r.name === highlight.name && r.score === highlight.score) cls += ' me';
      return '<li class="lb-row' + cls + '"><span class="lb-rank">' + r.rank + '</span><span class="lb-name">' + esc(r.name) +
        '</span><span class="lb-char">' + (NAMES[r.char] || '') + '</span><span class="lb-score">' + r.score + '</span></li>';
    }).join('');
    var me = listEl.querySelector('.me'); if (me) me.scrollIntoView({ block: 'nearest' });
  }
  function load() {
    req('/top?limit=100').then(function (j) { render(j.top || []); statusEl.textContent = 'ONLINE'; statusEl.style.color = 'var(--green)'; })
      .catch(function () { statusEl.textContent = 'OFFLINE'; statusEl.style.color = 'var(--red)'; if (!listEl.children.length || listEl.querySelector('.lb-empty')) listEl.innerHTML = '<li class="lb-empty">排行榜暂时连不上，稍后再来看看</li>'; });
  }
  load(); setInterval(load, 60000);

  /* modal */
  var modal = $('lbModal'), input = $('lbName'), msg = $('lbMsg'), sendBtn = $('lbSend');
  function openModal(d, rank) {
    $('lbScore').textContent = d.score;
    $('lbRankHint').textContent = '预计排名：第 ' + rank + ' 名';
    input.value = myName; msg.textContent = ''; sendBtn.disabled = false;
    modal.hidden = false; setTimeout(function () { input.focus(); input.select(); }, 50);
  }
  function closeModal() { modal.hidden = true; pending = null; var g = $('game'); if (g) g.focus({ preventScroll: true }); }
  $('lbSkip').addEventListener('click', closeModal);
  modal.addEventListener('keydown', function (e) { e.stopPropagation(); if (e.key === 'Escape') closeModal(); if (e.key === 'Enter') send(); });
  sendBtn.addEventListener('click', send);
  function send() {
    if (!pending || sendBtn.disabled) return;
    var name = input.value.trim();
    if (!name) { msg.textContent = '先写个名字吧'; return; }
    sendBtn.disabled = true; msg.textContent = '提交中……';
    var d = pending;
    req('/submit', { run: d.run.run, nonce: d.run.nonce, name: name, score: d.score, dist: d.dist, shards: d.shards, frames: d.frames, cps: d.cps })
      .then(function (j) {
        if (j.ok) {
          myName = name; localStorage.setItem('runner-name', name);
          highlight = { name: name, score: d.score };
          msg.textContent = '已登上排行榜：第 ' + j.rank + ' 名！'; load();
          window.dispatchEvent(new CustomEvent('leaderboard', { detail: { name: name, rank: j.rank, score: d.score } }));
          setTimeout(closeModal, 1400);
        } else { msg.textContent = j.error || '提交失败'; sendBtn.disabled = false; if (j._status === 409 || j._status === 403 || j._status === 422) { pending = null; } }
      })
      .catch(function () { msg.textContent = '网络有点问题，稍后再试'; sendBtn.disabled = false; });
  }

  window.addEventListener('runner', function (e) {
    var d = e.detail;
    if (d.type === 'start') {
      run = null;
      req('/start', { char: d.id }).then(function (j) { if (j.run) run = j; }).catch(function () { });
    } else if (d.type === 'over') {
      var r = run; run = null;
      if (!d.isBest || !r || d.score <= 0) return;
      req('/qualify?score=' + d.score).then(function (j) {
        if (!j.qualifies) return;
        pending = { run: r, score: d.score, dist: d.dist, shards: d.shards, frames: d.frames, cps: d.cps };
        setTimeout(function () { if (pending) openModal(pending, j.rank); }, 1300);
      }).catch(function () { });
    }
  });
})();
