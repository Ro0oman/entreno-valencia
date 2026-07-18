/* ============================================================
   EL PLAN — Fase base v2.1. Único archivo que tocas para cambiar entrenos.
   Maratón Valencia · 6 dic 2026 · sub-4h (5:41/km)
   ============================================================ */

export const META = new Date('2026-12-06T00:00:00');
export const INICIO_COROS = new Date('2026-08-17T00:00:00');

/* Los saltos de impacto (cajón, A-skips) van al parque, sobre césped (ver parque()).
   En casa solo pogos en el sitio, dentro de Fuerza B: bajo impacto, cualquier suelo vale. */
const REGLA_PLIO = ['Solo sobre césped, tierra o pista. Nunca asfalto. Al primer aviso del Aquiles, se acabó.', 'warn'];
const NOTA_HOMBRO = ['Press hombro: agarre neutro, RPE 6-7, sin bloquear arriba.', 'warn'];

/* Pliometría del PARQUE: el sitio para saltar. En casa el suelo no acompaña;
   aquí hay césped y piernas razonablemente frescas. Contacto corto y explosivo.
   Cada ejercicio: { ej, dosis (series × repes/tiempo), nota }. */
const PLIO_PARQUE = [
  { ej: 'Pogo hops', dosis: '2-3 × 20-30"', nota: 'Rebote de tobillo, rodilla casi recta. Contacto corto.' },
  { ej: 'Saltos al cajón · 30-40-50 cm', dosis: '3 × 5', nota: 'Sube saltando, BAJA ANDANDO. Subes de altura solo si aterrizas suave.' },
  { ej: 'A-skips', dosis: '2 × 20 m', nota: 'Técnica y coordinación, no velocidad.' }
];
const CIRCUITO_PARQUE = [
  { ej: 'Flexiones', dosis: '× 15' },
  { ej: 'Dominadas', dosis: '3 × 5' },
  { ej: 'Fondos', dosis: '3 × 5', nota: 'Sin bajar de 90°. El hombro no se negocia.' },
  { ej: 'Remos invertidos', dosis: '3 × 8' }
];

/* Sesión de parque completa. Se usa igual en fase base y en el bloque COROS.
   grupos = cajas del acordeón; cada una despliega su lista de ejercicios. */
function parque() {
  return {
    kind: 'parque', t: 'Parque · barras',
    sub: 'Dos bloques: primero saltar en el césped con piernas frescas, luego el circuito de barras. Si vienes con las piernas cargadas, sáltate la pliometría: hoy no pasa nada.',
    grupos: [
      { t: 'Pliometría', st: 'En el césped', ej: PLIO_PARQUE },
      { t: 'Circuito de barras', st: 'Al terminar los saltos', ej: CIRCUITO_PARQUE }
    ],
    notes: [
      REGLA_PLIO,
      ['Fondos: sin bajar de 90°. El hombro no se negocia.', 'stop']
    ]
  };
}

/* Fuerza A (full body, martes). La sentadilla cambia de carga cada semana;
   el resto son las cargas reales de tu sesión registrada (log de Hevy, S1). */
function fuerzaA(kg) {
  return {
    t: 'Fuerza A', st: 'Full body · 3 series',
    ej: [
      { ej: 'Sentadilla (barra)', dosis: kg ? `${kg} kg · 3 × 5` : '3 × 5 · la carga que toque', nota: 'La carga de la semana. RPE 7-8, nada al fallo.' },
      { ej: 'Peso muerto rumano (barra)', dosis: '35 kg · 3 × 8', nota: 'Bisagra de cadera, espalda neutra.' },
      { ej: 'Press de banca (barra)', dosis: '45 kg · 3 × 6', nota: 'Codos a ~45°, sin rebote. El hombro manda.' },
      { ej: 'Remo inclinado a una pierna', dosis: '20 kg · 3 × 5-6' },
      { ej: 'Elevación de gemelos de pie (mancuerna)', dosis: '26 kg · 3 × 13-15' },
      { ej: 'Elevación de tibiales', dosis: '3 × 20', nota: 'Peso corporal. Seguro anti-Aquiles y anti-espinilla.' },
      { ej: 'Plancha', dosis: '3 × 40"' },
      { ej: 'Rotación externa con goma', dosis: '2 × 15', nota: 'Con goma, por lado. Tu seguro del hombro, todas las semanas.' }
    ]
  };
}

/* Fuerza B (full body, jueves, sin correr). Incluye los pogos de mantenimiento
   en el sitio (bajo impacto: valen en casa). Los kilos son ORIENTATIVOS
   (Roman no los registró): puntos de partida para ajustar sobre la marcha. */
const FUERZA_B = {
  t: 'Fuerza B', st: 'Full body · cargas orientativas',
  ej: [
    { ej: 'Sentadilla búlgara', dosis: '12 kg · 3 × 10', nota: 'Peso por mancuerna. Ajústalo a tu sensación.' },
    { ej: 'Empuje de caderas (barra)', dosis: '50 kg · 3 × 10' },
    { ej: 'Press de hombros (mancuerna)', dosis: '12 kg · 3 × 8', nota: 'Agarre neutro, RPE 6-7, sin bloquear arriba.' },
    { ej: 'Jalón al pecho (cable)', dosis: '35 kg · 3 × 8' },
    { ej: 'Tirón a la cara', dosis: '18 kg · 3 × 15', nota: 'Salud de hombro y postura.' },
    { ej: 'Rotación externa con goma', dosis: '2 × 15', nota: 'Con goma, por lado. Todas las semanas.' },
    { ej: 'Elevación de gemelos a una pierna', dosis: '3 × 12', nota: 'Peso corporal; añade mancuerna si te sobra.' },
    { ej: 'Abdominal corto con cable', dosis: '22 kg · 3 × 12' },
    { ej: 'Dead bug', dosis: '3 × 10', nota: 'Peso corporal. Core anti-extensión, lumbar pegada al suelo.' },
    { ej: 'Pogo jumps', dosis: '3 × 30"', nota: 'Rigidez del tendón + cadencia. En el sitio, contacto corto.' }
  ]
};

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

  /* Semana 1: Londres. No cabe en la plantilla; se define a mano. */
  if (w.viaje) {
    PLAN[w.lunes] = {
      kind: 'rodaje', t: 'Rodaje 8 km + Fuerza A', km: 8, hr: 'facil',
      sub: 'Arranque del plan. Semana rara: mañana te vas a Londres. Rodaje fácil y Fuerza A tranquila, que vienes justo de descanso.',
      grupos: [fuerzaA(w.sentadilla)],
      notes: [
        ['Fuerza A sin apretar: RPE 7, nada al fallo.'],
        ['No compenses lo de Londres el domingo. Compensar es la forma más rápida de lesionarse en la S1.', 'warn']
      ]
    };
    PLAN[mas(w.lunes, 1)] = { kind: 'descanso', t: 'Londres ✈️', sub: 'Nada de correr. Los 20.000 pasos/día son carga aeróbica gratis.' };
    PLAN[mas(w.lunes, 2)] = { kind: 'descanso', t: 'Londres ✈️', sub: 'Anda todo lo que puedas. No busques meter kilómetros de carrera.' };
    PLAN[mas(w.lunes, 3)] = { kind: 'descanso', t: 'Londres ✈️', sub: 'Último día fuera. Mañana se retoma con fuerza en casa.' };
    PLAN[mas(w.lunes, 4)] = {
      kind: 'fuerza', t: 'Fuerza A',
      sub: 'Vuelta de Londres. Fuerza A completa en casa. Los saltos, mejor mañana en el parque sobre césped.',
      grupos: [fuerzaA(w.sentadilla)],
      notes: [
        ['3 series por ejercicio. Para al menor aviso del Aquiles.', 'warn']
      ]
    };
    PLAN[mas(w.lunes, 5)] = parque();
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

  /* Martes — rodaje fácil por la mañana + Fuerza A por la tarde */
  PLAN[mas(w.lunes, 1)] = {
    kind: 'rodaje', t: `Rodaje ${a} km + Fuerza A`, km: a, hr: 'facil',
    sub: 'Rodaje fácil por la mañana; Fuerza A por la tarde. El ritmo es una consecuencia, no un objetivo.',
    grupos: [fuerzaA(w.sentadilla)],
    notes: [
      w.descarga
        ? ['Semana de descarga: la sentadilla baja un 20%. No busques records.', 'warn']
        : ['Fuerza A por la tarde. Nada al fallo, RPE 7-8.'],
      ['Techo de barra: 67 kg. Progresas de 2 en 2.']
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

  /* Jueves — Fuerza B (incluye los pogos de mantenimiento) */
  PLAN[mas(w.lunes, 3)] = {
    kind: 'fuerza', t: 'Fuerza B',
    sub: 'Sin correr. Full body, con los pogos de mantenimiento al final.',
    grupos: [FUERZA_B],
    notes: [
      NOTA_HOMBRO,
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
  PLAN[mas(w.lunes, 5)] = parque();

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
  2: { kind: 'rodaje', t: 'Plan COROS + Fuerza A', sub: 'Lo que ponga el reloj + Fuerza A por la tarde.', hr: 'facil', km: true, grupos: [fuerzaA()] },
  3: { kind: 'rodaje', t: 'Plan COROS', sub: 'Lo que ponga el reloj.', hr: 'facil', km: true },
  4: { kind: 'fuerza', t: 'Fuerza B', sub: 'Sin correr. Full body con pogos de mantenimiento.', grupos: [FUERZA_B], notes: [NOTA_HOMBRO, ['Techo de barra: 67 kg. Progresas de 2 en 2.']] },
  5: { kind: 'rodaje', t: 'Plan COROS', sub: 'Lo que ponga el reloj.', hr: 'facil', km: true },
  6: parque(),
  0: { kind: 'larga', t: 'Tirada larga · COROS', sub: 'La sesión sagrada. Hidratación y guayaba según duración.', hr: 'larga', km: true }
};

/* ============================================================
   AJUSTES — cambios puntuales acordados en el chat de coaching.
   Se aplican POR ENCIMA del plan generado: sesionDe() los mira primero.
   Cada entrada lleva su 'motivo' para que el git log explique el porqué.
   Con el objeto vacío, el plan se comporta igual que sin esta capa.

   Ejemplo (borrar cuando no aplique):
   '2026-07-19': {
     kind: 'descanso', t: 'Descanso extra',
     sub: 'Cuádriceps KO de la Fuerza A del viernes. La larga se mueve al lunes.',
     motivo: 'DOMS cuádriceps 18-jul — 4ª serie de sentadilla'
   },
   ============================================================ */
export const AJUSTES = {
};

export function sesionDe(fecha) {
  if (AJUSTES[fecha]) return AJUSTES[fecha];
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
