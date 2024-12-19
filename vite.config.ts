import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import cesium from 'vite-plugin-cesium';


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    cesium (),
  ],
  resolve: {
    alias: {
      '@': '/src', // 确保这个路径是正确的，有时可能是 './src' 或其他变体
    }
  }
})
