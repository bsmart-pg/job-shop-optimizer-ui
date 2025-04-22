
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
  console.log(`Server running at http://0.0.0.0:${PORT}/`);
});
