import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tailwindcss from '@tailwindcss/vite';
import vtzac from 'vtzac';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vtzac({
      glob: ['src/backend/**/*.controller.ts'],
    }),
    react(),
    tailwindcss(),
  ],
});
