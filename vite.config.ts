import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    // 🌟 ĐẶC TRỊ LỖI 404 & MIME TYPE: ĐỔI SANG ĐƯỜNG DẪN TƯƠNG ĐỐI TỰ ĐỘNG KHÔNG LO LỆCH KÝ TỰ REPO
    base: './',
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      cssCodeSplit: false,
      chunkSizeWarningLimit: 3000,
      minify: 'esbuild',
      assetsInlineLimit: 4096,
      rollupOptions: {
        output: {
          // Ép xuất file tên cố định để GitHub Pages không bị kẹt cache CDN
          entryFileNames: 'assets/main.js',
          chunkFileNames: 'assets/[name].js',
          assetFileNames: 'assets/[name].[ext]'
        }
      }
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
