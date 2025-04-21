
const { createServer } = require('http');
const { createProxyMiddleware } = require('http-proxy-middleware');
const { exec } = require('child_process');

// Define backend URL (from environment or default)
const BACKEND_URL = process.env.BACKEND_SERVICE_URL || 'http://backend_timefold:8081';

// Create serve command with proxy
const serveProcess = exec('serve -s dist -l 8080');

// Log output from serve
serveProcess.stdout.on('data', (data) => {
  console.log(`serve: ${data}`);
});

serveProcess.stderr.on('data', (data) => {
  console.error(`serve error: ${data}`);
});

// Create proxy server
const proxy = createProxyMiddleware({
  target: BACKEND_URL,
  changeOrigin: true,
  pathRewrite: {
    '^/api': '', // Remove /api prefix when forwarding to backend
  },
  logLevel: 'debug'
});

// Create HTTP server for proxy
const server = createServer((req, res) => {
  // Only proxy /api requests
  if (req.url.startsWith('/api')) {
    console.log(`Proxying request: ${req.url} -> ${BACKEND_URL}${req.url.replace(/^\/api/, '')}`);
    proxy(req, res);
  } else {
    // For all other requests, respond with 404
    res.writeHead(404);
    res.end('Not found');
  }
});

// Listen on port 3001 for the proxy (different from serve's port)
server.listen(3001, () => {
  console.log(`Proxy server running on port 3001, forwarding to ${BACKEND_URL}`);
});

console.log('Frontend serving on port 8080, API requests will be proxied through /api');
