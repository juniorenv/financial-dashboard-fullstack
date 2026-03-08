# ─── Stage 1: builder ─────────────────────────────────────────────────────────
FROM node:22-alpine AS builder

RUN corepack enable

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm prisma generate
RUN pnpm build


# ─── Stage 2: runner ──────────────────────────────────────────────────────────
FROM node:22-alpine AS runner

RUN corepack enable

WORKDIR /app

ENV NODE_ENV=production
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0

# non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# full node_modules from builder (includes tsx and devDeps for seed)
COPY --from=builder --chown=appuser:appgroup /app/node_modules ./node_modules
COPY --from=builder --chown=appuser:appgroup /app/dist         ./dist
COPY --from=builder --chown=appuser:appgroup /app/prisma       ./prisma
COPY --from=builder --chown=appuser:appgroup /app/src          ./src
COPY --chown=appuser:appgroup prisma.config.ts ./
COPY --chown=appuser:appgroup tsconfig.json    ./
COPY --chown=appuser:appgroup package.json     ./
COPY --chown=appuser:appgroup entrypoint.sh    ./

RUN chmod +x ./entrypoint.sh

USER appuser

EXPOSE 3000

ENTRYPOINT ["./entrypoint.sh"]