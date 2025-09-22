# Multi-stage build for Vite React app on Cloud Run

# 1) Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies first for better layer caching
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# 2) Runtime stage: lightweight Node serving static files
FROM node:20-alpine AS runner
WORKDIR /app

# Install a tiny static server that supports SPA fallback and custom port
RUN npm install -g serve@14

# Copy built assets and ensure non-root ownership
COPY --chown=node:node --from=builder /app/dist ./dist

# Use non-root user for security
USER node

# Cloud Run expects the server to listen on $PORT (defaults to 8080)
ENV PORT=8080
EXPOSE 8080

# Use sh -c so the $PORT env var is expanded
CMD ["sh", "-c", "serve -s dist -l ${PORT:-8080}"]

