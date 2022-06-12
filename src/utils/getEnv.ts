import { existsSync } from 'fs-extra'
import { join } from 'path'
import type { ENV } from '../types/env'
const envLocalPath = join(__dirname, '../env.local')
const importEnv = async (src: string) => {
  const envImport = () => import(src)
  const envModule = await envImport()
  return envModule?.default?.() || {}
}

const getEnv = (): Promise<ENV> => {
  return new Promise(async (resolve) => {
    const env = await importEnv('../env')
    let envLocal = {}
    if (existsSync(envLocalPath)) envLocal = await importEnv('../env.local')
    resolve({ ...env, ...envLocal })
  })
}

export { getEnv }
