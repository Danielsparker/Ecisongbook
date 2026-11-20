import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv, type Plugin} from 'vite';

function noImmutableDepsCachePlugin(): Plugin {
  return {
    name: 'no-immutable-deps-cache',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url && req.url.includes('/deps/')) {
          const origSetHeader = res.setHeader.bind(res);
          res.setHeader = ((name: string, value: number | string | readonly string[]) => {
            if (name.toLowerCase() === 'cache-control') {
              return origSetHeader(name, 'no-cache');
            }
            return origSetHeader(name, value);
          }) as typeof res.setHeader;
        }
        next();
      });
    },
  };
}

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    cacheDir: 'node_modules/.vite-eci-v2',
    plugins: [react(), tailwindcss(), noImmutableDepsCachePlugin()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    optimizeDeps: {
      esbuildOptions: {
        define: {
          __ECI_DEPS_REV__: '"v2"',
        },
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      allowedHosts: true,
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
