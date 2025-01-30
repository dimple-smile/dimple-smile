import { createApp } from 'vue'
import { router } from './router'
import { createMainApp } from './create-main-app'

import App from './App.vue'

import elementPlus from 'element-plus'
import 'element-plus/dist/index.css'

const app = createApp(App)

app.use(router)
app.use(elementPlus)

const { mountDom } = createMainApp({ router })
app.mount(mountDom!)
