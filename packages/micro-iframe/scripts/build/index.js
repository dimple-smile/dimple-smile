import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'
import { execSync } from 'child_process'
import { rollup } from 'rollup'
import { getBabelOutputPlugin } from '@rollup/plugin-babel'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const cwd = resolve(__dirname, '../../')

const buildForEs5 = async () => {
  const bundle = await rollup({
    input: 'dist/index.js',
    plugins: [getBabelOutputPlugin({ presets: ['@babel/preset-env'] })],
  })
  await bundle.write({
    file: 'dist/es5.js',
    format: 'es',
    name: 'micro-iframe',
  })
}

const main = async () => {
  execSync('npx vite build', { cwd, stdio: 'inherit' })
  await buildForEs5()
}

main()
