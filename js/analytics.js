/* Minimal homepage analytics: per-page random IDs, no cross-visit identifier, no input values. */
(function () {
  'use strict';
  var endpoint = 'https://feline1.top/api/site-analytics/collect';
  var id, seq = 0, active = 0, since = 0, ready = false, starting = false;
  var enabled = false, timer, lastClick = {}, disabledKey = 'c0-analytics-disabled';
  function optedOut() { try { return localStorage.getItem(disabledKey) === '1'; } catch (e) { return false; } }
  function privacySignal() { return navigator.globalPrivacyControl === true || navigator.doNotTrack === '1'; }
  function seconds() { return Math.min(86400, Math.floor((active + (since ? performance.now() - since : 0)) / 1000)); }
  function payload(kind, target) { return { id: id, kind: kind, active: seconds(), seq: ++seq, target: target || '' }; }
  function source() {
    try {
      if (!document.referrer) return 'direct';
      var host = new URL(document.referrer).hostname;
      if (/(^|\.)(google\.[a-z.]+|bing\.com|baidu\.com|duckduckgo\.com)$/.test(host)) return 'search';
      if (/(^|\.)github\.com$/.test(host)) return 'github';
      if (/(^|\.)(t\.co|x\.com|facebook\.com|weibo\.com|reddit\.com)$/.test(host)) return 'social';
      return 'other';
    } catch (e) { return 'other'; }
  }
  function post(data, beacon) {
    var body = JSON.stringify(data);
    if (beacon && navigator.sendBeacon) {
      if (navigator.sendBeacon(endpoint, new Blob([body], { type: 'text/plain;charset=UTF-8' }))) return;
    }
    fetch(endpoint, { method: 'POST', body: body, headers: { 'Content-Type': 'text/plain;charset=UTF-8' }, credentials: 'omit', keepalive: true }).catch(function () {});
  }
  function startVisit() {
    if (!enabled || ready || starting || document.hidden) return;
    starting = true;
    var generation = id;
    var data = payload('visit'); data.source = source();
    fetch(endpoint, { method: 'POST', body: JSON.stringify(data), headers: { 'Content-Type': 'text/plain;charset=UTF-8' }, credentials: 'omit', keepalive: true })
      .then(function (r) { if (id === generation && enabled && r.ok) ready = true; })
      .catch(function () {}).finally(function () { if (id === generation) starting = false; });
  }
  function flush(beacon) {
    if (!enabled) return;
    if (!ready) { startVisit(); return; }
    post(payload('heartbeat'), beacon);
  }
  function pause() { if (since) { active += performance.now() - since; since = 0; } }
  function start() {
    if (enabled || optedOut() || privacySignal() || !window.crypto || !crypto.getRandomValues) return;
    var bytes = new Uint8Array(16); crypto.getRandomValues(bytes);
    id = Array.prototype.map.call(bytes, function (v) { return v.toString(16).padStart(2, '0'); }).join('');
    enabled = true; ready = starting = false; active = seq = 0;
    since = document.hidden ? 0 : performance.now();
    startVisit(); timer = setInterval(function () { if (!document.hidden) flush(false); }, 15000);
  }
  function stop() { pause(); enabled = ready = false; clearInterval(timer); }
  function track(target) {
    if (!enabled || !ready || document.hidden) return;
    var now = performance.now();
    if (now - (lastClick[target] || -10000) < 1000) return;
    lastClick[target] = now;
    post(payload('click', target), true);
  }
  document.addEventListener('visibilitychange', function () {
    if (!enabled) return;
    if (document.hidden) { pause(); flush(true); }
    else { since = performance.now(); startVisit(); }
  });
  window.addEventListener('pagehide', function () { pause(); flush(true); });
  window.addEventListener('pageshow', function () { if (enabled && !document.hidden && !since) since = performance.now(); });
  document.addEventListener('click', function (e) {
    var el = e.target.closest && e.target.closest('[data-analytics],#game,#bgmBtn,.dock-tabs button');
    if (!el) return;
    var target = el.getAttribute('data-analytics') || (el.id === 'game' ? 'game.screen' : el.id === 'bgmBtn' ? 'game.sound' : 'navigation.panel');
    track(target);
  });
  var lang = document.getElementById('langSelect');
  if (lang) lang.addEventListener('change', function () { track('language.select'); });
  window.addEventListener('runner', function (e) { if (e.detail && (e.detail.type === 'start' || e.detail.type === 'over')) track(e.detail.type === 'start' ? 'game.start' : 'game.end'); });
  window.addEventListener('storage', function (e) { if (e.key === disabledKey) { if (optedOut()) stop(); else start(); } });
  start();
}());
