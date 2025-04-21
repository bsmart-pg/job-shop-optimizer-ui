
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      '/api': {
        target: process.env.BACKEND_URL || 'http://backend_timefold:8081',
        changeOrigin: true,
        rewrite: (path) => {
          console.log('Original path:', path);  // Add this line for more logging
          return path.replace(/^\/api/, '');
        },
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.error('Detailed proxy error:', err);  // Enhanced error logging
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request to Backend:', {
              method: req.method,
              url: req.url,
              headers: proxyReq.getHeaders()  // Log request headers
            });
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Backend Response:', {
              url: req.url,
              status: proxyRes.statusCode,
              headers: proxyRes.headers
            });
          });
        }
      }
    }
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    'process.env.BACKEND_URL': JSON.stringify(process.env.BACKEND_URL || 'http://backend_timefold:8081'),
  }
}));
