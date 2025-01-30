import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'
import { execSync } from 'child_process'
import fs from 'fs-extra'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const cwd = resolve(__dirname, '../../dist')

const main = async () => {
  await fs.copy(resolve(__dirname, './package.publish.json'), resolve(__dirname, '../../dist/package.json'))
  await fs.copy(resolve(__dirname, '../../README.md'), resolve(__dirname, '../../dist/README.md'))
  execSync('npm publish', { cwd, stdio: 'inherit' })
}

main()
