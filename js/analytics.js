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
  var settings = document.createElement('button');
  settings.type = 'button'; settings.id = 'analyticsSettings';
  settings.style.cssText = 'position:fixed;bottom:5px;right:6px;z-index:10000;border:1px solid #6d537d;background:#140f22;color:#ddd;padding:5px 8px;font:11px sans-serif;cursor:pointer';
  function label() { settings.textContent = (window.I18N && I18N.getLocale() !== 'zh-CN') ? 'Visit statistics' : '访问统计设置'; }
  label(); window.addEventListener('c0-language-change', label);
  var dialog = document.createElement('dialog');
  dialog.style.cssText = 'max-width:440px;box-sizing:border-box;width:calc(100% - 32px);border:1px solid #ff4fa3;background:#140f22;color:#f2ecff;padding:24px;font:15px/1.7 sans-serif';
  settings.onclick = function () {
    var zh = !window.I18N || I18N.getLocale() === 'zh-CN';
    dialog.replaceChildren();
    var title = document.createElement('h2'); title.textContent = zh ? '主页访问统计' : 'Homepage statistics';
    var text = document.createElement('p');
    text.textContent = zh ? '本站统计访问时间、设备类别、来源类别、指定按钮点击及页面可见时长，用于改进主页。每次打开页面使用新的随机编号，不关联真实身份，不保存原始 IP、输入内容或跨次访问标识。数据发送至站长的 feline1.top 服务器，仅站长登录后可见，明细保留最多 90 天。停留时长为估算。' : 'We measure visit times, device/source categories, selected button clicks and visible-page time to improve this homepage. Each page load gets a new random ID. We store no raw IP, input content or cross-visit identifier. Records are sent to the owner’s feline1.top server, accessible only to the owner, and retained for up to 90 days. Duration is approximate.';
    var toggle = document.createElement('button');
    toggle.textContent = optedOut() ? (zh ? '开启统计' : 'Enable statistics') : (zh ? '关闭统计' : 'Disable statistics');
    toggle.onclick = function () {
      try { if (optedOut()) localStorage.removeItem(disabledKey); else localStorage.setItem(disabledKey, '1'); }
      catch (e) { toggle.textContent = zh ? '浏览器禁止保存设置' : 'Browser blocked settings storage'; return; }
      if (optedOut()) stop(); else start(); dialog.close();
    };
    var close = document.createElement('button'); close.textContent = zh ? '关闭窗口' : 'Close'; close.style.marginLeft = '12px'; close.onclick = function () { dialog.close(); };
    var signal = document.createElement('p'); signal.textContent = privacySignal() ? (zh ? '浏览器已开启隐私信号，本页不采集统计。' : 'Your browser privacy signal disables collection.') : '';
    dialog.append(title, text, signal, toggle, close); dialog.showModal();
  };
  document.body.append(settings, dialog);
  window.addEventListener('storage', function (e) { if (e.key === disabledKey) { if (optedOut()) stop(); else start(); } });
  start();
}());
