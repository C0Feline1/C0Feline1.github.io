/* Small scene props and speech for approved studio performances. Coordinates
 * stay beside the reserved actor footprint; navigation remains host-owned. */
(function () {
  'use strict';
  var FONT = '"Fusion Pixel", "PingFang SC", monospace';
  function box(g, x, y, w, h, color) { g.fillStyle = color; g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); }
  function text(g, value, x, y, color, size) {
    g.font = (size || 7) + 'px ' + FONT; g.textBaseline = 'top'; g.fillStyle = color || '#fff5ea'; g.fillText(value, Math.round(x), Math.round(y));
  }
  function spark(g, x, y, color) { box(g, x - 2, y, 5, 1, color); box(g, x, y - 2, 1, 5, color); }
  function placement(cue) {
    if (!cue || !cue.performance) return 0;
    var p = cue.progress, offset = window.StudioOriginalPerformance&&StudioOriginalPerformance.supported(cue)?StudioOriginalPerformance.placement(cue):cue.performance === 'deepseek' ? cue.stage === 0 ? -5 + p * 10 : 5 :
      cue.performance === 'claude' ? cue.stage === 0 ? -3 + p * 6 : 3 :
      cue.performance === 'grok' && cue.effect === 'dance' ? Math.sin(p * Math.PI * 4) * 2 : 0;
    return cue.mainDirection === 'left' ? -offset : offset;
  }
  function props(g, actor, cue) {
    if (!cue || !cue.performance) return;
    if(window.StudioOriginalPerformance&&StudioOriginalPerformance.behind(g,actor,cue))return;
    var e = cue.effect, p = cue.progress, color = actor.color, mirror = cue.mainDirection === 'left';
    g.save(); g.translate(Math.round(actor.renderX), Math.round(actor.renderY)); if (mirror) g.scale(-1, 1);
    function label(value, x, y, width, ink) {
      value=window.StudioCast?StudioCast.text(value):value;
      g.font='6px '+FONT;width=Math.max(width,Math.ceil(g.measureText(value).width)+4);
      box(g, x, y, width, 11, '#30263e');
      g.save(); if (mirror) { g.translate(x + width - 2, y + 2); g.scale(-1, 1); text(g, value, 0, 0, ink || color, 6); }
      else text(g, value, x + 2, y + 2, ink || color, 6); g.restore();
    }
    if (cue.performance === 'kimi') {
      // Each successive strip consumes the same growing length, so paper never
      // retracts at a beat boundary. All folds stay on the room's floor.
      var left = -39, right = 39, length = 8 + cue.storyProgress * 292;
      var routes = [{x:10,y:-7,w:29,h:3},{x:36,y:-4,w:3,h:5,v:true},{x:left,y:0,w:78,h:3,r:true},{x:left,y:-5,w:3,h:5,v:true,r:true},{x:left+3,y:-7,w:66,h:3},{x:24,y:-4,w:3,h:3,v:true},{x:-26,y:-3,w:50,h:3,r:true}];
      routes.forEach(function (r) {
        if (length <= 0) return; var cap = r.v ? r.h : r.w, amount = Math.min(cap, length), x = r.x, y = r.y, w = r.w, h = r.h;
        if (r.v) { h = amount; if (r.r) y += cap - amount; } else { w = amount; if (r.r) x += cap - amount; }
        box(g, x, y, w, h, '#e0d6ba'); if (!r.v) for (var n = 3; n < w - 3; n += 7) box(g, x + n, y + 1, 3, 1, '#9e957d'); length -= amount;
      });
      if (e === 'summary') { label('三条重点 ✓', 13, -30, 37); label('待整理 ' + Math.round(300 + cue.storyProgress * 900) + '页', -47, -19, 46); }
    }
    if (e === 'board' || e === 'wrong' || e === 'doubt') {
      box(g, 15, -35, 34, 25, '#907460'); box(g, 17, -33, 30, 21, '#29473e');
      box(g, 18, -10, 2, 9, '#907460'); box(g, 44, -10, 2, 9, '#907460');
      label(e === 'board' ? '今日方案' : e === 'wrong' ? '2+2=5' : '2+2=?', 18, -28, 28, '#f5efce');
    }
    if (e === 'waiting' || e === 'reconnect') {
      box(g, -24, -3, 11, 1, color); box(g, -9, -3, 5, 1, color); box(g, -13, -5, 2, 5, '#c6c5d3');
      label(e === 'waiting' ? '等待中…' : '连接中…', 13, -25, 35);
      for (var dot = 0; dot < 3; dot++) box(g, 18 + dot * 6, -11, 2, 2, dot === Math.floor(cue.localMs / 360) % 3 ? '#fff5ea' : '#6c6079');
    }
    if (e === 'tea') { label('连接恢复 ✓', 15, -27, 41); spark(g, 27, -8, color); }
    if (e === 'effort' || e === 'smell' || e === 'rice' || e === 'forgot') {
      box(g, 27, -9, 14, 3, '#f1ebd6'); box(g, 24, -6, 20, 3, '#abcadc'); box(g, 27, -3, 14, 3, '#749ebc');
      box(g, 31, 0, 6, 1, '#749ebc'); for (var steam = 0; steam < 2; steam++) box(g, 30 + steam * 7, -16 - Math.round(Math.sin(cue.localMs / 350 + steam)), 1, 5, '#c4c6ce');
      label(e === 'forgot' ? '任务：？？' : '努力处理中…', -49, -24, 45);
    }
    if (e === 'banned' || e === 'login' || e === 'return') label(e === 'banned' ? '账号已停用' : e === 'login' ? '新账号登录' : '继续工作 ✓', 14, -26, 43);
    if (cue.performance === 'gemini') {
      spark(g, -30, -25, '#99cdef'); spark(g, 31, -25, '#dfb4e9');
      if (e === 'answers') { label('答案 A：是', -48, -16, 41); label('答案 B：否', 11, -16, 41); }
      if (e === 'sorry') label('同步认错 ×2', 15, -24, 43);
    }
    if (cue.performance === 'grok') {
      [[-41,-39],[39,-39],[-41,-4],[39,-4]].forEach(function (pt) { box(g, pt[0], pt[1], 5, 1, '#b69cbd'); box(g, pt[0], pt[1], 1, 4, '#b69cbd'); });
      label('REC', -37, -34, 19);
      if (e === 'dance' || e === 'turn') { label('♪', -29, -20, 11); label('♫', 25, -27, 11); spark(g, 33, -10, color); }
    }
    g.restore();
  }
  function copies(g, actor, cue, kit, x, y, w) {
    if (!cue || cue.performance !== 'gemini') return;
    var gap = cue.effect === 'twins' ? cue.progress * 19 : cue.effect === 'merge' ? (1 - cue.progress) * 19 : 19;
    g.save(); g.globalAlpha = .48;
    [-1, 1].forEach(function (side) { kit.draw(g, actor.id, cue.state, cue.frame, x + side * gap, y, w, false, 'front', cue.expression); });
    g.restore();
  }
  function speech(g, actor, cue, view) {
    if (!cue || !cue.performance || !cue.line) return;
    // The full-width reserve keeps the cloud still while the sentence appears.
    var value = window.StudioCast?StudioCast.text(cue.line):cue.line, size = 7, maxWidth = 148;
    g.save(); g.font = size + 'px ' + FONT; g.textBaseline = 'top';
    var words = Array.from(value), lines = [''];
    words.forEach(function (char) {
      var i=lines.length-1;
      if(g.measureText(lines[i]+char).width<=maxWidth-10){lines[i]+=char;return;}
      var space=lines[i].lastIndexOf(' ');
      if(space>0){var carry=lines[i].slice(space+1)+char;lines[i]=lines[i].slice(0,space);lines.push(carry);}
      else lines.push(char);
    });
    var width = Math.ceil(Math.max.apply(null, lines.map(function (line) { return g.measureText(line).width; }))) + 10;
    var head = actor.renderHead, h = lines.length * 9 + 6;
    var anchor = head ? head.centerX : actor.renderX + placement(cue), headTop = head ? head.top : actor.renderY - 32;
    // Keep the tail beside the actual head, regardless of sprite canvas margins.
    var x = Math.max(view.left + 3, Math.min(view.right - width - 3, anchor - width / 2)), y = headTop - h - 5;
    var tail = Math.max(x + 4, Math.min(x + width - 5, anchor));
    box(g, x + 3, y, width - 6, 1, '#2e243e'); box(g, x + 1, y + 1, width - 2, 2, '#2e243e'); box(g, x, y + 3, width, h - 5, '#2e243e'); box(g, x + 2, y + h - 2, width - 4, 2, '#2e243e'); box(g, tail - 1, y + h, 3, 2, '#2e243e');
    box(g, x + 3, y + 1, width - 6, h - 2, '#fff5ea'); box(g, x + 1, y + 3, width - 2, h - 6, '#fff5ea'); box(g, tail, y + h - 1, 2, 2, '#fff5ea');
    var count;
    if(window.StudioVoice&&cue.beat&&cue.beat.voice){
      var units=cue.beat.voice,heard=StudioVoice.plan(units,cue.seconds).filter(function(unit){return unit.start*1000<=cue.localMs;}).length;
      // Longer English lines share the original voice timing without stopping
      // after the Chinese number of glyphs. Audio profiles remain unchanged.
      count=Math.min(words.length,Math.ceil(words.length*heard/Math.max(1,units.length)));
    }else count=Math.min(words.length, Math.floor(cue.localMs / Math.max(35, cue.seconds * 1000 / Math.max(1, words.length))));
    var left = count;
    lines.forEach(function (line, index) { text(g, Array.from(line).slice(0, left).join(''), x + 5, y + 4 + index * 9, '#594a72', size); left = Math.max(0, left - Array.from(line).length); });
    g.restore();
  }
  window.StudioPerformance = { placement: placement, props: props, copies: copies, speech: speech,
    foreground:function(g,actor,cue){if(window.StudioOriginalPerformance)StudioOriginalPerformance.front(g,actor,cue);}
  };
}());
