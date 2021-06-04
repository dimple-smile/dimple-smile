import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'
const modules = import.meta.globEager('../views/*/router.ts')
import NotFountPage from '../views/not-found/App.vue'

// 根路由
const rootRouters: RouteRecordRaw[] = [{ path: '/', redirect: '/home' }]

// 模块路由
let moduleRouters: RouteRecordRaw[] = []
for (const key in modules) {
  if (Object.prototype.hasOwnProperty.call(modules, key)) {
    const module = modules[key]
    const routers = module.default
    for (const router of routers) {
      moduleRouters.push(router)
    }
  }
}

// 404路由
const notFoundRouters: RouteRecordRaw[] = [
  { path: '/:pathMatch(.*)*', redirect: '/not-found' },
  { path: '/not-found', component: NotFountPage },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes: [...rootRouters, ...moduleRouters, ...notFoundRouters],
})

export default router
