/* Public moderated guestbook. Visitor text is always rendered as text, never HTML. */
(function () {
  'use strict';
  var root = document.getElementById('guestbook');
  if (!root) return;
  var endpoint = 'https://feline1.top/api/guestbook/messages';
  var list = document.getElementById('guestbookList');
  var form = document.getElementById('guestbookForm');
  var nickname = document.getElementById('guestbookNickname');
  var message = document.getElementById('guestbookMessage');
  var website = document.getElementById('guestbookWebsite');
  var feedback = document.getElementById('guestbookFeedback');
  var listStatus = document.getElementById('guestbookListStatus');
  var counter = document.getElementById('guestbookCounter');
  var submit = document.getElementById('guestbookSubmit');
  var prev = document.getElementById('guestbookPrev');
  var next = document.getElementById('guestbookNext');
  var refresh = document.getElementById('guestbookRefresh');
  var page = 1, more = false, sending = false, loading = false, request = 0;
  var rows = [], listError = false, feedbackKind = '', loaded = false;
  var words = {
  "en": {
    "title": "💌 GUESTBOOK",
    "tag": "SAY HELLO",
    "tab": "Notes",
    "intro": "Leave a hello. Nicknames and messages are stored on the owner’s feline1.top server and become public after approval. Please keep contact details and other personal information out of your message.",
    "nickname": "Nickname",
    "nicknameHint": "1–24 characters",
    "nicknamePlaceholder": "What should we call you?",
    "message": "Message",
    "messagePlaceholder": "Your note… (up to 1000 characters)",
    "send": "Send message",
    "sending": "Sending…",
    "sent": "Message submitted! It will appear here after owner approval.",
    "invalid": "Enter a nickname of 1–24 characters and a message of 1–1000 characters.",
    "failed": "Submission failed. Please try again later. Your text has been kept.",
    "limited": "Too many submissions. Please try again later.",
    "offline": "Connection failed. Please try again later. Your text has been kept.",
    "empty": "No public messages yet. Be the first to say hello.",
    "loading": "Loading messages…",
    "listFailed": "Messages could not be loaded. Choose “Refresh messages” to retry.",
    "refresh": "Refresh messages",
    "prev": "Previous",
    "next": "Next",
    "page": "Page {page}",
    "reply": "Owner reply",
    "website": "Website (leave blank)",
    "listLabel": "Public messages"
  },
  "zh-CN": {
    "title": "💌 GUESTBOOK · 留言板",
    "tag": "SAY HELLO",
    "tab": "留言",
    "intro": "来过这里，留句话吧。昵称与留言保存在站长的 feline1.top 服务器，审核后公开展示。请勿填写联系方式或其他个人隐私信息。",
    "nickname": "昵称",
    "nicknameHint": "1–24 个字",
    "nicknamePlaceholder": "怎么称呼你？",
    "message": "留言",
    "messagePlaceholder": "想说的话……（最多 1000 字）",
    "send": "发送留言",
    "sending": "正在提交……",
    "sent": "留言已提交！站长审核通过后会出现在这里。",
    "invalid": "请填写 1–24 字昵称和 1–1000 字留言。",
    "failed": "提交失败，请稍后重试；你填写的内容已保留。",
    "limited": "提交太频繁了，请稍后再试。",
    "offline": "网络连接失败，请稍后重试；你填写的内容已保留。",
    "empty": "还没有公开留言，来打个招呼吧。",
    "loading": "正在读取留言……",
    "listFailed": "留言暂时无法读取，点击“刷新留言”重试。",
    "refresh": "刷新留言",
    "prev": "上一页",
    "next": "下一页",
    "page": "第 {page} 页",
    "reply": "站长回复",
    "website": "网站（请留空）",
    "listLabel": "公开留言"
  },
  "ja": {
    "title": "💌 ゲストブック",
    "tag": "ひとことどうぞ",
    "tab": "伝言",
    "intro": "訪問の記念に、ひとことどうぞ。ニックネームとメッセージは管理人の feline1.top サーバーに保存され、承認後に公開されます。連絡先などの個人情報は書かないでください。",
    "nickname": "ニックネーム",
    "nicknameHint": "1～24 文字",
    "nicknamePlaceholder": "お名前を教えてください",
    "message": "メッセージ",
    "messagePlaceholder": "ひとことどうぞ…（1000 文字まで）",
    "send": "送信する",
    "sending": "送信中…",
    "sent": "送信しました！管理人が承認すると、ここに表示されます。",
    "invalid": "ニックネームを 1～24 文字、メッセージを 1～1000 文字で入力してください。",
    "failed": "送信できませんでした。しばらくしてから再試行してください。入力内容は保持されています。",
    "limited": "送信回数が多すぎます。しばらくしてから再試行してください。",
    "offline": "接続できませんでした。しばらくしてから再試行してください。入力内容は保持されています。",
    "empty": "公開されたメッセージはまだありません。最初のひとことをどうぞ。",
    "loading": "メッセージを読み込み中…",
    "listFailed": "メッセージを読み込めませんでした。「再読み込み」で再試行してください。",
    "refresh": "再読み込み",
    "prev": "前へ",
    "next": "次へ",
    "page": "{page} ページ",
    "reply": "管理人からの返信",
    "website": "ウェブサイト（空欄にしてください）",
    "listLabel": "公開メッセージ"
  },
  "ru": {
    "title": "💌 ГОСТЕВАЯ КНИГА",
    "tag": "ПЕРЕДАЙТЕ ПРИВЕТ",
    "tab": "Отзывы",
    "intro": "Оставьте привет! Псевдонимы и сообщения сохраняются на сервере владельца feline1.top и публикуются после одобрения. Не указывайте контактные данные и другую личную информацию.",
    "nickname": "Псевдоним",
    "nicknameHint": "1–24 символа",
    "nicknamePlaceholder": "Как к вам обращаться?",
    "message": "Сообщение",
    "messagePlaceholder": "Ваше сообщение… (до 1000 символов)",
    "send": "Отправить",
    "sending": "Отправка…",
    "sent": "Сообщение отправлено! Оно появится здесь после одобрения владельцем.",
    "invalid": "Введите псевдоним длиной 1–24 символа и сообщение длиной 1–1000 символов.",
    "failed": "Не удалось отправить сообщение. Повторите попытку позже. Введённый текст сохранён.",
    "limited": "Слишком много отправок. Повторите попытку позже.",
    "offline": "Ошибка соединения. Повторите попытку позже. Введённый текст сохранён.",
    "empty": "Опубликованных сообщений пока нет. Передайте привет первым!",
    "loading": "Загрузка сообщений…",
    "listFailed": "Не удалось загрузить сообщения. Нажмите «Обновить», чтобы повторить попытку.",
    "refresh": "Обновить",
    "prev": "Назад",
    "next": "Далее",
    "page": "Страница {page}",
    "reply": "Ответ владельца",
    "website": "Сайт (оставьте поле пустым)",
    "listLabel": "Опубликованные сообщения"
  },
  "es": {
    "title": "💌 LIBRO DE VISITAS",
    "tag": "¡SALUDA!",
    "tab": "Mensajes",
    "intro": "Deja un saludo. Los nombres y mensajes se guardan en el servidor feline1.top del propietario y se publican tras su aprobación. No incluyas datos de contacto ni otra información personal.",
    "nickname": "Nombre",
    "nicknameHint": "1–24 caracteres",
    "nicknamePlaceholder": "¿Cómo te llamamos?",
    "message": "Mensaje",
    "messagePlaceholder": "Tu mensaje… (hasta 1000 caracteres)",
    "send": "Enviar mensaje",
    "sending": "Enviando…",
    "sent": "¡Mensaje enviado! Aparecerá aquí cuando el propietario lo apruebe.",
    "invalid": "Escribe un nombre de 1–24 caracteres y un mensaje de 1–1000 caracteres.",
    "failed": "No se pudo enviar. Inténtalo de nuevo más tarde. Se ha conservado tu texto.",
    "limited": "Has enviado demasiados mensajes. Inténtalo de nuevo más tarde.",
    "offline": "Error de conexión. Inténtalo de nuevo más tarde. Se ha conservado tu texto.",
    "empty": "Todavía no hay mensajes públicos. ¡Sé la primera persona en saludar!",
    "loading": "Cargando mensajes…",
    "listFailed": "No se pudieron cargar los mensajes. Pulsa «Actualizar» para reintentarlo.",
    "refresh": "Actualizar",
    "prev": "Anterior",
    "next": "Siguiente",
    "page": "Página {page}",
    "reply": "Respuesta del propietario",
    "website": "Sitio web (déjalo en blanco)",
    "listLabel": "Mensajes públicos"
  },
  "pt-PT": {
    "title": "💌 LIVRO DE VISITAS",
    "tag": "DEIXA UM OLÁ",
    "tab": "Mensagens",
    "intro": "Deixa um olá. Os nomes e as mensagens ficam guardados no servidor feline1.top do proprietário e são publicados após aprovação. Não incluas contactos nem outras informações pessoais.",
    "nickname": "Nome",
    "nicknameHint": "1–24 carateres",
    "nicknamePlaceholder": "Como te devemos chamar?",
    "message": "Mensagem",
    "messagePlaceholder": "A tua mensagem… (até 1000 carateres)",
    "send": "Enviar mensagem",
    "sending": "A enviar…",
    "sent": "Mensagem enviada! Será apresentada aqui após aprovação do proprietário.",
    "invalid": "Introduz um nome com 1–24 carateres e uma mensagem com 1–1000 carateres.",
    "failed": "Não foi possível enviar. Tenta novamente mais tarde. O teu texto foi mantido.",
    "limited": "Enviaste demasiadas mensagens. Tenta novamente mais tarde.",
    "offline": "Falha na ligação. Tenta novamente mais tarde. O teu texto foi mantido.",
    "empty": "Ainda não há mensagens públicas. Sê a primeira pessoa a dizer olá!",
    "loading": "A carregar mensagens…",
    "listFailed": "Não foi possível carregar as mensagens. Escolhe «Atualizar» para tentar novamente.",
    "refresh": "Atualizar",
    "prev": "Anterior",
    "next": "Seguinte",
    "page": "Página {page}",
    "reply": "Resposta do proprietário",
    "website": "Sítio web (deixar em branco)",
    "listLabel": "Mensagens públicas"
  },
  "pt-BR": {
    "title": "💌 LIVRO DE VISITAS",
    "tag": "MANDE UM OLÁ",
    "tab": "Mensagens",
    "intro": "Deixe um olá. Os nomes e as mensagens são armazenados no servidor feline1.top do proprietário e publicados após aprovação. Não inclua contatos nem outras informações pessoais.",
    "nickname": "Apelido",
    "nicknameHint": "1–24 caracteres",
    "nicknamePlaceholder": "Como podemos chamar você?",
    "message": "Mensagem",
    "messagePlaceholder": "Sua mensagem… (até 1000 caracteres)",
    "send": "Enviar mensagem",
    "sending": "Enviando…",
    "sent": "Mensagem enviada! Ela aparecerá aqui após a aprovação do proprietário.",
    "invalid": "Digite um apelido de 1–24 caracteres e uma mensagem de 1–1000 caracteres.",
    "failed": "Não foi possível enviar. Tente novamente mais tarde. Seu texto foi mantido.",
    "limited": "Você enviou mensagens demais. Tente novamente mais tarde.",
    "offline": "Falha na conexão. Tente novamente mais tarde. Seu texto foi mantido.",
    "empty": "Ainda não há mensagens públicas. Seja a primeira pessoa a dar um olá!",
    "loading": "Carregando mensagens…",
    "listFailed": "Não foi possível carregar as mensagens. Selecione «Atualizar» para tentar novamente.",
    "refresh": "Atualizar",
    "prev": "Anterior",
    "next": "Próxima",
    "page": "Página {page}",
    "reply": "Resposta do proprietário",
    "website": "Site (deixe em branco)",
    "listLabel": "Mensagens públicas"
  },
  "de": {
    "title": "💌 GÄSTEBUCH",
    "tag": "SAG HALLO",
    "tab": "Gästebuch",
    "intro": "Hinterlasse einen Gruß. Namen und Nachrichten werden auf dem Server feline1.top des Betreibers gespeichert und nach Freigabe veröffentlicht. Bitte gib keine Kontaktdaten oder anderen persönlichen Informationen an.",
    "nickname": "Nickname",
    "nicknameHint": "1–24 Zeichen",
    "nicknamePlaceholder": "Wie sollen wir dich nennen?",
    "message": "Nachricht",
    "messagePlaceholder": "Deine Nachricht… (bis zu 1000 Zeichen)",
    "send": "Nachricht senden",
    "sending": "Wird gesendet…",
    "sent": "Nachricht gesendet! Nach der Freigabe durch den Betreiber erscheint sie hier.",
    "invalid": "Gib einen Nickname mit 1–24 Zeichen und eine Nachricht mit 1–1000 Zeichen ein.",
    "failed": "Senden fehlgeschlagen. Bitte versuche es später erneut. Dein Text bleibt erhalten.",
    "limited": "Zu viele Nachrichten. Bitte versuche es später erneut.",
    "offline": "Verbindung fehlgeschlagen. Bitte versuche es später erneut. Dein Text bleibt erhalten.",
    "empty": "Noch keine öffentlichen Nachrichten. Hinterlasse den ersten Gruß!",
    "loading": "Nachrichten werden geladen…",
    "listFailed": "Nachrichten konnten nicht geladen werden. Wähle „Aktualisieren“, um es erneut zu versuchen.",
    "refresh": "Aktualisieren",
    "prev": "Zurück",
    "next": "Weiter",
    "page": "Seite {page}",
    "reply": "Antwort des Betreibers",
    "website": "Webseite (leer lassen)",
    "listLabel": "Öffentliche Nachrichten"
  },
  "la": {
    "title": "💌 LIBER HOSPITUM",
    "tag": "SALUTEM RELINQUE",
    "tab": "Hospites",
    "intro": "Salutationem relinque. Nomina et nuntii in servitore domini feline1.top servantur et post approbationem publicantur. Ne inscriptiones contactus aliasve res privatas scribas.",
    "nickname": "Nomen",
    "nicknameHint": "1–24 litterae",
    "nicknamePlaceholder": "Quo nomine te appellamus?",
    "message": "Nuntius",
    "messagePlaceholder": "Nuntius tuus… (ad 1000 litteras)",
    "send": "Nuntium mitte",
    "sending": "Mittitur…",
    "sent": "Nuntius missus est! Hic apparebit post approbationem domini.",
    "invalid": "Nomen ex 1–24 litteris et nuntium ex 1–1000 litteris scribe.",
    "failed": "Nuntius mitti non potuit. Postea iterum tempta. Textus tuus servatus est.",
    "limited": "Nimium multi nuntii missi sunt. Postea iterum tempta.",
    "offline": "Conexio defecit. Postea iterum tempta. Textus tuus servatus est.",
    "empty": "Nulli nuntii publici adhuc sunt. Primam salutationem relinque!",
    "loading": "Nuntii leguntur…",
    "listFailed": "Nuntii legi non potuerunt. Elige «Renova» ut iterum temptes.",
    "refresh": "Renova",
    "prev": "Prior",
    "next": "Sequens",
    "page": "Pagina {page}",
    "reply": "Responsum domini",
    "website": "Situs interretialis (vacuum relinque)",
    "listLabel": "Nuntii publici"
  }
};
  function pack() { var language = window.I18N ? I18N.getLocale() : 'zh-CN'; return words[language] || words.en; }
  function text(key) { return pack()[key] || key; }
  function el(tag, cls, value) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (value !== undefined) node.textContent = value;
    return node;
  }
  function date(value) {
    var d = new Date(typeof value === 'number' ? value * 1000 : value);
    if (!Number.isFinite(d.getTime())) return '';
    return d.toLocaleString(window.I18N ? I18N.getLocale() : 'zh-CN', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  }
  function renderRows() {
    list.replaceChildren();
    rows.forEach(function (row) {
      var item = el('li', 'gb-entry');
      var meta = el('div', 'gb-meta');
      meta.append(el('strong', '', row.nickname), el('time', '', date(row.created_at)));
      item.append(meta, el('p', 'gb-text', row.message));
      if (row.reply) {
        var reply = el('div', 'gb-reply');
        var label = el('div', 'gb-meta');
        label.append(el('strong', '', text('reply')));
        if (row.reply_at) label.append(el('time', '', date(row.reply_at)));
        reply.append(label, el('p', 'gb-text', row.reply)); item.append(reply);
      }
      list.append(item);
    });
    listStatus.textContent = loading ? text('loading') : listError ? text('listFailed') : rows.length ? '' : text('empty');
    document.getElementById('guestbookPage').textContent = text('page').replace('{page}', page);
    prev.disabled = loading || page <= 1;
    next.disabled = loading || !more;
    refresh.disabled = loading;
  }
  function count() { counter.textContent = Array.from(message.value).length + ' / 1000'; }
  function locale() {
    root.querySelectorAll('[data-gb-text]').forEach(function (node) { node.textContent = text(node.getAttribute('data-gb-text')); });
    var tab = document.querySelector('[data-t="guestbook"]'); if (tab) tab.textContent = text('tab');
    nickname.placeholder = text('nicknamePlaceholder'); message.placeholder = text('messagePlaceholder');
    list.setAttribute('aria-label', text('listLabel'));
    submit.textContent = text(sending ? 'sending' : 'send');
    if (feedbackKind) feedback.textContent = text(feedbackKind);
    renderRows(); count();
  }
  async function timedFetch(url, options, parseJson) {
    var controller = new AbortController();
    var timeout = setTimeout(function () { controller.abort(); }, 15000);
    try {
      var response = await fetch(url, Object.assign({}, options, { signal: controller.signal }));
      if (parseJson) {
        if (!response.ok) throw new Error('HTTP ' + response.status);
        return await response.json();
      }
      return response;
    }
    finally { clearTimeout(timeout); }
  }
  async function load(targetPage) {
    var ownRequest = ++request;
    loading = true; listError = false; renderRows();
    try {
      var data = await timedFetch(endpoint + '?page=' + targetPage, { credentials: 'omit', cache: 'no-store' }, true);
      if (!data || !Array.isArray(data.messages)) throw new Error('Invalid response');
      if (request !== ownRequest) return;
      rows = data.messages; page = data.page || targetPage; more = !!data.has_more; loaded = true;
    } catch (error) { if (request === ownRequest) listError = true; }
    finally { if (request === ownRequest) { loading = false; renderRows(); } }
  }
  form.addEventListener('submit', async function (event) {
    event.preventDefault();
    if (sending) return;
    var name = nickname.value.trim(), body = message.value.trim();
    var nameLength = Array.from(name).length, bodyLength = Array.from(body).length;
    if (nameLength < 1 || nameLength > 24 || bodyLength < 1 || bodyLength > 1000) {
      feedbackKind = 'invalid'; feedback.textContent = text(feedbackKind); feedback.className = 'gb-feedback error'; return;
    }
    sending = true; submit.disabled = true; submit.textContent = text('sending');
    feedbackKind = ''; feedback.textContent = ''; feedback.className = 'gb-feedback';
    try {
      var response = await timedFetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'omit', body: JSON.stringify({ nickname: name, message: body, website: website.value }) });
      if (!response.ok) {
        feedbackKind = response.status === 429 ? 'limited' : 'failed'; feedback.className = 'gb-feedback error';
      } else {
        feedbackKind = 'sent'; feedback.className = 'gb-feedback success';
        message.value = ''; website.value = ''; count();
      }
    } catch (error) { feedbackKind = 'offline'; feedback.className = 'gb-feedback error'; }
    finally { sending = false; submit.disabled = false; submit.textContent = text('send'); feedback.textContent = text(feedbackKind); }
  });
  message.addEventListener('input', count);
  prev.addEventListener('click', function () { load(Math.max(1, page - 1)); });
  next.addEventListener('click', function () { if (more) load(page + 1); });
  refresh.addEventListener('click', function () { load(page); });
  window.addEventListener('c0-language-change', locale);
  locale();
  // Load when the board is reached or opened from the phone information tabs.
  if (window.IntersectionObserver) {
    var observer = new IntersectionObserver(function (entries) {
      if (entries.some(function (entry) { return entry.isIntersecting; }) && !loaded && !loading) load(1);
    }); observer.observe(root);
  } else load(1);
  var tab = document.querySelector('[data-t="guestbook"]');
  if (tab) tab.addEventListener('click', function () { if (!loaded && !loading) load(1); });
}());
