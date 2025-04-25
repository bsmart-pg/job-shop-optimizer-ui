
# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app
COPY package.json ./
# Use npm install instead of npm ci to handle any lock file inconsistencies
RUN npm install
COPY . .

# Build with default backend URL if not provided
ARG BACKEND_URL=http://localhost:8080
ENV VITE_BACKEND_URL=$BACKEND_URL
RUN npm run build

# Stage 2: Serve with proxy capabilities
FROM node:20-alpine AS runner

# Build with default backend URL if not provided
ARG BACKEND_URL
ENV VITE_BACKEND_URL=$BACKEND_URL

WORKDIR /app

# Create directory for SSL certificates with proper permissions
RUN mkdir -p /app/ssl && chmod 755 /app/ssl

# Set default paths for SSL files inside the container
ENV SSL_KEY_PATH=/app/ssl/private.key
ENV SSL_CERT_PATH=/app/ssl/certificate.crt

# Install required packages for our custom server
RUN npm init -y && \
    npm install express@v4.20.0 http-proxy-middleware

# Copy built assets from builder
COPY --from=builder /app/dist ./dist
COPY server.js .

# Expose port 8080
EXPOSE 8080

# Default command to run the app
CMD ["node", "server.js"]
