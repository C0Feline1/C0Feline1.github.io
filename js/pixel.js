/* Procedural pixel-art kit: everything is drawn from code, no image files. */
(function () {
  var PX = {};
  PX.make = function (w, h) { var c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
  PX.fromRows = function (rows, pal) {
    var h = rows.length, w = rows[0].length, c = PX.make(w, h), g = c.getContext('2d');
    for (var y = 0; y < h; y++) for (var x = 0; x < w; x++) {
      var col = pal[rows[y][x]];
      if (col) { g.fillStyle = col; g.fillRect(x, y, 1, 1); }
    }
    return c;
  };
  PX.flip = function (src) {
    var c = PX.make(src.width, src.height), g = c.getContext('2d');
    g.translate(src.width, 0); g.scale(-1, 1); g.drawImage(src, 0, 0); return c;
  };
  PX.tint = function (src, color) {
    var c = PX.make(src.width, src.height), g = c.getContext('2d');
    g.drawImage(src, 0, 0); g.globalCompositeOperation = 'source-atop';
    g.fillStyle = color; g.fillRect(0, 0, c.width, c.height); return c;
  };
  PX.rng = function (seed) {
    var s = seed >>> 0;
    return function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  };
  var BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
  PX.dither = function (x, y) { return (BAYER[(y & 3) * 4 + (x & 3)] + 0.5) / 16; };
  PX.hex = function (c) { return [parseInt(c.substr(1, 2), 16), parseInt(c.substr(3, 2), 16), parseInt(c.substr(5, 2), 16)]; };
  /* vertical dithered gradient through a list of hex stops */
  PX.skyGradient = function (w, h, stops) {
    var c = PX.make(w, h), g = c.getContext('2d'), cols = stops.map(PX.hex), n = cols.length - 1;
    var img = g.createImageData(w, h);
    for (var y = 0; y < h; y++) {
      var t = (y / (h - 1)) * n, i = Math.min(n - 1, Math.floor(t)), f = t - i;
      for (var x = 0; x < w; x++) {
        var rem = f * 6 - Math.floor(f * 6);
        var q = Math.min(1, (Math.floor(f * 6) + (rem > PX.dither(x, y) ? 1 : 0)) / 6);
        var a = cols[i], b = cols[i + 1], p = (y * w + x) * 4;
        img.data[p] = a[0] + (b[0] - a[0]) * q; img.data[p + 1] = a[1] + (b[1] - a[1]) * q;
        img.data[p + 2] = a[2] + (b[2] - a[2]) * q; img.data[p + 3] = 255;
      }
    }
    g.putImageData(img, 0, 0); return c;
  };

  /* 3x5 bitmap font */
  var FONT = {
    '0': '111101101101111', '1': '010110010010111', '2': '111001111100111', '3': '111001111001111', '4': '101101111001001',
    '5': '111100111001111', '6': '111100111101111', '7': '111001010010010', '8': '111101111101111', '9': '111101111001111',
    'A': '010101111101101', 'B': '110101110101110', 'C': '011100100100011', 'D': '110101101101110', 'E': '111100110100111',
    'F': '111100110100100', 'G': '011100101101011', 'H': '101101111101101', 'I': '111010010010111', 'J': '001001001101010',
    'K': '101101110101101', 'L': '100100100100111', 'M': '101111111101101', 'N': '110101101101101', 'O': '010101101101010',
    'P': '110101110100100', 'Q': '010101101110011', 'R': '110101110101101', 'S': '011100010001110', 'T': '111010010010010',
    'U': '101101101101111', 'V': '101101101101010', 'W': '101101111111101', 'X': '101101010101101', 'Y': '101101010010010',
    'Z': '111001010100111', ':': '000010000010000', '.': '000000000000010', '-': '000000111000000', '!': '010010010000010',
    '/': '001001010100100', '*': '000101010101000', '>': '100010001010100', '<': '001010100010001', '+': '000010111010000',
    '%': '101001010100101', '?': '111001010000010', '#': '101111101111101', '_': '000000000000111', "'": '010010000000000',
    '@': '101111111010000', ' ': '000000000000000'
  };
  PX.textWidth = function (s, k) { return (String(s).length * 4 - 1) * (k || 1); };
  PX.text = function (g, s, x, y, color, shadow, k) {
    k = k || 1; s = String(s).toUpperCase(); x = Math.round(x); y = Math.round(y);
    function pass(ox, oy, col) {
      g.fillStyle = col;
      for (var i = 0; i < s.length; i++) {
        var gl = FONT[s[i]] || FONT['?'];
        for (var j = 0; j < 15; j++) if (gl[j] === '1') g.fillRect(x + ox + (i * 4 + (j % 3)) * k, y + oy + Math.floor(j / 3) * k, k, k);
      }
    }
    if (shadow) pass(k, k, shadow);
    pass(0, 0, color);
  };

  /* ---------- characters (16x24, facing right) ---------- */
  var TOP_CAT = ['...o.......o....', '..oio.....oio...', '..oiio...oiio...', '..ohhhoooohhho..'];
  var TOP_HUMAN = ['................', '................', '....oooooooo....', '..oohhhhhhhhoo..'];
  var FACE = [
    '.ohhhhhhhhhhhho.', 'ohhhhhhhhhhhhhho', 'ohhhhhhhhhhhhhho', 'ohhhhHhhhhHhhhho',
    'ohhhhssHssHsshho', 'ohhhswesssweshho', 'ohhhseessseeshho', 'ohhhpsssmsspshho', '.ohhhosssssohhho'
  ];
  var BODY = [
    '.ohhoccaacccohho', '.ohocccaaccccoho', '..ooscccccccCso.', '...osCccccccCo..',
    '...oCCaaaaaaCo..', '...occccccccco..', '..occccccccccco.'
  ];
  var LEGS = {
    stand: ['....ollo.ollo...', '....ollo.ollo...', '....obbo.obbbo..', '....oooo.ooooo..'],
    r0: ['...ollo...ollo..', '..ollo.....ollo.', '..obbo.....obbo.', '..oooo.....oooo.'],
    r1: ['....ollo.ollo...', '....ollo.ollo...', '....obbooobbo...', '....oooo.oooo...'],
    r2: ['...ollo...ollo..', '...ollo....ollo.', '..obbo.....obbo.', '..oooo.....oooo.'],
    jump: ['....ollo.ollo...', '.....ollollo....', '.....obbobbo....', '.....ooo.ooo....']
  };

  PX.CHARS = {
    Feline1: {
      cat: true, tail: true, label: 'FELINE1', cn: '猫娘 Feline1', perk: '九命：多 1 颗心 + 每个世界不同的身法', perkEn: 'NINE LIVES', color: '#ff6fa6',
      pal: { o: '#4a2a3e', h: '#fff1f6', H: '#e3bfd2', i: '#ff9fc4', s: '#ffe3d6', p: '#ff9aa8', m: '#c0506a', e: '#e0407a', w: '#ffffff',
        c: '#fbe0ec', C: '#e2aec6', a: '#ff6fa6', l: '#ffffff', b: '#9b5a78', t: '#fff1f6', r: '#ff6fa6' }
    },
    C0: {
      cat: false, headset: true, label: 'C0', cn: '程序 C0', perk: '超频：危险时自动慢动作', perkEn: 'OVERCLOCK', color: '#4fe3ff',
      pal: { o: '#050307', h: '#2e2534', H: '#1a141e', s: '#f3d2c4', p: '#ef9a9a', m: '#9c4a5a', e: '#141018', w: '#ffffff',
        c: '#2c2638', C: '#19151f', a: '#4fe3ff', l: '#1c1824', b: '#4fe3ff', r: '#4fe3ff' }
    },
    X0: {
      cat: false, ribbon: true, label: 'X0', cn: '画师 X0', perk: '镜光护盾：护盾更快充能 + 吸星砂', perkEn: 'MIRROR SHIELD', color: '#b48cff',
      pal: { o: '#1a0a12', h: '#47303d', H: '#2a1922', s: '#f6dcd6', p: '#ff9fb0', m: '#a04a5a', e: '#b48cff', w: '#ffffff',
        c: '#f5e3ea', C: '#cdb0bc', a: '#2a1220', l: '#2a1220', b: '#2a1220', r: '#ff5f8f' }
    }
  };
  PX.ORDER = ['Feline1', 'C0', 'X0'];

  function charRows(def, legs, blink) {
    var rows = (def.cat ? TOP_CAT : TOP_HUMAN).concat(FACE, BODY, LEGS[legs]).map(function (r) { return r.split(''); });
    if (blink) { rows[9] = 'ohhhssssssssshho'.split(''); rows[10] = 'ohhhsoosssooshho'.split(''); }
    if (def.tail) [[1, 13], [1, 14], [0, 15], [0, 16], [1, 17], [2, 17]].forEach(function (p) { rows[p[1]][p[0]] = 't'; });
    if (def.headset) {
      for (var x = 3; x < 13; x++) rows[2][x] = 'r';
      [[2, 3], [1, 4], [0, 6], [0, 7], [0, 8], [0, 9], [1, 7], [1, 8], [1, 9]].forEach(function (p) { rows[p[1]][p[0]] = 'r'; });
    }
    if (def.ribbon) [[11, 2], [12, 2], [13, 1], [12, 3], [13, 3], [14, 2], [13, 2], [14, 1], [14, 3]].forEach(function (p) { rows[p[1]][p[0]] = 'r'; });
    return rows.map(function (r) { return r.join(''); });
  }
  PX.buildChar = function (id) {
    var d = PX.CHARS[id], mk = function (legs, blink) { return PX.fromRows(charRows(d, legs, blink), d.pal); };
    var s = { stand: mk('stand'), blink: mk('stand', true), run: [mk('r0'), mk('r1'), mk('r2'), mk('r1')], jump: mk('jump') };
    s.hurt = PX.tint(s.jump, 'rgba(255,80,110,.55)');
    s.white = PX.tint(s.stand, '#ffffff');
    return s;
  };

  /* ---------- enemies & props ---------- */
  var WOLF = {
    top: ['..............o.o.', '.............owowo', 'o...ooooooooowwwwo', 'wo.owwwwwwwwwwwewo', '.owwwwwwwwwwwwwwwo',
      '..owwwwgwwwwwwwwo.', '..ogwwgggwwwwwwo..', '..oggggggggggggo..'],
    a: ['..owo.owo..owo.owo', '.owo...owo.owo..ow', '.oo....oo..oo...oo'],
    b: ['...owowo....owowo.', '...owowo....owowo.', '...oo.oo....oo.oo.']
  };
  var WOLF_PAL = { o: '#24304f', w: '#e8f0ff', g: '#9fb0d0', e: '#ff4060' };
  var BEETLE = {
    top: ['....oooooo....', '...obbhhbbo...', '..obbhbbbbbo..', '.obbbbBbbbbboo', '.oBbbbBbbbBboe', '.oBBBBBBBBBBoo', '..oooooooooo..'],
    a: ['..o.o..o..o.o.', '.o..o.o..o.o..'], b: ['...o.o..o.o...', '...o..o..o.o..']
  };
  var BEETLE_PAL = { o: '#1d2a44', b: '#6fd3ff', B: '#3a8fc4', h: '#e6fbff', e: '#ffe14d' };
  var CONE = ['...oo...', '..oaAo..', '..owwo..', '.oaaaAo.', '.owwwwo.', '.oaaaaAo', 'oaaaaaAo', 'oooooooo'];
  var CONE_PAL = { o: '#3a1a10', a: '#ff7a2a', A: '#c24e18', w: '#fff4e8' };
  var BIRD = {
    a: ['oo........', '.ooo..oo..', '..oooooooo', '.oeooooo..', 'yo........'],
    b: ['..........', '..........', 'o.oooooooo', 'oeoooooo..', 'yooooo....']
  };
  PX.buildProps = function () {
    var P = {};
    P.wolf = [PX.fromRows(WOLF.top.concat(WOLF.a), WOLF_PAL), PX.fromRows(WOLF.top.concat(WOLF.b), WOLF_PAL)].map(PX.flip);
    P.beetle = [PX.fromRows(BEETLE.top.concat(BEETLE.a), BEETLE_PAL), PX.fromRows(BEETLE.top.concat(BEETLE.b), BEETLE_PAL)].map(PX.flip);
    P.cone = PX.fromRows(CONE, CONE_PAL);
    var birdPal = { o: '#1b1430', e: '#ff4f7a', y: '#ffb84f' }, batPal = { o: '#d8ecff', e: '#2a5fd8', y: '#7fb8ff' };
    P.crow = [PX.fromRows(BIRD.a, birdPal), PX.fromRows(BIRD.b, birdPal)];
    P.bat = [PX.fromRows(BIRD.a, batPal), PX.fromRows(BIRD.b, batPal)];
    P.box = (function () {
      var c = PX.make(16, 13), g = c.getContext('2d');
      g.fillStyle = '#3a2412'; g.fillRect(0, 2, 16, 11);
      g.fillStyle = '#c48a4e'; g.fillRect(1, 3, 14, 9);
      g.fillStyle = '#a06a36'; g.fillRect(1, 10, 14, 2); g.fillRect(1, 3, 14, 1);
      g.fillStyle = '#e8c48a'; g.fillRect(7, 3, 2, 9);
      g.fillStyle = '#3a2412'; g.fillRect(2, 0, 4, 3); g.fillRect(10, 0, 4, 3);
      g.fillStyle = '#c48a4e'; g.fillRect(3, 1, 2, 2); g.fillRect(11, 1, 2, 2);
      return c;
    })();
    P.spike = function (w, h, seed, pal) {
      pal = pal || ['#24406e', '#e6fbff', '#a8e6ff', '#6fb6e8'];
      var c = PX.make(w, h), g = c.getContext('2d'), R = PX.rng(seed), n = 2 + Math.floor(R() * 2);
      for (var k = 0; k < n; k++) {
        var cx = Math.floor(w * (k + 0.5) / n + (R() - 0.5) * 3), top = Math.floor(R() * h * 0.4) + (k % 2 ? 5 : 0), hw = Math.max(3, Math.floor(w / n / 2) + 1);
        for (var y = top; y < h; y++) {
          var half = Math.max(0.5, (y - top) / (h - top) * hw);
          for (var x = Math.floor(cx - half); x <= Math.ceil(cx + half); x++) {
            if (x < 0 || x >= w) continue;
            var edge = x <= cx - half + 0.6 || x >= cx + half - 0.6 || y === top;
            g.fillStyle = edge ? pal[0] : (x < cx ? pal[1] : (x === cx ? pal[2] : pal[3]));
            g.fillRect(x, y, 1, 1);
          }
        }
      }
      return c;
    };
    var SH = { o: '#ff4fa3', y: '#ffd45e', Y: '#fff1a8', w: '#ffffff' };
    P.shard = [
      ['....o....', '...oyo...', '..oyYyo..', '.oyYwYyo.', 'oyYwwwYyo', '.oyYwYyo.', '..oyYyo..', '...oyo...', '....o....'],
      ['.........', '....o....', '...oyo...', '..oyYyo..', '.oyYwYyo.', '..oyYyo..', '...oyo...', '....o....', '.........'],
      ['.........', '.........', '....o....', '...oYo...', '..oYwYo..', '...oYo...', '....o....', '.........', '.........'],
      ['.........', '....o....', '...oyo...', '..oyYyo..', '.oyYwYyo.', '..oyYyo..', '...oyo...', '....o....', '.........']
    ].map(function (r) { return PX.fromRows(r, SH); });
    var CAT = { o: '#1b1430', g: '#8a8fb0', G: '#6a6f90', p: '#ff9fc4' };
    P.cat = [
      PX.fromRows(['.o.o.........', 'opgpo........', 'ogggoooooooo.', 'oogggGgggGggo', '.oggggggggggo', '..ooooooooooo'], CAT),
      PX.fromRows(['.o.o.........', 'opgpo........', 'ogggoooooooo.', 'oogggGgggGggo', '.ogggggggggggo'.slice(0, 13), '..oooooooooo.'], CAT)
    ];
    return P;
  };
  window.PX = PX;
})();
