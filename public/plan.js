/* ============================================================
   EL PLAN — Fase base v2.1 + bloque COROS. Único archivo que tocas para
   cambiar entrenos. Maratón Valencia · 6 dic 2026 · sub-4h (5:41/km)

   Dos mitades:
   · 13 jul → 16 ago  fase base, escrita a mano aquí abajo (BASE).
   · 17 ago → 6 dic   plan de maratón de COROS, volcado en coros-plan.js.
     Aquí solo se traduce a ficha y se le añade lo que COROS no sabe:
     tu Fuerza A del martes y el parque del sábado.
   ============================================================ */

import { AGENDA, aMinutos } from './coros-plan.js';

export const META = new Date('2026-12-06T00:00:00');
export const INICIO_COROS = new Date('2026-08-17T00:00:00');

/* Los saltos de impacto (cajón, A-skips) van al parque, sobre césped (ver parque()).
   En casa solo pogos en el sitio, dentro de Fuerza B: bajo impacto, cualquier suelo vale. */
const REGLA_PLIO = ['Solo sobre césped, tierra o pista. Nunca asfalto. Al primer aviso del Aquiles, se acabó.', 'warn'];
// APARCADO: se usaba en la Fuerza B, ahora retirada. Se conserva por si vuelve.
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
   el resto son las cargas reales de tu sesión registrada (log de Hevy, S1).
   `mant` = modo mantenimiento del bloque COROS: carga fija y 2 series en vez de
   3. Durante un bloque de maratón la fuerza conserva, no construye. El número de
   series se sustituye en TODAS las dosis (`s`), no solo en el subtítulo: si la
   cabecera dice 2 series y los ejercicios siguen poniendo 3, la ficha miente. */
function fuerzaA(kg, mant = false) {
  const s = mant ? 2 : 3;
  return {
    t: 'Fuerza A', st: mant ? 'Full body · MANTENIMIENTO · 2 series' : 'Full body · 3 series',
    ej: [
      { ej: 'Sentadilla (barra)', dosis: `${kg} kg · ${s} × 5`,
        nota: mant ? 'Mantenimiento: carga fija, RPE 6. Ni progresas ni bajas. Todo a 2 series.'
                   : 'La carga de la semana. RPE 7-8, nada al fallo.' },
      { ej: 'Peso muerto rumano (barra)', dosis: `35 kg · ${s} × 8`, nota: 'Bisagra de cadera, espalda neutra.' },
      { ej: 'Press de banca (barra)', dosis: `45 kg · ${s} × 6`, nota: 'Codos a ~45°, sin rebote. El hombro manda.' },
      { ej: 'Remo inclinado a una pierna', dosis: `20 kg · ${s} × 5-6` },
      { ej: 'Elevación de gemelos de pie (mancuerna)', dosis: `26 kg · ${s} × 13-15` },
      { ej: 'Elevación de tibiales', dosis: `${s} × 20`, nota: 'Peso corporal. Seguro anti-Aquiles y anti-espinilla.' },
      { ej: 'Plancha', dosis: `${s} × 40"` },
      { ej: 'Rotación externa con goma', dosis: '2 × 15', nota: 'Con goma, por lado. Tu seguro del hombro, todas las semanas.' }
    ]
  };
}

/* Fuerza B — APARCADA. Roman pasó a una sola sesión de fuerza (la A del martes)
   porque dos le disparaban las agujetas. Se conserva el bloque entero por si
   más adelante quiere reintroducirla; hoy no se programa en ningún día.
   Full body, sin correr, con pogos de mantenimiento. Kilos orientativos. */
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

/* ============================================================
   SALES — 226ERS SUB-9 Salts Electrolytes. 250 mg de sodio por cápsula.
   45 min entre tomas ≈ 333 mg/h: es el punto de partida para probar tolerancia.
   Si hace falta bajarlo a 30, se cambia AQUÍ y ni el checklist ni la pauta
   necesitan tocar código.
   ============================================================ */
export const SALES = {
  intervaloMin: 35,           // con precargaAntesDeSalir:false el nominal engaña: la 1ª toma
                              // llega tarde. A 45' una tirada de 90 min recibía UNA cápsula
                              // (~167 mg/h, la mitad del diseño). A 35' recibe 2 ≈ 333 mg/h reales.
  mgPorCapsula: 250,
  umbralDuracionMin: 40,      // por debajo de esto la sesión no entra
  umbralTempC: 28,
  margenFinalMin: 10,         // no se programa una toma si queda menos que esto para acabar
  precargaAntesDeSalir: false // false = la primera toma va en el minuto `intervaloMin`,
                              // no en el 0: se repone lo sudado, no se precarga
};

/* Ritmo con el que se estima la duración de una sesión, por tipo de día.
   No es un objetivo: solo sirve para saber cuánto vas a estar fuera. min/km.
   Calibrado con los ritmos reales de Roman, no con los objetivos: los rodajes
   fáciles van a 7:20-7:30 y la larga del 2 ago salió a 6:45. Con los valores
   optimistas de antes un rodaje de 8 km se estimaba en 50 min y no disparaba
   ninguna cápsula de sales; con estos son 59 min y sí. */
const RITMO_EST = { facil: 7.4, larga: 6.9, calidad: 6.7 };

/* Duración estimada en minutos. Prioriza el `durMin` explícito de la sesión;
   si no lo hay, la calcula desde los km. Devuelve 0 cuando no se puede saber
   (fuerza, parque, días de COROS con `km: true`), y entonces no se pinta nada. */
export function duracionEstimadaMin(s) {
  if (!s) return 0;
  if (typeof s.durMin === 'number') return s.durMin;
  if (typeof s.km !== 'number') return 0;
  return Math.round(s.km * (RITMO_EST[s.kind] || RITMO_EST[s.hr] || RITMO_EST.facil));
}

/* Minutos de toma: 0, intervalo, 2·intervalo… mientras caigan dentro de la sesión
   y quede sesión por delante para que la cápsula sirva de algo (margenFinalMin:
   tomarse una sal a falta de cinco minutos no repone nada).
   Vacío si la sesión no llega al umbral de duración. */
export function minutosSales(dur) {
  if (!dur || dur < SALES.umbralDuracionMin) return [];
  const min = [];
  const inicio = SALES.precargaAntesDeSalir ? 0 : SALES.intervaloMin;
  for (let m = inicio; m < dur - SALES.margenFinalMin; m += SALES.intervaloMin) min.push(m);
  return min;
}

/* Cápsulas a llevar encima: exactamente las tomas de la pauta, ni una más.
   Si llevas 2 y la pauta dice una, la segunda vuelve a casa en el bolsillo. */
export const capsulasSales = dur => minutosSales(dur).length;

/* Nutrición de la tirada larga (v2.1 §6). Va por DURACIÓN, no por tramos de km:
   comer depende de cuánto tiempo estás fuera, no de la distancia. Toma cada 40'
   y mismo criterio de margen final que las sales — una toma a los 85' en una
   sesión de 88 min desaparece sola en vez de quedarse escrita. */
function nutriLarga(km, dur, fecha) {
  /* El aviso de hidratación cambia con la estación: en las largas de 3 h de
     noviembre decirte "verano en Valencia" es ruido, y el ruido se ignora. */
  const mes = fecha ? +fecha.slice(5, 7) : 8;
  const sodio = (mes >= 6 && mes <= 9)
    ? ['Verano en Valencia: 400-600 ml de agua/hora + sales según la pauta.', 'warn']
    : ['400-500 ml de agua/hora + sales según la pauta. Sin el calor de agosto, pero en tres horas se suda igual.', 'warn'];
  const min = dur || Math.round(km * RITMO_EST.larga);
  if (min < 70) return [['Menos de ~70 min: solo agua, sin comer.'], sodio];
  const tomas = [];
  for (let m = 40; m < min - 15; m += 40) tomas.push(m);
  /* "40', 80', 120' y 160'". Con join(' y ') las tiradas de 3 h salían con
     cuatro "y" seguidas y no había quien las leyera. */
  const et = tomas.map(m => `${m}'`);
  const lista = et.length === 1 ? et[0] : `${et.slice(0, -1).join(', ')} y ${et[et.length - 1]}`;
  return [
    [`Bocadillo de guayaba a los ${lista} (~30 g ≈ un gel). Siempre con agua.` +
     (tomas.length >= 3 ? ' Aquí ya ensayas los 60-90 g CH/hora del día M.' : '')],
    sodio
  ];
}

/* Las 5 semanas de la fase base (13 jul → 16 ago).
   km = [martes, miércoles, viernes, domingo]. La S1 es atípica (Londres). */
export const BASE = [
  { lunes: '2026-07-13', km: [0, 0, 0, 10], total: 18, viaje: true, sentadilla: 37 },
  { lunes: '2026-07-20', km: [8, 6, 6, 12], total: 32, sentadilla: 41, rectas: true },
  { lunes: '2026-07-27', km: [8, 7, 8, 14], total: 39, sentadilla: 45, bloques: 4,
    calidad: "2 km calentar + 4×6' a RPE 7-8 (rec. 2' trote) + 1,5 km soltar" },
  /* S4 y S5 recalibradas el 2 ago. La S3 real cerró en 39,7 km con una tirada de
     14,01 km (a 6:45/km con 150 ppm de media), muy por encima de lo previsto.
     Bajar la larga a 10 km no era descarga, era perder el hilo: obligaba a saltar
     de 10 a 16 km en la S5 (+60%) justo antes del plan de COROS. La descarga se
     hace en volumen TOTAL (39,7 → 34, −14%) manteniendo la larga en 13 km. */
  { lunes: '2026-08-03', km: [8, 6, 7, 13], total: 34, sentadilla: 39, descarga: true, rectas: true },
  /* S5: 13 → 15 km de larga (+15%, dentro de regla) y 38 km totales. Los rodajes
     de entre semana bajan para que la calidad de 5 bloques quepa sin disparar el
     acumulado. Llegar al 17 ago con 38 km/semana y larga de 15 es base sólida;
     los 44/16 originales eran objetivo, no obligación. */
  { lunes: '2026-08-10', km: [7, 6, 6, 15], total: 38, sentadilla: 47, rectas: true, bloques: 5,
    calidad: "2 km calentar + 5×6' a RPE 7-8 (rec. 2') + 1,5 km soltar",
    largaNota: '12 km fáciles + últimos 3 km a ESFUERZO de maratón: subes a 165-170 ppm ' +
               'y aceptas el ritmo que salga (con este calor, 5:55-6:10). Ensayas el cambio ' +
               'de marcha con las piernas cansadas, no un ritmo. El test de 5:35-5:40 es en octubre.' }
];

/* Km reales de una sesión de calidad. El `km` del miércoles es el de un rodaje;
   una sesión de series recorre bastante más: calentamiento + bloques + las
   recuperaciones (que también son kilómetros) + soltar. Medido sobre el .fit del
   29 jul: bloque de 6' ≈ 1,11 km a 5:25 y recuperación de 2' ≈ 0,27 km a 7:30.
   Con 4 bloques da 9,0 km — COROS preveía 8,96 y Roman corrió 8,95. */
const kmCalidad = n => Math.round((2 + n * 1.108 + n * 0.267 + 1.5) * 10) / 10;

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
        ? [`Semana de descarga: la sentadilla baja a ${w.sentadilla} kg. No busques records.`, 'warn']
        : ['Fuerza A por la tarde. Nada al fallo, RPE 7-8.'],
      ['Techo de barra: 67 kg. Progresas de 2 en 2.']
    ]
  };

  /* Miércoles — rodaje fácil, o CALIDAD en S3 y S5 */
  if (w.calidad) {
    const kmQ = kmCalidad(w.bloques);
    PLAN[mas(w.lunes, 2)] = {
      kind: 'calidad', t: `Calidad ≈ ${String(kmQ).replace('.', ',')} km`, km: kmQ,
      sub: w.calidad,
      notes: [
        ['Manda el RITMO, no el pulso: bloques a 5:15-5:25/km y acepta la FC que salga. Tu umbral son 4:57, así que a 5:20 vas por debajo aunque el pulso diga otra cosa.', 'warn'],
        ['En julio el calor te cuesta ~10 ppm extra: ver 175-180 en el 3er bloque es normal y no significa que vayas pasado.'],
        ['Si una recuperación se te queda corta, ándala. El 29 jul andaste la 3ª y el último bloque salió el más rápido del día.'],
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

  /* Jueves — descanso. Roman baja a UNA sola sesión de fuerza (la A del martes):
     dos le disparaban las agujetas y contaminaban los rodajes. Los pogos y el
     tren superior de tirón siguen cubiertos en el parque del sábado. */
  PLAN[mas(w.lunes, 3)] = {
    kind: 'descanso', t: 'Descanso',
    sub: 'Sin correr y sin fuerza. Antes tocaba Fuerza B, pero con dos sesiones de fuerza las agujetas te reventaban. Ahora la fuerza va toda al martes.'
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

/* ============================================================
   BLOQUE COROS — 17 ago → 6 dic. 16 semanas, 100 sesiones.
   Ya no hay "lo que ponga el reloj": el plan entero está en coros-plan.js
   con distancia, tiempo estimado y carga de cada día. Lo que el conector NO
   da es la estructura interna (bloques, series, ritmos), y eso se dice en la
   ficha en vez de disimularlo.
   ============================================================ */

/* Intensidad deducida de la carga por km — el único indicador que hay.
   En este plan un rodaje aeróbico puro sale a ~10,2 TL/km sea cual sea la
   distancia; los cortes salen de los 27 entrenos distintos (ver coros-plan.js). */
function categoria(km, tl) {
  const r = tl / km;
  if (r < 10.5) return 'suave';     // aeróbico puro
  if (r < 11.5) return 'mixto';     // fácil + un remate corto (los ",36 km")
  if (r < 14.5) return 'calidad';   // bloques a ritmo dentro del rodaje
  return 'dura';                    // series cortas o ritmo maratón sostenido
}

const lunesDeF = f => { const d = new Date(f + 'T00:00:00'); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return iso(d); };
const kmDe = f => Math.max(0, ...(AGENDA[f] || []).map(i => i.km || 0));

/* Km programados de una semana (lunes ISO). La vista SEMANA los usa para
   decir cuántos km trae el plan, que antes era "km según el reloj". */
export function kmPrevistosCoros(lunes) {
  let t = 0;
  for (let i = 0; i < 7; i++) t += kmDe(mas(lunes, i));
  return Math.round(t);
}

/* La larga de la semana: la sesión más larga de lunes a domingo, y solo si
   pasa de 15 km. Sin esto, la de 15,20 km de un miércoles de noviembre se
   llevaría el cartel de sesión sagrada que le toca al domingo de 20 km. */
const MAX_SEM = {};
for (const f of Object.keys(AGENDA)) {
  const l = lunesDeF(f), km = kmDe(f);
  if (km > (MAX_SEM[l] || 0)) MAX_SEM[l] = km;
}
const esLargaSemana = f => kmDe(f) >= 15 && kmDe(f) === MAX_SEM[lunesDeF(f)];

/* Semana del bloque COROS (1-16) a la que pertenece una fecha, o null. */
export function semanaCoros(fecha) {
  const l = new Date(lunesDeF(fecha) + 'T00:00:00');
  const n = Math.round((l - INICIO_COROS) / (7 * 864e5)) + 1;
  return n >= 1 && n <= 16 ? n : null;
}

const nKm = k => String(Math.round(k * 100) / 100).replace('.', ',');
const hhmm = m => m >= 60 ? `${Math.floor(m / 60)}h${String(m % 60).padStart(2, '0')}` : `${m} min`;

/* Ficha de un día del bloque COROS. Se construye con la misma forma que las
   del plan de base (kind/t/sub/km/durMin/hr/grupos/notes), así que la app la
   pinta sin enterarse de que viene de otro sitio. */
function sesionCoros(fecha, d) {
  const items = AGENDA[fecha] || [];
  const run = items.find(i => typeof i.km === 'number');
  /* Las entradas sin km son las sesiones de FUERZA del plan de COROS. Son las
     únicas que quedan: Roman dejó la Fuerza A y el parque de barras el 16 ago.
     El conector solo da la duración, así que se anuncian con su duración y se
     manda a la app de COROS a por los ejercicios. Inventarlos sería peor. */
  const fuerza = items.filter(i => typeof i.km !== 'number');
  /* Semana de la maratón: ni fuerza ni saltos. A siete días no se construye. */
  const afinado = fecha >= '2026-11-30';
  const conFuerza = fuerza.length > 0 && !afinado;
  const durFuerza = fuerza.map(f => hhmm(aMinutos(f.t))).join(' y ');

  const notaFuerza = conFuerza
    ? [`Fuerza del plan de COROS: ${fuerza.length === 1 ? `una sesión de ${durFuerza}` : `${fuerza.length} sesiones, de ${durFuerza}`}. El conector solo da la duración — los ejercicios están en la app de COROS, dentro del plan. Es lo único de fuerza que queda en el calendario.`]
    : null;

  /* Pliometría suelta: lo único que Roman mantiene fuera de correr, y solo si
     le apetece. Va con las piernas frescas o no va. */
  const plioOpcional = { t: 'Pliometría (opcional)', st: 'Con piernas frescas o mejor otro día', ej: PLIO_PARQUE };

  if (!run) {
    return {
      kind: conFuerza ? 'fuerza' : 'descanso',
      t: conFuerza ? `Fuerza · COROS · ${durFuerza}` : 'Descanso',
      sub: conFuerza
        ? 'Hoy COROS no programa carrera, solo su sesión de fuerza. Los ejercicios, en la app de COROS.'
        : 'COROS no programa nada hoy. El descanso es parte del plan, no un premio.',
      grupos: conFuerza ? [plioOpcional] : undefined,
      notes: conFuerza ? [notaFuerza, REGLA_PLIO] : undefined
    };
  }

  const min = aMinutos(run.t);
  const cat = categoria(run.km, run.tl);
  const larga = esLargaSemana(fecha);
  const tlkm = (run.tl / run.km).toFixed(1).replace('.', ',');
  const cab = `COROS: ${nKm(run.km)} km en ~${hhmm(min)} · ${run.tl} TL.`;

  const sub = {
    suave: `${cab} Carga ${tlkm} TL/km: aeróbico puro, sin nada dentro. El ritmo es una consecuencia, no un objetivo.`,
    mixto: `${cab} Carga ${tlkm} TL/km, justo por encima de un rodaje puro: fácil casi todo y un remate rápido al final — de ahí el ",36" de los km.`,
    calidad: `${cab} Carga ${tlkm} TL/km contra los 10,2 de un rodaje: esto lleva bloques a ritmo dentro.`,
    dura: `${cab} Carga ${tlkm} TL/km. De las duras del plan: series o ritmo de maratón sostenido.`
  }[cat];

  const extra = conFuerza ? ' + fuerza COROS' : '';
  const t = larga
    ? (cat === 'suave' || cat === 'mixto' ? `Tirada larga ${nKm(run.km)} km` : `Tirada larga con ritmo ${nKm(run.km)} km`)
    : cat === 'suave' || cat === 'mixto'
      ? `Rodaje ${nKm(run.km)} km${extra}`
      : `Calidad ${nKm(run.km)} km${extra}`;

  const notes = [];
  if (cat !== 'suave') {
    notes.push(['COROS no expone la estructura por el conector: los bloques y los ritmos solo están en el reloj. Sal con el entreno cargado, no lo improvises por la calle.', 'warn']);
  }
  if (larga) {
    notes.push(...nutriLarga(run.km, min, fecha));
    if (cat === 'calidad' || cat === 'dura') {
      notes.push(['No es una larga fácil: la carga dice ritmo dentro. En los tramos rápidos el pulso se te va por encima del techo y ahí está bien.', 'warn']);
    }
  }
  if (notaFuerza) notes.push(notaFuerza);
  if (afinado) notes.push(['Semana de la maratón: ni fuerza ni saltos. A estas alturas lo único que se construye es el descanso.', 'stop']);

  const s = {
    kind: larga ? 'larga' : (cat === 'calidad' || cat === 'dura') ? 'calidad' : 'rodaje',
    t, sub: conFuerza ? `${sub} Además, la sesión de fuerza de COROS (${durFuerza}).` : sub,
    km: run.km, durMin: min, notes
  };
  /* Pulso objetivo solo cuando la sesión es de verdad aeróbica. En una con
     bloques a ritmo, pintar la banda 148-158 sería mentir. */
  if (cat === 'suave' || cat === 'mixto') s.hr = larga ? 'larga' : 'facil';
  if (conFuerza) s.grupos = [plioOpcional];
  return s;
}

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
  // Sábado 25: Roman se acuesta muy tarde esa noche → la tirada larga (sagrada)
  // se adelanta al sábado con piernas frescas y el parque de barras pasa al domingo.
  '2026-07-25': { ...PLAN['2026-07-26'], motivo: 'Noche larga del sábado 25: la tirada larga se adelanta al sábado (fresco)' },
  '2026-07-26': { ...PLAN['2026-07-25'], motivo: 'Noche larga del sábado 25: el parque de barras pasa al domingo' },
  '2026-08-17': {
    kind: 'descanso', t: 'Descanso',
    sub: 'Día 1 del bloque de COROS y no programa nada: el plan arranca mañana con 8 km. Mejor así, que vienes de la larga de 15,73 km del domingo.',
    motivo: 'COROS deja libre el lunes de arranque; se confirma con el volcado del plan'
  }
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
  if (d >= INICIO_COROS && d <= META) return sesionCoros(fecha, d);
  if (d > META) return { kind: 'descanso', t: 'Ya está', sub: 'La maratón fue el 6 de diciembre.' };
  return { kind: 'descanso', t: 'Sin plan', sub: 'Fuera del calendario del maratón.' };
}
