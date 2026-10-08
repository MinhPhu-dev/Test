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
    // 🌟 PHƯƠNG PHÁP ĐẶC TRỊ KHÓA LỖI MIME TYPE: ĐÓNG GÓI ĐỊNH DẠNG TÊN FILE TĨNH TIÊU CHUẨN
    build: {
      cssCodeSplit: false,
      chunkSizeWarningLimit: 3000,
      minify: 'esbuild',
      assetsInlineLimit: 4096, // Các file nhỏ tự động gộp thẳng vào code để tránh lỗi fetch asset
      rollupOptions: {
        output: {
          // Ép xuất file đuôi .js truyền thống nhưng loại bỏ các ký tự băm [hash] kẹt cache CDN
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
