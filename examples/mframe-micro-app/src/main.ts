import { createApp } from 'vue'
import { router } from './router'
import App from './App.vue'
import { createMicroApp } from './create-micro-app'

import elementPlus from 'element-plus'
import 'element-plus/dist/index.css'

const app = createApp(App)
app.use(router)
app.use(elementPlus)

const { mountDom } = createMicroApp({ router })
app.mount(mountDom!)
