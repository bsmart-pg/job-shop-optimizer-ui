
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

# Stage 2: Serve
FROM node:20-alpine AS runner

# Install a lightweight static server and proxy middleware
RUN npm i -g serve serve-handler http-proxy connect

WORKDIR /app

# Copy built assets from builder
COPY --from=builder /app/dist ./dist

# Create a simple proxy server
COPY <<EOF /app/server.js
const http = require('http');
const httpProxy = require('http-proxy');
const serveHandler = require('serve-handler');
const connect = require('connect');
const url = require('url');

const backendUrl = process.env.BACKEND_URL || 'http://localhost:8080';
const port = process.env.PORT || 8080;

// Create proxy
const proxy = httpProxy.createProxyServer();
const app = connect();

// Handle API requests through proxy
app.use((req, res, next) => {
  const urlParts = url.parse(req.url);
  
  if (urlParts.pathname.startsWith('/api')) {
    console.log(`Proxying request to \${backendUrl}: \${urlParts.pathname}`);
    
    // Remove /api prefix when forwarding to backend
    req.url = req.url.replace(/^\/api/, '');
    
    proxy.web(req, res, { 
      target: backendUrl,
      changeOrigin: true 
    }, (err) => {
      console.error('Proxy error:', err);
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Proxy error');
    });
  } else {
    // Serve static files for non-api requests
    serveHandler(req, res, { public: 'dist' });
  }
});

// Create server
const server = http.createServer(app);

// Start server
server.listen(port, () => {
  console.log(`Server running on port \${port}`);
  console.log(`API requests will be proxied to \${backendUrl}`);
});
EOF

# Expose port 8080
EXPOSE 8080

# Start the custom server instead of serve
CMD ["node", "server.js"]

# Instructions for running the container:
# 1. Build the image: docker build -t jobshop-app .
# 2. Run the container: docker run -p 8080:8080 -e BACKEND_URL=http://your-backend-url jobshop-app
# Access the app at http://localhost:8080
