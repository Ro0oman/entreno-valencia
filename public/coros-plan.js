/* ============================================================
   PLAN COROS — volcado literal del conector de COROS.
   Maratón Valencia · 6 dic 2026. Bloque de 16 semanas: 18 ago → 5 dic.
   Volcado inicial: 16 ago 2026. Última resincronización automática: 5 oct 2026.

   ESTO ES UN VOLCADO, NO UNA OPINIÓN. La rutina programada
   "importar-coros-entreno-valencia" lo resincroniza sola en cada ejecución:
   compara este AGENDA contra lo que devuelve queryTrainingSchedule desde el
   primer día sin entreno todavía registrado en hechos.js hasta el 5 dic, y
   si COROS ha recalculado algo — una sesión que cambia de km, o un día que
   desaparece porque aligeró la semana — lo reescribe aquí solo. No lo edites
   a mano ni le añadas notas: la próxima resincronización lo pisa. Lo que tú
   decides (Fuerza A, parque, descansos, AJUSTES) vive en plan.js, encima de
   esto, y eso la rutina no lo toca.

   Qué da el conector y qué no
   ---------------------------
   DA:    fecha, código interno del entreno, distancia, tiempo estimado y
          carga de entrenamiento (TL).
   NO DA: la estructura. El código `S5716` es un identificador de plantilla
          de COROS; no hay endpoint público que devuelva "2 km + 4×1 km a
          4:50 + 1 km". Los bloques y los ritmos siguen viviendo en el reloj.

   Cómo se lee la intensidad sin esa estructura
   --------------------------------------------
   La carga por km. En este plan un rodaje aeróbico puro sale SIEMPRE a
   ~10,2 TL/km, dé igual que sean 5 km o 28: es la constante del plan
   entero. Todo lo que suba de ahí lleva ritmo dentro, y cuánto sube dice
   cuánto ritmo. Los cortes de plan.js salen de mirar los 27 entrenos
   distintos que usa el plan:

     10,1-10,2  los 13 rodajes y tiradas de distancia redonda → puro fácil
     10,7-11,0  los 7 entrenos que acaban en ",36 km" → fácil + un remate
     12,7-14,1  bloques a ritmo dentro de un rodaje
     15,7-20,7  las sesiones duras de verdad (series cortas, ritmo maratón
                sostenido en la larga de 20 km)

   Ese ",36" repetido en siete entrenos distintos es una estructura fija
   que COROS añade al final del rodaje. Qué es exactamente, el conector no
   lo dice — por eso plan.js lo llama "remate" y te manda al reloj.

   Formato: c = código COROS · km · t = tiempo estimado · tl = carga.
   Las entradas sin km ni tl son las sesiones complementarias del plan
   (COROS no les pone deporte ni carga; ver la nota en plan.js).
   ============================================================ */

export const AGENDA = {
  /* ---- Agosto: semanas 1-2 ---- */
  '2026-08-18': [{ c: 'S5808', km: 8.00, t: '1:01:48', tl: 81 }, { c: 'S5729', t: '34:00' }],
  '2026-08-20': [{ c: 'S5821', km: 12.36, t: '1:29:14', tl: 133 }],
  '2026-08-22': [{ c: 'S5799', km: 10.00, t: '1:14:45', tl: 102 }, { c: 'S5724', t: '58:40' }],
  '2026-08-23': [{ c: 'S5776', km: 15.00, t: '1:47:08', tl: 153 }],

  '2026-08-24': [{ c: 'S5808', km: 8.00, t: '1:01:40', tl: 81 }, { c: 'S5729', t: '34:00' }],
  '2026-08-27': [{ c: 'S5821', km: 12.36, t: '1:29:14', tl: 133 }],
  '2026-08-28': [{ c: 'S5799', km: 10.00, t: '1:14:35', tl: 101 }, { c: 'S5724', t: '58:40' }],
  '2026-08-30': [{ c: 'S5776', km: 15.00, t: '1:47:08', tl: 153 }],

  /* ---- Septiembre: semanas 3-6 ---- */
  '2026-09-01': [{ c: 'S5778', km: 6.00, t: '48:51', tl: 61 }, { c: 'S5729', t: '34:00' }],
  '2026-09-03': [{ c: '8k carrera fácil', km: 8.00, t: '1:01:44', tl: 81 }, { c: 'S5724', t: '58:40' }],
  '2026-09-05': [{ c: 'S5716', km: 8.00, t: '1:01:44', tl: 82 }],
  '2026-09-06': [{ c: 'S5774', km: 12.00, t: '1:27:36', tl: 121 }],

  '2026-09-08': [{ c: 'S5818', km: 9.00, t: '1:08:17', tl: 92 }, { c: 'S5729', t: '34:00' }],
  '2026-09-10': [{ c: 'S5778', km: 6.00, t: '48:51', tl: 61 }, { c: 'S5724', t: '58:40' }],
  '2026-09-12': [{ c: '9km', km: 9.00, t: '1:08:12', tl: 92 }],
  '2026-09-13': [{ c: 'Tirada larga 14k', km: 14.00, t: '1:40:32', tl: 143 }],

  '2026-09-15': [{ c: 'S5799', km: 10.00, t: '1:14:45', tl: 102 }, { c: 'S5729', t: '34:00' }],

  /* ---- Octubre: COROS dio por terminado el plan de maratón el 16 sep.
     Lo que queda son entrenos sueltos de la biblioteca: vuelta a correr. ---- */
  '2026-10-03': [{ c: 'Grupeta tranquila', t: '1:30:00' }],
  '2026-10-06': [{ c: 'Vuelta a correr: 20 min muy suave', km: 2.50, t: '20:00', tl: 18 }],
  '2026-10-07': [{ c: 'Bici suave 50 min', t: '50:00' }],
  '2026-10-08': [{ c: 'Carrera suave 25 min', km: 3.12, t: '25:00', tl: 22 }],
  '2026-10-11': [{ c: 'Bici de recuperación 40 min (opcional)', t: '40:00' }]
  /* 2026-12-06 — la maratón. La pinta sesionDe(), no COROS. */
};

/* "1:29:14" / "58:40" → minutos redondeados. */
export function aMinutos(t) {
  const p = String(t).split(':').map(Number);
  if (p.some(n => !Number.isFinite(n))) return 0;
  const seg = p.length === 3 ? p[0] * 3600 + p[1] * 60 + p[2] : p[0] * 60 + p[1];
  return Math.round(seg / 60);
}
