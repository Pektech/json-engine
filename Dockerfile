# Multi-stage Dockerfile for Next.js standalone output
# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package files and install all dependencies (including dev)
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Stage 3: Production
FROM node:20-alpine AS production
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3030

# Copy standalone output from builder
COPY --from=builder /app/.next/standalone ./

# Copy static files
COPY --from=builder /app/.next/static ./.next/static

# Expose port 3030
EXPOSE 3030

# Start the application
CMD ["node", "server.js"]
