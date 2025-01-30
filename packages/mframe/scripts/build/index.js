import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'
import { execSync } from 'child_process'
import fs from 'fs-extra'

import { rollup } from 'rollup'
import { getBabelOutputPlugin } from '@rollup/plugin-babel'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const cwd = resolve(__dirname, '../../')

const genEs5 = async () => {
  const bundle = await rollup({
    input: 'dist/index.js',
    plugins: [getBabelOutputPlugin({ presets: ['@babel/preset-env'] })],
  })
  await bundle.write({
    file: 'dist/es5.js', // 输出文件路径
    format: 'es', // 输出格式 (IIFE 可直接在浏览器中运行)
    name: 'mframe', // 全局变量名称
  })
}

const main = async () => {
  execSync('npx vite build', { cwd, stdio: 'inherit' })
  await genEs5()
}

main()
