/* Original studio scenery and kitten, shared by the expanded room. */
(function () {
  'use strict';
  var SW=320, SH=180, FY=128, FEET_Y=158;
  var FRIDGE={x:282,y:137,w:24,h:38};
  var props=PX.buildProps();
  function buildStudioCat() {
    var outline = '#3b2038', fur = '#fff2f3', shade = '#d7c5d2', pink = '#ff9fc4', eye = '#482942';
    function make(step, sleeping) {
      var c = PX.make(20, 12), p = c.getContext('2d');
      function block(x, y, w, h, color) { p.fillStyle = color; p.fillRect(x, y, w, h); }
      if (sleeping) {
        // A curled-up kitten, with a tail tucked around its paws.
        block(2, 7, 4, 4, outline); block(3, 6, 3, 4, outline); block(4, 7, 3, 3, shade);
        block(5, 5, 10, 6, outline); block(6, 5, 8, 4, fur); block(7, 8, 7, 2, shade);
        block(12, 3, 6, 6, outline); block(13, 2, 2, 3, outline); block(14, 2, 1, 2, pink);
        block(17, 2, 2, 3, outline); block(18, 2, 1, 2, pink);
        block(13, 4, 5, 4, fur); block(14, 5, 2, 1, eye); block(17, 5, 1, 1, eye);
        block(18, 6, 1, 1, pink); block(14, 8, 3, 1, fur);
        block(7, 10, 3, 1, fur); block(11, 10, 3, 1, fur);
        return c;
      }
      // Tail wag and alternating paws use actual pixel poses; the feet row stays fixed.
      if (step % 2 === 0) {
        block(3, 7, 3, 2, outline); block(2, 5, 2, 3, outline); block(3, 3, 2, 3, outline);
        block(4, 4, 1, 2, pink);
      } else {
        block(3, 7, 3, 2, outline); block(2, 6, 2, 3, outline); block(3, 5, 2, 2, outline);
        block(3, 6, 1, 1, pink);
      }
      block(4, 5, 12, 5, outline); block(5, 5, 9, 4, fur); block(7, 8, 7, 1, shade);
      block(12, 6, 3, 3, fur); block(13, 7, 2, 1, shade);
      block(13, 3, 6, 6, outline); block(13, 2, 2, 3, outline); block(14, 2, 1, 2, pink);
      block(17, 2, 2, 3, outline); block(18, 2, 1, 2, pink);
      block(14, 4, 5, 4, fur); block(16, 5, 1, 1, eye); block(18, 6, 1, 1, eye); block(19, 6, 1, 1, pink);
      block(12, 8, 2, 1, pink);
      if (step % 2 === 0) {
        block(5, 9, 3, 3, outline); block(6, 9, 1, 2, fur);
        block(10, 9, 3, 3, outline); block(11, 9, 1, 2, fur);
        block(15, 8, 3, 4, outline); block(16, 9, 1, 2, fur);
      } else {
        block(6, 9, 3, 3, outline); block(7, 9, 1, 2, fur);
        block(9, 9, 3, 3, outline); block(10, 9, 1, 2, fur);
        block(14, 8, 3, 4, outline); block(15, 9, 1, 2, fur);
      }
      return c;
    }
    var walk = [0, 1, 2, 3].map(function (step) { return make(step, false); });
    return { walk: walk, idle: [walk[0], walk[2]], sleep: make(0, true) };
  }
  var bg = (function () {
    var c = PX.skyGradient(SW, SH, ['#120c22', '#1e1534', '#2a1d45']);
    var x = c.getContext('2d');
    for (var yy = FY; yy < SH; yy++) for (var xx = 0; xx < SW; xx++) {
      var plank = Math.floor((xx + (Math.floor((yy - FY) / 6) % 2) * 23) / 46);
      x.fillStyle = (yy - FY) % 6 === 0 ||
        (xx + (Math.floor((yy - FY) / 6) % 2) * 23) % 46 === 0
        ? '#1e1220' : (plank % 2 ? '#3a2436' : '#33202f');
      x.fillRect(xx, yy, 1, 1);
    }
    x.fillStyle = '#4a2e44'; x.fillRect(0, FY, SW, 2);
    x.fillStyle = '#ff4fa3'; x.fillRect(0, FY - 3, SW, 1);
    x.fillStyle = '#3a1838'; x.fillRect(0, FY - 2, SW, 2);

    // Original window and wall art.
    x.fillStyle = '#0b0716'; x.fillRect(12, 16, 64, 58);
    x.fillStyle = '#4a3a6a';
    x.fillRect(12, 16, 64, 2); x.fillRect(12, 72, 64, 2);
    x.fillRect(12, 16, 2, 58); x.fillRect(74, 16, 2, 58);
    x.fillRect(43, 16, 2, 58); x.fillRect(12, 44, 64, 2);
    x.fillStyle = '#5a4a7a'; x.fillRect(8, 74, 72, 3);
    x.fillStyle = '#ff4fa3'; x.fillRect(90, 20, 30, 40);
    x.fillStyle = '#1a1030'; x.fillRect(91, 21, 28, 38);
    for (var s = 0; s < 14; s++) {
      x.fillStyle = s % 3 ? '#ffd45e' : '#fff';
      x.fillRect(93 + (s * 7) % 24, 24 + (s * 11) % 22, 1, 1);
    }
    x.drawImage(props.shard[0], 100, 30);
    PX.text(x, 'STAR', 97, 49, '#ff9fc4'); PX.text(x, 'DREAM', 95, 54, '#ff9fc4');
    x.fillStyle = '#4fe3ff'; x.fillRect(126, 26, 22, 28);
    x.fillStyle = '#0c1a2a'; x.fillRect(127, 27, 20, 26);
    x.fillStyle = '#5a6fa8';
    for (var m = 0; m < 20; m++) {
      var hh = 6 + Math.abs(10 - m) % 7;
      x.fillRect(127 + m, 53 - hh, 1, hh);
    }
    x.fillStyle = '#f4f8ff'; x.fillRect(135, 40, 3, 1); x.fillRect(134, 41, 5, 1);
    PX.text(x, 'V07', 131, 29, '#4fe3ff');

    // Original bookshelf, server rack and plant.
    x.fillStyle = '#4a2e44'; x.fillRect(196, 58, 60, 3);
    x.fillStyle = '#2a1828'; x.fillRect(196, 61, 60, 1);
    var bookColors = ['#ff4fa3', '#4fe3ff', '#ffd45e', '#b48cff', '#5dff8f', '#ff9f4f'];
    for (var b = 0; b < 8; b++) {
      var bh = 8 + (b * 5) % 5;
      x.fillStyle = bookColors[b % 6];
      x.fillRect(226 + b * 3 + (b > 4 ? 2 : 0), 58 - bh, 2, bh);
    }
    x.fillStyle = '#0a0812'; x.fillRect(284, 52, 30, FY - 52);
    x.fillStyle = '#2a2240'; x.fillRect(284, 52, 30, 2); x.fillRect(284, 52, 2, FY - 52); x.fillRect(312, 52, 2, FY - 52);
    for (var u = 0; u < 9; u++) { x.fillStyle = '#17122a'; x.fillRect(288, 58 + u * 7, 22, 5); }
    x.fillStyle = '#7a3a2a'; x.fillRect(262, FY - 10, 12, 10);
    x.fillStyle = '#5a2a20'; x.fillRect(262, FY - 10, 12, 2);
    [[268, FY - 22, '#3fae6a'], [263, FY - 17, '#2f8a55'], [272, FY - 18, '#2f8a55'], [266, FY - 28, '#5ad08a']].forEach(function (l) {
      x.fillStyle = l[2]; x.fillRect(l[0], l[1], 4, 9); x.fillRect(l[0] + 1, l[1] - 2, 2, 2);
    });

    // Small furniture, drawn in the same palette as the original room.
    // Bed at left.
    x.fillStyle = '#241425'; x.fillRect(2, 145, 59, 29);
    x.fillStyle = '#70405b'; x.fillRect(4, 143, 7, 29); x.fillRect(5, 145, 55, 4);
    x.fillStyle = '#d4b5c8'; x.fillRect(11, 150, 14, 8); x.fillStyle = '#9d6683'; x.fillRect(12, 151, 12, 2);
    x.fillStyle = '#7b4263'; x.fillRect(25, 149, 32, 17); x.fillStyle = '#b75883'; x.fillRect(28, 150, 25, 2);
    x.fillStyle = '#4a2e44'; x.fillRect(7, 170, 4, 5); x.fillRect(54, 170, 4, 5);
    // Exercise mat and dumbbells.
    x.fillStyle = '#241625'; x.fillRect(68, 155, 52, 7); x.fillStyle = '#b48cff'; x.fillRect(70, 155, 48, 2);
    x.fillStyle = '#4fe3ff'; x.fillRect(108, 150, 3, 7); x.fillRect(105, 152, 9, 2);
    // X0's easel and blank canvas.
    x.fillStyle = '#49303d'; x.fillRect(145, 135, 17, 15); x.fillStyle = '#c6a980'; x.fillRect(147, 137, 13, 11);
    x.fillStyle = '#684639'; x.fillRect(152, 150, 3, 12); x.fillRect(148, 160, 11, 2);
    // Wooden rack with two practice swords.
    x.fillStyle = '#56384c'; x.fillRect(222, 77, 29, 3); x.fillRect(224, 80, 2, 5); x.fillRect(247, 80, 2, 5);
    x.fillStyle = '#b9c2d8'; x.fillRect(228, 67, 2, 10); x.fillRect(239, 69, 2, 8);
    x.fillStyle = '#ff9fc4'; x.fillRect(226, 74, 6, 2); x.fillRect(237, 73, 6, 2);
    // Cat bed beside the easel.
    x.fillStyle = '#281426'; x.fillRect(172, 154, 43, 15);
    x.fillStyle = '#7a3a58'; x.fillRect(174, 153, 39, 8); x.fillStyle = '#ff7eaf'; x.fillRect(178, 154, 31, 4);
    x.fillStyle = '#563149'; x.fillRect(176, 167, 4, 3); x.fillRect(207, 167, 4, 3);
    // Compact snack fridge in its own floor corner, clear of the server rack.
    x.fillStyle = '#1b1220'; x.fillRect(FRIDGE.x - 2, FEET_Y + 18, FRIDGE.w + 4, 2);
    x.fillStyle = '#171322'; x.fillRect(FRIDGE.x, FRIDGE.y, FRIDGE.w, FRIDGE.h);
    x.fillStyle = '#8992b4'; x.fillRect(FRIDGE.x + 1, FRIDGE.y + 1, FRIDGE.w - 2, FRIDGE.h - 3);
    x.fillStyle = '#c5c9d9'; x.fillRect(FRIDGE.x + 3, FRIDGE.y + 2, FRIDGE.w - 6, FRIDGE.h - 5);
    x.fillStyle = '#73809e'; x.fillRect(FRIDGE.x + 3, FRIDGE.y + 19, FRIDGE.w - 6, 2);
    x.fillStyle = '#38425b'; x.fillRect(FRIDGE.x + FRIDGE.w - 7, FRIDGE.y + 7, 2, 8); x.fillRect(FRIDGE.x + FRIDGE.w - 7, FRIDGE.y + 25, 2, 7);
    x.fillStyle = '#4fe3ff'; x.fillRect(FRIDGE.x + 4, FRIDGE.y + 5, 6, 1); x.fillRect(FRIDGE.x + 4, FRIDGE.y + 7, 4, 1);
    x.fillStyle = '#38425b'; x.fillRect(FRIDGE.x + 3, FRIDGE.y + FRIDGE.h - 1, 5, 2); x.fillRect(FRIDGE.x + 16, FRIDGE.y + FRIDGE.h - 1, 5, 2);
    // A tiny snack tin on top helps it read as a break corner.
    x.fillStyle = '#39243b'; x.fillRect(FRIDGE.x + 3, FRIDGE.y - 4, 8, 4);
    x.fillStyle = '#ff9fc4'; x.fillRect(FRIDGE.x + 4, FRIDGE.y - 5, 6, 2);
    x.fillStyle = '#ffd45e'; x.fillRect(FRIDGE.x + 6, FRIDGE.y - 3, 2, 2);
    return c;
  })();

  window.StudioRoom = { background: bg, cat: buildStudioCat() };
})();
