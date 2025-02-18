import { ref, watch } from 'vue'
import mitt from 'mitt'
import { bus } from '@dimple-smile/mframe'

type IframeConfig = {
  /** 子应用来源（协议、主机、端口） */
  origin: string

  /** 子应用路由激活的规则，唯一规则（注意不要和其他应用存在包含关系）。支持如 /app1/* 这种glob语法 */
  activeRule: string

  /** 作为子应用时，是否自动清除html、body、挂载点的背景颜色。默认清除，防止子应用的背景颜色覆盖主应用，但是会自动继到可用的布局容器中 */
  autoClearBackground?: Boolean

  tiemout?: number
}

enum LifeCycleKey {
  'registered',
  'loading',
  'mounted',
  'unmounted',
  'activated',
  'deactivated',
  'destroy',
  'error',
}

const LifeCycle: { [key in keyof typeof LifeCycleKey]: any } = {
  registered: 'registered',
  loading: 'loading',
  mounted: 'mounted',
  unmounted: 'unmounted',
  activated: 'activated',
  deactivated: 'deactivated',
  destroy: 'destroy',
  error: 'error',
}
let mountDom = ref<Element | null>(null)

const useIframeManager = (opt?: any) => {
  const containerBus = bus('container')

  const iframes = new Map()
  const event = mitt<{
    /** 容器组件onMounted生命周期 */
    [key in keyof typeof LifeCycleKey]: any
  }>()
  const hide = (iframeId?: string) => {
    const iframeItem = Array.from(iframes).find(([id, item]) => {
      if (iframeId) return iframeId === id
      if (!item.element) return
      return getComputedStyle(item.element).display === 'block'
    })
    if (!iframeItem) return
    const [id, iframeInfo] = iframeItem
    if (!iframeInfo.element) return
    iframeInfo.element.style.display = 'none'
    iframeInfo.status = LifeCycle.deactivated
    event.emit(LifeCycle.deactivated, iframeInfo)
  }

  const load = async (id: string, opt?: any) => {
    if (!mountDom.value) await new Promise((res) => watch(() => mountDom.value, res))
    const iframeInfo = iframes.get(id)
    if (!iframeInfo) return
    if (iframeInfo.status === LifeCycle.loading) return
    Array.from(iframes)
      .map((item) => item[1])
      .filter((item) => item.id !== id)
      .map((item) => hide(item.id))
    if (iframeInfo.status === LifeCycle.mounted && getComputedStyle(iframeInfo.element).display === 'block') {
      iframeInfo.status = LifeCycle.loading
      iframeInfo.element.style.display = 'block'
      iframeInfo.status = LifeCycle.activated
      event.emit(LifeCycle.activated, iframeInfo)
      await new Promise((res) => setTimeout(res, 300))
      return
    }

    iframeInfo.status = 'loading'
    event.emit(LifeCycle.activated, iframeInfo)
    const iframe = document.createElement('iframe')
    let src = iframeInfo.config.origin
    if (opt?.path) src = src + opt?.path
    iframe.src = src
    iframe.setAttribute('id', id)
    iframe.setAttribute('frameBorder', '0')
    iframe.style.width = '100%'
    iframe.style.height = '100%'
    iframe.style.display = 'block'
    iframe.name = JSON.stringify({
      appInfo: iframeInfo.config,
      parentData: {
        layoutData: containerBus.data.get(containerBus.expose.getLayoutDataKeys()),
        origin: window.origin,
      },
    })

    mountDom.value!.appendChild(iframe)
    const [error, e]: any[] = await new Promise((resolve) => {
      iframe.onload = (e) => resolve([null, e])
      iframe.onerror = () => resolve([new Error(`${id} IFrame load failed`), null])
    })
    if (error) {
      iframeInfo.status = 'error'
      event.emit(LifeCycle.error, iframeInfo)
      return
    }
    iframeInfo.element = iframe
    iframeInfo.status = LifeCycle.mounted
    event.emit(LifeCycle.mounted, {
      ...iframeInfo.config,
      contentWindow: e.target.contentWindow,
    })
  }

  return {
    setMountDom: (ele: Element | null) => {
      mountDom.value = ele
    },
    register: (id: string, config: IframeConfig) => {
      const iframeInfo = {
        id,
        config,
        status: LifeCycle.registered,
        element: null,
      }
      iframes.set(id, iframeInfo)
    },
    get: (id: string) => iframes.get(id),
    checkStatus: (id: string, status: keyof typeof LifeCycleKey) => iframes.get(id).status === status,
    event,
    load,
    hide,
    destroy: (id: string) => {
      const iframeInfo = iframes.get(id)
      if (!iframeInfo) return
      iframeInfo.element.remove()
      iframeInfo.status = LifeCycle.destroy
      event.emit(LifeCycle.destroy, iframeInfo)
      iframes.delete(id)
    },
  }
}

export { useIframeManager }
