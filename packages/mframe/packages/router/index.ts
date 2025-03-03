import { bus } from '@dimple-smile/mframe'
import picomatch from 'picomatch'

import { initHistoryCustomEvent } from './history'

const syncRouter = (cb: (params: { appInfo: any; parentRouter: any; replacePath: string }) => any) => {
  const microAppBus = bus('microApp')
  microAppBus.cors.on('syncRouter', (e: any) => cb(e.data))
}

const reportRouter = async (data?: any) => {
  const microAppBus = bus('microApp')
  const appInfo = microAppBus.data.get().appInfo
  if (!appInfo) return
  microAppBus.cors.send('reportRouter', { data, href: location.href, appInfo })
}

const routerRules = new Map()
const useRouter = () => {
  const replaceState = (path: string) => {
    window.history.replaceState(history.state, '', path)
    const vueRouterStateKeys = ['back', 'current', 'forward', 'position', 'replaced', 'scroll']
    const isVueRouter = vueRouterStateKeys.every((key) => Object.keys(history.state || {}).includes(key))
    if (isVueRouter) {
      const popStateEvent = new PopStateEvent('popstate', { state: history.state })
      window.dispatchEvent(popStateEvent)
    }
  }

  return {
    replaceState,
    addRule: (key: string, globString: string) => {
      routerRules.set(key, picomatch(globString))
    },
    match: (path: string) => {
      const matchItem = [...routerRules].find(([_, rule]) => rule(path))
      if (!matchItem) return false
      return matchItem[0]
    },
  }
}

type RouterEventListenerTypes = 'replaceState' | 'pushState'
const useRouterEventListener = () => {
  initHistoryCustomEvent()

  const listeners: { [key: string]: any[] } = {}

  const addRouterEventListener = (type: RouterEventListenerTypes | RouterEventListenerTypes[], cb: (e: any) => any) => {
    let typeList = [type] as RouterEventListenerTypes[]
    if (Array.isArray(type)) typeList = type
    for (const typeItem of typeList) {
      window.addEventListener(typeItem, cb)
      if (!listeners[typeItem]) listeners[typeItem] = []
      listeners[typeItem].push(cb)
    }
  }

  const removeRouterEventListener = (type?: RouterEventListenerTypes | RouterEventListenerTypes[]) => {
    let typeList = [] as RouterEventListenerTypes[]
    if (typeof type === 'string') typeList.push(type)
    if (Array.isArray(type)) typeList = type
    if (typeList.length === 0 && !type) typeList = Object.keys(listeners) as RouterEventListenerTypes[]
    for (const typeItem of typeList) {
      if (listeners[typeItem]) {
        listeners[typeItem].map((cb) => {
          window.removeEventListener(typeItem, cb)
        })
      }
    }
  }
  return { addRouterEventListener, removeRouterEventListener }
}

export { syncRouter, reportRouter, useRouter, useRouterEventListener }
