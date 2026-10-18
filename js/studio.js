(function () {
  'use strict';

  var SW = 320, SH = 180, FY = 128, GROUND_Y = 134, FEET_Y = 158;
  var FRIDGE = { x: 282, y: 137, w: 24, h: 38 };
  var view = document.getElementById('studio');
  var screen = view.getContext('2d');
  var scene = PX.make(SW, SH), g = scene.getContext('2d');
  var props = PX.buildProps(), sprites = {}, leftRun = {}, leftCheer = {};
  var random = Math.random;
  PX.ORDER.forEach(function (id) {
    sprites[id] = PX.buildChar(id);
    leftRun[id] = sprites[id].run.map(PX.flip);
    leftCheer[id] = PX.flip(sprites[id].cheer);
  });

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
  var studioCat = buildStudioCat();
  var studioCatLeft = { walk: studioCat.walk.map(PX.flip), idle: studioCat.idle.map(PX.flip), sleep: PX.flip(studioCat.sleep) };

  function clockText() {
    var d = new Date();
    return String(d.getHours()).padStart(2, '0') + ':' +
      String(d.getMinutes()).padStart(2, '0') + ':' +
      String(d.getSeconds()).padStart(2, '0');
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

  var desks = [
    { id: 'C0', x: 22, role: 'PROGRAMMER', screen: '#4fe3ff' },
    { id: 'X0', x: 112, role: 'ARTIST', screen: '#b48cff' },
    { id: 'Feline1', x: 202, role: 'MASCOT', screen: '#ff6fa6' }
  ];
  var actors = {};
  desks.forEach(function (d) { actors[d.id] = { id: d.id, home: d.x + 8, x: d.x + 8, target: d.x + 8, arrived: false }; });
  var events = [
    { ids: ['C0'], action: 'candy', goals: { C0: 258 }, duration: 64 },
    { ids: ['X0'], action: 'paint', goals: { X0: 126 }, duration: 78 },
    { ids: ['Feline1'], action: 'cat', goals: { Feline1: 151 }, duration: 76 },
    { ids: ['C0'], action: 'workout', goals: { C0: 88 }, duration: 82 },
    { ids: ['C0', 'X0'], action: 'highfive', goals: { C0: 128, X0: 151 }, duration: 64 },
    { ids: ['C0'], action: 'sword', goals: { C0: 218 }, duration: 78 },
    { ids: ['X0'], action: 'bed', goals: { X0: 35 }, duration: 86 },
    { ids: ['Feline1'], action: 'candy', goals: { Feline1: 258 }, duration: 62 },
    { ids: ['X0', 'Feline1'], action: 'catart', goals: { X0: 126, Feline1: 151 }, duration: 84 },
    { ids: ['C0', 'X0', 'Feline1'], action: 'selfie', goals: { C0: 112, X0: 134, Feline1: 156 }, duration: 90 }
  ];
  var current = null, eventIndex = 0, nextEventAt = 95, tk = 0, lastFrame = 0;
  var snow = [], steam = [], codeLines = [];
  for (var sn = 0; sn < 30; sn++) snow.push([random() * 60, random() * 54, 0.2 + random() * 0.4]);
  desks.forEach(function () {
    var a = [];
    for (var i = 0; i < 8; i++) a.push([Math.floor(random() * 4), 4 + Math.floor(random() * 14)]);
    codeLines.push(a);
  });
  var artProgress = 0;
  var cat = { x: 181, target: 200, mode: 'sleep', next: 250, timer: 0 };

  function startEvent() {
    var plan = events[eventIndex % events.length]; eventIndex++;
    var members = plan.ids.map(function (id) {
      var p = actors[id]; p.x = p.home; p.target = plan.goals[id]; p.arrived = false; return p;
    });
    current = { plan: plan, members: members, phase: 'stand', frame: 0 };
  }
  function updateEvent() {
    if (!current) {
      if (tk >= nextEventAt) startEvent();
      return;
    }
    current.frame++;
    if (current.phase === 'stand' && current.frame >= 12) { current.phase = 'out'; current.frame = 0; return; }
    if (current.phase === 'out' || current.phase === 'back') {
      var allArrived = true;
      current.members.forEach(function (p) {
        if (p.arrived) return;
        var dir = p.target > p.x ? 1 : -1, speed = p.id === 'Feline1' ? 1.9 : (p.id === 'C0' ? 1.75 : 1.65);
        p.x += dir * speed;
        if (Math.abs(p.target - p.x) <= speed) { p.x = p.target; p.arrived = true; }
        else allArrived = false;
      });
      if (allArrived) {
        current.frame = 0;
        if (current.phase === 'out') current.phase = 'interact';
        else current.phase = 'sit';
      }
      return;
    }
    if (current.phase === 'interact') {
      if (current.plan.action === 'paint' || current.plan.action === 'catart') artProgress = Math.min(6, Math.floor(current.frame / 12) + 1);
      if (current.frame >= current.plan.duration) {
        current.phase = 'back'; current.frame = 0;
        current.members.forEach(function (p) { p.target = p.home; p.arrived = false; });
      }
      return;
    }
    if (current.phase === 'sit' && current.frame >= 12) {
      current.members.forEach(function (p) { p.x = p.home; p.target = p.home; });
      current = null; nextEventAt = tk + 125;
    }
  }
  function updateCat() {
    if (current && current.phase === 'interact' && ['cat', 'catart', 'selfie'].indexOf(current.plan.action) >= 0) return;
    cat.timer++;
    if (cat.mode === 'sleep' && tk >= cat.next) {
      cat.mode = 'walk'; cat.target = cat.x < 190 ? 199 : 181; cat.timer = 0;
    } else if (cat.mode === 'walk') {
      cat.x += cat.target > cat.x ? 0.42 : -0.42;
      if (Math.abs(cat.target - cat.x) < 0.5) { cat.x = cat.target; cat.mode = 'pause'; cat.timer = 0; }
    } else if (cat.mode === 'pause' && cat.timer > 28) {
      cat.mode = 'sleep'; cat.next = tk + 260; cat.timer = 0;
    }
  }

  function drawBubble(text, center, y) {
    var w = Math.min(58, PX.textWidth(text) + 6);
    var bx = Math.max(2, Math.min(SW - w - 2, Math.round(center - w / 2)));
    var by = Math.max(7, Math.min(FY - 13, y));
    g.fillStyle = '#fff'; g.fillRect(bx, by, w, 9);
    g.fillRect(Math.max(bx + 2, Math.min(bx + w - 4, Math.round(center))), by + 9, 2, 2);
    PX.text(g, text, bx + 3, by + 2, '#1a1030');
  }
  function drawDeskCharacters() {
    desks.forEach(function (d, i) {
      var p = actors[d.id], away = current && current.members.indexOf(p) >= 0;
      if (away) return;
      var s = sprites[d.id], typing = Math.floor((tk + i * 7) / 9) % 2;
      var head = (tk + i * 40) % 220 < 6 ? s.blink : s.stand, bob = typing && i !== 2 ? 1 : 0;
      if (d.id === 'Feline1' && Math.floor(tk / 75) % 4 === 3) bob = -Math.abs(Math.round(Math.sin(tk * 0.12) * 2));
      g.drawImage(head, 0, 0, 16, 19, d.x + 8, 93 + bob, 16, 19);
    });
  }
  function drawDesks() {
    desks.forEach(function (d, i) {
      var x = d.x, away = current && current.members.indexOf(actors[d.id]) >= 0;
      var typing = !away && Math.floor((tk + i * 7) / 9) % 2;
      g.fillStyle = '#1a1226'; g.fillRect(x + 2, 92, 4, 24); g.fillRect(x + 2, 114, 18, 3); g.fillRect(x + 10, 117, 2, 10); g.fillRect(x + 4, 126, 14, 2);
      g.fillStyle = '#5a3a52'; g.fillRect(x, 111, 70, 3); g.fillStyle = '#3a2438'; g.fillRect(x, 114, 70, 2); g.fillRect(x + 2, 116, 3, FY - 116); g.fillRect(x + 65, 116, 3, FY - 116);
      g.fillStyle = '#0a0812'; g.fillRect(x + 26, 109, 16, 2); g.fillStyle = PX.CHARS[d.id].pal.s;
      g.fillRect(x + 24 + typing * 2, 108, 3, 2); g.fillRect(x + 33 - typing * 2, 108, 3, 2);
      var mx = x + 38, my = 82;
      g.fillStyle = '#0a0812'; g.fillRect(mx, my, 30, 22); g.fillRect(mx + 13, my + 22, 4, 5); g.fillRect(mx + 9, my + 27, 12, 2);
      g.fillStyle = '#0d1424'; g.fillRect(mx + 1, my + 1, 28, 20);
      if (away) {
        // A worker's monitor and typing animation go idle while they are away.
        PX.text(g, 'IDLE', mx + 7, my + 9, '#657089', '#0d1424');
      } else {
        var lines = codeLines[i], off = Math.floor(tk / 25) % 8;
        for (var ln = 0; ln < 6; ln++) {
          var L = lines[(ln + off) % 8];
          g.fillStyle = ['#4a5a7a', d.screen, '#ffd45e', '#5dff8f'][L[0]];
          if (d.id === 'X0') {
            g.fillStyle = ['#ff9fc4', '#b48cff', '#ffd45e', '#4fe3ff'][(ln + off) % 4];
            g.fillRect(mx + 3 + (ln % 3) * 8, my + 3 + Math.floor(ln / 3) * 8, 7, 7); continue;
          }
          if (d.id === 'Feline1') {
            g.drawImage(sprites.Feline1.run[Math.floor(tk / 5) % 4], 0, 0, 16, 24, mx + 9, my + 1, 12, 18);
            g.fillStyle = '#7fd06a'; g.fillRect(mx + 1, my + 18, 28, 3); break;
          }
          g.fillRect(mx + 3 + L[0] * 2, my + 3 + ln * 3, L[1], 1);
        }
        if (d.id === 'C0' && tk % 24 < 12) { g.fillStyle = '#fff'; g.fillRect(mx + 4, my + 18, 3, 1); }
      }
      var lab = (d.id === 'Feline1' ? 'F1' : d.id) + ' ' + d.role;
      var labelW = Math.min(56, PX.textWidth(lab) + 6), labelX = x + Math.floor((70 - labelW) / 2), color = PX.CHARS[d.id].color;
      g.fillStyle = color; g.fillRect(labelX, 78, labelW, 9); g.fillStyle = '#0a0712'; g.fillRect(labelX + 1, 79, labelW - 2, 7);
      PX.text(g, lab, labelX + 3, 80, color);
    });
  }
  function drawFridgeDoor() {
    if (!current || current.plan.action !== 'candy' || current.phase !== 'interact') return;
    var open = Math.min(1, current.frame / 12);
    // Reveal the cool interior first, then swing the narrow door into the aisle.
    g.fillStyle = '#303048'; g.fillRect(FRIDGE.x + 2, FRIDGE.y + 2, FRIDGE.w - 4, FRIDGE.h - 5);
    g.fillStyle = '#a3a7bd'; g.fillRect(FRIDGE.x + 3, FRIDGE.y + 11, FRIDGE.w - 6, 1);
    g.fillStyle = '#a3a7bd'; g.fillRect(FRIDGE.x + 3, FRIDGE.y + 21, FRIDGE.w - 6, 1);
    g.fillStyle = '#ff5f9f'; g.fillRect(FRIDGE.x + 5, FRIDGE.y + 5, 4, 3); g.fillRect(FRIDGE.x + 13, FRIDGE.y + 6, 4, 3);
    g.fillStyle = '#ffd45e'; g.fillRect(FRIDGE.x + 7, FRIDGE.y + 15, 5, 3); g.fillRect(FRIDGE.x + 14, FRIDGE.y + 25, 4, 3);
    var doorX = FRIDGE.x - Math.round(open * 10);
    g.fillStyle = '#d8d9e7'; g.fillRect(doorX, FRIDGE.y + 1, 12, FRIDGE.h - 3);
    g.fillStyle = '#8992b4'; g.fillRect(doorX + 1, FRIDGE.y + 2, 9, FRIDGE.h - 5);
    g.fillStyle = '#44324a'; g.fillRect(doorX + 8, FRIDGE.y + 8, 2, 7); g.fillRect(doorX + 8, FRIDGE.y + 24, 2, 7);
  }
  function drawActor(p) {
    if (!current || current.members.indexOf(p) < 0) return;
    var phase = current.phase, action = current.plan.action, id = p.id, s = sprites[id], t = current.frame;
    var idx = Math.floor(t / (id === 'Feline1' ? 5 : 6)) % 4, sprite = s.stand, y = GROUND_Y;
    var direction = p.target >= p.x;
    if (phase === 'out' || phase === 'back') sprite = direction ? s.run[idx] : leftRun[id][idx];
    else if (phase === 'interact') {
      if (action === 'highfive' || action === 'selfie') sprite = (id === 'X0' && action === 'highfive') ? leftCheer[id] : s.cheer;
      else if (action === 'workout') {
        var cycle = t % 38, arc = Math.sin((cycle / 37) * Math.PI);
        sprite = cycle < 15 ? s.jump : (cycle < 27 ? s.fall : s.stand);
        y -= Math.round(8 * arc);
      } else if (action === 'sword') sprite = t % 28 < 18 ? s.skill : s.stand;
      else if (action === 'paint' || action === 'catart') sprite = s.idle[(Math.floor(t / 13) + 2) % s.idle.length];
      else sprite = s.idle[Math.floor(t / 10) % s.idle.length];
    }
    if (phase === 'sit') sprite = s.stand;
    if (phase === 'interact' && action === 'bed') return;
    g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(Math.round(p.x + 3), FEET_Y, 11, 2);
    g.drawImage(sprite, Math.round(p.x), y, 16, 24);
  }
  function drawSleepingActor() {
    if (!current || current.phase !== 'interact' || current.plan.action !== 'bed') return;
    var p = current.members[0], s = sprites[p.id].idle[Math.floor(current.frame / 18) % sprites[p.id].idle.length];
    // Rest at the bed with feet hidden under a blanket; keep the sprite upright
    // so the pixel art stays crisp instead of rotating a whole character frame.
    g.drawImage(s, 0, 0, 16, 24, 24, 139, 16, 24);
    g.fillStyle = '#d4b5c8'; g.fillRect(10, 148, 14, 7); g.fillStyle = '#9d6683'; g.fillRect(11, 149, 12, 2);
    g.fillStyle = '#7b4263'; g.fillRect(20, 151, 37, 11); g.fillStyle = '#b75883'; g.fillRect(22, 151, 33, 2);
    g.fillStyle = '#965376'; g.fillRect(24, 155, 2, 1); g.fillRect(43, 154, 2, 1);
    if (current.frame % 48 < 36) { PX.text(g, 'Z', 44, 142 - (current.frame % 18 > 9 ? 2 : 0), '#b8bce0'); PX.text(g, 'Z', 51, 137, '#7e6f9d'); }
  }
  function drawCat() {
    var play = current && current.phase === 'interact' && ['cat', 'catart', 'selfie'].indexOf(current.plan.action) >= 0;
    var x, running = false, facingLeft = false;
    if (play) {
      var f = actors.Feline1, t = current.frame;
      x = Math.max(165, Math.min(SW - 20, f.x + 12 + Math.round(Math.sin(t * 0.2) * 12)));
      facingLeft = Math.cos(t * 0.2) < 0; running = true;
      var toyX = Math.max(164, Math.min(252, f.x + 27 + Math.round(Math.sin(t * 0.28) * 18)));
      g.fillStyle = '#ff5f9f'; g.fillRect(toyX, FEET_Y - 3, 4, 4); g.fillStyle = '#ffd45e'; g.fillRect(toyX + 1, FEET_Y - 5, 2, 2);
    } else {
      x = cat.x;
      running = cat.mode === 'walk';
      facingLeft = running && cat.target < cat.x;
    }
    var y = FEET_Y - 12;
    g.fillStyle = 'rgba(0,0,0,.3)'; g.fillRect(Math.round(x + 3), FEET_Y, 14, 2);
    var catFrames = facingLeft ? studioCatLeft : studioCat;
    var kitten = cat.mode === 'sleep' && !play ? catFrames.sleep :
      (running ? catFrames.walk[Math.floor(tk / 5) % catFrames.walk.length] : catFrames.idle[Math.floor(tk / 28) % catFrames.idle.length]);
    g.drawImage(kitten, Math.round(x), y);
    if (!play && cat.mode === 'sleep' && tk % 78 < 62) {
      PX.text(g, 'Z', Math.round(x + 14), y - 5, '#b8bce0');
      if (tk % 39 < 3) { g.fillStyle = '#ff9fc4'; g.fillRect(Math.round(x + 4), y + 5, 2, 1); }
    }
  }
  function drawActivityEffects() {
    if (!current || current.phase !== 'interact') return;
    var action = current.plan.action, t = current.frame, members = current.members;
    var center = members.reduce(function (n, p) { return n + p.x + 8; }, 0) / members.length;
    var label = { candy: 'YUM!', paint: 'ART TIME', cat: 'MEOW!', workout: 'REP!', sword: 'SHING!', bed: 'SWEET DREAMS', highfive: 'HIGH FIVE!', catart: 'CAT ART!', selfie: 'SAY CHEESE!' }[action];
    drawBubble(label, center, GROUND_Y - 17);
    if (action === 'paint' || action === 'catart') {
      for (var i = 0; i < artProgress; i++) {
        g.fillStyle = ['#ff5f9f', '#4fe3ff', '#ffd45e', '#b48cff', '#5dff8f', '#ff9f4f'][i];
        g.fillRect(149 + (i * 5) % 9, 138 + (i * 7) % 8, 2, 2);
      }
      g.fillStyle = '#ff9fc4'; g.fillRect(144, 133, 2, 2);
    }
    if (action === 'workout') {
      var lifter = members[0], rep = t % 38, liftY = GROUND_Y + 5 - Math.round(8 * Math.sin((rep / 37) * Math.PI));
      var barX = Math.round(lifter.x + 5);
      g.fillStyle = '#4fe3ff'; g.fillRect(barX, liftY, 7, 2); g.fillRect(barX - 2, liftY - 1, 2, 4); g.fillRect(barX + 7, liftY - 1, 2, 4);
      if (rep < 4) { g.fillStyle = '#fff'; g.fillRect(barX + 3, liftY - 4, 1, 2); }
    }
    if (action === 'sword') {
      var swordsman = members[0], angle = Math.sin(t * 0.26) * 0.8;
      g.save(); g.translate(Math.round(swordsman.x + 12), GROUND_Y + 11); g.rotate(angle);
      g.fillStyle = '#ff9fc4'; g.fillRect(-2, -2, 5, 4); g.fillStyle = '#dceaff'; g.fillRect(2, -1, 14, 2); g.fillStyle = '#fff'; g.fillRect(14, -2, 3, 4); g.restore();
      if (t % 18 < 4) { g.fillStyle = '#ffd45e'; g.fillRect(Math.round(swordsman.x + 28), GROUND_Y + 2, 3, 3); g.fillRect(Math.round(swordsman.x + 32), GROUND_Y + 6, 2, 2); }
    }
    if (action === 'candy') {
      var eater = members[0], candyX = Math.round(eater.x + 13), candyY = GROUND_Y + 5 + (t % 24 < 12 ? 0 : 2);
      g.fillStyle = '#ff5f9f'; g.fillRect(candyX, candyY, 5, 4); g.fillStyle = '#fff0a8'; g.fillRect(candyX + 1, candyY + 1, 3, 2);
      g.fillStyle = '#ffd45e'; g.fillRect(candyX - 2, candyY + 1, 2, 2); g.fillRect(candyX + 5, candyY + 1, 2, 2);
    }
    if (action === 'highfive' && t % 20 < 8) {
      g.fillStyle = '#ffd45e'; g.fillRect(144, GROUND_Y + 5, 3, 3); g.fillRect(140, GROUND_Y + 8, 2, 2); g.fillRect(149, GROUND_Y + 9, 2, 2);
    }
    if (action === 'selfie') {
      // Keep the photo cue local to the group; flashing the whole canvas white
      // makes the live camera look like it is briefly clearing or reloading.
      if (t > 35 && t < 46 && t % 3 < 2) {
        var fx = Math.round(center + 25), fy = GROUND_Y + 4;
        g.fillStyle = '#fff6d8'; g.fillRect(fx, fy - 1, 1, 3); g.fillRect(fx - 1, fy, 3, 1);
        g.fillStyle = '#ff9fc4'; g.fillRect(fx + 2, fy - 1, 1, 1);
      }
      if (t % 24 < 12) { g.fillStyle = '#ff9fc4'; g.fillRect(128, GROUND_Y - 4, 2, 2); g.fillRect(167, GROUND_Y - 8, 2, 2); }
    }
  }

  function drawRoom() {
    g.drawImage(bg, 0, 0);
    // Original moon and snow outside the window.
    g.fillStyle = '#fff6d8'; g.fillRect(56, 22, 6, 6); g.fillRect(55, 23, 8, 4); g.fillStyle = '#e8dcb0'; g.fillRect(57, 24, 2, 1);
    snow.forEach(function (s) {
      s[1] += s[2]; s[0] += Math.sin((tk + s[1] * 9) * 0.02) * 0.15;
      if (s[1] > 54) { s[1] = 0; s[0] = random() * 60; }
      var px = 14 + Math.floor(s[0]), py = 18 + Math.floor(s[1]);
      if (px > 43 && px < 45 || py > 44 && py < 46) return;
      g.fillStyle = '#e6eeff'; g.fillRect(px, py, 1, 1);
    });
    // Original wall clock.
    var d = new Date(), cx = 168, cy = 34;
    g.fillStyle = '#ffd45e';
    for (var a = 0; a < 40; a++) g.fillRect(Math.round(cx + Math.cos(a / 40 * 6.283) * 10), Math.round(cy + Math.sin(a / 40 * 6.283) * 10), 1, 1);
    g.fillStyle = '#1a1030';
    for (var yy = -9; yy <= 9; yy++) for (var xx = -9; xx <= 9; xx++) if (xx * xx + yy * yy < 81) g.fillRect(cx + xx, cy + yy, 1, 1);
    function hand(angle, len, color) { g.fillStyle = color; for (var r = 0; r < len; r++) g.fillRect(Math.round(cx + Math.sin(angle) * r), Math.round(cy - Math.cos(angle) * r), 1, 1); }
    hand((d.getHours() % 12 + d.getMinutes() / 60) / 12 * 6.283, 5, '#fff');
    hand(d.getMinutes() / 60 * 6.283, 7, '#ff9fc4'); hand(d.getSeconds() / 60 * 6.283, 8, '#ff4f6a');
    // Server rack LEDs and the original desk-lamp glow.
    for (var u = 0; u < 9; u++) for (var l = 0; l < 4; l++) {
      var on = ((tk >> 4) * (u + 3) * (l + 7)) % 5 > 1;
      g.fillStyle = on ? (l === 3 ? '#ff4f6a' : '#5dff8f') : '#1a3a24'; g.fillRect(290 + l * 3, 60 + u * 7, 2, 1);
    }
    desks.forEach(function (dk) {
      g.fillStyle = 'rgba(255,212,140,.05)';
      for (var k = 0; k < 10; k++) g.fillRect(dk.x + 30 - k * 3, 74 + k * 4, 12 + k * 6, 4);
    });
    drawDeskCharacters(); drawDesks(); drawFridgeDoor();
    // C0's coffee and steam stay on the original desk.
    var mx0 = desks[0].x + 8;
    g.fillStyle = '#fff'; g.fillRect(mx0, 105, 6, 6); g.fillRect(mx0 + 6, 106, 2, 3); g.fillStyle = '#5a3020'; g.fillRect(mx0 + 1, 105, 4, 1);
    if (tk % 5 === 0) steam.push([mx0 + 2 + random() * 2, 103, 40]);
    steam = steam.filter(function (p) {
      p[1] -= 0.35; p[0] += Math.sin(p[1] * 0.4) * 0.2; p[2]--;
      if (p[2] > 0) { g.fillStyle = 'rgba(255,255,255,' + p[2] / 60 + ')'; g.fillRect(Math.round(p[0]), Math.round(p[1]), 1, 1); }
      return p[2] > 0;
    });
    if (current) current.members.forEach(drawActor);
    drawCat(); drawSleepingActor(); drawActivityEffects();
    g.fillStyle = 'rgba(0,0,0,.12)'; for (var sy = 0; sy < SH; sy += 2) g.fillRect(0, sy, SW, 1);
    PX.text(g, 'CAM 01  ' + clockText(), 6, 4, '#ff4f6a', '#000');
    PX.text(g, 'REC', SW - 18, 4, tk % 30 < 15 ? '#ff4f6a' : '#5a1a2a', '#000');
    screen.imageSmoothingEnabled = false; screen.drawImage(scene, 0, 0, view.width, view.height);
  }
  var visible = true, running = false;
  function loop(ts) {
    if (!visible || document.hidden) { running = false; return; }
    requestAnimationFrame(loop);
    if (ts - lastFrame < 40) return;
    lastFrame = ts; tk++; updateEvent(); updateCat(); drawRoom();
  }
  function startLoop() {
    if (!running && visible && !document.hidden) { running = true; requestAnimationFrame(loop); }
  }
  if (window.IntersectionObserver) new IntersectionObserver(function (entries) {
    visible = entries[entries.length - 1].isIntersecting;
    startLoop();
  }).observe(view);
  document.addEventListener('visibilitychange', startLoop);
  startLoop();
})();
