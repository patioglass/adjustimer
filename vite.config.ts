import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { crx } from '@crxjs/vite-plugin'
import manifest from './manifest.json'
import { resolve, join } from 'path'

import tailwindcss from "@tailwindcss/vite"

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const isDocs = mode === 'docs'
  if (mode === 'docs') {
    return {
      root: 'lp',
      base: '/adjustimer/',
      build: {
        outDir: '../docs',
      },
      plugins: [react(), tailwindcss()],
      publicDir: resolve(__dirname, 'public'), // ←絶対パスで指定
    }
  } else {
    // === Chrome拡張用ビルド ===
    return {
      build: {
        rollupOptions: {
          input: {
            adjustimer: join(__dirname, 'src/background/adjustimer.html'), 
          },
          output: {
            chunkFileNames: 'assets/chunk-[hash].js',
          },
        },
      },
      resolve: {
        alias: {
          '@': resolve(__dirname, './src')  // @をsrcフォルダに解決
        }
      },
      plugins: [
        react(),
        !isDocs && crx({ manifest }), // LPビルド時は拡張機能プラグインを外す
        tailwindcss(),
      ].filter(Boolean),
      legacy: {
        skipWebSocketTokenCheck: true,
      },
    }
  }
})
