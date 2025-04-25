
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');
const https = require('https');
const fs = require('fs');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 8080;
const BACKEND_URL = process.env.VITE_BACKEND_URL || 'http://localhost:8080';

console.log('Starting server with backend URL:', BACKEND_URL);

// SSL configuration
const sslOptions = {
  key: fs.readFileSync(process.env.SSL_KEY_PATH || 'path/to/private.key'),
  cert: fs.readFileSync(process.env.SSL_CERT_PATH || 'path/to/certificate.crt')
};

// Proxy middleware configuration
app.use('/api', createProxyMiddleware({
  target: BACKEND_URL,
  changeOrigin: true,
  pathRewrite: function(path) {
    return path.replace(/^\/api/, '');
  },
  logLevel: 'debug'
}));

// Static file serving
app.use(express.static(path.join(__dirname, 'dist')));

// SPA fallback - serve index.html for all unmatched routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Create HTTPS server
const httpsServer = https.createServer(sslOptions, app);

// Start server
httpsServer.listen(PORT, '0.0.0.0', () => {
  console.log(`HTTPS Server running at https://0.0.0.0:${PORT}/`);
});

