# entreno-valencia

Panel de entrenamiento para la **Maratón de Valencia, 6 dic 2026 — objetivo sub-4h**.

Dos vistas:
- **Hoy** — qué toca, el pulso objetivo y dos o tres notas. Nada más.
- **Progreso** — días restantes, ritmo a 148-162 ppm (la métrica que decide el sub-4h) y km/semana contra lo previsto.

Sin dependencias más allá de Express. Sin base de datos. Los datos son un JSON en un volumen.

---

## Estructura

```
server.js          API + servidor estático
public/plan.js     ← EL PLAN. Es el único archivo que tocas para cambiar entrenos.
public/app.js      Lógica del frontend
public/index.html
public/styles.css
Dockerfile
data/              Volumen persistente (gitignored)
```

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

## Pendiente (fase 2)

- **Strava.** COROS no tiene API pública para particulares: hay que pedirla como partner y no la conceden a cualquiera. El puente real es COROS → Strava (sincroniza solo) → API de Strava, que sí es abierta. Con el backend ya montado, es OAuth + un endpoint de import.
- Semáforo automático con FC reposo, HRV y sueño.
- Km acumulados por zapatilla (jubilar las Vomero a 700).
