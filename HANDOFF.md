# 交接说明（2026-10-16）

纯静态站点：无构建步骤、无依赖，由 GitHub Pages 直接发布 `main` 分支根目录。

## 仓库与部署

- GitHub 账号：`C0Feline1`（原 `cyf211514104`，已改名）
- 仓库：https://github.com/C0Feline1/C0Feline1.github.io （默认分支 `main`）
- 发布方式：GitHub Pages，来源 `main` 分支 `/`（legacy 模式）
- 部署流程：`git push origin main` → 约 1～2 分钟后自动上线。无需 npm / 打包。
- 本地预览：在项目目录运行 `python -m http.server 8765`，打开 http://localhost:8765/
  （8765 端口已在排行榜服务器 CORS 白名单中，本地可直接连排行榜）
- Git 提交身份：`C0Feline1 <32412677+C0Feline1@users.noreply.github.com>`

## 线上链接

| 用途 | 地址 |
| --- | --- |
| 主页 / Play 商店"网站" | https://c0feline1.github.io/ |
| 隐私政策（Play 隐私政策字段） | https://c0feline1.github.io/stardream-gallery-privacy/ |
| AdMob app-ads.txt | https://c0feline1.github.io/app-ads.txt |
| 排行榜 API | https://feline1.top/api/kr |

`app-ads.txt` 内容：`google.com, pub-3697974115457427, DIRECT, f08c47fec0942fa0`。
AdMob 通过 Play 商店详情页的"网站"域名去根目录找该文件，不需要在 AdMob 里单独填文件链接。
Play Console 与 AdMob 侧已手动更新；隐私政策在 Play 中显示"审核中"，等待即可。

## 文件结构

- `index.html`：主页（样式内联）
- `js/pixel.js` 像素角色 · `js/game.js` 跑酷小游戏与音效 · `js/board.js` 排行榜前端
  · `js/dash.js` 仪表盘 · `js/logs.js` 假构建日志 · `js/spider.js` 小八
  · `js/music.js` BGM 开关
- `music/feline-neon-loop-v3.wav`：背景音乐，由 `tools/compose_loop.py` 用代码合成
  （`python tools/compose_loop.py` 重新生成，只用标准库）
- `stardream-gallery-privacy/index.html`：隐私政策（中英文）

## 排行榜服务器

- 前端：`js/board.js` 里 `API = 'https://feline1.top/api/kr'`，接口 `/top` `/qualify` `/start` `/submit`。
- 服务器：`feline1.top`（Ubuntu，nginx）。nginx 配置 `/etc/nginx/sites-available/default` 的
  `location ^~ /api/kr/` 反代到 `127.0.0.1:8092`。
- 后端：`/opt/kittyrunner/app/kr_server.py`，systemd 服务 `kittyrunner.service`，
  数据库 `/opt/kittyrunner/data/scores.db`。
- **CORS 白名单**在 `kr_server.py` 的 `ORIGINS` 变量里。已加入
  `https://c0feline1.github.io`（旧的 `cyf211514104.github.io` 仍保留，可删）。
  今后更换域名/账号，必须同步修改它，否则排行榜显示 OFFLINE。
  修改后执行：`systemctl restart kittyrunner.service`。
  修改前备份：`kr_server.py.bak-20261016`。
- SSH 登录信息（私钥路径、账号等）见桌面 `Feline服务器连接说明.txt`，**不要写进仓库**。

## 注意 / 待办

- 排行榜当前为空（`{"top": []}`），属正常，尚无人上榜。
- 页面上的数据多为"演出来"的装饰，只有作品与法律链接是真实的。
- 若改 GitHub 用户名或仓库名，需同步：Pages 地址、Play 商店网站/隐私政策、
  服务器 CORS 白名单、本地 `git remote`。

## 2026-10-16 改版（work copy）

- `js/audio.js`：统一声音系统 `window.SND`（一个开关，`localStorage['sound-on']`）。页面 BGM（wav）、23 个世界各自的芯片音乐（代码内音序器，歌曲数据在 `SONGS`）、游戏音效、小八音效都走同一个 AudioContext。游戏进行时页面 BGM 自动淡出；换世界在下一小节用噪声上扬 + 交叉淡入切歌。
- `js/game.js`：世界时长按速度自动算（约 25 秒/世界）；每个世界有自己的关卡片段轮换（`SETS`：阶梯平台、浮桥、弹簧、滑铲横杆、爬墙竖井、射击场、道具点）；道具（磁铁、双倍、泡泡盾、迷你火箭）；↓ 滑铲/快速下落/穿过平台，← → 微调位置；A 技能（C0 超频），S 射击（GUN 世界）（键位见 Keys 一节）。
- 排行榜：每局都会 `/qualify`（不再只看本地最高分），`/start` 失败会重试。分数公式未改（距离 + 星砂×25），服务器校验不受影响。
- 调试钩子：`window.__KR_DEBUG()`、`window.__KR_T`（只读测试用，可删）。

## Round 3
- Pits / world transitions: no pit may spawn within 60 m of a world boundary (`PIT_SAFE`), the switch is delayed while a pit is under/near the runner (`pitNear`), wide pits are only removed once fully off-screen (`o.x + o.w < -40`), pits are never ghosted, platforms only fade when the control mode changes, a runner whose pit slid away while shallow stands on the lip.
- DOWN is hold-to-crouch (keyboard ↓, D-pad ▼ hold, swipe-and-hold); stays low while under a low bar; blur releases all held keys.
- Wall-jump happens ON THE ROAD: a pillar (arch, run in under it) + a cliff face; the road pauses, tap to hop wall-to-wall, then hop onto the raised ledge and keep running; the ledge steps back down. Lap 1: no spikes and 64 px climb; spikes/height ramp from lap 2 (`shaftLayout`). Obstacle density also ramps by lap (`lz`).
- Rest houses (home/cabin/sakura/snow set pieces): run in the door → cosy room (no hazards, no scroll): fish snack → feed/pet the cat (+heart), lamp switch, music box, photo of C0/X0/Feline1, bookshelf secret (power-up); DOWN = use; exit door on the right returns to the same road.
- Bigger touch controls (D-pad 150 px, A/B 66 px, SKILL/FIRE 72×50, SOUND 48 px tall), key labels on buttons, help text cut to one line (hidden on phones), no horizontal overflow at 360–430 px.
- build.log capped at 40 lines.

## Keys
- (Phase 3C, Switch layout) Z = **A** jump / confirm (Space, ↑, Enter also work) · X = **B** skill in a run (C0 overclock), back / select in menus · A = **X** attack (Feline1: hold ~0.6 s to switch claw ↔ yarn ball) · S = **Y** interact (enter a rest house / the oasis, use toys, leave by the exit door; on the title it opens the menu row) · ↓ hold to crouch · ← → move · P / Esc = **+** pause · M = music. **−** on the left Joy-Con = the old B (select / pause). 1/2/3 pick a character on the title screen. Arrows only, no WASD. Keys are case-insensitive. Tapping / clicking the game screen does nothing in a run (it only focuses the game and starts it from the title).

## Phase 2（2026-10-17）
- 排行榜区：左 TOP100（固定高度、内部滚动、超长名字省略号），右"广告位招租"（像素风车；小八碰到风车会被甩飞，晕一下再爬起来）。不是真广告，没有第三方脚本。
- 结算弹窗：死亡立刻弹出并锁住新开局；Esc = 确认（再按一次才放弃）；排行榜刷新不会盖掉"本局不计分"；提交失败会一直显示错误 + 重试按钮。
- 国家 / 地区：弹窗里可搜索的 ISO 3166-1 alpha-2 列表（中文名 + 国旗 emoji，`Intl.DisplayNames` 生成名字），默认按 `navigator.language` 猜，可选"🏳️ 未选"。记在 `localStorage['runner-cc']`。Windows 不显示国旗 emoji：检测到后改为显示两位代码小徽章（如 `JP`），不下载任何图片。
- 小八音效独立于游戏 SOUND：左下角 🕷 开关（手机上在页首右上角），`localStorage['spider-sound']`，首次点击/按键后解锁。
- 游戏：休息屋按地点换主题（公寓 / 茶室 / 山屋 / 木屋），每屋 7 个可互动物件（↓ 使用，各给一次小奖励），最多停留 4 分钟；爬墙竖井更高（150/200/250 m 目标，第 1 圈无尖刺）并带纵向镜头；最后一个世界（湖）之后进入"一圈完成！"派对房间（本圈小结）；第 2 圈起世界顺序打乱（家在最前、湖在最后、Boss 在倒数第 2/3、庭院在中段、休息屋间隔 ≥ 4 个世界）。

## 排行榜服务器 · 严格校验（重要）
- 服务器代码不在本仓库里（防作弊规则不公开），交付文件：`server/kr_server.py`（替换 `/opt/kittyrunner/app/kr_server.py`），测试 `server/test/test_server.py`。
- **`GAME_VERSION`**：`js/game.js` 里的 `GAME_VERSION` 与 `kr_server.py` 里的 `GAME_VERSION` 必须一致。客户端提交时带 `v`，版本不符服务器返回 426「游戏版本已更新，请刷新页面后再玩」。
- **改了世界长度 / 顺序 / 速度 / 房间 / 星砂数量，就必须同时更新服务器的表**（`WORLDS`、`ROOM_MAX`、`COURT_MAX`、`SHARD_CAP`、`CLIMB_MAX` 等），并把两边的 `GAME_VERSION` 一起改掉，然后跑 `server/test/test_server.py`（会用真实游戏生成诚实成绩）。否则正常玩家的成绩会被拒。`KittyRunner.meta()` 会输出当前游戏的表，可直接对照。
- 部署顺序：先换服务器、重启 `kittyrunner.service`，再推前端（或几乎同时）。旧页面在换服后提交会收到 426，提示刷新。
- 数据库自动迁移：启动时对 `scores` 表 `ALTER TABLE ADD COLUMN cc`、`ver`（缺才加），旧数据保留，`/top` 多返回 `cc`（旧记录为空）。环境变量与原来一致（`KR_DB` / `KR_PORT` / `KR_SALT`），只用标准库。
- 拒绝原因写到 stderr（journald：`journalctl -u kittyrunner.service`），格式 `kr: ip=<盐化哈希前 10 位> reject <原因> ...`，不记 IP 和名字。
- 局限：游戏逻辑在浏览器里跑，服务器只能检查"这份成绩是否可能由真实游戏产生"；星砂上限按"全程双倍 + 磁铁"估算，作弊者最多只能刷到上限附近。

## Phase 3A（2026-10-18，前端，不改服务器）
- 版本：所有脚本 `?v=20261018a`；`GAME_VERSION` 仍是 `kr2-20261017`，提交格式未变，服务器不用换。
- 性能：画布滚出屏幕（<30% 可见）时，非游戏状态停掉 rAF。如果本局开始时画布可见，游戏中滚走会自动暂停。任意输入（`kick()`）会重启循环。dash.js 的风车/工作室/图表在屏幕外也会停。光源改成预渲染精灵，GB 抖动查表，粒子上限 240。卡顿检测：连续两个 3 秒窗口里超过 25% 的帧大于 20.5 ms，就自动进入"精简特效"（无天气粒子/震屏/描边/回声）。可用 `KittyRunner.lowfx(true/false)` 手动切换。
- 手机（≤520px）：面板边距收窄，390px 宽时画布 354px。
- 画面：危险物按世界配色描边，暗色世界危险物会发光。世界之间有门（拱门/绿洲/霓虹/光环）。横幅带下一世界缩略图，最后 8 秒显示 NEXT 预览。进度条按真实顺序排列，并标出 Boss/庭院/休息屋/派对。沙漠、镜像、鬼屋、湖新增一层视差远景。
- 难度：按世界调整间距（`GAPMUL`）。天空城同屏危险物上限 5。西安前 30% 放缓。后期世界在 60–80% 处有"高潮"段，不给星砂：狼群、滚木、冰锥、蝙蝠群、冰裂。非跑步世界新增片段（翻转：双门/链/镜像迷宫；喷气：阀门/齿轮隧道；游泳：洋流/气泡柱/水母/风车），每段 ≤4 星砂。
- 庭院改成"绿洲歇脚处"：规则不变，灯笼换成火把。
- 新菜单（标题画面底部一行）：
  - PRACTICE：练习任意已到过的世界。**不调用 /start 或 /submit**，不计最高分。board.js / dash.js 会忽略带 `practice:true` 的事件。
  - ALBUM：房间里所有付费玩具都玩过，或完成庭院，就解锁照片，共 6 张。
  - BADGES：无伤、收集 ≥90%、GUN 世界 5 杀。
- 房间：主角闲置约 2.5 秒后，同伴会自己去玩玩具（有表情图标）。窗/灯笼/台灯的开关状态本局内记住。派对房间小结显示收集率、受伤、时间、最佳圈速，以及下一圈的顺序。
- 提示：每个世界只显示一行提示，进入 10 秒后出现，每种最多出现 3 次。
- 音频：音效总线加大，每首歌做响度归一化，跳跃/拿星砂/受伤时音乐会短暂压低（duck）。
- 新 localStorage 键：`runner-hints`、`runner-album`、`runner-badges`、`runner-bestlap`。
- 星砂上限核对：做了 18 个种子、每个 8 圈的测试，机器人全程开着双倍 + 磁铁，所有世界/圈都在 `SHARD_CAP` 以内。离上限最近的是 haunt 第 3 圈及以后（160/164），以及 xian 第 1 圈（154/166）。线上版本用同样的测试也有几格到 90% 以上（ink、volcano、space、haunt）。Batch C 改版本号时，建议用更多种子重新标定 `SHARD_CAP`。

## Phase 3B（2026-10-18，美术 + 爬墙，不改服务器）
- 版本：`?v=20261018b`；`GAME_VERSION` 仍是 `kr2-20261017`，提交格式不变，服务器不用换。
- A2 三个人物（`js/pixel.js` "characters v3"）：每人有自己的头部、身体、腿部图块。先按图块画好，再自动描边，画布仍是 16×24。碰撞盒在 `game.js` 的 `pbox()` 里，和美术无关，这次没有改动。
  - C0（程序员）：刺猬头、眼镜、耳机 + 麦克风、连帽衫、牛仔裤、球鞋。跑步时身体前倾、摆臂，步频最快。超频时眼镜发青光（`s.glow`）。滑铲是脚先滑出、抱着笔记本。房间待机时敲键盘、喝咖啡、推眼镜。
  - X0（女朋友，美少女）：长发和蝴蝶结。头发有 4 种状态（静止 / 两帧飘动 / 上扬），裙摆 3 帧摆动，步子轻、步频慢。跳跃和下落时头发上扬，翻转重力的空中也一样。待机时撩头发、拿画笔。护盾开着时身后留下彩色颜料点。滑铲是跪滑，长发向后飘。
  - Feline1（猫娘）：猫耳、短发、尾巴（4 种摆动 + 落地炸毛）、肉垫手套、粉裙、白丝袜。跑步一蹦一跳，耳朵会抖。二段跳时空翻一圈。受伤时耳朵下垂。滑铲是单膝低身滑。待机时舔爪子、甩尾巴。
  - 新增帧：`idle[]`、`slide`、`climb[2]`、`swim[2]`、`ride`（飞行）、`jet`、`land`、`cheer`、`skill`、`glow`。房间里主角站着不动约 1.5 秒后开始播待机动作；同伴到了玩具旁边也会播待机；派对房间里会欢呼；标题画面上没选中的人物也在做待机动作。
- G9 爬墙：
  - 每个世界的墙有自己的贴图（`CLIMB_SKIN`）：集市红砖、樱花木墙、黄沙砂岩、鬼屋破砖、霜脊花岗岩、岩洞钟乳石、冰湖冰壁。墙顶也有对应装饰。
  - 第 2 圈起加入陷阱（`CLIMB_HAZ`）：
    - 黄沙 / 岩洞 / 霜脊：落石。先抖动并显示红色虚线预警，再沿一列落下。
    - 集市 / 樱花 / 鬼屋：原有尖刺改成上下滑动。
    - 冰湖：冰踏点挂住约 0.6 秒就会碎，碎掉 2.5 秒后长回来。
  - 目标高度、硬币、+3 奖励和 45 秒"HELPING PAW"都没变，所以服务器的 `CLIMB_MAX` 和时间上限不用改。陷阱在离开阶段和被帮助后都不会生效。

## Phase 3C（2026-10-18，玩法 + 主机外观 + 服务器 kr3，**要换服务器**）
- 版本：所有脚本 `?v=20261018i`（建立在热修复 20a6714 / `?v=20261018h` 之上）；`GAME_VERSION = 'kr3-20261018'`（`js/game.js` 与 `server/kr_server.py` 一致）。**部署顺序：先换服务器并重启 `kittyrunner.service`，再推前端**。kr3 服务器会给旧页面（kr2）返回 426「请刷新」。提交格式（cc, cps, dist, frames, name, nonce, run, score, shards, v）没有变。
- `/top` 每行新增 `ts`（整数，Unix 秒），`date` 保留。排行榜在每行显示上榜时间，用看榜人自己的时区（"MM-DD HH:mm"，往年的显示日期），鼠标悬停显示完整时间；旧接口没有 `ts` 时退回显示 `date`。
- G3 每圈打乱的规则（第 2 圈起，客户端 `lapOrderOk` 与服务器 `g3_step` 规则一样）：
  - 非跑步世界最多连续 2 个；
  - 第 1–2 格不能是重力翻转世界，也不能是难世界（天空城、太空、镜湖）；
  - 两个难世界至少隔 4 格，两个小 Boss 世界（火山、鬼屋）也至少隔 4 格；
  - Boss（山顶）前一格不能是难世界或小 Boss 世界。
  - 客户端先随机抽样，抽不到就用 `SAFE_ORDER` 兜底。测试用 600 个真实生成的顺序跑服务器规则，全部通过。
- G4：第 2 圈起出现精英怪（金色闪光，击败掉更多星砂），短世界（≤480 m）在第 2 圈起障碍间距 ×0.78。
- G5 小 Boss（世界进度 32%–80% 之间）：火山 LAVA EEL（突进 / 掠地 / 吐火，都有预警；无伤 +10，否则 +5）；鬼屋 BUTLER GHOST（扔高 / 低盘子，第 2 圈起还会扔两个低杯子；HP 20+6/圈；远程打它，或近战把盘子拍回去；击败 +10，撑过去 +4）。HUD 第 35 行有血条。
- 键位 / 主机（Switch 风格）：见上面 Keys 一节。左 Joy-Con（蓝）：十字键 + −；右 Joy-Con（红）：X/Y/A/B 菱形（X 上、A 右、B 下、Y 左）+ +。默认是"左手柄 | 屏幕 | 右手柄"；如果竖排（屏幕在上，两个手柄并排在下）能让屏幕大 15% 以上，就用竖排（手机，以及 1920×1080 这种中栏窄而高的情况）。主机和键盘说明在高面板里一起垂直居中。画面保持 3:2 并尽量放大（桌面上差 10% 以内会对齐到整数倍）。左上角突出的标签按钮「♪ 音乐 开 / 关」切换音乐。键盘说明在主机下方（≤520px 隐藏）。点主机任意位置只会在标题画面开始游戏；游戏中点屏幕不会触发任何操作。SKILL/FIRE 按钮已去掉。
- 攻击（X / 键 A）：每个世界都能攻击。能被打的是动物 / 敌人 / 符咒 / 齿轮，尖刺和坑打不掉。击败掉 1 星砂（高潮段的不掉）。
  - Feline1：猫爪近战（伤害高、范围大、距离短）。按住约 0.6 秒切换成毛线球远程，会弹字提示当前模式。
  - C0：代码弹 `{ }` `</>`。
  - X0：画笔近战，挥出彩色弧线并留下颜料拖尾。
  - 每种攻击有自己的音效和命中特效。近战可以把管家的盘子拍回去。
  - 徽章"5 杀"现在每个世界都有，每个世界 3 个徽章。
- 休息站可选：路边的休息屋出现时，经过门口按 Y（键 S）进屋，直接跑过去就跳过。绿洲也一样：在它前一个世界的最后 48 m 或绿洲那 10 m 里按 Y 进入，否则直接穿过。世界顺序和检查点（`court` 世界照常记录）都不变。圈末派对房间仍然必进。服务器本来就把 `H:<房间>` 当可选；绿洲的检查只限制时间和星砂上限，所以进不进都能通过。测试里有"全部跳过"和"随机进 / 跳"两种诚实成绩，都被接受。
- PRACTICE 重做：只有正式跑到过的世界能选（`localStorage['runner-seen']`；旧存档里有徽章的世界也算到过），没到过的显示锁和"？？？"。选中的世界无限循环，每 20 秒升一级，最高 LV 10（之后保持）：障碍更密（间距最多 ×0.6）、精英怪、片段更频繁、LV 5 起有落物。速度不加，只随世界内的距离小幅变化，每圈重置。HUD 显示 `PRACTICE LV n` 和升级进度条。结算页显示 LV / 圈数 / 时间。练习**不调用 /start 或 /submit**。
- 新 localStorage 键：`runner-seen`。
- `SHARD_CAP` 重新标定（`server/test/measure.py`，约 1700 个种子 × 8 圈）：机器人全程开着双倍 + 磁铁（实际玩不到），每个世界都攻击，休息站随机进或跳。公式 `cap = ceil((最大值 + extra) × 1.08 / 0.8)`，后面的圈不低于前面的圈；extra：火山 +5（鳗鱼无伤奖励机器人拿不到），鬼屋 +6（击败管家和撑过去的奖励差）。机器人的最大值 ≤ 每格上限的 74%。另外用 1400 个种子算出的上限去检验另外 300 个种子，最高也只到 80%。
- 测试：`server/test/test_server.py`（诚实成绩里包括"全部跳过休息站"和"随机进 / 跳"；G3 作弊会按正确的原因被拒；也测了 600 个真实生成的顺序）。前端测试脚本在 `/workspace/site/p3c/`（不在仓库里）。
