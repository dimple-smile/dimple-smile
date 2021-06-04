import { createApp } from 'vue'
import './assets/style/index.css'
import App from './App.vue'
import router from './router'

const app = createApp(App)

// 加载第三方库
const libs = import.meta.globEager('./libs/*.ts')
for (const key in libs) {
  const lib = libs[key]
  lib.default && lib.default(app)
}

// 加载全局组件
const components = import.meta.globEager('./components/*.vue')
for (const key in components) {
  const component = components[key]
  app.component(component.default.name || key.replace('./components/', '').replace('.vue', ''), component.default)
}

app.use(router)
app.mount('#app')
