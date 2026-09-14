# Multi-stage build for production-ready Docker image
FROM node:24-alpine AS base

# Install production dependencies
FROM base AS deps

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --only=production && npm cache clean --force

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

# Install ALL dependencies (including dev dependencies) for building
COPY package.json package-lock.json* ./
RUN npm ci

COPY . .

# Build the application
RUN npm run build-tsc

# Production image, copy all the files and run the app
FROM gcr.io/distroless/nodejs24-debian12:nonroot AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy the built application
COPY --from=builder --chown=nonroot:nonroot /app/dist ./dist
COPY --from=deps --chown=nonroot:nonroot /app/node_modules ./node_modules
COPY --from=builder --chown=nonroot:nonroot /app/package.json ./package.json

# Expose the port the app runs on
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD ["/nodejs/bin/node", "-e", "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"]

# Start the application
CMD ["dist/index.js"]
