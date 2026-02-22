FROM node:18-alpine AS builder
WORKDIR /app

# Copy root and workspace manifests
COPY services/interaction-service/package*.json ./

# Install dependencies using BuildKit secret for secure token handling
RUN --mount=type=secret,id=github_token \
  echo "@dhakdhakgo:registry=https://npm.pkg.github.com" > .npmrc && \
  GITHUB_TOKEN=$(cat /run/secrets/github_token) && \
  echo "Token length is: ${#GITHUB_TOKEN}" && \
  echo "//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}" >> .npmrc && \
  npm ci --production && \
  rm -f .npmrc

FROM node:18-alpine AS runtime
WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY services/interaction-service/src ./src
COPY services/interaction-service/package*.json ./

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
RUN chown -R nodejs:nodejs /app
USER nodejs

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the application
CMD ["npm", "start"]