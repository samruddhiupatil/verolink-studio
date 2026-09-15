/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  // Served from https://<user>.github.io/verolink-studio/ in production, so
  // asset URLs need the repo name as a base path — but keep dev server at "/".
  base: command === 'build' ? '/verolink-studio/' : '/',
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
}))
