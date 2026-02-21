FROM node:18-alpine AS builder
WORKDIR /app

# Copy root and workspace manifests for deterministic installs
COPY package*.json ./
COPY services/shared/package*.json ./services/shared/
COPY services/post-service/package*.json ./services/post-service/

# Install dependencies using BuildKit secret for secure token handling
RUN --mount=type=secret,id=github_token \
  echo "@dhak:registry=https://npm.pkg.github.com" > .npmrc && \
  echo "//npm.pkg.github.com/:_authToken=$(cat /run/secrets/github_token)" >> .npmrc && \
  npm ci --production && \
  rm -f .npmrc

FROM node:18-alpine AS runtime
WORKDIR /app

# Copy installed node_modules from builder
COPY --from=builder /app/node_modules ./node_modules

# Copy service source
COPY services/post-service/src ./src

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
RUN chown -R nodejs:nodejs /app
USER nodejs

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

CMD ["node", "src/index.js"]