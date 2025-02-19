import { ref, watch } from 'vue'
import mitt from 'mitt'
import { bus } from '@dimple-smile/mframe'
import type { MicroAppContainerInitOptions } from '../bus/container/type'

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
type LifeCycleKeyType = keyof typeof LifeCycleKey

const LifeCycle: { [key in LifeCycleKeyType]: any } = {
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

const useIframeManager = () => {
  const containerBus = bus('container')

  const iframes = new Map()
  const event = mitt<{
    /** 容器组件onMounted生命周期 */
    [key in LifeCycleKeyType]: any
  }>()
  const hideIframe = (iframeId?: string) => {
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

  const loadIframe = async (id: string, opt?: any) => {
    if (!mountDom.value) await new Promise((res) => watch(() => mountDom.value, res))
    const iframeInfo = iframes.get(id)
    if (!iframeInfo) return
    if (iframeInfo.status === LifeCycle.loading) return
    Array.from(iframes)
      .map((item) => item[1])
      .filter((item) => item.id !== id)
      .map((item) => hideIframe(item.id))
    if (iframeInfo.element && getComputedStyle(iframeInfo.element).display !== 'block') {
      iframeInfo.element.style.display = 'block'
      iframeInfo.status = LifeCycle.activated
      event.emit(LifeCycle.activated, iframeInfo)
      await new Promise((res) => setTimeout(res, 0))
      return
    }

    iframeInfo.status = LifeCycle.loading
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
      iframeInfo.status = LifeCycle.error
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
    setIframeMountDom: (ele: Element | null) => {
      mountDom.value = ele
    },
    registerIframe: (id: string, config: MicroAppContainerInitOptions) => {
      const iframeInfo = {
        id,
        config,
        status: LifeCycle.registered,
        element: null,
      }
      iframes.set(id, iframeInfo)
    },
    getIframeInfo: (id: string) => iframes.get(id),
    checkIframeStatus: (id: string, status: LifeCycleKeyType | LifeCycleKeyType[]) => {
      if (Array.isArray(status)) return status.includes(iframes.get(id).status)
      return iframes.get(id).status === status
    },
    iframeEvent: event,
    loadIframe,
    hideIframe,
    destroyIframe: (id: string) => {
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
