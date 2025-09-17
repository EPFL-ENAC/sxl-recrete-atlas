import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vuetify from 'vite-plugin-vuetify'
import { resolve, dirname } from 'node:path'
import { default as VueI18nPlugin } from '@intlify/unplugin-vue-i18n/vite';
import type { Plugin } from 'vite';

export default defineConfig({
  optimizeDeps: {
    exclude: ['marked-emoji']
  },
  plugins: [vue(), vuetify({
    autoImport: true,
    styles: {
      configFile: 'src/assets/settings.scss'
    }
  }),
    VueI18nPlugin({
    /* options */
    // locale messages resource pre-compile option
    include: resolve(dirname(fileURLToPath(import.meta.url)), './src/locales/**'),
  }) as Plugin,
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  base: '/',
  build: {
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          if (!assetInfo.name) return 'assets/[name]-[hash][extname]';
          let extType = assetInfo.name.split('.').at(1);
          if (extType && /png|jpe?g|svg|gif|tiff|bmp|webp/i.test(extType)) {
            extType = 'img';
          }
          return `assets/${extType || 'unknown'}/[name]-[hash][extname]`;
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js'
      }
    }
  }
})
