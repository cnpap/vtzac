import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tailwindcss from '@tailwindcss/vite';
import vtzac from 'vtzac';
import Inspect from 'vite-plugin-inspect';

// https://vite.dev/config/
export default defineConfig({
  plugins: [vtzac(), Inspect(), react(), tailwindcss()],
});
