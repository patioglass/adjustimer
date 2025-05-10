import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { crx } from '@crxjs/vite-plugin'
import manifest from './manifest.json'
import { resolve, join } from 'path'

import tailwindcss from "@tailwindcss/vite"

// https://vite.dev/config/
export default defineConfig({
  
  build: {
    rollupOptions: {
      input: {
        adjustimer: join(__dirname, 'src/background/adjustimer.html'),
      },
      output: {
        chunkFileNames: 'assets/chunk-[hash].js',
      },
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')  // @をsrcフォルダに解決
    }
  },
  plugins: [
    react(),
    crx({ manifest }),
    tailwindcss(),
  ],
  legacy: {
    skipWebSocketTokenCheck: true,
  },
})
