import express from 'express';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import FitParser from 'fit-file-parser';
import { analizarFit } from './fit-analisis.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PORT = process.env.PORT || 3000;
const PIN = process.env.APP_PIN;
const SECRET = process.env.SESSION_SECRET;
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
const DB = path.join(DATA_DIR, 'sesiones.json');

if (!PIN || !SECRET) {
  console.error('Faltan las variables APP_PIN y SESSION_SECRET.');
  process.exit(1);
}

/* ---------- Persistencia: un JSON con escritura atómica ---------- */
fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(DB)) fs.writeFileSync(DB, '[]');

const leer = () => {
  try { return JSON.parse(fs.readFileSync(DB, 'utf8')); }
  catch { return []; }
};
const escribir = (filas) => {
  const tmp = DB + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(filas, null, 2));
  fs.renameSync(tmp, DB); // atómico: o está entero o no está
};

/* ---------- Auth: token firmado (HMAC) con caducidad ----------
   token = base64url({iat}) + "." + HMAC. Caduca a los 30 días, y rotar
   SESSION_SECRET invalida todos los tokens emitidos ("cerrar sesión en todos"). */
const MAX_AGE = 30 * 24 * 3600 * 1000;
const firmar = (payload) => {
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const mac = crypto.createHmac('sha256', SECRET).update(data).digest('base64url');
  return `${data}.${mac}`;
};
const emitirToken = () => firmar({ iat: Date.now() });
const verificar = (tok) => {
  const [data, mac] = String(tok || '').split('.');
  if (!data || !mac) return false;
  const esperado = crypto.createHmac('sha256', SECRET).update(data).digest('base64url');
  const a = Buffer.from(mac), b = Buffer.from(esperado);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return false;
  try {
    const p = JSON.parse(Buffer.from(data, 'base64url').toString());
    return typeof p.iat === 'number' && Date.now() - p.iat < MAX_AGE;
  } catch { return false; }
};

const auth = (req, res, next) => {
  const tok = (req.headers.authorization || '').replace('Bearer ', '');
  if (verificar(tok)) return next();
  res.status(401).json({ error: 'No autorizado' });
};

/* ---------- Anti fuerza bruta en el login: ventana deslizante por IP ---------- */
const INTENTOS = new Map(); // ip -> { n, hasta }
const MAX_INTENTOS = 8, VENTANA = 15 * 60 * 1000;
setInterval(() => { const t = Date.now(); for (const [ip, v] of INTENTOS) if (v.hasta < t) INTENTOS.delete(ip); }, 60 * 1000).unref();
const limitarLogin = (req, res, next) => {
  const v = INTENTOS.get(req.ip);
  if (v && v.n >= MAX_INTENTOS && v.hasta > Date.now()) {
    return res.status(429).json({ error: `Demasiados intentos. Espera ${Math.ceil((v.hasta - Date.now()) / 1000)} s.` });
  }
  next();
};
const registrarFallo = (ip) => {
  const v = INTENTOS.get(ip) || { n: 0, hasta: 0 };
  v.n++; v.hasta = Date.now() + VENTANA;
  INTENTOS.set(ip, v);
};

/* ---------- Validación ---------- */
const valida = (s) => {
  const errores = [];
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s.date || '')) errores.push('fecha');
  if (!(s.km > 0 && s.km < 100)) errores.push('km');
  if (!(s.hr >= 80 && s.hr <= 220)) errores.push('FC media');
  if (!(s.pace >= 180 && s.pace <= 900)) errores.push('ritmo');
  if (s.notas && String(s.notas).length > 500) errores.push('notas');
  return errores;
};

/* ---------- App ---------- */
const app = express();
app.set('trust proxy', 1); // detrás del proxy de Coolify: usa la IP real del cliente
app.use(express.json({ limit: '32kb' }));
app.disable('x-powered-by');

/* Cabeceras de seguridad. CSP estricta: todo del mismo origen (fuentes incluidas,
   ya self-hosteadas). 'unsafe-inline' en style es por los style="" que genera el JS. */
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Content-Security-Policy',
    "default-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'");
  res.setHeader('Strict-Transport-Security', 'max-age=15552000; includeSubDomains');
  next();
});

app.post('/api/login', limitarLogin, async (req, res) => {
  const pin = req.body?.pin;
  const ok = typeof pin === 'string' && pin.length === PIN.length &&
    crypto.timingSafeEqual(Buffer.from(pin), Buffer.from(PIN));
  await new Promise(r => setTimeout(r, 250)); // demora fija: frena scripts y no filtra por tiempo
  if (ok) { INTENTOS.delete(req.ip); return res.json({ token: emitirToken() }); }
  registrarFallo(req.ip);
  res.status(401).json({ error: 'PIN incorrecto' });
});

app.get('/api/sesiones', auth, (_req, res) => {
  res.json(leer());
});

app.post('/api/sesiones', auth, (req, res) => {
  const b = req.body || {};
  const s = {
    date: b.date,
    km: Number(b.km),
    hr: Number(b.hr),
    pace: Number(b.pace),
    notas: String(b.notas || '').slice(0, 500)
  };
  const errores = valida(s);
  if (errores.length) return res.status(400).json({ error: `Revisa: ${errores.join(', ')}` });

  // Métricas ricas del .fit — opcionales. Se guardan solo si vienen y son válidas.
  // Los registros a mano no las traen y no pasa nada: los gráficos las saltan.
  const num = (v, lo, hi) => { const n = Number(v); return Number.isFinite(n) && n >= lo && n <= hi ? n : undefined; };
  const extra = {
    deriva: num(b.deriva, -20, 60),   // % de deriva cardíaca
    cad: num(b.cad, 100, 260),        // cadencia media (spm)
    hrMax: num(b.hrMax, 80, 220),     // FC máxima
    techoPct: num(b.techoPct, 0, 100) // % del tiempo por encima del techo
  };
  for (const [k, v] of Object.entries(extra)) if (v !== undefined) s[k] = v;

  // Análisis completo del .fit (splits, zonas, desacople, GAP…). Se guarda para
  // poder reabrir la sesión con todo el detalle sin reimportar el fichero.
  if (b.analisis && typeof b.analisis === 'object' && !Array.isArray(b.analisis)) {
    const raw = JSON.stringify(b.analisis);
    if (raw.length <= 24000) { try { s.analisis = JSON.parse(raw); } catch { /* se ignora */ } }
  }

  const filas = leer().filter(f => f.date !== s.date); // una sesión por día, se sobreescribe
  filas.push(s);
  filas.sort((a, b) => a.date.localeCompare(b.date));
  escribir(filas);
  res.json(s);
});

/* Análisis de un .fit: se parsea al vuelo y se devuelve el desglose.
   NO se guarda nada — es solo lectura, no toca sesiones.json. */
app.post('/api/analizar-fit', auth, express.raw({ type: '*/*', limit: '3mb' }), (req, res) => {
  const buf = req.body;
  if (!buf || buf.length < 12) return res.status(400).json({ error: 'Fichero vacío' });
  if (buf.slice(8, 12).toString('latin1') !== '.FIT') return res.status(400).json({ error: 'No parece un fichero .fit' });
  const fp = new (FitParser.default || FitParser)({
    force: true, speedUnit: 'km/h', lengthUnit: 'km', mode: 'list'
  });
  fp.parse(buf, (err, data) => {
    if (err) return res.status(400).json({ error: 'No pude leer el .fit' });
    try {
      res.json(analizarFit(data.records || []));
    } catch {
      res.status(400).json({ error: 'El fichero no tiene datos de carrera' });
    }
  });
});

app.delete('/api/sesiones/:date', auth, (req, res) => {
  const filas = leer();
  const quedan = filas.filter(f => f.date !== req.params.date);
  if (quedan.length === filas.length) return res.status(404).json({ error: 'No hay sesión ese día' });
  escribir(quedan);
  res.json({ borrada: req.params.date });
});

app.get('/salud', (_req, res) => res.json({ ok: true, sesiones: leer().length }));

// Sin caché de larga duración: revalida cada carga (ETag → 304 si no cambió).
// Evita que un deploy deje html-nuevo + js-viejo en el navegador.
app.use(express.static(path.join(__dirname, 'public'), { maxAge: 0, etag: true }));

app.listen(PORT, '0.0.0.0', () => console.log(`Escuchando en :${PORT}`));
