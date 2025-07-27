import { createApp } from 'vue'
import { router } from './router'
import App from './App.vue'
import { createMicroApp } from '@dimple-smile/micro-iframe'

import elementPlus from 'element-plus'
import 'element-plus/dist/index.css'

const app = createApp(App)
app.use(router)
app.use(elementPlus)

createMicroApp().then((e) => app.mount(e.mountDom))
