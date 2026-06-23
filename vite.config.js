import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';
import { defineConfig } from 'vite';

function pagesBase() {
  if (process.env.GITHUB_PAGES_BASE) return process.env.GITHUB_PAGES_BASE;
  if (process.env.VITE_BASE_PATH) return process.env.VITE_BASE_PATH;
  return '/videohost/';
}

export default defineConfig(({ command }) => ({
  base: command === 'serve' ? '/' : pagesBase(),
  css: {
    postcss: {
      plugins: [tailwindcss, autoprefixer],
    },
  },
  server: {
    port: 5181,
    strictPort: true,
    open: '/',
  },
}));
