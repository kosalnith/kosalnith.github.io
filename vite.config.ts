import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // This allows the app to use process.env.API_KEY in the code
    'process.env.API_KEY': JSON.stringify(process.env.VITE_GEMINI_API_KEY)
  },
  // If you deploy to kosalnith.github.io/repo-name/, 
  // Vite will handle the paths correctly.
  base: process.env.NODE_ENV === 'production' ? './' : '/',
});