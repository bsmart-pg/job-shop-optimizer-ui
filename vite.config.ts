
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,  // Explicitly set to 8080 as requested
    proxy: {
      '/api': {
        target: process.env.VITE_BACKEND_URL || 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        configure: (proxy, _options) => {
          console.log('Proxy configuration loaded.');
          console.log(`Target URL: ${process.env.VITE_BACKEND_URL || 'http://localhost:8080'}`);
          
          proxy.on('error', (err, _req, _res) => {
            console.log('----------------------------------------');
            console.error('PROXY ERROR:', err);
            console.log('----------------------------------------');
          });
          
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('----------------------------------------');
            console.log(`PROXY REQUEST: ${req.method} ${req.url}`);
            console.log(`TARGET PATH: ${proxyReq.path}`);
            console.log(`HEADERS:`, proxyReq.getHeaders());
            console.log('----------------------------------------');
          });
          
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('----------------------------------------');
            console.log(`PROXY RESPONSE: ${proxyRes.statusCode} ${req.url}`);
            console.log(`HEADERS:`, proxyRes.headers);
            console.log('----------------------------------------');
          });
        },
      }
    }
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
