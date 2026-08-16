/* ============================================================
   PLAN COROS — volcado literal del conector de COROS.
   Maratón Valencia · 6 dic 2026. Bloque de 16 semanas: 18 ago → 5 dic.
   Volcado el 16 ago 2026. 100 sesiones.

   ESTO ES UN VOLCADO, NO UNA OPINIÓN. Se reescribe entero cuando COROS
   recalcule el plan; no lo edites a mano ni le añadas notas. Lo que tú
   decides (Fuerza A, parque, descansos) vive en plan.js, encima de esto.

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
  '2026-09-02': [{ c: 'S5801', km: 13.36, t: '1:35:42', tl: 143 }],
  '2026-09-03': [{ c: 'S5778', km: 6.00, t: '48:51', tl: 61 }, { c: 'S5724', t: '58:40' }],
  '2026-09-05': [{ c: 'S5716', km: 9.36, t: '1:09:48', tl: 103 }],
  '2026-09-06': [{ c: 'S5774', km: 18.00, t: '2:06:33', tl: 183 }],

  '2026-09-08': [{ c: 'S5818', km: 9.00, t: '1:08:17', tl: 92 }, { c: 'S5729', t: '34:00' }],
  '2026-09-09': [{ c: 'S5801', km: 13.36, t: '1:35:42', tl: 143 }],
  '2026-09-10': [{ c: 'S5778', km: 6.00, t: '48:51', tl: 61 }, { c: 'S5724', t: '58:40' }],
  '2026-09-12': [{ c: 'S5716', km: 9.36, t: '1:09:48', tl: 103 }],
  '2026-09-13': [{ c: 'S5804', km: 20.00, t: '2:19:30', tl: 204 }],

  '2026-09-15': [{ c: 'S5799', km: 10.00, t: '1:14:45', tl: 102 }, { c: 'S5729', t: '34:00' }],
  '2026-09-16': [{ c: 'S5798', km: 15.36, t: '1:48:39', tl: 164 }],
  '2026-09-17': [{ c: 'S5778', km: 6.00, t: '48:51', tl: 61 }, { c: 'S5724', t: '58:40' }],
  '2026-09-19': [{ c: 'S5820', km: 10.36, t: '1:16:17', tl: 113 }],
  '2026-09-20': [{ c: 'S5721', km: 23.00, t: '2:38:56', tl: 234 }],

  '2026-09-22': [{ c: 'S5779', km: 7.00, t: '55:20', tl: 71 }, { c: 'S5729', t: '34:00' }],
  '2026-09-24': [{ c: 'S5715', km: 8.36, t: '1:03:20', tl: 92 }],
  '2026-09-26': [{ c: 'S5715', km: 8.36, t: '1:03:20', tl: 92 }, { c: 'S5724', t: '58:40' }],
  '2026-09-27': [{ c: 'S5776', km: 15.00, t: '1:47:08', tl: 153 }],

  '2026-09-29': [{ c: 'S5799', km: 10.00, t: '1:14:45', tl: 102 }, { c: 'S5729', t: '34:00' }],
  '2026-09-30': [{ c: 'S5728', km: 14.40, t: '1:40:25', tl: 183 }],

  /* ---- Octubre: semanas 7-11 ---- */
  '2026-10-01': [{ c: 'S5778', km: 6.00, t: '48:51', tl: 61 }, { c: 'S5724', t: '58:40' }],
  '2026-10-03': [{ c: 'S5716', km: 9.36, t: '1:09:48', tl: 103 }],
  '2026-10-04': [{ c: 'S5812', km: 20.00, t: '2:07:25', tl: 313 }],

  '2026-10-06': [{ c: 'S5799', km: 10.00, t: '1:14:45', tl: 102 }, { c: 'S5729', t: '34:00' }],
  '2026-10-07': [{ c: 'S5728', km: 14.40, t: '1:40:25', tl: 183 }],
  '2026-10-08': [{ c: 'S5778', km: 6.00, t: '48:51', tl: 61 }, { c: 'S5724', t: '58:40' }],
  '2026-10-10': [{ c: 'S5716', km: 9.36, t: '1:09:48', tl: 103 }],
  '2026-10-11': [{ c: 'S5812', km: 20.00, t: '2:07:25', tl: 313 }],

  '2026-10-13': [{ c: 'S5808', km: 8.00, t: '1:01:48', tl: 81 }, { c: 'S5729', t: '34:00' }],
  '2026-10-15': [{ c: 'S5728', km: 7.60, t: '57:20', tl: 102 }],
  '2026-10-17': [{ c: 'S5715', km: 8.36, t: '1:03:20', tl: 92 }, { c: 'S5724', t: '58:40' }],
  '2026-10-18': [{ c: 'S5776', km: 15.00, t: '1:47:08', tl: 153 }],

  '2026-10-20': [{ c: 'S5775', km: 11.36, t: '1:22:45', tl: 123 }, { c: 'S5729', t: '34:00' }],
  '2026-10-21': [{ c: 'S5726', km: 9.65, t: '1:16:24', tl: 189 }],
  '2026-10-22': [{ c: 'S5778', km: 6.00, t: '48:51', tl: 61 }, { c: 'S5724', t: '58:40' }],
  '2026-10-24': [{ c: 'S5728', km: 10.40, t: '1:14:31', tl: 143 }],
  '2026-10-25': [{ c: 'S5720', km: 21.00, t: '2:25:59', tl: 214 }],

  '2026-10-27': [{ c: 'S5715', km: 8.36, t: '1:03:20', tl: 92 }, { c: 'S5729', t: '34:00' }],
  '2026-10-28': [{ c: 'S5726', km: 9.65, t: '1:16:24', tl: 189 }],
  '2026-10-29': [{ c: 'S5778', km: 6.00, t: '48:51', tl: 61 }, { c: 'S5724', t: '58:40' }],
  '2026-10-31': [{ c: 'S5716', km: 9.36, t: '1:09:48', tl: 103 }],

  /* ---- Noviembre: semanas 11-15. El pico y el afinado ---- */
  '2026-11-01': [{ c: 'S5722', km: 25.00, t: '2:51:53', tl: 254 }],

  '2026-11-03': [{ c: 'S5716', km: 9.36, t: '1:09:48', tl: 103 }, { c: 'S5729', t: '34:00' }],
  '2026-11-04': [{ c: 'S5726', km: 11.38, t: '1:28:24', tl: 236 }],
  '2026-11-05': [{ c: 'S5778', km: 6.00, t: '48:51', tl: 61 }, { c: 'S5724', t: '58:40' }],
  '2026-11-07': [{ c: 'S5728', km: 10.40, t: '1:14:31', tl: 143 }],
  '2026-11-08': [{ c: 'S5777', km: 28.00, t: '3:11:18', tl: 285 }],

  '2026-11-10': [{ c: 'S5779', km: 7.00, t: '55:20', tl: 71 }, { c: 'S5729', t: '34:00' }],
  '2026-11-12': [{ c: 'S5726', km: 9.05, t: '1:11:21', tl: 140 }],
  '2026-11-14': [{ c: 'S5715', km: 8.36, t: '1:03:20', tl: 92 }, { c: 'S5724', t: '58:40' }],
  '2026-11-15': [{ c: 'S5776', km: 15.00, t: '1:47:08', tl: 153 }],

  '2026-11-17': [{ c: 'S5716', km: 9.36, t: '1:09:48', tl: 103 }],
  '2026-11-18': [{ c: 'S5725', km: 15.20, t: '1:39:23', tl: 214 }],
  '2026-11-19': [{ c: 'S5778', km: 6.00, t: '48:51', tl: 61 }],
  '2026-11-21': [{ c: 'S5716', km: 9.36, t: '1:09:48', tl: 103 }],
  '2026-11-22': [{ c: 'S5723', km: 20.00, t: '2:06:45', tl: 266 }],

  '2026-11-24': [{ c: 'S5716', km: 9.36, t: '1:09:48', tl: 103 }],
  '2026-11-25': [{ c: 'S5725', km: 15.20, t: '1:39:23', tl: 214 }],
  '2026-11-26': [{ c: 'S5778', km: 6.00, t: '48:51', tl: 61 }],
  '2026-11-28': [{ c: 'S5716', km: 9.36, t: '1:09:48', tl: 103 }],
  '2026-11-29': [{ c: 'S5723', km: 20.00, t: '2:06:45', tl: 266 }],

  /* ---- Diciembre: semana 16. Afinado ---- */
  '2026-12-02': [{ c: 'S5779', km: 7.00, t: '55:20', tl: 71 }],
  '2026-12-03': [{ c: 'S5723', km: 13.00, t: '1:25:41', tl: 174 }],
  '2026-12-04': [{ c: 'S5779', km: 7.00, t: '55:20', tl: 71 }],
  '2026-12-05': [{ c: 'S5712', km: 5.00, t: '42:23', tl: 51 }]
  /* 2026-12-06 — la maratón. La pinta sesionDe(), no COROS. */
};

/* "1:29:14" / "58:40" → minutos redondeados. */
export function aMinutos(t) {
  const p = String(t).split(':').map(Number);
  if (p.some(n => !Number.isFinite(n))) return 0;
  const seg = p.length === 3 ? p[0] * 3600 + p[1] * 60 + p[2] : p[0] * 60 + p[1];
  return Math.round(seg / 60);
}
