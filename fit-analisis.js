/* ============================================================
   Análisis de un .fit — lo que la media de FC esconde.
   No toca sesiones.json: recibe los registros del fichero y
   devuelve splits, deriva cardíaca y tiempo en zonas.
   Zonas de Roman: fácil 148-158 · techo 162 (ver perfil).
   ============================================================ */

const TECHO = 162;
const FACIL = [148, 158];

const media = a => a.length ? a.reduce((s, x) => s + x, 0) / a.length : null;
// velocidad del .fit en km/h → ritmo en segundos por km
const ritmoSeg = kmh => (kmh > 0 ? Math.round((60 / kmh) * 60) : null);

export function analizarFit(records) {
  const recs = (records || []).filter(r => r.timestamp && r.distance != null);
  if (recs.length < 30) throw new Error('sin datos de carrera');

  const d0 = new Date(recs[0].timestamp);
  const t0 = d0.getTime();
  const tN = new Date(recs[recs.length - 1].timestamp).getTime();
  // Fecha del entreno (los rodajes de Roman son de mañana/tarde: fecha UTC = local).
  const fecha = d0.toISOString().slice(0, 10);
  const hr = recs.map(r => r.heart_rate).filter(v => v != null);
  const spd = recs.map(r => r.speed).filter(v => v > 0);
  // cadencia del .fit es por pierna; ×2 = zancadas/min reales
  const cad = recs.map(r => r.cadence).filter(v => v != null).map(v => v * 2);

  const kmTotal = recs[recs.length - 1].distance;

  /* --- splits por km --- */
  const splits = [];
  let marca = 1, segT = t0, segHr = [];
  for (const r of recs) {
    if (r.heart_rate != null) segHr.push(r.heart_rate);
    if (r.distance >= marca) {
      const t = new Date(r.timestamp).getTime();
      splits.push({
        km: marca,
        paceSec: Math.round((t - segT) / 1000),
        hr: segHr.length ? Math.round(media(segHr)) : null,
        techo: segHr.length ? Math.round(media(segHr)) > TECHO : false
      });
      marca++; segT = t; segHr = [];
    }
  }

  /* --- deriva cardíaca: 1ª mitad vs 2ª mitad --- */
  const mid = Math.floor(recs.length / 2);
  const hrDe = (a, b) => media(recs.slice(a, b).map(r => r.heart_rate).filter(v => v != null));
  const paceDe = (a, b) => media(recs.slice(a, b).map(r => ritmoSeg(r.speed)).filter(v => v != null));
  const h1 = hrDe(0, mid), h2 = hrDe(mid, recs.length);
  const deriva = {
    hr1: Math.round(h1), hr2: Math.round(h2),
    pace1: Math.round(paceDe(0, mid)), pace2: Math.round(paceDe(mid, recs.length)),
    pct: h1 ? Math.round(((h2 - h1) / h1) * 1000) / 10 : null
  };

  /* --- tiempo en zonas (sobre muestras de FC) --- */
  const total = hr.length || 1;
  let bajo = 0, facil = 0, alto = 0, techo = 0;
  for (const x of hr) {
    if (x < FACIL[0]) bajo++;
    else if (x <= FACIL[1]) facil++;
    else if (x <= TECHO) alto++;
    else techo++;
  }
  const pc = n => Math.round((n / total) * 100);
  const zonas = { bajo: pc(bajo), facil: pc(facil), alto: pc(alto), techo: pc(techo) };

  return {
    fecha,
    km: Math.round(kmTotal * 100) / 100,
    durMin: Math.round((tN - t0) / 60000),
    hrAvg: hr.length ? Math.round(media(hr)) : null,
    hrMax: hr.length ? Math.max(...hr) : null,
    paceAvg: spd.length ? Math.round(media(spd.map(ritmoSeg).filter(Boolean))) : null,
    cadAvg: cad.length ? Math.round(media(cad)) : null,
    splits, deriva, zonas,
    umbrales: { facil: FACIL, techo: TECHO }
  };
}
