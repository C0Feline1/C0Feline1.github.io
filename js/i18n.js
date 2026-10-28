/* Main-site language packs. Add locales here and in #langSelect; missing keys fall back to English.
   Keep the arcade's in-canvas game text in English. */
(function () {
  'use strict';

  var messages = {
    'zh-CN': {
      'site.title': 'C0 STUDIO', 'site.description': '独立开发人C0 的作品主页：星梦画廊 Stardream Gallery 等。',
      'lang.select': '选择网站语言', 'header.mood': 'MOOD',
      'nav.panelLabel': '面板切换', 'nav.closeLabel': '关闭面板', 'nav.openInfo': '≡ 信息',
      'nav.cards': '数据', 'nav.cam': '实况', 'nav.rank': '排行', 'nav.logs': '日志', 'nav.inspiration': '灵感', 'nav.works': '作品', 'nav.about': '关于', 'nav.ads': '广告',
      'studio.title': 'STUDIO CAM · 工作室实况', 'terminal.title': '>_ build.log',
      'board.title': '🏆 HALL OF FAME · 排行榜 TOP 100', 'board.online': 'ONLINE', 'board.offline': 'OFFLINE', 'board.loading': '加载中……', 'board.retryHint': '上一局成绩没有提交成功',
      'board.retry': '重试提交', 'board.tip': '任意一局得分进入全球前 100 名，就可以留下名字。', 'board.empty': '还没有人上榜，第一名等你来拿！',
      'board.unavailable': '排行榜暂时连不上，稍后再来看看', 'board.noScore': '本局不计分', 'board.connecting': '正在连接排行榜……',
      'board.expectedRank': '预计排名：第 {rank} 名', 'board.previousFailed': '上一局成绩（{score}）没有提交成功：{reason}',
      'board.lastFailed': '上次失败：{reason}', 'board.pressAgain': '再按一次 Esc（或点「{skip}」）放弃提交本局成绩',
      'board.submitFailed': '提交失败：{reason}（可以重试）', 'board.nameRequired': '先写个名字吧', 'board.submitting': '提交中……',
      'board.submitted': '已登上排行榜：第 {rank} 名！', 'board.notQualified': '这次没进前 100，再接再厉！',
      'board.cannotScore': '排行榜连不上：本局不计分', 'board.retryShort': '重试', 'board.understood': '知道了', 'board.ok': '好的',
      'board.networkError': '网络错误', 'board.serverRejected': '服务器拒绝', 'board.countryNone': '🏳️ 未选（不显示国旗）',
      'ad.title': '📢 广告位招租 · AD SPACE FOR RENT', 'ad.vacant': 'VACANT', 'ad.spinner': '一直在转的像素风车',
      'ad.space': '此处广告位招租', 'ad.details': '日均曝光：小八 × 1<br>租金：一条小鱼干 / 月<br>风车由小八看守，请勿靠近', 'ad.note': '* 这不是真广告，没有任何第三方内容',
      'game.title': '▶ ARCADE · KITTY RUNNER', 'game.playable': 'PLAYABLE', 'game.minus': '−：返回 / 换人', 'game.plus': '+：暂停 / 继续（键盘 S、P、Esc）',
      'game.up': '上：交互', 'game.left': '左：向左 / 上一个角色', 'game.right': '右：向右 / 下一个角色', 'game.down': '下：按住蹲下 / 菜单',
      'game.musicToggle': '打开或关闭游戏音乐和音效（M）', 'game.musicOn': '♪ 音乐 开', 'game.musicOff': '♪ 音乐 关',
      'game.musicOnTitle': '关闭全部声音（音乐 + 音效）', 'game.musicOffTitle': '打开全部声音（音乐 + 音效）',
      'game.canvasLabel': 'KITTY RUNNER：标题画面点角色选择，再点同一角色开始；游戏中点屏幕跳跃。C 跳跃，X 攻击，Z 技能，↑ 交互，S 暂停',
      'game.x': 'X：攻击，长按切换近战 / 远程（键盘 X）', 'game.y': 'Y：互动（键盘 ↑）', 'game.a': 'A：跳跃 / 确认（键盘 C、空格、回车）', 'game.b': 'B：技能 / 返回（键盘 Z）',
      'game.help': '<kbd>←</kbd><kbd>→</kbd> 移动 · <kbd>↓</kbd> 蹲下 · <kbd>C</kbd> 跳跃 · <kbd>X</kbd> 攻击（长按切换近战 / 远程） · <kbd>Z</kbd> 技能 · <kbd>↑</kbd> 互动 · <kbd>S</kbd> 暂停',
      'chart.title': 'INSPIRATION · 灵感指数', 'works.title': 'WORKS · 作品', 'works.slots': '3 SLOTS', 'works.beta': '封闭测试中',
      'works.stardream': '星梦画廊 Stardream Gallery ↗', 'works.stardreamDesc': '竖屏拼图 · Android · 在 Google Play 查看',
      'works.inProgress': '制作中', 'works.warmth': '归途的余温', 'works.warmthDesc': '像素横版动作冒险 · 上面那个跑酷是它的小番外',
      'works.locked': 'LOCKED', 'works.comingSoon': '正在构思……', 'works.about': '独立开发人C0，一个人做游戏和小工具。这个页面上的数据全是演出来的，只有作品和下面的链接是真的。',
      'legal.title': 'LEGAL & VERIFY · 法律与验证', 'legal.status': 'ALL GREEN', 'legal.privacyHeading': '隐私政策 · Privacy Policies',
      'legal.privacyLink': '隐私政策 / Privacy ›', 'legal.website': '开发者网站', 'legal.lastCheck': '最近一次自检：',
      'footer': '© 2026 独立开发人C0 · 所有像素都由代码绘制 · 页面上爬来爬去的是小八，点它会说话',
      'modal.title': '★ NEW RECORD ★', 'modal.score': '本局得分', 'modal.nameLabel': '留下名字登上排行榜（1-12 个字）',
      'modal.namePlaceholder': '你的名字', 'modal.countryLabel': '国家 / 地区（可以不选）', 'modal.countryPlaceholder': '搜索：中国 / Japan / JP',
      'modal.countrySearch': '搜索国家或地区', 'modal.submit': '登上排行榜', 'modal.skip': '算了',
      'card.coffee.title': 'COFFEE · 咖啡', 'card.coffee.tag': 'CAFFEINE', 'card.coffee.unit': ' 杯', 'card.coffee.sub': '今日摄入',
      'card.coffee.over': '咖啡因超标，改喝水', 'card.coffee.brew': '续了一杯 ☕', 'card.bugs.title': 'BUGS · 剩余', 'card.bugs.tag': 'TRACKER',
      'card.bugs.fixed': '▼ 修好一个', 'card.bugs.new': '▲ 又冒出一个', 'card.pixels.title': 'PIXELS · 已绘制', 'card.pixels.tag': 'CANVAS',
      'card.pixels.sub': '全部由代码生成', 'card.best.title': 'YOUR BEST · 跑酷', 'card.best.tag': 'LOCAL', 'card.best.unit': ' 分',
      'card.best.sub': '去下面刷新纪录', 'card.best.new': '▲ 新纪录！', 'card.best.score': '本次 {score} 分',
      'ticker.build': '归途的余温 v0.7.3 编译通过', 'ticker.gallery': '星梦画廊封闭测试进行中', 'ticker.feline': 'Feline1 又把咖啡打翻了',
      'ticker.x0': 'X0 今日份可爱已送达 ♥', 'ticker.commits': 'C0 提交了 17 次 "fix typo"', 'ticker.ads': 'app-ads.txt ✓ 200 OK',
      'ticker.sleep': '猫猫已连续睡眠 6 小时', 'ticker.snow': '霜脊方向有异常降雪', 'ticker.arcade': '下面的跑酷可以玩'
    },
    en: {
      'site.title': 'C0 STUDIO', 'site.description': 'Games and tools by indie developer C0, including Stardream Gallery.',
      'lang.select': 'Select site language', 'header.mood': 'MOOD',
      'nav.panelLabel': 'Panel navigation', 'nav.closeLabel': 'Close panel', 'nav.openInfo': '≡ Info',
      'nav.cards': 'Stats', 'nav.cam': 'Studio', 'nav.rank': 'Rankings', 'nav.logs': 'Logs', 'nav.inspiration': 'Inspiration', 'nav.works': 'Works', 'nav.about': 'About', 'nav.ads': 'Ad space',
      'studio.title': 'STUDIO CAM · Live studio', 'terminal.title': '>_ build.log',
      'board.title': '🏆 HALL OF FAME · TOP 100', 'board.online': 'ONLINE', 'board.offline': 'OFFLINE', 'board.loading': 'Loading…', 'board.retryHint': 'Your previous score was not submitted.',
      'board.retry': 'Retry submission', 'board.tip': 'Place in the global top 100 to leave your name.', 'board.empty': 'No scores yet. Claim the top spot!',
      'board.unavailable': 'Leaderboard unavailable. Please try again later.', 'board.noScore': 'This run is not scored', 'board.connecting': 'Connecting to leaderboard…',
      'board.expectedRank': 'Estimated rank: #{rank}', 'board.previousFailed': 'Previous score ({score}) was not submitted: {reason}',
      'board.lastFailed': 'Previous attempt failed: {reason}', 'board.pressAgain': 'Press Esc again (or choose “{skip}”) to discard this score.',
      'board.submitFailed': 'Submission failed: {reason} (you can retry)', 'board.nameRequired': 'Enter a name first.', 'board.submitting': 'Submitting…',
      'board.submitted': 'You made the leaderboard at rank #{rank}!', 'board.notQualified': 'You didn’t make the top 100 this time. Keep going!',
      'board.cannotScore': 'Leaderboard unavailable: this run will not be scored.', 'board.retryShort': 'Retry', 'board.understood': 'Got it', 'board.ok': 'OK',
      'board.networkError': 'Network error', 'board.serverRejected': 'The server rejected the submission', 'board.countryNone': '🏳️ None (hide flag)',
      'ad.title': '📢 AD SPACE FOR RENT', 'ad.vacant': 'VACANT', 'ad.spinner': 'Pixel pinwheel spinning continuously',
      'ad.space': 'Your ad could go here', 'ad.details': 'Daily views: Xiao Ba × 1<br>Rent: one dried fish per month<br>Xiao Ba guards the pinwheel. Keep out!', 'ad.note': '* This is not a real ad; no third-party content is shown.',
      'game.title': '▶ ARCADE · KITTY RUNNER', 'game.playable': 'PLAYABLE', 'game.minus': '−: Back / change character', 'game.plus': '+: Pause / resume (S, P, Esc)',
      'game.up': 'Up: interact', 'game.left': 'Left: move left / previous character', 'game.right': 'Right: move right / next character', 'game.down': 'Down: hold to crouch / menu',
      'game.musicToggle': 'Toggle game music and sound effects (M)', 'game.musicOn': '♪ Sound On', 'game.musicOff': '♪ Sound Off',
      'game.musicOnTitle': 'Turn all sound off (music + effects)', 'game.musicOffTitle': 'Turn all sound on (music + effects)',
      'game.canvasLabel': 'KITTY RUNNER: on the title screen, tap a character to select and tap it again to start; tap to jump in game. C jump, X attack, Z skill, Up interact, S pause',
      'game.x': 'X: attack; hold to switch melee / ranged (X key)', 'game.y': 'Y: interact (Up key)', 'game.a': 'A: jump / confirm (C, Space, Enter)', 'game.b': 'B: skill / back (Z key)',
      'game.help': '<kbd>←</kbd><kbd>→</kbd> Move · <kbd>↓</kbd> Crouch · <kbd>C</kbd> Jump · <kbd>X</kbd> Attack (hold to switch melee / ranged) · <kbd>Z</kbd> Skill · <kbd>↑</kbd> Interact · <kbd>S</kbd> Pause',
      'chart.title': 'INSPIRATION · Mood index', 'works.title': 'WORKS', 'works.slots': '3 PROJECTS', 'works.beta': 'Closed beta',
      'works.stardream': 'Stardream Gallery ↗', 'works.stardreamDesc': 'Portrait puzzle · Android · View on Google Play',
      'works.inProgress': 'In progress', 'works.warmth': 'Afterglow of the Way Home', 'works.warmthDesc': 'Pixel-art action platformer · The runner above is its little side story.',
      'works.locked': 'LOCKED', 'works.comingSoon': 'In the works…', 'works.about': 'Indie developer C0 builds games and small tools solo. The stats on this page are for show; the projects and links are real.',
      'legal.title': 'LEGAL & VERIFY', 'legal.status': 'ALL GREEN', 'legal.privacyHeading': 'Privacy policies',
      'legal.privacyLink': 'Privacy policy ›', 'legal.website': 'Developer website', 'legal.lastCheck': 'Last self-check: ',
      'footer': '© 2026 Indie Developer C0 · Every pixel is drawn in code · Xiao Ba is crawling around the page; click to hear it speak.',
      'modal.title': '★ NEW RECORD ★', 'modal.score': 'Score this run', 'modal.nameLabel': 'Choose a leaderboard name (1–12 characters)',
      'modal.namePlaceholder': 'Your name', 'modal.countryLabel': 'Country / region (optional)', 'modal.countryPlaceholder': 'Search: United States / Japan / JP',
      'modal.countrySearch': 'Search countries or regions', 'modal.submit': 'Submit score', 'modal.skip': 'Skip',
      'card.coffee.title': 'COFFEE', 'card.coffee.tag': 'CAFFEINE', 'card.coffee.unit': ' cups', 'card.coffee.sub': 'Today’s intake',
      'card.coffee.over': 'Too much caffeine. Switching to water.', 'card.coffee.brew': 'Another cup ☕', 'card.bugs.title': 'BUGS · REMAINING', 'card.bugs.tag': 'TRACKER',
      'card.bugs.fixed': '▼ One fixed', 'card.bugs.new': '▲ One just appeared', 'card.pixels.title': 'PIXELS · DRAWN', 'card.pixels.tag': 'CANVAS',
      'card.pixels.sub': 'All generated in code', 'card.best.title': 'YOUR BEST · RUN', 'card.best.tag': 'LOCAL', 'card.best.unit': ' pts',
      'card.best.sub': 'Set a new record below', 'card.best.new': '▲ New record!', 'card.best.score': '{score} pts this run',
      'ticker.build': 'Afterglow of the Way Home v0.7.3 built successfully', 'ticker.gallery': 'Stardream Gallery closed beta is underway', 'ticker.feline': 'Feline1 spilled the coffee again',
      'ticker.x0': 'X0 delivered today’s dose of cute ♥', 'ticker.commits': 'C0 made 17 “fix typo” commits', 'ticker.ads': 'app-ads.txt ✓ 200 OK',
      'ticker.sleep': 'The cat has slept for 6 hours straight', 'ticker.snow': 'Unusual snowfall near Frostspine', 'ticker.arcade': 'The runner below is playable'
    },
    ja: {
      'site.title': 'C0 STUDIO', 'site.description': 'インディー開発者 C0 のゲームとツール。Stardream Gallery など。',
      'lang.select': 'サイトの言語を選択', 'header.mood': 'MOOD',
      'nav.panelLabel': 'パネル切替', 'nav.closeLabel': 'パネルを閉じる', 'nav.openInfo': '≡ 情報',
      'nav.cards': 'データ', 'nav.cam': 'スタジオ', 'nav.rank': 'ランキング', 'nav.logs': 'ログ', 'nav.inspiration': 'ひらめき', 'nav.works': '作品', 'nav.about': '概要', 'nav.ads': '広告',
      'studio.title': 'STUDIO CAM · スタジオライブ', 'terminal.title': '>_ ビルドログ',
      'board.title': '🏆 HALL OF FAME · TOP 100', 'board.online': 'オンライン', 'board.offline': 'オフライン', 'board.loading': '読み込み中…', 'board.retryHint': '前回のスコアを送信できませんでした。',
      'board.retry': '再送信', 'board.tip': '世界ランキングで100位以内に入ると、名前を残せます。', 'board.empty': 'まだ記録がありません。1位を目指そう！',
      'board.unavailable': 'ランキングに接続できません。後でもう一度お試しください。', 'board.noScore': 'このプレイは採点されません', 'board.connecting': 'ランキングに接続中…',
      'board.expectedRank': '予想順位：{rank}位', 'board.previousFailed': '前回のスコア（{score}）を送信できませんでした：{reason}',
      'board.lastFailed': '前回のエラー：{reason}', 'board.pressAgain': 'スコアを破棄するには、もう一度 Esc（または「{skip}」）を押してください。',
      'board.submitFailed': '送信失敗：{reason}（再試行できます）', 'board.nameRequired': '先に名前を入力してください。', 'board.submitting': '送信中…',
      'board.submitted': 'ランキング {rank} 位に入りました！', 'board.notQualified': '今回はTOP 100に届きませんでした。次回に期待！',
      'board.cannotScore': 'ランキングに接続できません。このプレイは採点されません。', 'board.retryShort': '再試行', 'board.understood': '了解', 'board.ok': 'OK',
      'board.networkError': 'ネットワークエラー', 'board.serverRejected': 'サーバーに拒否されました', 'board.countryNone': '🏳️ 未選択（旗を表示しない）',
      'ad.title': '📢 広告スペース募集中', 'ad.vacant': '空き', 'ad.spinner': '回り続けるピクセル風車',
      'ad.space': '広告スペース募集中', 'ad.details': '1日の表示数：小八 × 1<br>料金：干し魚1匹 / 月<br>風車は小八が見張っています。近づかないで！', 'ad.note': '* 実際の広告ではありません。第三者のコンテンツはありません。',
      'game.title': '▶ ARCADE · KITTY RUNNER', 'game.playable': 'プレイ可能', 'game.minus': '−：戻る / キャラクター変更', 'game.plus': '+：一時停止 / 再開（S、P、Esc）',
      'game.up': '上：インタラクト', 'game.left': '左：左へ / 前のキャラクター', 'game.right': '右：右へ / 次のキャラクター', 'game.down': '下：長押しでしゃがむ / メニュー',
      'game.musicToggle': 'ゲームの音楽と効果音を切り替え（M）', 'game.musicOn': '♪ 音声 オン', 'game.musicOff': '♪ 音声 オフ',
      'game.musicOnTitle': 'すべての音をオフ（音楽＋効果音）', 'game.musicOffTitle': 'すべての音をオン（音楽＋効果音）',
      'game.canvasLabel': 'タイトルでキャラを選び、同じキャラを再タップで開始。プレイ中は画面タップでジャンプ。C ジャンプ、X 攻撃、Z スキル、↑ 交流、S 一時停止',
      'game.x': 'X：攻撃。長押しで近接 / 遠距離を切替（X キー）', 'game.y': 'Y：交流（↑ キー）', 'game.a': 'A：ジャンプ / 決定（C、Space、Enter）', 'game.b': 'B：スキル / 戻る（Z キー）',
      'game.help': '<kbd>←</kbd><kbd>→</kbd> 移動 · <kbd>↓</kbd> しゃがむ · <kbd>C</kbd> ジャンプ · <kbd>X</kbd> 攻撃（長押しで近接 / 遠距離を切替） · <kbd>Z</kbd> スキル · <kbd>↑</kbd> 交流 · <kbd>S</kbd> 一時停止',
      'chart.title': 'INSPIRATION · ひらめき指数', 'works.title': 'WORKS · 作品', 'works.slots': '3 件', 'works.beta': 'クローズドベータ',
      'works.stardream': '星夢画廊 Stardream Gallery ↗', 'works.stardreamDesc': '縦画面パズル · Android · Google Play で見る',
      'works.inProgress': '制作中', 'works.warmth': '帰り道の余韻', 'works.warmthDesc': 'ピクセル横スクロールアクション · 上のランナーは小さな外伝です。',
      'works.locked': 'LOCKED', 'works.comingSoon': '企画中…', 'works.about': 'インディー開発者 C0 はゲームと小さなツールを一人で制作しています。ページの数値は演出ですが、作品とリンクは本物です。',
      'legal.title': 'LEGAL & VERIFY · 法律と確認', 'legal.status': 'すべて正常', 'legal.privacyHeading': 'プライバシーポリシー',
      'legal.privacyLink': 'プライバシー ›', 'legal.website': '開発者サイト', 'legal.lastCheck': '最終確認：',
      'footer': '© 2026 インディー開発者 C0 · すべてのピクセルはコードで描画 · 小八がページを歩き回っています。クリックすると話します。',
      'modal.title': '★ NEW RECORD ★', 'modal.score': '今回のスコア', 'modal.nameLabel': 'ランキングに載せる名前（1～12文字）',
      'modal.namePlaceholder': '名前', 'modal.countryLabel': '国 / 地域（任意）', 'modal.countryPlaceholder': '検索：日本 / Japan / JP',
      'modal.countrySearch': '国または地域を検索', 'modal.submit': 'スコアを送信', 'modal.skip': 'やめる',
      'card.coffee.title': 'COFFEE · コーヒー', 'card.coffee.tag': 'CAFFEINE', 'card.coffee.unit': ' 杯', 'card.coffee.sub': '今日の摂取量',
      'card.coffee.over': 'カフェイン過多。水に切り替えます。', 'card.coffee.brew': 'もう一杯 ☕', 'card.bugs.title': 'BUGS · 残り', 'card.bugs.tag': 'TRACKER',
      'card.bugs.fixed': '▼ 1件修正', 'card.bugs.new': '▲ また1件発生', 'card.pixels.title': 'PIXELS · 描画済み', 'card.pixels.tag': 'CANVAS',
      'card.pixels.sub': 'すべてコードで生成', 'card.best.title': 'YOUR BEST · ラン', 'card.best.tag': 'LOCAL', 'card.best.unit': ' 点',
      'card.best.sub': '下で記録に挑戦', 'card.best.new': '▲ 新記録！', 'card.best.score': '今回 {score} 点',
      'ticker.build': '帰り道の余韻 v0.7.3 ビルド成功', 'ticker.gallery': 'Stardream Gallery クローズドベータ中', 'ticker.feline': 'Feline1 がまたコーヒーをこぼしました',
      'ticker.x0': 'X0 から今日のかわいさが届きました ♥', 'ticker.commits': 'C0 が "fix typo" を17回コミット', 'ticker.ads': 'app-ads.txt ✓ 200 OK',
      'ticker.sleep': '猫が6時間連続で眠っています', 'ticker.snow': '霜脊方面で異常な降雪', 'ticker.arcade': '下のランナーはプレイできます'
    },
    ru: {
      'site.title': 'C0 STUDIO', 'site.description': 'Игры и инструменты инди-разработчика C0, включая Stardream Gallery.',
      'lang.select': 'Выбрать язык сайта', 'header.mood': 'НАСТРОЕНИЕ',
      'nav.panelLabel': 'Навигация по панелям', 'nav.closeLabel': 'Закрыть панель', 'nav.openInfo': '≡ Инфо',
      'nav.cards': 'Статистика', 'nav.cam': 'Студия', 'nav.rank': 'Рейтинг', 'nav.logs': 'Журнал', 'nav.inspiration': 'Вдохновение', 'nav.works': 'Работы', 'nav.about': 'О проекте', 'nav.ads': 'Реклама',
      'studio.title': 'STUDIO CAM · Студия в эфире', 'terminal.title': '>_ журнал сборки',
      'board.title': '🏆 HALL OF FAME · ТОП-100', 'board.online': 'В СЕТИ', 'board.offline': 'НЕ В СЕТИ', 'board.loading': 'Загрузка…', 'board.retryHint': 'Не удалось отправить прошлый результат.',
      'board.retry': 'Отправить снова', 'board.tip': 'Попадите в мировой топ-100, чтобы оставить своё имя.', 'board.empty': 'Пока нет результатов. Займите первое место!',
      'board.unavailable': 'Таблица лидеров недоступна. Попробуйте позже.', 'board.noScore': 'Этот забег не учитывается', 'board.connecting': 'Подключение к таблице лидеров…',
      'board.expectedRank': 'Предполагаемое место: {rank}', 'board.previousFailed': 'Не удалось отправить прошлый результат ({score}): {reason}',
      'board.lastFailed': 'Ошибка прошлой попытки: {reason}', 'board.pressAgain': 'Нажмите Esc ещё раз (или «{skip}»), чтобы отменить отправку.',
      'board.submitFailed': 'Не удалось отправить: {reason} (можно повторить)', 'board.nameRequired': 'Сначала введите имя.', 'board.submitting': 'Отправка…',
      'board.submitted': 'Вы заняли место {rank} в рейтинге!', 'board.notQualified': 'В этот раз вы не попали в топ-100. Не сдавайтесь!',
      'board.cannotScore': 'Таблица недоступна: этот забег не будет учтён.', 'board.retryShort': 'Повторить', 'board.understood': 'Понятно', 'board.ok': 'Хорошо',
      'board.networkError': 'Ошибка сети', 'board.serverRejected': 'Сервер отклонил результат', 'board.countryNone': '🏳️ Не выбрано (без флага)',
      'ad.title': '📢 МЕСТО ДЛЯ РЕКЛАМЫ', 'ad.vacant': 'СВОБОДНО', 'ad.spinner': 'Пиксельная вертушка постоянно вращается',
      'ad.space': 'Здесь может быть ваша реклама', 'ad.details': 'Просмотров в день: Сяо Ба × 1<br>Аренда: одна сушёная рыбка в месяц<br>Вертушку охраняет Сяо Ба. Не подходить!', 'ad.note': '* Это не настоящая реклама; стороннего контента нет.',
      'game.title': '▶ ARCADE · KITTY RUNNER', 'game.playable': 'ИГРАЙТЕ', 'game.minus': '−: Назад / сменить персонажа', 'game.plus': '+: Пауза / продолжить (S, P, Esc)',
      'game.up': 'Вверх: взаимодействие', 'game.left': 'Влево: двигаться / предыдущий персонаж', 'game.right': 'Вправо: двигаться / следующий персонаж', 'game.down': 'Вниз: удерживать для приседа / меню',
      'game.musicToggle': 'Включить или выключить музыку и звуки игры (M)', 'game.musicOn': '♪ Звук вкл.', 'game.musicOff': '♪ Звук выкл.',
      'game.musicOnTitle': 'Выключить все звуки (музыку и эффекты)', 'game.musicOffTitle': 'Включить все звуки (музыку и эффекты)',
      'game.canvasLabel': 'На заставке выберите героя и нажмите на него ещё раз, чтобы начать; во время игры нажатие прыгает. C — прыжок, X — атака, Z — навык, ↑ — взаимодействие, S — пауза',
      'game.x': 'X: атака; удерживайте, чтобы сменить ближний / дальний бой (клавиша X)', 'game.y': 'Y: взаимодействие (↑)', 'game.a': 'A: прыжок / подтвердить (C, пробел, Enter)', 'game.b': 'B: навык / назад (Z)',
      'game.help': '<kbd>←</kbd><kbd>→</kbd> Движение · <kbd>↓</kbd> Присесть · <kbd>C</kbd> Прыжок · <kbd>X</kbd> Атака (удерживать для смены режима) · <kbd>Z</kbd> Навык · <kbd>↑</kbd> Взаимодействие · <kbd>S</kbd> Пауза',
      'chart.title': 'INSPIRATION · Индекс вдохновения', 'works.title': 'WORKS · Работы', 'works.slots': '3 ПРОЕКТА', 'works.beta': 'Закрытый бета-тест',
      'works.stardream': 'Stardream Gallery ↗', 'works.stardreamDesc': 'Портретная головоломка · Android · Google Play',
      'works.inProgress': 'В разработке', 'works.warmth': 'Послевкусие пути домой', 'works.warmthDesc': 'Пиксельный экшен-платформер · Раннер выше — небольшая побочная история.',
      'works.locked': 'ЗАКРЫТО', 'works.comingSoon': 'В разработке…', 'works.about': 'Инди-разработчик C0 в одиночку создаёт игры и небольшие инструменты. Цифры на странице вымышлены, проекты и ссылки настоящие.',
      'legal.title': 'LEGAL & VERIFY · Правовая информация', 'legal.status': 'ВСЁ В ПОРЯДКЕ', 'legal.privacyHeading': 'Политика конфиденциальности',
      'legal.privacyLink': 'Конфиденциальность ›', 'legal.website': 'Сайт разработчика', 'legal.lastCheck': 'Последняя проверка: ',
      'footer': '© 2026 Инди-разработчик C0 · Каждый пиксель нарисован кодом · Сяо Ба ползает по странице — нажмите, чтобы услышать его.',
      'modal.title': '★ NEW RECORD ★', 'modal.score': 'Результат забега', 'modal.nameLabel': 'Имя для рейтинга (1–12 символов)',
      'modal.namePlaceholder': 'Ваше имя', 'modal.countryLabel': 'Страна / регион (необязательно)', 'modal.countryPlaceholder': 'Поиск: Россия / Japan / RU',
      'modal.countrySearch': 'Поиск стран и регионов', 'modal.submit': 'Отправить результат', 'modal.skip': 'Пропустить',
      'card.coffee.title': 'COFFEE · Кофе', 'card.coffee.tag': 'CAFFEINE', 'card.coffee.unit': ' чашки', 'card.coffee.sub': 'Сегодня выпито',
      'card.coffee.over': 'Кофеина слишком много — перейдём на воду.', 'card.coffee.brew': 'Ещё чашечку ☕', 'card.bugs.title': 'BUGS · Осталось', 'card.bugs.tag': 'TRACKER',
      'card.bugs.fixed': '▼ Один исправлен', 'card.bugs.new': '▲ Появился ещё один', 'card.pixels.title': 'PIXELS · Нарисовано', 'card.pixels.tag': 'CANVAS',
      'card.pixels.sub': 'Всё создано кодом', 'card.best.title': 'YOUR BEST · Забег', 'card.best.tag': 'LOCAL', 'card.best.unit': ' очк.',
      'card.best.sub': 'Попробуйте побить рекорд ниже', 'card.best.new': '▲ Новый рекорд!', 'card.best.score': 'В этот раз: {score}',
      'ticker.build': 'Послевкусие пути домой v0.7.3 собрано', 'ticker.gallery': 'Закрытый тест Stardream Gallery идёт', 'ticker.feline': 'Feline1 снова пролила кофе',
      'ticker.x0': 'X0 доставила порцию милоты ♥', 'ticker.commits': 'C0 отправил 17 исправлений опечаток', 'ticker.ads': 'app-ads.txt ✓ 200 OK',
      'ticker.sleep': 'Кошка спит уже 6 часов подряд', 'ticker.snow': 'У Фростспайна необычный снегопад', 'ticker.arcade': 'В раннер ниже можно играть'
    },
    es: {
      'site.title': 'C0 STUDIO', 'site.description': 'Juegos y herramientas de C0, desarrollador independiente, incluido Stardream Gallery.',
      'lang.select': 'Elegir idioma del sitio', 'header.mood': 'ÁNIMO',
      'nav.panelLabel': 'Navegación de paneles', 'nav.closeLabel': 'Cerrar panel', 'nav.openInfo': '≡ Info',
      'nav.cards': 'Datos', 'nav.cam': 'Estudio', 'nav.rank': 'Clasificación', 'nav.logs': 'Registro', 'nav.inspiration': 'Inspiración', 'nav.works': 'Obras', 'nav.about': 'Acerca de', 'nav.ads': 'Anuncios',
      'studio.title': 'STUDIO CAM · Estudio en vivo', 'terminal.title': '>_ registro de compilación',
      'board.title': '🏆 HALL OF FAME · TOP 100', 'board.online': 'EN LÍNEA', 'board.offline': 'SIN CONEXIÓN', 'board.loading': 'Cargando…', 'board.retryHint': 'No se pudo enviar tu puntuación anterior.',
      'board.retry': 'Reintentar envío', 'board.tip': 'Entra en el top 100 mundial para dejar tu nombre.', 'board.empty': 'Aún no hay puntuaciones. ¡Consigue el primer puesto!',
      'board.unavailable': 'La clasificación no está disponible. Vuelve a intentarlo más tarde.', 'board.noScore': 'Esta partida no cuenta', 'board.connecting': 'Conectando con la clasificación…',
      'board.expectedRank': 'Puesto estimado: {rank}', 'board.previousFailed': 'No se envió la puntuación anterior ({score}): {reason}',
      'board.lastFailed': 'Error anterior: {reason}', 'board.pressAgain': 'Pulsa Esc otra vez (o «{skip}») para descartar esta puntuación.',
      'board.submitFailed': 'Error al enviar: {reason} (puedes reintentar)', 'board.nameRequired': 'Escribe un nombre primero.', 'board.submitting': 'Enviando…',
      'board.submitted': '¡Has entrado en el puesto {rank}!', 'board.notQualified': 'Esta vez no llegaste al top 100. ¡Sigue intentándolo!',
      'board.cannotScore': 'No se pudo conectar: esta partida no contará.', 'board.retryShort': 'Reintentar', 'board.understood': 'Entendido', 'board.ok': 'Vale',
      'board.networkError': 'Error de red', 'board.serverRejected': 'El servidor rechazó el envío', 'board.countryNone': '🏳️ Ninguno (ocultar bandera)',
      'ad.title': '📢 ESPACIO PUBLICITARIO', 'ad.vacant': 'DISPONIBLE', 'ad.spinner': 'Molinillo pixelado girando sin parar',
      'ad.space': 'Anúnciate aquí', 'ad.details': 'Vistas diarias: Xiao Ba × 1<br>Alquiler: un pescado seco al mes<br>Xiao Ba vigila el molinillo. ¡No te acerques!', 'ad.note': '* No es un anuncio real; no hay contenido de terceros.',
      'game.title': '▶ ARCADE · KITTY RUNNER', 'game.playable': 'JUGABLE', 'game.minus': '−: Atrás / cambiar personaje', 'game.plus': '+: Pausar / continuar (S, P, Esc)',
      'game.up': 'Arriba: interactuar', 'game.left': 'Izquierda: mover / personaje anterior', 'game.right': 'Derecha: mover / personaje siguiente', 'game.down': 'Abajo: mantener para agacharse / menú',
      'game.musicToggle': 'Activar o silenciar música y efectos (M)', 'game.musicOn': '♪ Sonido Sí', 'game.musicOff': '♪ Sonido No',
      'game.musicOnTitle': 'Silenciar todo (música y efectos)', 'game.musicOffTitle': 'Activar todo el sonido',
      'game.canvasLabel': 'En la pantalla inicial, toca un personaje para elegirlo y vuelve a tocarlo para empezar; durante el juego, toca para saltar. C salta, X ataca, Z habilidad, ↑ interactuar, S pausa',
      'game.x': 'X: atacar; mantener para cambiar cuerpo a cuerpo / distancia (tecla X)', 'game.y': 'Y: interactuar (↑)', 'game.a': 'A: saltar / confirmar (C, espacio, Intro)', 'game.b': 'B: habilidad / atrás (Z)',
      'game.help': '<kbd>←</kbd><kbd>→</kbd> Mover · <kbd>↓</kbd> Agacharse · <kbd>C</kbd> Saltar · <kbd>X</kbd> Atacar (mantener para cambiar modo) · <kbd>Z</kbd> Habilidad · <kbd>↑</kbd> Interactuar · <kbd>S</kbd> Pausar',
      'chart.title': 'INSPIRATION · Índice de inspiración', 'works.title': 'WORKS · Obras', 'works.slots': '3 PROYECTOS', 'works.beta': 'Beta cerrada',
      'works.stardream': 'Stardream Gallery ↗', 'works.stardreamDesc': 'Rompecabezas vertical · Android · Ver en Google Play',
      'works.inProgress': 'En desarrollo', 'works.warmth': 'El eco del camino a casa', 'works.warmthDesc': 'Aventura de acción pixelada · El juego de carreras de arriba es su pequeño capítulo extra.',
      'works.locked': 'BLOQUEADO', 'works.comingSoon': 'En preparación…', 'works.about': 'C0 es un desarrollador indie que crea juegos y pequeñas herramientas en solitario. Las cifras son ficticias; los proyectos y enlaces son reales.',
      'legal.title': 'LEGAL & VERIFY · Legal y verificación', 'legal.status': 'TODO CORRECTO', 'legal.privacyHeading': 'Políticas de privacidad',
      'legal.privacyLink': 'Privacidad ›', 'legal.website': 'Web del desarrollador', 'legal.lastCheck': 'Última comprobación: ',
      'footer': '© 2026 Desarrollador indie C0 · Cada píxel está hecho con código · Xiao Ba recorre la página; haz clic para oírle hablar.',
      'modal.title': '★ NEW RECORD ★', 'modal.score': 'Puntuación de esta partida', 'modal.nameLabel': 'Nombre para la clasificación (1–12 caracteres)',
      'modal.namePlaceholder': 'Tu nombre', 'modal.countryLabel': 'País / región (opcional)', 'modal.countryPlaceholder': 'Buscar: España / Japan / ES',
      'modal.countrySearch': 'Buscar países o regiones', 'modal.submit': 'Enviar puntuación', 'modal.skip': 'Omitir',
      'card.coffee.title': 'COFFEE · Café', 'card.coffee.tag': 'CAFFEINE', 'card.coffee.unit': ' tazas', 'card.coffee.sub': 'Hoy consumido',
      'card.coffee.over': 'Demasiada cafeína. Mejor agua.', 'card.coffee.brew': 'Otra taza ☕', 'card.bugs.title': 'BUGS · Pendientes', 'card.bugs.tag': 'TRACKER',
      'card.bugs.fixed': '▼ Uno arreglado', 'card.bugs.new': '▲ Ha aparecido otro', 'card.pixels.title': 'PIXELS · Dibujados', 'card.pixels.tag': 'CANVAS',
      'card.pixels.sub': 'Todo generado con código', 'card.best.title': 'YOUR BEST · Carrera', 'card.best.tag': 'LOCAL', 'card.best.unit': ' pts',
      'card.best.sub': 'Intenta batir tu récord abajo', 'card.best.new': '▲ ¡Nuevo récord!', 'card.best.score': '{score} pts esta partida',
      'ticker.build': 'El eco del camino a casa v0.7.3 se compiló', 'ticker.gallery': 'Beta cerrada de Stardream Gallery en curso', 'ticker.feline': 'Feline1 volvió a derramar el café',
      'ticker.x0': 'X0 ha entregado una dosis de ternura ♥', 'ticker.commits': 'C0 hizo 17 commits de "fix typo"', 'ticker.ads': 'app-ads.txt ✓ 200 OK',
      'ticker.sleep': 'El gato lleva 6 horas durmiendo', 'ticker.snow': 'Nevada inusual cerca de Frostspine', 'ticker.arcade': 'El juego de carreras de abajo se puede jugar'
    },
    'pt-PT': {
      'site.title': 'C0 STUDIO', 'site.description': 'Jogos e ferramentas do programador independente C0, incluindo Stardream Gallery.',
      'lang.select': 'Escolher idioma do site', 'header.mood': 'HUMOR',
      'nav.panelLabel': 'Navegação dos painéis', 'nav.closeLabel': 'Fechar painel', 'nav.openInfo': '≡ Info',
      'nav.cards': 'Dados', 'nav.cam': 'Estúdio', 'nav.rank': 'Classificação', 'nav.logs': 'Registo', 'nav.inspiration': 'Inspiração', 'nav.works': 'Obras', 'nav.about': 'Sobre', 'nav.ads': 'Anúncios',
      'studio.title': 'STUDIO CAM · Estúdio em direto', 'terminal.title': '>_ registo de compilação',
      'board.title': '🏆 HALL OF FAME · TOP 100', 'board.online': 'ONLINE', 'board.offline': 'OFFLINE', 'board.loading': 'A carregar…', 'board.retryHint': 'Não foi possível enviar a pontuação anterior.',
      'board.retry': 'Tentar enviar de novo', 'board.tip': 'Entra no top 100 mundial para deixares o teu nome.', 'board.empty': 'Ainda não há pontuações. Conquista o primeiro lugar!',
      'board.unavailable': 'Classificação indisponível. Tenta novamente mais tarde.', 'board.noScore': 'Esta partida não conta', 'board.connecting': 'A ligar à classificação…',
      'board.expectedRank': 'Posição prevista: {rank}.º', 'board.previousFailed': 'Não foi possível enviar a pontuação anterior ({score}): {reason}',
      'board.lastFailed': 'Falha anterior: {reason}', 'board.pressAgain': 'Carrega novamente em Esc (ou em «{skip}») para descartar esta pontuação.',
      'board.submitFailed': 'Falha no envio: {reason} (podes tentar novamente)', 'board.nameRequired': 'Escreve primeiro um nome.', 'board.submitting': 'A enviar…',
      'board.submitted': 'Entraste na classificação em {rank}.º lugar!', 'board.notQualified': 'Desta vez não chegaste ao top 100. Continua!',
      'board.cannotScore': 'Não foi possível ligar: esta partida não contará.', 'board.retryShort': 'Tentar de novo', 'board.understood': 'Percebi', 'board.ok': 'Está bem',
      'board.networkError': 'Erro de rede', 'board.serverRejected': 'O servidor recusou o envio', 'board.countryNone': '🏳️ Nenhum (ocultar bandeira)',
      'ad.title': '📢 ESPAÇO PUBLICITÁRIO', 'ad.vacant': 'DISPONÍVEL', 'ad.spinner': 'Moinho pixelizado sempre a girar',
      'ad.space': 'Anuncia aqui', 'ad.details': 'Visualizações diárias: Xiao Ba × 1<br>Renda: um peixe seco por mês<br>Xiao Ba vigia o moinho. Não te aproximes!', 'ad.note': '* Não é um anúncio real; não existe conteúdo de terceiros.',
      'game.title': '▶ ARCADE · KITTY RUNNER', 'game.playable': 'JOGÁVEL', 'game.minus': '−: Voltar / mudar de personagem', 'game.plus': '+: Pausar / continuar (S, P, Esc)',
      'game.up': 'Cima: interagir', 'game.left': 'Esquerda: mover / personagem anterior', 'game.right': 'Direita: mover / personagem seguinte', 'game.down': 'Baixo: manter para agachar / menu',
      'game.musicToggle': 'Ligar ou desligar música e efeitos sonoros (M)', 'game.musicOn': '♪ Som Ligado', 'game.musicOff': '♪ Som Desligado',
      'game.musicOnTitle': 'Desligar todos os sons (música e efeitos)', 'game.musicOffTitle': 'Ligar todos os sons',
      'game.canvasLabel': 'No ecrã inicial, toca numa personagem para selecionar e toca novamente para começar; durante o jogo, toca para saltar. C salta, X ataca, Z habilidade, ↑ interagir, S pausa',
      'game.x': 'X: atacar; manter para mudar corpo a corpo / à distância (tecla X)', 'game.y': 'Y: interagir (↑)', 'game.a': 'A: saltar / confirmar (C, espaço, Enter)', 'game.b': 'B: habilidade / voltar (Z)',
      'game.help': '<kbd>←</kbd><kbd>→</kbd> Mover · <kbd>↓</kbd> Agachar · <kbd>C</kbd> Saltar · <kbd>X</kbd> Atacar (manter para mudar de modo) · <kbd>Z</kbd> Habilidade · <kbd>↑</kbd> Interagir · <kbd>S</kbd> Pausar',
      'chart.title': 'INSPIRATION · Índice de inspiração', 'works.title': 'WORKS · Obras', 'works.slots': '3 PROJECTOS', 'works.beta': 'Beta fechada',
      'works.stardream': 'Stardream Gallery ↗', 'works.stardreamDesc': 'Puzzle vertical · Android · Ver no Google Play',
      'works.inProgress': 'Em desenvolvimento', 'works.warmth': 'O eco do caminho para casa', 'works.warmthDesc': 'Aventura de acção em píxeis · O jogo de corrida acima é uma pequena história extra.',
      'works.locked': 'BLOQUEADO', 'works.comingSoon': 'A ser pensado…', 'works.about': 'C0 é um programador independente que cria jogos e pequenas ferramentas sozinho. Os números são fictícios; os projectos e as ligações são reais.',
      'legal.title': 'LEGAL & VERIFY · Legal e verificação', 'legal.status': 'TUDO CERTO', 'legal.privacyHeading': 'Políticas de privacidade',
      'legal.privacyLink': 'Privacidade ›', 'legal.website': 'Site do programador', 'legal.lastCheck': 'Última verificação: ',
      'footer': '© 2026 Programador independente C0 · Cada píxel é desenhado por código · Xiao Ba anda pela página; clica para o ouvir falar.',
      'modal.title': '★ NEW RECORD ★', 'modal.score': 'Pontuação desta partida', 'modal.nameLabel': 'Nome para a classificação (1–12 caracteres)',
      'modal.namePlaceholder': 'O teu nome', 'modal.countryLabel': 'País / região (opcional)', 'modal.countryPlaceholder': 'Pesquisar: Portugal / Japan / PT',
      'modal.countrySearch': 'Pesquisar países ou regiões', 'modal.submit': 'Enviar pontuação', 'modal.skip': 'Saltar',
      'card.coffee.title': 'COFFEE · Café', 'card.coffee.tag': 'CAFFEINE', 'card.coffee.unit': ' chávenas', 'card.coffee.sub': 'Consumido hoje',
      'card.coffee.over': 'Cafeína a mais. Vamos beber água.', 'card.coffee.brew': 'Mais um café ☕', 'card.bugs.title': 'BUGS · Em aberto', 'card.bugs.tag': 'TRACKER',
      'card.bugs.fixed': '▼ Um corrigido', 'card.bugs.new': '▲ Apareceu outro', 'card.pixels.title': 'PIXELS · Desenhados', 'card.pixels.tag': 'CANVAS',
      'card.pixels.sub': 'Tudo gerado por código', 'card.best.title': 'YOUR BEST · Corrida', 'card.best.tag': 'LOCAL', 'card.best.unit': ' pts',
      'card.best.sub': 'Tenta bater o recorde abaixo', 'card.best.new': '▲ Novo recorde!', 'card.best.score': '{score} pts nesta partida',
      'ticker.build': 'O eco do caminho para casa v0.7.3 compilado', 'ticker.gallery': 'Beta fechada de Stardream Gallery a decorrer', 'ticker.feline': 'Feline1 voltou a entornar o café',
      'ticker.x0': 'X0 trouxe a dose diária de ternura ♥', 'ticker.commits': 'C0 fez 17 commits de "fix typo"', 'ticker.ads': 'app-ads.txt ✓ 200 OK',
      'ticker.sleep': 'O gato dorme há 6 horas seguidas', 'ticker.snow': 'Queda de neve invulgar perto de Frostspine', 'ticker.arcade': 'O jogo de corrida abaixo está jogável'
    },
    'pt-BR': {
      'site.title': 'C0 STUDIO', 'site.description': 'Jogos e ferramentas do desenvolvedor independente C0, incluindo Stardream Gallery.',
      'lang.select': 'Selecionar idioma do site', 'header.mood': 'HUMOR',
      'nav.panelLabel': 'Navegação dos painéis', 'nav.closeLabel': 'Fechar painel', 'nav.openInfo': '≡ Info',
      'nav.cards': 'Dados', 'nav.cam': 'Estúdio', 'nav.rank': 'Ranking', 'nav.logs': 'Registros', 'nav.inspiration': 'Inspiração', 'nav.works': 'Projetos', 'nav.about': 'Sobre', 'nav.ads': 'Anúncios',
      'studio.title': 'STUDIO CAM · Estúdio ao vivo', 'terminal.title': '>_ registro de build',
      'board.title': '🏆 HALL OF FAME · TOP 100', 'board.online': 'ONLINE', 'board.offline': 'OFFLINE', 'board.loading': 'Carregando…', 'board.retryHint': 'Não foi possível enviar a pontuação anterior.',
      'board.retry': 'Tentar enviar de novo', 'board.tip': 'Entre no top 100 mundial para deixar seu nome.', 'board.empty': 'Ainda não há pontuações. Conquiste o primeiro lugar!',
      'board.unavailable': 'Ranking indisponível. Tente novamente mais tarde.', 'board.noScore': 'Esta partida não conta', 'board.connecting': 'Conectando ao ranking…',
      'board.expectedRank': 'Posição estimada: {rank}º', 'board.previousFailed': 'Não foi possível enviar a pontuação anterior ({score}): {reason}',
      'board.lastFailed': 'Erro anterior: {reason}', 'board.pressAgain': 'Pressione Esc de novo (ou “{skip}”) para descartar esta pontuação.',
      'board.submitFailed': 'Falha no envio: {reason} (você pode tentar de novo)', 'board.nameRequired': 'Digite um nome primeiro.', 'board.submitting': 'Enviando…',
      'board.submitted': 'Você entrou no ranking em {rank}º lugar!', 'board.notQualified': 'Desta vez você não chegou ao top 100. Continue tentando!',
      'board.cannotScore': 'Não foi possível conectar: esta partida não contará.', 'board.retryShort': 'Tentar de novo', 'board.understood': 'Entendi', 'board.ok': 'OK',
      'board.networkError': 'Erro de rede', 'board.serverRejected': 'O servidor recusou o envio', 'board.countryNone': '🏳️ Nenhum (ocultar bandeira)',
      'ad.title': '📢 ESPAÇO PARA ANÚNCIOS', 'ad.vacant': 'DISPONÍVEL', 'ad.spinner': 'Cata-vento pixelado girando sem parar',
      'ad.space': 'Anuncie aqui', 'ad.details': 'Visualizações diárias: Xiao Ba × 1<br>Aluguel: um peixe seco por mês<br>Xiao Ba vigia o cata-vento. Não chegue perto!', 'ad.note': '* Isto não é um anúncio real; não há conteúdo de terceiros.',
      'game.title': '▶ ARCADE · KITTY RUNNER', 'game.playable': 'JOGÁVEL', 'game.minus': '−: Voltar / trocar personagem', 'game.plus': '+: Pausar / continuar (S, P, Esc)',
      'game.up': 'Cima: interagir', 'game.left': 'Esquerda: mover / personagem anterior', 'game.right': 'Direita: mover / próximo personagem', 'game.down': 'Baixo: segurar para agachar / menu',
      'game.musicToggle': 'Ligar ou desligar música e efeitos sonoros (M)', 'game.musicOn': '♪ Som Ligado', 'game.musicOff': '♪ Som Desligado',
      'game.musicOnTitle': 'Desligar todos os sons (música e efeitos)', 'game.musicOffTitle': 'Ligar todos os sons',
      'game.canvasLabel': 'Na tela inicial, toque em um personagem para escolher e toque nele de novo para começar; durante o jogo, toque para pular. C pula, X ataca, Z habilidade, ↑ interagir, S pausa',
      'game.x': 'X: atacar; segure para trocar corpo a corpo / à distância (tecla X)', 'game.y': 'Y: interagir (↑)', 'game.a': 'A: pular / confirmar (C, espaço, Enter)', 'game.b': 'B: habilidade / voltar (Z)',
      'game.help': '<kbd>←</kbd><kbd>→</kbd> Mover · <kbd>↓</kbd> Agachar · <kbd>C</kbd> Pular · <kbd>X</kbd> Atacar (segure para trocar o modo) · <kbd>Z</kbd> Habilidade · <kbd>↑</kbd> Interagir · <kbd>S</kbd> Pausar',
      'chart.title': 'INSPIRATION · Índice de inspiração', 'works.title': 'WORKS · Projetos', 'works.slots': '3 PROJETOS', 'works.beta': 'Beta fechado',
      'works.stardream': 'Stardream Gallery ↗', 'works.stardreamDesc': 'Puzzle vertical · Android · Ver no Google Play',
      'works.inProgress': 'Em desenvolvimento', 'works.warmth': 'O eco do caminho de volta', 'works.warmthDesc': 'Aventura de ação em pixel art · O jogo de corrida acima é uma pequena história extra.',
      'works.locked': 'BLOQUEADO', 'works.comingSoon': 'Em criação…', 'works.about': 'C0 é um desenvolvedor indie que cria jogos e pequenas ferramentas sozinho. Os números são fictícios; os projetos e links são reais.',
      'legal.title': 'LEGAL & VERIFY · Legal e verificação', 'legal.status': 'TUDO CERTO', 'legal.privacyHeading': 'Políticas de privacidade',
      'legal.privacyLink': 'Privacidade ›', 'legal.website': 'Site do desenvolvedor', 'legal.lastCheck': 'Última verificação: ',
      'footer': '© 2026 Desenvolvedor indie C0 · Cada pixel é desenhado por código · Xiao Ba passeia pela página; clique para ouvir sua voz.',
      'modal.title': '★ NEW RECORD ★', 'modal.score': 'Pontuação desta partida', 'modal.nameLabel': 'Nome para o ranking (1–12 caracteres)',
      'modal.namePlaceholder': 'Seu nome', 'modal.countryLabel': 'País / região (opcional)', 'modal.countryPlaceholder': 'Buscar: Brasil / Japan / BR',
      'modal.countrySearch': 'Buscar países ou regiões', 'modal.submit': 'Enviar pontuação', 'modal.skip': 'Pular',
      'card.coffee.title': 'COFFEE · Café', 'card.coffee.tag': 'CAFFEINE', 'card.coffee.unit': ' xícaras', 'card.coffee.sub': 'Consumido hoje',
      'card.coffee.over': 'Cafeína demais. Melhor beber água.', 'card.coffee.brew': 'Mais um café ☕', 'card.bugs.title': 'BUGS · Restantes', 'card.bugs.tag': 'TRACKER',
      'card.bugs.fixed': '▼ Um corrigido', 'card.bugs.new': '▲ Apareceu outro', 'card.pixels.title': 'PIXELS · Desenhados', 'card.pixels.tag': 'CANVAS',
      'card.pixels.sub': 'Tudo gerado por código', 'card.best.title': 'YOUR BEST · Corrida', 'card.best.tag': 'LOCAL', 'card.best.unit': ' pts',
      'card.best.sub': 'Tente bater seu recorde abaixo', 'card.best.new': '▲ Novo recorde!', 'card.best.score': '{score} pts nesta partida',
      'ticker.build': 'O eco do caminho de volta v0.7.3 compilado', 'ticker.gallery': 'Beta fechado de Stardream Gallery em andamento', 'ticker.feline': 'Feline1 derrubou o café de novo',
      'ticker.x0': 'X0 entregou a dose diária de fofura ♥', 'ticker.commits': 'C0 fez 17 commits de "fix typo"', 'ticker.ads': 'app-ads.txt ✓ 200 OK',
      'ticker.sleep': 'O gato está dormindo há 6 horas seguidas', 'ticker.snow': 'Neve incomum perto de Frostspine', 'ticker.arcade': 'O jogo de corrida abaixo está disponível'
    },
    de: {
      'site.title': 'C0 STUDIO', 'site.description': 'Spiele und Tools von Indie-Entwickler C0, darunter Stardream Gallery.',
      'lang.select': 'Seitensprache auswählen', 'header.mood': 'STIMMUNG',
      'nav.panelLabel': 'Panelnavigation', 'nav.closeLabel': 'Panel schließen', 'nav.openInfo': '≡ Info',
      'nav.cards': 'Daten', 'nav.cam': 'Studio', 'nav.rank': 'Rangliste', 'nav.logs': 'Protokoll', 'nav.inspiration': 'Inspiration', 'nav.works': 'Projekte', 'nav.about': 'Über uns', 'nav.ads': 'Werbung',
      'studio.title': 'STUDIO CAM · Live-Studio', 'terminal.title': '>_ Build-Protokoll',
      'board.title': '🏆 HALL OF FAME · TOP 100', 'board.online': 'ONLINE', 'board.offline': 'OFFLINE', 'board.loading': 'Wird geladen …', 'board.retryHint': 'Dein vorheriger Punktestand konnte nicht gesendet werden.',
      'board.retry': 'Erneut senden', 'board.tip': 'Erreiche die weltweiten Top 100, um deinen Namen zu hinterlassen.', 'board.empty': 'Noch keine Einträge. Hol dir den ersten Platz!',
      'board.unavailable': 'Rangliste nicht erreichbar. Bitte später erneut versuchen.', 'board.noScore': 'Dieser Lauf wird nicht gewertet', 'board.connecting': 'Verbindung zur Rangliste …',
      'board.expectedRank': 'Voraussichtlicher Rang: {rank}', 'board.previousFailed': 'Vorheriger Punktestand ({score}) konnte nicht gesendet werden: {reason}',
      'board.lastFailed': 'Vorheriger Fehler: {reason}', 'board.pressAgain': 'Drücke erneut Esc (oder „{skip}“), um den Punktestand zu verwerfen.',
      'board.submitFailed': 'Senden fehlgeschlagen: {reason} (du kannst es erneut versuchen)', 'board.nameRequired': 'Gib zuerst einen Namen ein.', 'board.submitting': 'Wird gesendet …',
      'board.submitted': 'Du hast Rang {rank} erreicht!', 'board.notQualified': 'Diesmal hat es nicht für die Top 100 gereicht. Weiter so!',
      'board.cannotScore': 'Rangliste nicht erreichbar: Dieser Lauf wird nicht gewertet.', 'board.retryShort': 'Erneut versuchen', 'board.understood': 'Verstanden', 'board.ok': 'OK',
      'board.networkError': 'Netzwerkfehler', 'board.serverRejected': 'Der Server hat die Einsendung abgelehnt', 'board.countryNone': '🏳️ Keine (Flagge ausblenden)',
      'ad.title': '📢 WERBEPLATZ ZU VERMIETEN', 'ad.vacant': 'FREI', 'ad.spinner': 'Pixel-Windrad dreht sich ununterbrochen',
      'ad.space': 'Hier könnte deine Werbung stehen', 'ad.details': 'Aufrufe pro Tag: Xiao Ba × 1<br>Miete: ein getrockneter Fisch pro Monat<br>Xiao Ba bewacht das Windrad. Abstand halten!', 'ad.note': '* Keine echte Werbung; keine Inhalte von Drittanbietern.',
      'game.title': '▶ ARCADE · KITTY RUNNER', 'game.playable': 'SPIELBAR', 'game.minus': '−: Zurück / Figur wechseln', 'game.plus': '+: Pause / weiter (S, P, Esc)',
      'game.up': 'Oben: interagieren', 'game.left': 'Links: bewegen / vorherige Figur', 'game.right': 'Rechts: bewegen / nächste Figur', 'game.down': 'Unten: halten zum Ducken / Menü',
      'game.musicToggle': 'Spielmusik und Soundeffekte umschalten (M)', 'game.musicOn': '♪ Ton An', 'game.musicOff': '♪ Ton Aus',
      'game.musicOnTitle': 'Alle Töne ausschalten (Musik + Effekte)', 'game.musicOffTitle': 'Alle Töne einschalten',
      'game.canvasLabel': 'Im Titelbild Figur antippen und zum Start erneut antippen; im Spiel springt ein Tipp. C springen, X angreifen, Z Fähigkeit, ↑ interagieren, S Pause',
      'game.x': 'X: Angriff; halten, um Nah- / Fernkampf zu wechseln (Taste X)', 'game.y': 'Y: Interagieren (↑)', 'game.a': 'A: Springen / Bestätigen (C, Leertaste, Enter)', 'game.b': 'B: Fähigkeit / zurück (Z)',
      'game.help': '<kbd>←</kbd><kbd>→</kbd> Bewegen · <kbd>↓</kbd> Ducken · <kbd>C</kbd> Springen · <kbd>X</kbd> Angriff (halten zum Wechseln) · <kbd>Z</kbd> Fähigkeit · <kbd>↑</kbd> Interagieren · <kbd>S</kbd> Pause',
      'chart.title': 'INSPIRATION · Inspirationswert', 'works.title': 'WORKS · Projekte', 'works.slots': '3 PROJEKTE', 'works.beta': 'Geschlossene Beta',
      'works.stardream': 'Stardream Gallery ↗', 'works.stardreamDesc': 'Hochformat-Puzzle · Android · Bei Google Play ansehen',
      'works.inProgress': 'In Arbeit', 'works.warmth': 'Nachglanz des Heimwegs', 'works.warmthDesc': 'Pixel-Art-Action-Platformer · Der Runner oben ist eine kleine Nebengeschichte dazu.',
      'works.locked': 'GESPERRT', 'works.comingSoon': 'In Planung …', 'works.about': 'Indie-Entwickler C0 entwickelt allein Spiele und kleine Tools. Die Zahlen auf dieser Seite sind erfunden; Projekte und Links sind echt.',
      'legal.title': 'LEGAL & VERIFY · Rechtliches & Prüfung', 'legal.status': 'ALLES IN ORDNUNG', 'legal.privacyHeading': 'Datenschutzerklärungen',
      'legal.privacyLink': 'Datenschutz ›', 'legal.website': 'Entwickler-Website', 'legal.lastCheck': 'Letzte Prüfung: ',
      'footer': '© 2026 Indie-Entwickler C0 · Jeder Pixel ist programmiert · Xiao Ba krabbelt über die Seite. Anklicken, um sie sprechen zu hören.',
      'modal.title': '★ NEW RECORD ★', 'modal.score': 'Punktzahl dieses Laufs', 'modal.nameLabel': 'Name für die Rangliste (1–12 Zeichen)',
      'modal.namePlaceholder': 'Dein Name', 'modal.countryLabel': 'Land / Region (optional)', 'modal.countryPlaceholder': 'Suche: Deutschland / Japan / DE',
      'modal.countrySearch': 'Länder oder Regionen suchen', 'modal.submit': 'Punktzahl senden', 'modal.skip': 'Überspringen',
      'card.coffee.title': 'COFFEE · Kaffee', 'card.coffee.tag': 'CAFFEINE', 'card.coffee.unit': ' Tassen', 'card.coffee.sub': 'Heute getrunken',
      'card.coffee.over': 'Zu viel Koffein. Lieber Wasser.', 'card.coffee.brew': 'Noch eine Tasse ☕', 'card.bugs.title': 'BUGS · Offen', 'card.bugs.tag': 'TRACKER',
      'card.bugs.fixed': '▼ Einer behoben', 'card.bugs.new': '▲ Ein neuer Fehler', 'card.pixels.title': 'PIXELS · Gezeichnet', 'card.pixels.tag': 'CANVAS',
      'card.pixels.sub': 'Alles per Code generiert', 'card.best.title': 'YOUR BEST · Lauf', 'card.best.tag': 'LOCAL', 'card.best.unit': ' Pkt.',
      'card.best.sub': 'Stell unten einen neuen Rekord auf', 'card.best.new': '▲ Neuer Rekord!', 'card.best.score': '{score} Pkt. in diesem Lauf',
      'ticker.build': 'Nachglanz des Heimwegs v0.7.3 erfolgreich gebaut', 'ticker.gallery': 'Geschlossene Beta von Stardream Gallery läuft', 'ticker.feline': 'Feline1 hat schon wieder Kaffee verschüttet',
      'ticker.x0': 'X0 liefert die tägliche Portion Niedlichkeit ♥', 'ticker.commits': 'C0 hat 17 „fix typo“-Commits erstellt', 'ticker.ads': 'app-ads.txt ✓ 200 OK',
      'ticker.sleep': 'Die Katze schläft seit 6 Stunden', 'ticker.snow': 'Ungewöhnlicher Schneefall bei Frostspine', 'ticker.arcade': 'Der Runner unten ist spielbar'
    },
    la: {
      'site.title': 'C0 STUDIO', 'site.description': 'Ludi et instrumenta a C0, artifice independenter, facta; inter quae Stardream Gallery.',
      'lang.select': 'Linguam situs elige', 'header.mood': 'ANIMUS',
      'nav.panelLabel': 'Navigatio tabularum', 'nav.closeLabel': 'Tabulam claude', 'nav.openInfo': '≡ Notitia',
      'nav.cards': 'Numeri', 'nav.cam': 'Officina', 'nav.rank': 'Ordines', 'nav.logs': 'Acta', 'nav.inspiration': 'Inspiratio', 'nav.works': 'Opera', 'nav.about': 'De nobis', 'nav.ads': 'Publicitas',
      'studio.title': 'STUDIO CAM · Officina viva', 'terminal.title': '>_ acta compilationis',
      'board.title': '🏆 HALL OF FAME · CENTUM OPTIMI', 'board.online': 'INTERRETIALIS', 'board.offline': 'EXTRA INTERRETE', 'board.loading': 'Oneratur…', 'board.retryHint': 'Puncta prioris cursus mittere non potuimus.',
      'board.retry': 'Iterum mitte', 'board.tip': 'Inter centum optimos orbis terrarum intra, ut nomen tuum relinquas.', 'board.empty': 'Nondum sunt puncta. Locum primum cape!',
      'board.unavailable': 'Tabula ordinum non patet. Postea iterum tempta.', 'board.noScore': 'Hic cursus non numeratur', 'board.connecting': 'Ad tabulam ordinum coniungitur…',
      'board.expectedRank': 'Locus exspectatus: {rank}', 'board.previousFailed': 'Puncta prioris cursus ({score}) mittere non potuimus: {reason}',
      'board.lastFailed': 'Error prior: {reason}', 'board.pressAgain': 'Iterum Esc preme (aut «{skip}») ut puncta abicias.',
      'board.submitFailed': 'Mittere non licuit: {reason} (iterum temptare potes)', 'board.nameRequired': 'Primum nomen scribe.', 'board.submitting': 'Mittitur…',
      'board.submitted': 'Locum {rank} in tabula cepisti!', 'board.notQualified': 'Hoc tempore inter centum optimos non fuisti. Perge!',
      'board.cannotScore': 'Tabula non patet; hic cursus non numerabitur.', 'board.retryShort': 'Iterum', 'board.understood': 'Intellexi', 'board.ok': 'Bene',
      'board.networkError': 'Error retis', 'board.serverRejected': 'Ministerium submissionem recusavit', 'board.countryNone': '🏳️ Nullum (vexillum cela)',
      'ad.title': '📢 LOCUS PUBLICITATI CONDUCENDUS', 'ad.vacant': 'VACAT', 'ad.spinner': 'Rota pixelata sine fine volvitur',
      'ad.space': 'Hic publicitas tua esse potest', 'ad.details': 'Visus cotidiani: Xiao Ba × 1<br>Merces: unus pisciculus siccatus per mensem<br>Xiao Ba rotam custodit. Noli appropinquare!', 'ad.note': '* Non est vera publicitas; nulla res tertiae partis ostenditur.',
      'game.title': '▶ ARCADE · KITTY RUNNER', 'game.playable': 'LUDERE LICET', 'game.minus': '−: Redi / personam muta', 'game.plus': '+: Siste / perge (S, P, Esc)',
      'game.up': 'Sursum: age', 'game.left': 'Sinistra: move / persona prior', 'game.right': 'Dextera: move / persona proxima', 'game.down': 'Deorsum: pressum tene ut subsidias / menu',
      'game.musicToggle': 'Musicam et sonos ludi commuta (M)', 'game.musicOn': '♪ Sonus ON', 'game.musicOff': '♪ Sonus OFF',
      'game.musicOnTitle': 'Omnes sonos exstingue', 'game.musicOffTitle': 'Omnes sonos accende',
      'game.canvasLabel': 'In titulo personam tange ut eligas, eandem iterum tange ut incipias; in ludo tactus saltat. C salta, X oppugna, Z ars, ↑ age, S siste',
      'game.x': 'X: oppugna; pressum tene ut pugnam comminus / eminus mutes (X)', 'game.y': 'Y: age (↑)', 'game.a': 'A: salta / confirma (C, spatium, Enter)', 'game.b': 'B: ars / redi (Z)',
      'game.help': '<kbd>←</kbd><kbd>→</kbd> Move · <kbd>↓</kbd> Subsiste · <kbd>C</kbd> Salta · <kbd>X</kbd> Oppugna (tene ut modum mutes) · <kbd>Z</kbd> Ars · <kbd>↑</kbd> Age · <kbd>S</kbd> Siste',
      'chart.title': 'INSPIRATION · Index inspirationis', 'works.title': 'WORKS · Opera', 'works.slots': 'OPERA III', 'works.beta': 'Probatio clausa',
      'works.stardream': 'Stardream Gallery ↗', 'works.stardreamDesc': 'Aenigma erectum · Android · Google Play inspice',
      'works.inProgress': 'Fingitur', 'works.warmth': 'Reliquiae itineris domum', 'works.warmthDesc': 'Ludus actionis pixelatus · Cursor supra parva fabula adiuncta est.',
      'works.locked': 'CLAUSUM', 'works.comingSoon': 'Cogitatur…', 'works.about': 'C0, artifex independens, solus ludos et parva instrumenta facit. Numeri huius paginae ficti sunt; opera et nexus veri sunt.',
      'legal.title': 'LEGAL & VERIFY · Iura et probatio', 'legal.status': 'OMNIA RECTE', 'legal.privacyHeading': 'Consilia secreti',
      'legal.privacyLink': 'Secretum ›', 'legal.website': 'Pagina artificis', 'legal.lastCheck': 'Novissima probatio: ',
      'footer': '© 2026 C0 artifex independens · Omne punctum codice pingitur · Xiao Ba per paginam repit; eum tange ut loquatur.',
      'modal.title': '★ NEW RECORD ★', 'modal.score': 'Puncta huius cursus', 'modal.nameLabel': 'Nomen in tabula (I–XII litterae)',
      'modal.namePlaceholder': 'Nomen tuum', 'modal.countryLabel': 'Terra / regio (libitum)', 'modal.countryPlaceholder': 'Quaere: Italia / Japan / IT',
      'modal.countrySearch': 'Terras vel regiones quaere', 'modal.submit': 'Puncta mitte', 'modal.skip': 'Omitte',
      'card.coffee.title': 'COFFEE · Coffea', 'card.coffee.tag': 'CAFFEINE', 'card.coffee.unit': ' pocula', 'card.coffee.sub': 'Hodie sumpta',
      'card.coffee.over': 'Coffeae nimium. Aquam bibe.', 'card.coffee.brew': 'Alterum poculum ☕', 'card.bugs.title': 'BUGS · Reliqui', 'card.bugs.tag': 'TRACKER',
      'card.bugs.fixed': '▼ Unum emendatum', 'card.bugs.new': '▲ Aliud apparuit', 'card.pixels.title': 'PIXELS · Picta', 'card.pixels.tag': 'CANVAS',
      'card.pixels.sub': 'Omnia codice facta', 'card.best.title': 'YOUR BEST · Cursus', 'card.best.tag': 'LOCAL', 'card.best.unit': ' puncta',
      'card.best.sub': 'Infra novum recordum fac', 'card.best.new': '▲ Novum recordum!', 'card.best.score': 'Hac vice {score} puncta',
      'ticker.build': 'Reliquiae itineris domum v0.7.3 aedificatae', 'ticker.gallery': 'Probatio clausa Stardream Gallery agitur', 'ticker.feline': 'Feline1 coffeam iterum effudit',
      'ticker.x0': 'X0 hodiernam dulcedinem attulit ♥', 'ticker.commits': 'C0 septendecim emendationes typorum misit', 'ticker.ads': 'app-ads.txt ✓ 200 OK',
      'ticker.sleep': 'Feles sex horas continuas dormit', 'ticker.snow': 'Nix insolita prope Frostspine cadit', 'ticker.arcade': 'Cursor infra ludere licet'
    }
  };

  /* build.log has its own localized feed because its Chinese source is a story generator.
     Keep the original, richer generator for Chinese and use translated terminal feeds elsewhere. */
  var buildLogs = {
    en: {
      boot: [['c', 'boot   C0 STUDIO OS 2.6 ...'], ['ok', 'mount  /works/stardream-gallery  ✓'], ['ok', 'mount  /works/afterglow-of-homecoming  ✓'], ['ok', 'check  app-ads.txt → 200 OK'], ['ok', 'check  privacy-policy → 200 OK'], ['p', 'spawn  Feline1 / C0 / X0 ready'], ['c', 'arcade KITTY RUNNER loaded; waiting for player']],
      stream: [['c', 'build  pixel atlas generated (0 images; drawn in code)'], ['c', 'C0 is negotiating with the compiler'], ['p', 'X0 finished another wolf sprite'], ['p', 'Feline1 is testing the jump feel: meow!'], ['w', 'warn   coffee supply below 20%'], ['w', 'warn   a cat is sleeping on the keyboard'], ['ok', 'deploy c0feline1.github.io  ✓'], ['ok', 'backup saved to the cloud ✓'], ['p', 'cat    the cat stretched and reclaimed the chair'], ['c', 'cache  cleared 128 MB of temporary files'], ['c', 'audio  8-bit jump sound ready'], ['ok', 'ok     everyone is still here ✓'], ['p', 'spider Xiao Ba is watching you'], ['w', 'warn   inspiration level fluctuating']],
      bugFixed: 'fixed  #{num} gameplay issue', coffeeReset: 'reset  coffee counter cleared; C0 switched to water', coffeeBrew: 'coffee++  C0 went for another cup',
      practice: 'arcade {id} practice at {where} · {result} · no score', practiceClear: 'cleared ✓', practiceFail: 'fell over',
      run: 'arcade {id} ran {distance}m at {where} · {score} pts{record}', newRecord: ' · ★ NEW RECORD', biome: 'arcade reached → {name}', milestone: 'arcade {id} has run {distance}m'
    },
    ja: {
      boot: [['c', 'boot   C0 STUDIO OS 2.6 ...'], ['ok', 'mount  /works/stardream-gallery  ✓'], ['ok', 'mount  /works/afterglow-of-homecoming  ✓'], ['ok', 'check  app-ads.txt → 200 OK'], ['ok', 'check  privacy-policy → 200 OK'], ['p', 'spawn  Feline1 / C0 / X0 配置完了'], ['c', 'arcade KITTY RUNNER 読み込み完了 · プレイヤー待機中']],
      stream: [['c', 'build  ピクセルアトラス生成完了（画像 0 枚、すべてコード描画）'], ['c', 'C0 がコンパイラーと交渉中'], ['p', 'X0 が新しいオオカミのドット絵を完成'], ['p', 'Feline1 がジャンプの感触をテスト中：ニャー！'], ['w', 'warn   コーヒーの在庫が 20% 未満'], ['w', 'warn   猫がキーボードでお昼寝中'], ['ok', 'deploy c0feline1.github.io  ✓'], ['ok', 'backup クラウドに保存しました ✓'], ['p', 'cat    猫が伸びをして椅子を占領'], ['c', 'cache  一時ファイル 128 MB を削除'], ['c', 'audio  8-bit ジャンプ音を準備完了'], ['ok', 'ok     みんな無事です ✓'], ['p', 'spider 小八がこちらを見ています'], ['w', 'warn   ひらめき指数が変動中']],
      bugFixed: 'fixed  #{num} ゲームの問題を修正', coffeeReset: 'reset  コーヒーカウンターをリセット · C0 は水に切り替え', coffeeBrew: 'coffee++  C0 がコーヒーのおかわりへ',
      practice: 'arcade {id} が {where} を練習 · {result} · スコア対象外', practiceClear: 'クリア ✓', practiceFail: '倒れました',
      run: 'arcade {id} が {where} で {distance}m 走行 · {score}点{record}', newRecord: ' · ★ 新記録', biome: 'arcade 到達 → {name}', milestone: 'arcade {id} が {distance}m 走りました'
    },
    ru: {
      boot: [['c', 'boot   C0 STUDIO OS 2.6 ...'], ['ok', 'mount  /works/stardream-gallery  ✓'], ['ok', 'mount  /works/afterglow-of-homecoming  ✓'], ['ok', 'check  app-ads.txt → 200 OK'], ['ok', 'check  privacy-policy → 200 OK'], ['p', 'spawn  Feline1 / C0 / X0 на месте'], ['c', 'arcade KITTY RUNNER загружена · ждём игрока']],
      stream: [['c', 'build  пиксельный атлас готов (0 изображений, всё создано кодом)'], ['c', 'C0 спорит с компилятором'], ['p', 'X0 закончил спрайт нового волка'], ['p', 'Feline1 проверяет прыжок: мяу!'], ['w', 'warn   запас кофе ниже 20%'], ['w', 'warn   кот спит на клавиатуре'], ['ok', 'deploy c0feline1.github.io  ✓'], ['ok', 'backup сохранена в облаке ✓'], ['p', 'cat    кот потянулся и занял кресло'], ['c', 'cache  удалено 128 МБ временных файлов'], ['c', 'audio  8-битный звук прыжка готов'], ['ok', 'ok     все на месте ✓'], ['p', 'spider Сяо Ба наблюдает за вами'], ['w', 'warn   уровень вдохновения меняется']],
      bugFixed: 'fixed  #{num} игровая ошибка', coffeeReset: 'reset  счётчик кофе сброшен; C0 перешёл на воду', coffeeBrew: 'coffee++  C0 пошёл за ещё одной чашкой',
      practice: 'arcade {id}: тренировка в {where} · {result} · без очков', practiceClear: 'победа ✓', practiceFail: 'проигрыш',
      run: 'arcade {id}: {distance} м в {where} · {score} очк.{record}', newRecord: ' · ★ НОВЫЙ РЕКОРД', biome: 'arcade достигла → {name}', milestone: 'arcade {id} пробежала {distance} м'
    },
    es: {
      boot: [['c', 'boot   C0 STUDIO OS 2.6 ...'], ['ok', 'mount  /works/stardream-gallery  ✓'], ['ok', 'mount  /works/afterglow-of-homecoming  ✓'], ['ok', 'check  app-ads.txt → 200 OK'], ['ok', 'check  privacy-policy → 200 OK'], ['p', 'spawn  Feline1 / C0 / X0 listos'], ['c', 'arcade KITTY RUNNER cargado · esperando jugador']],
      stream: [['c', 'build  atlas de píxeles listo (0 imágenes, todo hecho con código)'], ['c', 'C0 está negociando con el compilador'], ['p', 'X0 terminó otro sprite de lobo'], ['p', 'Feline1 prueba el salto: ¡miau!'], ['w', 'warn   queda menos del 20% de café'], ['w', 'warn   un gato duerme sobre el teclado'], ['ok', 'deploy c0feline1.github.io  ✓'], ['ok', 'backup guardada en la nube ✓'], ['p', 'cat    el gato se estiró y ocupó la silla'], ['c', 'cache  borrados 128 MB de archivos temporales'], ['c', 'audio  sonido de salto de 8 bits listo'], ['ok', 'ok     todos siguen aquí ✓'], ['p', 'spider Xiao Ba te está mirando'], ['w', 'warn   la inspiración está fluctuando']],
      bugFixed: 'fixed  #{num} error del juego', coffeeReset: 'reset  contador de café reiniciado; C0 ahora toma agua', coffeeBrew: 'coffee++  C0 fue por otra taza',
      practice: 'arcade {id} practica en {where} · {result} · sin puntos', practiceClear: 'superado ✓', practiceFail: 'se cayó',
      run: 'arcade {id} recorrió {distance} m en {where} · {score} pts{record}', newRecord: ' · ★ NUEVO RÉCORD', biome: 'arcade llegó a → {name}', milestone: 'arcade {id} ya recorrió {distance} m'
    },
    'pt-PT': {
      boot: [['c', 'boot   C0 STUDIO OS 2.6 ...'], ['ok', 'mount  /works/stardream-gallery  ✓'], ['ok', 'mount  /works/afterglow-of-homecoming  ✓'], ['ok', 'check  app-ads.txt → 200 OK'], ['ok', 'check  privacy-policy → 200 OK'], ['p', 'spawn  Feline1 / C0 / X0 prontos'], ['c', 'arcade KITTY RUNNER carregado · à espera de jogador']],
      stream: [['c', 'build  atlas de píxeis pronto (0 imagens, tudo feito por código)'], ['c', 'C0 está a negociar com o compilador'], ['p', 'X0 terminou outro sprite de lobo'], ['p', 'Feline1 está a testar o salto: miau!'], ['w', 'warn   resta menos de 20% de café'], ['w', 'warn   um gato está a dormir no teclado'], ['ok', 'deploy c0feline1.github.io  ✓'], ['ok', 'backup guardada na nuvem ✓'], ['p', 'cat    o gato espreguiçou-se e ocupou a cadeira'], ['c', 'cache  removidos 128 MB de ficheiros temporários'], ['c', 'audio  som de salto de 8 bits pronto'], ['ok', 'ok     todos continuam aqui ✓'], ['p', 'spider Xiao Ba está a olhar para ti'], ['w', 'warn   a inspiração está a oscilar']],
      bugFixed: 'fixed  #{num} problema do jogo', coffeeReset: 'reset  contador do café reiniciado; C0 passou à água', coffeeBrew: 'coffee++  C0 foi buscar mais um café',
      practice: 'arcade {id} a treinar em {where} · {result} · sem pontuação', practiceClear: 'concluído ✓', practiceFail: 'caiu',
      run: 'arcade {id} percorreu {distance} m em {where} · {score} pts{record}', newRecord: ' · ★ NOVO RECORDE', biome: 'arcade chegou a → {name}', milestone: 'arcade {id} já percorreu {distance} m'
    },
    'pt-BR': {
      boot: [['c', 'boot   C0 STUDIO OS 2.6 ...'], ['ok', 'mount  /works/stardream-gallery  ✓'], ['ok', 'mount  /works/afterglow-of-homecoming  ✓'], ['ok', 'check  app-ads.txt → 200 OK'], ['ok', 'check  privacy-policy → 200 OK'], ['p', 'spawn  Feline1 / C0 / X0 a postos'], ['c', 'arcade KITTY RUNNER carregado · aguardando jogador']],
      stream: [['c', 'build  atlas de pixels pronto (0 imagens, tudo feito com código)'], ['c', 'C0 está negociando com o compilador'], ['p', 'X0 terminou mais um sprite de lobo'], ['p', 'Feline1 está testando o pulo: miau!'], ['w', 'warn   estoque de café abaixo de 20%'], ['w', 'warn   um gato está dormindo no teclado'], ['ok', 'deploy c0feline1.github.io  ✓'], ['ok', 'backup salva na nuvem ✓'], ['p', 'cat    o gato se espreguiçou e tomou a cadeira'], ['c', 'cache  128 MB de arquivos temporários removidos'], ['c', 'audio  som de pulo 8-bit pronto'], ['ok', 'ok     todo mundo continua aqui ✓'], ['p', 'spider Xiao Ba está de olho em você'], ['w', 'warn   nível de inspiração oscilando']],
      bugFixed: 'fixed  #{num} problema no jogo', coffeeReset: 'reset  contador de café zerado; C0 agora vai de água', coffeeBrew: 'coffee++  C0 foi pegar mais um café',
      practice: 'arcade {id} treinando em {where} · {result} · sem pontuação', practiceClear: 'venceu ✓', practiceFail: 'caiu',
      run: 'arcade {id} correu {distance} m em {where} · {score} pts{record}', newRecord: ' · ★ NOVO RECORDE', biome: 'arcade chegou a → {name}', milestone: 'arcade {id} já correu {distance} m'
    },
    de: {
      boot: [['c', 'boot   C0 STUDIO OS 2.6 ...'], ['ok', 'mount  /works/stardream-gallery  ✓'], ['ok', 'mount  /works/afterglow-of-homecoming  ✓'], ['ok', 'check  app-ads.txt → 200 OK'], ['ok', 'check  privacy-policy → 200 OK'], ['p', 'spawn  Feline1 / C0 / X0 bereit'], ['c', 'arcade KITTY RUNNER geladen · wartet auf Spieler']],
      stream: [['c', 'build  Pixelatlas erstellt (0 Bilder, alles per Code gezeichnet)'], ['c', 'C0 verhandelt mit dem Compiler'], ['p', 'X0 hat einen weiteren Wolfs-Sprite fertiggestellt'], ['p', 'Feline1 testet das Sprunggefühl: Miau!'], ['w', 'warn   Kaffeevorrat unter 20%'], ['w', 'warn   eine Katze schläft auf der Tastatur'], ['ok', 'deploy c0feline1.github.io  ✓'], ['ok', 'backup in der Cloud gespeichert ✓'], ['p', 'cat    die Katze streckt sich und besetzt den Stuhl'], ['c', 'cache  128 MB temporäre Dateien gelöscht'], ['c', 'audio  8-Bit-Sprunggeräusch ist bereit'], ['ok', 'ok     alle sind noch da ✓'], ['p', 'spider Xiao Ba beobachtet dich'], ['w', 'warn   Inspirationswert schwankt']],
      bugFixed: 'fixed  #{num} Spielfehler behoben', coffeeReset: 'reset  Kaffeezähler zurückgesetzt; C0 trinkt jetzt Wasser', coffeeBrew: 'coffee++  C0 holt sich noch einen Kaffee',
      practice: 'arcade {id} übt in {where} · {result} · ohne Wertung', practiceClear: 'geschafft ✓', practiceFail: 'gestürzt',
      run: 'arcade {id}: {distance} m in {where} · {score} Pkt.{record}', newRecord: ' · ★ NEUER REKORD', biome: 'arcade erreicht → {name}', milestone: 'arcade {id} ist {distance} m gelaufen'
    },
    la: {
      boot: [['c', 'boot   C0 STUDIO OS 2.6 ...'], ['ok', 'mount  /works/stardream-gallery  ✓'], ['ok', 'mount  /works/afterglow-of-homecoming  ✓'], ['ok', 'check  app-ads.txt → 200 OK'], ['ok', 'check  privacy-policy → 200 OK'], ['p', 'spawn  Feline1 / C0 / X0 parati'], ['c', 'arcade KITTY RUNNER onerata · lusorem exspectat']],
      stream: [['c', 'build  atlas pixelorum paratus (imagines 0, omnia codice picta)'], ['c', 'C0 cum compilatore disputat'], ['p', 'X0 novum lupi imaginem absolvit'], ['p', 'Feline1 saltum probat: miau!'], ['w', 'warn   coffeae copia infra 20%'], ['w', 'warn   felis super clavibus dormit'], ['ok', 'deploy c0feline1.github.io  ✓'], ['ok', 'backup in nubem servata ✓'], ['p', 'cat    felis se extendit et sellam occupavit'], ['c', 'cache  128 MB archivorum temporariorum deleta'], ['c', 'audio  sonus saltus octobitici paratus'], ['ok', 'ok     omnes adhuc adsunt ✓'], ['p', 'spider Xiao Ba te spectat'], ['w', 'warn   inspiratio variatur']],
      bugFixed: 'fixed  #{num} vitium ludi correctum', coffeeReset: 'reset  numerus coffeae deletus; C0 aquam bibit', coffeeBrew: 'coffee++  C0 aliam coffeam petit',
      practice: 'arcade {id} in {where} exercetur · {result} · puncta nulla', practiceClear: 'victoria ✓', practiceFail: 'cecidit',
      run: 'arcade {id} {distance} m in {where} cucurrit · {score} puncta{record}', newRecord: ' · ★ NOVUM RECORDUM', biome: 'arcade advenit → {name}', milestone: 'arcade {id} {distance} m cucurrit'
    }
  };

  var gameTexts = {
    'zh-CN': {
      'world.park': '现代 · 公园', 'world.snow': '霜脊 · 雪原入口', 'world.peak': '冰封峰顶', 'world.home': '现代 · 公寓街区', 'world.cabin': '守山屋', 'world.ridge': '风雪山脊', 'world.cave': '岩洞营火', 'world.lake': '归途 · 冰湖',
      'world.xian': '云桥 · 修仙界', 'world.ink': '水墨 · 山水间', 'world.cyber': '雨城 · 不眠街', 'world.steam': '锅炉厅 · 第二次呼吸', 'world.sea': '珊瑚遗迹 · 潮汐', 'world.market': '夜市 · 灯笼街', 'world.sakura': '樱花 · 狐之社', 'world.bit8': '像素 · 8-BIT 世界',
      'world.desert': '黄沙遗迹', 'world.volcano': '熔岩火山', 'world.haunt': '幽灵古宅', 'world.skycity': '天空之城', 'world.space': '星海 · 轨道站', 'world.mirror': '镜湖 · 倒影', 'world.candy': '棉花糖梦境', 'world.court': '绿洲 · 歇脚处',
      'character.Feline1': '猫娘 Feline1', 'perk.Feline1': '九命：4 颗心，每 25 秒回 1 颗 + 二段跳', 'character.C0': '程序员 C0', 'perk.C0': '超频：按 B（键盘 Z）慢动作 + 穿透', 'character.X0': '美术 X0', 'perk.X0': '镜光护盾：12 秒充能 + 小磁铁',
      'ui.paused': '已暂停', 'ui.resume': '继续游戏', 'ui.restart': '重新开始', 'ui.changeCharacter': '返回选人', 'over.at': '倒在了「{world}」', 'over.together': '不过三个人还在一起。',
      'room.apt': '公寓 · 小家', 'room.tea': '樱之茶室', 'room.lodge': '雪原小屋', 'room.cabin': '山间木屋', 'room.party': '一圈完成！', 'room.court': '绿洲 · 歇脚处',
      'boss.eel': '熔岩鳗出现了！', 'boss.butler': '管家幽灵出现了！', 'tea.inscription': '一期一会'
    },
    en: {
      'world.park': 'Modern Park', 'world.snow': 'Frost Ridge · Snowfield', 'world.peak': 'Frozen Summit', 'world.home': 'Home Street', 'world.cabin': 'Mountain Lodge', 'world.ridge': 'Storm Ridge', 'world.cave': 'Ember Cave', 'world.lake': 'Homeward · Frozen Lake',
      'world.xian': 'Cloud Bridge · Sword Realm', 'world.ink': 'Ink Landscape', 'world.cyber': 'Rain City · Sleepless Street', 'world.steam': 'Boiler Hall · Second Breath', 'world.sea': 'Coral Ruins · Tides', 'world.market': 'Night Market · Lantern Street', 'world.sakura': 'Sakura · Fox Shrine', 'world.bit8': 'Pixel · 8-Bit World',
      'world.desert': 'Sand Ruins', 'world.volcano': 'Magma Peak', 'world.haunt': 'Haunted Manor', 'world.skycity': 'Sky City', 'world.space': 'Star Sea · Orbital Station', 'world.mirror': 'Mirror Lake · Reflections', 'world.candy': 'Cotton Candy Dream', 'world.court': 'Oasis · Rest Stop',
      'character.Feline1': 'Catgirl Feline1', 'perk.Feline1': '4 HP · +1/25s · double jump', 'character.C0': 'Coder C0', 'perk.C0': 'Slow + pierce · B/Z', 'character.X0': 'Artist X0', 'perk.X0': 'Shield/12s · small magnet',
      'ui.paused': 'PAUSED', 'ui.resume': 'RESUME', 'ui.restart': 'RESTART', 'ui.changeCharacter': 'CHARACTER SELECT', 'over.at': 'Fell at {world}', 'over.together': 'But the three are still together.',
      'room.apt': 'Apartment · Home', 'room.tea': 'Sakura Tea House', 'room.lodge': 'Snow Lodge', 'room.cabin': 'Mountain Cabin', 'room.party': 'Lap Complete!', 'room.court': 'Oasis · Rest Stop',
      'boss.eel': 'The Lava Eel appeared!', 'boss.butler': 'The Butler Ghost appeared!', 'tea.inscription': 'Once in a lifetime'
    },
    ja: {
      'world.park': '現代の公園', 'world.snow': '霜脊 · 雪原', 'world.peak': '氷結峰頂', 'world.home': '現代の住宅街', 'world.cabin': '山の宿', 'world.ridge': '吹雪の山脊', 'world.cave': '洞窟の焚き火', 'world.lake': '帰路 · 氷の湖',
      'world.xian': '雲の橋 · 剣の世界', 'world.ink': '水墨山水', 'world.cyber': '雨の街 · 眠らぬ通り', 'world.steam': 'ボイラー室 · もう一度息を', 'world.sea': 'サンゴの遺跡 · 潮の満ち引き', 'world.market': '夜市 · 提灯通り', 'world.sakura': '桜 · 狐の社', 'world.bit8': 'ピクセル · 8ビット世界',
      'world.desert': '砂の遺跡', 'world.volcano': '溶岩の峰', 'world.haunt': '幽霊屋敷', 'world.skycity': '空中都市', 'world.space': '星の海 · 軌道ステーション', 'world.mirror': '鏡の湖 · 水鏡', 'world.candy': 'わたあめの夢', 'world.court': 'オアシス · 休憩所',
      'character.Feline1': '猫娘 Feline1', 'perk.Feline1': 'HP4 · 25秒ごとに+1 · 二段ジャンプ', 'character.C0': 'プログラマー C0', 'perk.C0': 'B/Zでスロー＋貫通', 'character.X0': 'アーティスト X0', 'perk.X0': '盾/12秒 · 小さな磁石',
      'ui.paused': '一時停止', 'ui.resume': 'ゲームに戻る', 'ui.restart': '最初から', 'ui.changeCharacter': 'キャラクター選択へ', 'over.at': '「{world}」で倒れた', 'over.together': 'それでも三人は一緒。',
      'room.apt': 'アパート · わが家', 'room.tea': '桜の茶室', 'room.lodge': '雪原の小屋', 'room.cabin': '山間の木の家', 'room.party': '一周クリア！', 'room.court': 'オアシス · 休憩所',
      'boss.eel': '溶岩ウナギが現れた！', 'boss.butler': '執事の幽霊が現れた！', 'tea.inscription': '一期一会'
    },
    ru: {
      'world.park': 'Современный парк', 'world.snow': 'Хребет Морозов · Снежная равнина', 'world.peak': 'Ледяная вершина', 'world.home': 'Современный жилой квартал', 'world.cabin': 'Горный приют', 'world.ridge': 'Заснеженный хребет', 'world.cave': 'Костёр в пещере', 'world.lake': 'Путь домой · Ледяное озеро',
      'world.xian': 'Облачный мост · Мир меча', 'world.ink': 'Тушевые горы и воды', 'world.cyber': 'Город дождя · Бессонная улица', 'world.steam': 'Котельный зал · Второе дыхание', 'world.sea': 'Коралловые руины · Приливы', 'world.market': 'Ночной рынок · Улица фонарей', 'world.sakura': 'Сакура · Лисье святилище', 'world.bit8': 'Пиксели · Мир 8-BIT',
      'world.desert': 'Песчаные руины', 'world.volcano': 'Магматическая вершина', 'world.haunt': 'Особняк призраков', 'world.skycity': 'Небесный город', 'world.space': 'Звёздное море · Орбитальная станция', 'world.mirror': 'Зеркальное озеро · Отражения', 'world.candy': 'Сон из сладкой ваты', 'world.court': 'Оазис · Место отдыха',
      'character.Feline1': 'Кошка Feline1', 'perk.Feline1': '4 HP · +1/25с · двойной прыжок', 'character.C0': 'Программист C0', 'perk.C0': 'Замедление + пробой · B/Z', 'character.X0': 'Художник X0', 'perk.X0': 'Щит/12с · малый магнит',
      'ui.paused': 'ПАУЗА', 'ui.resume': 'ПРОДОЛЖИТЬ', 'ui.restart': 'ЗАНОВО', 'ui.changeCharacter': 'ВЫБРАТЬ ГЕРОЯ', 'over.at': 'Поражение в мире «{world}»', 'over.together': 'Но эта троица всё ещё вместе.',
      'room.apt': 'Квартира · Дом', 'room.tea': 'Чайный домик сакуры', 'room.lodge': 'Снежный домик', 'room.cabin': 'Горная хижина', 'room.party': 'Круг завершён!', 'room.court': 'Оазис · Отдых',
      'boss.eel': 'Появился лавовый угорь!', 'boss.butler': 'Появился призрак дворецкого!', 'tea.inscription': 'Один миг — одна встреча'
    },
    es: {
      'world.park': 'Parque moderno', 'world.snow': 'Cordillera Helada · Campo nevado', 'world.peak': 'Cima congelada', 'world.home': 'Barrio moderno', 'world.cabin': 'Refugio de montaña', 'world.ridge': 'Cresta de la tormenta', 'world.cave': 'Fogata en la cueva', 'world.lake': 'Regreso · Lago helado',
      'world.xian': 'Puente de nubes · Reino de la espada', 'world.ink': 'Paisaje de tinta', 'world.cyber': 'Ciudad lluviosa · Calle sin sueño', 'world.steam': 'Sala de calderas · Segundo aliento', 'world.sea': 'Ruinas de coral · Mareas', 'world.market': 'Mercado nocturno · Calle de faroles', 'world.sakura': 'Sakura · Santuario del zorro', 'world.bit8': 'Píxeles · Mundo de 8 bits',
      'world.desert': 'Ruinas de arena', 'world.volcano': 'Cima de magma', 'world.haunt': 'Mansión encantada', 'world.skycity': 'Ciudad del cielo', 'world.space': 'Mar estelar · Estación orbital', 'world.mirror': 'Lago espejo · Reflejos', 'world.candy': 'Sueño de algodón de azúcar', 'world.court': 'Oasis · Área de descanso',
      'character.Feline1': 'Gata Feline1', 'perk.Feline1': '4 HP · +1/25s · doble salto', 'character.C0': 'Programador C0', 'perk.C0': 'Lento + perforar · B/Z', 'character.X0': 'Artista X0', 'perk.X0': 'Escudo/12s · imán pequeño',
      'ui.paused': 'EN PAUSA', 'ui.resume': 'CONTINUAR', 'ui.restart': 'REINICIAR', 'ui.changeCharacter': 'ELEGIR PERSONAJE', 'over.at': 'Caíste en {world}', 'over.together': 'Pero los tres siguen juntos.',
      'room.apt': 'Apartamento · Hogar', 'room.tea': 'Casa de té Sakura', 'room.lodge': 'Cabaña nevada', 'room.cabin': 'Cabaña de montaña', 'room.party': '¡Vuelta completada!', 'room.court': 'Oasis · Descanso',
      'boss.eel': '¡Apareció la anguila de lava!', 'boss.butler': '¡Apareció el mayordomo fantasma!', 'tea.inscription': 'Un encuentro, una sola vez'
    },
    'pt-PT': {
      'world.park': 'Parque moderno', 'world.snow': 'Cordilheira Gelada · Planície de neve', 'world.peak': 'Pico congelado', 'world.home': 'Bairro moderno', 'world.cabin': 'Refúgio da montanha', 'world.ridge': 'Cordilheira da tempestade', 'world.cave': 'Fogueira na gruta', 'world.lake': 'Regresso · Lago gelado',
      'world.xian': 'Ponte das nuvens · Reino da espada', 'world.ink': 'Paisagem a tinta', 'world.cyber': 'Cidade chuvosa · Rua sem sono', 'world.steam': 'Sala das caldeiras · Segundo fôlego', 'world.sea': 'Ruínas de coral · Marés', 'world.market': 'Mercado noturno · Rua das lanternas', 'world.sakura': 'Sakura · Santuário da raposa', 'world.bit8': 'Pixels · Mundo de 8 bits',
      'world.desert': 'Ruínas de areia', 'world.volcano': 'Pico de magma', 'world.haunt': 'Mansão assombrada', 'world.skycity': 'Cidade do céu', 'world.space': 'Mar estelar · Estação orbital', 'world.mirror': 'Lago-espelho · Reflexos', 'world.candy': 'Sonho de algodão-doce', 'world.court': 'Oásis · Área de descanso',
      'character.Feline1': 'Gata Feline1', 'perk.Feline1': '4 HP · +1/25s · salto duplo', 'character.C0': 'Programador C0', 'perk.C0': 'Lento + perfurar · B/Z', 'character.X0': 'Artista X0', 'perk.X0': 'Escudo/12s · íman pequeno',
      'ui.paused': 'EM PAUSA', 'ui.resume': 'CONTINUAR', 'ui.restart': 'RECOMEÇAR', 'ui.changeCharacter': 'ESCOLHER PERSONAGEM', 'over.at': 'Caíste em {world}', 'over.together': 'Mas os três continuam juntos.',
      'room.apt': 'Apartamento · Casa', 'room.tea': 'Casa de chá Sakura', 'room.lodge': 'Cabana da neve', 'room.cabin': 'Cabana da montanha', 'room.party': 'Volta concluída!', 'room.court': 'Oásis · Descanso',
      'boss.eel': 'A enguia de lava apareceu!', 'boss.butler': 'O fantasma mordomo apareceu!', 'tea.inscription': 'Um encontro, uma única vez'
    },
    'pt-BR': {
      'world.park': 'Parque moderno', 'world.snow': 'Cordilheira Gelada · Campo nevado', 'world.peak': 'Pico congelado', 'world.home': 'Bairro moderno', 'world.cabin': 'Refúgio da montanha', 'world.ridge': 'Cordilheira da tempestade', 'world.cave': 'Fogueira na caverna', 'world.lake': 'Volta para casa · Lago congelado',
      'world.xian': 'Ponte das nuvens · Reino da espada', 'world.ink': 'Paisagem em tinta', 'world.cyber': 'Cidade chuvosa · Rua sem sono', 'world.steam': 'Sala das caldeiras · Segundo fôlego', 'world.sea': 'Ruínas de coral · Marés', 'world.market': 'Mercado noturno · Rua das lanternas', 'world.sakura': 'Sakura · Santuário da raposa', 'world.bit8': 'Pixels · Mundo 8-BIT',
      'world.desert': 'Ruínas de areia', 'world.volcano': 'Pico de magma', 'world.haunt': 'Mansão assombrada', 'world.skycity': 'Cidade do céu', 'world.space': 'Mar estelar · Estação orbital', 'world.mirror': 'Lago espelhado · Reflexos', 'world.candy': 'Sonho de algodão-doce', 'world.court': 'Oásis · Área de descanso',
      'character.Feline1': 'Gata Feline1', 'perk.Feline1': '4 HP · +1/25s · pulo duplo', 'character.C0': 'Programador C0', 'perk.C0': 'Lento + perfurar · B/Z', 'character.X0': 'Artista X0', 'perk.X0': 'Escudo/12s · ímã pequeno',
      'ui.paused': 'PAUSADO', 'ui.resume': 'CONTINUAR', 'ui.restart': 'RECOMEÇAR', 'ui.changeCharacter': 'ESCOLHER PERSONAGEM', 'over.at': 'Você caiu em {world}', 'over.together': 'Mas os três continuam juntos.',
      'room.apt': 'Apartamento · Lar', 'room.tea': 'Casa de chá Sakura', 'room.lodge': 'Cabana nevada', 'room.cabin': 'Cabana da montanha', 'room.party': 'Volta completa!', 'room.court': 'Oásis · Descanso',
      'boss.eel': 'A enguia de lava apareceu!', 'boss.butler': 'O fantasma mordomo apareceu!', 'tea.inscription': 'Um encontro, uma única vez'
    },
    de: {
      'world.park': 'Moderner Park', 'world.snow': 'Frostgrat · Schneefeld', 'world.peak': 'Gefrorener Gipfel', 'world.home': 'Modernes Wohnviertel', 'world.cabin': 'Berghütte', 'world.ridge': 'Sturmgrat', 'world.cave': 'Lagerfeuerhöhle', 'world.lake': 'Heimweg · Eissee',
      'world.xian': 'Wolkenbrücke · Schwertwelt', 'world.ink': 'Tuschelandschaft', 'world.cyber': 'Regenstadt · Schlaflose Straße', 'world.steam': 'Kesselhalle · Zweiter Atem', 'world.sea': 'Korallenruinen · Gezeiten', 'world.market': 'Nachtmarkt · Laternenstraße', 'world.sakura': 'Sakura · Fuchsschrein', 'world.bit8': 'Pixel · 8-Bit-Welt',
      'world.desert': 'Sandruinen', 'world.volcano': 'Magmagipfel', 'world.haunt': 'Spukhaus', 'world.skycity': 'Himmelsstadt', 'world.space': 'Sternenmeer · Orbitalstation', 'world.mirror': 'Spiegelsee · Spiegelbilder', 'world.candy': 'Zuckerwattentraum', 'world.court': 'Oase · Rastplatz',
      'character.Feline1': 'Katzenmädchen Feline1', 'perk.Feline1': '4 HP · +1/25s · Doppelsprung', 'character.C0': 'Programmierer C0', 'perk.C0': 'Zeitlupe + Durchschlag · B/Z', 'character.X0': 'Künstlerin X0', 'perk.X0': 'Schild/12s · kleiner Magnet',
      'ui.paused': 'PAUSE', 'ui.resume': 'WEITER', 'ui.restart': 'NEUSTART', 'ui.changeCharacter': 'FIGUR WÄHLEN', 'over.at': 'Gestürzt in {world}', 'over.together': 'Doch die drei halten zusammen.',
      'room.apt': 'Wohnung · Zuhause', 'room.tea': 'Sakura-Teehaus', 'room.lodge': 'Schneehütte', 'room.cabin': 'Berghütte', 'room.party': 'Runde geschafft!', 'room.court': 'Oase · Rastplatz',
      'boss.eel': 'Der Lavastrom-Aal erscheint!', 'boss.butler': 'Der Butlergeist erscheint!', 'tea.inscription': 'Ein Moment, eine Begegnung'
    },
    la: {
      'world.park': 'Hortus Modernus', 'world.snow': 'Dorsum Gelidum · Campus Nivalis', 'world.peak': 'Vertex Glacialis', 'world.home': 'Vicus Modernus', 'world.cabin': 'Hospitium Montanum', 'world.ridge': 'Dorsum Tempestatis', 'world.cave': 'Ignis in Specu', 'world.lake': 'Iter Domum · Lacus Gelidus',
      'world.xian': 'Pons Nubium · Regnum Gladii', 'world.ink': 'Montes Atramento Picti', 'world.cyber': 'Urbs Pluvialis · Vicus Insomnis', 'world.steam': 'Aula Fornacis · Secundus Spiritus', 'world.sea': 'Ruinae Corallinae · Aestus', 'world.market': 'Forum Nocturnum · Vicus Lucernarum', 'world.sakura': 'Sakura · Fanum Vulpium', 'world.bit8': 'Picta Elementa · Mundus Octobiticus',
      'world.desert': 'Ruinae Arenosae', 'world.volcano': 'Vertex Magmaticus', 'world.haunt': 'Domus Manium', 'world.skycity': 'Urbs Caelestis', 'world.space': 'Mare Astrorum · Statio Orbitalis', 'world.mirror': 'Lacus Speculi · Imagines', 'world.candy': 'Somnium Sacchari Filati', 'world.court': 'Oasis · Locus Quietis',
      'character.Feline1': 'Feles Feline1', 'perk.Feline1': '4 corda · +1/25s · saltus duplex', 'character.C0': 'Programmata C0', 'perk.C0': 'Mora + transfixio · B/Z', 'character.X0': 'Artifex X0', 'perk.X0': 'Scutum/12s · parvus magnes',
      'ui.paused': 'PAUSATUM', 'ui.resume': 'PERGE', 'ui.restart': 'RENOVA', 'ui.changeCharacter': 'HEROEM ELIGE', 'over.at': 'Cecidit in {world}', 'over.together': 'Sed tres una manent.',
      'room.apt': 'Domus · Habitatio', 'room.tea': 'Domus Thearia Sakura', 'room.lodge': 'Casa Nivalis', 'room.cabin': 'Casa Montis', 'room.party': 'Circuitus perfectus!', 'room.court': 'Oasis · Quies',
      'boss.eel': 'Anguis Lavae apparuit!', 'boss.butler': 'Manes Vilici apparuit!', 'tea.inscription': 'Unum tempus, unus occursus'
    }
  };

  var LANGS = Object.keys(messages), locale = 'en', manual = false, localeSource = 'fallback', localeGeneration = 0;
  var autoNames = { 'zh-CN': '自动', en: 'Automatic', ja: '自動', ru: 'Автоматически', es: 'Automático', 'pt-PT': 'Automático', 'pt-BR': 'Automático', de: 'Automatisch', la: 'Automatice' };
  function savedLocale() {
    try { var saved = localStorage.getItem('c0-site-language'); return saved && messages[saved] ? saved : ''; } catch (e) { return ''; }
  }
  function matchLanguage(value) {
    if (typeof value !== 'string') return '';
    var tag = value.replace(/_/g, '-').toLowerCase().split(/-(?:u|x|t)-/)[0];
    if (!/^[a-z]{2,3}(?:-[a-z0-9]{2,8})*$/.test(tag)) return '';
    var exact = LANGS.filter(function (key) { return key.toLowerCase() === tag; })[0];
    if (exact) return exact;
    var base = tag.split('-')[0];
    if (base === 'zh') return 'zh-CN';
    if (base === 'pt') return /(?:^|-)br(?:-|$)/.test(tag) ? 'pt-BR' : 'pt-PT';
    return messages[base] ? base : '';
  }
  function browserLocale() {
    var langs = (typeof navigator !== 'undefined' && navigator.languages && navigator.languages.length) ? navigator.languages : [typeof navigator !== 'undefined' ? navigator.language : ''];
    for (var i = 0; i < langs.length; i++) { var match = matchLanguage(langs[i]); if (match) return match; }
    return '';
  }
  var initialSaved = savedLocale(), initialBrowser = browserLocale();
  if (initialSaved) { locale = initialSaved; manual = true; localeSource = 'saved'; }
  else if (initialBrowser) { locale = initialBrowser; localeSource = 'browser'; }
  function notify() {
    window.dispatchEvent(new CustomEvent('c0-language-change', { detail: { locale: locale, source: localeSource, automatic: !manual } }));
  }
  async function automaticLocale() {
    var generation = ++localeGeneration, chosen = browserLocale();
    manual = false;
    locale = chosen || 'en'; localeSource = chosen ? 'browser' : 'fallback'; apply(); notify();
    if (chosen) return;
    var controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    var timeout = setTimeout(function () { if (controller) controller.abort(); }, 3000);
    try {
      var options = { credentials: 'omit', cache: 'no-store' }; if (controller) options.signal = controller.signal;
      var response = await fetch('https://feline1.top/api/site-locale', options);
      if (!response.ok) return;
      var data = await response.json();
      if (generation !== localeGeneration || manual || !data || data.source !== 'ip' || !messages[data.locale]) return;
      locale = data.locale; localeSource = 'ip'; apply(); notify();
    } catch (e) { /* Offline, blocked country lookup or timeout leaves English usable. */ }
    finally { clearTimeout(timeout); }
  }

  function t(key, vars) {
    var dict = messages[locale] || messages.en, value = dict[key];
    if (value === undefined) value = messages.en[key];
    if (value === undefined) value = messages['zh-CN'][key];
    if (value === undefined) return key;
    return String(value).replace(/\{(\w+)\}/g, function (all, name) {
      return vars && vars[name] !== undefined ? String(vars[name]) : all;
    });
  }
  function apply() {
    document.documentElement.lang = locale;
    document.title = t('site.title');
    var desc = document.querySelector('meta[name="description"]');
    if (desc) desc.content = t('site.description');
    document.querySelectorAll('[data-i18n]').forEach(function (el) { el.textContent = t(el.getAttribute('data-i18n')); });
    document.querySelectorAll('[data-i18n-html]').forEach(function (el) { el.innerHTML = t(el.getAttribute('data-i18n-html')); });
    document.querySelectorAll('[data-i18n-aria-label]').forEach(function (el) { el.setAttribute('aria-label', t(el.getAttribute('data-i18n-aria-label'))); });
    document.querySelectorAll('[data-i18n-title]').forEach(function (el) { el.setAttribute('title', t(el.getAttribute('data-i18n-title'))); });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) { el.setAttribute('placeholder', t(el.getAttribute('data-i18n-placeholder'))); });
    var select = document.getElementById('langSelect');
    if (select) {
      var automatic = select.querySelector('option[value="auto"]');
      var current = select.querySelector('option[value="' + locale + '"]');
      if (automatic) automatic.textContent = (autoNames[locale] || autoNames.en) + ' · ' + (current ? current.textContent : locale);
      select.value = manual ? locale : 'auto';
    }
  }
  function setLocale(next) {
    if (next === 'auto') {
      try { localStorage.removeItem('c0-site-language'); } catch (e) { }
      return automaticLocale();
    }
    if (!messages[next]) return;
    ++localeGeneration; manual = true; locale = next; localeSource = 'saved';
    try { localStorage.setItem('c0-site-language', locale); } catch (e) { }
    apply(); notify();
  }

  function formatLog(value, vars) {
    return String(value).replace(/\{(\w+)\}/g, function (all, name) { return vars && vars[name] !== undefined ? String(vars[name]) : all; });
  }
  function logText(key, vars) {
    var pack = buildLogs[locale] || buildLogs.en;
    return formatLog(pack[key] === undefined ? buildLogs.en[key] || key : pack[key], vars);
  }
  function getLogLines(kind) {
    var pack = buildLogs[locale] || buildLogs.en, lines = pack[kind] || buildLogs.en[kind] || [];
    return lines.map(function (line) { return line.slice(); });
  }
  function gameText(key, vars) {
    var pack = gameTexts[locale] || gameTexts.en, value = pack[key];
    if (value === undefined) value = gameTexts.en[key];
    if (value === undefined) value = key;
    return formatLog(value, vars);
  }
  window.I18N = { t: t, game: gameText, log: logText, getLogLines: getLogLines, apply: apply, setLocale: setLocale, getLocale: function () { return locale; }, getLocaleSource: function () { return localeSource; }, isAutomatic: function () { return !manual; }, locales: LANGS.slice() };
  apply();
  var select = document.getElementById('langSelect');
  if (select) select.addEventListener('change', function () { setLocale(select.value); });
  notify();
  if (!manual && !initialBrowser) automaticLocale();
  window.addEventListener('languagechange', function () { if (!manual) automaticLocale(); });
  window.addEventListener('storage', function (event) {
    if (event.key !== 'c0-site-language' && event.key !== null) return;
    var saved = savedLocale();
    if (saved) { ++localeGeneration; manual = true; locale = saved; localeSource = 'saved'; apply(); notify(); }
    else automaticLocale();
  });
}());
