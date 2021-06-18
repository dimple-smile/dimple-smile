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
  // sequelize: {
  //   enable: true,
  //   package: 'egg-sequelize',
  // },
  mongoose: {
    enable: true,
    package: 'egg-mongoose',
  },
}

export default plugin
