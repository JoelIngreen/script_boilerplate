# My TS App

Servicio backend construido con **Node.js + TypeScript + Express** que expone una API REST, ejecuta tareas programadas mediante cron y se conecta a una base de datos **PostgreSQL**. Incluye soporte para modo mock, logging estructurado y pipeline CI/CD con GitHub Actions y Docker.

---

## ⚡ Inicio rápido: 

```bash
# 1. Clonar el repositorio
git clone https://github.com/JoelIngreen/script_boilerplate.git
cd script_boilerplate

# 2. Configurar variables de entorno
cp .env.example .env
# Edita .env con tus valores, o deja ENABLE_DATABASE=0 para modo mock sin Postgres

# 3. Levantar todo
docker compose up --build
```

API disponible en `http://localhost:3000/api/health`

> 💡 Si no tienes Postgres, simplemente pon `ENABLE_DATABASE=0` en el `.env` y arranca solo la app:
> ```bash
> docker compose up --build app
> ```

---

## 📂 Estructura del proyecto

```
.
├── src/
│   ├── config/
│   │   └── env.ts              # Lectura y exportación de variables de entorno
│   ├── db/
│   │   └── postgres.ts         # Pool de conexión, queries y mock data
│   ├── logger/
│   │   └── logger.ts           # Logger Winston con colores y rotación de ficheros
│   ├── scheduler/
│   │   └── jobScheduler.ts     # Wrapper sobre node-cron con graceful shutdown
│   ├── routes/
│   │   └── index.ts            # Endpoints Express bajo /api
│   └── index.ts                # Entry point: servidor + scheduler
├── docker/
│   └── init.sql                # Script de inicialización de la base de datos
├── log/                        # Logs generados en runtime (ignorado por git)
├── dist/                       # Compilación TypeScript (ignorado por git)
├── .env.example                # Plantilla de variables de entorno
├── .github/
│   └── workflows/
│       └── docker.yml          # Pipeline CI/CD GitHub Actions
├── .gitlab-ci.yml              # Pipeline CI/CD GitLab
├── docker-compose.yml
├── Dockerfile
├── package.json
└── tsconfig.json
```

---

## 🔧 Stack técnico

| Responsabilidad      | Librería              |
|----------------------|-----------------------|
| Servidor HTTP        | `express`             |
| Base de datos        | `pg` (node-postgres)  |
| Tareas programadas   | `node-cron`           |
| Logging              | `winston`             |
| Variables de entorno | `dotenv`              |
| Excel / reportes     | `exceljs`             |
| Lenguaje             | TypeScript 5          |
| Runtime              | Node.js 22            |

---

## 🔐 Variables de entorno

Copia `.env.example` como `.env` y rellena los valores:

```bash
cp .env.example .env
```

| Variable            | Descripción                                                | Default        |
|---------------------|------------------------------------------------------------|----------------|
| `POSTGRES_USER`     | Usuario de la base de datos                                | —              |
| `POSTGRES_PASSWORD` | Contraseña del usuario                                     | —              |
| `POSTGRES_HOST`     | Host o IP del servidor Postgres                            | —              |
| `POSTGRES_PORT`     | Puerto de Postgres                                         | `5432`         |
| `POSTGRES_DB`       | Nombre de la base de datos                                 | —              |
| `ENABLE_DATABASE`   | `0` para deshabilitar Postgres y usar datos mock           | `1`            |
| `DB_SCHEMA`         | Esquema de la tabla a consultar                            | `public`       |
| `DB_TABLE`          | Nombre de la tabla a consultar                             | `sensor_data`  |
| `SCHEDULE_STR`      | Expresión cron para el job programado (5 o 6 campos)       | `* * * * *`    |
| `TEXT`              | Texto que imprime el servidor al arrancar                  | `TEST SCRIPT`  |
| `PORT`              | Puerto en el que escucha Express                           | `3000`         |

> ⚠️ **Nunca** subas el fichero `.env` al repositorio.

---

## 🗄️ Modo sin base de datos

Si no quieres levantar una instancia de PostgreSQL en local, establece:

```dotenv
ENABLE_DATABASE=0
```

El servidor arrancará igualmente y las llamadas a la base de datos devolverán **datos mock** predefinidos. El resto de funcionalidades (API, scheduler, logs) operan con normalidad.

---

## 🗃️ Inicialización de la base de datos

El fichero `docker/init.sql` se ejecuta automáticamente la **primera vez** que el contenedor de Postgres arranca con el volumen vacío. Crea la tabla `sensor_data` e inserta datos de prueba.

Si necesitas reinicializar la base de datos desde cero:

```bash
docker compose down -v        # elimina contenedores y volumen
docker compose up --build     # vuelve a crear todo desde cero
```

Para cambiar el esquema o tabla que usa la app, edita el `.env`:

```dotenv
DB_SCHEMA=public
DB_TABLE=sensor_data
```

---

## 🚀 Ejecución en local sin Docker

### Requisitos
- Node.js 22+
- npm 10+
- PostgreSQL (opcional si `ENABLE_DATABASE=0`)

```bash
npm install
cp .env.example .env
npm run dev       # hot-reload con tsx
```

---

## 📡 API

Base URL: `/api`

| Método | Ruta      | Descripción                         |
|--------|-----------|-------------------------------------|
| `GET`  | `/health` | Comprueba que el servidor está activo |
| `GET`  | `/data`   | Devuelve registros entre dos fechas |

### `GET /api/data`

**Query params:**

| Param  | Tipo     | Ejemplo                  |
|--------|----------|--------------------------|
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

Al arrancar, el servidor registra un job programado que se ejecuta según la expresión cron definida en `SCHEDULE_STR`. Soporta expresiones de **5 campos** (minutos) y **6 campos** (con segundos).

| Expresión          | Frecuencia             |
|--------------------|------------------------|
| `* * * * *`        | Cada minuto            |
| `*/5 * * * * *`    | Cada 5 segundos        |
| `0 * * * *`        | Cada hora              |
| `0 6 * * *`        | Cada día a las 06:00   |
| `0 6 * * 1`        | Cada lunes a las 06:00 |

El scheduler se detiene limpiamente al recibir `SIGINT` o `SIGTERM` (Ctrl+C o parada del contenedor).

---

## 📋 Logging

Los logs se emiten en consola con colores y se guardan en `log/` con rotación. Los mensajes consecutivos idénticos se suprimen para evitar ruido.

| Nivel   | Color    | Cuándo usarlo                    |
|---------|----------|----------------------------------|
| `info`  | Verde    | Operaciones normales             |
| `warn`  | Amarillo | Situaciones anómalas no críticas |
| `error` | Rojo     | Fallos que requieren atención    |

---

## 🐋 Docker

### Build local

```bash
docker build -t my-ts-app:latest .
```

El Dockerfile usa **multi-stage build**: la primera etapa instala todas las dependencias y compila TypeScript; la segunda copia solo `dist/` y las dependencias de producción, generando una imagen más ligera.

### Ejecución con docker compose

```bash
docker compose up --build
```

Levanta Postgres y la app en la misma red. Postgres incluye healthcheck y la app espera a que esté listo antes de arrancar.

---

## 🚀 CI/CD

### GitHub Actions

El workflow `.github/workflows/docker.yml` define dos jobs:

- **`check`**: ejecuta en todo push y PR. Valida el build de TypeScript y que la imagen Docker compila correctamente. Es obligatorio para poder hacer merge a `main`.
- **`build-and-push`**: solo en push a `main` o `develop`. Publica la imagen en GitHub Container Registry (`ghcr.io`).

```
develop (push) → check → PR a main → check → merge → build-and-push
```

### GitLab CI/CD

El fichero `.gitlab-ci.yml` define las fases `build` y `deploy`. Con cada push construye y publica la imagen en el Container Registry de GitLab:

```
registry.gitlab.com/<namespace>/<project>:<branch>
```

---

## 📜 Scripts npm

| Comando         | Descripción                                |
|-----------------|--------------------------------------------|
| `npm run dev`   | Desarrollo con hot-reload via `tsx`        |
| `npm run build` | Compila TypeScript a JavaScript en `dist/` |
| `npm start`     | Ejecuta el build compilado                 |