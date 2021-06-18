import { EggAppConfig, PowerPartial } from 'egg'

export default () => {
  const config: PowerPartial<EggAppConfig> = {}
  // mongoose配置
  config.mongoose = {
    client: {
      url: 'mongodb+srv://dimple-smile-dev:xhJvtgR4ROjOxfMx@cluster0.cxjdn.mongodb.net/dimple-smile?retryWrites=true&w=majority',
      options: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      },
    },
  }

  return config
}
