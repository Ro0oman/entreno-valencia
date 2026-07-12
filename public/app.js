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
const iso = d => d.toISOString().slice(0, 10);
const hoy = () => iso(new Date());
const mas = (s, n) => { const d = new Date(s + 'T00:00:00'); d.setDate(d.getDate() + n); return iso(d); };
const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const aSeg = p => { const m = /^(\d{1,2})[:.](\d{1,2})$/.exec((p || '').trim()); return m ? +m[1] * 60 + +m[2] : null; };
const aRitmo = s => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, '0')}`;
const diasRestantes = () => Math.max(0, Math.ceil((META - new Date(hoy() + 'T00:00:00')) / 864e5));
const $ = id => document.getElementById(id);

/* ---------- FIRMA: regla de pulso (escala 130 → 206) ---------- */
const bpmX = b => ((b - 130) / 76) * 100;

const reglaPulso = tipo => `
  <div class="pulse">
    <div class="cap">
      <span>Pulso objetivo</span>
      <b>${tipo === 'larga' ? '150-158 → 165' : '148-158'} ppm</b>
    </div>
    <div class="ruler">
      <div class="track"></div>
      <div class="mark" style="left:${bpmX(148)}%"><i></i><span>148</span></div>
      <div class="mark" style="left:${bpmX(158)}%"><i></i><span>158</span></div>
      <div class="mark ceil" style="left:${bpmX(162)}%"><i></i><span>162 techo</span></div>
      <div class="scale"><span>130</span><span>umbral 184</span><span>206</span></div>
    </div>
  </div>`;

/* ---------- Vista HOY ---------- */
function pintarHoy() {
  const f = hoy();
  const d = new Date(f + 'T00:00:00');
  const s = sesionDe(f);
  const ya = LOGS.find(l => l.date === f);
  const notas = (s.notes || []).map(n => `<li class="${n[1] || ''}">${n[0]}</li>`).join('');

  $('vHoy').innerHTML = `
    <div class="eyebrow">${DIAS[d.getDay()]} ${d.getDate()} de ${MESES[d.getMonth()]}</div>

    <div class="session">
      <span class="kind k-${s.kind}">${s.kind}</span>
      <h1>${s.t}</h1>
      <div class="sub">${s.sub || ''}</div>
    </div>

    ${s.hr ? reglaPulso(s.hr) : ''}
    ${notas ? `<ul class="notes">${notas}</ul>` : ''}

    ${s.km ? `
    <details ${ya ? '' : 'open'}>
      <summary>${ya ? `✓ ${ya.km} km · ${ya.hr} ppm · ${aRitmo(ya.pace)}/km — editar` : '+ Registrar la sesión'}</summary>
      <div class="form">
        <div><label>km</label>
          <input id="iKm" inputmode="decimal" value="${ya?.km ?? ''}" placeholder="${typeof s.km === 'number' ? s.km : '—'}"></div>
        <div><label>FC media</label>
          <input id="iHr" inputmode="numeric" value="${ya?.hr ?? ''}" placeholder="155"></div>
        <div><label>min/km</label>
          <input id="iPace" inputmode="text" value="${ya ? aRitmo(ya.pace) : ''}" placeholder="6:45"></div>
        <div class="full"><button class="save" id="bSave">Guardar sesión</button></div>
        <div class="msg" id="msg"></div>
      </div>
    </details>` : ''}
  `;

  const b = $('bSave');
  if (!b) return;
  b.onclick = async () => {
    const msg = $('msg');
    const km = parseFloat($('iKm').value);
    const hr = parseInt($('iHr').value, 10);
    const pace = aSeg($('iPace').value);
    if (!km || !hr || !pace) {
      msg.style.color = 'var(--red)';
      msg.textContent = 'Faltan km, FC media o ritmo (formato 6:45).';
      return;
    }
    b.disabled = true;
    try {
      const guardada = await api('/sesiones', { method: 'POST', body: JSON.stringify({ date: hoy(), km, hr, pace }) });
      LOGS = LOGS.filter(l => l.date !== guardada.date).concat(guardada).sort((a, b) => a.date.localeCompare(b.date));
      msg.style.color = 'var(--zone)';
      msg.textContent = 'Guardado.';
      setTimeout(pintarHoy, 700);
    } catch (e) {
      msg.style.color = 'var(--red)';
      msg.textContent = e.message;
      b.disabled = false;
    }
  };
}

/* ---------- Vista PROGRESO ---------- */
function pintarProg() {
  const semanas = Math.ceil(diasRestantes() / 7);

  /* La métrica: ritmo a pulso aeróbico (148-162 ppm) */
  const aero = LOGS.filter(l => l.hr >= 148 && l.hr <= 162);
  let grafico = `<div class="empty">Aún no hay sesiones a 148-162 ppm.<br>Registra un rodaje y esta curva empieza a existir.</div>`;
  let ritmoAct = '—';

  if (aero.length) {
    ritmoAct = aRitmo(aero.at(-1).pace);
    if (aero.length >= 2) {
      const p = aero.map(a => a.pace);
      const mx = Math.max(...p), mn = Math.min(...p);
      const rango = Math.max(mx - mn, 30);
      const pts = aero.map((a, i) => [
        (i / (aero.length - 1)) * 100,
        ((a.pace - mn) / rango) * 84 + 8   // más lento = más abajo
      ]);
      grafico = `
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" style="width:100%;height:130px;overflow:visible">
          <polyline points="${pts.map(p => p.join(',')).join(' ')}" fill="none" stroke="var(--blue)"
            stroke-width="1.6" vector-effect="non-scaling-stroke" stroke-linejoin="round"/>
          ${pts.map(p => `<circle cx="${p[0]}" cy="${p[1]}" r="2" fill="var(--blue)"/>`).join('')}
        </svg>
        <div class="legend"><span>${aRitmo(mx)} /km</span><span style="margin-left:auto">${aRitmo(mn)} /km</span></div>`;
    }
  }

  /* km/semana: hecho vs previsto */
  const barras = BASE.map((w, i) => {
    const real = LOGS
      .filter(l => l.date >= w.lunes && l.date <= mas(w.lunes, 6))
      .reduce((s, l) => s + l.km, 0);
    const over = real > w.total * 1.1;
    return `<div class="bar">
      <div class="col" style="height:${(w.total / 45) * 100}%">
        <div class="fill ${over ? 'over' : ''}" style="height:${real ? Math.min(100, (real / w.total) * 100) : 0}%"></div>
      </div>
      <div class="lb">S${i + 1}</div>
    </div>`;
  }).join('');

  const totalKm = LOGS.reduce((s, l) => s + l.km, 0);

  $('vProg').innerHTML = `
    <div class="stats">
      <div class="stat"><div class="v" style="color:var(--blue)">${semanas}</div><div class="k">semanas restantes</div></div>
      <div class="stat"><div class="v" style="color:var(--zone)">${ritmoAct}</div><div class="k">último ritmo a 148-162</div></div>
      <div class="stat"><div class="v">${Math.round(totalKm)}</div><div class="k">km registrados</div></div>
      <div class="stat"><div class="v" style="color:var(--ceiling)">3:56</div><div class="k">lo que predice tu 10K</div></div>
    </div>

    <div class="panel">
      <h2>Ritmo a 148-162 ppm</h2>
      <div class="hint">La única curva que decide el sub-4h. Mismo pulso, más rápido. Julio a 7:15/km es correcto; octubre a 6:25/km es la adaptación.</div>
      ${grafico}
    </div>

    <div class="panel">
      <h2>Km por semana · fase base</h2>
      <div class="hint">La barra hueca es lo previsto. Lo lleno, lo hecho. Pasarse también es un fallo.</div>
      <div class="bars">${barras}</div>
      <div class="legend">
        <span><i style="background:var(--blue)"></i>hecho</span>
        <span><i style="background:var(--ceiling)"></i>pasado de rosca</span>
        <span style="margin-left:auto">meta S5: 42 km</span>
      </div>
    </div>

    <div class="next">
      <h2>Qué se espera de aquí a diciembre</h2>
      <p>
        <b>16 ago</b> — cerrar la base: 42 km/semana y tirada de 16 km.<br>
        <b>17 ago</b> — cargar el plan COROS de maratón, 16 semanas.<br>
        <b>Octubre</b> — zapa de placa comprada y rodada 50-60 km. Pisar tramos reales del recorrido.<br>
        <b>6 dic</b> — 42,195 km a 5:41/km.
      </p>
      <p style="margin-top:12px;color:var(--muted);font-size:13px">
        Tu 10K predice 3:56 y tu media 4:14. Esos 18 minutos son déficit de resistencia, no de velocidad. Se cierran con kilómetros.
      </p>
    </div>
  `;
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

/* ---------- Puerta ---------- */
function puerta() {
  $('panel').hidden = true;
  $('puerta').hidden = false;
  $('pin').focus();
}

async function entrar() {
  const msg = $('msgPin');
  try {
    const r = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin: $('pin').value })
    });
    if (!r.ok) throw new Error('PIN incorrecto');
    const { token: t } = await r.json();
    localStorage.setItem(TK, t);
    token = t;
    await arrancar();
  } catch (e) {
    msg.style.color = 'var(--red)';
    msg.textContent = e.message;
  }
}

/* ---------- Arranque ---------- */
async function arrancar() {
  if (!token) return puerta();
  try {
    LOGS = await api('/sesiones');
  } catch { return; }
  $('puerta').hidden = true;
  $('panel').hidden = false;
  $('dleft').textContent = diasRestantes();
  ir('hoy');
}

$('tHoy').onclick = () => ir('hoy');
$('tProg').onclick = () => ir('prog');
$('bEntrar').onclick = entrar;
$('pin').onkeydown = e => { if (e.key === 'Enter') entrar(); };

arrancar();
