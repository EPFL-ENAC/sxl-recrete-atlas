/// <reference types="vite" />
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vuetify from 'vite-plugin-vuetify'
import { resolve, dirname } from 'node:path'
import { default as VueI18nPlugin } from '@intlify/unplugin-vue-i18n/vite';
import type { Plugin } from 'vite';

export default defineConfig({
  plugins: [vue(), vuetify(),
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
  base: '/'
})
