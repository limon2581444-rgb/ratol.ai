import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'trade-lens-api-server',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            if (!req.url?.startsWith('/api/')) {
              return next();
            }

            let bodyStr = '';
            req.on('data', (chunk: any) => {
              bodyStr += chunk;
            });

            req.on('end', async () => {
              let body: any = {};
              try {
                if (bodyStr) body = JSON.parse(bodyStr);
              } catch (e) {
                body = {};
              }
              (req as any).body = body;

              const {
                handleGenerateSignal,
                handleVoiceAssistant,
                handleAnalyzeChart,
                handleVerifyLicense,
                handleCreateLicense
              } = await import('./src/server/api.ts');

              if (req.url === '/api/generate-signal' && req.method === 'POST') {
                return handleGenerateSignal(req as any, res as any);
              }
              if (req.url === '/api/voice-assistant' && req.method === 'POST') {
                return handleVoiceAssistant(req as any, res as any);
              }
              if (req.url === '/api/analyze-chart' && req.method === 'POST') {
                return handleAnalyzeChart(req as any, res as any);
              }
              if (req.url === '/api/verify-license' && req.method === 'POST') {
                return handleVerifyLicense(req as any, res as any);
              }
              if (req.url === '/api/admin/create-license' && req.method === 'POST') {
                return handleCreateLicense(req as any, res as any);
              }

              res.writeHead(404, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Endpoint not found' }));
            });
          });
        }
      }
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
