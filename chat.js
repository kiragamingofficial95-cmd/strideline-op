// StrideLine chatbot — lead capture like kingcontractor style widget.
// Stores every conversation in localStorage (op_chats) for /admin inbox.
(function () {
  var LS_KEY = 'op_chats';
  var session = { id: 'c_' + Date.now().toString(36), started: new Date().toISOString(), messages: [], lead: {}, step: 'start' };

  function save() {
    try {
      var all = JSON.parse(localStorage.getItem(LS_KEY) || '[]');
      var i = all.findIndex(function (c) { return c.id === session.id; });
      if (i >= 0) all[i] = session; else all.unshift(session);
      localStorage.setItem(LS_KEY, JSON.stringify(all.slice(0, 200)));
    } catch (e) {}
  }
  function push(from, text) {
    session.messages.push({ from: from, text: text, t: new Date().toISOString() });
    save();
  }

  // Build widget DOM
  var root = document.createElement('div');
  root.id = 'chatRoot';
  root.innerHTML =
    '<button id="chatFab" aria-label="Chat with us">💬<span id="chatDot">1</span></button>' +
    '<div id="chatBox" aria-hidden="true">' +
      '<div id="chatHead"><div><strong>StrideLine Assistant</strong><span>● Online — replies instantly</span></div>' +
      '<button id="chatClose" aria-label="Close chat">✕</button></div>' +
      '<div id="chatLog"></div>' +
      '<div id="chatQuick"></div>' +
      '<form id="chatForm"><input id="chatInput" placeholder="Type a message…" autocomplete="off" />' +
      '<button type="submit" aria-label="Send">➤</button></form>' +
    '</div>';
  document.body.appendChild(root);

  var fab = document.getElementById('chatFab'),
      box = document.getElementById('chatBox'),
      log = document.getElementById('chatLog'),
      form = document.getElementById('chatForm'),
      input = document.getElementById('chatInput'),
      quick = document.getElementById('chatQuick'),
      dot = document.getElementById('chatDot');

  function open() { box.classList.add('open'); box.setAttribute('aria-hidden', 'false'); dot.style.display = 'none'; setTimeout(function(){ input.focus(); }, 100); }
  function close() { box.classList.remove('open'); box.setAttribute('aria-hidden', 'true'); }
  fab.addEventListener('click', function () { box.classList.contains('open') ? close() : open(); });
  document.getElementById('chatClose').addEventListener('click', close);

  function bubble(from, text) {
    var d = document.createElement('div');
    d.className = 'msg ' + from;
    d.textContent = text;
    log.appendChild(d);
    log.scrollTop = log.scrollHeight;
  }
  function bot(text) { bubble('bot', text); push('bot', text); }
  function user(text) { bubble('user', text); push('user', text); }

  function setQuick(opts) {
    quick.innerHTML = '';
    (opts || []).forEach(function (o) {
      var b = document.createElement('button');
      b.type = 'button'; b.textContent = o;
      b.addEventListener('click', function () { handleUser(o); });
      quick.appendChild(b);
    });
  }
  function typing(cb, delay) {
    var t = document.createElement('div');
    t.className = 'msg bot typing'; t.textContent = '●●●';
    log.appendChild(t); log.scrollTop = log.scrollHeight;
    setTimeout(function () { t.remove(); cb(); }, delay || 700);
  }
  function say(text, quicks) { typing(function () { bot(text); setQuick(quicks); }); }

  function start() {
    bot("👋 Hey! I'm the StrideLine assistant. We build websites exclusively for O&P clinics.");
    typing(function () {
      bot('Want a free audit showing what\'s leaking evals on your current site?');
      setQuick(['Yes — free audit', 'Pricing', 'Talk to Varad']);
    });
  }

  function handleUser(text) {
    var v = (text || '').trim();
    if (!v) return;
    user(v);
    setQuick([]);
    var low = v.toLowerCase();

    if (/price|cost|much/.test(low)) {
      say('Fixed-price builds: most O&P sites $3.5k–$7.5k, no retainer. Covered by our 100% money-back guarantee. Want me to start your free audit to scope it?', ['Yes — free audit', 'Talk to Varad']);
      return;
    }
    if (/human|call|varad|phone/.test(low)) {
      say('Got it — Varad will reach out. Drop your cell number and clinic name (e.g. "7345550100, LimbWise") and we\'ll text you today.');
      session.step = 'phone_direct';
      return;
    }

    switch (session.step) {
      case 'start':
        if (/audit|yes|sure|ok/i.test(v)) { session.step = 'name'; say('Great — what\'s your full name?'); }
        else { session.step = 'name'; say('No problem! To help anyway — what\'s your full name?'); }
        break;
      case 'name':
        session.lead.name = v; session.step = 'clinic';
        say('Thanks ' + v.split(' ')[0] + '! Which clinic is this for?');
        break;
      case 'clinic':
        session.lead.clinic = v; session.step = 'need';
        say('What do you need most?', ['New website', 'Redesign', 'More Google referrals']);
        break;
      case 'need':
        session.lead.need = v; session.step = 'phone';
        say('Last one — your cell + website URL (e.g. "7345550100, limbwise.com") so we can send the Loom audit in 24h.');
        break;
      case 'phone':
        session.lead.contact = v; session.step = 'done'; save();
        say('✅ Locked in, ' + (session.lead.name || 'there').split(' ')[0] + '! Your free audit is queued — check SMS/email in 24h.', []);
        setTimeout(function () { location.href = 'thank-you.html'; }, 2200);
        break;
      case 'phone_direct':
        session.lead.contact = v; session.lead.name = session.lead.name || v; session.step = 'done'; save();
        say('✅ Got it — Varad will text you today. (Saved ✓)', []);
        break;
      default:
        say('Happy to help! Want the free audit, pricing, or to talk to Varad?', ['Yes — free audit', 'Pricing', 'Talk to Varad']);
        session.step = 'start';
    }
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var v = input.value; input.value = '';
    handleUser(v);
  });

  // Auto-greet once per visit
  setTimeout(function () { if (session.messages.length === 0) start(); }, 2500);
})();
