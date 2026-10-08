import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    base: '/Test/',
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    // 🌟 PHƯƠNG PHÁP ĐẶC TRỊ MIỄN DỊCH VỚI LỖI MIME TYPE TRÊN GITHUB PAGES
    build: {
      cssCodeSplit: false,
      chunkSizeWarningLimit: 3000,
      rollupOptions: {
        output: {
          // ĐỔI ĐUÔI CHUẨN SANG .MJS ĐỂ ÉP TRÌNH DUYỆT ĐỌC ĐÚNG THUỘC TÍNH MODULE SCRIPT, TRIỆT TIÊU 100% LỖI ĐEN MÀN HÌNH
          entryFileNames: 'assets/[name].mjs',
          chunkFileNames: 'assets/[name].mjs',
          assetFileNames: 'assets/[name].[ext]'
        }
      }
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});

