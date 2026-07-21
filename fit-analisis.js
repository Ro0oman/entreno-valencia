/* ============================================================
   Análisis de un .fit — lo que la media de FC esconde.
   No toca sesiones.json: recibe los registros del fichero y
   devuelve splits, desacople aeróbico, tiempo en zonas y GAP.
   Zonas de Roman: fácil 148-158 · techo 162 (ver perfil).
   ============================================================ */

const TECHO = 162;
const FACIL = [148, 158];
const TZ = 'Europe/Madrid';       // Roman entrena en Valencia: fecha en su hora local
const MOV = 2;                    // km/h por debajo de esto se considera parado
const DT_MAX = 10;               // s: recorta huecos de autopausa para no inflar tiempos
const DEADBAND = 2;              // m: filtro de ruido del altímetro para el desnivel

const media = a => a.length ? a.reduce((s, x) => s + x, 0) / a.length : null;
const fmtPace = (sec, km) => (km > 0 ? Math.round(sec / km) : null); // s/km = tiempo ÷ distancia

// Coste energético de correr según pendiente (Minetti), normalizado a llano.
// >1 en subida, <1 en bajada suave: convierte metros reales en "metros llanos".
const gapFactor = (grade) => {
  const i = Math.max(-0.30, Math.min(0.30, grade));
  const C = 155.4 * i ** 5 - 30.4 * i ** 4 - 43.3 * i ** 3 + 46.3 * i ** 2 + 19.5 * i + 3.6;
  return C / 3.6;
};

export function analizarFit(records) {
  const recs = (records || []).filter(r => r.timestamp && r.distance != null);
  if (recs.length < 30) throw new Error('sin datos de carrera');

  const T = recs.map(r => new Date(r.timestamp).getTime());
  const alt = recs.map(r => r.altitude ?? r.enhanced_altitude ?? null);
  const t0 = T[0], tN = T[T.length - 1];
  const fecha = new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(new Date(t0));

  const hr = recs.map(r => r.heart_rate).filter(v => v != null);
  const cad = recs.map(r => r.cadence).filter(v => v != null).map(v => v * 2); // por pierna → real
  const kmTotal = recs[recs.length - 1].distance;

  /* --- Pasada única: tiempo/distancia en movimiento (ritmo real), zonas por
     tiempo, desnivel positivo (con deadband anti-ruido) y distancia ajustada
     por pendiente acumulada (para el GAP por km). --- */
  let movSec = 0, movKm = 0, gain = 0, conf = alt[0], adjM = 0;
  const adjKmCum = new Array(recs.length).fill(0);
  const segsZona = { bajo: 0, facil: 0, alto: 0, techo: 0 };
  for (let i = 1; i < recs.length; i++) {
    adjKmCum[i] = adjKmCum[i - 1];
    const dt = Math.min((T[i] - T[i - 1]) / 1000, DT_MAX);
    const distM = Math.max(0, (recs[i].distance - recs[i - 1].distance) * 1000);

    // distancia ajustada por pendiente
    let f = 1;
    if (alt[i] != null && alt[i - 1] != null && distM > 0.5) f = gapFactor((alt[i] - alt[i - 1]) / distM);
    adjM += distM * f;
    adjKmCum[i] = adjM / 1000;

    // desnivel positivo con deadband
    if (alt[i] != null) {
      if (conf == null) conf = alt[i];
      else if (alt[i] > conf + DEADBAND) { gain += alt[i] - conf; conf = alt[i]; }
      else if (alt[i] < conf - DEADBAND) { conf = alt[i]; }
    }

    if (dt <= 0) continue;
    if ((recs[i].speed || 0) > MOV) { movSec += dt; movKm += (recs[i].distance - recs[i - 1].distance); }
    const x = recs[i].heart_rate;
    if (x != null) {
      if (x < FACIL[0]) segsZona.bajo += dt;
      else if (x <= FACIL[1]) segsZona.facil += dt;
      else if (x <= TECHO) segsZona.alto += dt;
      else segsZona.techo += dt;
    }
  }
  const paceAvg = movKm > 0.1 ? Math.round(movSec / movKm) : null;
  const gapAvg = adjM > 100 && movSec > 0 ? Math.round(movSec / (adjM / 1000)) : paceAvg;
  const totalZ = (segsZona.bajo + segsZona.facil + segsZona.alto + segsZona.techo) || 1;
  const pc = s => Math.round((s / totalZ) * 100);
  const zonas = { bajo: pc(segsZona.bajo), facil: pc(segsZona.facil), alto: pc(segsZona.alto), techo: pc(segsZona.techo) };

  /* --- splits por km: ritmo real y GAP (ritmo ajustado por pendiente) --- */
  const splits = [];
  let marca = 1, segT = t0, segIdx = 0, segHr = [];
  for (let i = 0; i < recs.length; i++) {
    if (recs[i].heart_rate != null) segHr.push(recs[i].heart_rate);
    if (recs[i].distance >= marca) {
      const hrSeg = segHr.length ? Math.round(media(segHr)) : null;
      const gapKm = adjKmCum[i] - adjKmCum[segIdx];
      splits.push({
        km: marca,
        paceSec: Math.round((T[i] - segT) / 1000),
        gapSec: gapKm > 0.1 ? Math.round(((T[i] - segT) / 1000) / gapKm) : null,
        hr: hrSeg,
        techo: hrSeg != null && hrSeg > TECHO
      });
      marca++; segT = T[i]; segIdx = i; segHr = [];
    }
  }

  /* --- Desacople aeróbico (Pw:Hr): compara la EFICIENCIA (ritmo por pulsación)
     de la 1ª vs la 2ª mitad del trabajo, descartando el primer km de calentamiento
     y partiendo por TIEMPO. --- */
  const d0Dist = recs[0].distance;
  let ini = recs.findIndex(r => r.distance - d0Dist >= 1);
  if (ini < 5) ini = 0;
  const work = recs.slice(ini), Tw = T.slice(ini);
  const tMid = (Tw[0] + Tw[Tw.length - 1]) / 2;
  const corte = work.findIndex((_, i) => Tw[i] > tMid);
  const mitad = (a, b) => {
    const seg = work.slice(a, b), Ts = Tw.slice(a, b);
    if (seg.length < 2) return null;
    const distKm = seg[seg.length - 1].distance - seg[0].distance;
    const timeSec = (Ts[Ts.length - 1] - Ts[0]) / 1000;
    const hrMean = media(seg.map(r => r.heart_rate).filter(v => v != null));
    if (!hrMean || distKm <= 0 || timeSec <= 0) return null;
    return { hr: Math.round(hrMean), pace: fmtPace(timeSec, distKm), ef: (distKm * 1000 / timeSec) / hrMean };
  };
  const m1 = corte > 1 ? mitad(0, corte) : null;
  const m2 = corte > 1 ? mitad(corte, work.length) : null;
  const desacople = {
    hr1: m1?.hr ?? null, hr2: m2?.hr ?? null,
    pace1: m1?.pace ?? null, pace2: m2?.pace ?? null,
    pct: (m1 && m2) ? Math.round(((m1.ef - m2.ef) / m1.ef) * 1000) / 10 : null
  };

  return {
    fecha,
    km: Math.round(kmTotal * 100) / 100,
    durMin: Math.round((tN - t0) / 60000),
    hrAvg: hr.length ? Math.round(media(hr)) : null,
    hrMax: hr.length ? Math.max(...hr) : null,
    paceAvg,
    gapAvg,
    gain: Math.round(gain),
    cadAvg: cad.length ? Math.round(media(cad)) : null,
    splits,
    deriva: desacople,   // el nombre se mantiene por compatibilidad; ahora es desacople real
    zonas,
    umbrales: { facil: FACIL, techo: TECHO }
  };
}
