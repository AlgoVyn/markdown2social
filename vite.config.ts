import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    base: env.VITE_BASE_PATH || '/marksocial/',

    // Build optimizations for SEO and performance
    build: {
      // Generate source maps for debugging (disable in production if needed)
      sourcemap: mode !== 'production',

      // Minification settings (uses esbuild by default for faster builds)
      minify: mode === 'production',
      cssMinify: mode === 'production',

      // Code splitting for better caching
      rollupOptions: {
        output: {
          manualChunks: {
            // Separate vendor chunks for better caching
            'vendor-react': ['react', 'react-dom', 'react-router-dom'],
            'vendor-codemirror': ['@codemirror/lang-markdown', '@uiw/react-codemirror'],
            'vendor-markdown': ['marked'],
            'vendor-utils': ['dompurify', 'classnames', 'lucide-react'],
          },
          // Asset naming for better caching
          assetFileNames: (assetInfo) => {
            const info = assetInfo.name ? assetInfo.name.split('.') : [];
            const ext = info[info.length - 1] || 'js';
            if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
              return `assets/images/[name]-[hash][extname]`;
            }
            if (/css/i.test(ext)) {
              return `assets/css/[name]-[hash][extname]`;
            }
            return `assets/[name]-[hash][extname]`;
          },
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
        },
      },

      // Target modern browsers for smaller bundles
      target: 'es2020',

      // Report bundle size
      reportCompressedSize: true,

      // Chunk size warning limit (in kbs)
      chunkSizeWarningLimit: 500,
    },

    // Development server settings
    server: {
      port: 5173,
      strictPort: false,
      open: true,
      // Security headers for development
      headers: {
        'X-Frame-Options': 'DENY',
        'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
      },
    },

    // Preview server (for production build testing)
    preview: {
      port: 4173,
      strictPort: false,
    },

    // Resolve aliases
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
        '@components': resolve(__dirname, 'src/components'),
        '@utils': resolve(__dirname, 'src/utils'),
        '@hooks': resolve(__dirname, 'src/hooks'),
        '@assets': resolve(__dirname, 'logo'),
      },
    },

    // CSS settings
    css: {
      devSourcemap: true,
      modules: {
        localsConvention: 'camelCaseOnly',
      },
    },

    // Define global constants
    define: {
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
      __BUILD_DATE__: JSON.stringify(new Date().toISOString()),
    },

    // Optimize dependencies
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom', 'marked', 'dompurify'],
      exclude: [],
    },

    // Experimental features
    experimental: {
      // Enable render built time for SSR (if needed in future)
      renderBuiltUrl(filename, { hostType }) {
        if (hostType === 'js') {
          return { js: filename };
        }
        return { relative: true };
      },
    },
  };
});
