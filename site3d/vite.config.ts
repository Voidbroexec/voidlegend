import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html')
      }
    },
    // Don't try to optimize dependencies for this setup
    emptyOutDir: true,
    // Output directory
    outDir: 'dist'
  },
  // Disable dependency optimization since you're not importing modules
  optimizeDeps: {
    disabled: true
  }
})
