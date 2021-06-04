import { App } from 'vue'
import { ElButton, ElIcon } from 'element-plus'
// import 'element-plus/packages/theme-chalk/src/base.scss'

export default (app: App) => {
  app.component(ElButton.name, ElButton)
  app.component(ElIcon.name, ElIcon)
}
