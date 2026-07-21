import { META, BASE, INICIO_COROS, sesionDe } from './plan.js?v=3';

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

/* Enlace de demostración por ejercicio: si tiene .video, ese; si no, una búsqueda
   en YouTube generada del nombre. Cubre todo (incluidos drills) sin API ni dependencia. */
function videoUrl(e) {
  if (e.video) return e.video;
  const q = encodeURIComponent(e.ej.replace(/\(.*?\)/g, '').trim() + ' técnica ejercicio');
  return `https://www.youtube.com/results?search_query=${q}`;
}

/* Acordeón de bloques (fuerza / pliometría / barras): cada grupo es una caja
   clicable que despliega sus ejercicios con dosis (series × repes), nota y
   un enlace ▷ a la demostración. `abrirPrimera`: si abre la primera caja de salida. */
function acordeonHTML(grupos, abrirPrimera = true) {
  if (!grupos || !grupos.length) return '';
  return `<div class="acc">${grupos.map((g, i) => {
    const open = abrirPrimera && i === 0;
    const filas = g.ej.map(e => `<div class="acc-ex">
        <div class="acc-ex-top">
          <span class="acc-ex-n">${esc(e.ej)}<a class="acc-ex-v" href="${esc(videoUrl(e))}" target="_blank" rel="noopener" title="Ver demostración">▷</a></span>
          <span class="acc-ex-d">${esc(e.dosis || '')}</span>
        </div>
        ${e.nota ? `<div class="acc-ex-note">${esc(e.nota)}</div>` : ''}
      </div>`).join('');
    return `<div class="acc-item bp${open ? ' open' : ''}">${CORNERS}
      <button class="acc-head" type="button" aria-expanded="${open}">
        <span class="acc-tt"><span class="acc-chev">▸</span><span class="acc-t">${esc(g.t)}</span>${g.st ? `<span class="acc-st">${esc(g.st)}</span>` : ''}</span>
        <span class="acc-count">${g.ej.length} EJ</span>
      </button>
      <div class="acc-body">${filas}</div>
    </div>`;
  }).join('')}</div>`;
}

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

  /* Días sin pulso (fuerza / parque): caja "sin pulso" antes del acordeón */
  const sinPulso = (s.kind === 'fuerza' || s.kind === 'parque')
    ? `<div class="nopulse bp">${CORNERS}
      <span class="heart">♥</span>
      <div><div class="t">SIN PULSO OBJETIVO</div><div class="d">Hoy manda el RPE, no la FC.</div></div>
    </div>` : '';

  /* Acordeón de ejercicios. En días de correr (con pulso) arranca plegado para
     no tapar la sesión de carrera; en días de fuerza/parque, la primera abierta. */
  const acordeon = acordeonHTML(s.grupos, !s.hr);

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
    ${ya.notas ? `<div class="reg-notas">${esc(ya.notas)}</div>` : ''}
  </div>` : '';

  const pulso = s.hr ? pulseMeter(s.hr, ya ? ya.hr : null) : '';

  const regArea = s.km ? `<div class="reg-area">
    ${ya ? '' : `<button class="reg-btn" id="bReg"><span class="plus">＋</span> REGISTRAR LA SESIÓN</button>`}
    ${regForm(s, ya, ya ? true : false)}
  </div>` : '';

  /* Análisis del .fit. Si la sesión ya tiene análisis guardado, se repinta
     entero sin reimportar; el botón sirve para subir otro fichero. */
  const fitArea = s.km ? `<div class="fit-area">
    <button class="fit-btn" id="bFit"><span class="fit-ic">⤢</span> ${ya?.analisis ? 'ANALIZAR OTRO .FIT' : 'ANALIZAR EL .FIT DEL RELOJ'}</button>
    <input type="file" id="fitInput" accept=".fit" hidden>
    <div id="fitOut">${ya?.analisis ? analisisHTML(ya.analisis, false) : ''}</div>
  </div>` : '';

  $('vHoy').innerHTML = `<div class="hoy">
    <div class="watermark"><div class="big">${dias}</div><div class="lbl">DÍAS A VALENCIA</div></div>
    <div class="kickrow"><span class="kicker">${diaKicker}</span>${rightTag}</div>
    <h1 class="title">${tituloHTML(s.t)}</h1>
    ${tagsRow}
    ${regDone}
    ${pulso}
    ${sinPulso}
    ${body ? `<p class="body">${esc(body)}</p>` : ''}
    ${quote ? `<p class="quote">"${quote}"</p>` : ''}
    ${acordeon}
    ${notasHTML(s.notes)}
    ${fitArea}
    ${regArea}
  </div>`;

  wireRegistro(s, ya);
  wireAcordeon();
  wireFit();
}

/* ---------- Análisis del .fit ---------- */
function wireFit() {
  const btn = $('bFit'), inp = $('fitInput'), out = $('fitOut');
  if (!btn || !inp) return;
  btn.onclick = () => inp.click();
  inp.onchange = async () => {
    const file = inp.files[0];
    if (!file) return;
    out.innerHTML = `<div class="fit-load">Leyendo ${esc(file.name)}…</div>`;
    try {
      const buf = await file.arrayBuffer();
      const res = await fetch('/api/analizar-fit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/octet-stream', Authorization: 'Bearer ' + token },
        body: buf
      });
      if (res.status === 401) { localStorage.removeItem(TK); token = null; puerta(); return; }
      const a = await res.json();
      if (!res.ok) throw new Error(a.error || 'Error');
      out.innerHTML = analisisHTML(a);
      wireFitSave(a);
    } catch (e) {
      out.innerHTML = `<div class="err"><span class="bang">!</span><p>${esc(e.message)}</p></div>`;
    }
    inp.value = '';
  };
}

/* Guarda la sesión con los datos reales del .fit — el .fit manda sobre lo tecleado. */
function wireFitSave(a) {
  const b = $('bFitSave');
  if (!b) return;
  b.onclick = async () => {
    const msg = $('fitSaveMsg');
    b.disabled = true;
    try {
      const guardada = await api('/sesiones', {
        method: 'POST',
        body: JSON.stringify({
          date: a.fecha, km: a.km, hr: a.hrAvg, pace: a.paceAvg,
          deriva: a.deriva?.pct, cad: a.cadAvg, hrMax: a.hrMax, techoPct: a.zonas?.techo,
          analisis: a   // se persiste entero para reabrirlo sin reimportar
        })
      });
      LOGS = LOGS.filter(l => l.date !== guardada.date).concat(guardada).sort((x, y) => x.date.localeCompare(y.date));
      msg.innerHTML = `<div class="ok"><span class="sq"></span><b>GUARDADO CON LOS DATOS DEL .FIT.</b></div>`;
      setTimeout(pintarHoy, 850);
    } catch (e) {
      msg.innerHTML = `<div class="err"><span class="bang">!</span><p>${esc(e.message)}</p></div>`;
      b.disabled = false;
    }
  };
}

/* Nota de la sesión (0-100). No mide velocidad: mide CONTROL. Los pesos
   cambian según el tipo de sesión del plan (un fácil y una larga no se juzgan
   igual). Devuelve la nota, el desglose por componente y un veredicto. */
function puntuar(a) {
  const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));
  const ses = sesionDe(a.fecha);
  const kind = ses?.kind;
  const plan = typeof ses?.km === 'number' ? ses.km : null;
  const techoPct = a.zonas?.techo ?? 0;
  const pct = a.deriva?.pct;
  const cumpl = plan ? 1 - clamp(Math.abs(a.km / plan - 1), 0, 1) : 1;
  const cumplTxt = plan ? `${String(a.km).replace('.', ',')} de ${plan} km previstos` : 'sesión sin objetivo de km';

  let comps;
  if (kind === 'larga') {
    // En la larga la deriva y el km mandan; el pulso alto al final se tolera.
    comps = [
      { k: 'Control de pulso', max: 25, pts: 25 * (1 - clamp((techoPct - 20) / 60, 0, 1)), txt: `${techoPct}% sobre 162 (en larga se tolera algo)` },
      { k: 'Desacople aeróbico', max: 40, pts: pct == null ? 40 : 40 * clamp(1 - (pct - 8) / 12, 0, 1), txt: pct == null ? '—' : `+${pct}% de pérdida de eficiencia` },
      { k: 'Cumplimiento', max: 35, pts: 35 * cumpl, txt: cumplTxt }
    ];
  } else {
    // Rodaje fácil (y por defecto): el control del pulso es lo que más pesa.
    comps = [
      { k: 'Control de pulso', max: 50, pts: 50 * (1 - clamp(techoPct / 100, 0, 1)), txt: `${techoPct}% del tiempo sobre el techo 162` },
      { k: 'Desacople aeróbico', max: 30, pts: pct == null ? 30 : 30 * clamp(1 - (pct - 5) / 10, 0, 1), txt: pct == null ? '—' : `+${pct}% de pérdida de eficiencia` },
      { k: 'Cumplimiento', max: 20, pts: 20 * cumpl, txt: cumplTxt }
    ];
  }

  const nota = Math.round(comps.reduce((s, c) => s + c.pts, 0));
  const fuga = comps.slice().sort((x, y) => (y.max - y.pts) - (x.max - x.pts))[0];
  const banda = nota >= 85 ? 'Sesión de manual' : nota >= 70 ? 'Sólida' : nota >= 55 ? 'Correcta, con un pero' : 'Para revisar';
  const motivo = { 'Control de pulso': 'se te fue de pulso', 'Desacople aeróbico': 'perdiste eficiencia en la 2ª mitad', 'Cumplimiento': 'faltó volumen' }[fuga.k];
  const veredicto = (fuga.max - fuga.pts) < fuga.max * 0.15 ? `${banda}.` : `${banda} — ${motivo}.`;
  return { nota, veredicto, comps: comps.map(c => ({ ...c, pts: Math.round(c.pts) })) };
}

/* Construye el desglose visual a partir del JSON del análisis.
   `guardar`: muestra el botón de guardar (false al repintar lo ya persistido). */
function analisisHTML(a, guardar = true) {
  const rit = v => v ? aRitmo(v) : '—';
  const d = a.deriva;
  const dCls = d.pct == null ? '' : d.pct < 5 ? 'ok' : d.pct <= 8 ? 'warn' : 'hi';
  const dTxt = d.pct == null ? 'sin datos suficientes'
    : d.pct < 5 ? 'bajo — aguantaste la eficiencia'
    : d.pct <= 8 ? 'moderado — vigila calor y fatiga'
    : 'alto — perdiste eficiencia en la 2ª mitad';
  const z = a.zonas, U = a.umbrales;
  const seg = (w, cls) => w > 0 ? `<div class="an-seg ${cls}" style="flex:${w}" title="${w}%"></div>` : '';
  const splitRows = a.splits.map(s => {
    const gapDif = s.gapSec != null && Math.abs(s.gapSec - s.paceSec) >= 3;
    return `<div class="an-row${s.techo ? ' techo' : ''}">
      <span class="an-km">km ${s.km}</span>
      <span class="an-pace">${rit(s.paceSec)}<small>/km</small>${gapDif ? `<span class="an-gap">GAP ${rit(s.gapSec)}</span>` : ''}</span>
      <span class="an-hr">${s.hr ?? '—'}<small>ppm</small></span>
    </div>`;
  }).join('');

  const p = puntuar(a);
  const scoreBlock = `<div class="an-score bp">${CORNERS}
      <div class="an-score-head">
        <div class="an-nota"><span class="n">${p.nota}</span><span class="d">/100</span></div>
        <div class="an-score-v"><div class="an-score-lab">NOTA DE LA SESIÓN</div><p>${esc(p.veredicto)}</p></div>
      </div>
      <div class="an-score-comps">
        ${p.comps.map(c => `<div class="an-comp">
          <div class="an-comp-top"><span class="an-comp-k">${esc(c.k)}</span><span class="an-comp-p">${c.pts}<small>/${c.max}</small></span></div>
          <div class="an-comp-bar"><div style="width:${Math.round(c.pts / c.max * 100)}%"></div></div>
          <div class="an-comp-t">${esc(c.txt)}</div>
        </div>`).join('')}
      </div>
    </div>`;

  return `<div class="an">
    ${scoreBlock}
    <div class="an-card bp">${CORNERS}
      <div class="an-lab">ANÁLISIS DEL .FIT</div>
      <div class="an-grid">
        <div class="an-cell"><div class="v">${String(a.km).replace('.', ',')}</div><div class="k">KM</div></div>
        <div class="an-cell"><div class="v">${a.durMin}<small>′</small></div><div class="k">DURACIÓN</div></div>
        <div class="an-cell"><div class="v">${a.hrAvg ?? '—'}</div><div class="k">FC MEDIA</div></div>
        <div class="an-cell"><div class="v">${a.hrMax ?? '—'}</div><div class="k">FC MÁX</div></div>
        <div class="an-cell"><div class="v">${rit(a.paceAvg)}</div><div class="k">RITMO</div></div>
        <div class="an-cell"><div class="v">${a.cadAvg ?? '—'}</div><div class="k">CADENCIA</div></div>
      </div>
    </div>

    ${guardar ? `<div class="an-save-row">
      <button class="btn-primary an-save" id="bFitSave">GUARDAR COMO SESIÓN · DATOS DEL .FIT</button>
      <p class="an-save-hint">Sustituye lo registrado a mano por lo real del fichero. Fin del doble número.</p>
      <div id="fitSaveMsg" aria-live="polite"></div>
    </div>` : ''}

    <div class="an-blk">
      <h4>Desacople aeróbico</h4>
      <p class="an-hint">Compara la eficiencia (ritmo por pulsación) de la 1ª vs la 2ª mitad, descartando el calentamiento. Menos del 5% = mantuviste el motor.</p>
      <div class="an-deriva bp ${dCls}">${CORNERS}
        <div class="an-half"><span class="hl">1ª MITAD</span><b>${d.hr1 ?? '—'}</b><small>ppm · ${rit(d.pace1)}</small></div>
        <div class="an-arrow">→</div>
        <div class="an-half"><span class="hl">2ª MITAD</span><b>${d.hr2 ?? '—'}</b><small>ppm · ${rit(d.pace2)}</small></div>
        <div class="an-pct"><span class="p">${d.pct == null ? '—' : (d.pct > 0 ? '+' : '') + d.pct + '%'}</span><span class="t">${dTxt}</span></div>
      </div>
    </div>

    <div class="an-blk">
      <h4>Tiempo en zonas de pulso</h4>
      <p class="an-hint">Sobre tus umbrales: fácil ${U.facil[0]}–${U.facil[1]} ppm, techo ${U.techo}.</p>
      <div class="an-bar bp">${CORNERS}
        <div class="an-track">${seg(z.bajo, 'z0')}${seg(z.facil, 'z1')}${seg(z.alto, 'z2')}${seg(z.techo, 'z3')}</div>
        <div class="an-leg">
          <span><i class="z0"></i>&lt;${U.facil[0]} · ${z.bajo}%</span>
          <span><i class="z1"></i>fácil · ${z.facil}%</span>
          <span><i class="z2"></i>${U.facil[1] + 1}–${U.techo} · ${z.alto}%</span>
          <span><i class="z3"></i>&gt;${U.techo} techo · ${z.techo}%</span>
        </div>
      </div>
    </div>

    <div class="an-blk">
      <h4>Splits por km</h4>
      ${a.gain >= 10 ? `<p class="an-hint">Desnivel +${a.gain} m · GAP = ritmo equivalente en llano, sin el efecto de las cuestas.</p>` : ''}
      <div class="an-splits bp">${CORNERS}${splitRows}</div>
    </div>
  </div>`;
}

/* Despliega/pliega cada caja del acordeón. La altura se mide en vivo
   (scrollHeight) en vez de un tope fijo, así ninguna lista se recorta. */
function wireAcordeon() {
  document.querySelectorAll('.acc-item.open > .acc-body').forEach(b => { b.style.maxHeight = b.scrollHeight + 'px'; });
  document.querySelectorAll('.acc-head').forEach(h => {
    h.onclick = () => {
      const item = h.closest('.acc-item');
      const body = item.querySelector('.acc-body');
      const open = item.classList.toggle('open');
      h.setAttribute('aria-expanded', open);
      body.style.maxHeight = open ? body.scrollHeight + 'px' : '0px';
    };
  });
}

function regForm(s, ya, hidden) {
  const ph = typeof s.km === 'number' ? s.km : '—';
  return `<div class="regform" id="regForm" ${hidden ? 'hidden' : ''}>
    <div class="field"><label for="iKm">km</label>
      <input id="iKm" class="input" inputmode="decimal" value="${ya ? String(ya.km).replace('.', ',') : ''}" placeholder="${ph}"></div>
    <div class="field"><label for="iHr">FC media · ppm</label>
      <input id="iHr" class="input" inputmode="numeric" value="${ya ? ya.hr : ''}" placeholder="155"></div>
    <div class="field"><label for="iPace">Ritmo · min/km</label>
      <input id="iPace" class="input" inputmode="text" value="${ya ? aRitmo(ya.pace) : ''}" placeholder="6:45"></div>
    <div class="field"><label for="iNotas">Notas · opcional</label>
      <textarea id="iNotas" class="input" rows="2" placeholder="p. ej. acorté por tiempo">${ya && ya.notas ? esc(ya.notas) : ''}</textarea></div>
    <div id="regmsg" aria-live="polite"></div>
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
    const notas = ($('iNotas')?.value || '').trim();
    if (!km || !hr || !pace) {
      msg.innerHTML = `<div class="err"><span class="bang">!</span><p>Faltan km, FC media o ritmo (formato 6:45).</p></div>`;
      return;
    }
    b.disabled = true;
    try {
      const guardada = await api('/sesiones', { method: 'POST', body: JSON.stringify({ date: hoy(), km, hr, pace, notas }) });
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

/* Mini-gráfico de tendencia: polilínea escalada a min/max, con línea de
   objetivo opcional. `fmt` da formato a las etiquetas de primer y último punto. */
function trendSVG(vals, fmt, target) {
  const n = vals.length;
  const all = target != null ? vals.concat([target]) : vals;
  const mx = Math.max(...all), mn = Math.min(...all);
  const rango = Math.max(mx - mn, 1);
  const X = i => 30 + (i / (n - 1)) * 285;
  const Y = v => 25 + (1 - (v - mn) / rango) * 95;   // valor alto = arriba
  const pts = vals.map((v, i) => [Math.round(X(i)), Math.round(Y(v))]);
  const poly = pts.map(q => q.join(',')).join(' ');
  const dots = pts.map((q, i) => i === n - 1
    ? `<circle cx="${q[0]}" cy="${q[1]}" r="5" fill="#1d2d3d"></circle>`
    : `<circle cx="${q[0]}" cy="${q[1]}" r="4" fill="#f2f2f3" stroke="#5980a6" stroke-width="2"></circle>`).join('');
  const tgt = target != null ? `<line x1="0" y1="${Math.round(Y(target))}" x2="342" y2="${Math.round(Y(target))}" stroke="#5980a6" stroke-width="1" stroke-dasharray="4 4"></line>
    <text x="341" y="${Math.round(Y(target)) - 4}" fill="#5980a6" font-family="Barlow Condensed" font-weight="600" font-size="10" text-anchor="end">objetivo ${fmt(target)}</text>` : '';
  return `<svg viewBox="0 0 342 150">
    <line x1="0" y1="24" x2="342" y2="24" stroke="#e7e7ea"></line>
    <line x1="0" y1="72" x2="342" y2="72" stroke="#e7e7ea"></line>
    <line x1="0" y1="120" x2="342" y2="120" stroke="#e7e7ea"></line>
    ${tgt}
    <polyline points="${poly}" fill="none" stroke="#5980a6" stroke-width="2"></polyline>
    ${dots}
    <text x="${pts[0][0]}" y="${pts[0][1] - 9}" fill="#5d5d60" font-family="Barlow Condensed" font-weight="600" font-size="12" text-anchor="middle">${fmt(vals[0])}</text>
    <text x="${pts[n - 1][0]}" y="${pts[n - 1][1] - 9}" fill="#1d2d3d" font-family="Barlow Condensed" font-weight="600" font-size="13" text-anchor="middle">${fmt(vals[n - 1])}</text>
  </svg>`;
}

/* Bloque de tendencia: título + hint + gráfico, o estado vacío mientras
   no haya al menos dos sesiones con ese dato del .fit. */
function trendBlock(title, hint, vals, fmt, target) {
  let body;
  if (vals.length >= 2) body = `<div class="chart bp">${CORNERS}${trendSVG(vals, fmt, target)}</div>`;
  else if (vals.length === 1) body = `<div class="chart bp">${CORNERS}<div class="empty">Primer dato: <b>${fmt(vals[0])}</b>.<br>Con la próxima sesión del .fit arranca la curva.</div></div>`;
  else body = `<div class="chart bp">${CORNERS}<div class="empty">Aún sin datos.<br>Sube el .fit de un rodaje y esto cobra vida.</div></div>`;
  return `<div class="pgrp"><h4>${title}</h4><p class="hint">${hint}</p>${body}</div>`;
}

/* Probabilidad de sub-4: brújula de entrenador, NO una apuesta. Combina cuatro
   señales visibles de los datos (durabilidad, motor aeróbico, eficiencia,
   constancia) con el techo de potencial de su 10K. Se puede calcular a una
   fecha de corte para dibujar su evolución en el tiempo. */
function probabilidad(logs, corteISO) {
  const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));
  const corte = corteISO || hoy();

  // Durabilidad: media de km/sem (últimas 3 con datos) + tirada más larga, vs
  // lo que pide un sub-4 (~50 km/sem de pico, larga ~30 km). Es su punto flojo hoy.
  const porSem = {};
  logs.forEach(l => { const w = lunesDe(l.date); porSem[w] = (porSem[w] || 0) + l.km; });
  const ult3 = Object.keys(porSem).sort().slice(-3).map(w => porSem[w]);
  const kmSem = ult3.length ? ult3.reduce((a, b) => a + b, 0) / ult3.length : 0;
  const larga = logs.reduce((m, l) => Math.max(m, l.km), 0);
  const vol = clamp((kmSem / 50) * 0.6 + (larga / 30) * 0.4, 0, 1);

  // Motor aeróbico: ritmo a 148-162 ppm vs ritmo maratón (5:41 = 341 s/km).
  const ae = logs.filter(l => l.hr >= 148 && l.hr <= 162);
  const paceAero = ae.length ? ae.at(-1).pace : null;
  const motor = paceAero == null ? 0.4 : clamp((475 - paceAero) / (475 - 341), 0, 1);

  // Eficiencia: última deriva (menor = mejor). Sin dato, neutro.
  const der = logs.filter(l => typeof l.deriva === 'number');
  const efic = der.length ? clamp(1 - (der.at(-1).deriva - 5) / 10, 0, 1) : 0.5;

  // Constancia: sesiones de correr hechas vs previstas en los últimos 28 días.
  let prev = 0, hechas = 0;
  for (let i = 0; i < 28; i++) {
    const dISO = mas(corte, -i);
    if (typeof sesionDe(dISO).km === 'number') { prev++; if (logs.find(l => l.date === dISO)) hechas++; }
  }
  const constancia = prev ? clamp(hechas / prev, 0, 1) : 0.85;

  const readiness = 0.35 * vol + 0.30 * motor + 0.15 * efic + 0.20 * constancia;
  const pct = Math.round((0.35 + 0.60 * readiness) * 100);   // suelo ~35%, techo ~95%
  return {
    pct,
    comps: [
      { k: 'Durabilidad · volumen y larga', v: vol },
      { k: 'Motor aeróbico · ritmo a pulso', v: motor },
      { k: 'Eficiencia · desacople', v: efic },
      { k: 'Constancia · plan cumplido', v: constancia }
    ]
  };
}

/* ---------- Vista PROGRESO ---------- */
function pintarProg() {
  const semanas = Math.ceil(diasRestantes() / 7);
  const aero = LOGS.filter(l => l.hr >= 148 && l.hr <= 162);
  const ritmoAct = aero.length ? aRitmo(aero.at(-1).pace) : '—';
  const totalKm = Math.round(LOGS.reduce((s, l) => s + l.km, 0));

  /* Datos ricos del .fit — solo las sesiones que se guardaron desde el fichero
     los tienen. El control de fáciles se limita a rodajes (una larga deriva de por sí). */
  const derivas = LOGS.filter(l => typeof l.deriva === 'number').map(l => l.deriva);
  const cads = LOGS.filter(l => typeof l.cad === 'number').map(l => l.cad);
  const controls = LOGS.filter(l => typeof l.techoPct === 'number' && sesionDe(l.date).kind === 'rodaje').map(l => l.techoPct);
  const ultDeriva = derivas.length ? `${derivas.at(-1)}%` : '—';
  const ultCad = cads.length ? `${cads.at(-1)}` : '—';

  /* Coste de pulso del ritmo maratón (5:41): FC estimada para sostenerlo,
     proyectando por reserva de FC (Karvonen) desde cada rodaje aeróbico.
     REST 53, FCmáx 206 (perfil). Baja con el tiempo = 5:41 cada vez más asumible. */
  const REST = 53, FCMAX = 206, MP = 341, spdMP = 1000 / MP;
  const costes = LOGS.filter(l => l.hr >= 140 && l.hr <= 168 && l.pace > MP).map(l => {
    const fracHRR = (l.hr - REST) / (FCMAX - REST);
    const needed = Math.min(fracHRR * (spdMP / (1000 / l.pace)), 1);
    return Math.round(REST + needed * (FCMAX - REST));
  });

  /* Probabilidad de sub-4: número de cabecera + su evolución semana a semana
     (recalculada con los datos acumulados hasta el final de cada semana). */
  const prob = probabilidad(LOGS);
  const probCard = `<div class="prob bp">${CORNERS}
    <div class="prob-head">
      <div class="prob-pct"><span class="n">${prob.pct}</span><span class="s">%</span></div>
      <div class="prob-txt"><div class="prob-lab">PROBABILIDAD DE SUB-4</div>
        <p>Brújula de entrenador con tus datos, no una apuesta: sube si entrenas bien, pero no garantiza el día D.</p></div>
    </div>
    <div class="prob-comps">${prob.comps.map(c => `<div class="prob-comp">
      <div class="prob-comp-top"><span>${esc(c.k)}</span><span>${Math.round(c.v * 100)}%</span></div>
      <div class="prob-comp-bar"><div style="width:${Math.round(c.v * 100)}%"></div></div>
    </div>`).join('')}</div>
  </div>`;
  const probPts = BASE.map(w => {
    const fin = mas(w.lunes, 6);
    const hasta = LOGS.filter(l => l.date <= fin);
    return hasta.length ? probabilidad(hasta, fin).pct : null;
  }).filter(v => v != null);

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
  } else if (aero.length === 1) {
    curva = `<div class="empty">Primer dato: <b>${aRitmo(aero[0].pace)}/km</b> a ${aero[0].hr} ppm.<br>Con la próxima sesión a 148–162 ppm arranca la curva.</div>`;
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

  /* Carga aguda:crónica (ACWR): km de 7 días ÷ media semanal de 28 días.
     Zona segura 0,8-1,3; por encima de 1,5 es donde llegan las lesiones.
     Sin ~3 semanas de base crónica el ratio no significa nada: se oculta. */
  const km7 = LOGS.filter(l => l.date > mas(hoy(), -7)).reduce((a, l) => a + l.km, 0);
  const ventana = LOGS.filter(l => l.date > mas(hoy(), -28) && l.date <= hoy());
  const cronico = ventana.reduce((a, l) => a + l.km, 0) / 4;
  const spanDias = ventana.length ? Math.round((new Date(hoy()) - new Date(ventana.reduce((m, l) => l.date < m ? l.date : m, ventana[0].date))) / 864e5) : 0;
  const acwr = (spanDias >= 21 && cronico > 0) ? km7 / cronico : null;
  const acwrCls = acwr == null ? '' : (acwr >= 0.8 && acwr <= 1.3) ? 'ok' : acwr > 1.5 ? 'hi' : 'warn';
  const acwrTxt = acwr == null ? 'Necesita un par de semanas de datos para tener sentido.'
    : acwr > 1.5 ? 'Pico de carga alto: riesgo para el Aquiles. Toca frenar.'
    : acwr > 1.3 ? 'Subiendo rápido: ojo con el salto semanal.'
    : acwr < 0.8 ? 'Carga baja respecto a tu media: hay margen para construir.'
    : 'En zona segura: la carga sube de forma sostenible.';

  $('vProg').innerHTML = `<div class="prog">
    <h2>Progreso</h2>
    <p class="tagline">Camino al sub-4h · 5:41/km</p>

    ${probCard}

    ${trendBlock('Probabilidad en el tiempo', 'Cómo evoluciona tu probabilidad de sub-4 semana a semana. La idea es verla trepar de aquí a diciembre según construyes volumen y motor.', probPts, v => `${v}%`, null)}

    <div class="stats">
      <div class="stat"><div class="v">${semanas}</div><div class="k">semanas restantes</div></div>
      <div class="stat"><div class="v">${ritmoAct}${ritmoAct !== '—' ? '<small>/km</small>' : ''}</div><div class="k">último ritmo a 148–162</div></div>
      <div class="stat"><div class="v">${totalKm}</div><div class="k">km registrados</div></div>
      <div class="stat"><div class="v">${ultDeriva}</div><div class="k">último desacople</div></div>
      <div class="stat"><div class="v">${ultCad}${ultCad !== '—' ? '<small>spm</small>' : ''}</div><div class="k">última cadencia</div></div>
      <div class="stat dark"><div class="v">3:56</div><div class="k">lo que predice tu 10K</div></div>
    </div>

    <div class="pgrp">
      <h4>Ritmo a 148–162 ppm</h4>
      <p class="hint">La única curva que decide el sub-4h. Mismo pulso, más rápido. Julio a 7:15 es correcto; octubre a 6:25 es la adaptación.</p>
      <div class="chart bp">${CORNERS}${curva}</div>
    </div>

    ${trendBlock('Desacople aeróbico', 'Pérdida de eficiencia (ritmo:FC) de la 1ª a la 2ª mitad. <b>Baja = tu base aeróbica mejora</b> (es tu déficit). Objetivo: por debajo del 5%.', derivas, v => `${v}%`, 5)}

    ${trendBlock('Control de los fáciles', '% del rodaje por encima del techo 162. <b>Baja = gestionas mejor el pulso</b> en los fáciles. Cuanto más cerca de 0, mejor.', controls, v => `${v}%`, 10)}

    ${trendBlock('Cadencia', 'Zancadas por minuto. Tu asignatura pendiente (baja para 1,83 m). <b>Sube = mejor economía y menos impacto</b>. Objetivo: hacia 160+.', cads, v => `${v}`, 160)}

    ${trendBlock('Coste de pulso del 5:41', 'FC estimada para sostener el ritmo maratón (5:41), proyectada desde tus rodajes. <b>Baja = el 5:41 se vuelve asumible</b>. Objetivo: por debajo de ~172 ppm.', costes, v => `${v}`, 172)}

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
      <h4>Carga y riesgo · ACWR</h4>
      <p class="hint">Km de los últimos 7 días ÷ tu media semanal de 4 semanas. Zona segura <b>0,8–1,3</b>; por encima de <b>1,5</b> es donde llegan las lesiones. Tu red anti-Aquiles.</p>
      <div class="acwr bp ${acwrCls}">${CORNERS}
        <div class="acwr-n">${acwr == null ? '—' : acwr.toFixed(2).replace('.', ',')}</div>
        <div class="acwr-t">${acwrTxt}</div>
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

/* ---------- Vista SEMANA ---------- */
const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
let semOffset = 0;

/* Lunes de la semana que contiene a `fechaISO`, desplazado `offset` semanas */
function lunesDe(fechaISO, offset = 0) {
  const d = new Date(fechaISO + 'T00:00:00');
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7) + offset * 7);
  return iso(d);
}

/* Etiqueta corta de la derecha de cada día */
function etiquetaDia(s) {
  switch (s.kind) {
    case 'descanso': return /Londres/i.test(s.t) ? '✈ VIAJE' : 'DESCANSO';
    case 'fuerza':   return 'FUERZA';
    case 'parque':   return 'PARQUE';
    case 'calidad':  return 'CALIDAD';
    case 'larga':    return typeof s.km === 'number' ? `${s.km} km` : 'LARGA';
    default:         return typeof s.km === 'number' ? `${s.km} km` : 'RODAJE';
  }
}

function pintarSemana() {
  const lunes = lunesDe(hoy(), semOffset);
  const hoyISO = hoy();
  const dLun = new Date(lunes + 'T00:00:00');
  const dDom = new Date(mas(lunes, 6) + 'T00:00:00');

  const nSem = semanaDe(lunes);
  const base = BASE.find(w => w.lunes === lunes);
  const fase = nSem ? `FASE BASE · S${nSem}`
    : (dLun >= INICIO_COROS && dLun <= META) ? 'PLAN COROS'
    : (dLun > META) ? 'DESPUÉS DE VALENCIA' : 'ANTES DEL PLAN';
  const rango = dLun.getMonth() === dDom.getMonth()
    ? `${dLun.getDate()}–${dDom.getDate()} ${MESES[dDom.getMonth()]}`
    : `${dLun.getDate()} ${MESES[dLun.getMonth()]} – ${dDom.getDate()} ${MESES[dDom.getMonth()]}`;

  const filas = Array.from({ length: 7 }, (_, i) => mas(lunes, i)).map(f => {
    const s = sesionDe(f);
    const d = new Date(f + 'T00:00:00');
    const done = LOGS.find(l => l.date === f);
    const cls = ['wk-day', s.kind, f === hoyISO ? 'is-hoy' : '', done ? 'is-done' : ''].filter(Boolean).join(' ');
    return `<div class="${cls}">
      <div class="wk-dt"><span class="wk-dn">${DIAS[d.getDay()].slice(0, 3)}</span><span class="wk-num">${d.getDate()}</span></div>
      <div class="wk-main"><div class="wk-t">${esc(s.t)}</div></div>
      <div class="wk-tag">${done ? '<span class="wk-ok">✓</span>' : ''}${esc(etiquetaDia(s))}</div>
    </div>`;
  }).join('');

  const kmReg = Math.round(LOGS.filter(l => l.date >= lunes && l.date <= mas(lunes, 6)).reduce((a, l) => a + l.km, 0));
  const resumen = base
    ? `<b>${base.total} km</b> previstos${kmReg ? ` · ${kmReg} registrados` : ''}`
    : (kmReg ? `<b>${kmReg} km</b> registrados` : 'Plan COROS · km según el reloj');

  $('vSemana').innerHTML = `<div class="wk">
    <div class="wk-head">
      <button class="wk-nav" id="wkPrev" aria-label="Semana anterior">‹</button>
      <div class="wk-hc"><div class="wk-fase">${fase}</div><h2>${rango}</h2></div>
      <button class="wk-nav" id="wkNext" aria-label="Semana siguiente">›</button>
    </div>
    <p class="wk-sum">${resumen}${semOffset ? ' · <button class="wk-today" id="wkHoy">volver a esta semana</button>' : ''}</p>
    <div class="wk-list">${filas}</div>
  </div>`;

  $('wkPrev').onclick = () => { semOffset--; pintarSemana(); };
  $('wkNext').onclick = () => { semOffset++; pintarSemana(); };
  if ($('wkHoy')) $('wkHoy').onclick = () => { semOffset = 0; pintarSemana(); };
}

/* ---------- Navegación ---------- */
function ir(tab) {
  const vistas = {
    hoy:  ['tHoy', 'vHoy', pintarHoy],
    sem:  ['tSem', 'vSemana', pintarSemana],
    prog: ['tProg', 'vProg', pintarProg]
  };
  for (const [k, [tid, vid]] of Object.entries(vistas)) {
    const on = k === tab;
    $(tid).setAttribute('aria-selected', on);
    $(vid).hidden = !on;
  }
  vistas[tab][2]();
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
    const cuerpo = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(cuerpo.error || 'PIN incorrecto'); // muestra "Espera Xs" del 429
    localStorage.setItem(TK, cuerpo.token);
    token = cuerpo.token;
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
  } catch {
    if (!token) return;        // era 401: api() ya mostró la puerta
    return mostrarError();     // 500 / red caída: pantalla de error con reintento, no en blanco
  }
  $('puerta').hidden = true;
  $('app').hidden = false;
  $('dleft').textContent = diasRestantes();
  ir('hoy');
}

/* Pantalla de error de carga con botón de reintento (antes: pantalla en blanco) */
function mostrarError() {
  $('puerta').hidden = true;
  $('app').hidden = false;
  $('vSemana').hidden = true; $('vProg').hidden = true; $('vHoy').hidden = false;
  $('vHoy').innerHTML = `<div class="hoy"><div class="loaderr bp">${CORNERS}
    <div class="le-t">NO SE PUDO CARGAR</div>
    <p>Falló la conexión con el servidor. Revisa la red e inténtalo de nuevo.</p>
    <button class="btn-primary" id="bRetry">REINTENTAR</button>
  </div></div>`;
  $('bRetry').onclick = arrancar;
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
$('tSem').onclick = () => ir('sem');
$('tProg').onclick = () => ir('prog');

arrancar();
