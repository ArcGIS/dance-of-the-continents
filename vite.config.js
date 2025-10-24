/*

Copyright 2025 Esri

Licensed under the Apache License Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License. 

*/


// vite.config.js
import { defineConfig } from 'vite';

// Set base dynamically: GitHub Pages (actions) vs IIS vs local dev
export default defineConfig(() => {
  const isGitHubActions = process.env.GITHUB_ACTIONS === 'true';
  const isIISBuild = process.env.IIS_BUILD === 'true';
  
  // Use appropriate base path for each deployment target
  const base = isGitHubActions ? '/dance-of-the-continents/' : 
               isIISBuild ? '/stories/dance-of-the-continents/' : 
               '/';

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
