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
    zh: {
      title: '💌 GUESTBOOK · 留言板', tag: 'SAY HELLO', tab: '留言',
      intro: '来过这里，留句话吧。昵称与留言保存在站长的 feline1.top 服务器，审核后公开展示。请勿填写联系方式或其他个人隐私信息。',
      nickname: '昵称', nicknameHint: '1–24 个字', nicknamePlaceholder: '怎么称呼你？',
      message: '留言', messagePlaceholder: '想说的话……（最多 1000 字）',
      send: '发送留言', sending: '正在提交……', sent: '留言已提交！站长审核通过后会出现在这里。',
      invalid: '请填写 1–24 字昵称和 1–1000 字留言。', failed: '提交失败，请稍后重试；你填写的内容已保留。',
      limited: '提交太频繁了，请稍后再试。', offline: '网络连接失败，请稍后重试；你填写的内容已保留。',
      empty: '还没有公开留言，来打个招呼吧。', loading: '正在读取留言……', listFailed: '留言暂时无法读取，点击“刷新留言”重试。',
      refresh: '刷新留言', prev: '上一页', next: '下一页', page: '第 {page} 页', reply: '站长回复', website: '网站（请留空）'
    },
    en: {
      title: '💌 GUESTBOOK', tag: 'SAY HELLO', tab: 'Notes',
      intro: 'Leave a hello. Nicknames and messages are stored on the owner’s feline1.top server and become public after approval. Please keep contact details and other personal information out of your message.',
      nickname: 'Nickname', nicknameHint: '1–24 characters', nicknamePlaceholder: 'What should we call you?',
      message: 'Message', messagePlaceholder: 'Your note… (up to 1000 characters)',
      send: 'Send message', sending: 'Sending…', sent: 'Message submitted! It will appear here after owner approval.',
      invalid: 'Enter a nickname of 1–24 characters and a message of 1–1000 characters.', failed: 'Submission failed. Please try again later. Your text has been kept.',
      limited: 'Too many submissions. Please try again later.', offline: 'Connection failed. Please try again later. Your text has been kept.',
      empty: 'No public messages yet. Be the first to say hello.', loading: 'Loading messages…', listFailed: 'Messages could not be loaded. Choose “Refresh messages” to retry.',
      refresh: 'Refresh messages', prev: 'Previous', next: 'Next', page: 'Page {page}', reply: 'Owner reply', website: 'Website (leave blank)'
    }
  };
  function pack() { return words[window.I18N && I18N.getLocale() !== 'zh-CN' ? 'en' : 'zh']; }
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
