import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    // 🌟 SỬ DỤNG ĐƯỜNG DẪN TƯƠNG ĐỐI ĐỂ KHÔNG BỊ PHÂN BIỆT CHỮ HOA / CHỮ THƯỜNG TRÊN LINK REPO
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
          // 🌟 GIẢI PHÁP ĐẶC TRỊ LỖI MIME: CHUYỂN ĐUÔI SANG .MJS ĐỂ ÉP GITHUB PAGES ĐỌC ĐÚNG THUỘC TÍNH SCRIPT CHUẨN
          entryFileNames: 'assets/[name].mjs',
          chunkFileNames: 'assets/[name].mjs',
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
