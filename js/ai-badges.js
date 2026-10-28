/* Tiny, code-drawn character marks that travel with the whole studio family.
 * Each badge is built once on a 10 x 10 canvas. No images or remote requests. */
(function () {
  'use strict';
  var SIZE = 10;
  var cache = Object.create(null);
  var ids = ['C0', 'X0', 'Feline1', 'gpt', 'deepseek', 'claude', 'grok', 'gemini', 'kimi', 'doubao'];
  var colors = {
    C0: '#4fe3ff', X0: '#b48cff', Feline1: '#ff9fc4',
    gpt: '#9dceba', deepseek: '#568def', claude: '#dc9068',
    grok: '#ddd9e7', gemini: '#ad8de9', kimi: '#829bf1', doubao: '#aa8871'
  };

  function rows(ctx, data, palette) {
    data.forEach(function (row, y) {
      for (var x = 0; x < row.length; x++) {
        if (palette[row[x]]) {
          ctx.fillStyle = palette[row[x]];
          ctx.fillRect(x + 1, y + 1, 1, 1);
        }
      }
    });
  }

  function make(id) {
    var canvas = document.createElement('canvas');
    canvas.width = SIZE; canvas.height = SIZE;
    var p = canvas.getContext('2d');
    p.imageSmoothingEnabled = false;
    // A dark one-pixel frame separates an emblem from pale hair or room props.
    p.fillStyle = '#080b18';
    p.fillRect(1, 0, 8, 10); p.fillRect(0, 1, 10, 8);
    p.fillStyle = '#1b1b30'; p.fillRect(1, 1, 8, 8);

    if (id === 'C0') {
      // A cyan terminal, with paired code brackets and a small stand.
      rows(p, [
        'cccccccc',
        'c      c',
        'c c  c c',
        'cc    cc',
        'c c  c c',
        'c      c',
        'cccccccc',
        '   cc   '
      ], { c: '#71ddf5' });
    } else if (id === 'X0') {
      // Her hair bow and a violet paintbrush: readable even at ten pixels.
      rows(p, [
        'pp    pp',
        'pppooppp',
        ' ppoopp ',
        '  poop  ',
        '  p  p  ',
        '      b ',
        '      b ',
        '     bb '
      ], { p: '#e79bc2', o: '#fff0e4', b: '#ad9aea' });
    } else if (id === 'Feline1') {
      rows(p, [
        ' p    p ',
        'ppp  ppp',
        ' p pp p ',
        '   pp   ',
        '  wwww  ',
        ' wwwwww ',
        ' wwppww ',
        '  wwww  '
      ], { p: '#f2a8c9', w: '#fff0e4' });
    } else if (id === 'gpt') {
      // Six overlapping lobes, with dark gaps preserving the knot's crossings.
      rows(p, [
        '  nnnn  ',
        ' n  nnn ',
        'nn n  nn',
        'n nn n n',
        'n n nn n',
        'nn  n nn',
        ' nnn  n ',
        '  nnnn  '
      ], { n: '#b7e6d5' });
    } else if (id === 'deepseek') {
      rows(p, [
        '        ',
        '      b ',
        '  bbb bb',
        ' bbbbbbb',
        'bbbbbbb ',
        'bbbebbb ',
        ' bbbbb  ',
        '  bb    '
      ], { b: '#5795f4', e: '#e5f5ff' });
      p.fillStyle = '#8dc1ff'; p.fillRect(2, 5, 2, 1);
    } else if (id === 'claude') {
      rows(p, [
        'o  oo  o',
        ' o oo o ',
        '  oooo  ',
        'oooooooo',
        'oooooooo',
        '  oooo  ',
        ' o oo o ',
        'o  oo  o'
      ], { o: '#e7a17b' });
      p.fillStyle = '#f6ba8d'; p.fillRect(4, 4, 2, 2);
    } else if (id === 'grok') {
      rows(p, [
        '  wwww w',
        ' ww  www',
        'ww   www',
        'w   ww w',
        'w  ww  w',
        'wwww  ww',
        'www  ww ',
        'w wwww  '
      ], { w: '#f0edf7' });
    } else if (id === 'gemini') {
      // Four-point star, stepped rather than antialiased; color bands follow
      // the blue-violet-pink gradient of the original emblem.
      rows(p, [
        '   a    ',
        '   aa   ',
        '  bbbb  ',
        ' cccccc ',
        'dddddddd',
        '  eeee  ',
        '   ff   ',
        '   f    '
      ], { a: '#ec9ac6', b: '#cc8fd9', c: '#ae91ed', d: '#9fa0f7', e: '#7caef9', f: '#66bff4' });
    } else if (id === 'kimi') {
      rows(p, [
        ' w   w b',
        ' w  w   ',
        ' w w    ',
        ' www    ',
        ' w w    ',
        ' w  w   ',
        ' w   w  ',
        '        '
      ], { w: '#f4f1fa', b: '#7299ff' });
    } else if (id === 'doubao') {
      rows(p, [
        '  hhhh  ',
        ' hhhhhh ',
        'hhssssh ',
        'hssssssh',
        'hseksekh',
        'hssssssh',
        ' hsmssh ',
        '  ssss  '
      ], { h: '#79573f', s: '#f4ceb2', e: '#fff4e5', k: '#312c33', m: '#c8817d' });
      p.fillStyle = '#aa7d55'; p.fillRect(3, 2, 3, 1);
    }
    return canvas;
  }

  ids.forEach(function (id) { cache[id] = make(id); });

  function draw(ctx, id, x, y, tick, reduced) {
    if (!cache[id]) return false;
    var phase = ids.indexOf(id) * 9;
    var bob = reduced ? 0 : (Math.floor(((tick || 0) + phase) / 20) % 2 ? -1 : 0);
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(cache[id], Math.round(x), Math.round(y) + bob);
    ctx.restore();
    return true;
  }

  function createIcon(id) {
    if (!cache[id]) return null;
    var canvas = document.createElement('canvas');
    canvas.width = SIZE; canvas.height = SIZE;
    canvas.setAttribute('aria-hidden', 'true');
    canvas.getContext('2d').drawImage(cache[id], 0, 0);
    return canvas;
  }

  window.AIStudioBadges = { draw: draw, createIcon: createIcon, ids: ids.slice(), width: SIZE, height: SIZE, colors: colors };
}());
