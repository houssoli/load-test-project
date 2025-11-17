# 📚 TYPESCRIPT LEARNING: Multi-stage Docker Build
#
# Multi-stage builds create smaller, more secure production images
# Stage 1: Build TypeScript code
# Stage 2: Run the compiled JavaScript

# ======================================
# Stage 1: Builder
# ======================================
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install ALL dependencies (including devDependencies for building)
RUN npm ci

# Copy source code
COPY src ./src

# 🔍 Type-check the TypeScript code BEFORE building
# This fails the build if there are any type errors
# Catches issues early in the CI/CD pipeline
RUN npm run type-check

# Build TypeScript to JavaScript
# This creates the /app/dist directory
RUN npm run build

# ======================================
# Stage 2: Production
# ======================================
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ONLY production dependencies
RUN npm ci --only=production

# Copy compiled JavaScript from builder stage
# This copies /app/dist from builder to /app/dist in this stage
COPY --from=builder /app/dist ./dist

# Copy .env file if needed (optional)
COPY .env* ./ 

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
# Run the compiled JavaScript (not TypeScript)
CMD ["node", "dist/server.js"]
