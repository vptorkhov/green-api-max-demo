import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';

// Документация: https://vite.dev/config/
export default defineConfig({
  // Базовый путь: на GitHub Pages сайт живёт в /green-api-max-demo/ — его задаёт workflow
  // деплоя (.github/workflows/deploy.yml). Локально — корень
  base: process.env.BASE_PATH ?? '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
});
