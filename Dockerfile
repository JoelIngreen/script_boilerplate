FROM node:22-slim AS builder
WORKDIR /app

# Instala TODAS las dependencias (incluyendo devDependencies para poder compilar)
COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src

# Compila TypeScript → JavaScript
RUN npm run build

# ── Imagen final (solo lo necesario para producción) ──────────────────────────
FROM node:22-slim
WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist

CMD ["node", "dist/index.js"]