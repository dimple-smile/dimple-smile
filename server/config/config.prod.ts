import { EggAppConfig, PowerPartial } from 'egg'

export default () => {
  const config: PowerPartial<EggAppConfig> = {}
  config.env = 'prod'
  config.rundir = '/temp'
  config.logger = { dir: '/tmp' }

  config.mongoose = {
    client: {
      url: 'mongodb+srv://dimple-smile:pxh5201798@cluster0.7reoj.mongodb.net/blog?retryWrites=true&w=majority',
      options: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      },
    },
  }
  return config
}
