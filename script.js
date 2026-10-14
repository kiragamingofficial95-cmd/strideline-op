// ===== Password gate (ask Varad) =====
const gate = document.getElementById('gate');
try {
  if (sessionStorage.getItem('site_unlocked') === '1' && gate) gate.classList.add('hide');
  else document.body.classList.add('lock');
} catch { document.body.classList.add('lock'); }
const gateForm = document.getElementById('gateForm');
if (gateForm) gateForm.addEventListener('submit', e => {
  e.preventDefault();
  const v = document.getElementById('gatePass').value;
  if (v === 'strideABC') {
    try { sessionStorage.setItem('site_unlocked', '1'); } catch {}
    gate.classList.add('hide');
    document.body.classList.remove('lock');
  } else {
    document.getElementById('gatePass').classList.add('err');
    document.getElementById('gateMsg').textContent = '✕ Wrong password — ask Varad for the correct one.';
  }
});

// Menu + close on link + header shadow
const btn = document.getElementById('menuBtn');
const nav = document.getElementById('nav');
if (btn) btn.addEventListener('click', () => nav.classList.toggle('open'));
if (nav) nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => nav.classList.remove('open')));
const header = document.getElementById('header');
addEventListener('scroll', () => header && header.classList.toggle('scrolled', scrollY > 8), { passive: true });

// Scroll reveal: add .reveal to sections/cards
const revealEls = document.querySelectorAll('.grid3 > *, .rev-grid > *, .pain-grid > *, .ba-grid > *, .process > *, .guarantee, .book-form, .about-grid > *');
revealEls.forEach((el, i) => el.classList.add('reveal', 'reveal-d' + (i % 3 + 1)));
const rio = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); }
}), { threshold: .12 });
document.querySelectorAll('.reveal').forEach(el => rio.observe(el));

// Portfolio filter
document.querySelectorAll('.chip').forEach(chip => {
  chip.addEventListener('click', () => {
    document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    const f = chip.dataset.f;
    document.querySelectorAll('#portfolioGrid .pf').forEach(card => {
      card.style.display = (f === 'all' || card.dataset.cat.includes(f)) ? '' : 'none';
    });
  });
});

// Counters
const counters = document.querySelectorAll('[data-count]');
const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target;
    const target = parseFloat(el.dataset.count);
    const isFloat = String(el.dataset.count).includes('.');
    let cur = 0;
    const step = target / 40;
    const t = setInterval(() => {
      cur += step;
      if (cur >= target) { cur = target; clearInterval(t); }
      el.textContent = isFloat ? cur.toFixed(1) : Math.round(cur);
    }, 30);
    io.unobserve(el);
  });
}, { threshold: .5 });
counters.forEach(c => io.observe(c));

// Frictionless fake submit (wire to your CRM/Calendly)
function handleForm(id, msgId, okText) {
  const form = document.getElementById(id);
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    document.getElementById(msgId).textContent = '✓ ' + okText;
    form.querySelectorAll('input').forEach(i => i.value = '');
  });
}
handleForm('bookForm', 'bookMsg', 'Locked in! Your free custom design is queued — check SMS/email in 48h.');

// ===== Frictionless modal popup + fast redirect =====
const modal = document.getElementById('auditModal');
const modalMain = document.getElementById('modalMain');
const modalSuccess = document.getElementById('modalSuccess');
const modalForm = document.getElementById('modalForm');
const modalMsg = document.getElementById('modalMsg');
const modalClose = document.getElementById('modalClose');
function openModal(e) {
  if (e) e.preventDefault();
  if (!modal) { location.hash = '#book'; return; }
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('lock');
  setTimeout(() => document.getElementById('mName')?.focus(), 60);
}
function closeModal() {
  if (!modal) return;
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('lock');
}
// Every "Book / Design" CTA opens popup instead of jumping
document.querySelectorAll('a[href="#book"]').forEach(a => a.addEventListener('click', openModal));
if (modalClose) modalClose.addEventListener('click', closeModal);
if (modal) modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
if (modalForm) modalForm.addEventListener('submit', e => {
  e.preventDefault();
  let ok = true;
  const get = id => document.getElementById(id);
  ['mName', 'mClinic', 'mSite', 'mPhone'].forEach(id => {
    const f = get(id);
    const bad = !f.value.trim() || (id === 'mSite' && !/^https?:\/\/.+\..+/.test(f.value.trim()));
    f.classList.toggle('err', bad);
    if (bad) ok = false;
  });
  if (!ok) { modalMsg.textContent = '⚠ Add name, clinic, valid https URL + cell — 10 sec.'; return; }
  const btn = document.getElementById('modalSubmit');
  btn.textContent = 'Locking in… ⏳'; btn.disabled = true;
  try { localStorage.setItem('op_lead', JSON.stringify({ n: get('mName').value, c: get('mClinic').value, s: get('mSite').value, p: get('mPhone').value, t: Date.now() })); } catch {}
  setTimeout(() => {
    modalMain.hidden = true; modalSuccess.hidden = false;
    setTimeout(() => { location.href = 'thank-you.html'; }, 1100);
  }, 700);
});
