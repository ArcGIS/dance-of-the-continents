// vite.config.js
import { defineConfig } from 'vite';

// Set base dynamically: GitHub Pages (actions) vs everything else
export default defineConfig(() => {
  const isGitHubActions = process.env.GITHUB_ACTIONS === 'true';
  // ⬇️ replace <repo> with your exact repo name
  const base = isGitHubActions ? '/dance-of-the-continents/' : '/';

  return {
    base,
    build: {
      rollupOptions: {
        input: {
          main: 'index.html',
          frames_display: 'frames_display/index.html',
        },
      },
    },
    define: { global: {} },
    optimizeDeps: {},
  };
});
