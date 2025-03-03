import { ref } from 'vue'
import { bus, createContainer, useIframeManager, useRouterEventListener, useRouter } from '@dimple-smile/mframe'

import type { MainAppContainerInitOptions, ContainerResult } from '../bus/container/type'

const createMainApp = async (opt?: MainAppContainerInitOptions): Promise<ContainerResult> => {
  if (!opt) opt = {}
  const { microApps = [] } = opt
  const containerRes = await createContainer({ type: 'mainApp', ...opt })
  const containerBus = bus('container')
  const mainAppBus = bus('mainApp')
  const { addRouterEventListener } = useRouterEventListener()
  const router = useRouter()

  const microAppsData = ref(microApps)
  containerBus.data.watch((newData) => (microAppsData.value = newData.microApps), ['microApps'])
  containerBus.data.set({ microApps })
  const { registerIframe, loadIframe, hideIframe, iframeEvent, checkIframeStatus } = useIframeManager()
  iframeEvent.on('mounted', (e) => mainAppBus.expose.connectMicroApp(e))

  microApps
    .filter((item: any) => item.activeRule)
    .map((item: any) => {
      router.addRule(item.name, item.activeRule)
      registerIframe(item.name, item)
    })

  const onReportRouterLoaidng = ref(false)
  mainAppBus.cors.on('reportRouter', (e: any) => {
    const { data } = e || {}
    if (!data.appInfo) return
    const microAppItem = containerBus.data.get().microApps.find((item) => item.name === data.appInfo.name)
    if (!microAppItem) return
    const autoSyncRouter = microAppItem.router?.sync ?? true
    if (!autoSyncRouter) return

    if (!checkIframeStatus(microAppItem.name, ['mounted', 'activated'])) return

    const { pathname, hash, search } = new URL(window.location.href)
    let currentPath = pathname + search

    const { pathname: childPathname, hash: childHash, search: childSearch } = new URL(data.href)
    let replacePath = childPathname + childSearch
    if (microAppItem.router?.mode === 'hash') replacePath = childHash.replace('#', '')

    if (containerBus.data.get().initOptions.router?.mode === 'hash') {
      currentPath = `/${hash}`
      replacePath = `/#${replacePath}`
    }
    if (currentPath === replacePath) return
    onReportRouterLoaidng.value = true
    setTimeout(() => {
      onReportRouterLoaidng.value = false
    }, 300)

    router.replaceState(replacePath)
  })

  const syncRouterToMicroApp = (matchMicroAppItem: any, parentRouter: any) => {
    const { path } = parentRouter
    let replacePath = path
    if (matchMicroAppItem.router?.mode === 'hash') replacePath = `/#${path}`
    mainAppBus.cors.send(matchMicroAppItem.name, 'syncRouter', {
      appInfo: matchMicroAppItem,
      parentRouter: parentRouter,
      replacePath,
    })
  }

  const handleReplaceState = async () => {
    if (onReportRouterLoaidng.value) return
    await new Promise((res) => setTimeout(res, 0))
    const mainAppRouterMode = containerBus.data.get().initOptions.router?.mode || 'history'
    const { pathname, hash, search } = new URL(window.location.href)
    let path = pathname + search
    if (mainAppRouterMode === 'hash') path = hash.replace('#', '')

    const routeMatch = router.match(path)
    const matchMicroAppItem = microAppsData.value.find((item) => {
      if (!routeMatch) return false
      return routeMatch === item.name
    })
    let replacePath = path
    if (matchMicroAppItem?.router?.mode === 'hash') replacePath = `/#${path}`

    if (!matchMicroAppItem) {
      containerBus.data.set({ activeMicroAppName: '' })
      hideIframe()
      return
    }

    containerBus.data.set({ activeMicroAppName: matchMicroAppItem.name })
    const parentRouter = { href: window.location.href, mode: mainAppRouterMode, path }

    if (checkIframeStatus(matchMicroAppItem.name, 'deactivated')) {
      await loadIframe(matchMicroAppItem.name)
      syncRouterToMicroApp(matchMicroAppItem, parentRouter)
    }

    if (checkIframeStatus(matchMicroAppItem.name, ['mounted', 'activated'])) {
      syncRouterToMicroApp(matchMicroAppItem, parentRouter)
    }

    if (checkIframeStatus(matchMicroAppItem.name, 'registered')) {
      await loadIframe(matchMicroAppItem.name, { path: replacePath })
    }
  }

  addRouterEventListener(['replaceState'], handleReplaceState)

  return containerRes
}

export { createMainApp }
