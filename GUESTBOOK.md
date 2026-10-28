# 主页留言板

2026-10-28 已实现并上线。

- 主页：页面下方的「留言板」；手机在信息面板中选择「留言」。
- 管理：https://feline1.top/admin#guestbook，仅 Feline1 登录账号可管理。
- 流程：访客提交昵称和留言 → 待审核 → 站长审核通过 → 公开展示。
- 支持站长回复、隐藏、可恢复删除、按状态筛选和分页。删除进入回收分类，不做不可恢复清空。
- 公开留言区只展示简短欢迎语；提交后的成功提示告知需等待审核。服务器存储等技术说明保留在维护文档，不出现在访客界面。

## 前端

`js/guestbook.js` 提供公开列表、表单、字数校验、错误重试和 15 秒请求超时。失败会保留输入；成功显示待审核提示。所有留言和回复通过文本节点渲染，HTML 不执行。英文界面随主页语言切换；其他语言暂回退英文。

手机信息面板在 `js/dash.js` 的 DOCK 中加入 guestbook；桌面留言区位于全局粉框内，宽屏占完整一行。

## 后端

- 模块：`/opt/feline1/app/routers/guestbook.py`
- 数据库：`/opt/feline1/guestbook/messages.sqlite3`，与统计、排行榜、旧后台业务独立。
- `GET /api/guestbook/messages?page=1`：每页 20 条，仅返回已公开内容。
- `POST /api/guestbook/messages`：JSON `{nickname,message,website:""}`，昵称 1–24 字、留言 1–1000 字。返回 202 待审核。仅允许正式主页 Origin。
- `GET /api/guestbook/admin/messages?status=pending&page=1`：状态可为 pending/approved/hidden/deleted/all，返回留言、分类数量和分页信息。
- `PATCH /api/guestbook/admin/messages/{id}`：JSON `{status?,reply?}`；回复最多 1000 字。管理只接受站长 JWT，API key 和其他用户不可访问。
- 防滥用：8 KB 请求上限、输入检查、蜜罐、每来源地址每小时最多 5 条新留言、10 分钟最多 20 次尝试、10 分钟内相同留言重试去重。
- 不保存原始 IP；限流用进程内随机盐摘要；nginx 此 API 前缀关闭访问日志。其他服务器日志不属于留言库。
- 待审核、隐藏和已删除留言及其回复均不从公开接口返回。已打开的页面须刷新留言列表才能反映最新审核状态。
- 留言没有自动到期清理，后台删除可恢复。

## 部署与维护

源码维护包在本机工作区 `site-analytics/`；部署前备份 `/opt/feline1/backups/guestbook-20261028T060153Z/`。后台静态资源 `/var/www/html/admin.html`、`/var/www/html/assets/app.js`。首次部署脚本不可直接作为更新脚本重复执行。

验证：后端6组隔离数据库测试；前端安全文本、分页、输入校验、失败和超时保留输入、成功待审核提示、语言切换测试；上线后浏览器验证提交、审核、回复展示、隐藏和恢复。
