import { createApp } from 'vue'
import { router } from './router'
import { createMainApp, useMicroIframe } from '@dimple-smile/micro-iframe'

import App from './App.vue'

import elementPlus from 'element-plus'
import { ElLoading } from 'element-plus'
import 'element-plus/dist/index.css'

const app = createApp(App)

app.use(router)
app.use(elementPlus)

app.mount('#app')

createMainApp({
  root: '#app',
  main: '#main',
  routerConfig: { mode: 'hash' },
  microApps: [
    {
      id: 'app1',
      origin: 'http://localhost:5174',
      activeRule: '/micro-app-1/*',
    },
    {
      id: 'app2',
      origin: 'http://localhost:5175',
      activeRule: '/micro-app-2/*',
      routerConfig: { mode: 'hash' },
    },
  ],
})
