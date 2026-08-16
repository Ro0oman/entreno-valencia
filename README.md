# entreno-valencia

Panel de entrenamiento para la **Maratón de Valencia, 6 dic 2026 — objetivo sub-4h**.

Dos vistas:
- **Hoy** — qué toca, el pulso objetivo y dos o tres notas. Nada más.
- **Progreso** — días restantes, ritmo a 148-162 ppm (la métrica que decide el sub-4h) y km/semana contra lo previsto.

Sin dependencias más allá de Express. Sin base de datos. Los datos son un JSON en un volumen.

---

## Estructura

```
server.js             API + servidor estático
public/plan.js        ← EL PLAN. El archivo que tocas para cambiar entrenos.
public/coros-plan.js  Volcado del plan de maratón de COROS (generado, no se edita)
public/hechos.js      Sesiones ya corridas, importadas de COROS (generado)
public/app.js         Lógica del frontend
public/index.html
public/styles.css
Dockerfile
data/                 Volumen persistente (gitignored)
```

El plan va en dos mitades:

| Tramo | Dónde vive | Quién manda |
|---|---|---|
| 13 jul → 16 ago | `plan.js` → `BASE` | Escrito a mano |
| 17 ago → 6 dic | `coros-plan.js` → `AGENDA` | COROS, volcado del conector |

`plan.js` traduce el volcado a fichas y le superpone lo que COROS no sabe: la
pliometría opcional y el afinado de la última semana.

> **Fuerza A y parque de barras: retirados el 16 ago 2026.** Roman deja de
> hacerlos. La única fuerza del calendario es la que trae el plan de COROS, y
> de esa el conector solo da la duración: los ejercicios están en la app de
> COROS. Los bloques `fuerzaA()`, `FUERZA_B` y `parque()` siguen en `plan.js`
> porque la fase base (julio-agosto) los usa y esa parte es histórico.

---

## Desplegar en Coolify

1. **Sube el repo a GitHub** (ver más abajo).

2. En Coolify: **+ New → Application → Public/Private Repository**, apuntando a este repo.

3. **Build Pack:** `Dockerfile`.

4. **Port:** `3000`.

5. **Environment variables:**

   | Variable | Valor |
   |---|---|
   | `APP_PIN` | Tu PIN. Ponlo largo, no `1234`. |
   | `SESSION_SECRET` | `openssl rand -hex 32` |

6. **Persistent Storage → Add volume:**

   | Campo | Valor |
   |---|---|
   | Name | `entreno-data` |
   | Destination Path | `/app/data` |

   > ⚠️ Sin este volumen, cada despliegue borra tus sesiones. No te lo saltes.

7. **Domains:** `https://entreno.romandev.app`
   (crea antes el registro DNS `A` de `entreno` → la IP del servidor). Coolify pide el certificado a Let's Encrypt solo.

8. **Deploy.**

Comprobación: `curl https://entreno.romandev.app/salud` → `{"ok":true,"sesiones":0}`

---

## Local

```bash
npm install
cp .env.example .env      # rellena APP_PIN y SESSION_SECRET
APP_PIN=1234 SESSION_SECRET=loquesea DATA_DIR=./data npm run dev
# → http://localhost:3000
```

---

## Subir a GitHub

```bash
cd entreno-valencia
git init -b main
git add .
git commit -m "Panel de entrenamiento: fase base + pliometría"

gh repo create entreno-valencia --private --source=. --push
# o, a mano:
# git remote add origin git@github.com:TU_USUARIO/entreno-valencia.git
# git push -u origin main
```

`data/` y `.env` están en `.gitignore`. Que sigan ahí.

---

## API

| Método | Ruta | Qué hace |
|---|---|---|
| `POST` | `/api/login` | `{pin}` → `{token}` |
| `GET` | `/api/sesiones` | Todas las sesiones |
| `POST` | `/api/sesiones` | `{date, km, hr, pace}`. Una por día: si repites fecha, se sobrescribe. |
| `DELETE` | `/api/sesiones/:date` | Borra la de ese día |
| `GET` | `/salud` | Healthcheck |

`pace` va en **segundos por km** (6:45/km = 405).

Auth: token HMAC en `Authorization: Bearer`. Es un PIN para un usuario, no un sistema de identidad. Suficiente para lo que es.

---

## Backup

```bash
# El estado entero cabe en un archivo
docker cp $(docker ps -qf name=entreno):/app/data/sesiones.json ./backup.json
```

---

## COROS

El conector de COROS (MCP, **solo lectura**) es la fuente de los dos ficheros
generados. No hace falta Strava, ni la API de partner, ni subir el `.fit`.

### Traer el plan (`coros-plan.js`)

Se vuelca entero cuando COROS recalcula el plan. En el chat: *"actualiza el
plan de COROS"*. Por debajo es `queryTrainingSchedule` por rangos de fechas,
volcado literal a `AGENDA`.

Lo que el conector **da**: fecha, código del entreno, distancia, tiempo
estimado y carga (TL).
Lo que **no da**: la estructura interna. `S5716` es un id de plantilla de
COROS; los bloques y los ritmos siguen solo en el reloj. La app lo dice en la
ficha en vez de disimularlo, y deduce la intensidad de la carga por km (un
rodaje aeróbico puro sale siempre a ~10,2 TL/km; todo lo que suba lleva ritmo).

### Traer lo entrenado (`hechos.js`)

En el chat: *"importa lo que he entrenado"*. Por debajo, `querySportRecords`
devuelve fecha, distancia, ritmo medio, FC media y duración de cada sesión —
justo lo que acepta `POST /api/sesiones`.

Va al repo y no a la API porque el volumen necesita el PIN y el repo no: se
actualiza el fichero, `git push`, Coolify redespliega y la app lo ve. De
regalo, el histórico queda versionado: si el volumen se pierde, esto sigue.

**Precedencia:** manda la API. Si un día se registró a mano o con el `.fit`,
esa entrada gana — el `.fit` trae deriva, zonas y splits que el conector no
da. `hechos.js` solo rellena huecos.

> El `.fit` sigue funcionando y sigue siendo lo mejor para una sesión que
> quieras mirar con lupa. Ya no es obligatorio para que cuenten los km.

---

## Pendiente (fase 3)

- Semáforo automático con FC reposo, HRV y sueño (el conector ya los da:
  `queryRestingHeartRate`, `querySleepHrv`, `queryRecoveryStatus`).
- Km acumulados por zapatilla (jubilar las Vomero a 700).
- Traer también el desacople sin `.fit`, desde `queryActivityLapData`.
