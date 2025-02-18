import { ref } from 'vue'
import { createContainer, bus, router, useIframeManager } from '@dimple-smile/mframe'
import { useRouterEventListener, useRouter } from '../router'

import type { MainAppContainerInitOptions } from '../bus/container/type'

const { addRouterEventListener } = useRouterEventListener()
const { replaceState } = useRouter()

const createMainApp = (opt?: MainAppContainerInitOptions) => {
  if (!opt) opt = {}
  const { microApps = [] } = opt
  const containerRes = createContainer({ type: 'mainApp', ...opt })
  const containerBus = bus('container')
  const mainAppBus = bus('mainApp')
  const microAppsData = ref(microApps)
  containerBus.data.watch((newData) => (microAppsData.value = newData.microApps), ['microApps'])
  containerBus.data.set({ microApps })
  const { register, load, hide, event, checkStatus } = useIframeManager()
  event.on('mounted', (e) => mainAppBus.expose.connectMicroApp(e))

  microApps
    .filter((item: any) => item.activeRule)
    .map((item: any) => {
      router.on(item.activeRule, () => {})
      register(item.name, item)
    })

  mainAppBus.cors.on('reportRouter', (e: any) => {
    mainAppBus.event.emit('reportRouter', e)
    const { data } = e || {}
    if (!data.appInfo) return
    const microAppItem = containerBus.data.get().microApps.find((item) => item.name === data.appInfo.name)
    if (!microAppItem) return
    if (!microAppItem.status?.activated) return
    const { pathname, hash, search } = new URL(window.location.href)
    let currentPath = pathname + search
    if (containerBus.data.get().initOptions.router?.mode === 'hash') currentPath = hash.replace('#', '')
    if (currentPath === data.path) return
    console.log(microAppItem.name)
    replaceState(data.path)
  })

  const syncRouterToMicroApp = (matchMicroAppItem: any, parentRouter: any) => {
    const { path } = parentRouter
    let replacePath = path
    if (matchMicroAppItem.router?.mode === 'hash') replacePath = `/#${path}`
    mainAppBus.cors.send(matchMicroAppItem.name, 'syncRouter', {
      appInfo: matchMicroAppItem,
      route: router.getCurrentLocation(),
      parentRouter: parentRouter,
      replacePath,
    })
  }

  const handleReplaceState = async () => {
    await new Promise((res) => setTimeout(res, 0))
    const mainAppRouterMode = containerBus.data.get().initOptions.router?.mode || 'history'
    const { pathname, hash, search } = new URL(window.location.href)
    let path = pathname + search
    if (mainAppRouterMode === 'hash') path = hash.replace('#', '')

    const routeMatch = router.match(path)
    const matchMicroAppItem = microAppsData.value.find((item) => {
      if (!routeMatch) return false
      return `/${routeMatch[0].route.name}` === item.activeRule
    })
    let replacePath = path
    if (matchMicroAppItem?.router?.mode === 'hash') replacePath = `/#${path}`

    if (!matchMicroAppItem) {
      containerBus.data.set({ activeMicroAppName: '' })
      hide()
      return
    }

    containerBus.data.set({ activeMicroAppName: matchMicroAppItem.name })
    const parentRouter = { href: window.location.href, mode: mainAppRouterMode, path }

    if (checkStatus(matchMicroAppItem.name, 'deactivated')) {
      await load(matchMicroAppItem.name)
      syncRouterToMicroApp(matchMicroAppItem, parentRouter)
    }

    if (checkStatus(matchMicroAppItem.name, 'mounted') || checkStatus(matchMicroAppItem.name, 'activated')) {
      syncRouterToMicroApp(matchMicroAppItem, parentRouter)
    }

    if (checkStatus(matchMicroAppItem.name, 'registered')) {
      await load(matchMicroAppItem.name, { path: replacePath })
    }
  }

  addRouterEventListener(['replaceState'], handleReplaceState)

  return { ...containerRes }
}

export { createMainApp }
