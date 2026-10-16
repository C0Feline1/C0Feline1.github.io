/* build.log content: static lines, templated lines, multi-line mini stories, time-aware lines and rare easter eggs. */
(function () {
  var R = Math.random, pick = function (a) { return a[Math.floor(R() * a.length)]; };
  var int = function (a, b) { return a + Math.floor(R() * (b - a + 1)); };
  var hex = function (n) { var s = ''; while (s.length < n) s += Math.floor(R() * 16).toString(16); return s; };

  /* ---------- static pool [class, text] ---------- */
  var STATIC = [
    ['c', 'build  pixel-atlas 生成完毕（0 张图片，全靠代码）'], ['c', 'C0     正在和编译器吵架'], ['c', 'C0     把 tab 改成了 2 个空格，又改回来了'],
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
  window.BuildLog = { next: next, inStory: function () { return queue.length > 0; } };
})();
