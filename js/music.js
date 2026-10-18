/* One sound switch for everything (page BGM, game music, SFX, 小八). Logic lives in js/audio.js. */
(function () {
  'use strict';
  var button = document.getElementById('bgmBtn');
  if (!button || !window.SND) return;
  function render(v) {
    var I = window.I18N;
    button.textContent = I ? I.t(v ? 'game.musicOn' : 'game.musicOff') : (v ? '♪ 音乐 开' : '♪ 音乐 关');
    button.setAttribute('aria-pressed', v ? 'true' : 'false');
    button.title = I ? I.t(v ? 'game.musicOnTitle' : 'game.musicOffTitle') : (v ? '关闭全部声音（音乐 + 音效）' : '打开全部声音（音乐 + 音效）');
  }
  SND.onChange(render);
  window.addEventListener('c0-language-change', function () { render(SND.on); });
  button.addEventListener('click', function () { SND.toggle(); });
}());
