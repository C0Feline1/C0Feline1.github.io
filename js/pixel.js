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
    '@': '101111111010000', '·': '000000010000000', '(': '010100100100010', ')': '010001001001010', ',': '000000000010100', ' ': '000000000000000'
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

  /* ---------- characters v2 (16x24, facing right, light from top-left) ---------- */
  var TOP = {
    cat: ['...o.......o....', '..oio.....oio...', '..oiio...oiio...', '..ohhhoooohhho..'],
    human: ['................', '................', '....oooooooo....', '..oohhhhhhhhoo..']
  };
  var HEAD = [
    '.ohLLhhhhhhhhho.',
    'ohLhhhhhhhhhhhHo',
    'ohhhhhhhhhhhhHHo',
    'ohhhHhhhhhHhhhHo',
    'ohHHsssHsssHshHo',
    'ohHssswosswoshHo',
    'ohHsssEEssEEShHo',
    'ohHsspsssmssphHo',
    'ohHoSsssssssohHo'
  ];
  var BODIES = {
    dress: ['ohHokckkkkcCohHo', 'ohHokccaAacCohHo', 'ohHokccccccCohHo', '.oHokccccccCoHo.', '...oaaaaaaaao...', '..okccccccccCo..', '..oCcCcCcCcCco..'],
    hoodie: ['...okcaccacCo...', '...okcaccacCo...', '...okccccccCo...', '...okcCCCCcCo...', '...okccccccCo...', '...oaaaaaaaao...', '...olllllllno...'],
    blouse: ['ohHokckkkkcCohHo', 'ohHokccaAacCohHo', 'ohHokccccccCohHo', '.oHokccccccCoHo.', '...oddddddddo...', '..odddddddddDo..', '..odDdDdDdDdDo..']
  };
  var LEGS = {
    stand: ['....olno.olno...', '....olno.olno...', '....obbo.obbBo..', '....oooo.ooooo..'],
    r0: ['...olno...olno..', '..olno.....olno.', '..obbo.....obBo.', '..oooo.....oooo.'],
    r1: ['....olno.olno...', '....olno.olno...', '....obbooobBo...', '....oooo.oooo...'],
    r2: ['...olno...olno..', '...olno....olno.', '..obbo.....obBo.', '..oooo.....oooo.'],
    jump: ['....olno.olno...', '.....olnolno....', '.....obbobBo....', '.....ooo.ooo....'],
    fall: ['...olno..olno...', '..olno....olno..', '..obbo....obBo..', '..oooo....oooo..']
  };
  var ARMS = {
    side: [[3, 14, 'C'], [3, 15, 'C'], [3, 16, 's'], [12, 14, 'c'], [12, 15, 'c'], [12, 16, 's']],
    fwd: [[3, 14, 'C'], [2, 15, 'C'], [1, 16, 's'], [12, 14, 'c'], [13, 15, 'c'], [14, 15, 's']],
    back: [[3, 14, 'c'], [2, 15, 'c'], [1, 16, 's'], [12, 14, 'C'], [13, 15, 'C'], [14, 15, 's']],
    up: [[3, 13, 'C'], [2, 12, 'C'], [1, 11, 's'], [12, 13, 'c'], [13, 12, 'c'], [14, 11, 's']],
    out: [[3, 14, 'C'], [2, 14, 'C'], [1, 14, 's'], [12, 14, 'c'], [13, 14, 'c'], [14, 14, 's']]
  };
  var TAILS = [
    [[3, 19, 't'], [2, 19, 't'], [1, 18, 't'], [0, 17, 't'], [0, 16, 'T']],
    [[3, 19, 't'], [2, 20, 't'], [1, 20, 't'], [0, 19, 't'], [0, 18, 'T']]
  ];
  var HEADSET = [[4, 2, 'r'], [5, 2, 'r'], [6, 2, 'r'], [7, 2, 'r'], [8, 2, 'r'], [9, 2, 'r'], [10, 2, 'r'], [11, 2, 'r'], [3, 3, 'r'], [12, 3, 'r'], [2, 4, 'r'], [13, 4, 'r'], [1, 5, 'r'], [14, 5, 'r'],
    [0, 6, 'r'], [0, 7, 'r'], [0, 8, 'A'], [1, 6, 'r'], [1, 7, 'w'], [1, 8, 'r'], [0, 9, 'o'], [1, 9, 'o'],
    [15, 6, 'r'], [15, 7, 'r'], [15, 8, 'A'], [14, 6, 'r'], [14, 7, 'r'], [14, 8, 'r']];
  var BOW = [[10, 1, 'r'], [11, 1, 'r'], [13, 1, 'r'], [14, 1, 'r'], [10, 2, 'r'], [11, 2, 'A'], [12, 2, 'A'], [13, 2, 'A'], [14, 2, 'r'], [10, 3, 'r'], [11, 3, 'r'], [13, 3, 'r'], [14, 3, 'r']];

  PX.CHARS = {
    Feline1: {
      cat: true, tail: true, body: 'dress', label: 'FELINE1', cn: '猫娘 Feline1', perk: '九命：4 颗心，每 25 秒回 1 颗 + 二段跳', perkEn: 'NINE LIVES', color: '#ff6fa6',
      pal: { o: '#4e2a48', h: '#fbeef5', H: '#d2a8c6', L: '#ffffff', i: '#ff8ab8', s: '#ffe6dc', S: '#f0c2ba', E: '#e8307e', w: '#ffffff', p: '#ffb0c4', m: '#c0506a',
        c: '#ffd6e8', C: '#eaa6c4', k: '#ffffff', a: '#ff5a9e', A: '#c0306a', l: '#ffffff', n: '#e2d0e4', b: '#b8487e', B: '#ff8ab8', t: '#fbeef5', T: '#d2a8c6', r: '#ff6fa6' }
    },
    C0: {
      cat: false, headset: true, body: 'hoodie', label: 'C0', cn: '程序 C0', perk: '超频：按 A 慢动作 + 穿透', perkEn: 'OVERCLOCK', color: '#4fe3ff',
      pal: { o: '#08060c', h: '#2e2534', H: '#1a141e', L: '#5a4a6e', s: '#f3d2c4', S: '#deb0a4', E: '#241c2c', w: '#ffffff', p: '#f4a0a8', m: '#9c4a5a',
        c: '#2c2638', C: '#1a1622', k: '#4a4260', a: '#4fe3ff', A: '#2a8aa8', l: '#1c1824', n: '#110e16', b: '#4fe3ff', B: '#ffffff', r: '#4fe3ff' }
    },
    X0: {
      cat: false, ribbon: true, body: 'blouse', label: 'X0', cn: '画师 X0', perk: '镜光护盾：12 秒充能 + 小磁铁', perkEn: 'MIRROR SHIELD', color: '#b48cff',
      pal: { o: '#1e0e16', h: '#5a3a44', H: '#3a2430', L: '#8a6070', s: '#f6dcd6', S: '#e2b8b0', E: '#9a6cff', w: '#ffffff', p: '#ff9fb0', m: '#a04a5a',
        c: '#f8eef2', C: '#d4bccc', k: '#ffffff', a: '#ff5f8f', A: '#c02a5a', d: '#2a1a2e', D: '#1a0e1c', l: '#3a2430', n: '#24141c', b: '#1a0a12', B: '#5a3a44', r: '#ff5f8f' }
    }
  };
  PX.ORDER = ['Feline1', 'C0', 'X0'];

  function put(rows, pts, outline) {
    pts.forEach(function (p) { if (rows[p[1]] && p[0] >= 0 && p[0] < 16) rows[p[1]][p[0]] = p[2]; });
    if (outline) pts.forEach(function (p) {
      [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (d) { var x = p[0] + d[0], y = p[1] + d[1]; if (rows[y] && x >= 0 && x < 16 && rows[y][x] === '.') rows[y][x] = 'o'; });
    });
  }
  function charRows(def, pose) {
    var rows = (def.cat ? TOP.cat : TOP.human).concat(HEAD, BODIES[def.body], LEGS[pose.legs]).map(function (r) { return r.split(''); });
    if (pose.blink) { rows[9] = 'ohHsssssssssshHo'.split(''); rows[10] = 'ohHsssoossooShHo'.split(''); }
    if (def.tail) put(rows, TAILS[pose.tail || 0], true);
    put(rows, ARMS[pose.arms], true);
    if (def.headset) put(rows, HEADSET, false);
    if (def.ribbon) put(rows, BOW, true);
    return rows.map(function (r) { return r.join(''); });
  }
  PX.buildChar = function (id) {
    var d = PX.CHARS[id], mk = function (pose) { return PX.fromRows(charRows(d, pose), d.pal); };
    var s = {
      stand: mk({ legs: 'stand', arms: 'side' }), blink: mk({ legs: 'stand', arms: 'side', blink: true }),
      run: [mk({ legs: 'r0', arms: 'back', tail: 0 }), mk({ legs: 'r1', arms: 'side', tail: 1 }), mk({ legs: 'r2', arms: 'fwd', tail: 0 }), mk({ legs: 'r1', arms: 'side', tail: 1 })],
      jump: mk({ legs: 'jump', arms: 'up', tail: 1 }), fall: mk({ legs: 'fall', arms: 'out', tail: 0 })
    };
    s.hurt = PX.tint(mk({ legs: 'fall', arms: 'up', blink: true }), 'rgba(255,80,110,.45)');
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
  /* enemies v2: painted on a grid with auto outline (see session notes) */
  var WOLF2 = [['ooo..........owowo....', 'Twwo.........oWwWwo...', 'Twwwo........owwwwo...', 'owwwwoooooooowwwwewo.o', '.owwwwLLLLLLLwwwwwwwon', '..oowwwwwwwwwwwwwwmWWo', '...owwwwwwwwwwwwWWWoo.', '...owwWWWWWWWWwoooo...', '....owWWWWWWWwo.......', '....oWogooogoWo.......', '...oWoogo.ogooWo......', '..ofo..ofofo..ofo.....', '...o....o.o....o......'], ['ooo..........owowo....', 'Twwo.........oWwWwo...', 'Twwwo........owwwwo...', 'owwwwoooooooowwwwewo.o', '.owwwwLLLLLLLwwwwwwwon', '..oowwwwwwwwwwwwwwmWWo', '...owwwwwwwwwwwwWWWoo.', '...owwWWWWWWWWwoooo...', '....owWWWWWWWwo.......', '.....oWogooWogo.......', '.....oWogooWogo.......', '.....ofofoofofo.......', '......o.o..o.o........']];
  var FOX2 = [['oooo.........owowo....', 'TTwwo........oWwWwo...', 'Twwwwo.......owwwwo...', 'Twwwwwooooooowwwwewo.o', 'owwwwwLLLLLLLwwwwwwwon', '.owwwwwwwwwwwwwwwwmkko', '..oowwwwwwwwwwwwkkWoo.', '...owwWWWWWWWkkoooo...', '....owWWWWWWWwo.......', '....oWogooogoWo.......', '...oWoogo.ogooWo......', '..ofo..ofofo..ofo.....', '...o....o.o....o......'], ['oooo.........owowo....', 'TTwwo........oWwWwo...', 'Twwwwo.......owwwwo...', 'Twwwwwooooooowwwwewo.o', 'owwwwwLLLLLLLwwwwwwwon', '.owwwwwwwwwwwwwwwwmkko', '..oowwwwwwwwwwwwkkWoo.', '...owwWWWWWWWkkoooo...', '....owWWWWWWWwo.......', '.....oWogooWogo.......', '.....oWogooWogo.......', '.....ofofoofofo.......', '......o.o..o.o........']];
  var CROW2 = [['........oBBBo.', '..ooo..oBBBo..', 'oobbbooBBBo...', 'ybebbBBBBoo..o', 'ybbbbbbbbbboob', 'ooobBBBBBBbbbo', '...obbbbbbbobb', '....ooooooo.oo', '..............', '..............'], ['..............', '..ooo.........', 'oobbbo........', 'ybebbbooooo..o', 'ybbbbbbbbbboob', 'ooobBBBBBBbbbo', '...obbBBBBbobb', '....oooBBBBooo', '.......ooBBo..', '.........oo...']];
  var BAT2 = [['oooo........oooo', 'BBBBooo..oooBBBB', 'BBBBBBboobBBBBBB', 'oWBBBBbbbbBBBBWo', '.ooWBBbeebBBWoo.', '...ooobbbbooo...', '......obbo......', '.......oo.......', '................', '................'], ['................', '......o..o......', '.....oboobo.....', '...ooobbbbooo...', '.ooBBBbeebBBBoo.', 'oBBBBBbbbbBBBBBo', 'BBBBBoobbooBBBBB', 'BBBoo..oo..ooBBB', 'ooo..........ooo', '................']];
  var WOLF2_PAL = { o: '#1c2848', w: '#f2f6ff', W: '#b6c6e6', L: '#ffffff', g: '#8a9cc8', f: '#3a4a72', T: '#c8d6f0', e: '#ff3a5a', n: '#1c2848', m: '#6a7aa8', k: '#ffffff' };
  var FOX2_PAL = { o: '#3a1408', w: '#ff8a3a', W: '#d8601e', L: '#ffb070', g: '#a84818', f: '#3a1408', T: '#ffffff', e: '#1a0804', n: '#1a0804', m: '#a84818', k: '#fff4e8' };
  var CROW2_PAL = { o: '#0a0612', b: '#2a2440', B: '#4a4268', y: '#ffb84f', e: '#ff4f7a' };
  var BAT2_PAL = { o: '#120a24', b: '#4a3a7a', B: '#6a5aa8', W: '#9a8ad8', e: '#ff4f7a' };
  PX.buildProps = function () {
    var P = {};
    P.wolf = WOLF2.map(function (r) { return PX.flip(PX.fromRows(r, WOLF2_PAL)); });
    P.fox = FOX2.map(function (r) { return PX.flip(PX.fromRows(r, FOX2_PAL)); });
    P.beetle = [PX.fromRows(BEETLE.top.concat(BEETLE.a), BEETLE_PAL), PX.fromRows(BEETLE.top.concat(BEETLE.b), BEETLE_PAL)].map(PX.flip);
    P.cone = PX.fromRows(CONE, CONE_PAL);
    var birdPal = { o: '#1b1430', e: '#ff4f7a', y: '#ffb84f' }, batPal = { o: '#d8ecff', e: '#2a5fd8', y: '#7fb8ff' };
    P.crow = CROW2.map(function (r) { return PX.fromRows(r, CROW2_PAL); });
    P.bat = BAT2.map(function (r) { return PX.fromRows(r, BAT2_PAL); });
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
    var SH = { o: '#9a5a12', y: '#ffd45e', Y: '#fff1a8', w: '#ffffff' };
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
