import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        frames_display: 'frames_display/index.html'
      }
    }
  },
  define: {
    global: {}
  },
  optimizeDeps: {
  }
});
