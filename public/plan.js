/* ============================================================
   EL PLAN. Este es el único archivo que tocas para cambiar entrenos.
   ============================================================ */

export const META = new Date('2026-12-06T00:00:00');
export const INICIO_COROS = new Date('2026-08-17T00:00:00');

/* Fase base: 5 semanas, 13 jul → 16 ago.
   km = [martes, miércoles, viernes, domingo] */
export const BASE = [
  { lunes: '2026-07-13', km: [6, 6, 6, 12], total: 30,
    plio: '50 contactos · comba 3×30 s · pogo jumps 3×10 · skipping alto 3×20 m' },
  { lunes: '2026-07-20', km: [7, 7, 6, 13], total: 33,
    plio: '50 contactos · comba 3×30 s · pogo jumps 3×10 · skipping alto 3×20 m' },
  { lunes: '2026-07-27', km: [8, 7, 7, 15], total: 37,
    plio: '80 contactos · + cajón 3×5 (subes saltando, bajas andando) · zancadas saltadas 3×20 m' },
  { lunes: '2026-08-03', km: [7, 6, 6, 11], total: 30, descarga: true,
    plio: '80 contactos · + cajón 3×5 · zancadas saltadas 3×20 m' },
  { lunes: '2026-08-10', km: [9, 9, 8, 16], total: 42,
    plio: '100 contactos · + saltos a una pierna 3×6 por lado' }
];

const iso = d => d.toISOString().slice(0, 10);
const mas = (s, n) => { const d = new Date(s + 'T00:00:00'); d.setDate(d.getDate() + n); return iso(d); };

/* Calendario día a día, generado desde BASE */
export const PLAN = {};
BASE.forEach((w, i) => {
  const [a, b, c, larga] = w.km;
  const dc = w.descarga ? ' (semana de descarga)' : '';

  PLAN[w.lunes] = {
    kind: 'descanso', t: 'Descanso',
    sub: 'Sin correr. El descanso es parte del plan, no un premio.'
  };

  PLAN[mas(w.lunes, 1)] = {
    kind: 'rodaje', t: `Rodaje ${a} km + Fuerza A`, km: a, hr: 'facil',
    sub: `Pliometría antes de las pesadas: ${w.plio}`,
    notes: [
      ['Pliometría con las piernas frescas, siempre antes de levantar.', 'warn'],
      ['Rotación externa con goma 2×15 por lado. Todas las semanas.']
    ]
  };

  PLAN[mas(w.lunes, 2)] = {
    kind: 'rodaje', t: `Rodaje ${b} km + rectas`, km: b, hr: 'facil',
    sub: 'Al acabar: 4 rectas de 100 m buscando cadencia 165+. No es velocidad, es frecuencia.',
    notes: [['Las rectas se hacen sueltas, sin apretar la mandíbula.']]
  };

  PLAN[mas(w.lunes, 3)] = {
    kind: 'fuerza', t: 'Fuerza B + pliometría',
    sub: `Sin correr. ${w.plio}`,
    notes: [
      ['Techo de barra: 67 kg. Progresas de 2 en 2.'],
      ['Press militar: agarre neutro, RPE 6-7, sin bloquear arriba.', 'warn']
    ]
  };

  PLAN[mas(w.lunes, 4)] = {
    kind: 'rodaje', t: `Rodaje ${c} km`, km: c, hr: 'facil',
    sub: 'Fácil de verdad. Mañana toca parque y pasado la tirada larga.',
    notes: [['Este es el día que más se estropea yendo rápido. No lo estropees.', 'warn']]
  };

  PLAN[mas(w.lunes, 5)] = {
    kind: 'parque', t: 'Parque · barras',
    sub: '15 flexiones · 3×5 dominadas · 3×5 fondos · 3×8 remos invertidos',
    notes: [['Fondos: sin bajar de 90°. El hombro no se negocia.', 'stop']]
  };

  PLAN[mas(w.lunes, 6)] = {
    kind: 'larga', t: `Tirada larga ${larga} km`, km: larga, hr: 'larga',
    sub: `Semana ${i + 1} de la fase base · ${w.total} km en total${dc}. La sesión sagrada: si algo se cae esta semana, no es esta.`,
    notes: [
      ['Verano: 400-600 ml de agua/hora + 1-2 cápsulas de sales.', 'warn'],
      ['A partir de 90 min: 30 g de dulce de guayaba ≈ un gel. Siempre con agua.']
    ]
  };
});

/* Del 17 ago al 6 dic manda COROS. Aquí solo se fijan los anclajes. */
export const COROS = {
  1: { kind: 'rodaje', t: 'Plan COROS', sub: 'Lo que ponga el reloj.', hr: 'facil' },
  2: { kind: 'rodaje', t: 'Plan COROS + Fuerza A', sub: 'Pliometría de mantenimiento: 60-80 contactos.', hr: 'facil', km: true },
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
