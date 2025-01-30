import { createContainer } from '@dimple-smile/mframe'
import { bus, router } from '@dimple-smile/mframe'

type MicroAppItem = {
  name: string
  origin: string
  activeRule: string
}

const createMainApp = (opt?: {
  /** 子应用列表 */
  microApps?: MicroAppItem[]

  onMicroAppRouterChange?: (data: {
    /** 路由模式。默认history */
    type?: 'history'
    /** 路由地址 */
    path: string
    /** 子应用当前路由的完整路径 */
    href: string

    /** 子应用的信息 */
    appInfo: string
  }) => any
}) => {
  if (!opt) opt = {}
  const { microApps = [], onMicroAppRouterChange = () => {} } = opt

  const containerRes = createContainer({ type: 'mainApp', ...opt })
  const containerBus = bus('container')
  const mainAppBus = bus('mainApp')
  containerBus.data.set({ microApps: microApps })

  microApps
    .filter((item: any) => item.activeRule)
    .map((item: any) => {
      router.on({
        [item.activeRule]: {
          as: item.name,
          uses: (match: any) => {
            setTimeout(() => {
              containerBus.data.set({ activeMicroAppName: item.name })
              mainAppBus.cors.send(item.name, 'syncRouter', {
                appInfo: item,
                route: router.getCurrentLocation(),
              })
            }, 0)
          },
        },
      })

      setTimeout(() => {
        router.resolve(location.href)
      }, 0)
    })

  mainAppBus.cors.on('reportRouter', (e) => {
    const { data } = e || {}
    const { appInfo } = data || {}
    if (appInfo?.name !== containerBus.data.get(['activeMicroAppName'])?.activeMicroAppName) return
    // onMicroAppRouterChange?.(e.data)
    mainAppBus.event.emit('reportRouter', e.data)
  })

  return { ...containerRes }
}

export { createMainApp }
