/* A code-painted extension of the original 320px studio. All coordinates are world pixels. */
(function () {
  'use strict';

  var WIDTH = 1280, HEIGHT = 180, FLOOR = 128;
  var C = {
    ink: '#0b0716', wall: '#1e1534', wallHi: '#2a1d45', trim: '#4a3a6a',
    wood: '#5a3a52', woodHi: '#79506b', woodLow: '#3a2438',
    pink: '#ff6fa6', cyan: '#4fe3ff', violet: '#b48cff', cream: '#e8d8e8',
    leaf: '#3fae83', leafHi: '#72d6a0', leafLow: '#23685f'
  };
  // x/y are the seated actor's foot position; deskX is the furniture origin.
  // The center dock stays clear, so an owner can enter and leave their chair.
  var workstations = [
    { id: 'C0', name: 'C0 CODE', x: 38, y: 126, deskX: 22, color: '#4fe3ff', kind: 'code' },
    { id: 'X0', name: 'X0 ART', x: 128, y: 126, deskX: 112, color: '#b48cff', kind: 'art' },
    { id: 'Feline1', name: 'F1 MASCOT', x: 218, y: 126, deskX: 202, color: '#ff9fc4', kind: 'paw' },
    { id: 'gpt', name: 'GPT', x: 355, y: 126, deskX: 340, color: '#94cbb9', kind: 'think' },
    { id: 'deepseek', name: 'DEEPSEEK', x: 450, y: 126, deskX: 435, color: '#7aaff0', kind: 'ocean' },
    { id: 'claude', name: 'CLAUDE', x: 555, y: 126, deskX: 540, color: '#e9a16f', kind: 'book' },
    { id: 'grok', name: 'GROK', x: 665, y: 126, deskX: 650, color: '#dba0ba', kind: 'spark' },
    { id: 'gemini', name: 'GEMINI', x: 760, y: 126, deskX: 745, color: '#b8a1f2', kind: 'stars' },
    { id: 'kimi', name: 'KIMI', x: 860, y: 126, deskX: 845, color: '#bec8ed', kind: 'moon' },
    { id: 'doubao', name: 'DOUBAO', x: 985, y: 126, deskX: 970, color: '#b6d8e8', kind: 'cookie' }
  ];
  workstations.forEach(function (s) { s.footY = 129; });

  function rect(g, x, y, w, h, color) {
    g.fillStyle = color;
    g.fillRect(Math.round(x), Math.round(y), Math.max(1, Math.round(w)), Math.max(1, Math.round(h)));
  }
  function line(g, x0, y0, x1, y1, color) {
    var dx = Math.abs(x1 - x0), sx = x0 < x1 ? 1 : -1;
    var dy = -Math.abs(y1 - y0), sy = y0 < y1 ? 1 : -1, err = dx + dy;
    while (true) {
      rect(g, x0, y0, 1, 1, color);
      if (x0 === x1 && y0 === y1) break;
      var twice = 2 * err;
      if (twice >= dy) { err += dy; x0 += sx; }
      if (twice <= dx) { err += dx; y0 += sy; }
    }
  }
  function plaque(g, text, x, y, color) {
    var w = PX.textWidth(text) + 10;
    rect(g, x, y, w, 9, '#120d21');
    rect(g, x, y + 8, w, 1, '#4a345e');
    rect(g, x + 2, y + 3, 1, 2, color);
    PX.text(g, text, x + 5, y + 2, color);
  }
  function star(g, x, y, bright) {
    rect(g, x, y, 1, 1, bright ? '#e7e3fa' : '#75688f');
    if (bright) {
      rect(g, x - 1, y, 3, 1, '#c6b5ee');
      rect(g, x, y - 1, 1, 3, '#c6b5ee');
    }
  }
  function nightWindow(g, x, y, w, h, seed) {
    rect(g, x, y, w, h, C.ink);
    rect(g, x + 2, y + 2, w - 4, h - 4, '#15162d');
    for (var n = 0; n < 24; n++) {
      var xx = x + 5 + (n * 23 + seed * 7) % (w - 10);
      var yy = y + 5 + (n * 13 + seed * 3) % Math.max(8, h - 15);
      star(g, xx, yy, n % 13 === 0);
    }
    for (var b = 0; b < w - 7; b += 9) {
      var bh = 6 + (b * 3 + seed) % 16;
      rect(g, x + 3 + b, y + h - 3 - bh, 8, bh, b % 2 ? '#21203d' : '#26223f');
      if (b % 3 === 0) rect(g, x + 5 + b, y + h - 5 - bh, 2, 2, '#7a627f');
    }
    rect(g, x, y, w, 2, C.trim); rect(g, x, y + h - 2, w, 2, C.trim);
    rect(g, x, y, 2, h, C.trim); rect(g, x + w - 2, y, 2, h, C.trim);
    for (var m = x + 48; m < x + w - 5; m += 48) rect(g, m, y + 2, 2, h - 4, '#443454');
    rect(g, x - 2, y + h, w + 4, 3, '#5a466e');
    rect(g, x + 5, y + 5, 1, h - 12, '#302c50');
  }
  function books(g, x, y, count) {
    var colors = [C.pink, C.cyan, '#b48cff', '#d0ad78', '#5dbba0', '#8a7aa8'];
    rect(g, x - 3, y, count * 4 + 5, 3, C.wood);
    rect(g, x - 3, y + 3, count * 4 + 5, 1, '#2a1828');
    for (var b = 0; b < count; b++) {
      var h = 8 + b * 7 % 6;
      rect(g, x + b * 4, y - h, 3, h, colors[b % colors.length]);
      rect(g, x + b * 4, y - h + 2, 2, 1, '#d8c9d6');
    }
  }
  function plant(g, x, bottom, size, pot) {
    var s = size || 1;
    rect(g, x - 5 * s, bottom - 8 * s, 10 * s, 7 * s, pot || '#7a3a58');
    rect(g, x - 6 * s, bottom - 9 * s, 12 * s, 2 * s, '#a56a81');
    rect(g, x - 4 * s, bottom - 2 * s, 8 * s, 2 * s, '#493044');
    rect(g, x, bottom - 25 * s, s, 17 * s, C.leafLow);
    [[-7, -20, 7, 4], [1, -25, 6, 4], [-5, -31, 5, 5], [1, -17, 8, 4], [-6, -13, 6, 3]].forEach(function (p, i) {
      rect(g, x + p[0] * s, bottom + p[1] * s, p[2] * s, p[3] * s, i % 2 ? C.leafHi : C.leaf);
      rect(g, x + (p[0] + 1) * s, bottom + (p[1] + 1) * s, Math.max(1, p[2] - 3) * s, s, C.leafLow);
    });
  }
  function shell(g) {
    // Continue the original room's bands and staggered wood floor without a seam.
    rect(g, 320, 0, WIDTH - 320, HEIGHT, '#120c22');
    rect(g, 320, 32, WIDTH - 320, 48, C.wall);
    rect(g, 320, 80, WIDTH - 320, 48, C.wallHi);
    for (var y = FLOOR; y < HEIGHT; y++) {
      var row = Math.floor((y - FLOOR) / 6), shift = (row % 2) * 23;
      for (var x = 320; x < WIDTH; x++) {
        var plank = Math.floor((x + shift) / 46);
        rect(g, x, y, 1, 1, (y - FLOOR) % 6 === 0 || (x + shift) % 46 === 0
          ? '#1e1220' : (plank % 2 ? '#3a2436' : '#33202f'));
      }
    }
    rect(g, 320, 125, WIDTH - 320, 1, '#ff4fa3');
    rect(g, 320, 126, WIDTH - 320, 2, '#3a1838');
    rect(g, 320, 128, WIDTH - 320, 2, '#4a2e44');
    // Slim wall posts stop above the floor, preserving the open connecting aisle.
    [320, 638, 958].forEach(function (x) {
      rect(g, x, 0, 3, 125, '#30223f');
      rect(g, x + 1, 15, 1, 105, '#604969');
    });
    rect(g, WIDTH - 2, 0, 2, 126, '#4a3a5b');
  }
  function cowork(g) {
    plaque(g, 'MODEL COWORK', 335, 6, '#b9a0db');
    nightWindow(g, 341, 23, 267, 41, 4);
    // A few quiet reflections and warm desk lighting.
    rect(g, 351, 27, 44, 1, '#343255');
    rect(g, 499, 28, 29, 1, '#343255');
    rect(g, 348, 68, 53, 1, '#9a657e');
    rect(g, 444, 68, 52, 1, '#49677e');
    books(g, 517, 73, 9);
    // Half-height, quietly lit server stack at the far end of the room.
    rect(g, 615, 69, 17, 59, '#0a0812');
    rect(g, 615, 69, 17, 2, '#40364f');
    for (var rack = 0; rack < 7; rack++) {
      rect(g, 617, 74 + rack * 7, 13, 5, '#221a31');
      rect(g, 619, 76 + rack * 7, 2, 1, rack % 3 ? '#65b9b2' : '#ce8fae');
      rect(g, 624, 76 + rack * 7, 4, 1, '#51445e');
    }
    plant(g, 421, 127, 1, '#6a3e54');
    rect(g, 329, 139, 300, 18, '#332333');
    rect(g, 332, 140, 294, 1, '#5e3c50');
    rect(g, 332, 154, 294, 1, '#4a3045');
    for (var stitch = 340; stitch < 626; stitch += 18) rect(g, stitch, 156, 4, 1, '#705062');
  }
  function glasshouse(g) {
    // A stepped glass roof with a crescent moon and city stars behind it.
    rect(g, 776, 47, 174, 67, '#101c2a');
    for (var y = 19; y < 48; y++) {
      var inset = Math.max(0, Math.ceil((47 - y) * 1.45));
      rect(g, 776 + inset, y, 174 - inset * 2, 1, '#141a2d');
    }
    for (var n = 0; n < 30; n++) star(g, 783 + n * 29 % 158, 51 + n * 17 % 57, n % 17 === 0);
    rect(g, 887, 25, 7, 1, '#d7d3ee'); rect(g, 885, 26, 10, 2, '#d7d3ee');
    rect(g, 884, 28, 11, 8, '#d7d3ee'); rect(g, 886, 36, 8, 2, '#d7d3ee');
    rect(g, 889, 24, 7, 10, '#141a2d');
    line(g, 776, 47, 818, 18, '#657784');
    line(g, 818, 18, 907, 18, '#657784');
    line(g, 907, 18, 949, 47, '#657784');
    line(g, 776, 48, 818, 19, '#354d5f');
    line(g, 907, 19, 949, 48, '#354d5f');
    line(g, 863, 18, 863, 112, '#496579');
    line(g, 818, 18, 807, 48, '#3c5369');
    line(g, 907, 18, 918, 48, '#3c5369');
    rect(g, 775, 47, 176, 2, '#596e80');
    [776, 807, 833, 890, 918, 948].forEach(function (x) { rect(g, x, 49, 2, 64, '#354d60'); });
    rect(g, 776, 81, 174, 2, '#304657');
    rect(g, 775, 112, 176, 3, '#596278');
    rect(g, 783, 53, 1, 23, '#294352');
    line(g, 819, 23, 804, 40, '#2e3a53');
    line(g, 915, 26, 935, 41, '#2e3a53');
    // Hanging pots and a shelf fill the greenhouse without crowding the workers.
    [792, 938].forEach(function (x, i) {
      rect(g, x, 48, 1, 11 + i * 4, '#89938c');
      rect(g, x - 4, 59 + i * 4, 9, 4, '#88556b');
      rect(g, x - 3, 63 + i * 4, 7, 2, '#573b52');
      rect(g, x - 5, 55 + i * 4, 3, 5, C.leaf);
      rect(g, x - 1, 53 + i * 4, 4, 7, C.leafHi);
      rect(g, x + 3, 58 + i * 4, 3, 9, C.leafLow);
    });
    rect(g, 849, 91, 40, 3, '#76546a');
    plant(g, 859, 91, 0.5, '#906374'); plant(g, 878, 91, 0.5, '#886e79');
    rect(g, 852, 94, 2, 7, '#463749'); rect(g, 884, 94, 2, 7, '#463749');
  }
  function chair(g, d) {
    var x = d.deskX;
    rect(g, x + 2, 127, 27, 2, '#25192b');
    rect(g, x + 5, 90, 20, 28, '#100c1c');
    rect(g, x + 7, 92, 16, 21, '#40334e');
    rect(g, x + 9, 94, 12, 2, d.color);
    rect(g, x + 6, 114, 20, 4, '#3f2b45');
    rect(g, x + 14, 118, 3, 8, '#1a1226');
    rect(g, x + 7, 126, 18, 2, '#1a1226');
    rect(g, x + 8, 128, 2, 1, '#80718c');
    rect(g, x + 22, 128, 2, 1, '#80718c');
  }
  function atelier(g) {
    plaque(g, 'STAR ATELIER', 654, 6, C.violet);
    nightWindow(g, 659, 23, 276, 41, 8);
    books(g, 722, 74, 5);
    books(g, 908, 74, 6);
    // A crossed-tool peg and twin stars distinguish the creative desks.
    rect(g, 652, 69, 23, 2, '#634559');
    line(g, 656, 70, 667, 81, '#c6a785');
    line(g, 668, 70, 657, 81, '#92758b');
    star(g, 794, 73, true); star(g, 804, 69, true);
    rect(g, 832, 71, 19, 2, '#69516a');
    rect(g, 837, 65, 7, 6, '#d9d4e9');
    rect(g, 840, 64, 5, 5, C.wallHi);
    rect(g, 650, 139, 294, 18, '#2c253e');
    rect(g, 653, 140, 288, 1, '#504263');
    rect(g, 653, 154, 288, 1, '#433752');
    for (var x = 662; x < 940; x += 18) rect(g, x, 156, 4, 1, '#6f567e');
  }
  function lounge(g) {
    plaque(g, 'MOON GARDEN', 973, 6, '#a0c6cc');
    nightWindow(g, 975, 24, 108, 40, 11);
    books(g, 1047, 75, 6);
    rect(g, 977, 72, 23, 1, '#9a788c');
    // The greenhouse and shared furniture move beyond the ten work docks.
    g.save(); g.translate(320, 0); glasshouse(g); g.restore();
    rect(g, 1054, 140, 221, 24, '#302a37');
    rect(g, 1057, 141, 215, 1, '#655069');
    rect(g, 1057, 162, 215, 1, '#55435a');
    [1062, 1114, 1172, 1224, 1262].forEach(function (x) {
      rect(g, x, 166, 8, 1, '#5a4960'); rect(g, x + 2, 166, 4, 1, '#82909b');
    });
  }
  function deskKeepsake(g, d) {
    var x = d.deskX, y = 111;
    // Deliberately small silhouettes sit below the owner's face.
    if (d.kind === 'art') {
      rect(g, x + 3, y - 4, 10, 3, '#bca4aa');
      [[4, '#ff9fc4'], [7, '#64d6dc'], [10, '#d8bc72']].forEach(function (p) {
        rect(g, x + p[0], y - 5, 2, 2, p[1]);
      });
      rect(g, x + 5, y - 10, 1, 5, '#c9a278');
    } else if (d.kind === 'paw') {
      rect(g, x + 4, y - 5, 6, 5, '#b9698f');
      rect(g, x + 5, y - 4, 4, 3, '#edb0c9');
      rect(g, x + 4, y - 3, 6, 1, '#f9c9dd');
      rect(g, x + 10, y - 1, 3, 1, '#df93ba');
    } else if (d.kind === 'ocean') {
      rect(g, x + 3, y - 3, 10, 3, '#6c9bb9');
      rect(g, x + 4, y - 5, 8, 2, '#b6d6df');
      rect(g, x + 5, y - 4, 5, 1, '#3c617c');
      rect(g, x + 7, y - 6, 2, 1, '#e3b986');
    } else if (d.kind === 'book' || d.kind === 'moon') {
      rect(g, x + 3, y - 4, 12, 3, d.kind === 'book' ? '#b3785b' : '#7885ae');
      rect(g, x + 4, y - 5, 5, 3, '#e6d7c5');
      rect(g, x + 10, y - 5, 4, 3, '#c9bdc0');
      rect(g, x + 9, y - 5, 1, 4, '#6b586b');
      if (d.kind === 'moon') {
        rect(g, x + 6, y - 9, 5, 3, '#bdb8da');
        rect(g, x + 8, y - 10, 4, 3, '#302344');
      }
    } else if (d.kind === 'stars') {
      rect(g, x + 3, y - 3, 10, 3, '#604e85');
      star(g, x + 6, y - 6, true); star(g, x + 11, y - 9, true);
      rect(g, x + 5, y - 4, 6, 1, '#ba9ddd');
    } else if (d.kind === 'spark') {
      rect(g, x + 3, y - 5, 6, 5, '#4d3b53');
      rect(g, x + 4, y - 5, 4, 1, '#dba0ba');
      rect(g, x + 8, y - 4, 3, 3, '#6a526c');
      rect(g, x + 12, y - 2, 4, 2, '#c9aa7b');
    } else if (d.kind === 'cookie') {
      rect(g, x + 4, y - 7, 8, 7, '#6d929e');
      rect(g, x + 5, y - 9, 6, 2, '#c8d7d3');
      rect(g, x + 5, y - 5, 6, 4, '#b8d2d4');
      rect(g, x + 7, y - 4, 3, 3, '#d8b282');
      rect(g, x + 8, y - 3, 1, 1, '#75534d');
      rect(g, x + 12, y - 2, 4, 2, '#e5c492');
    } else {
      rect(g, x + 4, y - 5, 6, 5, d.kind === 'think' ? '#a5bdb1' : '#809ba4');
      rect(g, x + 9, y - 4, 3, 3, '#8c7e97');
      rect(g, x + 5, y - 5, 4, 1, '#eee0e5');
      rect(g, x + 13, y - 2, 5, 2, '#c1b7c3');
    }
  }
  function paintWorkstation(g, d) {
    var x = d.deskX, mx = x + 39;
    rect(g, x, 111, 70, 3, C.wood); rect(g, x + 1, 111, 68, 1, '#95647b');
    rect(g, x, 114, 70, 2, C.woodLow);
    rect(g, x + 2, 116, 3, 12, C.woodLow); rect(g, x + 65, 116, 3, 12, C.woodLow);
    rect(g, x + 2, 127, 3, 2, '#281b30'); rect(g, x + 65, 127, 3, 2, '#281b30');
    rect(g, x + 23, 108, 18, 3, '#171220'); rect(g, x + 25, 108, 14, 1, '#8a6c8d');
    for (var k = 0; k < 5; k++) rect(g, x + 25 + k * 3, 110, 2, 1, '#58445e');
    rect(g, x + 44, 109, 4, 2, '#aaa0b8');
    rect(g, mx, 82, 30, 22, '#0a0812'); rect(g, mx + 1, 83, 28, 19, '#101b2b');
    rect(g, mx + 13, 104, 4, 5, '#171220'); rect(g, mx + 9, 109, 12, 2, '#171220');
    rect(g, mx + 2, 84, 26, 1, '#31405a');
    rect(g, mx + 26, 102, 1, 1, d.color);
    var labelW = PX.textWidth(d.name) + 6, labelX = Math.round(x + 54 - labelW / 2);
    rect(g, labelX, 73, labelW, 9, '#120d20');
    rect(g, labelX, 73, labelW, 1, d.color); rect(g, labelX, 81, labelW, 1, '#65516f');
    PX.text(g, d.name, labelX + 3, 75, d.color);
    deskKeepsake(g, d);
  }
  var stationCaches = [];
  function drawWorkstations(g, actors, tick, bounds) {
    var byId = {}, phase = Math.floor((Number(tick) || 0) / 10);
    (actors || []).forEach(function (a) { byId[a.id] = a; });
    workstations.forEach(function (d, i) {
      if (bounds && (d.deskX + 82 < bounds.left || d.deskX > bounds.right)) return;
      if (!stationCaches[i]) {
        var cache = PX.make(82, 58), p = cache.getContext('2d');
        p.translate(-d.deskX, -72); paintWorkstation(p, d); stationCaches[i] = cache;
      }
      g.drawImage(stationCaches[i], d.deskX, 72);
      var a = byId[d.id], active = a && a.state === 'work' && (!a.path || !a.path.length) && Math.abs(a.x - d.x) < 7 && Math.abs(a.y - d.y) < 5;
      var mx = d.deskX + 39;
      if (!active) {
        rect(g, mx + 5, 88, 19, 1, '#38495e'); rect(g, mx + 5, 91, 12, 1, '#29384d');
        rect(g, mx + 19, 98, 5, 1, d.color); return;
      }
      if (d.kind === 'art' || d.kind === 'stars') {
        rect(g, mx + 3, 87, 24, 13, '#2c263f');
        [d.color, '#78b8c4', '#c596b2', '#dabd85'].forEach(function (c, n) {
          rect(g, mx + 5 + n * 5, 89, 4, 4 + (phase + n) % 6, c);
        });
      } else if (d.kind === 'ocean') {
        for (var bar = 0; bar < 12; bar++) {
          var h = 3 + (bar * 7 + phase) % 11;
          rect(g, mx + 3 + bar * 2, 100 - h, 1, h, bar % 3 ? '#4489b3' : '#9bd6e7');
        }
      } else if (d.kind === 'book' || d.kind === 'moon') {
        rect(g, mx + 4, 87, 22, 12, d.kind === 'book' ? '#d7b7a5' : '#b9bfd2');
        for (var ln = 0; ln < 4; ln++) rect(g, mx + 6, 89 + ln * 2, 10 + (ln + phase) % 3 * 3, 1, '#796d80');
      } else {
        for (var row = 0; row < 5; row++) rect(g, mx + 4 + row % 2 * 3, 87 + row * 3, 6 + (row * 7 + phase) % 14, 1, row % 2 ? '#687f94' : d.color);
      }
      rect(g, mx + 23, 99, 2, 1, phase % 2 ? d.color : '#182539');
      rect(g, d.deskX + 23 + phase % 2, 108, 3, 2, '#efd3da');
      rect(g, d.deskX + 32 - phase % 2, 108, 3, 2, '#efd3da');
    });
  }

  // Transparent prop layers are painted over characters according to each
  // object's floor depth. They contain furniture pixels only, never a rectangular
  // patch of floor/wall, so a passing friend's head is not accidentally erased.
  var occluders = [];
  var propOffsets = { sofa: 410, 'tea-table': 410, lamp: 410, 'snack-counter': 320, 'garden-pot': 320 };
  function prop(id, x, y, w, h, footY, paint) {
    var offset = propOffsets[id] || 0, originalX = x, cache = null;
    x += offset;
    occluders.push({ id: id, footY: footY, x: x, y: y, w: w, h: h, draw: function (g) {
      if (!cache) {
        cache = PX.make(w, h); var p = cache.getContext('2d');
        p.translate(-originalX, -y); paint(p);
      }
      g.drawImage(cache, x, y);
    } });
  }
  prop('office-server', 284, 52, 31, 77, 129, function (g) {
    rect(g, 284, 52, 30, 76, '#0a0812'); rect(g, 284, 52, 30, 2, '#2a2240');
    rect(g, 284, 52, 2, 76, '#2a2240'); rect(g, 312, 52, 2, 76, '#2a2240');
    for (var rack=0;rack<9;rack++) {
      rect(g, 288, 58+rack*7, 22, 5, '#17122a');
      rect(g, 290, 60+rack*7, 2, 1, rack%3?'#5dff8f':'#253b30');
      rect(g, 294, 60+rack*7, 2, 1, '#397c5b');
    }
  });
  prop('cowork-server', 615, 69, 18, 60, 129, function (g) {
    rect(g, 615, 69, 17, 59, '#0a0812'); rect(g, 615, 69, 17, 2, '#40364f');
    for (var rack=0;rack<7;rack++) {
      rect(g, 617, 74+rack*7, 13, 5, '#221a31');
      rect(g, 619, 76+rack*7, 2, 1, rack%3?'#65b9b2':'#ce8fae');
      rect(g, 624, 76+rack*7, 4, 1, '#51445e');
    }
  });
  prop('office-plant', 260, 98, 18, 31, 129, function (g) {
    rect(g, 262, 118, 12, 10, '#7a3a2a'); rect(g, 262, 118, 12, 2, '#5a2a20');
    [[268,106,'#3fae6a'],[263,111,'#2f8a55'],[272,110,'#2f8a55'],[266,100,'#5ad08a']].forEach(function(p){
      rect(g,p[0],p[1],4,9,p[2]);rect(g,p[0]+1,p[1]-2,2,2,p[2]);
    });
  });
  prop('cowork-plant', 413, 95, 18, 34, 128, function (g) { plant(g,421,127,1,'#6a3e54'); });
  prop('garden-pot', 942, 135, 18, 28, 162, function (g) { plant(g,950,161,.8,'#76516b'); });
  prop('bed', 2, 143, 60, 33, 174, function (g) {
    rect(g, 2, 145, 59, 29, '#241425');
    rect(g, 4, 143, 7, 29, '#70405b'); rect(g, 5, 145, 55, 4, '#70405b');
    rect(g, 11, 150, 14, 8, '#d4b5c8'); rect(g, 12, 151, 12, 2, '#9d6683');
    rect(g, 25, 149, 32, 17, '#7b4263'); rect(g, 28, 150, 25, 2, '#b75883');
    rect(g, 7, 170, 4, 5, '#4a2e44'); rect(g, 54, 170, 4, 5, '#4a2e44');
  });
  prop('easel', 145, 135, 18, 28, 163, function (g) {
    rect(g, 145, 135, 17, 15, '#49303d'); rect(g, 147, 137, 13, 11, '#c6a980');
    rect(g, 152, 150, 3, 12, '#684639'); rect(g, 148, 160, 11, 2, '#684639');
  });
  prop('cat-bed', 172, 153, 44, 18, 170, function (g) {
    rect(g, 172, 154, 43, 15, '#281426'); rect(g, 174, 153, 39, 8, '#7a3a58');
    rect(g, 178, 154, 31, 4, '#ff7eaf');
    rect(g, 176, 167, 4, 3, '#563149'); rect(g, 207, 167, 4, 3, '#563149');
  });
  prop('fridge', 280, 132, 29, 46, 176, function (g) {
    rect(g, 280, 176, 28, 2, '#1b1220'); rect(g, 282, 137, 24, 38, '#171322');
    rect(g, 283, 138, 22, 35, '#8992b4'); rect(g, 285, 139, 18, 33, '#c5c9d9');
    rect(g, 285, 156, 18, 2, '#73809e');
    rect(g, 299, 144, 2, 8, '#38425b'); rect(g, 299, 162, 2, 7, '#38425b');
    rect(g, 286, 142, 6, 1, '#4fe3ff'); rect(g, 286, 144, 4, 1, '#4fe3ff');
    rect(g, 285, 174, 5, 2, '#38425b'); rect(g, 298, 174, 5, 2, '#38425b');
    rect(g, 285, 133, 8, 4, '#39243b'); rect(g, 286, 132, 6, 2, '#ff9fc4'); rect(g, 288, 134, 2, 2, '#ffd45e');
  });
  prop('sofa', 650, 126, 65, 32, 157, function (g) {
    rect(g, 651, 133, 61, 24, '#241b2e'); rect(g, 654, 126, 56, 23, '#6b4b79');
    rect(g, 657, 128, 50, 14, '#84618e'); rect(g, 658, 129, 48, 1, '#b28aab');
    rect(g, 679, 130, 1, 11, '#664571'); rect(g, 653, 140, 59, 12, '#8b5e85');
    rect(g, 656, 141, 53, 2, '#b185a2');
    rect(g, 650, 135, 6, 17, '#543c63'); rect(g, 708, 135, 6, 17, '#543c63');
    rect(g, 655, 152, 4, 5, '#201725'); rect(g, 704, 152, 4, 5, '#201725');
    rect(g, 695, 132, 9, 8, '#cf94ad'); rect(g, 697, 133, 5, 1, '#edbed0');
  });
  prop('tea-table', 723, 137, 42, 25, 161, function (g) {
    rect(g, 723, 148, 41, 3, '#23192c'); rect(g, 725, 145, 37, 3, '#8e5c70');
    rect(g, 727, 145, 33, 1, '#c39199');
    rect(g, 728, 151, 3, 10, '#533547'); rect(g, 756, 151, 3, 10, '#533547');
    rect(g, 746, 139, 7, 6, '#bcc3d2'); rect(g, 748, 137, 3, 2, '#dde0e7');
    rect(g, 753, 140, 3, 2, '#9297b3'); rect(g, 745, 141, 2, 1, C.cream);
    rect(g, 734, 142, 5, 3, '#e5c1c9'); rect(g, 738, 142, 2, 2, '#a37995'); rect(g, 756, 142, 3, 2, '#d6ae7e');
  });
  prop('lamp', 761, 85, 15, 75, 159, function (g) {
    rect(g, 767, 94, 2, 64, '#655168'); rect(g, 762, 157, 13, 2, '#251b30');
    rect(g, 761, 88, 14, 6, '#b8a0bd'); rect(g, 764, 85, 8, 3, '#d9bdd0'); rect(g, 763, 93, 10, 2, '#e8ccb1');
  });
  prop('snack-counter', 883, 96, 64, 67, 162, function (g) {
    rect(g, 885, 118, 59, 39, '#4c3646'); rect(g, 883, 116, 63, 4, '#9a6b79'); rect(g, 885, 116, 59, 1, '#c995a0');
    rect(g, 889, 123, 51, 26, '#30273a'); rect(g, 891, 125, 22, 21, '#213846'); rect(g, 916, 125, 22, 21, '#213846');
    rect(g, 891, 135, 47, 1, '#5f617a'); rect(g, 914, 125, 1, 21, '#8a788c');
    [895, 903, 920, 929].forEach(function (x, i) {
      rect(g, x, 128, 5, 6, [C.pink, '#cfa269', C.cyan, C.violet][i]); rect(g, x + 1, 126, 3, 2, '#e2d6df');
      rect(g, x, 140, 5, 5, i % 2 ? '#d9b991' : '#aa91b8');
    });
    rect(g, 888, 157, 4, 5, '#251c29'); rect(g, 936, 157, 4, 5, '#251c29');
    rect(g, 919, 96, 18, 20, '#a4a1b4'); rect(g, 921, 98, 14, 12, '#343445');
    rect(g, 924, 100, 6, 1, C.cyan); rect(g, 924, 104, 6, 4, '#53556a');
    rect(g, 925, 110, 4, 4, '#eee0e1'); rect(g, 921, 114, 13, 2, '#626074');
    rect(g, 890, 111, 7, 5, '#edcad0'); rect(g, 891, 110, 5, 1, '#fff0e6');
  });

  // A shared geometry source keeps the painted floor, navigation and depth
  // sorting in agreement. Desks reserve only their two legs, leaving a chair
  // dock in the middle and the whole y132+ connecting aisle open.
  var obstacles = [
    { id: 'bed', x: 4, y: 151, w: 57, h: 23 },
    { id: 'easel', x: 148, y: 154, w: 12, h: 9 },
    { id: 'cat-bed', x: 174, y: 159, w: 39, h: 11 },
    { id: 'fridge', x: 282, y: 158, w: 24, h: 17 },
    { id: 'office-server', x: 284, y: 122, w: 30, h: 7 },
    { id: 'office-plant', x: 262, y: 123, w: 12, h: 6 },
    { id: 'cowork-plant', x: 416, y: 122, w: 10, h: 6 },
    { id: 'cowork-server', x: 615, y: 122, w: 17, h: 7 },
    { id: 'sofa', x: 1060, y: 143, w: 64, h: 14 },
    { id: 'tea-table', x: 1135, y: 147, w: 37, h: 14 },
    { id: 'lamp', x: 1173, y: 155, w: 11, h: 4 },
    { id: 'snack-counter', x: 1205, y: 144, w: 59, h: 18 },
    { id: 'garden-pot', x: 1266, y: 154, w: 9, h: 7 }
  ];
  workstations.forEach(function (d) {
    obstacles.push({ id: 'desk-' + d.id + '-left', x: d.deskX + 2, y: 124, w: 3, h: 4 });
    obstacles.push({ id: 'desk-' + d.id + '-right', x: d.deskX + 65, y: 124, w: 3, h: 4 });
  });

  window.StudioWorld = {
    width: WIDTH,
    height: HEIGHT,
    zones: [
      { id: 'office', x: 0, end: 320, label: 'C0 / X0 / F1' },
      { id: 'cowork', x: 320, end: 640, label: 'MODEL COWORK' },
      { id: 'atelier', x: 640, end: 960, label: 'STAR ATELIER', logZone: 'cowork' },
      { id: 'garden', x: 960, end: 1280, label: 'MOON GARDEN' }
    ],
    workstations: workstations,
    obstacles: obstacles,
    catHome: { x: 1085, target: 1110, y: 164 },
    photoStart: WIDTH - 320 + 14,
    photoY: 178,
    build: function (originalRoom) {
      var canvas = PX.make(WIDTH, HEIGHT), g = canvas.getContext('2d');
      g.imageSmoothingEnabled = false;
      if (originalRoom) g.drawImage(originalRoom, 0, 0);
      shell(g); cowork(g); atelier(g); lounge(g);
      workstations.forEach(function (d) { chair(g, d); });
      occluders.forEach(function (p) { p.draw(g); });
      return canvas;
    },
    drawWorkstations: drawWorkstations,
    foreground: function (g) { drawWorkstations(g, [], 0); },
    occluders: occluders
  };
})();
