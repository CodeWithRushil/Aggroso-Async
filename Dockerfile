# Multi-stage Docker build for Marketplace Listing Quality Reviewer
FROM node:24-alpine AS builder

WORKDIR /app

# Copy root and workspace package files
COPY package*.json ./
COPY client/package*.json ./client/
COPY server/package*.json ./server/

# Install dependencies
RUN npm install
RUN cd client && npm install
RUN cd server && npm install

# Copy source code
COPY client/ ./client/
COPY server/ ./server/

# Build client and server
RUN cd client && npm run build
RUN cd server && npm run build

# Production Runner
FROM node:24-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3001

# Copy root package and server production dependencies
COPY package*.json ./
COPY --from=builder /app/server/package*.json ./server/
RUN cd server && npm install --omit=dev

# Copy compiled artifacts
COPY --from=builder /app/server/dist ./server/dist
COPY --from=builder /app/client/dist ./client/dist

# Expose port
EXPOSE 3001

# Run production server
CMD ["node", "server/dist/index.js"]
