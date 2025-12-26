import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

export default defineConfig({
  // Use relative base path for deployment to any subdirectory
  base: './',
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    outDir: 'dist-demo',
    emptyOutDir: true,
    // Demo build settings
    target: 'esnext',
    assetsDir: 'assets',
    // Generate manifest for better asset tracking (optional but good)
    manifest: true,
    rollupOptions: {
      output: {
        // Ensure manual chunks for vendor splitting if needed
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('vue')) {
              return 'vue';
            }
            return 'vendor';
          }
        },
      },
    },
  },
});
