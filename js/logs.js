/* build.log content: static lines, templated lines, multi-line mini stories, time-aware lines and rare easter eggs. */
(function () {
  var R = Math.random, pick = function (a) { return a[Math.floor(R() * a.length)]; };
  var int = function (a, b) { return a + Math.floor(R() * (b - a + 1)); };
  var hex = function (n) { var s = ''; while (s.length < n) s += Math.floor(R() * 16).toString(16); return s; };

  /* ---------- static pool [class, text] ---------- */
  var STATIC = [
    ['c', 'build  像素伙伴就位：代码绘制，本地图集加载'], ['c', 'C0     正在和编译器吵架'], ['c', 'C0     把 tab 改成了 2 个空格，又改回来了'],
    ['c', 'C0     打开了 Stack Overflow'], ['c', 'C0     关掉了 Stack Overflow，决定自己想'], ['c', 'C0     在注释里写了"不要动这行"'],
    ['c', 'C0     重启了电脑，问题消失了'], ['c', 'C0     给变量起名 temp2_final_真的final'], ['c', 'C0     console.log 了 47 次'],
    ['c', 'C0     发现 bug 是自己三天前写的'], ['c', 'C0     在橡皮鸭面前解释了一遍代码，懂了'], ['c', 'C0     把需求文档又读了一遍'],
    ['c', 'sync   归途的余温 剧情文档 v07'], ['c', 'sync   世界章节与任务文案.md'], ['c', 'lint   0 errors, 3 warnings（假装没看见）'],
    ['p', 'X0     画完了一只雪狼'], ['p', 'X0     调色板 +1：霜脊蓝'], ['p', 'X0     调色板 +1：雨城霓虹粉'], ['p', 'X0     调色板 +1：锅炉黄铜'],
    ['p', 'X0     把猫耳重画了第 9 遍'], ['p', 'X0     说这个像素多了一个点'], ['p', 'X0     在画珊瑚遗迹的水母'], ['p', 'X0     给飞剑加了一道光'],
    ['p', 'X0     画了一张草稿，又藏起来了'], ['p', 'X0     正在研究水墨的晕染'], ['p', 'X0     认为阴影应该偏紫一点'], ['p', 'X0     把参考图贴满了屏幕'],
    ['p', 'Feline1 在测试跳跃手感：喵！'], ['p', 'Feline1 又从平台上掉下去了'], ['p', 'Feline1 报告：二段跳太好玩了'], ['p', 'Feline1 把 bug 当成了小虫子去抓'],
    ['p', 'Feline1 在竹蜻蜓上睡着了'], ['p', 'Feline1 要求加一条小鱼干道具'], ['p', 'Feline1 在测试御剑……拿反了'], ['p', 'Feline1 发现了一个穿墙 bug，很开心'],
    ['p', 'Feline1 尾巴卡进了碰撞箱'], ['p', 'Feline1 在雨城被霓虹灯晃到了'], ['p', 'Feline1 想去海底抓螃蟹'],
    ['w', 'warn   灵感值波动较大'], ['w', 'warn   猫猫睡在了键盘上'], ['w', 'warn   咖啡库存低于 20%'], ['w', 'warn   C0 已连续工作 3 小时'],
    ['w', 'warn   发现一只真正的 bug（昆虫）'], ['w', 'warn   显示器亮度被调到了 100%'], ['w', 'warn   某人把 main 分支当成了草稿纸'],
    ['w', 'warn   雨城的霓虹灯又坏了一盏'], ['w', 'warn   锅炉厅压力 99%……正常吗？'], ['w', 'warn   冰湖的鱼不见了'],
    ['ok', 'deploy c0feline1.github.io  ✓'], ['ok', 'test   all green ✓'], ['ok', 'check  app-ads.txt → 200 OK'],
    ['ok', 'check  隐私政策页面 → 200 OK'], ['ok', 'backup 已备份到云端 ✓'], ['ok', 'save   守山屋存档点已更新'], ['ok', 'fixed  雪花终于又下了'],
    ['ok', 'ok     三个人都还在 ✓'], ['ok', 'ok     猫猫已喂食'], ['ok', 'ok     植物已浇水 🌱'],
    ['c', 'world  云桥 · 灵灯 1/3 已点亮'], ['c', 'world  雨城 · 数据闸门状态：不稳定'], ['c', 'world  锅炉厅 · 压力心核读数正常'],
    ['c', 'world  珊瑚遗迹 · 潮汐倒流中'], ['c', 'world  霜脊 · 守望者在沉睡'], ['c', 'world  公寓终端收到一段无来源坐标'],
    ['p', 'cat    猫猫伸了个懒腰'], ['p', 'cat    猫猫推倒了一支笔'], ['p', 'cat    猫猫盯着屏幕上的光标'], ['p', 'cat    猫猫占领了椅子'],
    ['p', 'spider 小八在天花板上织了一张网'], ['p', 'spider 小八巡逻经过 build.log'], ['p', 'spider 小八在看你'],
    ['c', 'net    ping github.com … 42ms'], ['c', 'cache  清理了 128MB 临时文件'], ['c', 'gpu    像素渲染温度 46°C'],
    ['c', 'audio  正在合成 8-bit 跳跃音效'], ['c', 'audio  Feline Neon Loop 已就绪'], ['c', 'i18n   找到 3 处没翻译的"喵"']
  ];

  /* ---------- templated generators ---------- */
  var COMMITS = ['调整猫耳抖动幅度', '修复跳跃判定偏移 1px', '雪狼跑得太快了', '加了一点点粒子', '重构（其实只是改了缩进）', '删掉了没用的代码',
    '给 BOSS 加了蓄力动作', '让水母游得更慢', '修正雨城重力翻转', '蒸汽口提示更明显', '水墨世界加上印章', '优化手机端按键', '修好了存档',
    '把 TODO 改成了 TODO（已读）', '不知道为什么好了', 'WIP', '最后一次修改（第 7 次）', '御剑的光效更好看了', '海底气泡数量 +20%'];
  var BUGS = ['跳跃判定偏移 1px', '猫耳穿模', '雪花不下了', '存档读不出来', '狼跑得太快', '竹蜻蜓转反了', '飞剑插进地里了', '水母卡在墙里',
    '重力翻转后头朝下吃面', '齿轮转着转着停了', '螃蟹横着走出了屏幕', '营火把洞穴照成了白天', '冰湖里钓到了一只靴子', '霓虹招牌显示乱码'];
  var FILES = ['game.js', 'pixel.js', 'spider.js', 'dash.js', 'index.html', 'worlds.json', 'boss.ai', 'feline1.anim', 'x0.palette', 'c0.config'];
  var GEN = [
    function () { return ['c', 'git    commit ' + hex(7) + ' "' + pick(COMMITS) + '"']; },
    function () { return ['ok', 'fixed  #' + int(200, 499) + ' ' + pick(BUGS)]; },
    function () { return ['w', 'bug    #' + int(200, 499) + ' ' + pick(BUGS) + '（新发现）']; },
    function () { var p = int(30, 60); return ['ok', 'test   ' + p + ' passed, 0 failed (' + (R() * 3 + 0.4).toFixed(2) + 's)']; },
    function () { var f = int(1, 3); return ['w', 'test   ' + int(30, 60) + ' passed, ' + f + ' failed → 重跑一次就好了']; },
    function () { return ['c', 'edit   ' + pick(FILES) + '  +' + int(1, 120) + ' -' + int(0, 60)]; },
    function () { return ['c', 'build  bundle ' + int(40, 90) + '.' + int(0, 9) + 'KB  (' + int(80, 400) + 'ms)']; },
    function () { return ['c', 'fetch  ' + pick(['像素字体', '音效包', '调色板', '新的灵感', '猫粮订单']) + ' ' + int(10, 100) + '%']; },
    function () { return ['p', 'X0     第 ' + int(2, 30) + ' 版 ' + pick(['猫娘立绘', '雪狼草图', '修仙界云海', '赛博招牌', '锅炉厅齿轮', '水母']) + ' 完成']; },
    function () { return ['p', 'Feline1 跑酷最高 ' + int(800, 4200) + ' 分，' + pick(['不服', '还想再跑', '要求加命', '说是 C0 的问题'])]; },
    function () { return ['c', 'perf   ' + int(58, 60) + ' FPS · ' + int(120, 400) + ' 个粒子']; },
    function () { return ['ok', 'review X0 给 C0 的代码打了 ' + int(6, 10) + '/10 分']; },
    function () { return ['c', 'mood   C0 心情 ' + int(40, 99) + '% · X0 ' + int(40, 99) + '% · Feline1 ' + int(80, 100) + '%']; }
  ];

  /* ---------- short multi-line stories ---------- */
  var STORIES = [
    [['c', 'build  开始构建 KITTY RUNNER …'], ['c', 'build  [■■■□□□□□] 编译像素'], ['c', 'build  [■■■■■■□□] 生成 13 个世界'], ['ok', 'build  [■■■■■■■■] 完成 ✓']],
    [['w', 'input  asdfghjkl;;;;;;;;;'], ['w', 'input  ppppppppppppppp'], ['p', 'cat    原来是猫猫踩上了键盘'], ['ok', 'cat    已抱走，输入恢复正常']],
    [['p', 'Feline1 C0，这个跳跃好像有点飘'], ['c', 'C0     哪里飘了？'], ['p', 'Feline1 就是……飘'], ['c', 'C0     重力 0.30 → 0.32'], ['p', 'Feline1 嗯！就是这个！']],
    [['p', 'X0     C0，你看这两个颜色哪个好？'], ['c', 'C0     ……不是一样的吗'], ['p', 'X0     #ff4fa3 和 #ff4fa4'], ['c', 'C0     左边。'], ['p', 'X0     我也觉得是右边']],
    [['w', 'alert  检测到霜脊守望者苏醒'], ['p', 'Feline1 我先上！'], ['p', 'X0     护盾已展开'], ['c', 'C0     脉冲震击充能中……'], ['ok', 'alert  冰核已击碎，风雪缓和']],
    [['c', 'git    push origin main'], ['w', 'git    rejected: non-fast-forward'], ['c', 'C0     ……'], ['c', 'git    pull --rebase'], ['ok', 'git    push ✓（C0 松了一口气）']],
    [['w', 'power  停电了'], ['p', 'Feline1 好黑！'], ['p', 'X0     还好我刚保存了'], ['c', 'C0     我没有。'], ['ok', 'power  来电了，自动保存救了 C0']],
    [['c', 'term   公寓终端收到未知信号'], ['c', 'term   坐标：云桥 / 雨城 / 锅炉厅 / 潮汐'], ['p', 'X0     门后……是四种天空'], ['p', 'Feline1 那就都去看看吧！']],
    [['p', 'spider 小八：我想当主角'], ['c', 'C0     下个版本吧'], ['p', 'spider 小八：你上次也这么说'], ['w', 'issue  #8 小八想当主角（open）']],
    [['c', 'order  外卖已下单'], ['c', 'order  骑手已接单'], ['c', 'order  骑手距离你 1.2km'], ['ok', 'order  外卖到了，三人暂停工作 🍜']],
    [['w', 'steam  锅炉厅压力 97%'], ['w', 'steam  锅炉厅压力 99%'], ['p', 'Feline1 要炸了吗？！'], ['ok', 'steam  已进入安全模式，虚惊一场']],
    [['c', 'rain   雨城开始下雨'], ['c', 'rain   霓虹招牌闪烁：N_ S_GN_L'], ['p', 'X0     招牌缺了几个字……'], ['ok', 'rain   招牌已修复：NO SIGNAL']]
  ];

  /* ---------- time of day ---------- */
  function timeLines() {
    var h = new Date().getHours();
    if (h >= 0 && h < 5) return [['w', 'night  已经 ' + h + ' 点了，C0 还没睡'], ['p', 'X0     熬夜会掉头发哦'], ['p', 'Feline1 Zzz……'], ['w', 'night  咖啡机：请让我休息']];
    if (h < 9) return [['ok', 'morning 早上好！'], ['p', 'Feline1 早饭吃什么？'], ['c', 'C0     先喝咖啡'], ['ok', 'morning 窗外天亮了']];
    if (h >= 11 && h < 13) return [['c', 'lunch  午饭时间到'], ['p', 'Feline1 想吃鱼！'], ['p', 'X0     画完这一笔就去']];
    if (h >= 17 && h < 19) return [['c', 'dinner 晚饭时间'], ['p', 'Feline1 今天跑了好多关'], ['ok', 'sunset 雪山那边晚霞很好看']];
    if (h >= 22) return [['w', 'late   夜深了'], ['p', 'X0     再画一个小时'], ['c', 'C0     再修一个 bug']];
    return [['c', 'work   专注模式 ON'], ['ok', 'work   今天进度不错']];
  }

  /* ---------- rare easter eggs ---------- */
  var RARE = [
    ['ok', '★ rare  你发现了一条稀有日志！今天会有好运'], ['p', '★ rare  三个人同时说：欢迎回家'], ['w', '★ rare  第五个坐标……是这间公寓？'],
    ['ok', '★ rare  小八织出了一个 ♥'], ['p', '★ rare  猫猫在键盘上打出了 "hello world"']
  ];

  var recent = [], queue = [];
  function next() {
    if (queue.length) return queue.shift();
    var r = R();
    if (r < 0.01) return pick(RARE);
    if (r < 0.1) { var s = pick(STORIES); queue = s.slice(1); return s[0]; }
    if (r < 0.18) return pick(timeLines());
    if (r < 0.55) return pick(GEN)();
    var cand = STATIC.filter(function (x) { return recent.indexOf(x) < 0; }), m = pick(cand);
    recent.push(m); if (recent.length > 24) recent.shift();
    return m;
  }
  /* These are fictional pixel-studio asides, triggered by actual scene activity.
     They are not API / model / deployment telemetry. The whale nickname is a
     community reference (e.g. https://www.bilibili.com/video/BV1BtND69Euf/).
     The other dialogue is original fan-work humour, not attributed quotations
     from the products or claims about their current capabilities.
     dash.js owns the regular terminal feed; append using its same 40-line limit. */
  var studioNames = {
    Feline1: 'F1', C0: 'C0', X0: 'X0', gpt: 'GPT', deepseek: 'DeepSeek',
    claude: 'Claude', grok: 'Grok', gemini: 'Gemini', kimi: 'Kimi', doubao: 'Doubao'
  };
  function studioName(id){return window.StudioCast?StudioCast.name(id):studioNames[id];}
  function studioText(value){return window.StudioCast?StudioCast.localizeText(value):String(value||'').replace(/\bFeline1\b/g,'F1');}
  var studioKinds = { work: 'c', walk: 'p', chat: 'p', heart: 'p', photo: 'ok', visit: 'p', quirk: 'p', perform: 'p', scene: 'ok' };
  var studioSignatureOwners = Object.create(null);
  var studioSignatureGroups = {
    C0: ['c0_debug', 'c0_headset', 'c0_overclock'], X0: ['x0_paint', 'x0_palette', 'x0_sketch'],
    Feline1: ['f1_paws', 'f1_yarn', 'f1_groom'], gpt: ['gpt_think', 'gpt_wings', 'gpt_tea'],
    deepseek: ['deepseek_fish', 'deepseek_bowl', 'deepseek_tail'], claude: ['claude_soul', 'claude_scroll', 'claude_reconnect'],
    grok: ['grok_axe', 'grok_smirk', 'grok_spark'], gemini: ['gemini_stars', 'gemini_twins', 'gemini_tail'],
    kimi: ['kimi_moon', 'kimi_notes', 'kimi_search'], doubao: ['doubao_cookie', 'doubao_drool', 'doubao_idea']
  };
  Object.keys(studioSignatureGroups).forEach(function (id) {
    studioSignatureGroups[id].forEach(function (action) { studioSignatureOwners[action] = id; });
  });
  var studioScenes = {
    'tea-break': ['gpt', 'kimi'], 'art-share': ['X0', 'Feline1'],
    'fish-watch': ['deepseek', 'grok'], 'cookie-share': ['doubao', 'gemini']
  };
  var studioQuirks = { soul: 'claude', slow: 'gpt', nap: 'deepseek', drool: 'doubao', idea: 'doubao', spark: 'grok', palette: 'gemini', notes: 'kimi' };
  // Personality.describe() uses descriptive beat IDs; retain short IDs for callers.
  var studioQuirkAliases = {
    'gpt-slow-steps': 'slow', 'claude-soul-break': 'soul', 'deepseek-nap': 'nap',
    'doubao-daydream': 'drool', 'doubao-little-idea': 'idea', 'grok-spark': 'spark',
    'gemini-color-stars': 'palette', 'kimi-moon-notes': 'notes'
  };
  var studioZones = { office: true, cowork: true, garden: true };
  var lastStudioAt = -Infinity, lastDirectedAt = -Infinity, studioRecent = Object.create(null), lastStudioLine = null;
  var dialogueTimers = [], dialogueEpoch = 0, dialogueRecent = Object.create(null), lastDialogueAt = -Infinity;
  function cancelDialogue() {
    dialogueEpoch++;
    dialogueTimers.forEach(clearTimeout); dialogueTimers = [];
  }
  function appendDialogue(id, epoch) {
    var terminal = document.getElementById('log'), i18n = window.I18N;
    if (epoch !== dialogueEpoch || document.hidden || !terminal || !i18n) return;
    var line = document.createElement('div'), stamp = document.createElement('span'), speech = document.createElement('span');
    var now = new Date(), pad = function (n) { return String(n).padStart(2, '0'); };
    stamp.className = 't';
    stamp.textContent = '[' + pad(now.getHours()) + ':' + pad(now.getMinutes()) + ':' + pad(now.getSeconds()) + '] ';
    speech.className = 'p'; speech.textContent = i18n.log('studio.dialogue.entry', {
      name: studioName(id),
      line: window.StudioCast&&StudioCast.get(id)&&i18n.getLocale()==='zh-CN'?StudioCast.get(id).beats[3].line:studioText(i18n.log('studio.dialogue.' + id))
    });
    line.appendChild(stamp); line.appendChild(speech);
    var cursor = terminal.querySelector('.cursor'); terminal.insertBefore(line, cursor);
    while (terminal.childElementCount - (cursor ? 1 : 0) > 40) terminal.removeChild(terminal.firstElementChild);
    terminal.scrollTop = terminal.scrollHeight;
  }
  function sceneDialogue(detail) {
    if (!detail || !Array.isArray(detail.actors) || document.hidden) return;
    var ids = detail.actors.filter(function (id, i, list) {
      return typeof id === 'string' && Object.prototype.hasOwnProperty.call(studioNames, id) && list.indexOf(id) === i;
    }).slice(0, 2);
    if (ids.length < 2) return;
    var now = Date.now(), pair = ids.slice().sort().join('|');
    if (now - lastDialogueAt < 18000 || dialogueRecent[pair] !== undefined && now - dialogueRecent[pair] < 60000) return;
    cancelDialogue(); var epoch = dialogueEpoch;
    appendDialogue(ids[0], epoch);
    dialogueTimers.push(setTimeout(function () { appendDialogue(ids[1], epoch); }, 1800));
    dialogueRecent[pair] = lastDialogueAt = lastStudioAt = now;
    Object.keys(dialogueRecent).forEach(function (key) { if (now - dialogueRecent[key] > 60000) delete dialogueRecent[key]; });
  }
  function sceneLog(detail) {
    if (!detail || !Object.prototype.hasOwnProperty.call(studioKinds, detail.type) ||
        !Array.isArray(detail.actors) || document.hidden) return;
    var ids = detail.actors.filter(function (id, i, list) {
      return typeof id === 'string' && Object.prototype.hasOwnProperty.call(studioNames, id) && list.indexOf(id) === i;
    }).slice(0, 10);
    var zone = Object.prototype.hasOwnProperty.call(studioZones, detail.zone) ? detail.zone : 'office';
    if (!ids.length) return;
    var isQuirk = detail.type === 'quirk', isPerform = detail.type === 'perform', isScene = detail.type === 'scene';
    var isDirected = isPerform || isScene, quirk = detail.quirk;
    // Stage and completion events drive choreography, but only a real start is
    // a new log entry. Accept only known actions and the cast of that scene.
    if (isDirected) {
      if (detail.phase && detail.phase !== 'start') return;
      if (isPerform) {
        var performance=window.StudioCast&&StudioCast.story(ids[0]);
        var approved=performance&&detail.performance===ids[0]&&performance.beats[Number(detail.stage)||0];
        if(ids.length!==1||!(approved?approved.pose===detail.action:studioSignatureOwners[detail.action]===ids[0]))return;
      }
      if (isScene && (!Object.prototype.hasOwnProperty.call(studioScenes, detail.scene) || ids.length !== 2 ||
          !studioScenes[detail.scene].every(function (id) { return ids.indexOf(id) >= 0; }))) return;
    }
    if (isQuirk) {
      if (Object.prototype.hasOwnProperty.call(studioQuirkAliases, quirk)) quirk = studioQuirkAliases[quirk];
      if (!Object.prototype.hasOwnProperty.call(studioQuirks, quirk) || ids.indexOf(studioQuirks[quirk]) < 0) return;
    }
    var time = Date.now(), stamp = isQuirk ? 'quirk|' + quirk :
      isDirected ? detail.type + '|' + (isPerform ? detail.action : detail.scene) + '|' + ids.slice().sort().join(',') :
      detail.type + '|' + ids.slice().sort().join(',') + '|' + zone;
    // Drop excess events instead of replaying stale activity after the actors leave.
    // A one-shot comedy beat must survive the walk/work event fired in the same
    // update. It has its own 45-second deduplication, bounded to eight known beats.
    if ((isDirected && time - lastDirectedAt < 1500) ||
        (!isDirected && !isQuirk && time - lastStudioAt < 8500) ||
        (isQuirk && time - lastDirectedAt < 8000) ||
        (studioRecent[stamp] !== undefined && time - studioRecent[stamp] < 45000)) return;
    var terminal = document.getElementById('log'), i18n = window.I18N;
    if (!terminal || !i18n) return;
    var speaker = ids.filter(function (id) { return id !== 'Feline1' && id !== 'C0' && id !== 'X0'; })[0] || ids[0];
    var aside = isScene ? i18n.log('studio.scene.line.' + detail.scene) : isPerform ? '' : isQuirk ? i18n.log('studio.quirk.' + quirk) :
      (['work', 'chat', 'heart'].indexOf(detail.type) >= 0 ? i18n.log('studio.aside.' + speaker) : '');
    aside = studioText(aside);
    var castPerformance=isPerform&&window.StudioCast&&detail.performance===ids[0]&&StudioCast.story(ids[0]);
    if(castPerformance&&i18n.getLocale()==='zh-CN')aside=castPerformance.beats[0].line;
    var action = isPerform ? i18n.log('studio.action.perform', { action: castPerformance&&i18n.getLocale()==='zh-CN'?castPerformance.title:i18n.log('studio.signature.' + (castPerformance?studioSignatureGroups[ids[0]][0]:detail.action)) }) :
      isScene ? i18n.log('studio.action.scene', { scene: i18n.log('studio.scene.' + detail.scene) }) :
      i18n.log('studio.action.' + detail.type);
    var msg = i18n.log('studio.entry', {
      actors: ids.map(function (id) { return studioName(id); }).join(' / '),
      zone: i18n.log('studio.zone.' + zone), action: action,
      aside: aside ? ' · ' + aside : ''
    });
    var line = document.createElement('div'), timestamp = document.createElement('span'), text = document.createElement('span');
    var now = new Date(time), pad = function (n) { return String(n).padStart(2, '0'); };
    timestamp.className = 't';
    timestamp.textContent = '[' + pad(now.getHours()) + ':' + pad(now.getMinutes()) + ':' + pad(now.getSeconds()) + '] ';
    text.className = studioKinds[detail.type]; text.textContent = studioText(msg);
    line.appendChild(timestamp); line.appendChild(text);
    var cursor = terminal.querySelector('.cursor');
    // Upgrade the same actor's immediately preceding movement announcement in
    // place. GPT's slow jog then produces one meaningful line, not two.
    if ((isQuirk || isDirected) && lastStudioLine && lastStudioLine.node.parentNode === terminal &&
        lastStudioLine.type !== 'quirk' && time - lastStudioLine.time < 1200 &&
        ids.length === 1 && lastStudioLine.ids.indexOf(ids[0]) >= 0) {
      terminal.replaceChild(line, lastStudioLine.node);
    } else terminal.insertBefore(line, cursor);
    while (terminal.childElementCount - (cursor ? 1 : 0) > 40) terminal.removeChild(terminal.firstElementChild);
    terminal.scrollTop = terminal.scrollHeight;
    lastStudioAt = time; studioRecent[stamp] = time;if (isDirected) lastDirectedAt = time;
    lastStudioLine = { node: line, type: detail.type, ids: ids, time: time };
    Object.keys(studioRecent).forEach(function (key) { if (time - studioRecent[key] > 45000) delete studioRecent[key]; });
  }
  window.addEventListener('studio:activity', function (event) {
    if (event.detail && event.detail.type === 'chat') sceneDialogue(event.detail);
    else sceneLog(event.detail);
  });
  window.addEventListener('c0-language-change', function () {
    // dash.js clears its terminal on a language change; don't retain old-language work.
    cancelDialogue(); dialogueRecent = Object.create(null); lastDialogueAt = -Infinity;
    studioRecent = Object.create(null); lastStudioAt = lastDirectedAt = -Infinity; lastStudioLine = null;
  });
  document.addEventListener('visibilitychange', function () { if (document.hidden) cancelDialogue(); });
  window.addEventListener('pagehide', cancelDialogue);
  window.BuildLog = { next: next, inStory: function () { return queue.length > 0; } };
})();
