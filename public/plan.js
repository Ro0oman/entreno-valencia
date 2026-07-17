/* ============================================================
   EL PLAN — Fase base v2.1. Único archivo que tocas para cambiar entrenos.
   Maratón Valencia · 6 dic 2026 · sub-4h (5:41/km)
   ============================================================ */

export const META = new Date('2026-12-06T00:00:00');
export const INICIO_COROS = new Date('2026-08-17T00:00:00');

/* Bloque de pliometría v2.1 — antes de levantar, piernas frescas.
   Superficie blanda, contacto corto y explosivo, para al primer aviso del Aquiles. */
const PLIO = 'Pogo hops 2-3×20-30" · A-skips 2×20 m · saltos a dos pies 2×8-10 · 6-8 min';
const PLIO_SUAVE = 'Suave y corta: pogo hops 2×20" · A-skips 2×20 m. Vienes de viaje, sin caña.';

const REGLA_PLIO = ['Solo sobre césped, tierra o pista. Nunca asfalto. Al primer aviso del Aquiles, se acabó.', 'warn'];
const NOTA_ROT = ['Rotación externa con goma 2×15 por lado. Lo dejaste; vuelve a meterlo.'];
const NOTA_HOMBRO = ['Press hombro: agarre neutro, RPE 6-7, sin bloquear arriba.', 'warn'];

/* Nutrición de la tirada larga, según distancia (v2.1 §6) */
function nutriLarga(km) {
  const sodio = ['Verano en Valencia: 400-600 ml de agua/hora + 1-2 cápsulas de sales.', 'warn'];
  let comida;
  if (km <= 10)      comida = ['Menos de ~70 min: solo agua, sin comer.'];
  else if (km <= 12) comida = ["Bocadillo de guayaba a los 50' (~30 g ≈ un gel). Siempre con agua."];
  else if (km <= 14) comida = ["Bocadillo de guayaba a los 45' y a los 85'. Siempre con agua."];
  else               comida = ["Bocadillo a los 40' y a los 80' + agua constante. Ensayas los 60-90 g CH/hora del día M."];
  return [comida, sodio];
}

/* Las 5 semanas de la fase base (13 jul → 16 ago).
   km = [martes, miércoles, viernes, domingo]. La S1 es atípica (Londres). */
export const BASE = [
  { lunes: '2026-07-13', km: [0, 0, 0, 10], total: 18, viaje: true, sentadilla: 37 },
  { lunes: '2026-07-20', km: [8, 6, 6, 12], total: 32, sentadilla: 41, rectas: true },
  { lunes: '2026-07-27', km: [8, 7, 8, 14], total: 37, sentadilla: 45,
    calidad: "2 km calentar + 4×6' a RPE 7-8 (rec. 2' trote) + 1,5 km soltar" },
  { lunes: '2026-08-03', km: [8, 6, 7, 10], total: 31, sentadilla: 39, descarga: true, rectas: true },
  { lunes: '2026-08-10', km: [9, 8, 9, 16], total: 42, sentadilla: 47, rectas: true,
    calidad: "2 km calentar + 5×6' a RPE 7-8 (rec. 2') + 1,5 km soltar",
    largaNota: '13 km fáciles + últimos 3 km a RITMO MARATÓN (5:35-5:40). Primer test real de RM sobre piernas cansadas.' }
];

const iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const mas = (s, n) => { const d = new Date(s + 'T00:00:00'); d.setDate(d.getDate() + n); return iso(d); };

/* Calendario día a día, generado desde BASE */
export const PLAN = {};

BASE.forEach((w, i) => {
  const sem = i + 1;
  const [a, b, c, larga] = w.km;
  const dc = w.descarga ? ' (semana de descarga)' : '';
  const tresSeries = w.viaje || w.descarga;
  const cargaFA = w.descarga ? ` (cargas -20%, 3 series)` : (w.viaje ? ' (3 series)' : '');

  /* Semana 1: Londres. No cabe en la plantilla; se define a mano. */
  if (w.viaje) {
    PLAN[w.lunes] = {
      kind: 'rodaje', t: 'Rodaje 8 km + Fuerza A', km: 8, hr: 'facil',
      sub: `Arranque del plan. Semana rara: mañana te vas a Londres. ${PLIO_SUAVE}`,
      notes: [
        REGLA_PLIO,
        [`Fuerza A: sentadilla ${w.sentadilla} kg, solo 3 series. Sin apretar, vienes justo de descanso.`],
        ['No compenses lo de Londres el domingo. Compensar es la forma más rápida de lesionarse en la S1.', 'warn']
      ]
    };
    PLAN[mas(w.lunes, 1)] = { kind: 'descanso', t: 'Londres ✈️', sub: 'Nada de correr. Los 20.000 pasos/día son carga aeróbica gratis.' };
    PLAN[mas(w.lunes, 2)] = { kind: 'descanso', t: 'Londres ✈️', sub: 'Anda todo lo que puedas. No busques meter kilómetros de carrera.' };
    PLAN[mas(w.lunes, 3)] = { kind: 'descanso', t: 'Londres ✈️', sub: 'Último día fuera. Mañana se retoma con fuerza en casa.' };
    PLAN[mas(w.lunes, 4)] = {
      kind: 'fuerza', t: 'Pliometría suave + Fuerza A',
      sub: `Sin correr. ${PLIO_SUAVE}`,
      notes: [
        REGLA_PLIO,
        [`Sentadilla ${w.sentadilla} kg, solo 3 series. Para al menor aviso del Aquiles.`, 'warn'],
        NOTA_ROT
      ]
    };
    PLAN[mas(w.lunes, 5)] = {
      kind: 'parque', t: 'Parque · barras',
      sub: '15 flexiones · 3×5 dominadas · 3×5 fondos · 3×8 remos invertidos',
      notes: [['Fondos: sin bajar de 90°. El hombro no se negocia.', 'stop']]
    };
    PLAN[mas(w.lunes, 6)] = {
      kind: 'larga', t: `Tirada larga ${larga} km`, km: larga, hr: 'larga',
      sub: `Semana 1 de la fase base · ${w.total} km en total. La sesión sagrada: si algo se cae esta semana, no es esta.`,
      notes: nutriLarga(larga)
    };
    return;
  }

  /* Lunes — descanso */
  PLAN[w.lunes] = {
    kind: 'descanso', t: 'Descanso',
    sub: 'Sin correr. El descanso es parte del plan, no un premio.'
  };

  /* Martes — rodaje + pliometría + Fuerza A */
  PLAN[mas(w.lunes, 1)] = {
    kind: 'rodaje', t: `Rodaje ${a} km + Fuerza A`, km: a, hr: 'facil',
    sub: `Rodaje por la mañana. Por la tarde, pliometría antes de levantar: ${PLIO}`,
    notes: [
      REGLA_PLIO,
      [`Fuerza A: sentadilla ${w.sentadilla} kg${cargaFA}. Nada al fallo, RPE 7-8.`]
    ]
  };

  /* Miércoles — rodaje fácil, o CALIDAD en S3 y S5 */
  if (w.calidad) {
    PLAN[mas(w.lunes, 2)] = {
      kind: 'calidad', t: `Calidad ≈ ${b} km`, km: b,
      sub: w.calidad,
      notes: [
        ['Los bloques a RPE 7-8: en calor, por sensación (~5:10-5:25/km). No los conviertas en carrera.', 'warn'],
        ['Calienta bien los 2 km. Suelta trotando, no andando.']
      ]
    };
  } else {
    PLAN[mas(w.lunes, 2)] = {
      kind: 'rodaje', t: `Rodaje ${b} km`, km: b, hr: 'facil',
      sub: 'Fácil de verdad. El ritmo es una consecuencia, no un objetivo.',
      notes: [['Si el pulso se dispara con el calor, frena. Manda la FC, no el crono.']]
    };
  }

  /* Jueves — pliometría + Fuerza B */
  PLAN[mas(w.lunes, 3)] = {
    kind: 'fuerza', t: 'Pliometría + Fuerza B',
    sub: `Sin correr. Pliometría antes de levantar: ${PLIO}`,
    notes: [
      REGLA_PLIO,
      NOTA_HOMBRO,
      NOTA_ROT,
      ['Techo de barra: 67 kg. Progresas de 2 en 2.']
    ]
  };

  /* Viernes — rodaje (+ rectas en S2, S4, S5) */
  PLAN[mas(w.lunes, 4)] = w.rectas ? {
    kind: 'rodaje', t: `Rodaje ${c} km + rectas`, km: c, hr: 'facil',
    sub: 'Al acabar: 6 rectas de 20" a ~4:30/km. Rápido y relajado, no es velocidad.',
    notes: [['Las rectas se hacen sueltas, sin apretar la mandíbula.']]
  } : {
    kind: 'rodaje', t: `Rodaje ${c} km`, km: c, hr: 'facil',
    sub: 'Fácil. Mañana toca parque y pasado la tirada larga. No lo estropees yendo rápido.',
    notes: [['Este es el día que más se estropea corriendo de más. Guárdate para el domingo.', 'warn']]
  };

  /* Sábado — parque */
  PLAN[mas(w.lunes, 5)] = {
    kind: 'parque', t: 'Parque · barras',
    sub: '15 flexiones · 3×5 dominadas · 3×5 fondos · 3×8 remos invertidos',
    notes: [['Fondos: sin bajar de 90°. El hombro no se negocia.', 'stop']]
  };

  /* Domingo — tirada larga */
  PLAN[mas(w.lunes, 6)] = {
    kind: 'larga', t: `Tirada larga ${larga} km`, km: larga, hr: 'larga',
    sub: `Semana ${sem} de la fase base · ${w.total} km en total${dc}. La sesión sagrada: si algo se cae esta semana, no es esta.` +
         (w.largaNota ? ` ${w.largaNota}` : ''),
    notes: nutriLarga(larga)
  };
});

/* Del 17 ago al 6 dic manda COROS. Aquí solo se fijan los anclajes. */
export const COROS = {
  1: { kind: 'rodaje', t: 'Plan COROS', sub: 'Lo que ponga el reloj.', hr: 'facil' },
  2: { kind: 'rodaje', t: 'Plan COROS + Fuerza A', sub: 'Pliometría de mantenimiento: 1 día, volumen bajo.', hr: 'facil', km: true },
  3: { kind: 'rodaje', t: 'Plan COROS', sub: 'Lo que ponga el reloj.', hr: 'facil', km: true },
  4: { kind: 'fuerza', t: 'Fuerza B + pliometría', sub: 'Techo de barra 67 kg. Hombro: agarre neutro, sin bloquear arriba.' },
  5: { kind: 'rodaje', t: 'Plan COROS', sub: 'Lo que ponga el reloj.', hr: 'facil', km: true },
  6: { kind: 'parque', t: 'Parque · barras', sub: '15 flexiones · 3×5 dominadas · 3×5 fondos · 3×8 remos invertidos' },
  0: { kind: 'larga', t: 'Tirada larga · COROS', sub: 'La sesión sagrada. Hidratación y guayaba según duración.', hr: 'larga', km: true }
};

export function sesionDe(fecha) {
  if (fecha === '2026-12-06') return {
    kind: 'larga', t: 'MARATÓN VALENCIA', hr: 'larga',
    sub: '42,195 km a 5:41/km. Hoy no se entrena, hoy se cobra.',
    notes: [
      ['Sales antes de salir. Geles y guayaba repartidos: 60-90 g de CH por hora.'],
      ['Los primeros 10 km te van a parecer lentos. Que te lo parezcan.', 'warn'],
      ['Nada nuevo hoy. Ni zapatilla, ni gel, ni desayuno.', 'stop']
    ]
  };
  if (PLAN[fecha]) return PLAN[fecha];
  const d = new Date(fecha + 'T00:00:00');
  if (d >= INICIO_COROS && d <= META) return COROS[d.getDay()];
  if (d > META) return { kind: 'descanso', t: 'Ya está', sub: 'La maratón fue el 6 de diciembre.' };
  return { kind: 'descanso', t: 'Sin plan', sub: 'Fuera del calendario del maratón.' };
}
