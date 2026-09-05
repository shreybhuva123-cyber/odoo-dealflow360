# ============================================================================
# DealFlow360 Backend Production Dockerfile
# Multi-stage lightweight build on Alpine Linux
# ============================================================================

# Stage 1: Build & Prisma Generation
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency manifests
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies (including devDependencies for prisma client generation)
RUN npm ci

# Generate Prisma Client for the linux-musl platform
RUN npx prisma generate

# Stage 2: Minimal Production Runtime
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Install curl/wget for healthchecks
RUN apk add --no-cache curl wget

# Create non-root user for principle of least privilege
USER node

# Copy manifests and dependencies from builder with proper permissions
COPY --chown=node:node package*.json ./
COPY --chown=node:node --from=builder /app/node_modules ./node_modules
COPY --chown=node:node prisma ./prisma/
COPY --chown=node:node src ./src/
COPY --chown=node:node scripts ./scripts/
COPY --chown=node:node postman ./postman/
COPY --chown=node:node docs ./docs/

EXPOSE 5000

# Native container healthcheck against liveness probe
HEALTHCHECK --interval=20s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:5000/health || exit 1

CMD ["npm", "start"]
