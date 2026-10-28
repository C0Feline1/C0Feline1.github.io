# 语言自动匹配

2026-10-28：主页、留言板、访问统计设置和小八对白支持当前全部9种语言：简体中文、英语、日语、俄语、西班牙语、葡萄牙葡语、巴西葡语、德语和拉丁语。

选择优先级：

1. 上次手动选择（`localStorage['c0-site-language']`）。
2. 浏览器首选语言列表，逐项匹配支持的语言及地区变体。
3. 浏览器所有语言都不支持时，请求站长服务器的 IP 国家建议。
4. 网络或地区查询失败，使用英文。

选择下拉框中的「自动」会清除手动偏好，重新匹配。IP 建议最多等3秒，不阻塞页面；较晚响应不会覆盖用户新的手动选择。不会自动翻译访客留言或站长回复。浏览器语言和 IP 地区只是语言提示，VPN、代理或数据库误差可能影响国家结果；不采用浏览器精确定位。

浏览器匹配例子：`zh-TW/zh-HK/zh-Hans` 采用当前唯一中文包简体中文；`en-US/en-GB` 采用英语；`pt-BR` 采用巴西葡语，`pt-PT/pt-AO/pt` 采用葡萄牙葡语。不存在对应语言包时优先尝试浏览器语言列表的下一项。

## 服务器

- 路由：`GET https://feline1.top/api/site-locale`。
- 返回 `{country,locale,source}`，source 为 ip 或 unavailable。
- 模块 `/opt/feline1/app/routers/site_locale.py`；启动时 `init_site_locale()` 预加载本地 IPv4/IPv6 索引。
- 数据 `/opt/feline1/locale/dbip-country-lite.csv.gz`，2026-10 DB-IP Country Lite，710,834条范围；不随访客请求调用第三方，不保存访客 IP。
- nginx 精确代理该接口并覆盖 X-Real-IP，剥离 Cookie/Authorization；关闭此路由访问日志。响应禁止缓存，只允许正式主页跨域读取。
- 缺失或损坏的数据不会拖垮原服务；无可用数据时回退英文；坏更新保留上一次正常索引。
- 首次启动解析约数秒，部署健康检查必须轮询；内存压缩索引为几十 MB。
- 部署前备份 `/opt/feline1/backups/site-locale-20261028T063909Z/`。

## 数据来源与更新

[DB-IP Country Lite](https://db-ip.com/db/download/ip-to-country-lite)按月发布，采用 CC BY4.0；页面保留 [IP Geolocation by DB-IP](https://db-ip.com)署名链接。数据库无需把访问者 IP 发给 DB-IP。

当前数据来自 `https://download.db-ip.com/free/dbip-country-lite-2026-10.csv.gz`；官方SHA1针对解压后的CSV：`c8ad1dfe98cb29bcacd82a5c3ec361c880e5bb59`。

后续可下载官方新月数据至临时文件，核对官方解压后校验值并用 `CountryIndex.load` 验证，再原子替换生产 `.csv.gz`，保留旧副本用于回退。服务每分钟检查一次文件变化，自动载入新索引；不会自行下载更新。

## 验证

本机维护包 `site-analytics/`：`test_locale_client.cjs` 验证9语言、浏览器变体、手动优先、IP回退、失败回退、异步竞争、自动重置、现有翻译包完整性；`test_guestbook_frontend.cjs` 和 `test_tracker.cjs` 验证新功能全部9种文案、草稿保留和原有行为。`server/test_site_locale.py` 的5组隔离测试覆盖IP区间边界、IPv6、CORS及损坏数据库等。

补齐工作室画布读屏标签及灵感图表标签，小八声音开关和对白随语言切换；`test_spider_locale.cjs`覆盖内置对白、动态排名、声音开关、即时切换和外部自定义文本保留。小游戏原有固定英文像素菜单沿用，角色说明、世界名称和已接入的游戏提示仍按现有语言包切换。

2026-10-28 展示调整：主页已移除访问统计设置按钮及说明弹窗；保留后台统计和浏览器隐私信号处理。留言板9种语言欢迎语统一简化为面向访客的问候，不展示服务器或采集技术细节。
