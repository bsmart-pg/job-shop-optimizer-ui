
# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .

# Build with default backend URL if not provided
ARG BACKEND_URL=http://localhost:8080
ENV VITE_BACKEND_URL=$BACKEND_URL
RUN npm run build

# Stage 2: Serve with proxy capabilities
FROM node:20-alpine AS runner

WORKDIR /app

# Install required packages for our custom server
RUN npm init -y && \
    npm install express http-proxy-middleware

# Copy built assets from builder
COPY --from=builder /app/dist ./dist

# Create our custom server file
COPY <<EOF /app/server.js
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;
const BACKEND_URL = process.env.VITE_BACKEND_URL || 'http://localhost:8080';

console.log('Starting server with backend URL:', BACKEND_URL);

// Configure proxy middleware
app.use('/api', createProxyMiddleware({
  target: BACKEND_URL,
  changeOrigin: true,
  pathRewrite: {
    '^/api': '',
  },
  logLevel: 'debug',
}));

// Serve static files
app.use(express.static(path.join(__dirname, 'dist')));

// Handle all other requests with index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(\`Server running at http://0.0.0.0:\${PORT}/\`);
});
EOF

# Expose port 8080
EXPOSE 8080

# Default command to run the app
CMD ["node", "server.js"]

# Instructions for running the container:
# 1. Build the image: docker build -t jobshop-app .
# 2. Run the container: docker run -p 8080:8080 jobshop-app
# Or with custom backend URL:
# docker build --build-arg BACKEND_URL=http://your-backend-url -t jobshop-app .
# docker run -p 8080:8080 -e VITE_BACKEND_URL=http://your-backend-url jobshop-app
# Access the app at http://localhost:8080
