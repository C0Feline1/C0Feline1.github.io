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

  /* ---------- characters v3 (16x24, facing right): three people with their own silhouettes ----------
     C0 = programmer (spiky hair, glasses, headset, hoodie, jeans, sneakers)
     X0 = beautiful girl, the girlfriend (long flowing hair, ribbon, blouse + skirt, tights)
     Feline1 = catgirl (cat ears, bob cut, tail, paw gloves, pink dress)
     Sprites are painted from stamps, then outlined automatically. The hitbox lives in game.js (pbox) and does not depend on the art. */
  function grid() { var r = []; for (var y = 0; y < 24; y++) r.push('................'.split('')); return r; }
  function st(R, x, y, rows) {
    for (var j = 0; j < rows.length; j++) for (var i = 0; i < rows[j].length; i++) {
      var c = rows[j][i], X = x + i, Y = y + j;
      if (c === '.' || X < 0 || X > 15 || Y < 0 || Y > 23) continue;
      R[Y][X] = c === '_' ? '.' : c;
    }
  }
  function pts(R, x, y, list) { list.forEach(function (p) { var X = x + p[0], Y = y + p[1]; if (X >= 0 && X < 16 && Y >= 0 && Y < 24) R[Y][X] = p[2] === '_' ? '.' : p[2]; }); }
  function outline(R) {
    var add = [];
    for (var y = 0; y < 24; y++) for (var x = 0; x < 16; x++) {
      if (R[y][x] !== '.') continue;
      if ((x > 0 && R[y][x - 1] !== '.') || (x < 15 && R[y][x + 1] !== '.') || (y > 0 && R[y - 1][x] !== '.') || (y < 23 && R[y + 1][x] !== '.')) add.push([x, y]);
    }
    add.forEach(function (p) { R[p[1]][p[0]] = 'o'; });
  }
  /* eyes (relative to the face): open / blink / happy (^ ^) / glow (overclock) / wince */
  function eyes(R, x, y, kind, glow) {
    var a = x, b = x + 4;
    if (kind === 'blink') { pts(R, 0, 0, [[a, y + 1, 'o'], [a + 1, y + 1, 'o'], [b, y + 1, 'o'], [b + 1, y + 1, 'o']]); return; }
    if (kind === 'happy') { pts(R, 0, 0, [[a, y + 1, 'o'], [a + 1, y, 'o'], [b, y, 'o'], [b + 1, y + 1, 'o']]); return; }
    if (kind === 'wince') { pts(R, 0, 0, [[a, y, 'o'], [a + 1, y + 1, 'o'], [b + 1, y, 'o'], [b, y + 1, 'o']]); return; }
    var e = glow ? 'w' : 'E';
    pts(R, 0, 0, [[a, y, 'w'], [a + 1, y, 'o'], [a, y + 1, e], [a + 1, y + 1, e], [b, y, 'w'], [b + 1, y, 'o'], [b, y + 1, e], [b + 1, y + 1, e]]);
  }

  /* ---- legs: rows 19..22, per person ---- */
  var LEG = {
    C0: { /* jeans + chunky sneakers, long strides */
      stand: ['.....ln.ln......', '.....ln.ln......', '.....ln.ln......', '....bbBbbbB.....'],
      r0: ['....ln...ln.....', '...ln.....ln....', '..ln.......ln...', '.bbB.......bbB..'],
      r1: ['......lnln......', '......ln.ln.....', '......ln..bbB...', '.....bbB........'],
      r2: ['.....ln.ln......', '....ln...ln.....', '...bbB....ln....', '..........bbB...'],
      r3: ['......lnln......', '.....ln.ln......', '...bbB..ln......', '........bbB.....'],
      jump: ['.....ln.ln......', '......ln.lnbB...', '......lnbB......', '......bB........'],
      fall: ['....ln...ln.....', '...ln.....ln....', '..bbB......bbB..', '................'],
      sit: ['.....lnnnnln....', '.........ln.....', '.........ln.....', '........bbB.....']
    },
    X0: { /* dark tights + slim boots, shorter graceful steps */
      stand: ['......ln.l......', '......ln.l......', '......ln.l......', '.....bbB.bB.....'],
      r0: ['.....ln..ln.....', '....ln....ln....', '...ln......l....', '..bB.......bbB..'],
      r1: ['......ln.l......', '......ln..l.....', '......ln..bB....', '.....bbB........'],
      r2: ['......ln.l......', '.....ln...l.....', '....bB....l.....', '..........bbB...'],
      r3: ['......lnl.......', '......l.ln......', '....bB..ln......', '........bbB.....'],
      jump: ['......ln.l......', '.......ln.lbB...', '.......lbB......', '.......bB.......'],
      fall: ['.....ln...l.....', '....ln.....l....', '...bB.......bB..', '................'],
      sit: ['......lnnnl.....', '.........l......', '.........l......', '........bbB.....']
    },
    Feline1: { /* white stockings + pink shoes, bouncy hops */
      stand: ['.....ln..ln.....', '.....ln..ln.....', '.....ln..ln.....', '....bbB..bbB....'],
      r0: ['.....ln..ln.....', '....ln....ln....', '...bbB.....ln...', '...........bbB..'],
      r1: ['......ln.ln.....', '......lnln......', '......bbB.......', '................'],
      r2: ['.....ln..ln.....', '....ln....ln....', '...ln.....bbB...', '..bbB...........'],
      r3: ['......lnln......', '......lnln......', '......ln.ln.....', '.....bbB.bbB....'],
      jump: ['.....ln.ln......', '......lnlnbB....', '......lnbB......', '......bB........'],
      fall: ['....ln....ln....', '...ln......ln...', '...bB......bB...', '................'],
      sit: ['.....lnnnnln....', '.........ln.....', '.........ln.....', '........bbB.....']
    }
  };

  /* ---- bodies: 6 rows from y=13 ---- */
  var BODY = {
    C0: ['..CC.ss.........', '.CCcckkkcc......', '.CCcckakccC.....', '..cccckcccC.....', '..cckkkkkcC.....', '..AaaaaaaaA.....'],
    X0: ['.....ss.........', '....kkaAk.......', '...ckcaAacC.....', '...cccccccC.....', '...ddddddddD....', '..dddddddddD....'],
    Feline1: ['.....syys.......', '....kkyykk......', '....cckkcC......', '...ccccccCC.....', '..cccccccccC....', '..CkCkCkCkCC....']
  };
  /* skirt hems for X0: one row below the body, sways when running */
  var X0HEM = ['..dDdDdDdDdD....', '...dDdDdDdDdD...', '.dDdDdDdDdD.....'];

  /* ---- heads: rows 0..12 ---- */
  var HEADS = {
    C0: [
      '................',
      '....h..h..h.....',
      '..hhhhhhhhhhh.h.',
      '.hhhLhhhhhhhhhh.',
      '.hhLhhhhhhhhhhh.',
      '.hLhhhhhhhhhhhh.',
      '.hhhhhhhhhhhhhh.',
      '.hHhhhhhhhhhhhh.',
      '.hHhhhshhhshhhs.',
      '.hHhsssssssssss.',
      '.hHhsssssssssss.',
      '..HhsssssssssS..',
      '...hSsssssssS...'
    ],
    X0: [
      '................',
      '................',
      '....hhhhhhhh....',
      '..hhLLhhhhhhhh..',
      '.hhLhhhhhhhhhhh.',
      '.hLhhhhhhhhhhhh.',
      '.hhhhhhhhhhhhhh.',
      '.hhhhhhhhhhhhhh.',
      '.hhHhhhhhhhhhhh.',
      '.hhHsshsssssshh.',
      '.hhHssssssssshh.',
      '.hhHssssssssshh.',
      '.hhh.Ssssssssh..'
    ],
    Feline1: [
      '................',
      '...h.......h....',
      '..hih.....hih...',
      '..hiih...hiih...',
      '..hhhhhhhhhhhh..',
      '.hLLhhhhhhhhhhh.',
      '.hLhhhhhhhhhhhh.',
      '.hhhhhhhhhhhhhh.',
      '.hhHhhhshhhhsHh.',
      '.hHhhsssssssshh.',
      '.hHhsssssssssHh.',
      '.hHhsssssssssH..',
      '..H..Sssssssss..'
    ]
  };

  /* hair flow behind X0 (rows from 8): 0 = still, 1 / 2 = streaming back while running, 3 = lifted (falling) */
  var X0HAIR = [
    ['.hhh', 'hhhH', 'hhhH', 'hhHH', 'hhHH', 'hhHH', 'hhH.', 'hhH.', 'hHH.', '.hH.', '..H.'],
    ['hhhh', 'hhhH', 'hhHH', 'hhHH', 'hHH.', 'hHH.', 'HH..', 'H...', '....', '....', '....'],
    ['.hhh', 'hhhH', 'hhhH', 'hhHH', 'hHHH', 'hHH.', '.HH.', '.H..', '....', '....', '....'],
    ['hhh.', 'hhH.', 'hH..', 'H...', '....', '....', '....', '....', '....', '....', '....']
  ];
  var X0HAIRX = [[0, 8], [0, 7], [0, 8], [0, 5]];
  /* Feline1 tail: 4 phases (points relative to the hip at x=2, y=18) */
  var TAIL = [
    [[0, 0, 't'], [-1, 0, 't'], [-2, -1, 't'], [-2, -2, 't'], [-2, -3, 't'], [-1, -4, 'T']],
    [[0, 0, 't'], [-1, 1, 't'], [-2, 1, 't'], [-3, 0, 't'], [-3, -1, 't'], [-2, -2, 'T']],
    [[0, 0, 't'], [-1, 0, 't'], [-2, 0, 't'], [-3, -1, 't'], [-3, -2, 'T'], [-2, -3, 'T']],
    [[0, 0, 't'], [-1, -1, 't'], [-1, -2, 't'], [-1, -3, 't'], [0, -4, 't'], [1, -5, 'T']],
    [[0, 0, 't'], [-1, 0, 't'], [-1, -1, 't'], [-2, -1, 't'], [-1, -2, 't'], [-2, -2, 't'], [-1, -3, 't'], [-2, -3, 'T'], [-2, -4, 't'], [-1, -4, 'T'], [-1, -5, 'T'], [-3, -2, 'T']]
  ];

  /* arms: points relative to the body's top-left (x=0, y=13+dy) */
  var ARM = {
    side: [[3, 2, 'C'], [3, 3, 'C'], [3, 4, 's'], [10, 2, 'c'], [11, 3, 'c'], [11, 4, 's']],
    fwd: [[3, 2, 'C'], [2, 3, 'C'], [1, 4, 's'], [10, 2, 'c'], [11, 2, 'c'], [12, 2, 's']],
    back: [[3, 2, 'C'], [2, 2, 'C'], [1, 2, 's'], [10, 2, 'c'], [11, 3, 'c'], [12, 4, 's']],
    pump: [[2, 2, 'C'], [1, 3, 'C'], [1, 4, 's'], [10, 1, 'c'], [11, 1, 'c'], [12, 0, 's']],
    up: [[3, 1, 'C'], [2, 0, 'C'], [1, -1, 's'], [10, 1, 'c'], [11, 0, 'c'], [12, -1, 's']],
    out: [[3, 2, 'C'], [2, 2, 'C'], [1, 2, 's'], [10, 2, 'c'], [11, 2, 'c'], [12, 2, 's']],
    paw: [[3, 2, 'C'], [3, 3, 'C'], [4, 3, 'k'], [10, 2, 'c'], [11, 2, 'c'], [11, 1, 'k'], [12, 1, 'k']],
    pawlick: [[3, 2, 'C'], [3, 3, 'C'], [4, 3, 'k'], [10, 1, 'c'], [11, 0, 'c'], [11, -1, 'k'], [12, -1, 'k']],
    mug: [[3, 2, 'C'], [3, 3, 'C'], [3, 4, 's'], [10, 1, 'c'], [11, 0, 's'], [12, -1, 'b'], [13, -1, 'b'], [12, 0, 'b'], [13, 0, 'b'], [14, -1, 'b'], [12, -2, 'n']],
    glasses: [[3, 2, 'C'], [3, 3, 'C'], [3, 4, 's'], [10, 1, 'c'], [11, 0, 'c'], [12, -2, 's']],
    tuck: [[3, 2, 'C'], [3, 3, 'C'], [3, 4, 's'], [10, 1, 'c'], [11, 0, 'c'], [11, -2, 's']],
    brush: [[3, 2, 'C'], [3, 3, 'C'], [3, 4, 's'], [10, 2, 'c'], [11, 2, 'c'], [12, 1, 's'], [13, 0, 'r'], [14, -1, 'r'], [14, -2, 'a']],
    type1: [[3, 2, 'C'], [3, 3, 'C'], [3, 4, 's'], [10, 2, 'c'], [11, 3, 'c'], [11, 4, 's']],
    type2: [[3, 2, 'C'], [3, 3, 'C'], [3, 4, 's'], [10, 2, 'c'], [11, 3, 'c'], [12, 4, 's']],
    swim1: [[3, 2, 'C'], [2, 1, 'C'], [1, 0, 's'], [10, 2, 'c'], [11, 1, 'c'], [12, 0, 's']],
    swim2: [[3, 2, 'C'], [2, 3, 'C'], [1, 3, 's'], [10, 3, 'c'], [11, 4, 'c'], [12, 4, 's']],
    cheer: [[3, 0, 'C'], [2, -1, 'C'], [2, -2, 's'], [10, 0, 'c'], [11, -1, 'c'], [12, -2, 's']],
    climb: [[3, 1, 'C'], [3, 0, 'C'], [3, -1, 's'], [10, 1, 'c'], [11, 0, 'c'], [12, -1, 's']],
    climb2: [[3, 2, 'C'], [3, 3, 'C'], [2, 3, 's'], [10, 0, 'c'], [11, -1, 'c'], [12, -2, 's']]
  };

  function paint(id, P) {
    var R = grid(), dy = P.dy || 0, lx = P.lean || 0, hy = dy + (P.hdy || 0);
    /* back layer */
    if (id === 'X0') { var hp = P.hair || 0, hx = X0HAIRX[hp]; st(R, hx[0] + lx, hx[1] + hy, X0HAIR[hp]); }
    if (id === 'Feline1') pts(R, 2, 18 + dy, TAIL[P.tail || 0]);
    st(R, 0, 19, LEG[id][P.legs]);
    if (P.legs !== 'sit') st(R, 0, 13 + dy, BODY[id]);
    else st(R, 0, 13 + dy, BODY[id].slice(0, 5));
    if (id === 'X0' && P.legs !== 'sit') st(R, 0, 19 + dy, [X0HEM[P.hem || 0]]);
        st(R, lx, hy, HEADS[id]);
    /* face */
    var fx = 6 + lx, fy = 9 + hy;
    if (id === 'C0') {
      /* glasses frame + lenses */
      var gl = P.glow ? 'a' : 'g';
      pts(R, 0, 0, [[fx - 1, fy, gl], [fx, fy, gl], [fx + 1, fy, gl], [fx + 2, fy, gl], [fx + 3, fy, gl], [fx + 4, fy, gl], [fx + 5, fy, gl], [fx + 6, fy, gl],
        [fx - 1, fy + 1, gl], [fx + 3, fy + 1, gl], [fx + 6, fy + 1, gl], [fx, fy + 2, gl], [fx + 1, fy + 2, gl], [fx + 4, fy + 2, gl], [fx + 5, fy + 2, gl], [fx - 2, fy, gl]]);
      if (P.eyes === 'blink') pts(R, 0, 0, [[fx, fy + 1, 'o'], [fx + 1, fy + 1, 'o'], [fx + 4, fy + 1, 'o'], [fx + 5, fy + 1, 'o']]);
      else if (P.eyes === 'wince') pts(R, 0, 0, [[fx, fy + 1, 'o'], [fx + 5, fy + 1, 'o'], [fx + 1, fy + 1, 's'], [fx + 4, fy + 1, 's']]);
      else if (P.glow) pts(R, 0, 0, [[fx, fy + 1, 'a'], [fx + 1, fy + 1, 'a'], [fx + 4, fy + 1, 'a'], [fx + 5, fy + 1, 'a']]);
      else pts(R, 0, 0, [[fx, fy + 1, 'L'], [fx + 1, fy + 1, 'E'], [fx + 4, fy + 1, 'L'], [fx + 5, fy + 1, 'E']]);
      pts(R, 0, 0, [[fx + 3, fy + 3, P.mouth === 'open' ? 'm' : 'S'], [fx + 4, fy + 3, P.mouth === 'open' ? 'm' : 's']]);
      /* headset band over the hair + ear cup + mic */
      pts(R, lx, hy, [[3, 7, 'k'], [3, 6, 'k'], [3, 5, 'k'], [4, 4, 'k'], [4, 3, 'k'], [5, 2, 'k'], [6, 1, 'k'], [2, 8, 'k'], [3, 8, 'k'], [2, 9, 'k'], [3, 9, 'r'], [2, 10, 'C'], [3, 10, 'k'], [4, 11, 'k'], [5, 12, 'k'], [6, 12, 'k'], [7, 12, 'r']]);
    } else {
      eyes(R, fx + (id === 'X0' ? 0 : 1), fy, P.eyes || 'open', false);
      var mx = fx + (id === 'X0' ? 3 : 4), mo = P.mouth === 'open' ? 'm' : (id === 'X0' ? 'a' : 'm');
      if (id === 'Feline1' && P.mouth !== 'open') pts(R, 0, 0, [[mx - 1, fy + 2, 'm'], [mx + 1, fy + 2, 'm']]); /* cat mouth w */
      else pts(R, 0, 0, [[mx, fy + 2, mo]]);
      pts(R, 0, 0, [[fx - 1, fy + 2, 'p'], [fx + 6 + (id === 'X0' ? 0 : 1), fy + 2, 'p']]);
      if (id === 'X0') { /* ribbon + side lock framing the face */
        pts(R, 0, 0, [[fx + 1, fy - 1, 'o'], [fx + 5, fy - 1, 'o'], [fx + 2, fy, 'o']]);
        pts(R, lx, hy, [[12, 13, 'h'], [13, 13, 'H'], [12, 14, 'H']]);
        pts(R, lx, hy, [[10, 1, 'r'], [11, 1, 'r'], [13, 1, 'r'], [14, 1, 'r'], [10, 2, 'r'], [11, 2, 'A'], [12, 2, 'A'], [13, 2, 'A'], [14, 2, 'r'], [10, 3, 'r'], [11, 3, 'r'], [13, 3, 'r'], [14, 3, 'r']]);
      }
      if (id === 'Feline1' && P.ear === 1) pts(R, lx, hy, [[10, 2, '_'], [11, 1, '_'], [12, 2, 'h'], [11, 2, 'h'], [10, 3, 'h'], [11, 3, 'i'], [12, 3, 'h'], [13, 3, 'h']]);
    }
    pts(R, lx * 0, 13 + dy, ARM[P.arms || 'side']);
    if (P.laptop) pts(R, 0, 13 + dy, [[13, 0, 'k'], [13, 1, 'k'], [13, 2, 'a'], [13, 3, 'k'], [14, 0, 'k'], [14, 1, 'k'], [14, 2, 'k'], [14, 3, 'k'], [10, 4, 'g'], [11, 4, 'g'], [12, 4, 'g'], [13, 4, 'g'], [14, 4, 'g']]);
    if (id === 'Feline1' && P.ear === 2) pts(R, lx, hy, [[3, 1, '_'], [2, 2, '_'], [3, 2, '_'], [4, 2, '_'], [2, 3, '_'], [3, 3, '_'], [4, 3, '_'], [5, 3, '_'], [11, 1, '_'], [10, 2, '_'], [11, 2, '_'], [12, 2, '_'], [9, 3, '_'], [10, 3, '_'], [11, 3, '_'], [12, 3, '_'], [1, 4, 'i'], [0, 5, 'h'], [1, 5, 'h'], [13, 4, 'i'], [14, 5, 'h'], [14, 4, 'h']]); /* ears droop */
    if (P.extra) P.extra(R, dy);
    outline(R);
    return R.map(function (r) { return r.join(''); });
  }

  PX.CHARS = {
    Feline1: {
      cat: true, tail: true, label: 'FELINE1', cn: '猫娘 Feline1', perk: '九命：4 颗心，每 25 秒回 1 颗 + 二段跳', perkEn: 'NINE LIVES', color: '#ff6fa6',
      pal: { o: '#4e2a48', h: '#fbeef5', H: '#d2a8c6', L: '#ffffff', i: '#ff8ab8', s: '#ffe6dc', S: '#f0c2ba', E: '#e8307e', w: '#ffffff', p: '#ffb0c4', m: '#c0506a',
        c: '#ffd6e8', C: '#eaa6c4', k: '#ffffff', a: '#ff5a9e', A: '#c0306a', l: '#ffffff', n: '#e2d0e4', b: '#b8487e', B: '#ff8ab8', t: '#fbeef5', T: '#d2a8c6', r: '#ff6fa6', y: '#ffd45e', g: '#ffffff' }
    },
    C0: {
      cat: false, headset: true, label: 'C0', cn: '程序 C0', perk: '超频：按 A 慢动作 + 穿透', perkEn: 'OVERCLOCK', color: '#4fe3ff',
      pal: { o: '#08060c', h: '#2e2534', H: '#1a141e', L: '#5a4a6e', s: '#f3d2c4', S: '#deb0a4', E: '#241c2c', w: '#ffffff', p: '#f4a0a8', m: '#9c4a5a',
        c: '#2c2638', C: '#1a1622', k: '#4a4260', a: '#4fe3ff', A: '#2a8aa8', l: '#3a5a8a', n: '#26406a', b: '#e8e8f0', B: '#4fe3ff', r: '#4fe3ff', g: '#aab6d4' }
    },
    X0: {
      cat: false, ribbon: true, label: 'X0', cn: '美少女 X0', perk: '镜光护盾：12 秒充能 + 小磁铁', perkEn: 'MIRROR SHIELD', color: '#b48cff',
      pal: { o: '#1e0e16', h: '#5a3a44', H: '#3a2430', L: '#8a6070', s: '#f6dcd6', S: '#e2b8b0', E: '#9a6cff', w: '#ffffff', p: '#ff9fb0', m: '#a04a5a',
        c: '#f8eef2', C: '#d4bccc', k: '#ffffff', a: '#ff5f8f', A: '#c02a5a', d: '#2a1a2e', D: '#1a0e1c', l: '#3a2430', n: '#24141c', b: '#1a0a12', B: '#5a3a44', r: '#ff5f8f', g: '#ffd45e' }
    }
  };
  PX.ORDER = ['Feline1', 'C0', 'X0'];

  /* per-person animation sets */
  var ANIM = {
    C0: {
      stand: { legs: 'stand', arms: 'side' },
      run: [{ legs: 'r0', arms: 'pump', lean: 1, dy: 0 }, { legs: 'r1', arms: 'side', lean: 1, dy: 1 }, { legs: 'r2', arms: 'back', lean: 1, dy: 0 }, { legs: 'r3', arms: 'side', lean: 1, dy: 1 }],
      jump: { legs: 'jump', arms: 'up', mouth: 'open' }, fall: { legs: 'fall', arms: 'out' },
      idle: [{ legs: 'stand', arms: 'type1', laptop: 1 }, { legs: 'stand', arms: 'type2', laptop: 1 }, { legs: 'stand', arms: 'type1', laptop: 1, eyes: 'blink' }, { legs: 'stand', arms: 'type2', laptop: 1 },
        { legs: 'stand', arms: 'mug', eyes: 'blink' }, { legs: 'stand', arms: 'mug' }, { legs: 'stand', arms: 'glasses' }, { legs: 'stand', arms: 'side' }],
      cheer: { legs: 'stand', arms: 'cheer', eyes: 'open', mouth: 'open' }, skill: { legs: 'r1', arms: 'pump', lean: 1, glow: true }
    },
    X0: {
      stand: { legs: 'stand', arms: 'side', hair: 0, hem: 0 },
      run: [{ legs: 'r0', arms: 'fwd', hair: 1, hem: 1, dy: 0 }, { legs: 'r1', arms: 'side', hair: 2, hem: 0, dy: 1 }, { legs: 'r2', arms: 'back', hair: 1, hem: 2, dy: 0 }, { legs: 'r3', arms: 'side', hair: 2, hem: 0, dy: 1 }],
      jump: { legs: 'jump', arms: 'up', hair: 3, hem: 1 }, fall: { legs: 'fall', arms: 'out', hair: 3, hem: 2 },
      idle: [{ legs: 'stand', arms: 'tuck', hair: 0 }, { legs: 'stand', arms: 'tuck', hair: 2, eyes: 'happy' }, { legs: 'stand', arms: 'brush', hair: 2 }, { legs: 'stand', arms: 'brush', hair: 0, eyes: 'blink' }],
      cheer: { legs: 'stand', arms: 'cheer', hair: 1, eyes: 'happy', mouth: 'open' }, skill: { legs: 'stand', arms: 'out', hair: 3, eyes: 'happy' }
    },
    Feline1: {
      stand: { legs: 'stand', arms: 'paw', tail: 0 },
      run: [{ legs: 'r0', arms: 'paw', tail: 0, dy: 0 }, { legs: 'r1', arms: 'paw', tail: 1, dy: 1, hdy: 0 }, { legs: 'r2', arms: 'paw', tail: 2, dy: 0, ear: 1 }, { legs: 'r3', arms: 'paw', tail: 1, dy: 1 }],
      jump: { legs: 'jump', arms: 'up', tail: 3, mouth: 'open' }, fall: { legs: 'fall', arms: 'out', tail: 2 },
      idle: [{ legs: 'stand', arms: 'paw', tail: 0 }, { legs: 'stand', arms: 'pawlick', tail: 1, eyes: 'happy' }, { legs: 'stand', arms: 'pawlick', tail: 2, eyes: 'happy', ear: 1 }, { legs: 'stand', arms: 'paw', tail: 3 }],
      cheer: { legs: 'stand', arms: 'cheer', tail: 3, eyes: 'happy', mouth: 'open' }, skill: { legs: 'jump', arms: 'up', tail: 3, eyes: 'happy' },
      land: { legs: 'stand', arms: 'paw', tail: 4, eyes: 'happy' }, hurtP: { ear: 2, tail: 4 }
    }
  };

  /* slide: a low pose in the bottom 10 rows, matching the 12x9 sliding hitbox */
  var SLIDE = {
    /* C0: feet-first baseball slide, leaning back on one hand */
    C0: ['..h.h.h.........', '.hhhhhhh........', '.hhhhhhhh.......', '.rgggggggg......', '.rksLEsLEs......', '..kssssSgggg....', '..cccccccgggknb.', '.sCcckcccllnnbbB', '.s.AaaaaA.......'],
    /* X0: knee slide, torso upright, long hair streaming back, ribbon */
    X0: ['.........rAr....', '...hhhhhhhh.....', '.hhhhhhhhhhh....', 'hhhhhhsoEsoE....', 'hhHhhhssssss....', '.hHH.ccaAcs.....', '..H.cccccc......', '...ddddddddlllbB', '..dddddddddnnbbB'],
    /* Feline1: low crouch slide on one knee, one paw skimming the ground, tail streaming back */
    Feline1: ['.....h...h......', '....hih.hih.....', '...hhhhhhhhh....', 't..hLhhhssEsE...', 't..hhhhhsssss...', '.t..ccyykss.....', '..tcccccckkk....', '...lncccccln.kk.', '..bbBnn.ClnnbB..']
  };
  function slideRows(id) {
    var R = grid(); st(R, 0, 14, SLIDE[id]); outline(R);
    return R.map(function (r) { return r.join(''); });
  }

  PX.buildChar = function (id) {
    var d = PX.CHARS[id], A = ANIM[id], mk = function (pose) { return PX.fromRows(paint(id, pose), d.pal); };
    var mix = function (o, add) { var r = {}, k; for (k in o) r[k] = o[k]; for (k in add) r[k] = add[k]; return r; };
    var s = {
      stand: mk(A.stand), blink: mk(mix(A.stand, { eyes: 'blink' })),
      run: A.run.map(mk), jump: mk(A.jump), fall: mk(A.fall),
      idle: A.idle.map(mk), cheer: mk(A.cheer), skill: mk(A.skill),
      climb: [mk({ legs: 'jump', arms: 'climb', tail: 3, hair: 0 }), mk({ legs: 'fall', arms: 'climb2', tail: 2, hair: 3 })],
      slide: PX.fromRows(slideRows(id), d.pal)
    };
    s.glow = id === 'C0' ? A.run.map(function (p) { return mk(mix(p, { glow: true })); }) : null; /* overclock: glowing glasses */
    s.swim = [mk(mix(A.fall, { arms: 'swim1', legs: 'jump', hair: 1, tail: 2 })), mk(mix(A.fall, { arms: 'swim2', legs: 'fall', hair: 2, tail: 3 }))];
    s.ride = mk(mix(A.stand, { arms: 'out', hair: 1, hem: 1, tail: 2 }));
    s.jet = mk(mix(A.jump, { arms: 'fwd', hair: 1, tail: 2 }));
    s.land = A.land ? mk(A.land) : null;
    s.hurt = PX.tint(mk(mix(mix(A.fall, { arms: 'up', eyes: 'wince', mouth: 'open' }), A.hurtP || {})), 'rgba(255,80,110,.45)');
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
