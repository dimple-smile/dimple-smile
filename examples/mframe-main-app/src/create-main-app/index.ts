import { h, render, watch } from 'vue'
import { createMainApp as createDasMainApp, bus, router as mframeRouter } from '@dimple-smile/mframe'

import type { Router } from 'vue-router'

import Nav from './components/nav.vue'
import Menu from './components/menu.vue'
import Tab from './components/tab.vue'

const containerBus = bus('container')
const mainAppBus = bus('mainApp')

const createMainApp = (opt: { router: Router }) => {
  const { router } = opt || {}

  const { mountDom, navDom, menuDom, tabDom } = createDasMainApp({
    microApps: [
      {
        name: 'app1',
        origin: 'http://localhost:5174',
        activeRule: '/micro-app-1/*',
      },
    ],
  })

  render(h(Nav), navDom!)
  render(h(Menu), menuDom!)
  render(h(Tab), tabDom!)

  containerBus.event.on('menuItemClick', (e) => {
    router.push(e.path)
  })

  mainAppBus.event.on('reportRouter', (data) => {
    if(location.href === data.href) return
    const { path } = data
    router.push(path)
  })

  watch(
    () => router.currentRoute.value,
    (route) => {
      mframeRouter.resolve(route.fullPath)
    },
  )

  return { mountDom }
}

export { createMainApp }
