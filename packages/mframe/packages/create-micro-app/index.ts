import { ref } from 'vue'
import { createContainer, bus } from '@dimple-smile/mframe'
import { useRouter, useRouterEventListener } from '../router'

import type { MicroAppContainerInitOptions, MicroAppContainerResult } from '../bus/container/type'

const { replaceState } = useRouter()
const { addRouterEventListener } = useRouterEventListener()

const autoSyncRouter = () => {
  const microAppBus = bus('microApp')

  const syncRouterLoading = ref(false)
  microAppBus.cors.on('syncRouter', (e: any) => {
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

    const appInfo = microAppBus.data.get().appInfo
    const autoSyncRouter = appInfo.router?.sync ?? true
    if (!autoSyncRouter) return
    replaceState(data.replacePath)
  })

  addRouterEventListener(['replaceState'], async (e) => {
    if (syncRouterLoading.value) return
    const appInfo = microAppBus.data.get().appInfo
    if (!appInfo) return
    await new Promise((res) => setTimeout(res, 0))
    const autoSyncRouter = appInfo.router?.sync ?? true
    if (!autoSyncRouter) return
    microAppBus.cors.send('reportRouter', {
      href: window.location.href,
      appInfo,
      historyEvent: { type: e.type, state: history.state },
    })
  })
}

const createMicroApp = async (opt?: MicroAppContainerInitOptions): Promise<MicroAppContainerResult> => {
  if (!opt) opt = {}
  const containerRes = await createContainer({ type: 'microApp', ...opt })
  autoSyncRouter()
  return containerRes
}

export { createMicroApp }
