# syntax=docker.io/docker/dockerfile:1

FROM node:20-alpine AS base

# -----------------------------------------------------------------------------
# FASE DEPS: Instalar dependencias
# -----------------------------------------------------------------------------
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* .npmrc* ./

RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi

# -----------------------------------------------------------------------------
# FASE BUILDER: Construir la aplicación
# -----------------------------------------------------------------------------
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# CORRECCIÓN AQUÍ:
# Modificamos el bloque para asegurar que pnpm existe antes de usarlo.
# Usamos 'npm install -g pnpm' en lugar de corepack para evitar problemas de PATH en Alpine.
RUN \
  if [ -f yarn.lock ]; then yarn run build; \
  elif [ -f package-lock.json ]; then npm run build; \
  elif [ -f pnpm-lock.yaml ]; then \
    npm install -g pnpm && \
    pnpm run build; \
  else echo "Lockfile not found." && exit 1; \
  fi

# -----------------------------------------------------------------------------
# FASE RUNNER: Imagen de producción
# -----------------------------------------------------------------------------
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
# ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 1. Copiamos los assets públicos
COPY --from=builder /app/public ./public

# 2. Copiamos el standalone (la app optimizada)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# 3. Copiamos la carpeta prisma (necesaria para migraciones)
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

# 4. Instalamos Prisma GLOBALMENTE (-g)
# Esto soluciona los conflictos entre npm y pnpm y asegura que el comando 'prisma' exista.
RUN npm install -g prisma

# 5. Script de arranque
RUN echo '#!/bin/sh' > /app/start.sh && \
    echo 'set -e' >> /app/start.sh && \
    echo 'echo ">>> Ejecutando migraciones de Prisma..."' >> /app/start.sh && \
    echo 'prisma migrate deploy' >> /app/start.sh && \
    echo 'echo ">>> Iniciando Next.js..."' >> /app/start.sh && \
    echo 'exec node server.js' >> /app/start.sh && \
    chmod +x /app/start.sh

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["/app/start.sh"]
