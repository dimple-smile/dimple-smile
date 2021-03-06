import { EggAppConfig, EggAppInfo, PowerPartial } from 'egg'

export default (appInfo: EggAppInfo) => {
  const config = {} as PowerPartial<EggAppConfig>
  // override config from framework / plugin
  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1619627005782_7864'

  // add your egg config in here
  config.middleware = []

  // 跨域配置
  config.cors = {
    origin: '*', // 表示允许的源
    allowMethods: 'GET,HEAD,PUT,POST,DELETE,PATCH', // 表示允许的http请求方式
  }
  // 安全配置
  config.security = {
    csrf: {
      // headerName: 'x-csrf-token' // 跨域时没有这个
      enable: false,
    },
    domainWhiteList: [], // 白名单
  }

  // add your special config in here
  const bizConfig = {}

  // the return config will combines to EggAppConfig
  return {
    ...(config as {}),
    ...bizConfig,
  }
}
