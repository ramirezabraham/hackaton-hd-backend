import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from "@svgr/rollup";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), svgr()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
      allowedHeaders: "*",
    },
    origin: '*'
  },
});
