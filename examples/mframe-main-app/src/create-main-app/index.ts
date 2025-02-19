import { h, render } from 'vue'
import { createMainApp as createDasMainApp, bus } from '@dimple-smile/mframe'

import type { Router } from 'vue-router'

import Nav from './components/nav.vue'
import Menu from './components/menu.vue'
import Tab from './components/tab.vue'

const containerBus = bus('container')

const createMainApp = (opt: { router: Router }) => {
  const { router } = opt || {}

  const { mountDom, navDom, menuDom, tabDom } = createDasMainApp({
    router: { mode: 'hash' },
    microApps: [
      {
        name: 'app1',
        origin: 'http://localhost:5174',
        activeRule: '/micro-app-1/*',
      },
      {
        name: 'app2',
        origin: 'http://localhost:5175',
        activeRule: '/micro-app-2/*',
        router: { mode: 'hash' },
      },
    ],
  })

  render(h(Nav), navDom!)
  render(h(Menu), menuDom!)
  render(h(Tab), tabDom!)

  containerBus.event.on('menuItemClick', (e) => {
    router.push(e.path)
  })
  return { mountDom }
}

export { createMainApp }
