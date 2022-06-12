import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'

import * as path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/spa/vue/',
  plugins: [
    vue(),
    createSvgIconsPlugin({
      iconDirs: [path.resolve(process.cwd(), 'src/components/svg-icon/icons')],
      symbolId: 'icon-[dir]-[name]', // 指定symbolId格式
    }),
  ],
  resolve: {
    alias: {
      '@': path.join(__dirname, 'src'),
    },
  },
})
