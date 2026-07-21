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

/* ---------- Auth: un PIN, un token HMAC. Sin dependencias. ---------- */
const token = () => crypto.createHmac('sha256', SECRET).update(PIN).digest('hex');
const TOKEN = token();

const auth = (req, res, next) => {
  const enviado = (req.headers.authorization || '').replace('Bearer ', '');
  const a = Buffer.from(enviado.padEnd(64).slice(0, 64));
  const b = Buffer.from(TOKEN.padEnd(64).slice(0, 64));
  if (crypto.timingSafeEqual(a, b)) return next();
  res.status(401).json({ error: 'No autorizado' });
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
app.use(express.json({ limit: '32kb' }));
app.disable('x-powered-by');

app.post('/api/login', (req, res) => {
  if (req.body?.pin === PIN) return res.json({ token: TOKEN });
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

  const filas = leer().filter(f => f.date !== s.date); // una sesión por día, se sobreescribe
  filas.push(s);
  filas.sort((a, b) => a.date.localeCompare(b.date));
  escribir(filas);
  res.json(s);
});

/* Análisis de un .fit: se parsea al vuelo y se devuelve el desglose.
   NO se guarda nada — es solo lectura, no toca sesiones.json. */
app.post('/api/analizar-fit', auth, express.raw({ type: '*/*', limit: '12mb' }), (req, res) => {
  const buf = req.body;
  if (!buf || !buf.length) return res.status(400).json({ error: 'Fichero vacío' });
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
