import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Start the landing page's work from the HTML itself:
 * - preconnect to the API and image CDN so their TLS handshakes overlap the JS download
 * - modulepreload the Shop page chunk (the site opens on /shop) and the English
 *   translations chunk, so they don't wait for the main bundle to request them
 */
const landingPreloads = (backendUrl) => ({
  name: 'landing-preloads',
  transformIndexHtml: {
    order: 'post',
    handler(html, ctx) {
      const tags = [];
      // API calls are CORS requests (crossorigin connection); images are not.
      if (backendUrl && /^https?:\/\//.test(backendUrl)) {
        tags.push({
          tag: 'link',
          attrs: { rel: 'preconnect', href: new URL(backendUrl).origin, crossorigin: '' },
          injectTo: 'head-prepend',
        });
      }
      tags.push({
        tag: 'link',
        attrs: { rel: 'preconnect', href: 'https://res.cloudinary.com' },
        injectTo: 'head-prepend',
      });

      if (ctx.bundle) {
        const chunks = Object.values(ctx.bundle).filter((c) => c.type === 'chunk');
        const entry = chunks.find((c) => c.isEntry);
        const alreadyLoaded = new Set([entry?.fileName, ...(entry?.imports || [])]);
        const wanted = ['/src/pages/Shop.jsx', '/src/locales/en/lazy.js'];
        const files = new Set();
        for (const chunk of chunks) {
          if (!wanted.some((m) => chunk.facadeModuleId?.replace(/\\/g, '/').endsWith(m))) continue;
          for (const file of [chunk.fileName, ...chunk.imports]) {
            if (!alreadyLoaded.has(file)) files.add(file);
          }
        }
        for (const file of files) {
          tags.push({
            tag: 'link',
            attrs: { rel: 'modulepreload', crossorigin: '', href: `/${file}` },
            injectTo: 'head',
          });
        }
      }
      return tags;
    },
  },
});

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react(), landingPreloads(env.VITE_BACKEND_URL)],
    // Production builds drop debug logging; warnings and errors are kept.
    esbuild: mode === 'production' ? { pure: ['console.log', 'console.info', 'console.debug'] } : {},
    build: {
      rollupOptions: {
        output: {
          // React and the router rarely change: keep them in their own long-cached
          // chunk so returning visitors only re-download app code after a deploy.
          manualChunks(id) {
            if (/node_modules[\\/](react|react-dom|scheduler|react-router|react-router-dom|@remix-run[\\/]router)[\\/]/.test(id)) {
              return 'react-vendor';
            }
          },
        },
      },
    },
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: 'http://127.0.0.1:5000',
          changeOrigin: true,
          secure: false,
        },
        '/uploads': {
          target: 'http://127.0.0.1:5000',
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});
