import { EggPlugin } from 'egg'

const plugin: EggPlugin = {
  // static: true,
  // nunjucks: {
  //   enable: true,
  //   package: 'egg-view-nunjucks',
  // },
  cors: {
    enable: true,
    package: 'egg-cors',
  },
  websocket: {
    enable: true,
    package: 'egg-websocket-plugin',
  },
}

export default plugin
