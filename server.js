
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

// SSL configuration with improved error handling
let sslOptions;
try {
  const keyPath = process.env.SSL_KEY_PATH || 'path/to/private.key';
  const certPath = process.env.SSL_CERT_PATH || 'path/to/certificate.crt';
  
  console.log('Attempting to read SSL files:');
  console.log(`Key path: ${keyPath}`);
  console.log(`Cert path: ${certPath}`);
  
  // Check if files exist before reading
  if (!fs.existsSync(keyPath)) {
    throw new Error(`SSL key file does not exist at path: ${keyPath}`);
  }
  
  if (!fs.existsSync(certPath)) {
    throw new Error(`SSL certificate file does not exist at path: ${certPath}`);
  }
  
  sslOptions = {
    key: fs.readFileSync(keyPath),
    cert: fs.readFileSync(certPath)
  };
  
  console.log('SSL files loaded successfully');
} catch (error) {
  console.error('Error loading SSL files:', error.message);
  console.error('Continuing with HTTP only');
  sslOptions = null;
}

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

// Create server based on SSL availability
if (sslOptions) {
  // Create HTTPS server if SSL is available
  const httpsServer = https.createServer(sslOptions, app);
  
  // Start HTTPS server
  httpsServer.listen(PORT, '0.0.0.0', () => {
    console.log(`HTTPS Server running at https://0.0.0.0:${PORT}/`);
  });
} else {
  // Fallback to HTTP server
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`HTTP Server running at http://0.0.0.0:${PORT}/`);
  });
}
