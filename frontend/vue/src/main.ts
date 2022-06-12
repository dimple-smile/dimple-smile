import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

const app = createApp(App)

// 提前加载pinia
app.use(createPinia())

// 自动加载插件
Object.values(import.meta.globEager('./plugins/*/index.ts')).map(({ default: plugin }) => app.use(plugin))

app.mount('#app')
