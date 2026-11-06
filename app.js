'use strict';
// The page holds no data of its own: everything comes from database functions that check the personal link token.
const API = 'https://gzqhnklmkdyjpqjpnirz.supabase.co/rest/v1/rpc/';
const KEY = 'sb_publishable_yEykcrB3AuRlDmd_jiesKw_HKuqQm1h';
const STAFF_KEY = 'tzachi_staff';

const STATUS = { needs_help: 'צריך עזרה', unreachable: 'לא זמין', no_answer: 'לא ענה', away: 'מחוץ ליישוב', safe: 'בסדר' };
const STATUS_ORDER = ['needs_help', 'unreachable', 'no_answer', 'away', 'safe'];
const LOC = { kibbutz: 'ביישוב', miluim: 'מילואים', abroad: 'חו״ל', other: 'אחר' };
const SHEL = { protected_room: 'יש ממ״ד', going_to_shelter: 'הולך/ת למקלט', difficulty_reaching: 'מתקשה להגיע למקלט' };
const HELP = { none: 'לא צריך כלום', medical: 'רפואית', logistics: 'לוגיסטית', emotional: 'רגשית', other: 'אחר' };
const MOODS = [['😣', 'קשה מאוד'], ['😟', 'קשה'], ['😐', 'מתמודד/ת'], ['🙂', 'בסדר'], ['😄', 'טוב']];
const ROLES = { admin: 'מנהל', coordinator: 'רכז', shelter_manager: 'אחראי מקלט' };
const ERRORS = {
  not_authorized: 'הקישור לא תקף. בקשו קישור חדש מצוות צח״י.', no_open_round: 'אין כרגע סבב פעיל.',
  forbidden: 'אין הרשאה לפעולה הזו.', note_required: 'צריך לכתוב מה נעשה.', round_already_open: 'כבר יש סבב פתוח.',
  cannot_revoke_self: 'אי אפשר להסיר את עצמך.', bad_answer: 'אחת התשובות לא תקינה.', bad_form: 'הטופס לא תקין.',
  weak_password: 'הסיסמה קצרה מדי: לפחות 8 תווים.', password_taken: 'הסיסמה תפוסה, צריך לבחור אחרת.', too_many_attempts: 'יותר מדי ניסיונות. לנסות שוב בעוד רבע שעה.'
};

const ICON = {
  now: '<path d="M4 13a8 8 0 1 1 16 0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M12 13l4-5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><circle cx="12" cy="13" r="1.8" fill="currentColor"/><path d="M5 19h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
  map: '<path d="M3 6.5l6-2.5 6 2.5 6-2.5v13l-6 2.5-6-2.5-6 2.5z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M9 4v13M15 6.5v13" stroke="currentColor" stroke-width="2"/>',
  people: '<circle cx="9" cy="8" r="3.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M2.5 20c.6-3.6 3.3-5.5 6.5-5.5s5.9 1.9 6.5 5.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="17" cy="9" r="2.7" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M17.5 14.5c2.3.3 3.7 1.9 4 4.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
  rounds: '<circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 7.5V12l3 2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
  team: '<path d="M12 3l7 3v5c0 4.6-3 8.3-7 10-4-1.7-7-5.4-7-10V6z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M9 12l2 2 4-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
  phone: '<path d="M6.6 3.5l3 .5 1.2 4-2 1.6a12 12 0 0 0 5.6 5.6l1.6-2 4 1.2.5 3c-.2 1.3-1.3 2.3-2.6 2.3A15.9 15.9 0 0 1 4.3 6.1C4.3 4.8 5.3 3.7 6.6 3.5z" fill="currentColor"/>',
  chat: '<path d="M4 5h16v11H9l-5 4z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>',
  help: '<path d="M12 21s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 8a4.3 4.3 0 0 1 7.5 2.8C19.5 16.4 12 21 12 21z" fill="currentColor"/>',
  away: '<path d="M2.5 13.5l19-7-7 19-2.5-9z" fill="currentColor"/>',
  moon: '<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" fill="currentColor"/>',
  dots: '<circle cx="5" cy="12" r="2" fill="currentColor"/><circle cx="12" cy="12" r="2" fill="currentColor"/><circle cx="19" cy="12" r="2" fill="currentColor"/>',
  search: '<circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="M15.5 15.5L21 21" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>',
  chev: '<path d="M8 2L2 8l6 6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>'
};
const svg = (name, cls = '') => `<svg viewBox="0 0 24 24" aria-hidden="true" class="${cls}">${ICON[name]}</svg>`;
const chev = '<svg class="chev" viewBox="0 0 10 16" aria-hidden="true">' + ICON.chev + '</svg>';
const STAT_ICON = { needs_help: 'help', unreachable: 'moon', no_answer: 'dots', away: 'away', safe: 'check' };
const STAT_COLOR = { needs_help: 'var(--red)', unreachable: 'var(--indigo)', no_answer: 'var(--orange)', away: 'var(--teal)', safe: 'var(--green)' };

const $app = document.getElementById('app');
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fullName = p => `${p.first_name} ${p.last_name || ''}`.trim();
const initials = p => (p.first_name?.[0] || '') + (p.last_name?.[0] || '');
const time = iso => iso ? new Date(iso).toLocaleString('he-IL', { day: 'numeric', month: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';
const badge = s => s ? `<span class="badge b-${s}">${STATUS[s]}</span>` : '';
const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---------- motion: interruptible springs (Apple's damping + response model) ----------
// Each spring starts from the live value and carries its current velocity into any new target.
function spring({ from, to, velocity = 0, damping = 1, response = 0.35, onUpdate, onDone }) {
  if (reduced()) { onUpdate(to); onDone && onDone(); return { stop() {}, get value() { return to; }, get velocity() { return 0; } }; }
  const k = (2 * Math.PI / response) ** 2, c = 4 * Math.PI * damping / response;
  let x = from, v = velocity, last = performance.now(), raf, stopped = false;
  const tick = now => {
    let dt = Math.min(0.064, (now - last) / 1000); last = now;
    while (dt > 0) { const h = Math.min(dt, 1 / 240); v += (-k * (x - to) - c * v) * h; x += v * h; dt -= h; }
    if (Math.abs(v) < 0.5 && Math.abs(x - to) < 0.3) { x = to; onUpdate(x); stopped = true; onDone && onDone(); return; }
    onUpdate(x); raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);
  return { stop() { stopped = true; cancelAnimationFrame(raf); }, get value() { return x; }, get velocity() { return stopped ? 0 : v; } };
}
const project = (v, d = 0.998) => (v / 1000) * d / (1 - d);
const rubber = (over, dim, c = 0.55) => (over * dim * c) / (dim + c * Math.abs(over));

// Press feedback lands on pointer-down, not on release.
document.addEventListener('pointerdown', e => {
  const el = e.target.closest('.btn, .cell, .tile, .stat, .choice, .cta, .quick > *');
  if (!el || el.disabled) return;
  el.classList.add('down');
  const up = () => { el.classList.remove('down'); removeEventListener('pointerup', up); removeEventListener('pointercancel', up); };
  addEventListener('pointerup', up); addEventListener('pointercancel', up);
}, { passive: true });

let toastAnim, toastTimer;
function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  const set = y => t.style.transform = `translate(-50%, ${y}%)`;
  toastAnim?.stop(); clearTimeout(toastTimer);
  toastAnim = spring({ from: toastAnim ? toastAnim.value : -220, to: 0, damping: 0.8, response: 0.4, onUpdate: set });
  toastTimer = setTimeout(() => { toastAnim = spring({ from: toastAnim.value, to: -220, response: 0.35, onUpdate: set }); }, 2600);
}

async function rpc(fn, args = {}) {
  const res = await fetch(API + fn, { method: 'POST', headers: { apikey: KEY, Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' }, body: JSON.stringify(args) });
  const text = await res.text();
  if (!res.ok) {
    let msg = 'משהו השתבש. נסו שוב.';
    try { msg = ERRORS[JSON.parse(text).message] || msg; } catch (_) { /* keep generic */ }
    throw new Error(msg);
  }
  return text ? JSON.parse(text) : null;
}

function waLink(phone, text) {
  const d = String(phone || '').replace(/\D/g, ''), intl = d.startsWith('0') ? '972' + d.slice(1) : d;
  return `https://wa.me/${intl}?text=${encodeURIComponent(text)}`;
}
const linkFor = (kind, tok) => `${location.origin}${location.pathname}#${kind}=${tok}`;

// ---------- sheets: drag to dismiss with momentum, interruptible open/close ----------
const sheets = [];
let afterSheets = null; // redraw deferred while a sheet is open, run when the last one closes
function openSheet({ title, html, left, right, onMount }) {
  const scrim = document.createElement('div'); scrim.className = 'scrim';
  const el = document.createElement('section');
  el.className = 'sheet'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true'); el.setAttribute('aria-label', title || '');
  el.innerHTML = `<div class="grab" aria-hidden="true"><i></i></div>
    <div class="bar">${left ? `<button class="link" data-left>${left}</button>` : right ? '<button class="link" data-close>ביטול</button>' : '<span style="min-width:64px"></span>'}<h2>${esc(title || '')}</h2>
    ${right ? `<button class="link strong" data-right>${right}</button>` : '<button class="link" data-close>סגירה</button>'}</div><div class="body">${html}</div>`;
  document.body.append(scrim, el);
  const desktop = matchMedia('(min-width: 900px)').matches;
  const h = () => el.offsetHeight + 40;
  let y = desktop ? 0 : h(), anim, closing = false;
  const paint = v => {
    y = v;
    if (desktop) { const p = 1 - Math.min(1, Math.max(0, v)); el.style.opacity = p; el.style.transform = `scale(${0.94 + 0.06 * p})`; scrim.style.opacity = p; }
    else { el.style.transform = `translateY(${Math.max(v, 0) + (v < 0 ? rubber(v, h()) - v : 0)}px)`; scrim.style.opacity = Math.max(0, 1 - v / h()); }
  };
  const settle = (to, velocity = 0, damping = 0.86) => { anim?.stop(); anim = spring({ from: y, to, velocity, damping, response: desktop ? 0.3 : 0.38, onUpdate: paint, onDone: () => to !== 0 && remove() }); };
  const remove = () => { el.remove(); scrim.remove(); sheets.splice(sheets.indexOf(api), 1); api.onClose?.();
    if (!sheets.length && afterSheets) { const f = afterSheets; afterSheets = null; f(); } };
  const close = (velocity = 0) => { if (closing) return; closing = true; settle(desktop ? 1 : h(), velocity, 1); };
  paint(desktop ? 1 : h()); settle(0, 0, desktop ? 1 : 0.86);

  if (!desktop) {
    let start = null, hist = [];
    const body = el.querySelector('.body');
    el.addEventListener('pointerdown', e => {
      if (e.target.closest('input, select, textarea, button, a')) return;
      if (body.contains(e.target) && body.scrollTop > 0) return;
      anim?.stop(); closing = false;
      start = { py: e.clientY, y }; hist = [{ y: e.clientY, t: e.timeStamp }];
      el.setPointerCapture(e.pointerId);
    });
    el.addEventListener('pointermove', e => {
      if (!start) return;
      paint(start.y + e.clientY - start.py);
      hist.push({ y: e.clientY, t: e.timeStamp }); if (hist.length > 6) hist.shift();
    });
    const end = () => {
      if (!start) return; start = null;
      const a = hist[0], b = hist[hist.length - 1]; const v = b && a && b.t > a.t ? (b.y - a.y) / ((b.t - a.t) / 1000) : 0;
      if (y + project(v) > h() * 0.45) close(v); else settle(0, v);
    };
    el.addEventListener('pointerup', end); el.addEventListener('pointercancel', end);
  }
  scrim.onclick = () => close();
  const api = { el, close, onClose: null, set body(html) { el.querySelector('.body').innerHTML = html; } };
  el.querySelector('[data-close]')?.addEventListener('click', () => close());
  sheets.push(api);
  onMount?.(api);
  setTimeout(() => (el.querySelector('.body textarea') || el.querySelector('.body button, .body a, .body input, [data-close]'))?.focus({ preventScroll: true }), 50);
  return api;
}
addEventListener('keydown', e => { if (e.key === 'Escape' && sheets.length) sheets[sheets.length - 1].close(); });

// Promise-based replacements for prompt()/confirm(), shown as sheets.
function ask({ title, label, confirmText = 'שמירה', danger, input = true, placeholder = '', required = false }) {
  return new Promise(resolve => {
    let done = false;
    const s = openSheet({ title, right: confirmText,
      html: `${label ? `<p class="muted" style="margin:6px 4px 12px">${esc(label)}</p>` : ''}
        ${input ? `<textarea class="field" id="ask" placeholder="${esc(placeholder)}" maxlength="1000"></textarea>` : ''}
        ${danger ? `<button class="btn block fill danger" style="margin-top:12px" data-ok>${esc(confirmText)}</button>` : ''}`,
      onMount(api) {
        const ok = () => {
          if (required && !api.el.querySelector('#ask').value.trim()) { toast('צריך לכתוב כאן משהו'); api.el.querySelector('#ask').focus(); return; }
          done = true; resolve(input ? api.el.querySelector('#ask').value : true); api.close(); };
        api.el.querySelector('[data-right]').onclick = ok;
        api.el.querySelector('[data-ok]')?.addEventListener('click', ok);
        api.onClose = () => { if (!done) resolve(null); };
      } });
    return s;
  });
}

// Segmented control whose thumb slides with a spring.
function segmented(container, options, value, onChange) {
  container.innerHTML = `<div class="thumb"></div>${options.map(([k, v]) => `<button type="button" data-k="${k}" aria-pressed="${k === value}">${v}</button>`).join('')}`;
  const thumb = container.querySelector('.thumb');
  let anim, x = null;
  const place = (key, animate) => {
    const b = container.querySelector(`[data-k="${key}"]`); const r = b.getBoundingClientRect(), pr = container.getBoundingClientRect();
    const target = r.left - pr.left; thumb.style.width = r.width + 'px';
    if (x === null || !animate) { x = target; thumb.style.transform = `translateX(${x}px)`; return; }
    anim?.stop(); anim = spring({ from: x, to: target, velocity: anim?.velocity || 0, response: 0.3, onUpdate: v => { x = v; thumb.style.transform = `translateX(${v}px)`; } });
  };
  requestAnimationFrame(() => place(value, false));
  container.querySelectorAll('button').forEach(b => b.onclick = () => {
    container.querySelectorAll('button').forEach(o => o.setAttribute('aria-pressed', o === b)); place(b.dataset.k, true); onChange(b.dataset.k);
  });
}

// ---------- Resident ----------

const DEFAULT_FORM = { builtins: { location: true, shelter: true, household: true, wellbeing: true, help: true }, questions: [] };

// preview: staff see the exact resident form with their current settings; nothing is sent.
function residentView(tok, preview) {
  let data, ans = {}, editing = false, forHousehold = true, sending = false, failed = '';
  $app.className = 'resident';

  async function load() {
    if (preview) data = { first_name: 'ישראל', household: ['שרה'], round: { id: 'p', title: 'תצוגה מקדימה' }, answer: null, form: preview };
    else {
      try { data = await rpc('resident_get', { p_token: tok }); }
      catch (e) { $app.innerHTML = `<div class="done"><h1>צח״י שניר</h1><p class="sub">${esc(e.message)}</p></div>`; return; }
    }
    ans = data.answer ? { ...data.answer, extra: { ...(data.answer.extra || {}) } } : { extra: {} };
    editing = !data.answer;
    render();
  }
  const form = () => ({ ...DEFAULT_FORM, ...(data.form || {}), builtins: { ...DEFAULT_FORM.builtins, ...(data.form?.builtins || {}) } });
  const choice = (field, value, label, cls = '') => `<button type="button" class="choice ${cls}" data-f="${field}" data-v="${esc(value)}" aria-pressed="${String(field.startsWith('x:') ? ans.extra[field.slice(2)] : ans[field]) === String(value)}">${label}</button>`;
  const needsHelp = a => a && ((a.help_type && a.help_type !== 'none') || a.shelter_status === 'difficulty_reaching');

  function render(focusKey) {
    const hh = data.household || [], f = form(), b = f.builtins;
    if (!data.round) { $app.innerHTML = `<h1>שלום ${esc(data.first_name)}</h1><p class="sub">אין כרגע סבב פעיל. כשייפתח סבב, אותו קישור יעבוד.</p>`; return; }
    if (!editing) {
      const urgent = needsHelp(data.answer);
      $app.innerHTML = `<div class="done page"><div class="mark"><svg viewBox="0 0 24 24">${ICON.check}</svg></div>
        <h1 tabindex="-1" id="thanks">תודה ${esc(data.first_name)}</h1>
        <p class="sub">${urgent ? 'קיבלנו. צוות צח״י יחזור אליכם בהקדם.' : 'העדכון התקבל. יחד נעבור את זה.'}</p>
        <button class="btn" id="edit">עדכון התשובה</button></div>`;
      document.getElementById('edit').onclick = () => { editing = true; render(); };
      document.getElementById('thanks').focus();
      return;
    }
    const inKibbutz = !b.location || ans.location === 'kibbutz';
    const q = (id, text) => `<div class="q" id="${id}">${text}</div>`;
    $app.innerHTML = `<div class="page">
      ${preview ? '<p class="preview-tag">תצוגה מקדימה · שום דבר לא נשלח</p>' : ''}
      <h1>שלום ${esc(data.first_name)}</h1><p class="sub">${esc(data.round.title)}</p>
      ${(f.questions || []).some(x => x.required) ? '' : `<button class="cta" id="quick">${hh.length && forHousehold ? 'כולנו בסדר, בבית עם ממ״ד' : 'אני בסדר, בבית עם ממ״ד'}</button>
      <p class="or">או לעדכן בפירוט</p>`}
      <form id="f" novalidate>
        ${b.location ? `${q('l-loc', 'איפה את/ה עכשיו?')}
          <div class="choices two" role="group" aria-labelledby="l-loc">${Object.entries(LOC).map(([k, v]) => choice('location', k, v)).join('')}</div>
          ${ans.location === 'other' ? `<label class="q" for="loc_other">איפה?</label><input class="field" id="loc_other" value="${esc(ans.location_other)}" maxlength="200">` : ''}` : ''}
        ${inKibbutz && b.shelter ? `${q('l-sh', 'מיגון')}
          <div class="choices" role="group" aria-labelledby="l-sh">${Object.entries(SHEL).map(([k, v]) => choice('shelter_status', k, v, k === 'difficulty_reaching' ? 'urgent' : '')).join('')}</div>` : ''}
        ${inKibbutz && b.household ? `<label class="q" for="hc">כמה נפשות בבית עכשיו, כולל אורחים</label>
          <input class="field" id="hc" type="number" inputmode="numeric" min="0" max="40" step="1" value="${esc(ans.household_count)}">` : ''}
        ${b.wellbeing ? `${q('l-mood', 'איך את/ה מרגיש/ה?')}
          <div class="choices five" role="group" aria-labelledby="l-mood">${MOODS.map(([e, l], i) => choice('wellbeing', i + 1, `<span class="emo" aria-hidden="true">${e}</span><small>${l}</small>`)).join('')}</div>` : ''}
        ${b.help ? `${q('l-help', 'צריכים משהו?')}
          <div class="choices two" role="group" aria-labelledby="l-help">${Object.entries(HELP).map(([k, v]) => choice('help_type', k, v, k === 'none' ? '' : 'urgent')).join('')}</div>
          ${ans.help_type && ans.help_type !== 'none' ? `<label class="q" for="hn">במה נוכל לעזור?</label><textarea class="field" id="hn" maxlength="1000">${esc(ans.help_note)}</textarea>` : ''}` : ''}
        ${(f.questions || []).map((x, i) => {
          const id = 'xq' + i, lab = esc(x.label) + (x.required ? ' <span aria-hidden="true">*</span>' : '');
          if (x.type === 'text') return `<label class="q" for="${id}">${lab}</label><input class="field" id="${id}" data-x="${esc(x.id)}" maxlength="300" value="${esc(ans.extra[x.id])}">`;
          const opts = x.type === 'yesno' ? ['כן', 'לא'] : (x.options || []);
          return `${q(id, lab)}<div class="choices ${opts.length === 2 ? 'two' : ''}" role="group" aria-labelledby="${id}">${opts.map(o => choice('x:' + x.id, o, esc(o))).join('')}</div>`;
        }).join('')}
        ${hh.length ? `<label class="check-cell"><input type="checkbox" id="fh" ${forHousehold ? 'checked' : ''}><span>לעדכן גם עבור ${esc(hh.join(', '))}<small>מיקום ומיגון בלבד. בקשת עזרה נשלחת רק בשמך.</small></span></label>` : ''}
        <p class="err" id="ferr" role="alert">${esc(failed)}</p>
        <button class="btn fill block" type="submit" ${sending ? 'disabled' : ''}>${sending ? 'שולח…' : 'שליחה'}</button>
        ${data.answer ? '<button type="button" class="btn block" id="cancel" style="margin-top:10px">ביטול</button>' : ''}
      </form></div>`;
    $app.querySelectorAll('.choice').forEach(btn => btn.onclick = () => {
      keepInputs();
      const fld = btn.dataset.f, v = fld === 'wellbeing' ? Number(btn.dataset.v) : btn.dataset.v;
      if (fld.startsWith('x:')) ans.extra[fld.slice(2)] = v; else ans[fld] = v;
      failed = '';
      const y = scrollY; render(fld + '|' + btn.dataset.v); $app.querySelector('.page').style.animation = 'none'; scrollTo(0, y);
    });
    // Keep keyboard focus on the choice that was just pressed.
    if (focusKey) { const [fld, v] = focusKey.split('|'); [...$app.querySelectorAll('.choice')].find(x => x.dataset.f === fld && x.dataset.v === v)?.focus({ preventScroll: true }); }
    document.getElementById('fh')?.addEventListener('change', e => { keepInputs(); render(); });
    document.getElementById('cancel')?.addEventListener('click', () => { editing = false; failed = ''; ans = { ...data.answer, extra: { ...(data.answer.extra || {}) } }; render(); });
    const quick = document.getElementById('quick'); if (quick) quick.onclick = () => send({ location: 'kibbutz', shelter_status: 'protected_room', help_type: 'none' });
    document.getElementById('f').onsubmit = e => {
      e.preventDefault(); keepInputs();
      const missing = [];
      if (b.location && !ans.location) missing.push(['l-loc', 'איפה את/ה']);
      if (b.location && ans.location === 'other' && !(ans.location_other || '').trim()) missing.push(['loc_other', 'איפה בדיוק']);
      if (inKibbutz && b.shelter && !ans.shelter_status) missing.push(['l-sh', 'מיגון']);
      if (b.help && !ans.help_type) missing.push(['l-help', 'אם צריך משהו']);
      (f.questions || []).forEach((x, i) => { if (x.required && !String(ans.extra[x.id] ?? '').trim()) missing.push(['xq' + i, x.label]); });
      if (missing.length) {
        failed = 'חסר: ' + missing.map(m => m[1]).join(', ');
        document.getElementById('ferr').textContent = failed;
        document.getElementById(missing[0][0])?.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'center' });
        return;
      }
      send(ans);
    };
  }
  function keepInputs() {
    const v = id => document.getElementById(id);
    if (v('loc_other')) ans.location_other = v('loc_other').value;
    if (v('hc')) { const n = parseInt(v('hc').value, 10); ans.household_count = Number.isFinite(n) && n >= 0 && n <= 40 ? n : null; }
    if (v('hn')) ans.help_note = v('hn').value;
    if (v('fh')) forHousehold = v('fh').checked;
    $app.querySelectorAll('[data-x]').forEach(i => { ans.extra[i.dataset.x] = i.value; });
  }
  async function send(payload) {
    if (sending) return;
    const allowed = ['location', 'location_other', 'shelter_status', 'household_count', 'wellbeing', 'help_type', 'help_note', 'extra'];
    const p = Object.fromEntries(Object.entries(payload).filter(([k, v]) => allowed.includes(k) && v !== null && v !== undefined && v !== ''));
    p.for_household = forHousehold && (data.household || []).length > 0;
    if (p.location && p.location !== 'kibbutz') { delete p.shelter_status; delete p.household_count; }
    if (p.help_type === 'none') delete p.help_note;
    if (preview) { toast('תצוגה מקדימה: התשובה לא נשלחה'); return; }
    sending = true; failed = ''; render();
    try { await rpc('resident_submit', { p_token: tok, p }); sending = false; await load(); }
    catch (e) { sending = false; failed = e.message + ' התשובה לא נשלחה, אפשר לנסות שוב.'; render(); document.getElementById('ferr')?.scrollIntoView({ block: 'center' }); }
  }
  load();
}

// ---------- Staff ----------

function staffView(tok) {
  const st = { d: null, tab: 'now', filter: null, q: '', mapMode: 'shelter' };
  const can = () => st.d.me.role !== 'shelter_manager';
  const byId = id => st.d.people.find(p => p.id === id);
  const shelterName = id => st.d.shelters.find(s => s.id === id)?.name || 'ללא שיבוץ';
  const TABS = () => [['now', 'מצב', 'now'], ['map', 'מפה', 'map'], ['people', 'תושבים', 'people'],
    ...(can() ? [['rounds', 'סבבים', 'rounds']] : []), ...(st.d.me.role === 'admin' ? [['team', 'צוות', 'team']] : [])];
  const TITLES = { now: 'מצב נוכחי', map: 'מפת היישוב', people: 'תושבים', rounds: 'סבבים', team: 'צוות' };

  async function load(quiet) {
    try { st.d = await rpc('staff_dashboard', { p_token: tok }); }
    catch (e) {
      if (!quiet) $app.innerHTML = `<div class="resident"><div class="done"><h1>צח״י שניר</h1><p class="err">${esc(e.message)}</p></div></div>`;
      if (e.message === ERRORS.not_authorized) { try { localStorage.removeItem(STAFF_KEY); } catch (_) { /* storage blocked */ } }
      return false;
    }
    if (!document.querySelector('.shell')) shell(); else if (!sheets.length) page(false); else afterSheets = () => page(false);
    return true;
  }
  // Skip while a sheet is open or the user is typing (a redraw would steal focus from the search box).
  setInterval(() => { if (document.visibilityState === 'visible' && !sheets.length && !document.activeElement?.matches('input, textarea, select')) load(true); }, 20000);

  function shell() {
    $app.className = '';
    $app.innerHTML = `<div class="shell"><nav class="tabbar" aria-label="ניווט"></nav>
      <div><div class="nav-bar" aria-hidden="true"></div><div class="content" id="content"></div></div></div><div class="print-only" id="print"></div>`;
    page(true);
  }

  function page(animate) {
    const nav = $app.querySelector('.tabbar');
    nav.innerHTML = `<span class="brand">צח״י שניר</span>` + TABS().map(([k, l, i]) => `<button data-t="${k}" ${st.tab === k ? 'aria-current="page"' : ''}>${svg(i)}<span>${l}</span></button>`).join('');
    nav.querySelectorAll('[data-t]').forEach(b => b.onclick = () => { if (st.tab !== b.dataset.t) { st.tab = b.dataset.t; scrollTo(0, 0); page(true); } });
    const c = document.getElementById('content');
    const y = scrollY;
    c.innerHTML = `<div class="${animate ? 'page' : ''}"><div class="large-title"><h1 id="lt">${TITLES[st.tab]}</h1><button class="me link" id="acct">${esc(st.d.me.name)} · ${ROLES[st.d.me.role]}</button></div><div id="tab"></div></div>`;
    $app.querySelector('.nav-bar').textContent = TITLES[st.tab];
    document.getElementById('acct').onclick = account;
    ({ now: viewNow, map: viewMap, people: viewPeople, rounds: viewRounds, team: viewTeam })[st.tab](animate);
    if (!animate) scrollTo(0, y);
    watchTitle();
  }

  // Small centered title appears in the translucent bar once the large title scrolls away.
  let io;
  function watchTitle() {
    io?.disconnect();
    const bar = $app.querySelector('.nav-bar'), lt = document.getElementById('lt');
    io = new IntersectionObserver(([e]) => bar.classList.toggle('on', !e.isIntersecting), { rootMargin: '-44px 0px 0px 0px' });
    io.observe(lt);
  }

  async function act(fn, ok) { try { const r = await fn(); if (ok) toast(ok); await load(true); return r ?? true; } catch (e) { toast(e.message); return null; } }

  const counts = list => { const c = Object.fromEntries(STATUS_ORDER.map(s => [s, 0])); list.forEach(p => { if (p.status) c[p.status]++; }); return c; };

  const personCell = (p, i = 0) => `<button class="cell" data-p="${p.id}" style="--i:${Math.min(i, 14)}">
      <span class="avatar ${p.status ? 'av-' + p.status : ''}" aria-hidden="true">${esc(initials(p))}</span>
      <span class="grow"><span class="t">${esc(fullName(p))}</span><span class="s" style="display:block">${p.answer?.help_note ? esc(p.answer.help_note) + ' · ' : ''}${esc(shelterName(p.shelter_id))}${p.answer?.reported_by ? ' · דיווח: ' + esc(p.answer.reported_by) : ''}</span></span>
      ${badge(p.status)}${chev}</button>`;
  const bindPeople = el => el.querySelectorAll('[data-p]').forEach(b => b.onclick = () => openPerson(b.dataset.p));

  function ring(done, total) {
    const r = 34, len = 2 * Math.PI * r, off = len * (1 - (total ? done / total : 0));
    return `<div class="ring" role="img" aria-label="${done} מתוך ${total} ענו"><svg viewBox="0 0 84 84"><circle class="track" cx="42" cy="42" r="${r}" fill="none" stroke-width="9"/>
      <circle class="bar" cx="42" cy="42" r="${r}" fill="none" stroke-width="9" stroke-dasharray="${len}" stroke-dashoffset="${len}" data-off="${off}"/></svg>
      <div class="num"><div><b>${total ? Math.round(done / total * 100) : 0}%</b><br><span>${done}/${total}</span></div></div></div>`;
  }
  const animateRings = el => requestAnimationFrame(() => requestAnimationFrame(() => el.querySelectorAll('.ring .bar').forEach(b => b.style.strokeDashoffset = b.dataset.off)));

  // ---- מצב ----
  function viewNow(animate) {
    const el = document.getElementById('tab'), d = st.d, r = d.round, P = d.people;
    const c = counts(P), answered = P.length - c.no_answer, stag = animate ? 'stagger' : '';
    const kind = p => (r && p.answer?.shelter_status) || (p.has_mamad === true ? 'protected_room' : p.has_mamad === false ? 'going_to_shelter' : 'none');
    // Everything that needs a human, worst first; registry gaps matter even with no round open.
    const issues = [
      r && ['difficulty_reaching', 'מתקשים להגיע למקלט', 'red', P.filter(p => p.answer?.shelter_status === 'difficulty_reaching')],
      r && ['low_mood', 'מרגישים קשה', 'orange', P.filter(p => p.answer?.wellbeing && p.answer.wellbeing <= 2)],
      ['no_shelter', 'בלי שיבוץ למקלט', 'gray', P.filter(p => !p.shelter_id)],
      ['no_phone', 'בלי טלפון', 'gray', P.filter(p => !p.phone)],
      ['no_link', 'בלי קישור אישי', 'gray', P.filter(p => !p.has_link)],
      ['mamad_unknown', 'ממ״ד לא ידוע', 'gray', P.filter(p => p.has_mamad == null)],
    ].filter(x => x && x[3].length);
    const bars = (rows, total) => rows.map(([label, n, color]) => `<div class="mb"><span>${label}</span><i><b style="width:${total ? Math.round(n / total * 100) : 0}%;background:var(--${color})"></b></i><em>${n}</em></div>`).join('');
    const queue = P.filter(p => st.filter ? p.status === st.filter : ['needs_help', 'unreachable'].includes(p.status))
      .sort((a, b) => STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status))
      .filter(p => st.filter || !d.cases.some(cs => cs.person_id === p.id)); // a help card already shows them
    const sh = d.shelters.filter(x => x.kind === 'shelter').map(x => { const ppl = P.filter(p => p.shelter_id === x.id), k = counts(ppl); return { x, ppl, k, alert: k.needs_help + k.unreachable }; })
      .sort((a, b) => b.alert - a.alert || (r ? b.k.no_answer - a.k.no_answer : 0));
    const locs = r ? Object.entries(LOC).map(([k, v]) => [v, P.filter(p => p.answer?.location === k).length, k === 'kibbutz' ? 'green' : 'teal']) : [];
    const moods = r ? [5, 4, 3, 2, 1].map(w => [['', 'קשה מאוד', 'קשה', 'מתמודד/ת', 'בסדר', 'טוב'][w], P.filter(p => p.answer?.wellbeing === w).length, w <= 2 ? 'orange' : w === 3 ? 'gray' : 'green']) : [];
    const answeredMood = moods.reduce((t, m) => t + m[1], 0);

    let html = `<div class="dash ${stag} ${r ? '' : 'idle'}">
      <section class="panel p-round" style="--i:0">${r ? ring(answered, P.length) : ''}<div class="grow">
        ${r ? `<h2><span class="live" aria-hidden="true"></span>${esc(r.title)}</h2><div class="muted">נפתח ${esc(time(r.opened_at))}</div>`
            : `<h2>אין סבב פעיל</h2><div class="muted">${P.length} תושבים · ${d.shelters.length} מקלטים ושכונות</div>`}</div>
        ${can() ? `<div class="row-actions">${r ? `<button class="btn sm fill" id="sendall">שליחת קישורים</button><button class="btn sm danger" id="close">סגירת הסבב</button>`
            : `<button class="btn fill" id="openr">פתיחת סבב</button>`}</div>` : ''}</section>
      ${r ? `<section class="p-kpis" style="--i:1">${STATUS_ORDER.map(k => `<button class="stat${c[k] ? '' : ' zero'}" data-s="${k}" aria-pressed="${st.filter === k}">
          <span class="dot" style="background:${STAT_COLOR[k]}">${svg(STAT_ICON[k])}</span><b>${c[k]}</b><span>${STATUS[k]}</span></button>`).join('')}</section>`
        : `<section class="p-kpis idle" style="--i:1">${[['תושבים', P.length], ['יש ממ״ד', P.filter(p => p.has_mamad === true).length], ['משובצים למקלט', P.filter(p => p.shelter_id).length], ['עם קישור', P.filter(p => p.has_link).length]]
          .map(([l, n]) => `<div class="stat"><b>${n}</b><span>${l}</span></div>`).join('')}</section>`}

      <section class="panel p-issues" style="--i:2"><h3>בעיות לטיפול</h3>
        <div class="issues">${issues.map(([k, l, col, ppl]) => `<button class="issue" data-issue="${k}"><i style="background:var(--${col})"></i><span>${l}</span><b>${ppl.length}</b>${chev}</button>`).join('') || '<div class="empty">אין בעיות פתוחות</div>'}</div>
</section>

      <section class="panel p-queue" style="--i:3"><h3>${st.filter ? STATUS[st.filter] : 'דורשים טיפול עכשיו'} · ${queue.length + (st.filter ? 0 : d.cases.length)}</h3><div class="scroll">
        ${st.filter ? '' : d.cases.map(cs => { const p = byId(cs.person_id); return `<div class="case">
          <div class="top" data-p="${cs.person_id}" role="button" tabindex="0"><span class="avatar av-needs_help" aria-hidden="true">${esc(p ? initials(p) : '')}</span>
            <span class="grow"><b>${esc(p ? fullName(p) : '')}</b><span class="muted">עזרה ${HELP[cs.help_type]} · ${esc(time(cs.opened_at))}</span></span>
            ${cs.status === 'assigned' ? `<span class="badge b-away">${esc(cs.assigned_to)}</span>` : '<span class="badge b-needs_help">חדש</span>'}</div>
          ${cs.note ? `<p>${esc(cs.note)}</p>` : ''}
          <div class="row-actions">${cs.status === 'open' ? `<button class="btn sm" data-assign="${cs.id}">אני מטפל/ת</button>` : ''}
            <button class="btn sm fill" data-resolve="${cs.id}">סיום טיפול</button>${p?.phone ? `<a class="btn sm call" href="tel:${esc(p.phone)}" aria-label="התקשרות ל${esc(fullName(p))}">${svg('phone')}</a>` : ''}</div></div>`; }).join('')}
        ${queue.length ? `<div class="group">${queue.map(personCell).join('')}</div>` : (st.filter || d.cases.length ? '' : `<div class="empty calm">${r ? 'אין כרגע מי שצריך טיפול' : 'כשייפתח סבב, כאן יופיעו מי שצריכים טיפול'}</div>`)}</div></section>

      <section class="panel p-shelters" style="--i:4"><h3>מקלטים · ${sh.length}</h3><div class="scroll">
        ${sh.map(({ x, ppl, k, alert }) => `<button class="srow" data-sh="${esc(x.id)}" aria-label="${esc(x.name)}, ${r ? `${ppl.length - k.no_answer} מתוך ${ppl.length} ענו, ${alert} דורשים טיפול` : `${ppl.length} תושבים`}"><span class="grow"><span class="t">${esc(x.name)}</span>
            <span class="bar-stack">${r ? ['safe', 'away', 'no_answer', 'unreachable', 'needs_help'].map(s2 => k[s2] ? `<i class="i-${s2}" style="flex-grow:${k[s2]}"></i>` : '').join('') : `<i style="flex-grow:1;background:var(--fill-2)"></i>`}</span></span>
          <span class="n">${r ? `${ppl.length - k.no_answer}<small>/${ppl.length}</small>` : ppl.length}</span>${alert ? `<span class="alert" title="דורשים טיפול">${alert}</span>` : '<span class="alert" aria-hidden="true" style="visibility:hidden"></span>'}</button>`).join('')}</div>
        <h3>מיגון</h3>${bars([['יש ממ״ד', P.filter(p => kind(p) === 'protected_room').length, 'green'], ['אין ממ״ד', P.filter(p => kind(p) === 'going_to_shelter').length, 'gray'],
          ...(r ? [['מתקשים להגיע', P.filter(p => kind(p) === 'difficulty_reaching').length, 'red']] : []), ['לא ידוע', P.filter(p => kind(p) === 'none').length, 'fill-2']], P.length)}
        ${r ? `<details class="more" ${matchMedia('(min-width: 900px)').matches ? 'open' : ''}><summary>איפה התושבים ואיך מרגישים</summary>
          <h3>איפה התושבים</h3>${bars(locs, answered)}<h3>איך מרגישים</h3>${bars(moods, answeredMood)}</details>` : ''}</section>
    </div>`;
    el.innerHTML = html;
    animateRings(el); bindPeople(el);
    el.querySelectorAll('button.stat').forEach(b => b.onclick = () => { st.filter = st.filter === b.dataset.s ? null : b.dataset.s; page(false); });
    el.querySelectorAll('.case .top').forEach(t => t.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); t.click(); } });
    el.querySelectorAll('[data-issue]').forEach(b => b.onclick = () => { const x = issues.find(i => i[0] === b.dataset.issue); openGroup(x[1], x[3]); });
    el.querySelectorAll('[data-sh]').forEach(b => b.onclick = () => { const x = sh.find(i => i.x.id === b.dataset.sh); openGroup(x.x.name, x.ppl, x.x.id); });
    el.querySelectorAll('[data-assign]').forEach(b => b.onclick = () => act(() => rpc('staff_case_update', { p_token: tok, p_case: b.dataset.assign, p_status: 'assigned', p_note: null }), 'סומן שאת/ה מטפל/ת'));
    el.querySelectorAll('[data-resolve]').forEach(b => b.onclick = async () => {
      const note = await ask({ title: 'סגירת בקשה', label: 'מה נעשה?', confirmText: 'סיום טיפול', required: true }); if (note === null) return;
      act(() => rpc('staff_case_update', { p_token: tok, p_case: b.dataset.resolve, p_status: 'resolved', p_note: note }), 'הבקשה נסגרה');
    });
    const on = (id, fn) => { const x = document.getElementById(id); if (x) x.onclick = fn; };
    on('openr', async () => { const t = await ask({ title: 'סבב חדש', label: 'שם לסבב, או להשאיר ריק', confirmText: 'פתיחה', placeholder: 'למשל: סבב בוקר' }); if (t === null) return; act(() => rpc('staff_round_open', { p_token: tok, p_title: t }), 'הסבב נפתח'); });
    on('close', async () => { if (await ask({ title: 'סגירת הסבב', label: `הכל יתאפס לקראת הסבב הבא: תושבים לא יוכלו לענות יותר על הסבב הזה${st.d.cases.length ? `, ו־${st.d.cases.length} בקשות עזרה פתוחות ייסגרו` : ''}. התשובות נשמרות בהיסטוריה.`, confirmText: 'סגירת הסבב', danger: true, input: false })) act(() => rpc('staff_round_close', { p_token: tok }), 'הסבב נסגר'); });
    on('sendall', openSendAll);
  }

  // ---- מפה: מקלטים, שכונות, ממ״ד ----
  function viewMap(animate) {
    const el = document.getElementById('tab'), d = st.d;
    el.innerHTML = `<div class="seg" id="seg" role="group" aria-label="תצוגה"></div>
      ${d.round ? `<div class="legend">${STATUS_ORDER.slice().reverse().map(s => `<span class="l-${s}">${STATUS[s]}</span>`).join('')}</div>` : ''}<div id="map"></div>`;
    segmented(document.getElementById('seg'), [['shelter', 'מקלטים'], ['neighborhood', 'שכונות'], ['mamad', 'ממ״ד']], st.mapMode, k => { st.mapMode = k; drawMap(true); });
    drawMap(animate);
  }
  function drawMap(animate) {
    const el = document.getElementById('map'), d = st.d;
    const tile = (key, name, sub, ppl, i) => {
      const c = counts(ppl), total = ppl.length, alert = c.needs_help + c.unreachable;
      const bars = d.round ? `<div class="bar-stack" aria-hidden="true">${['safe', 'away', 'no_answer', 'unreachable', 'needs_help'].map(s => c[s] ? `<i class="i-${s}" style="flex-grow:${c[s]}"></i>` : '').join('')}</div>` : '';
      return `<button class="tile" data-key="${esc(key)}" style="--i:${Math.min(i, 20)}" aria-label="${esc(name)}, ${total} תושבים${d.round ? `, ${c.no_answer} לא ענו, ${alert} דורשים טיפול` : ''}">
        ${alert ? `<span class="alert">${alert}</span>` : ''}<span class="name">${esc(name)}</span>${sub ? `<span class="mgr">${esc(sub)}</span>` : '<span></span>'}
        <span class="foot"><span class="count">${d.round ? total - c.no_answer : total}<small>${d.round ? ` / ${total} ענו` : ' תושבים'}</small></span></span>${bars}</button>`;
    };
    let groups;
    if (st.mapMode === 'mamad') {
      // Live answer wins; otherwise what the registry knows about the home.
      const kind = p => (d.round && p.answer?.shelter_status) || (p.has_mamad === true ? 'protected_room' : p.has_mamad === false ? 'going_to_shelter' : 'none');
      const by = k => d.people.filter(p => kind(p) === k);
      groups = [['protected_room', 'יש ממ״ד בבית', null, by('protected_room')], ['going_to_shelter', 'אין ממ״ד', 'משתמשים במקלט', by('going_to_shelter')],
        ...(d.round ? [['difficulty_reaching', 'מתקשים להגיע למקלט', null, by('difficulty_reaching')]] : []), ['none', 'לא ידוע', 'אפשר לעדכן בכרטיס התושב', by('none')]];
    } else {
      groups = d.shelters.filter(s => s.kind === st.mapMode).map(s => [s.id, s.name, s.manager ? 'אחראי: ' + s.manager : null, d.people.filter(p => p.shelter_id === s.id)]);
      if (st.mapMode === 'shelter') { const un = d.people.filter(p => !p.shelter_id); if (un.length) groups.push(['-', 'ללא שיבוץ', null, un]); }
    }
    el.innerHTML = `<div class="tiles ${animate ? 'stagger' : ''}">${groups.map((g, i) => tile(g[0], g[1], g[2], g[3], i)).join('') || '<div class="empty">אין כאן כלום</div>'}</div>
      ${st.mapMode !== 'mamad' ? `<div style="margin-top:16px"><button class="btn block" id="print-all">הדפסת רשימות לכל המקלטים והשכונות</button></div>` : ''}`;
    el.querySelectorAll('.tile').forEach(t => t.onclick = () => { const g = groups.find(x => String(x[0]) === t.dataset.key); openGroup(g[1], g[3], g[0]); });
    document.getElementById('print-all')?.addEventListener('click', () => printLists(d.shelters));
  }
  function openGroup(name, ppl, key) {
    const sorted = ppl.slice().sort((a, b) => STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status) || fullName(a).localeCompare(fullName(b), 'he'));
    const shelter = st.d.shelters.find(s => s.id === key);
    openSheet({ title: name, left: shelter ? 'הדפסה' : null,
      html: `<p class="muted center" style="margin:0 0 10px">${ppl.length} תושבים</p><div class="group">${sorted.map(personCell).join('') || '<div class="empty">אין תושבים</div>'}</div>
        ${can() && (shelter || key === '-') ? `<div style="margin-top:14px"><button class="btn block" data-addhere>הוספת תושב/ת ${shelter ? 'לכאן' : ''}</button></div>` : ''}`,
      onMount(s) {
        bindPeople(s.el); s.el.querySelector('[data-left]')?.addEventListener('click', () => printLists([shelter]));
        s.el.querySelector('[data-addhere]')?.addEventListener('click', () => { s.close(); editPerson(null, { shelter_id: shelter?.id || '' }); });
      } });
  }

  // Paper fallback: one page per shelter with names, phones and an empty column to tick by hand.
  function printLists(list) {
    document.getElementById('print').innerHTML = list.map(s => {
      const ppl = st.d.people.filter(p => p.shelter_id === s.id);
      return `<div class="print-shelter"><h2>${esc(s.name)}${s.manager ? ' · ' + esc(s.manager) : ''}</h2><p>הודפס ${esc(time(new Date().toISOString()))}</p>
        <table><thead><tr><th>שם</th><th>טלפון</th><th>מצב בסבב</th><th>נוכח</th></tr></thead><tbody>
        ${ppl.map(p => `<tr><td>${esc(fullName(p))}</td><td>${esc(p.phone)}</td><td>${p.status ? STATUS[p.status] : ''}</td><td class="box"></td></tr>`).join('')}</tbody></table></div>`;
    }).join('');
    window.print();
  }

  // ---- תושבים: A–Z with sticky letter headers ----
  function viewPeople(animate) {
    const el = document.getElementById('tab');
    el.innerHTML = `<div class="row-actions" style="align-items:center"><label class="search" style="flex:1">${svg('search')}<span class="sr">חיפוש</span>
        <input type="search" id="q" placeholder="חיפוש שם או טלפון" value="${esc(st.q)}"></label>
        ${can() ? '<button class="btn sm fill" id="add">הוספה</button>' : ''}</div><div id="plist"></div>`;
    const draw = first => {
      const q = st.q.trim(), digits = q.replace(/\D/g, '');
      const list = st.d.people.filter(p => !q || fullName(p).includes(q) || `${p.last_name} ${p.first_name}`.includes(q) || (digits && (p.phone || '').includes(digits)))
        .sort((a, b) => (a.last_name || a.first_name).localeCompare(b.last_name || b.first_name, 'he'));
      const groups = {}; list.forEach(p => { const k = (p.last_name || p.first_name || '#')[0]; (groups[k] = groups[k] || []).push(p); });
      document.getElementById('plist').innerHTML = `<p class="muted" style="margin:0 6px 8px;font-size:.875rem">${list.length} תושבים</p>` +
        (Object.entries(groups).map(([k, ps]) => `<div class="index-head">${esc(k)}</div><div class="group ${first && animate ? 'stagger' : ''}">${ps.map(personCell).join('')}</div>`).join('') || '<div class="group"><div class="empty">לא נמצאו תושבים</div></div>');
      bindPeople(document.getElementById('plist'));
    };
    document.getElementById('q').oninput = e => { st.q = e.target.value; draw(false); };
    document.getElementById('add')?.addEventListener('click', () => editPerson(null));
    draw(true);
  }

  async function viewRounds() {
    const el = document.getElementById('tab');
    if (!el.children.length) el.innerHTML = '<div class="group"><div class="empty">טוען…</div></div>';
    try {
      const h = await rpc('staff_history', { p_token: tok });
      const f = st.d.form || DEFAULT_FORM, on = Object.values({ ...DEFAULT_FORM.builtins, ...f.builtins }).filter(Boolean).length;
      el.innerHTML = `<div class="hero" style="margin-bottom:6px"><div class="grow"><h2>הטופס לתושבים</h2>
          <div class="muted">${on} שאלות קבועות${(f.questions || []).length ? ` ועוד ${f.questions.length} שאלות שהוספת` : ''}</div>
          <div class="row-actions" style="margin-top:12px"><button class="btn sm fill" id="editform">עריכת הטופס</button><button class="btn sm" id="previewform">איך התושב רואה אותו</button></div></div></div>
        <div class="group-title">סבבים</div><div class="group stagger">${h.map((r, i) => `<div class="cell plain" style="--i:${i};cursor:default"><span class="grow"><span class="t">${esc(r.title)}</span>
        <span class="s" style="display:block">${esc(time(r.opened_at))}${r.closed_at ? ' עד ' + esc(time(r.closed_at)) : ' · פתוח'}</span></span>
        <span class="badge b-safe">${r.answered} ענו</span>${r.needed_help ? `<span class="badge b-needs_help">${r.needed_help} עזרה</span>` : ''}</div>`).join('')}</div>`;
      document.getElementById('editform').onclick = editForm;
      document.getElementById('previewform').onclick = () => previewForm(st.d.form || DEFAULT_FORM);
    } catch (e) { el.innerHTML = `<p class="err">${esc(e.message)}</p>`; }
  }

  function previewForm(cfg) {
    try { localStorage.setItem('tzachi_preview', JSON.stringify(cfg)); } catch (_) { toast('הדפדפן חוסם תצוגה מקדימה'); return; }
    window.open(location.pathname + '#preview', '_blank');
  }

  // The coordinator decides what the form asks: hide built-in questions, add their own.
  function editForm() {
    const cfg = JSON.parse(JSON.stringify(st.d.form || DEFAULT_FORM));
    cfg.builtins = { ...DEFAULT_FORM.builtins, ...cfg.builtins }; cfg.questions = cfg.questions || [];
    const BUILT = { location: 'איפה את/ה עכשיו', shelter: 'מיגון', household: 'כמה נפשות בבית', wellbeing: 'איך את/ה מרגיש/ה', help: 'צריכים משהו' };
    const TYPES = { yesno: 'כן / לא', choice: 'בחירה מרשימה', text: 'תשובה חופשית' };
    openSheet({ title: 'עריכת הטופס', left: 'תצוגה', right: 'שמירה', html: '<div id="fe"></div>', onMount(s) {
      const box = s.el.querySelector('#fe');
      const draw = () => {
        box.innerHTML = `<div class="group-title">שאלות קבועות</div><div class="form-group">${Object.entries(BUILT).map(([k, l]) =>
            `<label class="form-row toggle-row"><span>${l}</span><input type="checkbox" data-b="${k}" ${cfg.builtins[k] ? 'checked' : ''}></label>`).join('')}</div>
          <div class="group-title">שאלות שהוספת</div><div class="group">${cfg.questions.map((q, i) => `<div class="cell" style="cursor:default"><span class="grow"><span class="t">${esc(q.label)}${q.required ? ' *' : ''}</span>
            <span class="s" style="display:block">${TYPES[q.type]}${q.type === 'choice' ? ': ' + esc((q.options || []).join(', ')) : ''}</span></span><button class="btn sm danger" data-del="${i}">מחיקה</button></div>`).join('') || '<div class="empty">עוד לא הוספת שאלות</div>'}</div>
          <div class="group-title">שאלה חדשה</div><div class="form-group">
            <div class="form-row"><label for="nq">השאלה</label><input id="nq" maxlength="120" placeholder="למשל: יש בבית חיית מחמד?"></div>
            <div class="form-row"><label for="nt">סוג תשובה</label><select id="nt">${Object.entries(TYPES).map(([k, v]) => `<option value="${k}">${v}</option>`).join('')}</select></div>
            <div class="form-row" id="nor" style="display:none"><label for="no">אפשרויות</label><input id="no" maxlength="200" placeholder="מופרדות בפסיק"></div>
            <label class="form-row toggle-row"><span>חובה לענות</span><input type="checkbox" id="nr"></label></div>
          <div style="margin-top:12px"><button class="btn block" id="addq">הוספת השאלה</button></div>`;
        box.querySelectorAll('[data-b]').forEach(c => c.onchange = () => { cfg.builtins[c.dataset.b] = c.checked; });
        box.querySelectorAll('[data-del]').forEach(b => b.onclick = () => { cfg.questions.splice(+b.dataset.del, 1); draw(); });
        const nt = box.querySelector('#nt'); nt.onchange = () => { box.querySelector('#nor').style.display = nt.value === 'choice' ? '' : 'none'; };
        box.querySelector('#addq').onclick = () => {
          const label = box.querySelector('#nq').value.trim(), options = box.querySelector('#no').value.split(',').map(x => x.trim()).filter(Boolean);
          if (!label) { toast('צריך לכתוב את השאלה'); return; }
          if (nt.value === 'choice' && options.length < 2) { toast('צריך לפחות שתי אפשרויות'); return; }
          if (cfg.questions.length >= 15) { toast('אפשר עד 15 שאלות'); return; }
          cfg.questions.push({ id: 'q' + Date.now().toString(36), label, type: nt.value, ...(nt.value === 'choice' ? { options } : {}), required: box.querySelector('#nr').checked });
          draw();
        };
      };
      draw();
      s.el.querySelector('[data-left]').onclick = () => previewForm(cfg);
      s.el.querySelector('[data-right]').onclick = async () => { if (await act(() => rpc('staff_form_save', { p_token: tok, p_config: cfg }), 'הטופס נשמר')) { s.close(); if (st.tab === 'rounds') viewRounds(); } };
    } });
  }

  async function setPassword(staffId, name) {
    const pw = await ask({ title: name ? 'סיסמה ל' + name : 'הסיסמה שלי', label: 'לפחות 8 תווים. איתה נכנסים מכל מכשיר.', confirmText: 'שמירה', required: true });
    if (pw === null) return false;
    try { await rpc('staff_set_password', { p_token: tok, p_staff: staffId, p_password: pw }); toast('הסיסמה נשמרה'); return true; }
    catch (e) { toast(e.message); return false; }
  }
  function account() {
    openSheet({ title: st.d.me.name, html: `<div class="group">
        <button class="cell" id="mypw"><span class="grow t">הגדרת סיסמה</span></button>
        <button class="cell" id="out"><span class="grow t" style="color:var(--red)">יציאה מהמכשיר הזה</span></button></div>`,
      onMount(s) {
        s.el.querySelector('#mypw').onclick = () => { s.close(); setPassword(null); };
        s.el.querySelector('#out').onclick = async () => {
          try { await rpc('staff_logout', { p_token: tok }); } catch (_) { /* logging out locally is what matters */ }
          try { localStorage.removeItem(STAFF_KEY); } catch (_) { /* storage blocked */ }
          location.replace(location.pathname);
        };
      } });
  }

  async function viewTeam() {
    const el = document.getElementById('tab');
    try {
      const team = await rpc('admin_staff_list', { p_token: tok });
      el.innerHTML = `<div class="group stagger">${team.map((m, i) => `<div class="cell" style="--i:${i};cursor:default"><span class="avatar" aria-hidden="true" style="background:var(--tint)">${esc(m.name[0])}</span>
          <span class="grow"><span class="t">${esc(m.name)}</span><span class="s" style="display:block">${ROLES[m.role]}${m.shelter_id ? ' · ' + esc(shelterName(m.shelter_id)) : ''}</span></span>
          <button class="btn sm" data-pw="${m.id}" data-n="${esc(m.name)}">${m.has_password ? 'שינוי סיסמה' : 'סיסמה'}</button>
          ${m.me ? '' : `<button class="btn sm danger" data-rev="${m.id}">הסרה</button>`}</div>`).join('')}</div>
        <div style="margin-top:16px"><button class="btn fill block" id="addstaff">הוספת איש צוות</button></div>`;
      document.getElementById('addstaff').onclick = addStaff;
      el.querySelectorAll('[data-pw]').forEach(b => b.onclick = async () => { if (await setPassword(b.dataset.pw, b.dataset.n)) viewTeam(); });
      el.querySelectorAll('[data-rev]').forEach(b => b.onclick = async () => {
        if (await ask({ title: 'הסרה מהצוות', label: 'הקישור שלו יפסיק לעבוד מיד.', confirmText: 'הסרה', danger: true, input: false }))
          (await act(() => rpc('admin_staff_revoke', { p_token: tok, p_staff: b.dataset.rev }), 'הוסר')) && viewTeam();
      });
    } catch (e) { el.innerHTML = `<p class="err">${esc(e.message)}</p>`; }
  }
  function addStaff() {
    openSheet({ title: 'איש צוות חדש', right: 'הוספה', html: `<div class="form-group">
        <div class="form-row"><label for="sn">שם</label><input id="sn" maxlength="80" autocomplete="off"></div>
        <div class="form-row"><label for="sr">תפקיד</label><select id="sr">${Object.entries(ROLES).map(([k, v]) => `<option value="${k}" ${k === 'coordinator' ? 'selected' : ''}>${v}</option>`).join('')}</select></div>
        <div class="form-row" id="srs" hidden><label for="ss">מקלט</label><select id="ss">${st.d.shelters.map(s => `<option value="${s.id}">${esc(s.name)}</option>`).join('')}</select></div></div>`,
      onMount(s) {
        const q = id => s.el.querySelector('#' + id);
        q('sr').onchange = () => q('srs').hidden = q('sr').value !== 'shelter_manager';
        s.el.querySelector('[data-right]').onclick = async () => {
          const name = q('sn').value.trim(); if (!name) { toast('צריך שם'); return; }
          try {
            const t = await rpc('admin_staff_add', { p_token: tok, p_name: name, p_role: q('sr').value, p_shelter: q('sr').value === 'shelter_manager' ? q('ss').value : null });
            s.close(); viewTeam();
            showLink(name, linkFor('s', t), `שלום ${name}, זה הקישור האישי שלך ללוח הבקרה של צח״י שניר. לא להעביר לאחרים:`);
          } catch (e) { toast(e.message); }
        };
      } });
  }
  function showLink(name, url, msg) {
    openSheet({ title: `הקישור של ${name}`, html: `<input class="field" readonly value="${esc(url)}" aria-label="קישור" style="direction:ltr">
        <div class="row-actions" style="margin-top:12px"><button class="btn fill" id="cp" style="flex:1">העתקה</button>
        <a class="btn" style="flex:1" target="_blank" rel="noopener" href="${esc('https://wa.me/?text=' + encodeURIComponent(msg + '\n' + url))}">וואטסאפ</a></div>`,
      onMount(s) { s.el.querySelector('#cp').onclick = async () => { try { await navigator.clipboard.writeText(url); toast('הועתק'); } catch (_) { s.el.querySelector('input').select(); } }; } });
  }

  const residentMsg = p => `שלום ${p.first_name}, כאן צוות צח״י שניר. נשמח לדעת מה שלומכם, זה לוקח כמה שניות:`;
  async function sendLink(p) {
    // Open the window synchronously so mobile browsers don't block it, then point it at WhatsApp.
    const w = window.open('', '_blank');
    try { const t = await rpc('staff_person_link', { p_token: tok, p_person: p.id }); p.has_link = true; const url = waLink(p.phone, residentMsg(p) + '\n' + linkFor('r', t)); if (w) w.location = url; else location.href = url; return true; }
    catch (e) { w?.close(); toast(e.message); return false; }
  }
  function openSendAll() {
    const list = st.d.people.filter(p => p.status === 'no_answer' && p.phone);
    openSheet({ title: `שליחת קישורים · ${list.length}`, html: `<p class="muted" style="margin:0 4px 12px;font-size:.9375rem">כל לחיצה פותחת וואטסאפ עם קישור אישי חדש. קישור קודם של אותו תושב מפסיק לעבוד.</p>
      <div class="group">${list.map(p => `<div class="cell" style="cursor:default"><span class="avatar av-no_answer" aria-hidden="true">${esc(initials(p))}</span><span class="grow"><span class="t">${esc(fullName(p))}</span>
        <span class="s" style="display:block;direction:ltr;text-align:right">${esc(p.phone)}</span></span><button class="btn sm fill" data-send="${p.id}">שליחה</button></div>`).join('') || '<div class="empty">כולם קיבלו או ענו</div>'}</div>`,
      onMount(s) { s.el.querySelectorAll('[data-send]').forEach(b => b.onclick = async () => { if (await sendLink(byId(b.dataset.send))) { b.textContent = 'נשלח'; b.classList.remove('fill'); b.disabled = true; } }); } });
  }

  function openPerson(id) {
    const p = byId(id); if (!p) return;
    const mates = p.household_id ? st.d.people.filter(o => o.household_id === p.household_id && o.id !== p.id) : [];
    const a = p.answer, r = st.d.round;
    const row = (k, v) => v ? `<div class="cell"><span class="k">${k}</span><span class="grow">${v}</span></div>` : '';
    openSheet({ title: '', right: can() ? 'עריכה' : null, html: `
      <div class="person-head"><div class="avatar ${p.status ? 'av-' + p.status : ''}" aria-hidden="true">${esc(initials(p))}</div><h3>${esc(fullName(p))}</h3>${badge(p.status)}</div>
      <div class="quick">${p.phone ? `<a href="tel:${esc(p.phone)}">${svg('phone')}התקשרות</a>` : ''}
        ${can() && p.phone ? `<button data-wa>${svg('chat')}קישור אישי</button>` : ''}
        ${r ? `<button data-rep="ok">${svg('check')}בסדר</button><button data-rep="help">${svg('help')}צריך עזרה</button><button data-rep="unr">${svg('moon')}לא זמין</button>` : ''}</div>
      <div class="group-title">פרטים</div><div class="group kv">
        ${row('טלפון', p.phone ? `<a href="tel:${esc(p.phone)}" style="direction:ltr;unicode-bidi:isolate;color:var(--tint);text-decoration:none">${esc(p.phone)}</a>` : 'אין')}
        ${row('שיבוץ', esc(shelterName(p.shelter_id)))}${row('ממ״ד', p.has_mamad === true ? 'יש בבית' : p.has_mamad === false ? 'אין, משתמשים במקלט' : 'לא ידוע')}${row('משק בית', mates.map(m => esc(fullName(m))).join(', '))}${row('הערה', esc(p.note))}</div>
      ${a ? `<div class="group-title">התשובה בסבב · ${esc(time(a.submitted_at))}</div><div class="group kv">
        ${row('דיווח', a.reported_by ? esc(a.reported_by) : 'התושב/ת')}${row('מיקום', a.location ? LOC[a.location] + (a.location_other ? ' · ' + esc(a.location_other) : '') : '')}
        ${row('מיגון', a.shelter_status ? SHEL[a.shelter_status] : '')}${row('הרגשה', a.wellbeing ? MOODS[a.wellbeing - 1].join(' ') : '')}
        ${row('נפשות', a.household_count != null ? String(a.household_count) : '')}${row('עזרה', a.help_type !== 'none' ? HELP[a.help_type] + (a.help_note ? ' · ' + esc(a.help_note) : '') : '')}
        ${((st.d.form || {}).questions || []).map(q => row(esc(q.label), esc(a.extra?.[q.id]))).join('')}</div>` : ''}`,
      onMount(s) {
        s.el.querySelector('[data-right]')?.addEventListener('click', () => { s.close(); editPerson(p); });
        s.el.querySelector('[data-wa]')?.addEventListener('click', () => sendLink(p));
        const rep = { ok: { location: 'kibbutz', help_type: 'none' }, unr: { outcome: 'unreachable' } };
        s.el.querySelectorAll('[data-rep]').forEach(b => b.onclick = async () => {
          let payload = rep[b.dataset.rep];
          if (b.dataset.rep === 'help') { const n = await ask({ title: 'צריך עזרה', label: 'במה?', confirmText: 'שמירה', required: true }); if (n === null) return; payload = { location: 'kibbutz', help_type: 'other', help_note: n }; }
          if (await act(() => rpc('staff_report', { p_token: tok, p_person: p.id, p: payload }), 'נשמר')) s.close();
        });
      } });
  }

  function editPerson(p, preset = {}) {
    const isNew = !p; p = p || { id: null, first_name: '', last_name: '', phone: '', note: '', shelter_id: '', household_id: null, has_mamad: null, ...preset };
    const mates = p.household_id ? st.d.people.filter(o => o.household_id === p.household_id && o.id !== p.id) : [];
    const others = st.d.people.filter(o => o.id !== p.id).sort((a, b) => (a.last_name + a.first_name).localeCompare(b.last_name + b.first_name, 'he'));
    openSheet({ title: isNew ? 'תושב/ת חדש/ה' : 'עריכה', left: 'ביטול', right: 'שמירה', html: `
      <div class="form-group">
        <div class="form-row"><label for="pf1">שם פרטי</label><input id="pf1" value="${esc(p.first_name)}" maxlength="60" autocomplete="off"></div>
        <div class="form-row"><label for="pf2">שם משפחה</label><input id="pf2" value="${esc(p.last_name)}" maxlength="60" autocomplete="off"></div>
        <div class="form-row"><label for="pf3">טלפון</label><input id="pf3" type="tel" inputmode="tel" value="${esc(p.phone)}" style="direction:ltr;text-align:right"></div></div>
      <div class="group-title">שיבוץ</div><div class="form-group">
        <div class="form-row"><label for="pf4">מקלט / שכונה</label><select id="pf4"><option value="">ללא שיבוץ</option>${st.d.shelters.map(s => `<option value="${s.id}" ${p.shelter_id === s.id ? 'selected' : ''}>${esc(s.name)}</option>`).join('')}</select></div>
        <div class="form-row"><label for="pf5">משק בית עם</label><select id="pf5"><option value="">לבד</option>${others.map(o => `<option value="${o.id}" ${mates[0]?.id === o.id ? 'selected' : ''}>${esc(o.last_name + ' ' + o.first_name)}</option>`).join('')}</select></div></div>
      <div class="form-group" style="margin-top:10px"><div class="form-row"><label for="pf7m">ממ״ד בבית</label><select id="pf7m">
        <option value="" ${p.has_mamad == null ? 'selected' : ''}>לא ידוע</option><option value="true" ${p.has_mamad === true ? 'selected' : ''}>יש</option><option value="false" ${p.has_mamad === false ? 'selected' : ''}>אין</option></select></div></div>
      <div class="group-title">הערה</div><div class="form-group"><div class="form-row"><textarea id="pf6" maxlength="500" aria-label="הערה">${esc(p.note)}</textarea></div></div>
      ${isNew ? '' : '<div style="margin-top:22px"><button class="btn block danger" id="arch">הסרה מהרשימה</button></div>'}`,
      onMount(s) {
        const v = id => s.el.querySelector('#' + id);
        s.el.querySelector('[data-left]').onclick = () => s.close();
        const save = async archived => {
          const body = { id: p.id, first_name: v('pf1').value, last_name: v('pf2').value, phone: v('pf3').value, shelter_id: v('pf4').value, household_with: v('pf5').value, note: v('pf6').value, has_mamad: v('pf7m').value, archived };
          if (!body.first_name.trim()) { toast('צריך שם פרטי'); v('pf1').focus(); return; }
          if (await act(() => rpc('staff_person_save', { p_token: tok, p: body }), archived ? 'הוסר מהרשימה' : 'נשמר')) s.close();
        };
        s.el.querySelector('[data-right]').onclick = () => save(false);
        v('arch')?.addEventListener('click', async () => { if (await ask({ title: 'הסרה מהרשימה', label: 'למי שעזב/ה את היישוב. ההיסטוריה נשמרת.', confirmText: 'הסרה', danger: true, input: false })) save(true); });
      } });
  }

  load();
}

// ---------- routing ----------
// Tokens arrive in the URL fragment, which browsers never send to any server.
(function start() {
  const h = new URLSearchParams(location.hash.slice(1));
  if (h.get('r')) return residentView(h.get('r'));
  if (location.hash === '#preview') { let cfg = null; try { cfg = JSON.parse(localStorage.getItem('tzachi_preview')); } catch (_) { /* no preview data */ } return residentView(null, cfg || DEFAULT_FORM); }
  if (h.get('s')) { try { localStorage.setItem(STAFF_KEY, h.get('s')); } catch (_) { /* private mode: token lives in the URL only */ } history.replaceState(null, '', location.pathname); return staffView(h.get('s')); }
  let saved = null; try { saved = localStorage.getItem(STAFF_KEY); } catch (_) { /* storage blocked */ }
  if (saved) return staffView(saved);
  $app.className = 'resident';
  $app.innerHTML = `<div class="done"><h1>צח״י שניר</h1><p class="sub">תושבים: הכניסה היא דרך הקישור האישי שקיבלתם.</p>
    <form id="login" class="login" novalidate><label class="q" for="pw">כניסת צוות</label>
      <input class="field" id="pw" type="password" autocomplete="current-password" placeholder="סיסמה" required>
      <p class="err" id="lerr" role="alert"></p><button class="cta" id="lgo">כניסה</button></form></div>`;
  document.getElementById('login').onsubmit = async e => {
    e.preventDefault();
    const pw = document.getElementById('pw').value, btn = document.getElementById('lgo'), err = document.getElementById('lerr');
    if (!pw) { err.textContent = 'צריך להקליד סיסמה'; return; }
    btn.disabled = true; btn.textContent = 'נכנס…'; err.textContent = '';
    try {
      const t = await rpc('staff_login', { p_password: pw });
      if (!t) throw new Error('סיסמה שגויה');
      try { localStorage.setItem(STAFF_KEY, t); } catch (_) { /* private mode: stays logged in until the tab closes */ }
      staffView(t);
    } catch (x) { err.textContent = x.message; btn.disabled = false; btn.textContent = 'כניסה'; document.getElementById('pw').select(); }
  };
})();
