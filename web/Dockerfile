# syntax=docker.io/docker/dockerfile:1

FROM node:20-alpine AS base

# Install dependencies only when needed
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

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Descomenta esto si quieres saltarte el check de tipos para ir más rápido, 
# pero asegúrate de que tu código esté bien antes.
# ENV NEXT_TELEMETRY_DISABLED=1

RUN \
  if [ -f yarn.lock ]; then yarn run build; \
  elif [ -f package-lock.json ]; then npm run build; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm run build; \
  else echo "Lockfile not found." && exit 1; \
  fi

# -----------------------------------------------------------------------------
# Production image, copy all the files and run next
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

# -----------------------------------------------------------------------------
# CORRECCIÓN CRÍTICA AQUÍ
# -----------------------------------------------------------------------------
# 3. Copiamos MANUALMENTE la carpeta prisma. 
# Next.js standalone NO la incluye porque no es código JS importado.
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

# 4. Solución para las dependencias de Prisma en Producción:
# El modo standalone a veces purga el CLI de prisma. 
# Tenemos dos opciones, la más segura para Dokploy (red cerrada) es instalarlo aquí
# o copiar los node_modules completos (muy pesado).
# Lo más ligero es instalar solo el CLI de prisma en esta capa final:
RUN npm install prisma --no-save

# Crear script de inicio
RUN echo '#!/bin/sh' > /app/start.sh && \
    echo 'set -e' >> /app/start.sh && \
    # Opcional: esperar a que la DB esté lista (útil si reinicias todo junto)
    # echo 'sleep 5' >> /app/start.sh && \
    echo 'echo "Running Prisma migrations..."' >> /app/start.sh && \
    # Usamos npx prisma, que ahora sí encontrará el schema en ./prisma y el binario instalado
    echo 'npx prisma migrate deploy' >> /app/start.sh && \
    echo 'echo "Starting Next.js..."' >> /app/start.sh && \
    echo 'exec node server.js' >> /app/start.sh && \
    chmod +x /app/start.sh

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["/app/start.sh"]
