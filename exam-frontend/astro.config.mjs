import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import node from '@astrojs/node';

export default defineConfig({
  integrations: [
    tailwind({
      applyBaseStyles: false,
    }),
  ],
  
  output: 'hybrid', // SSR for dynamic pages, SSG for static
  
  adapter: node({
    mode: 'standalone',
  }),

  vite: {
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            // Code splitting for better performance
            'exam-engine': [
              './src/lib/exam/controller',
              './src/lib/exam/autoSave',
              './src/lib/exam/timer',
            ],
            'media': [
              './src/lib/media/recorder',
              './src/lib/media/player',
              './src/lib/media/upload',
            ],
            'offline': [
              './src/lib/offline/download',
              './src/lib/offline/sync',
              './src/lib/db/indexedDB',
            ],
            'charts': ['chart.js'],
          },
        },
      },
      // Optimize for mobile
      cssCodeSplit: true,
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
        },
      },
    },
    optimizeDeps: {
      include: ['dexie', 'axios', 'chart.js'],
    },
  },

  server: {
    port: 3000,
    host: true,
  },

  compressHTML: true,
});
