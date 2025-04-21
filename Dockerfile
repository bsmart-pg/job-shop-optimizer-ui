
# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
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
# 2. Run the container: docker run -p 8080:8080 jobshop-app
# Access the app at http://localhost:8080
