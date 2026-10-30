/* Touch controls for the shared Live / game stage. */
(function () {
  'use strict';
  var canvas = document.getElementById('game');
  var down = document.getElementById('gameDown');
  var pause = document.getElementById('gamePause');
  var icon = document.getElementById('gameDownIcon');
  if (!canvas || !down || !pause || !window.KittyRunner) return;
  var fingers = new Set(), keyboardDown = false, wasHeld = false, lastMode = null;
  var pane = document.getElementById('pane-game');
  function t(key) { return window.I18N ? I18N.t(key) : key; }
  function state() {
    if (KittyRunner.touchState) return KittyRunner.touchState();
    return { mode: KittyRunner.state && KittyRunner.state.mode, downUseful: true, roaming: false, scene: 'run' };
  }
  function paintArrow() {
    var ctx = icon.getContext('2d');
    ctx.clearRect(0, 0, 24, 24); ctx.fillStyle = getComputedStyle(down).color;
    ctx.fillRect(10, 4, 4, 11); ctx.fillRect(6, 11, 4, 4); ctx.fillRect(14, 11, 4, 4); ctx.fillRect(8, 15, 8, 2); ctx.fillRect(10, 17, 4, 2);
  }
  function held(value) {
    if (value === wasHeld) return;
    wasHeld = value;
    down.setAttribute('aria-pressed', String(value));
    if (value) KittyRunner.dpad('down');
    KittyRunner.hold('down', value);
  }
  function releaseAll() {
    fingers.clear(); keyboardDown = false; held(false);
  }
  function updateHeld() { held(fingers.size > 0 || keyboardDown); }
  function ownEnd(event) {
    if (!fingers.has(event.pointerId)) return;
    fingers.delete(event.pointerId); updateHeld();
  }
  down.addEventListener('pointerdown', function (event) {
    if (event.button > 0 || down.hidden) return;
    event.preventDefault(); event.stopPropagation();
    canvas.focus({ preventScroll: true });
    fingers.add(event.pointerId);
    try { down.setPointerCapture(event.pointerId); } catch (_) {}
    updateHeld();
  });
  ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(function (name) { down.addEventListener(name, ownEnd); });
  window.addEventListener('pointerup', ownEnd);
  window.addEventListener('pointercancel', ownEnd);
  down.addEventListener('click', function (event) { event.preventDefault(); event.stopPropagation(); });
  down.addEventListener('contextmenu', function (event) { event.preventDefault(); });
  down.addEventListener('keydown', function (event) {
    if ((event.key === ' ' || event.key === 'Enter') && !event.repeat) { event.preventDefault(); keyboardDown = true; updateHeld(); }
  });
  down.addEventListener('keyup', function (event) {
    if (event.key === ' ' || event.key === 'Enter') { event.preventDefault(); keyboardDown = false; updateHeld(); }
  });
  down.addEventListener('blur', function () { keyboardDown = false; updateHeld(); });
  pause.addEventListener('click', function (event) { event.preventDefault(); event.stopPropagation(); releaseAll(); KittyRunner.plus(); canvas.focus({ preventScroll: true }); refresh(); });
  window.addEventListener('blur', releaseAll);
  window.addEventListener('studio-stage-change', function (event) { if (!event.detail || event.detail.active !== 'game') releaseAll(); refresh(); });
  document.addEventListener('visibilitychange', function () { if (document.hidden) releaseAll(); else refresh(); });
  if (pane && window.MutationObserver) new MutationObserver(function () { if (pane.hidden) releaseAll(); refresh(); }).observe(pane, { attributes: true, attributeFilter: ['hidden'] });
  function refresh() {
    var s = state();
    var active = !(pane && pane.hidden), playing = s.mode === 'play', roaming = !!s.roaming;
    var useful = s.downUseful !== false && s.scene !== 'flip';
    down.hidden = !active || !playing || roaming || !useful;
    pause.hidden = !active || (!playing && s.mode !== 'paused');
    if (down.hidden && wasHeld) releaseAll();
    pause.setAttribute('aria-pressed', String(s.mode === 'paused'));
    pause.setAttribute('aria-label', t(s.mode === 'paused' ? 'game.resume' : 'game.pause'));
    pause.firstElementChild.textContent = s.mode === 'paused' ? '▶' : 'Ⅱ';
    var lower = s.scene === 'swim' ? 'game.holdDive' : s.scene === 'fly' || s.scene === 'jet' ? 'game.holdDescend' : 'game.holdCrouch';
    down.setAttribute('aria-label', t(lower));
    canvas.setAttribute('aria-label', t('game.touchCanvasLabel'));
    if (lastMode !== s.mode) { if (!playing) releaseAll(); lastMode = s.mode; }
  }
  window.addEventListener('c0-language-change', function () { paintArrow(); refresh(); });
  paintArrow(); refresh();
  setInterval(function () { if (!document.hidden && !(pane && pane.hidden)) refresh(); }, 200);
})();
