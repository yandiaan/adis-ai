# Stage 1: Builder
FROM node:20-bookworm-slim AS builder

# Install build dependencies for native modules (better-sqlite3)
RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ ca-certificates \
  && rm -rf /var/lib/apt/lists/*
WORKDIR /app

# Enable pnpm
RUN corepack enable pnpm

# Copy root package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./

# Copy validators package
COPY packages/validators ./packages/validators/

# Copy server package
COPY apps/server ./apps/server/

# Install all dependencies (including devDependencies for build)
RUN pnpm install --frozen-lockfile

# Build validators first (server depends on it)
WORKDIR /app/packages/validators
RUN pnpm build

# Build server
WORKDIR /app/apps/server
RUN rm -rf dist tsconfig.tsbuildinfo && pnpm build

# Stage 2: Runner
FROM node:20-bookworm-slim AS runner
WORKDIR /app/apps/server

# Install curl for healthcheck and runtime dependencies
RUN apt-get update \
  && apt-get install -y --no-install-recommends curl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production
ENV PORT=3000

# Copy built files and dependencies
COPY --from=builder /app/apps/server/dist ./dist
COPY --from=builder /app/node_modules ../../node_modules
COPY --from=builder /app/packages/validators/dist ../../packages/validators/dist
COPY --from=builder /app/apps/server/package.json ./
COPY --from=builder /app/apps/server/node_modules ./node_modules
COPY --from=builder /app/node_modules/.pnpm ../../node_modules/.pnpm

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 expressuser

# Ensure runtime-writable directories exist for sqlite + uploads
RUN mkdir -p /app/apps/server/data /app/apps/server/uploads \
  && chown -R expressuser:nodejs /app/apps/server/data /app/apps/server/uploads
USER expressuser

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

CMD ["node", "dist/index.js"]
