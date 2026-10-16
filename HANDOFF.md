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
- `js/game.js`：世界时长按速度自动算（约 25 秒/世界）；每个世界有自己的关卡片段轮换（`SETS`：阶梯平台、浮桥、弹簧、滑铲横杆、爬墙竖井、射击场、道具点）；道具（磁铁、双倍、泡泡盾、迷你火箭）；↓ 滑铲/快速下落/穿过平台，← → 微调位置；C 技能（C0 超频），F/X 射击（GUN 世界）。
- 排行榜：每局都会 `/qualify`（不再只看本地最高分），`/start` 失败会重试。分数公式未改（距离 + 星砂×25），服务器校验不受影响。
- 调试钩子：`window.__KR_DEBUG()`、`window.__KR_T`（只读测试用，可删）。

## Round 3
- Pits / world transitions: no pit may spawn within 60 m of a world boundary (`PIT_SAFE`), the switch is delayed while a pit is under/near the runner (`pitNear`), wide pits are only removed once fully off-screen (`o.x + o.w < -40`), pits are never ghosted, platforms only fade when the control mode changes, a runner whose pit slid away while shallow stands on the lip.
- DOWN is hold-to-crouch (keyboard ↓/S, D-pad ▼ hold, swipe-and-hold); stays low while under a low bar; blur releases all held keys.
- Wall-jump happens ON THE ROAD: a pillar (arch, run in under it) + a cliff face; the road pauses, tap to hop wall-to-wall, then hop onto the raised ledge and keep running; the ledge steps back down. Lap 1: no spikes and 64 px climb; spikes/height ramp from lap 2 (`shaftLayout`). Obstacle density also ramps by lap (`lz`).
- Rest houses (home/cabin/sakura/snow set pieces): run in the door → cosy room (no hazards, no scroll): fish snack → feed/pet the cat (+heart), lamp switch, music box, photo of C0/X0/Feline1, bookshelf secret (power-up); DOWN = use; exit door on the right returns to the same road.
- Bigger touch controls (D-pad 150 px, A/B 66 px, SKILL/FIRE 72×50, SOUND 48 px tall), key labels on buttons, help text cut to one line (hidden on phones), no horizontal overflow at 360–430 px.
- build.log capped at 40 lines.
