# My TS App

Servicio backend construido con **Node.js + TypeScript + Express** que expone una API REST, ejecuta tareas programadas mediante cron y se conecta a una base de datos **PostgreSQL**. Incluye soporte para modo mock, logging estructurado y pipeline CI/CD con GitLab y Docker.

---

## 📂 Estructura del proyecto

```
.
├── src/
│   ├── config/
│   │   └── env.ts              # Lectura y exportación de variables de entorno
│   ├── db/
│   │   └── postgres.ts         # Pool de conexión y queries (con modo mock)
│   ├── logger/
│   │   └── logger.ts           # Logger Winston con colores y rotación de ficheros
│   ├── scheduler/
│   │   └── jobScheduler.ts     # Wrapper sobre node-cron con graceful shutdown
│   ├── routes/
│   │   └── index.ts            # Endpoints Express bajo /api
│   └── index.ts                # Entry point: servidor + scheduler
├── log/                        # Logs generados en runtime (ignorado por git)
├── dist/                       # Compilación TypeScript (ignorado por git)
├── .env.example                # Plantilla de variables de entorno
├── .gitlab-ci.yml              # Pipeline CI/CD
├── Dockerfile
├── package.json
└── tsconfig.json
```

---

## 🔧 Stack técnico

| Responsabilidad   | Librería                |
|-------------------|-------------------------|
| Servidor HTTP     | `express`               |
| Base de datos     | `pg` (node-postgres)    |
| Tareas programadas| `node-cron`             |
| Logging           | `winston`               |
| Variables de entorno | `dotenv`             |
| Excel / reportes  | `exceljs`               |
| Lenguaje          | TypeScript 5            |
| Runtime           | Node.js 22              |

---

## 🔐 Variables de entorno

Copia `.env.example` como `.env` y rellena los valores:

```bash
cp .env.example .env
```

| Variable            | Descripción                                          | Default       |
|---------------------|------------------------------------------------------|---------------|
| `POSTGRES_USER`     | Usuario de la base de datos                          | —             |
| `POSTGRES_PASSWORD` | Contraseña del usuario                               | —             |
| `POSTGRES_HOST`     | Host o IP del servidor Postgres                      | —             |
| `POSTGRES_PORT`     | Puerto de Postgres                                   | `5432`        |
| `POSTGRES_DB`       | Nombre de la base de datos                           | —             |
| `ENABLE_DATABASE`   | `0` para deshabilitar Postgres y usar datos mock     | `1`           |
| `SCHEDULE_STR`      | Expresión cron para el job programado                | `* * * * *`   |
| `TEXT`              | Texto que imprime el servidor al arrancar            | `TEST SCRIPT` |
| `PORT`              | Puerto en el que escucha Express                     | `3000`        |

> ⚠️ **Nunca** subas el fichero `.env` al repositorio.

---

## 🗄️ Modo sin base de datos

Si no quieres levantar una instancia de PostgreSQL en local, establece:

```dotenv
ENABLE_DATABASE=0
```

El servidor arrancará igualmente y las llamadas a la base de datos devolverán **datos mock** predefinidos. El resto de funcionalidades (API, scheduler, logs) operan con normalidad.

---

## 🚀 Ejecución en local

### Requisitos
- Node.js 22+
- npm 10+
- PostgreSQL (opcional si `ENABLE_DATABASE=0`)

### Pasos

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
cp .env.example .env

# 3. Arrancar en modo desarrollo (hot-reload)
npm run dev
```

El servidor quedará disponible en `http://localhost:3000`.

---

## 📡 API

Base URL: `/api`

| Método | Ruta      | Descripción                                          |
|--------|-----------|------------------------------------------------------|
| `GET`  | `/health` | Comprueba que el servidor está activo                |
| `GET`  | `/data`   | Devuelve registros entre dos fechas                  |

### `GET /api/data`

**Query params:**

| Param  | Tipo   | Ejemplo                    |
|--------|--------|----------------------------|
| `from` | ISO 8601 | `2024-01-01T00:00:00Z`   |
| `to`   | ISO 8601 | `2024-01-02T00:00:00Z`   |

**Respuesta:**
```json
{
  "count": 2,
  "data": [
    { "id": 1, "timestamp": "...", "temperature": 22.5, "humidity": 60 },
    { "id": 2, "timestamp": "...", "temperature": 23.1, "humidity": 58 }
  ]
}
```

---

## ⏱️ Scheduler

Al arrancar, el servidor registra un job programado que se ejecuta según la expresión cron definida en `SCHEDULE_STR`. El job consulta los datos de las últimas 24 horas y los registra en el log.

Ejemplos de expresiones cron válidas:

| Expresión      | Frecuencia            |
|----------------|-----------------------|
| `* * * * *`    | Cada minuto           |
| `0 * * * *`    | Cada hora             |
| `0 6 * * *`    | Cada día a las 06:00  |
| `0 6 * * 1`    | Cada lunes a las 06:00|

El scheduler se detiene limpiamente al recibir `SIGINT` o `SIGTERM` (Ctrl+C o parada del contenedor).

---

## 📋 Logging

Los logs se emiten en consola con colores y se guardan en la carpeta `log/` con rotación. Los mensajes consecutivos idénticos se suprimen para evitar ruido.

| Nivel     | Color         | Cuándo usarlo                        |
|-----------|---------------|--------------------------------------|
| `info`    | Verde         | Operaciones normales                 |
| `warn`    | Amarillo      | Situaciones anómalas no críticas     |
| `error`   | Rojo          | Fallos que requieren atención        |

---

## 🐋 Docker

### Build local

```bash
docker build -t my-ts-app:latest .
```

### Ejecución

```bash
docker run --rm \
  -e POSTGRES_USER=demo \
  -e POSTGRES_PASSWORD=secret \
  -e POSTGRES_HOST=db.example.local \
  -e POSTGRES_PORT=5432 \
  -e POSTGRES_DB=mydb \
  -e SCHEDULE_STR="0 6 * * *" \
  -e ENABLE_DATABASE=1 \
  -p 3000:3000 \
  my-ts-app:latest
```

---

## 🚀 Pipeline GitLab CI/CD

El fichero `.gitlab-ci.yml` define una fase `build` que:

1. Arranca Docker in Docker (`docker:dind`).
2. Hace login en el Container Registry del proyecto.
3. Construye la imagen etiquetada con la rama actual.
4. Publica la imagen en el registry.

Con cada `git push`, GitLab construirá y publicará automáticamente la imagen en:

```
registry.gitlab.com/<namespace>/<project>:<branch>
```

---

## 📜 Scripts npm

| Comando         | Descripción                                      |
|-----------------|--------------------------------------------------|
| `npm run dev`   | Desarrollo con hot-reload via `tsx`              |
| `npm run build` | Compila TypeScript a JavaScript en `dist/`       |
| `npm start`     | Ejecuta el build compilado                       |