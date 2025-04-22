
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 8080;
const BACKEND_URL = process.env.VITE_BACKEND_URL || 'http://localhost:8080';

console.log('Starting server with backend URL:', BACKEND_URL);

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

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${PORT}/`);
});
