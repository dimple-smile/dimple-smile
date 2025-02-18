import { ref } from 'vue'
import { createContainer, bus } from '@dimple-smile/mframe'
import { useRouter, useRouterEventListener } from '../router'

import type { MicroAppContainerInitOptions } from '../bus/container/type'

const { replaceState } = useRouter()
const { addRouterEventListener } = useRouterEventListener()

const autoSyncRouter = (opt?: any) => {
  const containerBus = bus('container')
  const microAppBus = bus('microApp')

  const syncRouterLoading = ref(false)
  microAppBus.cors.on('syncRouter', (e: any) => {
    if (containerBus.data.get().initOptions.router?.sync === false) return
    if (syncRouterLoading.value) return
    syncRouterLoading.value = true
    setTimeout(() => (syncRouterLoading.value = false), 300)
    const { data } = e
    const microAppInfo = data.appInfo
    if (!microAppInfo) return
    const { pathname, hash, search } = new URL(window.location.href)
    let currentPath = pathname + search
    if (microAppInfo.router?.mode === 'hash') currentPath = hash.replace('#', '')
    if (currentPath === data.path) return
    replaceState(data.replacePath)
  })

  addRouterEventListener(['replaceState'], async (e) => {
    if (syncRouterLoading.value) return
    await new Promise((res) => setTimeout(res, 0))
    const { pathname, hash, search } = new URL(window.location.href)
    let path = pathname + search
    if (containerBus.data.get().initOptions.router?.mode === 'hash') path = hash.replace('#', '')
    microAppBus.cors.send('reportRouter', {
      herf: window.location.href,
      path,
      appInfo: microAppBus.data.get().appInfo,
      historyEvent: { type: e.type, state: history.state },
    })
  })
}

const createMicroApp = (opt?: MicroAppContainerInitOptions) => {
  if (!opt) opt = {}

  const containerRes = createContainer({ type: 'microApp', ...opt })
  const needAutoSyncRouter = opt.router?.sync ?? true
  if (needAutoSyncRouter) autoSyncRouter(opt)
  return { ...containerRes }
}

export { createMicroApp }
