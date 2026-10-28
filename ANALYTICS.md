# 主页访问统计

2026-10-28 接入；后台：https://feline1.top/admin#analytics（仅 Feline1 登录用户可读）。

- `js/analytics.js`：每次打开页面生成新的随机访问编号，不跨次识别个人。不使用统计 Cookie，不保存访客编号到本地存储；本地只保存用户主动关闭统计的偏好。
- 默认直接采集，无同意弹窗。右下角“访问统计设置”提供说明和关闭入口；尊重浏览器 DNT / GPC 信号。
- 采集：服务端接收时间、设备类别、来源类别、指定按钮点击和游戏开始/结束事件，以及累计页面可见时长。来源只保存类别，不上传 referrer URL、页面查询参数、输入内容或原始 UA。
- 心跳间隔 15 秒，隐藏/关闭页面尝试补报；可见时间不是用户实际操作时间，强退/断网可能少计。
- 每个目标最多每秒记录一次，每次访问最多 500 条点击/游戏事件；统计受网络、拦截器和伪造请求影响，不用于严格审计。
- 数字表示访问次数，不代表实际人数；刷新会产生新记录。后台“最后上报”不是准确离开时间。

## 服务端

- FastAPI 模块：`/opt/feline1/app/routers/site_analytics.py`，装配在原 `main.py`。
- 独立数据库：`/opt/feline1/analytics/events.sqlite3`，不修改排行榜或旧后台业务表。
- `POST /api/site-analytics/collect`：Origin 仅允许正式 GitHub Pages 域名；无 Cookie、无管理凭据。随机匿名 ID、输入白名单、4 KB 请求限制、进程内短期 IP 摘要限流、序号去重、可见时长上限。
- `GET /api/site-analytics/report?days=7&page=1`：允许 1 / 7 / 30 / 90 天，30 条/页；仅 Feline1 管理 JWT，API key 不可读。
- `GET /api/site-analytics/visits/{id}`：单次访问时间线，同样只允许站长。
- nginx 对该前缀固定代理 8000，避免 Feline2/Feline3 路由 Cookie 干扰，并关闭该 location 的访问日志；现有服务器其他网络/错误日志不属于统计数据库。
- 明细按进入时间保留约 90 天，小时定时清理：`feline-site-analytics-cleanup.timer`。查询会排除过期访问；事件跟随访问级联删除。
- 后台静态文件：`/var/www/html/admin.html`、`/var/www/html/assets/app.js`。新增统计默认入口，旧业务保留；留言板目前只预留入口。
- 部署前备份：`/opt/feline1/backups/site-analytics-20261028T055234Z/`。
- 本机可维护源码与验证脚本：工作区 `site-analytics/`。服务端测试使用临时数据库，不写入生产统计。

## 本地预览

项目根目录 `python3 -m http.server 8765`。本地页面可预览统计设置，但正式采集接口故意拒绝 localhost Origin，避免开发访问混入统计。

## 后续留言板

尚未实现访客提交、审核或公开展示。后续应另建表和公开接口，管理接口复用站长鉴权；不把留言内容混入埋点事件。
