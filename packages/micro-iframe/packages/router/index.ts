import { initHistoryEvent } from './history'
type RouterEventListenerTypes = 'replaceState' | 'pushState' | 'popstate'

/** micro-iframe的路由工具，通过增强原生的window.history，支持主动设置路由和监听路由变化 */
const useRouter = () => {
  /** 主动更改history的state */
  const replaceState = (path: string) => {
    window.history.replaceState(history.state, '', path)
    const vueRouterStateKeys = ['back', 'current', 'forward', 'position', 'replaced', 'scroll']
    const isVueRouter = vueRouterStateKeys.every((key) => Object.keys(history.state || {}).includes(key))
    if (isVueRouter) {
      const popStateEvent = new PopStateEvent('popstate', { state: history.state })
      window.dispatchEvent(popStateEvent)
    }
  }

  /** 路由监听回调列表 */
  const listeners: { [key: string]: any[] } = {}

  /** 监听路由事件 */
  const addEventListener = (type: RouterEventListenerTypes | RouterEventListenerTypes[], cb: (e: any) => any) => {
    initHistoryEvent()

    let typeList = [type] as RouterEventListenerTypes[]
    if (Array.isArray(type)) typeList = type
    for (const typeItem of typeList) {
      window.addEventListener(typeItem, cb)
      if (!listeners[typeItem]) listeners[typeItem] = []
      listeners[typeItem].push(cb)
    }
  }

  /** 移除监听路由事件 */
  const removeEventListener = (type?: RouterEventListenerTypes | RouterEventListenerTypes[]) => {
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

  return {
    /** 主动更改history的state */
    replaceState,
    /** 监听路由事件 */
    addEventListener,
    /** 移除监听路由事件 */
    removeEventListener,
  }
}

export { useRouter }
