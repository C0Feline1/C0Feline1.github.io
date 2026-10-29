/* One mounted stage: switch views without resetting a run or the studio. */
(function () {
  'use strict';
  var stage = document.getElementById('interactiveStage');
  if (!stage) return;
  var tabs = Array.from(stage.querySelectorAll('[role="tab"]'));
  var sound = document.getElementById('stageSound'), volume = document.getElementById('stageVolume');
  var status = document.getElementById('stageAudioStatus');
  var active = 'live', enabled = false, inView = true, audioRevision = 0;
  var audioError = false, touched = false;
  function t(key) { return window.I18N ? I18N.t(key) : key; }
  try {
    var saved = localStorage.getItem('studio-stage-volume');
    if (saved === null) saved = localStorage.getItem('layout-stage-volume');
    if (saved !== null && Number.isFinite(Number(saved))) volume.value = String(Math.max(0, Math.min(100, Number(saved))));
  } catch (_) { /* A private window still has working volume controls. */ }
  function updateLabels() {
    sound.setAttribute('aria-pressed', String(enabled));
    sound.textContent = t(enabled ? 'stage.soundOn' : 'stage.soundOff');
    sound.setAttribute('aria-label', t('stage.soundToggle'));
    status.textContent = audioError ? t('stage.audioError') : '';
  }
  function syncAudio() {
    var revision = ++audioRevision, level = Number(volume.value) / 100;
    var audible = enabled && inView && !document.hidden;
    // Stop the old path before unlocking the currently visible one.
    if (window.SND && SND.setStageAudio) SND.setStageAudio(audible && active === 'game', level);
    if (window.StudioVoice) {
      StudioVoice.enable(false);
      StudioVoice.setVolume(level);
      if (audible && active === 'live') StudioVoice.enable(true).catch(function () {
        if (revision !== audioRevision) return;
        enabled = false; audioError = true; syncAudio();
      });
    }
    updateLabels();
  }
  function select(id, focus, updateHash) {
    var selected = tabs.find(function (tab) { return tab.id === 'tab-' + id; });
    if (!selected) return;
    active = id;
    tabs.forEach(function (tab) {
      var on = tab === selected;
      tab.setAttribute('aria-selected', String(on));
      tab.tabIndex = on ? 0 : -1;
      document.getElementById(tab.getAttribute('aria-controls')).hidden = !on;
    });
    window.dispatchEvent(new CustomEvent('studio-stage-change', { detail: { active: active } }));
    syncAudio();
    if (focus) selected.focus();
    if (updateHash && window.history && history.replaceState) history.replaceState(null, '', active === 'game' ? '#game' : '#studio');
    window.dispatchEvent(new Event('resize'));
  }
  function revealLinkedStage() {
    if (location.hash !== '#game' && location.hash !== '#studio') return;
    requestAnimationFrame(function () { stage.scrollIntoView({ block: 'start' }); });
  }
  tabs.forEach(function (tab, index) {
    tab.addEventListener('click', function () { select(index ? 'game' : 'live', false, true); });
    tab.addEventListener('keydown', function (event) {
      var next = event.key === 'ArrowLeft' || event.key === 'ArrowRight' ? 1 - index : event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : null;
      if (next === null) return;
      event.preventDefault(); select(next ? 'game' : 'live', true, true);
    });
  });
  stage.addEventListener('pointerdown', function () { touched = true; }, { once: true });
  stage.addEventListener('keydown', function () { touched = true; }, { once: true });
  sound.addEventListener('click', function () { enabled = !enabled; audioError = false; syncAudio(); });
  volume.addEventListener('input', function () {
    try { localStorage.setItem('studio-stage-volume', volume.value); } catch (_) {}
    syncAudio();
  });
  // Keyboard M and the toolbar always address the same sound preference.
  if (window.SND) {
    SND.toggle = function () { enabled = !enabled; audioError = false; syncAudio(); };
    SND.setOn = function (value) { enabled = !!value; audioError = false; syncAudio(); };
  }
  document.addEventListener('visibilitychange', syncAudio);
  window.addEventListener('pagehide', function () {
    ++audioRevision;
    if (window.SND && SND.setStageAudio) SND.setStageAudio(false, Number(volume.value) / 100);
    if (window.StudioVoice) StudioVoice.enable(false);
  });
  window.addEventListener('c0-language-change', updateLabels);
  window.addEventListener('hashchange', function () {
    if (location.hash === '#game') select('game', false, false);
    else if (location.hash === '#studio') select('live', false, false);
    revealLinkedStage();
  });
  if (window.IntersectionObserver) new IntersectionObserver(function (entries) {
    var visible = entries[entries.length - 1].isIntersecting;
    if (visible !== inView) { inView = visible; syncAudio(); }
  }).observe(stage);
  select(location.hash === '#game' ? 'game' : 'live', false, false);
  // Native fragment scrolling happens after parsing; finish with the tab bar
  // visible as well, unless the visitor has already started using the stage.
  if (document.readyState === 'complete') revealLinkedStage();
  else window.addEventListener('load', function () { if (!touched) revealLinkedStage(); }, { once: true });
  window.StudioStage = { snapshot: function () { return { active: active, sound: enabled, volume: Number(volume.value), inView: inView }; } };
})();
