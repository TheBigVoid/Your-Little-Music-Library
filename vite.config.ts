import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // Relative asset paths so the build also works when loaded from disk by Electron.
  base: './',
  plugins: [react()],
})
