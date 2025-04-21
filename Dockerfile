
# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .

# Build with default backend URL if not provided
ARG BACKEND_URL=http://backend_timefold:8081
ENV BACKEND_URL=$BACKEND_URL
RUN npm run build

# Stage 2: Serve
FROM node:20-alpine AS runner

ARG BACKEND_URL=http://backend_timefold:8081
ENV BACKEND_URL=$BACKEND_URL

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
# 2. Run the container: docker run -p 8080:8080 jobshop-app
# Or with custom backend URL:
# docker build --build-arg BACKEND_URL=http://your-backend-url jobshop-app .
# Access the app at http://localhost:8080
