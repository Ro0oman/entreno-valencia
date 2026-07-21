/* ============================================================
   Análisis de un .fit — lo que la media de FC esconde.
   No toca sesiones.json: recibe los registros del fichero y
   devuelve splits, desacople aeróbico y tiempo en zonas.
   Zonas de Roman: fácil 148-158 · techo 162 (ver perfil).
   ============================================================ */

const TECHO = 162;
const FACIL = [148, 158];
const TZ = 'Europe/Madrid';       // Roman entrena en Valencia: fecha en su hora local
const MOV = 2;                    // km/h por debajo de esto se considera parado
const DT_MAX = 10;               // s: recorta huecos de autopausa para no inflar tiempos

const media = a => a.length ? a.reduce((s, x) => s + x, 0) / a.length : null;
const fmtPace = (sec, km) => (km > 0 ? Math.round(sec / km) : null); // s/km = tiempo ÷ distancia

export function analizarFit(records) {
  const recs = (records || []).filter(r => r.timestamp && r.distance != null);
  if (recs.length < 30) throw new Error('sin datos de carrera');

  const T = recs.map(r => new Date(r.timestamp).getTime());
  const t0 = T[0], tN = T[T.length - 1];
  // Fecha en hora local de Valencia (en-CA da YYYY-MM-DD; respeta el horario de verano).
  const fecha = new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(new Date(t0));

  const hr = recs.map(r => r.heart_rate).filter(v => v != null);
  const cad = recs.map(r => r.cadence).filter(v => v != null).map(v => v * 2); // por pierna → real
  const kmTotal = recs[recs.length - 1].distance;

  /* --- Recorrido "en movimiento": tiempo y distancia sumando intervalo a
     intervalo, descartando parones. De aquí sale el ritmo medio REAL
     (tiempo ÷ distancia), no una media de ritmos instantáneos. --- */
  let movSec = 0, movKm = 0;
  const segsZona = { bajo: 0, facil: 0, alto: 0, techo: 0 };
  for (let i = 1; i < recs.length; i++) {
    const dt = Math.min((T[i] - T[i - 1]) / 1000, DT_MAX);
    if (dt <= 0) continue;
    if ((recs[i].speed || 0) > MOV) {
      movSec += dt;
      movKm += Math.max(0, recs[i].distance - recs[i - 1].distance);
    }
    // tiempo en zonas ponderado por segundos (no por nº de muestras)
    const x = recs[i].heart_rate;
    if (x != null) {
      if (x < FACIL[0]) segsZona.bajo += dt;
      else if (x <= FACIL[1]) segsZona.facil += dt;
      else if (x <= TECHO) segsZona.alto += dt;
      else segsZona.techo += dt;
    }
  }
  const paceAvg = movKm > 0.1 ? Math.round(movSec / movKm) : null;
  const totalZ = (segsZona.bajo + segsZona.facil + segsZona.alto + segsZona.techo) || 1;
  const pc = s => Math.round((s / totalZ) * 100);
  const zonas = { bajo: pc(segsZona.bajo), facil: pc(segsZona.facil), alto: pc(segsZona.alto), techo: pc(segsZona.techo) };

  /* --- splits por km (ritmo = tiempo entre marcas de km; FC media del tramo) --- */
  const splits = [];
  let marca = 1, segT = t0, segHr = [];
  for (let i = 0; i < recs.length; i++) {
    if (recs[i].heart_rate != null) segHr.push(recs[i].heart_rate);
    if (recs[i].distance >= marca) {
      const hrSeg = segHr.length ? Math.round(media(segHr)) : null;
      splits.push({ km: marca, paceSec: Math.round((T[i] - segT) / 1000), hr: hrSeg, techo: hrSeg != null && hrSeg > TECHO });
      marca++; segT = T[i]; segHr = [];
    }
  }

  /* --- Desacople aeróbico (Pw:Hr / decoupling): compara la EFICIENCIA
     (ritmo por pulsación) entre la 1ª y la 2ª mitad del trabajo, NO la FC
     sola. Se descarta el primer km de calentamiento y se parte por TIEMPO. --- */
  const d0Dist = recs[0].distance;
  let ini = recs.findIndex(r => r.distance - d0Dist >= 1); // fin del calentamiento (~1 km)
  if (ini < 5) ini = 0;                                     // carrera corta: sin descarte
  const work = recs.slice(ini);
  const Tw = T.slice(ini);
  const tMid = (Tw[0] + Tw[Tw.length - 1]) / 2;
  const corte = work.findIndex((_, i) => Tw[i] > tMid);
  const mitad = (a, b) => {
    const seg = work.slice(a, b), Ts = Tw.slice(a, b);
    if (seg.length < 2) return null;
    const distKm = seg[seg.length - 1].distance - seg[0].distance;
    const timeSec = (Ts[Ts.length - 1] - Ts[0]) / 1000;
    const hrs = seg.map(r => r.heart_rate).filter(v => v != null);
    const hrMean = media(hrs);
    if (!hrMean || distKm <= 0 || timeSec <= 0) return null;
    const speed = (distKm * 1000) / timeSec;             // m/s
    return { hr: Math.round(hrMean), pace: fmtPace(timeSec, distKm), ef: speed / hrMean };
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
    cadAvg: cad.length ? Math.round(media(cad)) : null,
    splits,
    deriva: desacople,   // el nombre se mantiene por compatibilidad; ahora es desacople real
    zonas,
    umbrales: { facil: FACIL, techo: TECHO }
  };
}
