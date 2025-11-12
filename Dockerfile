# Build stage
FROM node:20-bullseye-slim AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# Generate Prisma client using local script to avoid version drift
RUN npm run prisma:generate
# Use build-specific tsconfig via Nest CLI config
RUN npm run build
# Prune dev dependencies after build & generation so node_modules contains only prod deps and generated prisma client
RUN npm prune --omit=dev

# Runtime stage
FROM node:20-bullseye-slim
WORKDIR /app
ENV NODE_ENV=production
# Ensure OpenSSL 1.1 is available (bullseye)
RUN apt-get update -y && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*
# Reuse pruned node_modules (already contains generated Prisma client)
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/.env ./.env
EXPOSE 4000
# Use the same entrypoint as package.json start:prod
CMD ["node", "dist/main.js"]
