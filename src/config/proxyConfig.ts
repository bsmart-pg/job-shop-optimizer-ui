
const createProxyConfig = () => ({
  '/api': {
    target: process.env.BACKEND_URL || 'http://backend_timefold:8081',
    changeOrigin: true,
    rewrite: (path: string) => {
      console.log('Original path:', path);
      return path.replace(/^\/api/, '');
    },
    configure: (proxy: any, _options: any) => {
      proxy.on('error', (err: Error, _req: any, _res: any) => {
        console.error('Detailed proxy error:', err);
      });
      proxy.on('proxyReq', (proxyReq: any, req: any, _res: any) => {
        console.log('Sending Request to Backend:', {
          method: req.method,
          url: req.url,
          headers: proxyReq.getHeaders()
        });
      });
      proxy.on('proxyRes', (proxyRes: any, req: any, _res: any) => {
        console.log('Backend Response:', {
          url: req.url,
          status: proxyRes.statusCode,
          headers: proxyRes.headers
        });
      });
    }
  }
});

export default createProxyConfig;
