
# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .

# Build with default backend URL if not provided
ARG BACKEND_URL=http://backend_timefold:8081
ENV VITE_BACKEND_URL=$BACKEND_URL
RUN npm run build

# Stage 2: Serve
FROM node:20-alpine AS runner

# Install a lightweight static server
RUN npm i -g serve

WORKDIR /app

# Copy built assets from builder
COPY --from=builder /app/dist ./dist

# Expose port 8080
EXPOSE 8080

# Default command to run the app
CMD ["serve", "-s", "dist", "-l", "8080"]

# Instructions for running the container:
# 1. Build the image: docker build -t jobshop-app .
# 2. Run the container with docker-compose (see docker-compose.yml example below)
# The frontend will connect to http://backend_timefold:8081 by default
# Access the app at http://localhost:8080

