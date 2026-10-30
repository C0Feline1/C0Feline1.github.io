/* Shared-room furniture. Item bounds, visible feet and collision footprints
 * travel together; the floor layer contains rugs only, never solid obstacles. */
(function () {
  'use strict';

  var C = {
    ink: '#17101f', edge: '#302237', wood: '#765064', woodHi: '#a47a86',
    woodLow: '#4b3349', cream: '#e4d5c8', paper: '#c4b7c4',
    pink: '#d996b4', violet: '#9983b3', cyan: '#7bbfc4',
    leaf: '#4e967d', leafHi: '#84b39a', leafLow: '#315a55'
  };
  var items = [];

  function r(g, x, y, w, h, color) {
    g.fillStyle = color;
    g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
  }
  function add(id, x, y, w, h, footY, footprint, paint) {
    var cache = null;
    items.push({
      id: id, x: x, y: y, w: w, h: h, footY: footY,
      obstacle: footprint ? { id: id, x: footprint[0], y: footprint[1], w: footprint[2], h: footprint[3] } : null,
      draw: function (g) {
        if (!cache) { cache = PX.make(w, h); paint(cache.getContext('2d')); }
        g.drawImage(cache, x, y);
      }
    });
  }
  function mug(g, x, y, color) {
    r(g, x, y, 5, 5, color); r(g, x + 1, y, 3, 1, C.cream);
    r(g, x + 5, y + 1, 2, 3, color); r(g, x + 5, y + 2, 1, 1, C.woodLow);
  }
  function leaves(g, x, y, color) {
    r(g, x + 6, y + 3, 1, 16, C.leafLow);
    [[0, 8, 6, 4], [7, 3, 7, 5], [3, 0, 4, 7], [7, 11, 6, 4], [2, 14, 5, 3]].forEach(function (p, i) {
      r(g, x + p[0], y + p[1], p[2], p[3], i % 2 ? C.leafHi : color || C.leaf);
      r(g, x + p[0] + 1, y + p[1] + 1, Math.max(1, p[2] - 3), 1, C.leafLow);
    });
  }
  function cushion(g, x, y, color, seam) {
    r(g, x + 2, y, 14, 1, C.edge); r(g, x, y + 2, 18, 8, C.edge);
    r(g, x + 1, y + 1, 16, 8, color); r(g, x + 3, y + 2, 12, 1, seam);
    r(g, x + 2, y + 9, 14, 2, C.woodLow); r(g, x + 4, y + 8, 10, 1, C.edge);
  }

  // The sitting corner has floor cushions as well as the shared sofa.
  add('lounge-cushions', 502, 212, 29, 19, 230, [504, 224, 25, 6], function (g) {
    cushion(g, 0, 0, '#8a648c', '#b58daf');
    cushion(g, 10, 7, '#5d878d', '#9ebdc0');
    r(g, 18, 10, 2, 3, '#c3ccd0'); r(g, 17, 11, 4, 1, '#c3ccd0');
  });

  // A second, low counter faces the room: machine, shared cups and a snack plate.
  add('coffee-island', 617, 213, 65, 42, 253, [619, 247, 60, 6], function (g) {
    r(g, 1, 23, 63, 4, C.ink); r(g, 3, 27, 59, 12, C.woodLow);
    r(g, 4, 28, 57, 9, '#654455'); r(g, 5, 29, 55, 1, '#815969');
    r(g, 3, 38, 5, 3, C.ink); r(g, 57, 38, 5, 3, C.ink);
    r(g, 0, 21, 65, 3, C.wood); r(g, 2, 21, 61, 1, C.woodHi);
    r(g, 31, 28, 1, 9, C.woodLow); r(g, 26, 31, 2, 1, '#b38d94'); r(g, 36, 31, 2, 1, '#b38d94');
    r(g, 7, 3, 21, 18, C.ink); r(g, 8, 4, 19, 16, '#8d879b');
    r(g, 10, 6, 15, 4, '#28253a'); r(g, 12, 7, 5, 1, C.cyan);
    r(g, 11, 12, 10, 7, '#342b40'); r(g, 13, 12, 6, 2, '#6c6379');
    r(g, 15, 14, 1, 3, '#ae8b70'); r(g, 22, 12, 2, 2, C.pink);
    r(g, 10, 20, 16, 1, '#d6c5d3'); mug(g, 13, 16, C.cream);
    r(g, 30, 15, 9, 6, '#b698a5'); r(g, 31, 14, 7, 1, '#d8c5ca');
    r(g, 32, 16, 1, 4, '#776178'); r(g, 35, 15, 1, 4, '#776178');
    r(g, 43, 18, 16, 3, '#dad0c4'); r(g, 45, 17, 12, 2, '#b7b0be');
    [[46, '#d5b27d'], [51, '#c89978'], [55, '#d8bd89']].forEach(function (p) {
      r(g, p[0], 15, 4, 3, p[1]); r(g, p[0] + 1, 16, 1, 1, '#835c59');
    });
  });

  add('pantry-cabinet', 720, 130, 23, 55, 183, [722, 176, 18, 7], function (g) {
    r(g, 0, 0, 23, 52, C.ink); r(g, 1, 1, 21, 50, C.woodLow);
    r(g, 3, 3, 17, 42, '#3e3346');
    [15, 30, 44].forEach(function (y) { r(g, 2, y, 19, 2, '#8b6678'); r(g, 3, y, 17, 1, '#b0848c'); });
    [[5, 6, '#bf91a7'], [13, 8, '#7da6a7'], [5, 22, '#baa279'], [13, 21, '#9990b3']].forEach(function (p) {
      r(g, p[0], p[1], 5, 7, p[2]); r(g, p[0], p[1] - 1, 5, 2, C.cream);
      r(g, p[0] + 1, p[1] + 3, 3, 2, '#e1cbd1');
    });
    r(g, 5, 36, 13, 7, '#9b7b65'); r(g, 6, 37, 11, 1, '#c2a88d');
    r(g, 3, 47, 17, 3, '#6a4c60'); r(g, 10, 48, 3, 1, C.woodHi);
    r(g, 2, 52, 4, 3, C.ink); r(g, 17, 52, 4, 3, C.ink);
  });

  add('art-supply-cart', 817, 164, 32, 43, 205, [820, 199, 25, 6], function (g) {
    r(g, 3, 17, 2, 23, '#736176'); r(g, 27, 17, 2, 23, '#736176');
    r(g, 2, 17, 28, 3, '#80617f'); r(g, 4, 18, 24, 1, '#b694a8');
    r(g, 3, 31, 26, 3, '#80617f'); r(g, 5, 32, 22, 1, '#b694a8');
    r(g, 6, 37, 20, 2, '#4d3a54'); r(g, 3, 39, 5, 4, C.ink); r(g, 25, 39, 5, 4, C.ink);
    r(g, 4, 40, 2, 1, '#a6a0ae'); r(g, 26, 40, 2, 1, '#a6a0ae');
    r(g, 5, 8, 8, 9, '#ac8d9c'); r(g, 6, 6, 6, 2, '#d5c6c8');
    [[6, 0, '#d3b383'], [9, 2, '#9eb8bd'], [11, 0, '#be96bd']].forEach(function (p) { r(g, p[0], p[1], 1, 10, p[2]); });
    r(g, 18, 9, 9, 8, '#668a96'); r(g, 19, 7, 7, 2, '#bac6ca');
    r(g, 19, 11, 7, 3, '#aacae0'); r(g, 22, 11, 1, 3, '#d9e0df');
    r(g, 7, 25, 16, 5, '#d2c2b5'); r(g, 6, 25, 18, 1, '#aa91ac');
    r(g, 8, 27, 13, 1, '#a997a2'); r(g, 10, 35, 11, 2, '#daac87');
  });

  add('guitar-stand', 868, 166, 21, 44, 208, [871, 204, 14, 4], function (g) {
    r(g, 9, 8, 2, 33, '#4b3a53'); r(g, 2, 41, 17, 2, C.ink);
    r(g, 3, 39, 2, 3, '#80697d'); r(g, 15, 39, 2, 3, '#80697d');
    r(g, 8, 1, 6, 6, '#9d755e'); r(g, 7, 2, 1, 3, '#c3b4ac'); r(g, 14, 2, 1, 3, '#c3b4ac');
    r(g, 9, 7, 4, 18, '#af8766'); r(g, 10, 6, 1, 28, '#d3bd94');
    [10, 14, 18, 22].forEach(function (y) { r(g, 9, y, 4, 1, '#71544f'); });
    r(g, 5, 24, 12, 6, C.ink); r(g, 2, 28, 17, 9, C.ink); r(g, 4, 36, 13, 3, C.ink);
    r(g, 6, 24, 10, 6, '#b98768'); r(g, 3, 29, 15, 7, '#b98768'); r(g, 5, 36, 11, 2, '#94675c');
    r(g, 6, 29, 2, 5, '#d3a27c'); r(g, 9, 27, 4, 5, '#493342');
    r(g, 8, 34, 6, 2, '#6b484b'); r(g, 10, 27, 1, 8, '#d0ba92');
  });

  add('arcade-cabinet', 942, 134, 39, 68, 200, [945, 192, 33, 8], function (g) {
    r(g, 3, 0, 32, 8, C.ink); r(g, 4, 1, 30, 6, '#755375');
    r(g, 7, 3, 24, 2, '#d7a8c4');
    r(g, 5, 8, 29, 29, C.ink); r(g, 3, 29, 33, 10, C.ink);
    r(g, 7, 9, 25, 23, '#a193b7'); r(g, 9, 11, 21, 19, '#152636');
    r(g, 11, 13, 17, 1, '#385668'); r(g, 11, 27, 17, 1, '#466873');
    r(g, 13, 22, 4, 4, C.pink); r(g, 14, 21, 2, 1, C.cream);
    r(g, 22, 17, 4, 1, '#d4b779'); r(g, 23, 16, 2, 3, '#d4b779');
    r(g, 18, 24, 8, 1, '#527b8f'); r(g, 21, 14, 1, 1, C.cyan);
    r(g, 2, 35, 35, 5, '#806080'); r(g, 4, 35, 31, 1, '#b393b1');
    r(g, 9, 31, 2, 5, '#c8b5bc'); r(g, 8, 30, 4, 2, C.pink);
    r(g, 23, 36, 3, 2, C.cyan); r(g, 29, 36, 3, 2, '#c79cb5');
    r(g, 5, 40, 30, 24, '#46334f'); r(g, 8, 42, 24, 18, '#5b4262');
    r(g, 14, 45, 12, 1, '#ae86ab'); r(g, 15, 49, 10, 1, '#8b6b93');
    r(g, 16, 54, 7, 2, '#231b30'); r(g, 6, 64, 6, 4, C.ink); r(g, 28, 64, 6, 4, C.ink);
    r(g, 2, 40, 2, 24, '#8d668b'); r(g, 35, 40, 2, 24, '#392a44');
  });

  add('reading-bookcase', 1024, 130, 50, 59, 187, [1026, 181, 46, 6], function (g) {
    r(g, 0, 0, 50, 57, C.ink); r(g, 1, 1, 48, 54, C.woodLow);
    r(g, 4, 4, 42, 47, '#2e2538');
    [18, 34, 50].forEach(function (y) { r(g, 3, y, 44, 3, '#876376'); r(g, 4, y, 42, 1, '#b18b94'); });
    var colors = ['#88739d', '#a78778', '#678f94', '#b08498', '#899db2'];
    [0, 1, 2].forEach(function (row) {
      for (var col = 0; col < 7; col++) {
        var x = 6 + col * 5, bottom = 18 + row * 16, h = 8 + (col * 3 + row * 2) % 5;
        r(g, x, bottom - h, 4, h, colors[(col + row) % colors.length]);
        r(g, x + 1, bottom - h + 2, 2, 1, '#cebfc7');
      }
    });
    r(g, 3, 55, 5, 4, C.ink); r(g, 42, 55, 5, 4, C.ink);
  });

  add('reading-armchair', 1038, 205, 36, 41, 244, [1040, 238, 31, 6], function (g) {
    r(g, 6, 0, 24, 30, C.ink); r(g, 7, 1, 22, 26, '#607680');
    r(g, 9, 3, 18, 18, '#7e969b'); r(g, 10, 4, 16, 1, '#b1bdba');
    r(g, 6, 21, 25, 13, '#6d8790'); r(g, 8, 23, 21, 2, '#9bb0b2');
    r(g, 0, 17, 7, 19, C.ink); r(g, 29, 17, 7, 19, C.ink);
    r(g, 1, 17, 6, 16, '#4a6571'); r(g, 29, 17, 6, 16, '#4a6571');
    r(g, 2, 18, 4, 1, '#8ea5ad'); r(g, 30, 18, 4, 1, '#8ea5ad');
    r(g, 6, 35, 5, 6, C.ink); r(g, 25, 35, 5, 6, C.ink);
    r(g, 18, 12, 10, 9, '#c0a1a8'); r(g, 19, 13, 8, 1, '#dfc4c5');
    r(g, 9, 28, 15, 2, '#b4aa9d'); r(g, 10, 27, 13, 1, '#ded2bb');
  });

  add('planter-bench', 1120, 137, 103, 47, 182, [1122, 176, 98, 6], function (g) {
    r(g, 1, 24, 101, 4, C.wood); r(g, 3, 24, 97, 1, '#b08a92');
    r(g, 4, 28, 4, 17, C.woodLow); r(g, 95, 28, 4, 17, C.woodLow);
    r(g, 7, 40, 89, 2, '#59404e'); r(g, 3, 45, 7, 2, C.ink); r(g, 93, 45, 7, 2, C.ink);
    [[8, '#9a6b7c'], [42, '#7d7a89'], [77, '#8c7568']].forEach(function (p, i) {
      r(g, p[0], 17, 17, 7, p[1]); r(g, p[0] - 1, 16, 19, 2, '#b2939c');
      r(g, p[0] + 2, 23, 13, 1, C.woodLow);
      leaves(g, p[0] + 2, i === 1 ? 1 : 0, i === 1 ? '#6b9d8f' : C.leaf);
    });
    r(g, 32, 20, 5, 4, '#a9c4ca'); r(g, 37, 19, 3, 2, '#b7cbd0');
    r(g, 34, 17, 1, 3, '#d0dbd8');
  });

  add('cat-scratching-tree', 1213, 197, 26, 43, 238, [1215, 231, 21, 7], function (g) {
    r(g, 2, 36, 23, 5, '#52394b'); r(g, 3, 36, 21, 1, '#ad8d98');
    r(g, 10, 6, 6, 31, '#a98c77'); r(g, 10, 7, 1, 28, '#d1b196');
    for (var y = 10; y < 35; y += 4) r(g, 11, y, 5, 1, '#7c625d');
    r(g, 2, 3, 22, 4, '#71536b'); r(g, 4, 1, 18, 3, '#a37b96');
    r(g, 6, 2, 14, 1, '#c69cb2');
    r(g, 16, 18, 10, 3, '#88637c'); r(g, 17, 17, 8, 1, '#bb93a7');
    r(g, 4, 8, 1, 12, '#a9a2aa'); r(g, 2, 19, 5, 5, '#c996b0');
    r(g, 3, 19, 2, 1, '#ebc1d0');
  });

  function rug(g, x, y, w, h, body, border, stitch) {
    r(g, x + 2, y, w - 4, h, body); r(g, x, y + 2, w, h - 4, body);
    r(g, x + 3, y + 2, w - 6, 1, border); r(g, x + 3, y + h - 3, w - 6, 1, border);
    r(g, x + 2, y + 3, 1, h - 6, border); r(g, x + w - 3, y + 3, 1, h - 6, border);
    for (var s = x + 9; s < x + w - 9; s += 14) {
      r(g, s, y + 4, 3, 1, stitch); r(g, s, y + h - 5, 3, 1, stitch);
    }
  }
  function paintFloor(g) {
    rug(g, 502, 157, 222, 103, '#352b3b', '#68465a', '#806075');
    // A narrow tiled patch distinguishes the kitchen without building walls.
    r(g, 614, 132, 128, 55, '#293139');
    for (var y = 132; y < 187; y += 11) r(g, 614, y, 128, 1, '#39424a');
    for (var x = 614; x < 742; x += 16) r(g, x, 132, 1, 55, '#39424a');
    rug(g, 768, 176, 219, 85, '#302c43', '#544965', '#786484');
    // A few woven diamonds make the creative corner readable at normal zoom.
    [786, 832, 878, 924, 970].forEach(function (x) {
      r(g, x, 251, 3, 1, '#5c5272'); r(g, x + 1, 250, 1, 3, '#5c5272');
    });
    rug(g, 1016, 192, 252, 74, '#2d343a', '#4f6265', '#68817f');
  }

  window.StudioFurnishings = { items: items, paintFloor: paintFloor };
})();
