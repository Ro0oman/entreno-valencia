/* ============================================================
   HECHOS — sesiones ya corridas, leídas del conector de COROS.
   Volcado el 16 ago 2026. Desde el arranque del plan (13 jul).

   Por qué existe este fichero
   ---------------------------
   El histórico "de verdad" vive en el volumen del servidor (data/sesiones.json),
   que no está en git y no se puede escribir sin el PIN. Este fichero es el
   camino que SÍ está en el repo: se actualiza, se hace push, Coolify
   redespliega y la app lo ve. Sin PIN, sin subir el .fit a mano, y con el
   histórico versionado — si el volumen se pierde, esto sigue aquí.

   Precedencia: manda lo que haya en la API. Si un día está registrado a mano
   o con el .fit, esa entrada gana y la de aquí se ignora — el .fit trae
   deriva, zonas y splits que el conector no da. Este fichero rellena huecos.

   Formato = el mismo que acepta POST /api/sesiones:
   date · km · hr (FC media) · pace (segundos/km) · cad (cadencia) · notas.

   Sobre la cadencia: viene de `getActivityDetail`, es real, y alimenta el
   gráfico de cadencia sin necesidad del .fit. Lo que el conector NO da y sigue
   necesitando el .fit son el DESACOPLE (hace falta la serie de FC segundo a
   segundo) y el CONTROL DE FÁCILES (% de tiempo por encima del techo 162).
   Esos dos gráficos siguen vivos por la vía del .fit y no se rellenan aquí
   con una definición distinta: dos formas de medir en la misma curva mienten.
   ============================================================ */

export const HECHOS = [
  { date: '2026-07-13', km: 8.01,  hr: 151, pace: 424, cad: 155, notas: '8km resistencia · 56:37 · COROS' },
  { date: '2026-07-21', km: 7.11,  hr: 156, pace: 444, cad: 152, notas: '52:40 · COROS' },
  { date: '2026-07-22', km: 6.32,  hr: 152, pace: 454, cad: 152, notas: '47:48 · COROS' },
  { date: '2026-07-24', km: 7.27,  hr: 151, pace: 481, cad: 145, notas: '58:13 · COROS' },
  { date: '2026-07-25', km: 12.28, hr: 150, pace: 461, cad: 153, notas: '12k Resistencia · 1:34:22 · COROS' },
  { date: '2026-07-28', km: 8.01,  hr: 148, pace: 460, cad: 152, notas: '1:01:27 · COROS' },
  { date: '2026-07-29', km: 8.95,  hr: 157, pace: 400, cad: 153, notas: 'Calidad S3 · 59:41 · COROS' },
  { date: '2026-07-31', km: 8.56,  hr: 145, pace: 450, cad: 154, notas: '1:04:16 · COROS' },
  { date: '2026-08-02', km: 14.01, hr: 150, pace: 405, cad: 156, notas: '1:34:35 · COROS' },
  { date: '2026-08-04', km: 8.02,  hr: 151, pace: 429, cad: 156, notas: '57:23 · COROS' },
  { date: '2026-08-05', km: 6.01,  hr: 147, pace: 422, cad: 156, notas: '42:19 · COROS' },
  { date: '2026-08-07', km: 7.63,  hr: 146, pace: 430, cad: 157, notas: 'Rodaje 7 km + rectas · 54:43 · COROS' },
  { date: '2026-08-09', km: 12.92, hr: 150, pace: 398, cad: 157, notas: '1:25:47 · COROS' },
  { date: '2026-08-11', km: 7.01,  hr: 140, pace: 415, cad: 156, notas: '48:29 · COROS' },
  { date: '2026-08-12', km: 9.51,  hr: 161, pace: 379, cad: 156, notas: '1:00:02 · COROS' },
  { date: '2026-08-14', km: 7.15,  hr: 151, pace: 429, cad: 153, notas: '51:07 · COROS' },
  { date: '2026-08-16', km: 15.73, hr: 147, pace: 405, cad: 156, notas: 'Tirada larga 15 km · 1:46:04 · COROS' }
];
