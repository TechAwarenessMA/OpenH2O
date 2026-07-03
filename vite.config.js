import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The application source lives in ./project (Claude Design handoff bundle).
// The root index.html loads project/main.jsx as the entry module.
export default defineConfig({
  plugins: [react()],
});
