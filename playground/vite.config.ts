import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tailwindcss from '@tailwindcss/vite';
import vtzac from 'vtzac';
import Inspect from 'vite-plugin-inspect';
import vtjump from 'vtjump';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vtjump({
      protocols: ['trae'],
      assets: 'src/assets/vtjump.js?t=' + Date.now(),
    }),
    vtzac(),
    Inspect(),
    react(),
    tailwindcss(),
  ],
});
