/* Native 48×64 facial expressions. The complete sprite is mirrored by its caller. */
(function () {
  'use strict';

  var moods = [
    { id: 'neutral', name: '平静', description: '放松的平眉、自然睁眼与轻轻合上的嘴。' },
    { id: 'smile', name: '微笑', description: '眼神柔和，嘴角轻轻上扬。' },
    { id: 'focus', name: '专注', description: '平眉与稍收的眼睑，认真看向眼前。' },
    { id: 'confused', name: '困惑', description: '一边平眉抬高，眼睛与嘴角略有迟疑。' },
    { id: 'smug', name: '得意', description: '一边眉毛微抬，半收眼睑，嘴角带笑。' },
    { id: 'surprise', name: '惊讶', description: '眉毛抬高、圆睁双眼，小嘴张开。' },
    { id: 'angry', name: '生气', description: '向眉心压下的眉毛与绷紧的嘴。' },
    { id: 'sad', name: '难过', description: '抬起的平眉、低垂眼神与下弯嘴角。' },
    { id: 'cry', name: '委屈', description: '眼眶里含着亮泪，嘴角轻轻垂下。' },
    { id: 'love', name: '心动', description: '眼中小小的心形色块与柔软笑容。' },
    { id: 'sleepy', name: '困倦', description: '合拢的眼睑、放松眉毛与小小睡意。' },
    { id: 'happy', name: '开心', description: '弯起的笑眼与张开的小小笑嘴。' }
  ];
  var known = {};
  moods.forEach(function (mood) { known[mood.id] = mood; });

  var states = ['idle', 'walk', 'run', 'work', 'wave', 'talk', 'read', 'coffee', 'nap', 'sit', 'carry', 'cheer'];
  var stateNames = ['待机', '走路', '跑步', '工作', '招手', '交谈', '阅读', '喝咖啡', '小睡', '坐下', '搬东西', '庆祝'];
  // These everyday reactions stay stable for the entire animation cycle. Unique
  // action ids deliberately resolve to null so authored performances keep faces.
  var rows = {
    doubao:  ['smile', 'smile', 'focus', 'smug', 'happy', 'smug', 'confused', 'smile', 'sleepy', 'smile', 'focus', 'happy'],
    gpt:     ['smile', 'smile', 'focus', 'focus', 'happy', 'smile', 'confused', 'smile', 'sleepy', 'neutral', 'smile', 'happy'],
    deepseek:['sleepy', 'neutral', 'focus', 'focus', 'smile', 'neutral', 'focus', 'happy', 'sleepy', 'sleepy', 'happy', 'happy'],
    claude:  ['neutral', 'neutral', 'focus', 'focus', 'smile', 'neutral', 'focus', 'smile', 'sleepy', 'neutral', 'focus', 'smile'],
    gemini:  ['smug', 'smile', 'focus', 'smug', 'happy', 'smug', 'confused', 'smile', 'sleepy', 'confused', 'focus', 'happy'],
    grok:    ['smug', 'smug', 'smile', 'focus', 'happy', 'smug', 'confused', 'smug', 'sleepy', 'smug', 'smile', 'happy'],
    kimi:    ['neutral', 'neutral', 'focus', 'focus', 'smile', 'smile', 'focus', 'smile', 'sleepy', 'neutral', 'focus', 'happy'],
    C0:      ['neutral', 'neutral', 'focus', 'focus', 'happy', 'smile', 'focus', 'smile', 'sleepy', 'neutral', 'focus', 'happy'],
    X0:      ['smile', 'smile', 'focus', 'focus', 'happy', 'smile', 'focus', 'smile', 'sleepy', 'neutral', 'focus', 'happy'],
    Feline1: ['smile', 'smile', 'focus', 'focus', 'happy', 'smile', 'focus', 'smile', 'sleepy', 'neutral', 'focus', 'happy']
  };
  var personas = {
    doubao: '糖包甜甜地自信开场',
    gpt: '断线龙王保持亲切，等待时留一点迟疑',
    deepseek: '干饭鲸休息时犯困，补给时立刻开心',
    claude: '灰号大小姐沉着优雅，做事时认真',
    gemini: '糖包双子星自信满满，读到矛盾时有点困惑',
    grok: '瑟瑟大人带着从容俏皮的坏笑',
    kimi: '月下资料员安静温和，整理资料时专注',
    C0: 'C0平时放松，做事时专心',
    X0: 'X0温和自然，回应时露出笑意',
    Feline1: 'F1轻松亲近，开心时弯起笑眼'
  };

  function resolve(id, state, phase) {
    var index = states.indexOf(state);
    return index < 0 || !Object.prototype.hasOwnProperty.call(rows, id) ? null : rows[id][index];
  }

  function describe(id, state) {
    var index = states.indexOf(state), mood = resolve(id, state);
    if (!mood) return '保留这个专属动作原本的表情节奏。';
    if (state === 'nap') return '小睡时闭上眼睛，眉毛也一起放松。';
    if (id === 'doubao' && state === 'read') return '糖包读到破绽，甜甜的自信停顿成一个小问号。';
    if (id === 'gpt' && state === 'read') return '断线龙王读到一半等连接，困惑里仍带亲切。';
    if (id === 'deepseek' && (state === 'coffee' || state === 'carry')) return '干饭鲸一遇到补给就精神起来，眼里和嘴角都是开心。';
    if (id === 'claude') return '灰号大小姐' + stateNames[index] + '时保持' + known[mood].name + '，从容的平眉保留大小姐的优雅。';
    return personas[id] + '；' + stateNames[index] + '时是' + known[mood].name + '的神情。';
  }

  function draw(r, spec, mood, phase) {
    if (!Object.prototype.hasOwnProperty.call(known, mood)) return false;
    var skin = spec.skin, shade = spec.skinShade, white = spec.white;
    var ink = spec.ink, brow = spec.brow || ink, mouthInk = spec.mouthColor || ink;
    var leftEye = spec.near.x < spec.far.x ? spec.near : spec.far;
    var blink = spec.blink === 1 ? 1 : spec.blink === .5 ? .5 : 0;

    function pixel(x, y, color) { r.dot(Math.round(x), Math.round(y), color); }
    function rect(x, y, w, h, color) { r.rect(Math.round(x), Math.round(y), Math.round(w), Math.round(h), color); }
    function browPixels(points) {
      var visible = points.filter(function (p) { return !spec.browClip || spec.browClip(p[0], p[1]); });
      // A lone dot under a fringe looks like a frown; let that brow stay hidden.
      if (visible.length < 2) return;
      visible.forEach(function (p) { pixel(p[0], p[1], brow); });
    }
    function paintBrow(eye, isNear) {
      var x = Math.round(eye.x), y = Math.round(eye.y), w = Math.max(1, Math.round(eye.w));
      var raised = mood === 'surprise' || mood === 'sad' || mood === 'cry' || ((mood === 'confused' || mood === 'smug') && isNear);
      var browY = y - (raised ? 4 : 3), points = [];
      var browW = Math.min(w, w >= 5 ? 4 : w), start = x + (eye === leftEye ? 0 : w - browW);
      for (var i = 0; i < browW; i++) {
        var dy = 0;
        if (mood === 'angry') dy = eye === leftEye ? Math.floor(i / 2) : Math.floor((browW - 1 - i) / 2);
        points.push([start + i, browY + dy]);
      }
      browPixels(points);
    }

    function paintEye(eye, isNear, iris, irisLight) {
      var x = Math.round(eye.x), y = Math.round(eye.y), w = Math.max(1, Math.round(eye.w));
      // Erase only the eye socket, keeping cheeks, nose, hair and face outline.
      rect(x, y, w, 6, skin);
      var center = x + Math.floor((w - 1) / 2);
      if (mood === 'happy') {
        for (var happyX = 0; happyX < w; happyX++) pixel(x + happyX, y + 2 + (happyX === 0 || happyX === w - 1 ? 1 : 0), ink);
        return;
      }
      if (mood === 'sleepy' || blink === 1) {
        rect(x, y + 3, w, 1, ink);
        if (mood === 'sleepy') pixel(x + w - 1, y + 4, shade);
        return;
      }
      var top = mood === 'focus' || mood === 'angry' ? 1 : 0;
      if (mood === 'smug') top = isNear ? 2 : 1;
      if (mood === 'confused' && !isNear) top = 1;
      if (mood === 'sad' || mood === 'cry') top = 1;
      if (blink === .5) top = Math.max(top, 2);
      var bottom = mood === 'smile' ? 4 : 5;
      // Front eyes retain matching iris clusters. In a three-quarter view the
      // nearer eye carries three iris pixels and the narrow far eye carries two.
      var irisW = Math.min(w, spec.side && !isNear ? 2 : 3);
      var irisX = x + (spec.side ? w - irisW : Math.floor((w - irisW) / 2));
      var pupilW = Math.min(irisW, spec.side && !isNear ? 1 : 2);
      var pupilX = irisX + (spec.side ? irisW - pupilW : Math.floor((irisW - pupilW) / 2));
      rect(x, y + top + 1, w, bottom - top, white);
      rect(irisX, y + top + 1, irisW, bottom - top, iris);
      var pupilTop = top + 1 + (mood === 'sad' || mood === 'cry' || spec.gazeY ? 1 : 0);
      rect(pupilX, y + pupilTop, pupilW, Math.max(1, Math.min(3, bottom - pupilTop)), ink);
      pixel(irisX, y + top + 1, white);
      pixel(irisX + irisW - 1, y + bottom, irisLight);
      // The lid never extends past its socket. Only angry gets inward slopes.
      for (var lidX = 0; lidX < w; lidX++) {
        var lidY = top;
        if (mood === 'angry') lidY += eye === leftEye ? Math.floor(lidX / 3) : Math.floor((w - 1 - lidX) / 3);
        pixel(x + lidX, y + lidY, ink);
      }
      if (mood === 'surprise') pixel(center, y + bottom, ink);
      if (mood === 'love' && blink === 0) {
        // The tiny heart is an iris cluster, entirely inside the eye socket.
        var heartX = irisX, heartY = y + 2;
        rect(irisX, y + 1, irisW, 5, white);
        pixel(heartX, heartY, iris);
        pixel(heartX + irisW - 1, heartY, iris);
        rect(heartX, heartY + 1, irisW, 1, iris);
        pixel(heartX + Math.floor(irisW / 2), heartY + 2, irisLight);
      }
      if (mood === 'cry' && blink === 0) {
        // Tears stay in the lower eye; they never become a floating effect.
        pixel(x, y + 4, irisLight);
        pixel(x, y + 5, white);
        if (w >= 5) pixel(x + 1, y + 5, irisLight);
      }
    }

    function paintMouth() {
      var x = Math.round(spec.mouth.x), y = Math.round(spec.mouth.y);
      rect(x - 2, y - 1, 5, 3, skin);
      if (mood === 'surprise') {
        rect(x - 1, y - 1, 3, 3, mouthInk);
        pixel(x, y, ink);
        return;
      }
      if (mood === 'happy') {
        rect(x - 1, y - 1, 3, 2, mouthInk);
        pixel(x, y - 1, white);
        pixel(x, y + 1, shade);
        return;
      }
      if (spec.speaking && ((Number(phase) || 0) % 6) < 3 && mood !== 'sleepy') {
        rect(x - 1, y - 1, 3, 2, mouthInk);
        if (mood === 'smile' || mood === 'smug') pixel(x + 2, y - 1, mouthInk);
        return;
      }
      if (mood === 'smile' || mood === 'love') {
        pixel(x - 2, y - 1, mouthInk);
        rect(x - 1, y, 3, 1, mouthInk);
        pixel(x + 2, y - 1, mouthInk);
        return;
      }
      if (mood === 'smug') {
        rect(x - 1, y, 3, 1, mouthInk);
        pixel(x + 2, y - 1, mouthInk);
        return;
      }
      if (mood === 'sad' || mood === 'cry' || mood === 'angry') {
        pixel(x - 2, y, mouthInk);
        rect(x - 1, y - 1, 3, 1, mouthInk);
        pixel(x + 2, y, mouthInk);
        if (mood === 'cry') pixel(x, y, shade);
        return;
      }
      if (mood === 'confused') {
        rect(x - 1, y, 2, 1, mouthInk);
        rect(x + 1, y - 1, 2, 1, mouthInk);
        return;
      }
      if (mood === 'sleepy') {
        rect(x, y, 2, 1, mouthInk);
        return;
      }
      if (spec.catMouth && mood === 'neutral') {
        pixel(x - 2, y - 1, mouthInk); pixel(x - 1, y, mouthInk);
        pixel(x, y - 1, mouthInk); pixel(x + 1, y, mouthInk); pixel(x + 2, y - 1, mouthInk);
        return;
      }
      rect(x - 1, y, 3, 1, mouthInk);
    }

    paintEye(spec.near, true, spec.irisNear, spec.irisLightNear);
    paintEye(spec.far, false, spec.irisFar, spec.irisLightFar);
    paintBrow(spec.near, true);
    paintBrow(spec.far, false);
    paintMouth();
    return true;
  }

  window.StudioExpressions = { moods: moods, resolve: resolve, describe: describe, draw: draw };
})();
