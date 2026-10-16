(function () {
  'use strict';
  var button = document.getElementById('bgmBtn');
  if (!button) return;

  var music = new Audio('music/feline-neon-loop-v3.wav');
  music.loop = true;
  music.preload = 'none';
  music.volume = 0.12;

  function showPlaying(playing) {
    button.textContent = playing ? '♫ BGM ON' : '♫ BGM OFF';
    button.setAttribute('aria-pressed', playing ? 'true' : 'false');
    button.title = playing ? '暂停猫娘像素背景音乐' : '播放猫娘像素背景音乐';
  }

  button.addEventListener('click', function () {
    if (!music.paused) {
      music.pause();
      showPlaying(false);
      return;
    }
    music.play().then(function () {
      showPlaying(true);
    }).catch(function () {
      showPlaying(false);
      button.title = '音乐暂时无法播放，请再试一次';
    });
  });
  music.addEventListener('pause', function () { showPlaying(false); });
  music.addEventListener('play', function () { showPlaying(true); });
}());
