# Multi-stage build for EduSphere
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package.json files
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

# Install dependencies
RUN cd backend && npm ci --only=production
RUN cd frontend && npm ci

# Build frontend
COPY frontend/ ./frontend/
RUN cd frontend && npm run build

# Production stage
FROM node:18-alpine AS production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create app user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S edusphere -u 1001

# Set working directory
WORKDIR /app

# Copy backend dependencies
COPY --from=builder --chown=edusphere:nodejs /app/backend/node_modules ./backend/node_modules
COPY --from=builder --chown=edusphere:nodejs /app/backend/package*.json ./backend/

# Copy backend source
COPY --chown=edusphere:nodejs backend/ ./backend/

# Copy frontend build
COPY --chown=edusphere:nodejs --from=builder /app/frontend/build ./public

# Create uploads directory
RUN mkdir -p ./uploads && chown edusphere:nodejs ./uploads

# Switch to non-root user
USER edusphere

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/api/health', (res) => process.exit(res.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

# Start the application
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "backend/server.js"]
