
# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .

# Build with default backend URL if not provided
ARG BACKEND_URL=/api
ENV VITE_BACKEND_URL=$BACKEND_URL
RUN npm run build

# Stage 2: Serve with proxy
FROM node:20-alpine AS runner

# Install a lightweight static server with proxy capabilities
RUN npm i -g serve http-proxy-middleware

WORKDIR /app

# Copy built assets from builder
COPY --from=builder /app/dist ./dist
# Add proxy configuration
COPY proxy.js ./

# Expose port 8080
EXPOSE 8080

# Default command to run the app with proxy
CMD ["node", "proxy.js"]

# Instructions for running the container:
# 1. Build the image: docker build -t jobshop-app .
# 2. Run the container with docker-compose (see docker-compose.yml example below)
# The frontend will connect to /api which gets proxied to http://backend_timefold:8081
# Access the app at http://localhost:8080
