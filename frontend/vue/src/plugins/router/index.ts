import { createRouter, createWebHashHistory } from 'vue-router'

import type { Plugin } from 'vue'
import type { RouteRecordRaw } from 'vue-router'

// 路由中心
export default {
  install: (app, options) => {
    let routes: RouteRecordRaw[] = []

    // 读取框架内路由
    const routeModulesFiles = import.meta.globEager('../../views/**/router.ts')
    Object.values(routeModulesFiles).map(({ default: route }) => routes.push(...route.filter((item: any) => item.path.indexOf('/') === 0)))
    
    // 实例化router，挂在vue实例
    const router = createRouter({ history: createWebHashHistory(), routes })
    app.use(router)
  },
} as Plugin
