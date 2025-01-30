import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), dts({ rollupTypes: true, tsconfigPath: './tsconfig.app.json' })],
  build: {
    lib: {
      entry: 'packages/index.ts',
      name: `@dimple-smile/mframe`,
      fileName: 'index',
      formats: ['es'],
    },
    minify: 'esbuild',
  },
  esbuild: {
    drop: ['console', 'debugger'],
  },
})
