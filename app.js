'use strict';
// The page holds no data of its own: everything comes from database functions that check the personal link token.
const API = 'https://gzqhnklmkdyjpqjpnirz.supabase.co/rest/v1/rpc/';
const KEY = 'sb_publishable_yEykcrB3AuRlDmd_jiesKw_HKuqQm1h';
const STAFF_KEY = 'tzachi_staff';

const STATUS = { needs_help: 'צריך עזרה', unreachable: 'לא זמין', no_answer: 'לא ענה', away: 'מחוץ ליישוב', safe: 'בסדר' };
const STATUS_ORDER = ['needs_help', 'unreachable', 'no_answer', 'away', 'safe'];
const LOC = { kibbutz: 'ביישוב', miluim: 'מילואים', abroad: 'חו"ל', other: 'אחר' };
const SHEL = { protected_room: 'יש ממ"ד', going_to_shelter: 'הולך/ת למקלט', difficulty_reaching: 'מתקשה להגיע למקלט' };
const HELP = { none: 'לא צריך כלום', medical: 'רפואית', logistics: 'לוגיסטית', emotional: 'רגשית', other: 'אחר' };
const MOODS = [['😣', 'קשה מאוד'], ['😟', 'קשה'], ['😐', 'מתמודד/ת'], ['🙂', 'בסדר'], ['😄', 'טוב']];
const ROLES = { admin: 'מנהל', coordinator: 'רכז', shelter_manager: 'אחראי מקלט' };
const ERRORS = {
  not_authorized: 'הקישור לא תקף. בקשו קישור חדש מצוות צח״י.', no_open_round: 'אין כרגע סבב פעיל.',
  forbidden: 'אין הרשאה לפעולה הזו.', note_required: 'צריך לכתוב מה נעשה.', round_already_open: 'כבר יש סבב פתוח.',
  cannot_revoke_self: 'אי אפשר להסיר את עצמך.'
};

const $app = document.getElementById('app');
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fullName = p => `${p.first_name} ${p.last_name || ''}`.trim();
const time = iso => iso ? new Date(iso).toLocaleString('he-IL', { day: 'numeric', month: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';
const pill = s => s ? `<span class="pill s-${s}">${STATUS[s]}</span>` : '';

async function rpc(fn, args = {}) {
  const res = await fetch(API + fn, {
    method: 'POST', headers: { apikey: KEY, Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' }, body: JSON.stringify(args)
  });
  const text = await res.text();
  if (!res.ok) {
    let msg = 'משהו השתבש. נסו שוב.';
    try { const e = JSON.parse(text); msg = ERRORS[e.message] || msg; } catch (_) { /* keep generic */ }
    throw new Error(msg);
  }
  return text ? JSON.parse(text) : null;
}

let toastTimer;
function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), 3200);
}

function waLink(phone, text) {
  const intl = phone && phone.startsWith('0') ? '972' + phone.slice(1) : (phone || '').replace('+', '');
  return `https://wa.me/${intl}?text=${encodeURIComponent(text)}`;
}
const linkFor = (kind, tok) => `${location.origin}${location.pathname}#${kind}=${tok}`;

// ---------- Resident ----------

function residentView(tok) {
  let data, ans = {}, editing = false, forHousehold = true;

  async function load() {
    try { data = await rpc('resident_get', { p_token: tok }); } catch (e) { $app.innerHTML = `<div class="card center"><p class="err">${esc(e.message)}</p></div>`; return; }
    ans = data.answer ? { ...data.answer } : {};
    editing = !data.answer;
    render();
  }

  const opt = (field, value, label, cls = '') => `<button type="button" class="opt ${cls}" data-f="${field}" data-v="${value}" aria-pressed="${String(ans[field]) === String(value)}">${label}</button>`;

  function render() {
    const hh = data.household || [];
    if (!data.round) {
      $app.innerHTML = `<p class="hello">שלום ${esc(data.first_name)}</p><div class="card">אין כרגע סבב פעיל. כשייפתח סבב, אותו קישור יעבוד.</div>`;
      return;
    }
    if (!editing) {
      $app.innerHTML = `<p class="hello">תודה ${esc(data.first_name)}</p>
        <div class="card"><p>העדכון התקבל${data.answer?.submitted_at ? ' ב-' + esc(time(data.answer.submitted_at)) : ''}.</p>
        <p>יחד נעבור את זה 💙</p><button class="btn block" id="edit">עדכון התשובה</button></div>`;
      document.getElementById('edit').onclick = () => { editing = true; render(); };
      return;
    }
    const inKibbutz = ans.location === 'kibbutz';
    $app.innerHTML = `
      <p class="hello">שלום ${esc(data.first_name)}</p>
      <p class="muted">${esc(data.round.title)}</p>
      <button class="btn primary big-ok" id="quick">${hh.length ? 'כולנו בסדר, בבית עם ממ"ד' : 'אני בסדר, בבית עם ממ"ד'}</button>
      <p class="center muted">או מלאו פרטים:</p>
      <form class="card" id="f" novalidate>
        <label class="f" id="l-loc">איפה את/ה עכשיו?</label>
        <div class="opts cols2" role="group" aria-labelledby="l-loc">${Object.entries(LOC).map(([k, v]) => opt('location', k, v)).join('')}</div>
        ${ans.location === 'other' ? `<input id="loc_other" aria-label="איפה" value="${esc(ans.location_other)}" maxlength="200" style="margin-top:8px">` : ''}
        ${inKibbutz ? `
          <label class="f" id="l-sh">מיגון</label>
          <div class="opts" role="group" aria-labelledby="l-sh">${Object.entries(SHEL).map(([k, v]) => opt('shelter_status', k, v)).join('')}</div>
          <label class="f" for="hc">כמה נפשות בבית עכשיו (כולל אורחים)?</label>
          <input id="hc" type="number" inputmode="numeric" min="0" max="40" value="${esc(ans.household_count)}">` : ''}
        <label class="f" id="l-mood">איך את/ה מרגיש/ה?</label>
        <div class="opts cols5" role="group" aria-labelledby="l-mood">${MOODS.map(([e, l], i) => opt('wellbeing', i + 1, `<span aria-hidden="true">${e}</span><small>${l}</small>`, 'mood')).join('')}</div>
        <label class="f" id="l-help">צריכים משהו?</label>
        <div class="opts cols2" role="group" aria-labelledby="l-help">${Object.entries(HELP).map(([k, v]) => opt('help_type', k, v)).join('')}</div>
        ${ans.help_type && ans.help_type !== 'none' ? `<label class="f" for="hn">במה נוכל לעזור?</label><textarea id="hn" maxlength="1000">${esc(ans.help_note)}</textarea>` : ''}
        ${hh.length ? `<label class="check"><input type="checkbox" id="fh" ${forHousehold ? 'checked' : ''}> לעדכן גם עבור ${esc(hh.join(', '))}</label>` : ''}
        <p class="err" id="ferr"></p>
        <button class="btn primary block" type="submit">שליחה</button>
      </form>`;
    $app.querySelectorAll('.opt').forEach(b => b.onclick = () => {
      keepInputs();
      ans[b.dataset.f] = b.dataset.f === 'wellbeing' ? Number(b.dataset.v) : b.dataset.v;
      render();
    });
    document.getElementById('quick').onclick = () => send({ location: 'kibbutz', shelter_status: 'protected_room', help_type: 'none' });
    document.getElementById('f').onsubmit = e => {
      e.preventDefault(); keepInputs();
      if (!ans.location || !ans.help_type) { document.getElementById('ferr').textContent = 'צריך לבחור איפה את/ה ואם צריך משהו.'; return; }
      send(ans);
    };
  }

  function keepInputs() {
    const v = id => document.getElementById(id);
    if (v('loc_other')) ans.location_other = v('loc_other').value;
    if (v('hc')) ans.household_count = v('hc').value === '' ? null : Number(v('hc').value);
    if (v('hn')) ans.help_note = v('hn').value;
    if (v('fh')) forHousehold = v('fh').checked;
  }

  async function send(payload) {
    const p = { ...payload, for_household: forHousehold && (data.household || []).length > 0 };
    if (p.location !== 'kibbutz') { delete p.shelter_status; delete p.household_count; }
    try {
      $app.querySelectorAll('button').forEach(b => b.disabled = true);
      await rpc('resident_submit', { p_token: tok, p });
      await load();
    } catch (e) { toast(e.message); render(); }
  }

  load();
}

// ---------- Staff ----------

function staffView(tok) {
  const st = { d: null, tab: 'queue', filter: null, q: '', shelter: '', open: null };
  const can = () => st.d.me.role !== 'shelter_manager';
  const byId = id => st.d.people.find(p => p.id === id);
  const shelterName = id => st.d.shelters.find(s => s.id === id)?.name || 'ללא מקלט';

  async function load(quiet) {
    try { st.d = await rpc('staff_dashboard', { p_token: tok }); }
    catch (e) {
      if (!quiet) $app.innerHTML = `<div class="card center"><p class="err">${esc(e.message)}</p></div>`;
      if (e.message === ERRORS.not_authorized) localStorage.removeItem(STAFF_KEY);
      return;
    }
    if (!st.open) render();
  }
  setInterval(() => { if (document.visibilityState === 'visible' && !st.open) load(true); }, 20000);

  function counts() {
    const c = Object.fromEntries(STATUS_ORDER.map(s => [s, 0]));
    st.d.people.forEach(p => { if (p.status) c[p.status]++; });
    return c;
  }

  function render() {
    const d = st.d, r = d.round;
    const tabs = [['queue', r ? 'מצב נוכחי' : 'סבב'], ['people', 'תושבים'], ['shelters', 'מקלטים']];
    if (can()) tabs.push(['history', 'סבבים קודמים']);
    if (d.me.role === 'admin') tabs.push(['team', 'צוות']);
    $app.innerHTML = `
      <div class="top"><h1>צח״י שניר</h1><span class="who">${esc(d.me.name)} · ${ROLES[d.me.role]}</span></div>
      <div class="card round">${r
        ? `<div><span class="live" aria-hidden="true"></span><strong>${esc(r.title)}</strong><div class="muted">נפתח ${esc(time(r.opened_at))}</div></div>
           ${can() ? '<button class="btn danger small" id="close">סגירת הסבב</button>' : ''}`
        : `<div><strong>אין סבב פעיל</strong></div>${can() ? '<button class="btn primary" id="openr">פתיחת סבב</button>' : ''}`}</div>
      ${r ? `<div class="chips" role="group" aria-label="סינון לפי מצב">${STATUS_ORDER.map(s =>
        `<button class="chip s-${s}" data-s="${s}" aria-pressed="${st.filter === s}"><b>${counts()[s]}</b><span>${STATUS[s]}</span></button>`).join('')}</div>` : ''}
      <div class="tabs" role="tablist">${tabs.map(([k, v]) => `<button role="tab" data-t="${k}" aria-selected="${st.tab === k}">${v}</button>`).join('')}</div>
      <section id="tab"></section>
      <div class="print-only" id="print"></div>`;
    $app.querySelectorAll('[data-t]').forEach(b => b.onclick = () => { st.tab = b.dataset.t; render(); });
    $app.querySelectorAll('.chip').forEach(b => b.onclick = () => { st.filter = st.filter === b.dataset.s ? null : b.dataset.s; st.tab = 'queue'; render(); });
    const on = (id, fn) => { const el = document.getElementById(id); if (el) el.onclick = fn; };
    on('openr', async () => { const t = prompt('שם הסבב (אפשר להשאיר ריק)', ''); if (t === null) return; await act(() => rpc('staff_round_open', { p_token: tok, p_title: t }), 'הסבב נפתח'); });
    on('close', async () => { if (confirm('לסגור את הסבב? אחרי הסגירה תושבים לא יוכלו לענות עליו.')) await act(() => rpc('staff_round_close', { p_token: tok }), 'הסבב נסגר'); });
    ({ queue: renderQueue, people: renderPeople, shelters: renderShelters, history: renderHistory, team: renderTeam })[st.tab]();
  }

  async function act(fn, ok) {
    try { const r = await fn(); if (ok) toast(ok); await load(); return r; } catch (e) { toast(e.message); }
  }

  const row = p => `<div class="row" tabindex="0" role="button" data-p="${p.id}">
      <div class="main"><div class="name">${esc(fullName(p))}</div>
      <div class="sub">${esc(shelterName(p.shelter_id))}${p.answer?.help_note ? ' · ' + esc(p.answer.help_note) : ''}${p.answer?.reported_by ? ' · דיווח: ' + esc(p.answer.reported_by) : ''}</div></div>
      ${pill(p.status)}</div>`;
  function bindRows(el) {
    el.querySelectorAll('[data-p]').forEach(r => {
      r.onclick = () => openPerson(r.dataset.p);
      r.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openPerson(r.dataset.p); } };
    });
  }

  function renderQueue() {
    const el = document.getElementById('tab'), d = st.d;
    if (!d.round) { el.innerHTML = `<p class="muted center">כשייפתח סבב, כאן יופיעו מי שלא ענה ומי שצריך עזרה.</p>`; renderCases(el, true); return; }
    let people = d.people.filter(p => st.filter ? p.status === st.filter : ['needs_help', 'unreachable', 'no_answer'].includes(p.status));
    people.sort((a, b) => STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status));
    el.innerHTML = `${can() && (st.filter === 'no_answer' || !st.filter) ? `<div class="actions" style="margin-bottom:10px"><button class="btn small" id="sendall">שליחת קישורים למי שלא ענה</button></div>` : ''}
      <div id="cases"></div>
      <div class="section-title">${st.filter ? STATUS[st.filter] : 'דורשים טיפול'} (${people.length})</div>
      <div class="list">${people.map(row).join('') || '<div class="empty">אין כאן אף אחד</div>'}</div>`;
    bindRows(el);
    renderCases(document.getElementById('cases'));
    const sa = document.getElementById('sendall'); if (sa) sa.onclick = openSendAll;
  }

  function renderCases(el, append) {
    const cases = st.d.cases;
    if (!cases.length) return;
    const html = `<div class="section-title">בקשות עזרה פתוחות (${cases.length})</div>` + cases.map(c => {
      const p = byId(c.person_id);
      return `<div class="card case"><div class="row" style="padding:0;border:0" data-p="${c.person_id}" tabindex="0" role="button">
          <div class="main"><div class="name">${esc(p ? fullName(p) : '')}</div><div class="sub">עזרה ${HELP[c.help_type]} · ${esc(time(c.opened_at))}</div></div>
          ${c.status === 'assigned' ? `<span class="pill s-away">מטפל: ${esc(c.assigned_to)}</span>` : '<span class="pill s-needs_help">חדש</span>'}</div>
        ${c.note ? `<p class="note">${esc(c.note)}</p>` : ''}
        <div class="actions">${c.status === 'open' ? `<button class="btn small" data-assign="${c.id}">אני מטפל/ת</button>` : ''}
          <button class="btn small primary" data-resolve="${c.id}">סגירת הבקשה</button>
          ${p?.phone ? `<a class="btn small" href="tel:${esc(p.phone)}">התקשרות</a>` : ''}</div></div>`;
    }).join('');
    if (append) el.insertAdjacentHTML('beforeend', html); else el.innerHTML = html;
    bindRows(el);
    el.querySelectorAll('[data-assign]').forEach(b => b.onclick = () => act(() => rpc('staff_case_update', { p_token: tok, p_case: b.dataset.assign, p_status: 'assigned', p_note: null }), 'סומן שאת/ה מטפל/ת'));
    el.querySelectorAll('[data-resolve]').forEach(b => b.onclick = () => {
      const note = prompt('מה נעשה?'); if (note === null) return;
      act(() => rpc('staff_case_update', { p_token: tok, p_case: b.dataset.resolve, p_status: 'resolved', p_note: note }), 'הבקשה נסגרה');
    });
  }

  function renderPeople() {
    const el = document.getElementById('tab'), d = st.d;
    el.innerHTML = `<div class="toolbar">
        <input type="search" id="q" placeholder="חיפוש שם או טלפון" aria-label="חיפוש" value="${esc(st.q)}">
        <select id="sh" aria-label="מקלט"><option value="">כל המקלטים</option>${d.shelters.map(s => `<option value="${s.id}" ${st.shelter === s.id ? 'selected' : ''}>${esc(s.name)}</option>`).join('')}<option value="-" ${st.shelter === '-' ? 'selected' : ''}>ללא מקלט</option></select>
        ${can() ? '<button class="btn small primary" id="add">תושב/ת חדש/ה</button>' : ''}</div><div id="plist"></div>`;
    const draw = () => {
      const q = st.q.trim();
      const list = d.people.filter(p => (!st.shelter || (st.shelter === '-' ? !p.shelter_id : p.shelter_id === st.shelter))
        && (!q || fullName(p).includes(q) || (p.phone || '').includes(q.replace(/\D/g, '') || '§')));
      const pl = document.getElementById('plist');
      pl.innerHTML = `<div class="section-title">${list.length} תושבים</div><div class="list">${list.map(row).join('') || '<div class="empty">לא נמצאו תושבים</div>'}</div>`;
      bindRows(pl);
    };
    document.getElementById('q').oninput = e => { st.q = e.target.value; draw(); };
    document.getElementById('sh').onchange = e => { st.shelter = e.target.value; draw(); };
    const add = document.getElementById('add'); if (add) add.onclick = () => openPerson(null, true);
    draw();
  }

  function renderShelters() {
    const el = document.getElementById('tab'), d = st.d;
    const rows = d.shelters.map(s => {
      const ppl = d.people.filter(p => p.shelter_id === s.id);
      const c = Object.fromEntries(STATUS_ORDER.map(k => [k, ppl.filter(p => p.status === k).length]));
      return `<div class="row" tabindex="0" role="button" data-sh="${s.id}"><div class="main"><div class="name">${esc(s.name)}</div>
        <div class="sub">${ppl.length} תושבים${s.manager ? ' · אחראי: ' + esc(s.manager) : ''}</div></div>
        ${d.round ? ['needs_help', 'unreachable', 'no_answer'].filter(k => c[k]).map(k => `<span class="pill s-${k}">${c[k]} ${STATUS[k]}</span>`).join(' ') : ''}</div>`;
    }).join('');
    el.innerHTML = `<div class="actions" style="margin-bottom:10px"><button class="btn small" id="print-all">הדפסת רשימות לכל המקלטים</button></div><div class="list">${rows}</div>`;
    el.querySelectorAll('[data-sh]').forEach(r => r.onclick = () => { st.shelter = r.dataset.sh; st.tab = 'people'; render(); });
    document.getElementById('print-all').onclick = printLists;
  }

  // Paper fallback: one page per shelter with names, phones and an empty column to tick by hand.
  function printLists() {
    const d = st.d;
    document.getElementById('print').innerHTML = d.shelters.map(s => {
      const ppl = d.people.filter(p => p.shelter_id === s.id);
      return `<div class="print-shelter"><h2>${esc(s.name)}${s.manager ? ' · ' + esc(s.manager) : ''}</h2><p>הודפס ${esc(time(new Date().toISOString()))}</p>
        <table><thead><tr><th>שם</th><th>טלפון</th><th>מצב בסבב</th><th>נוכח</th></tr></thead><tbody>
        ${ppl.map(p => `<tr><td>${esc(fullName(p))}</td><td>${esc(p.phone)}</td><td>${p.status ? STATUS[p.status] : ''}</td><td class="box"></td></tr>`).join('')}
        </tbody></table></div>`;
    }).join('');
    window.print();
  }

  async function renderHistory() {
    const el = document.getElementById('tab');
    el.innerHTML = '<p class="muted center">טוען…</p>';
    try {
      const h = await rpc('staff_history', { p_token: tok });
      el.innerHTML = `<div class="list">${h.map(r => `<div class="row" style="cursor:default"><div class="main"><div class="name">${esc(r.title)}</div>
        <div class="sub">${esc(time(r.opened_at))}${r.closed_at ? ' עד ' + esc(time(r.closed_at)) : ' · פתוח'}</div></div>
        <span class="pill s-safe">${r.answered} ענו</span>${r.needed_help ? ` <span class="pill s-needs_help">${r.needed_help} ביקשו עזרה</span>` : ''}</div>`).join('')}</div>`;
    } catch (e) { el.innerHTML = `<p class="err">${esc(e.message)}</p>`; }
  }

  async function renderTeam() {
    const el = document.getElementById('tab');
    try {
      const team = await rpc('admin_staff_list', { p_token: tok });
      el.innerHTML = `<form class="card" id="newstaff"><label class="f" for="sn">שם</label><input id="sn" required maxlength="80">
          <label class="f" for="sr">תפקיד</label><select id="sr">${Object.entries(ROLES).map(([k, v]) => `<option value="${k}" ${k === 'coordinator' ? 'selected' : ''}>${v}</option>`).join('')}</select>
          <div id="srs" hidden><label class="f" for="ss">מקלט</label><select id="ss">${st.d.shelters.map(s => `<option value="${s.id}">${esc(s.name)}</option>`).join('')}</select></div>
          <button class="btn primary block" style="margin-top:14px">הוספה וקבלת קישור</button></form>
        <div class="list">${team.map(m => `<div class="row" style="cursor:default"><div class="main"><div class="name">${esc(m.name)}</div>
          <div class="sub">${ROLES[m.role]}${m.shelter_id ? ' · ' + esc(shelterName(m.shelter_id)) : ''}</div></div>
          ${m.name === st.d.me.name ? '' : `<button class="btn small danger" data-rev="${m.id}">הסרה</button>`}</div>`).join('')}</div>`;
      const sr = document.getElementById('sr');
      sr.onchange = () => document.getElementById('srs').hidden = sr.value !== 'shelter_manager';
      document.getElementById('newstaff').onsubmit = async e => {
        e.preventDefault();
        const name = document.getElementById('sn').value.trim(); if (!name) return;
        try {
          const t = await rpc('admin_staff_add', { p_token: tok, p_name: name, p_role: sr.value, p_shelter: sr.value === 'shelter_manager' ? document.getElementById('ss').value : null });
          showLink(`הקישור של ${name}`, linkFor('s', t), `שלום ${name}, זה הקישור האישי שלך ללוח הבקרה של צח״י שניר. לא להעביר לאחרים:`);
          renderTeam();
        } catch (er) { toast(er.message); }
      };
      el.querySelectorAll('[data-rev]').forEach(b => b.onclick = () => { if (confirm('להסיר? הקישור שלו יפסיק לעבוד מיד.')) act(() => rpc('admin_staff_revoke', { p_token: tok, p_staff: b.dataset.rev }), 'הוסר').then(renderTeam); });
    } catch (e) { el.innerHTML = `<p class="err">${esc(e.message)}</p>`; }
  }

  // ---- drawers ----

  function sheet(html) {
    st.open = true;
    const bd = document.createElement('div');
    bd.className = 'backdrop';
    bd.innerHTML = `<div class="sheet" role="dialog" aria-modal="true">${html}</div>`;
    document.body.appendChild(bd);
    const close = () => { bd.remove(); st.open = null; render(); };
    bd.onclick = e => { if (e.target === bd) close(); };
    document.addEventListener('keydown', function esc(e) { if (e.key === 'Escape') { document.removeEventListener('keydown', esc); close(); } });
    bd.querySelector('button, a, input, select')?.focus();
    return { bd, close };
  }

  function showLink(title, url, msg, phone) {
    const { bd, close } = sheet(`<h2>${esc(title)}</h2><input readonly value="${esc(url)}" aria-label="קישור" style="direction:ltr">
      <div class="actions" style="margin-top:12px"><button class="btn primary" id="cp">העתקה</button>
      <a class="btn" target="_blank" rel="noopener" href="${esc(phone ? waLink(phone, msg + '\n' + url) : 'https://wa.me/?text=' + encodeURIComponent(msg + '\n' + url))}">שליחה בוואטסאפ</a>
      <button class="btn" id="x">סגירה</button></div>`);
    bd.querySelector('#cp').onclick = async () => { try { await navigator.clipboard.writeText(url); toast('הועתק'); } catch (_) { bd.querySelector('input').select(); } };
    bd.querySelector('#x').onclick = close;
  }

  const residentMsg = p => `שלום ${p.first_name}, כאן צוות צח״י שניר. נשמח לדעת מה שלומכם, זה לוקח כמה שניות:`;

  async function sendLink(p) {
    try {
      const t = await rpc('staff_person_link', { p_token: tok, p_person: p.id });
      p.has_link = true;
      window.open(waLink(p.phone, residentMsg(p) + '\n' + linkFor('r', t)), '_blank', 'noopener');
    } catch (e) { toast(e.message); }
  }

  // One tap per resident: each tap creates a fresh personal link and opens WhatsApp with it.
  function openSendAll() {
    const list = st.d.people.filter(p => p.status === 'no_answer' && p.phone);
    const { bd, close } = sheet(`<h2>שליחת קישורים (${list.length})</h2>
      <p class="muted">כל לחיצה פותחת וואטסאפ עם הקישור האישי. קישור קודם של אותו תושב מפסיק לעבוד.</p>
      <div class="list">${list.map(p => `<div class="row" style="cursor:default"><div class="main"><div class="name">${esc(fullName(p))}</div><div class="sub">${esc(p.phone)}</div></div>
        <button class="btn small primary" data-send="${p.id}">שליחה</button></div>`).join('')}</div>
      <button class="btn block" id="x" style="margin-top:12px">סגירה</button>`);
    bd.querySelectorAll('[data-send]').forEach(b => b.onclick = async () => { await sendLink(byId(b.dataset.send)); b.textContent = 'נשלח'; b.classList.remove('primary'); });
    bd.querySelector('#x').onclick = close;
  }

  function openPerson(id, isNew) {
    const p = isNew ? { id: null, first_name: '', last_name: '', phone: '', note: '', shelter_id: '', household_id: null } : byId(id);
    if (!p) return;
    const mates = p.household_id ? st.d.people.filter(o => o.household_id === p.household_id && o.id !== p.id) : [];
    const a = p.answer;
    const caseOpen = st.d.cases.find(c => c.person_id === p.id);
    const view = isNew ? '' : `
      <h2>${esc(fullName(p))}</h2> ${pill(p.status)}
      <dl class="kv"><dt>טלפון</dt><dd>${p.phone ? `<a href="tel:${esc(p.phone)}" style="direction:ltr;unicode-bidi:isolate">${esc(p.phone)}</a>` : 'אין'}</dd>
        <dt>מקלט</dt><dd>${esc(shelterName(p.shelter_id))}</dd>
        ${mates.length ? `<dt>משק בית</dt><dd>${mates.map(m => esc(fullName(m))).join(', ')}</dd>` : ''}
        ${p.note ? `<dt>הערה</dt><dd>${esc(p.note)}</dd>` : ''}
        ${a ? `<dt>תשובה</dt><dd>${esc(time(a.submitted_at))}${a.reported_by ? ' · דיווח: ' + esc(a.reported_by) : ''}</dd>
          ${a.location ? `<dt>מיקום</dt><dd>${LOC[a.location]}${a.location_other ? ' · ' + esc(a.location_other) : ''}</dd>` : ''}
          ${a.shelter_status ? `<dt>מיגון</dt><dd>${SHEL[a.shelter_status]}</dd>` : ''}
          ${a.wellbeing ? `<dt>הרגשה</dt><dd>${MOODS[a.wellbeing - 1].join(' ')}</dd>` : ''}
          ${a.household_count != null ? `<dt>נפשות</dt><dd>${a.household_count}</dd>` : ''}
          ${a.help_type !== 'none' ? `<dt>עזרה</dt><dd>${HELP[a.help_type]}${a.help_note ? ' · ' + esc(a.help_note) : ''}</dd>` : ''}` : ''}
      </dl>
      ${st.d.round ? `<div class="section-title">דיווח במקומו</div><div class="actions">
        <button class="btn small" data-rep="ok">בסדר, ביישוב</button>
        <button class="btn small" data-rep="away">מחוץ ליישוב</button>
        <button class="btn small" data-rep="unr">לא זמין</button>
        <button class="btn small" data-rep="help">צריך עזרה</button></div>` : ''}
      ${caseOpen ? `<p class="err" style="margin-top:12px">יש בקשת עזרה פתוחה. אפשר לסגור אותה במצב נוכחי.</p>` : ''}
      ${can() && p.phone ? `<div class="actions" style="margin-top:12px"><button class="btn primary" id="wa">שליחת קישור אישי בוואטסאפ</button></div>` : ''}`;
    const edit = can() ? `
      <details ${isNew ? 'open' : ''} style="margin-top:16px"><summary class="section-title" style="cursor:pointer">${isNew ? 'תושב/ת חדש/ה' : 'עריכת פרטים'}</summary>
      <form id="pf">
        <label class="f" for="pf1">שם פרטי</label><input id="pf1" required value="${esc(p.first_name)}" maxlength="60">
        <label class="f" for="pf2">שם משפחה</label><input id="pf2" value="${esc(p.last_name)}" maxlength="60">
        <label class="f" for="pf3">טלפון</label><input id="pf3" type="tel" inputmode="tel" value="${esc(p.phone)}" style="direction:ltr;text-align:right">
        <label class="f" for="pf4">מקלט</label><select id="pf4"><option value="">ללא מקלט</option>${st.d.shelters.map(s => `<option value="${s.id}" ${p.shelter_id === s.id ? 'selected' : ''}>${esc(s.name)}</option>`).join('')}</select>
        <label class="f" for="pf5">משק בית משותף עם</label><select id="pf5"><option value="">לבד</option>${st.d.people.filter(o => o.id !== p.id).map(o =>
          `<option value="${o.id}" ${mates[0]?.id === o.id ? 'selected' : ''}>${esc(o.last_name + ' ' + o.first_name)}</option>`).join('')}</select>
        <label class="f" for="pf6">הערה</label><textarea id="pf6" maxlength="500">${esc(p.note)}</textarea>
        ${isNew ? '' : '<label class="check"><input type="checkbox" id="pf7"> הסרה מהרשימה (עזב/ה את היישוב)</label>'}
        <button class="btn primary block" style="margin-top:14px">שמירה</button></form></details>` : '';
    const { bd, close } = sheet(view + edit + `<button class="btn block" id="x" style="margin-top:12px">סגירה</button>`);
    bd.querySelector('#x').onclick = close;
    const rep = { ok: { location: 'kibbutz', help_type: 'none' }, away: { location: 'other', help_type: 'none' }, unr: { outcome: 'unreachable' } };
    bd.querySelectorAll('[data-rep]').forEach(b => b.onclick = async () => {
      let payload = rep[b.dataset.rep];
      if (b.dataset.rep === 'help') { const n = prompt('במה צריך עזרה?'); if (n === null) return; payload = { location: 'kibbutz', help_type: 'other', help_note: n }; }
      try { await rpc('staff_report', { p_token: tok, p_person: p.id, p: payload }); toast('נשמר'); close(); await load(); } catch (e) { toast(e.message); }
    });
    const wa = bd.querySelector('#wa'); if (wa) wa.onclick = () => sendLink(p);
    const f = bd.querySelector('#pf');
    if (f) f.onsubmit = async e => {
      e.preventDefault();
      const v = id => bd.querySelector('#' + id);
      const body = { id: p.id, first_name: v('pf1').value, last_name: v('pf2').value, phone: v('pf3').value, shelter_id: v('pf4').value,
        household_with: v('pf5').value, note: v('pf6').value, archived: v('pf7')?.checked || false };
      if (!body.first_name.trim()) { toast('צריך שם פרטי'); return; }
      if (body.archived && !confirm('להסיר את התושב/ת מהרשימה? ההיסטוריה נשמרת.')) return;
      try { await rpc('staff_person_save', { p_token: tok, p: body }); toast('נשמר'); close(); await load(); } catch (er) { toast(er.message); }
    };
  }

  load();
}

// ---------- routing ----------
// Tokens arrive in the URL fragment, which browsers never send to any server.
(function start() {
  const h = new URLSearchParams(location.hash.slice(1));
  if (h.get('r')) return residentView(h.get('r'));
  if (h.get('s')) { try { localStorage.setItem(STAFF_KEY, h.get('s')); } catch (_) { /* private mode: token lives in the URL only */ } history.replaceState(null, '', location.pathname); return staffView(h.get('s')); }
  let saved = null; try { saved = localStorage.getItem(STAFF_KEY); } catch (_) { /* storage blocked */ }
  if (saved) return staffView(saved);
  $app.innerHTML = '<div class="card center"><p>הכניסה היא דרך הקישור האישי שקיבלתם.</p></div>';
})();
