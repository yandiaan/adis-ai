# Stage 1: Dependencies
FROM node:20-alpine AS deps

RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy root package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./

# Copy web package
COPY apps/web/package.json ./apps/web/

# Install pnpm
RUN corepack enable pnpm && pnpm install --frozen-lockfile

# Stage 2: Builder
FROM node:20-alpine AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Enable pnpm
RUN corepack enable pnpm

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules

# Copy source files
COPY . .

# Build web app
WORKDIR /app/apps/web
ENV NODE_ENV=production
RUN pnpm build

# Stage 3: Runner
FROM node:20-alpine AS runner
WORKDIR /app/apps/web

# Install curl for healthcheck
RUN apk add --no-cache curl

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=4321
ENV ASTRO_TELEMETRY_DISABLED=1

# Copy built files and dependencies (preserve pnpm symlink layout)
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/apps/web/node_modules ./node_modules
COPY --from=builder /app/apps/web/dist ./dist
COPY --from=builder /app/apps/web/package.json ./
COPY --from=builder /app/apps/web/astro.config.mjs ./
COPY --from=builder /app/apps/web/public ./public
COPY --from=builder /app/apps/web/src/pages ./src/pages

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 astrouser
USER astrouser

EXPOSE 4321

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:4321/ || exit 1

CMD ["node", "node_modules/astro/astro.js", "preview", "--host", "0.0.0.0", "--port", "4321"]
