import { EggAppConfig, PowerPartial } from 'egg'

export default () => {
  const config: PowerPartial<EggAppConfig> = {}
  config.env = 'prod'
  config.rundir = '/temp'
  config.logger = { dir: '/tmp' }
  return config
}
