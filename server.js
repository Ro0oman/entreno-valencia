import express from 'express';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

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
  const s = {
    date: req.body?.date,
    km: Number(req.body?.km),
    hr: Number(req.body?.hr),
    pace: Number(req.body?.pace),
    notas: String(req.body?.notas || '').slice(0, 500)
  };
  const errores = valida(s);
  if (errores.length) return res.status(400).json({ error: `Revisa: ${errores.join(', ')}` });

  const filas = leer().filter(f => f.date !== s.date); // una sesión por día, se sobreescribe
  filas.push(s);
  filas.sort((a, b) => a.date.localeCompare(b.date));
  escribir(filas);
  res.json(s);
});

app.delete('/api/sesiones/:date', auth, (req, res) => {
  const filas = leer();
  const quedan = filas.filter(f => f.date !== req.params.date);
  if (quedan.length === filas.length) return res.status(404).json({ error: 'No hay sesión ese día' });
  escribir(quedan);
  res.json({ borrada: req.params.date });
});

app.get('/salud', (_req, res) => res.json({ ok: true, sesiones: leer().length }));

app.use(express.static(path.join(__dirname, 'public'), { maxAge: '1h' }));

app.listen(PORT, '0.0.0.0', () => console.log(`Escuchando en :${PORT}`));
