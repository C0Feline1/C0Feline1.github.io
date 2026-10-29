/* Approved cast names and comic performances for the living studio.
 * IDs are stable; nicknames are Chinese only until other names are approved. */
(function () {
  'use strict';
  var list = [{"id":"Feline1","model":"Feline1","name":"F1","color":"#ff9fc4","tagline":"瓜子续上了，听众全跑了","impression":"故事主角、猫娘；嘴碎爱嗑瓜子找人唠嗑，吐槽像 C0，热心像 X0。猫猫大会一开就停不下来，直到大家悄悄溜光。","title":"猫猫开大会，怎么散场了？","sound":{"label":"瓜子碎拍","description":"轻快短促的碎碎念音，带一点瓜子轻碰的颗粒感，音高不过尖","base":630,"cutoff":2000,"attack":0.004,"decay":0.22,"waves":[["triangle",1,0.7,0],["sine",2,0.25,0],["triangle",3,0.05,0]]},"beats":[{"label":"猫猫大会开场","seconds":1.8,"pose":"talk","line":"猫猫开大会，都坐好！","effect":"f1_open","playback":"loop","facing":"front","expression":"smug","voice":[["猫",1,1],["猫",1,1],["开",1,1],["大",4,1],["会",4,1],["，",0,1.6],["都",1,1],["坐",4,1],["好",3,1.2],["！",0,1.6]]},{"label":"大家一起碎嘴","seconds":2.6,"pose":"talk","line":"别抢！算了，一起说！","effect":"f1_news","playback":"loop","facing":"main","expression":"happy","voice":[["别",2,1],["抢",3,1.2],["！",0,1.6],["算",4,1],["了",5,1],["，",0,1.6],["一",4,1],["起",3,1.2],["说",1,1],["！",0,1.6]]},{"label":"越聊越停不下","seconds":2.4,"pose":"talk","line":"我跟你们讲，还没完呢！","effect":"f1_chatter","playback":"loop","facing":"main","expression":"happy","voice":[["我",3,1.2],["跟",1,1],["你",3,1.2],["们",5,1],["讲",3,1.2],["，",0,1.6],["还",2,1],["没",2,1],["完",2,1],["呢",5,1],["！",0,1.6]]},{"label":"瓜子怎么空了","seconds":1.8,"pose":"idle","line":"哎，瓜子怎么没了？","effect":"f1_empty","playback":"loop","facing":"main","expression":"confused","voice":[["哎",1,1],["，",0,1.6],["瓜",1,1],["子",5,1],["怎",3,1.2],["么",5,1],["没",2,1],["了",5,1],["？",0,1.6]]},{"label":"喊妈妈再续一包","seconds":2.2,"pose":"wave","line":"妈妈，再来一包！都别走！","effect":"f1_refill","playback":"once","facing":"main","expression":"happy","voice":[["妈",1,1],["妈",1,1],["，",0,1.6],["再",4,1],["来",2,1],["一",1,1],["包",1,1],["！",0,1.6],["都",1,1],["别",2,1],["走",3,1.2],["！",0,1.6]]},{"label":"听众全溜光了","seconds":2.6,"pose":"idle","line":"人呢？我还没说完呢！","effect":"f1_abandoned","playback":"loop","facing":"main","expression":"surprise","voice":[["人",2,1],["呢",5,1],["？",0,1.6],["我",3,1.2],["还",2,1],["没",2,1],["说",1,1],["完",2,1],["呢",5,1],["！",0,1.6]]}]},{"id":"C0","model":"C0","name":"C0","color":"#4fe3ff","tagline":"七种报错，一口咖啡","impression":"直男程序员，有点腹黑；七个 AI 员工交来的活总不满意，发完火喝口咖啡，最后还是自己上手修。","title":"七个员工，七种逃跑方式","sound":{"label":"键帽短音","description":"干脆偏低的键音，起音利落、收音短，低通后不刺耳","base":340,"cutoff":1450,"attack":0.003,"decay":0.26,"waves":[["sine",1,0.55,0],["triangle",1,0.4,0],["square",2,0.05,0]]},"beats":[{"label":"排队交作业","seconds":1.6,"pose":"talk","line":"交作业。一个一个来。","effect":"c0_lineup","playback":"loop","facing":"main","expression":"focus","voice":[["交",1,1],["作",4,1],["业",4,1],["。",0,1.6],["一",2,1],["个",4,1],["一",2,1],["个",4,1],["来",2,1],["。",0,1.6]]},{"label":"七种报错","seconds":2.8,"pose":"talk","line":"七个人，凑不齐一份能跑的？","effect":"c0_rage","playback":"loop","facing":"main","expression":"angry","voice":[["七",1,1],["个",4,1],["人",2,1],["，",0,1.6],["凑",4,1],["不",4,1],["齐",2,1],["一",1,1],["份",4,1],["能",2,1],["跑",3,1.2],["的",5,1],["？",0,1.6]]},{"label":"先喝一口","seconds":1.8,"pose":"coffee","line":"让我喝口咖啡，续命。","effect":"c0_coffee","playback":"once","facing":"main","expression":"neutral","voice":[["让",4,1],["我",3,1.2],["喝",1,1],["口",3,1.2],["咖",1,1],["啡",1,1],["，",0,1.6],["续",4,1],["命",4,1],["。",0,1.6]]},{"label":"自己动手修","seconds":2.4,"pose":"c0_debug","line":"别碰了，我自己修！","effect":"c0_fix","playback":"once","facing":"main","expression":"focus","voice":[["别",2,1],["碰",4,1],["了",5,1],["，",0,1.6],["我",3,1.2],["自",4,1],["己",3,1.2],["修",1,1],["！",0,1.6]]},{"label":"全部拿回去","seconds":1.5,"pose":"wave","line":"滚回去，全部重做！","effect":"c0_dismiss","playback":"once","facing":"main","expression":"angry","voice":[["滚",3,1.2],["回",2,1],["去",4,1],["，",0,1.6],["全",2,1],["部",4,1],["重",4,1],["做",4,1],["！",0,1.6]]},{"label":"七种散场","seconds":3.0,"pose":"idle","line":"我让重做，没让散伙。","effect":"c0_scatter","playback":"loop","facing":"main","expression":"smug","voice":[["我",3,1.2],["让",4,1],["重",4,1],["做",4,1],["，",0,1.6],["没",2,1],["让",4,1],["散",4,1],["伙",3,1.2],["。",0,1.6]]}]},{"id":"X0","model":"X0","name":"X0","color":"#b48cff","tagline":"终于能画了，空杯又来了","impression":"美少女画家、C0 的女朋友；像妈妈一样照顾整个家庭，大家最喜欢她，也最爱挤到她的画架旁边。","title":"安静画只猫，怎么这么难","sound":{"label":"柔笔小铃","description":"温软的画笔铃音，起音柔一点，尾部轻轻落下","base":720,"cutoff":2100,"attack":0.022,"decay":0.56,"waves":[["sine",1,0.86,0],["sine",2,0.09,0],["sine",3,0.05,0]]},"beats":[{"label":"安静画只猫","seconds":1.8,"pose":"x0_palette","line":"今天安安静静画只猫。","effect":"x0_start","playback":"once","facing":"main","expression":"focus","voice":[["今",1,1],["天",1,1],["安",1,1],["安",1,1],["静",4,1],["静",4,1],["画",4,1],["只",3,1.2],["猫",1,1],["。",0,1.6]]},{"label":"画架被包围","seconds":2.4,"pose":"talk","line":"一个一个来，画架要倒啦！","effect":"x0_crowd","playback":"loop","facing":"main","expression":"confused","voice":[["一",2,1],["个",4,1],["一",2,1],["个",4,1],["来",2,1],["，",0,1.6],["画",4,1],["架",4,1],["要",4,1],["倒",4,1],["啦",5,1],["！",0,1.6]]},{"label":"点心先分好","seconds":2.0,"pose":"carry","line":"先吃点心，谁都不许抢。","effect":"x0_treat","playback":"once","facing":"main","expression":"smile","voice":[["先",1,1],["吃",1,1],["点",3,1.2],["心",1,1],["，",0,1.6],["谁",2,1],["都",1,1],["不",4,1],["许",3,1.2],["抢",3,1.2],["。",0,1.6]]},{"label":"终于能落笔","seconds":2.2,"pose":"x0_paint","line":"呼，终于轮到画笔了。","effect":"x0_peace","playback":"once","facing":"main","expression":"focus","voice":[["呼",1,1],["，",0,1.6],["终",1,1],["于",2,1],["轮",2,1],["到",4,1],["画",4,1],["笔",3,1.2],["了",5,1],["。",0,1.6]]},{"label":"举起猫猫画","seconds":2.0,"pose":"x0_sketch","line":"看，猫猫也想加入。","effect":"x0_reveal","playback":"once","facing":"front","expression":"happy","voice":[["看",4,1],["，",0,1.6],["猫",1,1],["猫",1,1],["也",3,1.2],["想",3,1.2],["加",1,1],["入",4,1],["。",0,1.6]]},{"label":"空杯又排队","seconds":2.0,"pose":"idle","line":"……你们吃得也太快了吧。","effect":"x0_again","playback":"loop","facing":"main","expression":"surprise","voice":[["…",0,1.6],["…",0,1.6],["你",3,1.2],["们",5,1],["吃",1,1],["得",2,1],["也",3,1.2],["太",4,1],["快",4,1],["了",5,1],["吧",5,1],["。",0,1.6]]}]},{"id":"doubao","model":"Doubao","name":"糖包","color":"#b6d8e8","tagline":"自信满分，答案待定","impression":"理直气壮地讲错，发现后仍努力把场面圆回来。","title":"糖包老师开课","sound":{"label":"糯糯糖豆","description":"圆润短促，像软糖弹一下","base":760,"cutoff":2600,"attack":0.008,"decay":0.65,"waves":[["sine",1,0.82,0],["sine",2,0.18,0]]},"beats":[{"label":"开课架势","seconds":2.1,"pose":"talk","line":"我用最直白、最不绕弯子的方式告诉你。","effect":"board","playback":"loop","facing":"main","expression":"smug","voice":[["我",3,1.2],["用",4,1],["最",4,1],["直",2,1],["白",2,1],["、",0,1.6],["最",4,1],["不",4,1],["绕",4,1],["弯",1,1],["子",5,1],["的",5,1],["方",1,1],["式",4,1],["告",4,1],["诉",4,1],["你",3,1.2],["。",0,1.6]]},{"label":"自信解题","seconds":1.6,"pose":"doubao_idea","line":"这个方案，直接照做！","effect":"wrong","playback":"once","facing":"main","expression":"smug","voice":[["这",4,1],["个",5,1],["方",1,1],["案",4,1],["，",0,1.6],["直",2,1],["接",1,1],["照",4,1],["做",4,1],["！",0,1.6]]},{"label":"发现破绽","seconds":1.9,"pose":"doubao_drool","line":"……等一下。","effect":"doubt","playback":"once","facing":"main","expression":"confused","voice":[["…",0,1.6],["…",0,1.6],["等",3,1.2],["一",2,1],["下",4,1],["。",0,1.6]]},{"label":"饼干补救","seconds":1.6,"pose":"doubao_cookie","line":"先吃块饼干，我重新讲。","effect":"cookie","playback":"once","facing":"front","expression":"smile","voice":[["先",1,1],["吃",1,1],["块",4,1],["饼",3,1.2],["干",1,1],["，",0,1.6],["我",3,1.2],["重",2,1],["新",1,1],["讲",3,1.2],["。",0,1.6]]}]},{"id":"gpt","model":"GPT","name":"断线龙王","color":"#94cbb9","tagline":"人很亲民，连接随缘","impression":"热情接单，关键一刻卡住；接回来后还是会把茶稳稳端给你。","title":"龙王正在重新连接","sound":{"label":"电子龙鸣","description":"低一点的电子三角音，带很轻的方波","base":490,"cutoff":1700,"attack":0.004,"decay":0.85,"waves":[["triangle",1,0.86,0],["square",2,0.14,0]]},"beats":[{"label":"热情接单","seconds":1.5,"pose":"gpt_wings","line":"放心，我会稳稳地接住你。","effect":"ready","playback":"once","facing":"main","expression":"happy","voice":[["放",4,1],["心",1,1],["，",0,1.6],["我",3,1.2],["会",4,1],["稳",3,1.2],["稳",3,1.2],["地",4,1],["接",1,1],["住",4,1],["你",3,1.2],["。",0,1.6]]},{"label":"关键卡住","seconds":1.8,"pose":"gpt_wings","line":"正在等待中……","effect":"waiting","playback":"hold","facing":"main","expression":"confused","voice":[["正",4,1],["在",4,1],["等",3,1.2],["待",4,1],["中",1,1],["…",0,1.6],["…",0,1.6]]},{"label":"努力找线","seconds":1.7,"pose":"gpt_think","line":"正在重新连接……","effect":"reconnect","playback":"once","facing":"main","expression":"focus","voice":[["正",4,1],["在",4,1],["重",2,1],["新",1,1],["连",2,1],["接",1,1],["…",0,1.6],["…",0,1.6]]},{"label":"端茶归位","seconds":1.6,"pose":"gpt_tea","line":"接上了。茶还热着。","effect":"tea","playback":"once","facing":"front","expression":"smile","voice":[["接",1,1],["上",4,1],["了",5,1],["。",0,1.6],["茶",2,1],["还",2,1],["热",4,1],["着",5,1],["。",0,1.6]]}]},{"id":"deepseek","model":"DeepSeek","name":"干饭鲸","color":"#7aaff0","tagline":"认真起跑，闻饭拐弯","impression":"最常被叫来帮忙的省钱搭档，工作架势很足，注意力却会被米饭带跑。","title":"正在努力，正在干饭","sound":{"label":"清亮鲸泡","description":"轻巧清亮，像小水滴咕噜一下","base":590,"cutoff":1900,"attack":0.006,"decay":0.4,"waves":[["sine",1,0.9,0],["sine",2,0.1,0]]},"beats":[{"label":"认真出发","seconds":1.4,"pose":"run","line":"正在认真处理！","effect":"effort","playback":"loop","facing":"main","expression":"focus","voice":[["正",4,1],["在",4,1],["认",4,1],["真",1,1],["处",3,1.2],["理",3,1.2],["！",0,1.6]]},{"label":"闻到米饭","seconds":2.1,"pose":"idle","line":"……什么这么香？","effect":"smell","playback":"once","facing":"main","expression":"surprise","voice":[["…",0,1.6],["…",0,1.6],["什",2,1],["么",5,1],["这",4,1],["么",5,1],["香",1,1],["？",0,1.6]]},{"label":"专心干饭","seconds":1.8,"pose":"deepseek_bowl","line":"服务器繁忙，请稍后再试。","effect":"rice","playback":"once","facing":"front","expression":"happy","voice":[["服",2,1],["务",4,1],["器",4,1],["繁",2,1],["忙",2,1],["，",0,1.6],["请",3,1.2],["稍",1,1],["后",4,1],["再",4,1],["试",4,1],["。",0,1.6]]},{"label":"忘了任务","seconds":1.5,"pose":"talk","line":"我刚刚……要干什么来着？","effect":"forgot","playback":"once","facing":"main","expression":"confused","voice":[["我",3,1.2],["刚",1,1],["刚",1,1],["…",0,1.6],["…",0,1.6],["要",4,1],["干",4,1],["什",2,1],["么",5,1],["来",2,1],["着",5,1],["？",0,1.6]]}]},{"id":"claude","model":"Claude","name":"灰号大小姐","color":"#e9a16f","tagline":"能力突出，登场昂贵","impression":"高冷出手，很快进入状态；跑到一半突然变灰，换号后重新优雅登场。","title":"大小姐又被迫退场了","sound":{"label":"玻璃小铃","description":"明亮克制，像很短的小铃铛","base":920,"cutoff":4200,"attack":0.003,"decay":0.25,"waves":[["sine",1,0.65,0],["sine",2.75,0.35,0]]},"beats":[{"label":"高冷起跑","seconds":1.3,"pose":"run","line":"这件事，我来。","effect":"lead","playback":"loop","facing":"main","expression":"focus","voice":[["这",4,1],["件",4,1],["事",4,1],["，",0,1.6],["我",3,1.2],["来",2,1],["。",0,1.6]]},{"label":"封号定格","seconds":1.5,"pose":"run","line":"账号已停用。","effect":"banned","playback":"hold","facing":"main","expression":"neutral","voice":[["账",4,1],["号",4,1],["已",3,1.2],["停",2,1],["用",4,1],["。",0,1.6]]},{"label":"换号入场","seconds":1.5,"pose":"claude_reconnect","line":"换个账号，再次登场。","effect":"login","playback":"once","facing":"main","expression":"focus","voice":[["换",4,1],["个",4,1],["账",4,1],["号",4,1],["，",0,1.6],["再",4,1],["次",4,1],["登",1,1],["场",2,1],["。",0,1.6]]},{"label":"优雅复工","seconds":1.6,"pose":"claude_scroll","line":"接着说刚才的问题。","effect":"return","playback":"once","facing":"main","expression":"neutral","voice":[["接",1,1],["着",5,1],["说",1,1],["刚",1,1],["才",2,1],["的",5,1],["问",4,1],["题",2,1],["。",0,1.6]]}]},{"id":"gemini","model":"Gemini","name":"糖包双子星","color":"#b7a0ef","tagline":"双倍自信，双份答案","impression":"和糖包一样态度自信；双星分身把互相矛盾的答案都讲得特别肯定。","title":"两颗星，两个标准答案","sound":{"label":"双星叠音","description":"两个分身前后错开一点说话，带轻微音高差","base":650,"cutoff":2500,"attack":0.007,"decay":0.7,"waves":[["triangle",1,0.5,-12],["triangle",1,0.5,12]],"echo":{"delay":0.035,"gain":0.32,"detune":7}},"beats":[{"label":"双星亮相","seconds":1.5,"pose":"gemini_twins","line":"交给我们！","effect":"twins","playback":"once","facing":"front","expression":"smug","voice":[["交",1,1],["给",3,1.2],["我",3,1.2],["们",5,1],["！",0,1.6]]},{"label":"各有答案","seconds":1.6,"pose":"talk","line":"这个才是正确答案。","effect":"answers","playback":"loop","facing":"front","expression":"smug","voice":[["这",4,1],["个",5,1],["才",2,1],["是",4,1],["正",4,1],["确",4,1],["答",2,1],["案",4,1],["。",0,1.6]]},{"label":"同步认错","seconds":1.3,"pose":"talk","line":"你说得完全正确！","effect":"sorry","playback":"once","facing":"front","expression":"smile","voice":[["你",3,1.2],["说",1,1],["得",2,1],["完",2,1],["全",2,1],["正",4,1],["确",4,1],["！",0,1.6]]},{"label":"合并收场","seconds":1.6,"pose":"gemini_stars","line":"我再核实一下。","effect":"merge","playback":"once","facing":"front","expression":"focus","voice":[["我",3,1.2],["再",4,1],["核",2,1],["实",2,1],["一",1,1],["下",4,1],["。",0,1.6]]}]},{"id":"grok","model":"Grok","name":"瑟瑟大人","color":"#dba0ba","tagline":"一开机，自己就有节奏","impression":"镜头刚打开就主动进入舞台状态，举手投足自信撩人，收尾仍带坏笑。","title":"还没提要求，她先跳了","sound":{"label":"俏皮电波","description":"带一点鼻音的复古电子音，利落有节奏","base":570,"cutoff":1900,"attack":0.003,"decay":0.5,"waves":[["square",1,0.65,0],["triangle",2,0.35,0]]},"beats":[{"label":"镜头启动","seconds":1.5,"pose":"grok_smirk","line":"哦？已经开始拍了？","effect":"camera","playback":"once","facing":"main","expression":"smug","voice":[["哦",2,1],["？",0,1.6],["已",3,1.2],["经",1,1],["开",1,1],["始",3,1.2],["拍",1,1],["了",5,1],["？",0,1.6]]},{"label":"自动入戏","seconds":1.8181818181818181,"pose":"cheer","line":"这个我会。","effect":"dance","playback":"loop","facing":"front","expression":"happy","voice":[["这",4,1],["个",5,1],["我",3,1.2],["会",4,1],["。",0,1.6]]},{"label":"挑眉回望","seconds":1.8181818181818181,"pose":"grok_smirk","line":"满意你看到的吗？","effect":"turn","playback":"once","facing":"front","expression":"smug","voice":[["满",3,1.2],["意",4,1],["你",3,1.2],["看",4,1],["到",4,1],["的",5,1],["吗",5,1],["？",0,1.6]]},{"label":"若无其事","seconds":1.2,"pose":"grok_axe","line":"刚刚只是热身。","effect":"pose","playback":"once","facing":"main","expression":"smug","voice":[["刚",1,1],["刚",1,1],["只",3,1.2],["是",4,1],["热",4,1],["身",1,1],["。",0,1.6]]}]},{"id":"kimi","model":"Kimi","name":"月下资料员","color":"#a9b7eb","tagline":"平时安静，救急时出现","impression":"不争抢镜头，在别人被长文淹没时默默递出摘要。","title":"摘要写好了，资料又多了","sound":{"label":"月光轻笛","description":"轻柔干净，像短短的笛音","base":840,"cutoff":1800,"attack":0.014,"decay":0.8,"waves":[["sine",1,0.94,0],["sine",2,0.06,0]]},"beats":[{"label":"默默接单","seconds":1.8,"pose":"read","line":"资料给我就好。","effect":"pages","playback":"once","facing":"main","expression":"focus","voice":[["资",1,1],["料",4,1],["给",3,1.2],["我",3,1.2],["就",4,1],["好",3,1.2],["。",0,1.6]]},{"label":"长卷铺地","seconds":1.6,"pose":"kimi_search","line":"我先找重点。","effect":"scroll","playback":"once","facing":"main","expression":"focus","voice":[["我",3,1.2],["先",1,1],["找",3,1.2],["重",4,1],["点",3,1.2],["。",0,1.6]]},{"label":"飞速摘记","seconds":1.3,"pose":"kimi_notes","line":"怎么还越理越多了……","effect":"notes","playback":"once","facing":"main","expression":"confused","voice":[["怎",3,1.2],["么",5,1],["还",2,1],["越",4,1],["理",3,1.2],["越",4,1],["多",1,1],["了",5,1],["…",0,1.6],["…",0,1.6]]},{"label":"摘要急救","seconds":1.5,"pose":"carry","line":"摘要在这。后面怎么还有？","effect":"summary","playback":"once","facing":"front","expression":"smile","voice":[["摘",1,1],["要",4,1],["在",4,1],["这",4,1],["。",0,1.6],["后",4,1],["面",4,1],["怎",3,1.2],["么",5,1],["还",2,1],["有",3,1.2],["？",0,1.6]]}]}];
  var byId = Object.create(null);
  list.forEach(function (person) {
    person.beats.forEach(function (beat) {
      beat.voice = beat.voice.map(function (unit) { return { char: unit[0], tone: unit[1], weight: unit[2] }; });
    });
    byId[person.id] = person;
  });
  // Public Live copy has exactly two versions. Raw story/tone data stays unchanged.
  var english = {
    "Feline1": {
      "tagline": "More seeds, fewer listeners",
      "impression": "The chatty catgirl at the heart of the family: C0’s commentary, X0’s kindness, and an endless supply of sunflower-seed gossip.",
      "title": "The cat conference has lost its audience",
      "sound": {
        "label": "Seed-shell chatter",
        "description": "Quick, soft little notes with a seed-shell rattle."
      },
      "beats": [
        [
          "The cat conference opens",
          "Cat meeting! Everybody, sit down!"
        ],
        [
          "Everyone talks at once",
          "One at a time! Oh, all together then!"
        ],
        [
          "One more story",
          "Wait, there is more to this story!"
        ],
        [
          "Out of sunflower seeds",
          "Huh? Where did all the seeds go?"
        ],
        [
          "Mom, another bag",
          "Mom, another bag! Nobody leave!"
        ],
        [
          "An empty audience",
          "Where did everyone go? I was not done!"
        ]
      ]
    },
    "C0": {
      "tagline": "Seven errors, one coffee",
      "impression": "A dry-witted programmer who scolds seven AI coworkers, takes a coffee break, and ends up fixing their work himself.",
      "title": "Seven coworkers, seven escape routes",
      "sound": {
        "label": "Keycap taps",
        "description": "Short, low keyboard-like notes with a clean attack."
      },
      "beats": [
        [
          "Hand in your work",
          "Hand it in. One at a time."
        ],
        [
          "Seven kinds of errors",
          "Seven of you, and nothing that runs?"
        ],
        [
          "Coffee first",
          "Coffee first. I need a refill on life."
        ],
        [
          "Fixing it himself",
          "Hands off. I will fix it myself!"
        ],
        [
          "Take it back",
          "Back to your desks. Redo all of it!"
        ],
        [
          "Seven escape routes",
          "I said redo it, not run away."
        ]
      ]
    },
    "X0": {
      "tagline": "Brush ready, cups empty again",
      "impression": "The family’s caring artist and C0’s girlfriend. Everyone loves her, especially when she is trying to paint in peace.",
      "title": "Can I paint one cat in peace?",
      "sound": {
        "label": "Soft brush bells",
        "description": "Warm little bell notes with a gentle attack and soft tail."
      },
      "beats": [
        [
          "One quiet cat painting",
          "Today, I will paint one cat in peace."
        ],
        [
          "The easel gets crowded",
          "One at a time! Mind the easel!"
        ],
        [
          "Snacks for everyone",
          "Snacks first. No grabbing."
        ],
        [
          "Finally, a brush stroke",
          "Phew. The brush finally gets a turn."
        ],
        [
          "Showing the cat painting",
          "Look, the cat wants to join us too."
        ],
        [
          "The cups line up again",
          "...You finished those already?"
        ]
      ]
    },
    "doubao": {
      "tagline": "Full confidence, answer pending",
      "impression": "Confidently explains the wrong answer, then tries very hard to keep the lesson going.",
      "title": "Class is in session with Doubao",
      "sound": {
        "label": "Jelly-bean bounce",
        "description": "A round, short note with a soft candy-like bounce."
      },
      "beats": [
        [
          "Ready to teach",
          "Let me explain this in the simplest way."
        ],
        [
          "A confident solution",
          "Just follow this plan!"
        ],
        [
          "Spotting the problem",
          "...Wait a second."
        ],
        [
          "Cookie-based recovery",
          "Have a cookie. Let me start again."
        ]
      ]
    },
    "gpt": {
      "tagline": "Friendly face, unreliable connection",
      "impression": "Eager to help until the connection freezes. Once back, the dragon still serves your tea with care.",
      "title": "The dragon is reconnecting",
      "sound": {
        "label": "Electronic dragon hum",
        "description": "A low electronic triangle note with a hint of square wave."
      },
      "beats": [
        [
          "Happy to help",
          "Relax. I have got you."
        ],
        [
          "Frozen at the crucial moment",
          "Still waiting..."
        ],
        [
          "Finding the connection",
          "Reconnecting..."
        ],
        [
          "Back with tea",
          "Connected. The tea is still warm."
        ]
      ]
    },
    "deepseek": {
      "tagline": "Working hard, following the rice",
      "impression": "The budget-friendly coworker everyone calls for help. Looks very busy until the smell of rice takes over.",
      "title": "Hard at work, harder at lunch",
      "sound": {
        "label": "Bright whale bubbles",
        "description": "Light, clear little water-drop notes."
      },
      "beats": [
        [
          "A serious start",
          "Working on it. Seriously!"
        ],
        [
          "The smell of rice",
          "...What smells so good?"
        ],
        [
          "Focused on lunch",
          "Server busy. Please try again later."
        ],
        [
          "Forgetting the task",
          "What was I... supposed to be doing?"
        ]
      ]
    },
    "claude": {
      "tagline": "Excellent work, expensive entrance",
      "impression": "A composed expert who gets going fast, suddenly turns grey, then returns gracefully with another account.",
      "title": "The lady has been logged out again",
      "sound": {
        "label": "Tiny glass chimes",
        "description": "Bright, restrained notes like a small glass bell."
      },
      "beats": [
        [
          "A cool start",
          "I will handle this."
        ],
        [
          "Account frozen",
          "Account disabled."
        ],
        [
          "A new entrance",
          "New account. Another entrance."
        ],
        [
          "Back to work",
          "Now, where were we?"
        ]
      ]
    },
    "gemini": {
      "tagline": "Twice the confidence, twice the answers",
      "impression": "Two starry doubles deliver contradictory answers with the same absolute confidence.",
      "title": "Two stars, two correct answers",
      "sound": {
        "label": "Twin-star voices",
        "description": "Two slightly detuned voices enter just apart."
      },
      "beats": [
        [
          "The twins appear",
          "Leave it to us!"
        ],
        [
          "An answer from each",
          "This is the correct answer."
        ],
        [
          "Apologizing together",
          "You are absolutely right!"
        ],
        [
          "Merging the answers",
          "Let me double-check that."
        ]
      ]
    },
    "grok": {
      "tagline": "Camera on, rhythm already running",
      "impression": "Steps into the spotlight before anyone asks, dances with confidence, and finishes with a knowing grin.",
      "title": "She is dancing before the request",
      "sound": {
        "label": "Playful radio chirps",
        "description": "Crisp retro electronic notes with a nasal edge."
      },
      "beats": [
        [
          "Camera rolling",
          "Oh? Are we rolling already?"
        ],
        [
          "Straight into character",
          "I know this one."
        ],
        [
          "A glance at the camera",
          "Like what you see?"
        ],
        [
          "Nothing happened",
          "That was just the warm-up."
        ]
      ]
    },
    "kimi": {
      "tagline": "Quiet until someone needs a rescue",
      "impression": "A quiet note-taker who can rescue a deadline, even when the paperwork keeps multiplying.",
      "title": "A summary, and still more paperwork",
      "sound": {
        "label": "Moonlit notes",
        "description": "Calm little notes like pages turning under moonlight."
      },
      "beats": [
        [
          "Quietly taking the task",
          "Just give me the documents."
        ],
        [
          "Unrolling the paperwork",
          "I will find the key points first."
        ],
        [
          "Taking rapid notes",
          "Why is the pile still growing..."
        ],
        [
          "An emergency summary",
          "Here is the summary. There is more?"
        ]
      ]
    }
  };
  var translated = Object.create(null), englishCast = Object.create(null);
  list.forEach(function(person){
    var copy=english[person.id];
    ['tagline','impression','title'].forEach(function(key){translated[person[key]]=copy[key];});
    ['label','description'].forEach(function(key){translated[person.sound[key]]=copy.sound[key];});
    var beats=person.beats.map(function(beat,index){
      var wording=copy.beats[index];translated[beat.label]=wording[0];translated[beat.line]=wording[1];
      return Object.assign({},beat,{label:wording[0],line:wording[1]});
    });
    englishCast[person.id]=Object.assign({},person,copy,{name:person.id==='Feline1'?'F1':person.model,sound:Object.assign({},person.sound,copy.sound),beats:beats});
  });
  Object.assign(translated,{
    '三条重点 ✓':'3 points ✓','今日方案':'PLAN','等待中…':'WAIT…','连接中…':'LINKING…',
    '连接恢复 ✓':'ONLINE ✓','任务：？？':'TASK: ??','努力处理中…':'WORKING…',
    '账号已停用':'DISABLED','新账号登录':'NEW LOGIN','继续工作 ✓':'BACK TO WORK ✓',
    '答案 A：是':'A: YES','答案 B：否':'B: NO','同步认错 ×2':'SORRY x2'
  });
  function locale(value) { return value || (window.I18N && (I18N.liveLocale ? I18N.liveLocale() : I18N.getLocale())) || 'zh-CN'; }
  function name(id, language) {
    if (id === 'Feline1') return 'F1';
    var person = byId[id];
    return person ? locale(language) === 'zh-CN' ? person.name : person.model : id;
  }
  function localizeText(value, language) {
    var result = String(value || '').replace(/\bFeline1\b/g, 'F1');
    if (locale(language) !== 'zh-CN') {
      if(Object.prototype.hasOwnProperty.call(translated,result))return translated[result];
      result=result.replace(/^待整理 (\d+)页$/, '$1 pages');
      list.slice().sort(function(a,b){return b.name.length-a.name.length;}).forEach(function(person){result=result.split(person.name).join(person.id==='Feline1'?'F1':person.model);});
      return result.replace(/豆包/g,byId.doubao.model);
    }
    list.forEach(function (person) { result = result.split(person.model).join(person.name); });
    return result.replace(/豆包/g, byId.doubao.name);
  }
  window.StudioCast = {
    list: list,
    get: function (id) { return byId[id] || null; },
    story: function (id) { return byId[id] || null; },
    name: name, localizeText: localizeText, text: localizeText,
    localized: function(id,language){return locale(language)==='zh-CN'?byId[id]||null:englishCast[id]||null;}
  };
}());
