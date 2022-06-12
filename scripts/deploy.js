const fs = require('fs')
const path = require('path')

const { exec, execSync } = require('child_process')

const cpath = (src) => path.resolve(__dirname, src)

execSync(`pnpm i`, { stdio: 'inherit' })

execSync(`pnpm run build`, { stdio: 'inherit', cwd: cpath('../') })

const frontendDir = cpath('../frontend')
fs.readdirSync(frontendDir).map((fileName) => {
  const frontendProjectPath = path.join(frontendDir, fileName)
  if (fs.statSync(frontendProjectPath).isFile()) return
  execSync(`pnpm i`, { stdio: 'inherit', cwd: frontendProjectPath })
  execSync(`pnpm run build`, { stdio: 'inherit', cwd: frontendProjectPath })
})
