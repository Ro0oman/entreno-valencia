import { META, BASE, sesionDe } from './plan.js';

/* ---------- API ---------- */
const TK = 'entreno:token';
let token = localStorage.getItem(TK);

async function api(ruta, opts = {}) {
  const res = await fetch('/api' + ruta, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: 'Bearer ' + token } : {}),
      ...(opts.headers || {})
    }
  });
  if (res.status === 401) { localStorage.removeItem(TK); token = null; puerta(); throw new Error('401'); }
  const cuerpo = await res.json();
  if (!res.ok) throw new Error(cuerpo.error || 'Error');
  return cuerpo;
}

let LOGS = [];

/* ---------- Utilidades ---------- */
const iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const hoy = () => iso(new Date());
const mas = (s, n) => { const d = new Date(s + 'T00:00:00'); d.setDate(d.getDate() + n); return iso(d); };
const DIAS = ['DOMINGO', 'LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO'];
const aSeg = p => { const m = /^(\d{1,2})[:.](\d{1,2})$/.exec((p || '').trim()); return m ? +m[1] * 60 + +m[2] : null; };
const aRitmo = s => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, '0')}`;
const diasRestantes = () => Math.max(0, Math.ceil((META - new Date(hoy() + 'T00:00:00')) / 864e5));
const $ = id => document.getElementById(id);
const esc = t => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const CORNERS = '<i class="c tl"></i><i class="c tr"></i><i class="c bl"></i><i class="c br"></i>';

/* Nº de semana de la fase base al que pertenece una fecha */
function semanaDe(f) {
  for (let i = 0; i < BASE.length; i++) {
    if (f >= BASE[i].lunes && f <= mas(BASE[i].lunes, 6)) return i + 1;
  }
  return null;
}

/* ---------- FIRMA: el medidor de pulso (escala 120 → 210) ---------- */
const PMIN = 120, PMAX = 210;
const pct = b => ((b - PMIN) / (PMAX - PMIN)) * 100;
const HR = {
  facil: { name: 'RODAJE FÁCIL', band: [148, 158], dash: null, val: '148–158' },
  larga: { name: 'TIRADA LARGA', band: [150, 158], dash: [158, 165], val: '150–158 <small>→ 165</small>' }
};

function pulseMeter(hrKey, avg) {
  const cfg = HR[hrKey];
  if (!cfg) return '';
  const bL = pct(cfg.band[0]), bW = pct(cfg.band[1]) - pct(cfg.band[0]);
  const head = (avg != null)
    ? `<span class="lab">${cfg.name} · ${cfg.band[0]}–${cfg.band[1]}</span>
       <span class="avg">tu media <b>${avg}</b> ✓</span>`
    : `<span class="lab">PULSO OBJETIVO</span><span class="val">${cfg.val}</span>`;
  const dash = (avg == null && cfg.dash)
    ? `<div class="dash" style="left:${pct(cfg.dash[0])}%;width:${pct(cfg.dash[1]) - pct(cfg.dash[0])}%"></div>` : '';
  const dot = (avg != null) ? `<div class="dot" style="left:${pct(avg)}%"></div>` : '';
  return `<div class="pulse bp">${CORNERS}
    <div class="pulse-head">${head}</div>
    <div class="track">
      <div class="base"></div>
      <div class="band ${avg != null ? 'soft' : ''}" style="left:${bL}%;width:${bW}%"></div>
      ${dash}
      <div class="ceil" style="left:${pct(162)}%"></div>
      <div class="ceil-lbl" style="left:${pct(162)}%">▼ TECHO 162</div>
      ${dot}
    </div>
    <div class="scale">
      <span style="left:${pct(130)}%">130</span>
      <span style="left:${pct(184)}%">184</span>
      <span style="left:${pct(206)}%">206</span>
    </div>
  </div>`;
}

/* ---------- Notas ---------- */
const NOTELAB = { '': 'NOTA', warn: '△ CUIDADO', stop: '⊘ NO<br>NEGOCIABLE' };
const notasHTML = notes => !notes ? '' :
  `<div class="notes">${notes.map(n => {
    const lv = n[1] || '';
    return `<div class="note ${lv}"><span class="nlab">${NOTELAB[lv]}</span><p>${esc(n[0])}</p></div>`;
  }).join('')}</div>`;

/* Lista de pasos con etiqueta (pliometría / circuito de barras) */
const listaHTML = (titulo, items) => !items || !items.length ? '' :
  `<div class="block-lab">${esc(titulo)}</div><div class="steps">${
    items.map(it => `<div><span class="g">›</span>${esc(it)}</div>`).join('')}</div>`;

/* Envuelve el "N km" final del título en un span apagado */
const tituloHTML = t => esc(t).replace(/(\d+[.,]?\d*\s*km)\s*$/i, '<span class="dim">$1</span>');

const QUOTE = 'El ritmo es una consecuencia, no un objetivo.';

/* ---------- Vista HOY ---------- */
function pintarHoy() {
  const f = hoy();
  const d = new Date(f + 'T00:00:00');
  const s = sesionDe(f);
  const ya = LOGS.find(l => l.date === f);
  const dias = diasRestantes();
  const race = f === '2026-12-06';

  $('app').classList.toggle('race', race);

  if (race) { $('vHoy').innerHTML = raceView(s, dias); return; }
  if (s.kind === 'descanso') { $('vHoy').innerHTML = restView(s, d); return; }

  const diaKicker = `HOY · ${DIAS[d.getDay()]}`;
  const rightTag = ya
    ? '<span class="tag tag-dark">✓ HECHA</span>'
    : (s.kind === 'fuerza' || s.kind === 'parque') ? '<span class="tag tag-neutral">SIN CORRER</span>' : '';

  const n = semanaDe(f);
  const tagsRow = s.kind === 'larga'
    ? `<div class="tags"><span class="tag tag-dark">LA SESIÓN SAGRADA</span>${n ? `<span class="tag tag-outline">FASE BASE · S${n}</span>` : ''}</div>`
    : '';

  /* cuerpo + cita */
  let body = s.sub || '';
  let quote = '';
  if (s.hr) { quote = QUOTE; body = body.replace(QUOTE, '').replace(/\s+/g, ' ').trim(); }

  /* fuerza: caja "sin pulso" + lista de pliometría */
  let fuerzaBlock = '';
  if (s.kind === 'fuerza') {
    fuerzaBlock = `<div class="nopulse bp">${CORNERS}
      <span class="heart">♥</span>
      <div><div class="t">SIN PULSO OBJETIVO</div><div class="d">Hoy manda el RPE, no la FC.</div></div>
    </div>`;
    const m = /Pliometría antes de levantar:\s*(.+)$/.exec(s.sub || '');
    if (m) {
      const items = [];
      m[1].split(' · ').map(x => x.trim()).filter(Boolean).forEach(it => {
        // "6-8 min" y similares son la duración total: se pegan al último ejercicio
        if (/^[\d–-]+\s*min$/i.test(it) && items.length) items[items.length - 1] += ' · ' + it;
        else items.push(it);
      });
      body = 'Pliometría antes de levantar:';
      fuerzaBlock += `<p class="body">${esc(body)}</p><div class="steps">${
        items.map(it => `<div><span class="g">›</span>${esc(it)}</div>`).join('')}</div>`;
      body = '';
    }
  }

  /* parque: caja "sin pulso" + pliometría en césped + circuito de barras */
  let parqueBlock = '';
  if (s.kind === 'parque') {
    parqueBlock = `<div class="nopulse bp">${CORNERS}
      <span class="heart">♥</span>
      <div><div class="t">SIN PULSO OBJETIVO</div><div class="d">Día de fuerza y salto. Manda el RPE.</div></div>
    </div>`
      + (s.sub ? `<p class="body">${esc(s.sub)}</p>` : '')
      + listaHTML('Pliometría · en el césped', s.plio)
      + listaHTML('Circuito de barras', s.bloques);
    body = '';
  }

  /* registro */
  const regDone = ya ? `<div class="reg-done bp">${CORNERS}
    <div class="reg-head"><span class="lab">SESIÓN REGISTRADA</span>
      <button class="edit" id="bEdit">editar</button></div>
    <div class="reg-cells">
      <div class="reg-cell"><div class="v">${String(ya.km).replace('.', ',')}</div><div class="k">KM</div></div>
      <div class="reg-sep"></div>
      <div class="reg-cell"><div class="v">${ya.hr}</div><div class="k">FC MEDIA · PPM</div></div>
      <div class="reg-sep"></div>
      <div class="reg-cell"><div class="v">${aRitmo(ya.pace)}</div><div class="k">MIN/KM</div></div>
    </div>
  </div>` : '';

  const pulso = s.hr ? pulseMeter(s.hr, ya ? ya.hr : null) : '';

  const regArea = s.km ? `<div class="reg-area">
    ${ya ? '' : `<button class="reg-btn" id="bReg"><span class="plus">＋</span> REGISTRAR LA SESIÓN</button>`}
    ${regForm(s, ya, ya ? true : false)}
  </div>` : '';

  $('vHoy').innerHTML = `<div class="hoy">
    <div class="watermark"><div class="big">${dias}</div><div class="lbl">DÍAS A VALENCIA</div></div>
    <div class="kickrow"><span class="kicker">${diaKicker}</span>${rightTag}</div>
    <h1 class="title">${tituloHTML(s.t)}</h1>
    ${tagsRow}
    ${regDone}
    ${pulso}
    ${fuerzaBlock}
    ${parqueBlock}
    ${body ? `<p class="body">${esc(body)}</p>` : ''}
    ${quote ? `<p class="quote">"${quote}"</p>` : ''}
    ${notasHTML(s.notes)}
    ${regArea}
  </div>`;

  wireRegistro(s, ya);
}

function regForm(s, ya, hidden) {
  const ph = typeof s.km === 'number' ? s.km : '—';
  return `<div class="regform" id="regForm" ${hidden ? 'hidden' : ''}>
    <div class="field"><label>km</label>
      <input id="iKm" class="input" inputmode="decimal" value="${ya ? String(ya.km).replace('.', ',') : ''}" placeholder="${ph}"></div>
    <div class="field"><label>FC media · ppm</label>
      <input id="iHr" class="input" inputmode="numeric" value="${ya ? ya.hr : ''}" placeholder="155"></div>
    <div class="field"><label>Ritmo · min/km</label>
      <input id="iPace" class="input" inputmode="text" value="${ya ? aRitmo(ya.pace) : ''}" placeholder="6:45"></div>
    <div id="regmsg"></div>
    <button class="btn-primary" id="bSave">GUARDAR SESIÓN</button>
  </div>`;
}

function wireRegistro(s, ya) {
  const abrir = () => {
    const btn = $('bReg'); if (btn) btn.hidden = true;
    const form = $('regForm'); if (form) { form.hidden = false; $('iKm').focus(); }
  };
  if ($('bReg')) $('bReg').onclick = abrir;
  if ($('bEdit')) $('bEdit').onclick = abrir;

  const b = $('bSave');
  if (!b) return;
  b.onclick = async () => {
    const msg = $('regmsg');
    const km = parseFloat(($('iKm').value || '').replace(',', '.'));
    const hr = parseInt($('iHr').value, 10);
    const pace = aSeg($('iPace').value);
    if (!km || !hr || !pace) {
      msg.innerHTML = `<div class="err"><span class="bang">!</span><p>Faltan km, FC media o ritmo (formato 6:45).</p></div>`;
      return;
    }
    b.disabled = true;
    try {
      const guardada = await api('/sesiones', { method: 'POST', body: JSON.stringify({ date: hoy(), km, hr, pace }) });
      LOGS = LOGS.filter(l => l.date !== guardada.date).concat(guardada).sort((a, b) => a.date.localeCompare(b.date));
      msg.innerHTML = `<div class="ok"><span class="sq"></span><b>GUARDADO.</b></div>`;
      setTimeout(pintarHoy, 650);
    } catch (e) {
      msg.innerHTML = `<div class="err"><span class="bang">!</span><p>${esc(e.message)}</p></div>`;
      b.disabled = false;
    }
  };
}

function restView(s, d) {
  const icon = /Londres/i.test(s.t) ? '✈' : 'Z';
  return `<div class="hoy rest">
    <span class="kicker">HOY · ${DIAS[d.getDay()]}</span>
    <div class="rest-center">
      <div class="rest-icon">${icon}</div>
      <h1 class="rest-title">${esc(s.t)}</h1>
      <p class="rest-body">${esc(s.sub || '')}</p>
    </div>
  </div>`;
}

function raceView(s, dias) {
  return `<div class="hoy race-hoy">
    <div class="watermark"><div class="big">0</div></div>
    <span class="kicker">6 DIC 2026 · EL DÍA</span>
    <h1 class="race-title">MARATÓN<br>VALENCIA</h1>
    <div class="race-dist"><span class="big">42,195 km</span><span class="small">a 5:41/km</span></div>
    <p class="race-sub">Hoy no se entrena, hoy se cobra.</p>
    ${notasHTML(s.notes)}
    <div style="flex:1"></div>
  </div>`;
}

/* ---------- Vista PROGRESO ---------- */
function pintarProg() {
  const semanas = Math.ceil(diasRestantes() / 7);
  const aero = LOGS.filter(l => l.hr >= 148 && l.hr <= 162);
  const ritmoAct = aero.length ? aRitmo(aero.at(-1).pace) : '—';
  const totalKm = Math.round(LOGS.reduce((s, l) => s + l.km, 0));

  /* curva de ritmo a pulso aeróbico */
  let curva;
  if (aero.length >= 2) {
    const p = aero.map(a => a.pace);
    const mx = Math.max(...p), mn = Math.min(...p);
    const rango = Math.max(mx - mn, 30);
    const n = aero.length;
    const pts = aero.map((a, i) => {
      const x = 30 + (i / (n - 1)) * 295;
      const y = 25 + ((a.pace - mn) / rango) * 95;   // más lento = más abajo
      return [Math.round(x), Math.round(y)];
    });
    const poly = pts.map(q => q.join(',')).join(' ');
    const dots = pts.map((q, i) => i === n - 1
      ? `<circle cx="${q[0]}" cy="${q[1]}" r="5" fill="#1d2d3d"></circle>`
      : `<circle cx="${q[0]}" cy="${q[1]}" r="4" fill="#f2f2f3" stroke="#5980a6" stroke-width="2"></circle>`).join('');
    curva = `<svg viewBox="0 0 342 150">
      <line x1="0" y1="24" x2="342" y2="24" stroke="#e7e7ea"></line>
      <line x1="0" y1="72" x2="342" y2="72" stroke="#e7e7ea"></line>
      <line x1="0" y1="120" x2="342" y2="120" stroke="#e7e7ea"></line>
      <polyline points="${poly}" fill="none" stroke="#5980a6" stroke-width="2"></polyline>
      ${dots}
      <text x="${pts[0][0]}" y="${pts[0][1] - 9}" fill="#5d5d60" font-family="Barlow Condensed" font-weight="600" font-size="12" text-anchor="middle">${aRitmo(aero[0].pace)}</text>
      <text x="${pts[n - 1][0]}" y="${pts[n - 1][1] - 9}" fill="#1d2d3d" font-family="Barlow Condensed" font-weight="600" font-size="13" text-anchor="middle">${aRitmo(aero.at(-1).pace)}</text>
    </svg>`;
  } else {
    curva = `<div class="empty">Aún no hay sesiones a 148–162 ppm.<br>Registra un rodaje y esta curva empieza a existir.</div>`;
  }

  /* km por semana */
  const MAXM = 42;
  const bars = BASE.map((w, i) => {
    const real = LOGS.filter(l => l.date >= w.lunes && l.date <= mas(w.lunes, 6)).reduce((s, l) => s + l.km, 0);
    const over = real > w.total * 1.1;
    const metaH = Math.round((w.total / MAXM) * 120);
    const fillH = Math.round(Math.min(real / MAXM, 1) * 120);
    return `<div class="bar">
      <div class="col">
        <div class="meta" style="height:${metaH}px"></div>
        <div class="fill ${over ? 'over' : ''}" style="height:${fillH}px"></div>
      </div>
      <div class="lb">S${i + 1}</div>
    </div>`;
  }).join('');

  $('vProg').innerHTML = `<div class="prog">
    <h2>Progreso</h2>
    <p class="tagline">Camino al sub-4h · 5:41/km</p>

    <div class="stats">
      <div class="stat"><div class="v">${semanas}</div><div class="k">semanas restantes</div></div>
      <div class="stat"><div class="v">${ritmoAct}${ritmoAct !== '—' ? '<small>/km</small>' : ''}</div><div class="k">último ritmo a 148–162</div></div>
      <div class="stat"><div class="v">${totalKm}</div><div class="k">km registrados</div></div>
      <div class="stat dark"><div class="v">3:56</div><div class="k">lo que predice tu 10K</div></div>
    </div>

    <div class="pgrp">
      <h4>Ritmo a 148–162 ppm</h4>
      <p class="hint">La única curva que decide el sub-4h. Mismo pulso, más rápido. Julio a 7:15 es correcto; octubre a 6:25 es la adaptación.</p>
      <div class="chart bp">${CORNERS}${curva}</div>
    </div>

    <div class="pgrp">
      <h4>Km por semana · fase base</h4>
      <p class="hint">La barra hueca es lo previsto. Lo lleno, lo hecho. <b>Pasarse también es un fallo.</b></p>
      <div class="bars bp">${CORNERS}
        <div class="barrow">${bars}</div>
        <div class="legend">
          <span><i style="background:var(--accent500)"></i>HECHO</span>
          <span><i style="background:var(--ink)"></i>PASADO DE ROSCA</span>
          <span><i style="border:1px dashed var(--accent)"></i>META S5: 42 KM</span>
        </div>
      </div>
    </div>

    <div class="pgrp">
      <h4>Qué se espera de aquí a diciembre</h4>
      <div class="road">
        <div class="item"><span class="dot"></span><div class="d">16 AGO</div><p>Cerrar la base: 42 km/semana y tirada de 16 km.</p></div>
        <div class="item"><span class="dot"></span><div class="d">17 AGO</div><p>Cargar el plan COROS de maratón, 16 semanas.</p></div>
        <div class="item"><span class="dot"></span><div class="d">OCTUBRE</div><p>Zapa de placa comprada y rodada 50–60 km. Pisar tramos reales del recorrido.</p></div>
        <div class="item last"><span class="dot"></span><div class="d">6 DIC</div><p>42,195 km a 5:41/km.</p></div>
      </div>
    </div>

    <div class="summary bp">${CORNERS}
      <p>Tu 10K predice <b>3:56</b> y tu media <b>4:14</b>. Esos 18 minutos son déficit de resistencia, no de velocidad. <b>Se cierran con kilómetros.</b></p>
    </div>
  </div>`;
}

/* ---------- Navegación ---------- */
function ir(tab) {
  const h = tab === 'hoy';
  $('tHoy').setAttribute('aria-selected', h);
  $('tProg').setAttribute('aria-selected', !h);
  $('vHoy').hidden = !h;
  $('vProg').hidden = h;
  h ? pintarHoy() : pintarProg();
}

/* ---------- Puerta / PIN ---------- */
let pinBuf = '';

function pintarPin() {
  const n = Math.max(4, pinBuf.length);
  let html = '';
  for (let i = 0; i < n; i++) html += `<i class="${i < pinBuf.length ? 'on' : 'off'}"></i>`;
  $('pinDots').innerHTML = html;
}

function puerta() {
  $('app').hidden = true;
  $('puerta').hidden = false;
  pinBuf = '';
  pintarPin();
}

async function entrar() {
  const msg = $('msgPin');
  try {
    const r = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin: pinBuf })
    });
    if (!r.ok) throw new Error('PIN incorrecto');
    const { token: t } = await r.json();
    localStorage.setItem(TK, t);
    token = t;
    await arrancar();
  } catch (e) {
    msg.textContent = e.message;
    pinBuf = '';
    pintarPin();
  }
}

/* ---------- Arranque ---------- */
async function arrancar() {
  if (!token) return puerta();
  try {
    LOGS = await api('/sesiones');
  } catch { return; }
  $('puerta').hidden = true;
  $('app').hidden = false;
  $('dleft').textContent = diasRestantes();
  ir('hoy');
}

/* Reloj de la puerta */
setInterval(() => {
  const c = $('clock');
  if (c && !$('puerta').hidden) {
    const d = new Date();
    c.textContent = `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
  }
}, 1000);

$('keypad').addEventListener('click', e => {
  const k = e.target.closest('button')?.dataset.k;
  if (!k) return;
  $('msgPin').textContent = '';
  if (k === 'del') pinBuf = pinBuf.slice(0, -1);
  else if (pinBuf.length < 12) pinBuf += k;
  pintarPin();
});
window.addEventListener('keydown', e => {
  if ($('puerta').hidden) return;
  if (/^[0-9]$/.test(e.key)) { if (pinBuf.length < 12) pinBuf += e.key; $('msgPin').textContent = ''; pintarPin(); }
  else if (e.key === 'Backspace') { pinBuf = pinBuf.slice(0, -1); pintarPin(); }
  else if (e.key === 'Enter') entrar();
});

$('bEntrar').onclick = entrar;
$('tHoy').onclick = () => ir('hoy');
$('tProg').onclick = () => ir('prog');

arrancar();
