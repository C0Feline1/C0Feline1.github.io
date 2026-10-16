/* One sound switch for everything (page BGM, game music, SFX, 小八). Logic lives in js/audio.js. */
(function () {
  'use strict';
  var button = document.getElementById('bgmBtn');
  if (!button || !window.SND) return;
  SND.onChange(function (v) {
    button.textContent = v ? '♫ SOUND ON' : '♫ SOUND OFF';
    button.setAttribute('aria-pressed', v ? 'true' : 'false');
    button.title = v ? '关闭全部声音（音乐 + 音效）' : '打开全部声音（音乐 + 音效）';
  });
  button.addEventListener('click', function () { SND.toggle(); });
}());
