# backend/Dockerfile
FROM node:20-alpine AS base
WORKDIR /app

# 1. Dependencias primero (mejor cache de Docker)
COPY package*.json ./
RUN npm ci

# 2. Copiar todo el código fuente
COPY . .

# 3. Generar cliente Prisma (solo lee schema.prisma, no necesita DB)
RUN npx prisma generate

# ── Development ───────────────────────────────────────────
FROM base AS development
WORKDIR /app

COPY entrypoint.sh ./
RUN chmod +x entrypoint.sh

EXPOSE 3000
EXPOSE 9229

# El volumen ./backend/src:/app/src sobreescribe src/ en runtime (hot reload)
CMD ["./entrypoint.sh"]

# ── Builder (producción) ──────────────────────────────────
FROM base AS builder
WORKDIR /app

RUN npm run build

# ── Production ────────────────────────────────────────────
FROM node:20-alpine AS production
WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma

COPY entrypoint.sh ./
RUN chmod +x entrypoint.sh

EXPOSE 3000
CMD ["./entrypoint.sh"]