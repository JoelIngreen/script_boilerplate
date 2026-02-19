FROM node:22-slim AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

# Genera el Prisma Client (necesario antes de compilar TypeScript)
COPY prisma ./prisma
RUN npx prisma generate

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# ── Imagen final ──────────────────────────────────────────────────────────────
FROM node:22-slim
WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

# El cliente generado va dentro de node_modules; con npm ci --omit=dev
# hay que regenerarlo en la imagen final también
COPY prisma ./prisma
RUN npx prisma generate

COPY --from=builder /app/dist ./dist

CMD ["node", "dist/index.js"]
