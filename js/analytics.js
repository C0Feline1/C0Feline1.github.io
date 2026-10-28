/* Minimal homepage analytics: per-page random IDs, no cross-visit identifier, no input values. */
(function () {
  'use strict';
  var endpoint = 'https://feline1.top/api/site-analytics/collect';
  var id, seq = 0, active = 0, since = 0, ready = false, starting = false;
  var enabled = false, timer, lastClick = {}, disabledKey = 'c0-analytics-disabled';
  function optedOut() { try { return localStorage.getItem(disabledKey) === '1'; } catch (e) { return false; } }
  function privacySignal() { return navigator.globalPrivacyControl === true || navigator.doNotTrack === '1'; }
  function seconds() { return Math.min(86400, Math.floor((active + (since ? performance.now() - since : 0)) / 1000)); }
  function payload(kind, target) { return { id: id, kind: kind, active: seconds(), seq: ++seq, target: target || '' }; }
  function source() {
    try {
      if (!document.referrer) return 'direct';
      var host = new URL(document.referrer).hostname;
      if (/(^|\.)(google\.[a-z.]+|bing\.com|baidu\.com|duckduckgo\.com)$/.test(host)) return 'search';
      if (/(^|\.)github\.com$/.test(host)) return 'github';
      if (/(^|\.)(t\.co|x\.com|facebook\.com|weibo\.com|reddit\.com)$/.test(host)) return 'social';
      return 'other';
    } catch (e) { return 'other'; }
  }
  function post(data, beacon) {
    var body = JSON.stringify(data);
    if (beacon && navigator.sendBeacon) {
      if (navigator.sendBeacon(endpoint, new Blob([body], { type: 'text/plain;charset=UTF-8' }))) return;
    }
    fetch(endpoint, { method: 'POST', body: body, headers: { 'Content-Type': 'text/plain;charset=UTF-8' }, credentials: 'omit', keepalive: true }).catch(function () {});
  }
  function startVisit() {
    if (!enabled || ready || starting || document.hidden) return;
    starting = true;
    var generation = id;
    var data = payload('visit'); data.source = source();
    fetch(endpoint, { method: 'POST', body: JSON.stringify(data), headers: { 'Content-Type': 'text/plain;charset=UTF-8' }, credentials: 'omit', keepalive: true })
      .then(function (r) { if (id === generation && enabled && r.ok) ready = true; })
      .catch(function () {}).finally(function () { if (id === generation) starting = false; });
  }
  function flush(beacon) {
    if (!enabled) return;
    if (!ready) { startVisit(); return; }
    post(payload('heartbeat'), beacon);
  }
  function pause() { if (since) { active += performance.now() - since; since = 0; } }
  function start() {
    if (enabled || optedOut() || privacySignal() || !window.crypto || !crypto.getRandomValues) return;
    var bytes = new Uint8Array(16); crypto.getRandomValues(bytes);
    id = Array.prototype.map.call(bytes, function (v) { return v.toString(16).padStart(2, '0'); }).join('');
    enabled = true; ready = starting = false; active = seq = 0;
    since = document.hidden ? 0 : performance.now();
    startVisit(); timer = setInterval(function () { if (!document.hidden) flush(false); }, 15000);
  }
  function stop() { pause(); enabled = ready = false; clearInterval(timer); }
  function track(target) {
    if (!enabled || !ready || document.hidden) return;
    var now = performance.now();
    if (now - (lastClick[target] || -10000) < 1000) return;
    lastClick[target] = now;
    post(payload('click', target), true);
  }
  document.addEventListener('visibilitychange', function () {
    if (!enabled) return;
    if (document.hidden) { pause(); flush(true); }
    else { since = performance.now(); startVisit(); }
  });
  window.addEventListener('pagehide', function () { pause(); flush(true); });
  window.addEventListener('pageshow', function () { if (enabled && !document.hidden && !since) since = performance.now(); });
  document.addEventListener('click', function (e) {
    var el = e.target.closest && e.target.closest('[data-analytics],#game,#bgmBtn,.dock-tabs button');
    if (!el) return;
    var target = el.getAttribute('data-analytics') || (el.id === 'game' ? 'game.screen' : el.id === 'bgmBtn' ? 'game.sound' : 'navigation.panel');
    track(target);
  });
  var lang = document.getElementById('langSelect');
  if (lang) lang.addEventListener('change', function () { track('language.select'); });
  window.addEventListener('runner', function (e) { if (e.detail && (e.detail.type === 'start' || e.detail.type === 'over')) track(e.detail.type === 'start' ? 'game.start' : 'game.end'); });
  var settings = document.createElement('button');
  settings.type = 'button'; settings.id = 'analyticsSettings';
  settings.style.cssText = 'position:fixed;bottom:5px;right:6px;z-index:10000;border:1px solid #6d537d;background:#140f22;color:#ddd;padding:5px 8px;font:11px sans-serif;cursor:pointer';
  var settingsTexts = {
    'zh-CN': {
      label: '访问统计设置', title: '主页访问统计',
      description: '本站统计访问时间、设备类别、来源类别、指定按钮点击及页面可见时长，用于改进主页。每次打开页面使用新的随机编号，不关联真实身份，不保存原始 IP、输入内容或跨次访问标识。数据发送至站长的 feline1.top 服务器，仅站长登录后可见，明细保留约 90 天。停留时长为估算。',
      enable: '开启统计', disable: '关闭统计', close: '关闭窗口',
      blocked: '浏览器禁止保存设置', signal: '浏览器已开启隐私信号，本页不采集统计。'
    },
    en: {
      label: 'Visit statistics', title: 'Homepage statistics',
      description: 'We measure visit times, device and source categories, selected button clicks and visible-page time to improve this homepage. Each page load gets a new random ID. We store no raw IP, input content or cross-visit identifier. Records are sent to the owner’s feline1.top server, accessible only to the owner, and retained for about 90 days. Duration is approximate.',
      enable: 'Enable statistics', disable: 'Disable statistics', close: 'Close',
      blocked: 'Browser blocked settings storage', signal: 'Your browser privacy signal disables collection on this page.'
    },
    ja: {
      label: 'アクセス統計の設定', title: 'ホームページのアクセス統計',
      description: 'ホームページの改善のため、アクセス時刻、端末と参照元の種類、指定ボタンのクリック、ページが表示されていた時間を集計します。ページを開くたびに新しいランダム ID を使用し、実名、元の IP アドレス、入力内容、再訪を識別する ID は保存しません。記録は管理者の feline1.top サーバーへ送信され、ログインした管理者のみが閲覧でき、約 90 日間保存されます。滞在時間は推定値です。',
      enable: '統計を有効にする', disable: '統計を無効にする', close: '閉じる',
      blocked: 'ブラウザーが設定の保存を拒否しました', signal: 'ブラウザーのプライバシー設定により、このページでは統計を収集しません。'
    },
    ru: {
      label: 'Настройки статистики', title: 'Статистика посещений',
      description: 'Для улучшения сайта мы учитываем время посещений, типы устройств и источников, нажатия выбранных кнопок и время видимости страницы. При каждом открытии создаётся новый случайный ID. Мы не сохраняем исходный IP, введённые данные или идентификатор для отслеживания повторных визитов и не связываем записи с реальной личностью. Записи отправляются на сервер владельца feline1.top, доступны только владельцу после входа и хранятся около 90 дней. Длительность приблизительная.',
      enable: 'Включить статистику', disable: 'Отключить статистику', close: 'Закрыть',
      blocked: 'Браузер запретил сохранение настроек', signal: 'Сигнал конфиденциальности браузера отключает сбор статистики на этой странице.'
    },
    es: {
      label: 'Ajustes de estadísticas', title: 'Estadísticas de visitas',
      description: 'Para mejorar esta página, medimos las horas de visita, las categorías de dispositivo y procedencia, los clics en botones concretos y el tiempo durante el que la página está visible. Cada apertura recibe un ID aleatorio nuevo. No guardamos la IP original, el contenido introducido ni identificadores entre visitas, ni vinculamos los registros con una identidad real. Los registros se envían al servidor feline1.top del propietario, solo son accesibles para él tras iniciar sesión y se conservan unos 90 días. La duración es aproximada.',
      enable: 'Activar estadísticas', disable: 'Desactivar estadísticas', close: 'Cerrar',
      blocked: 'El navegador bloqueó el guardado de los ajustes', signal: 'La señal de privacidad del navegador desactiva la recopilación en esta página.'
    },
    'pt-PT': {
      label: 'Definições de estatísticas', title: 'Estatísticas de visitas',
      description: 'Para melhorar esta página, medimos as horas das visitas, as categorias de dispositivo e origem, os cliques em botões específicos e o tempo em que a página está visível. Cada abertura recebe um novo ID aleatório. Não guardamos o IP original, o conteúdo introduzido nem identificadores entre visitas, nem associamos os registos à identidade real. Os registos são enviados para o servidor feline1.top do proprietário, apenas acessíveis por ele após iniciar sessão, e conservados durante cerca de 90 dias. A duração é aproximada.',
      enable: 'Ativar estatísticas', disable: 'Desativar estatísticas', close: 'Fechar',
      blocked: 'O navegador impediu a gravação das definições', signal: 'O sinal de privacidade do navegador desativa a recolha nesta página.'
    },
    'pt-BR': {
      label: 'Configurações de estatísticas', title: 'Estatísticas de visitas',
      description: 'Para melhorar esta página, medimos os horários das visitas, as categorias de dispositivo e origem, os cliques em botões específicos e o tempo em que a página fica visível. Cada abertura recebe um novo ID aleatório. Não salvamos o IP original, o conteúdo digitado nem identificadores entre visitas, nem associamos os registros à identidade real. Os registros são enviados ao servidor feline1.top do proprietário, acessíveis somente a ele após o login, e mantidos por cerca de 90 dias. A duração é aproximada.',
      enable: 'Ativar estatísticas', disable: 'Desativar estatísticas', close: 'Fechar',
      blocked: 'O navegador bloqueou o salvamento das configurações', signal: 'O sinal de privacidade do navegador desativa a coleta nesta página.'
    },
    de: {
      label: 'Statistikeinstellungen', title: 'Besuchsstatistik',
      description: 'Zur Verbesserung dieser Homepage erfassen wir Besuchszeiten, Geräte- und Herkunftskategorien, Klicks auf ausgewählte Schaltflächen und die sichtbare Seitenzeit. Bei jedem Öffnen wird eine neue zufällige ID erzeugt. Wir speichern keine ursprüngliche IP, Eingaben oder Kennung über mehrere Besuche hinweg und verknüpfen die Daten nicht mit einer realen Identität. Die Daten werden an den Server feline1.top des Betreibers gesendet, sind nur für ihn nach der Anmeldung sichtbar und werden etwa 90 Tage gespeichert. Die Dauer ist ein Schätzwert.',
      enable: 'Statistik aktivieren', disable: 'Statistik deaktivieren', close: 'Schließen',
      blocked: 'Der Browser hat das Speichern der Einstellungen blockiert', signal: 'Das Datenschutzsignal Ihres Browsers deaktiviert die Erfassung auf dieser Seite.'
    },
    la: {
      label: 'Optiones statisticae', title: 'Statistica visitationum',
      description: 'Ad hanc paginam emendandam tempora visitationum, genera instrumentorum et originum, pulsus in quibusdam globulis et tempus quo pagina visibilis est numeramus. Quotiens pagina aperitur, nova nota fortuita creatur. Inscriptionem IP originalem, textum a te scriptum aut notam inter visitationes persistentem non servamus nec res cum vera persona coniungimus. Notitiae ad ministrum domini feline1.top mittuntur; solus dominus ingressus eas videre potest. Circiter 90 dies servantur. Duratio aestimata est.',
      enable: 'Statisticam admitte', disable: 'Statisticam prohibe', close: 'Claude',
      blocked: 'Navigator optiones servari vetuit', signal: 'Signum privati navigatoris collectionem in hac pagina prohibet.'
    }
  };
  function settingsCopy() {
    var selected = window.I18N ? I18N.getLocale() : 'zh-CN';
    return settingsTexts[selected] || settingsTexts.en;
  }
  var dialog = document.createElement('dialog');
  dialog.style.cssText = 'max-width:440px;box-sizing:border-box;width:calc(100% - 32px);border:1px solid #ff4fa3;background:#140f22;color:#f2ecff;padding:24px;font:15px/1.7 sans-serif';
  function renderDialog() {
    var copy = settingsCopy();
    dialog.replaceChildren();
    var title = document.createElement('h2'); title.textContent = copy.title;
    var text = document.createElement('p'); text.textContent = copy.description;
    var toggle = document.createElement('button');
    toggle.textContent = optedOut() ? copy.enable : copy.disable;
    toggle.onclick = function () {
      try { if (optedOut()) localStorage.removeItem(disabledKey); else localStorage.setItem(disabledKey, '1'); }
      catch (e) { toggle.textContent = settingsCopy().blocked; return; }
      if (optedOut()) stop(); else start(); dialog.close();
    };
    var close = document.createElement('button'); close.textContent = copy.close; close.style.marginLeft = '12px'; close.onclick = function () { dialog.close(); };
    var signal = document.createElement('p'); signal.textContent = privacySignal() ? copy.signal : '';
    dialog.append(title, text, signal, toggle, close);
  }
  function label() {
    settings.textContent = settingsCopy().label;
    if (dialog.open) renderDialog();
  }
  label(); window.addEventListener('c0-language-change', label);
  settings.onclick = function () { renderDialog(); dialog.showModal(); };
  document.body.append(settings, dialog);
  window.addEventListener('storage', function (e) { if (e.key === disabledKey) { if (optedOut()) stop(); else start(); } });
  start();
}());
