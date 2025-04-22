import { createElement } from '@dimple-smile/utils'
import { createEvent } from '@dimple-smile/utils'
import { getRelativePosition } from '@dimple-smile/utils'
import { iframeConfig } from './config'

import type { CreateMicroIframeOptions, IframeLifeCycleKey } from './type'

/** 创建子应用 */
const createMicroIframe = (options: CreateMicroIframeOptions) => {
  const { rootTarget, mainTarget, info } = options || {}
  const { id, origin } = info || {}

  let element: ReturnType<typeof createElement> | null = null
  const event = createEvent<{
    [key in IframeLifeCycleKey]: any
  }>()
  let messageChannel: MessageChannel | null = null
  let messageListeners: { key: string; callback: (data: any) => any }[] = []

  const status: {
    value: IframeLifeCycleKey
    set: (payload: IframeLifeCycleKey) => void
    is: (payload: IframeLifeCycleKey | IframeLifeCycleKey[]) => boolean
  } = {
    value: 'registered',
    set: (value) => {
      event.emit(value, { newValue: value, oldValue: status.value })
      status.value = value
      element?.setAttribute({ 'data-mi-status': value })
    },
    is: (value) => {
      if (Array.isArray(value)) return value.includes(status.value as IframeLifeCycleKey)
      return status.value === value
    },
  }

  /** 加载过程中如果改变path并且还在当前iframe的activeRule内，加载完成后需要同步最近一次的path */
  let loadingPath: string | undefined = ''

  const load = async (path?: string): Promise<Error | undefined> => {
    if (info.routerConfig?.mode === 'hash') path = `/#${path}`

    if (status.is('loading')) {
      loadingPath = path
      return
    }

    if (status.is('error')) return

    if (status.is(['activated', 'deactivated'])) {
      status.set('activated')
      element?.setVisible(true)
      element?.setAttribute({ 'data-mi-path': path })
      postMessage('syncPosition', getRelativePosition(rootTarget, mainTarget))
      postMessage('syncPath', path)
      return
    }

    status.set('loading')

    const currentOrigin = new URL(origin, window.location.origin).origin
    const src = currentOrigin + path || ''

    element = createElement('iframe', {
      attribute: {
        src,
        id,
        frameBorder: '0',
        'data-mi-path': path,
        name: JSON.stringify({ microAppInfo: info, position: getRelativePosition(rootTarget, mainTarget) }),
      },
      style: {
        position: 'absolute',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        visibility: 'hidden',
        opacity: '0',
        willChange: 'visibility' /* 启用 GPU 加速 */,
        // contain: 'strict' /* 限制渲染影响范围 */,
      },
    })

    element.insertTo(rootTarget)
    const [loadError, loadEvent] = await new Promise<[null | Error, null | Event]>((resolve) => {
      element!.target!.onload = (e) => resolve([null, e])
      element!.target!.onerror = () => resolve([new Error(`${id} IFrame load failed`), null])
    })
    if (loadError) {
      status.set('error')
      rootTarget!.removeChild(element.target)
      return loadError
    }

    const iframeTarget = loadEvent?.target as HTMLIFrameElement | null

    messageChannel = new MessageChannel()

    iframeTarget?.contentWindow?.postMessage?.({ key: iframeConfig.connectKey, data: info }, currentOrigin, [
      messageChannel.port2,
    ])

    messageChannel.port1.start()
    messageChannel.port2.start()

    messageChannel.port1.addEventListener('message', (e) => {
      const { key, data } = e.data
      if (!status.is('activated')) return
      messageListeners.map((item) => {
        if (item.key === key) item.callback(data)
      })
    })

    const contentLoadError = await new Promise<null | Error>((resolve) => {
      const sto = setTimeout(
        () => resolve(new Error(`${id} IFrame load timeout`)),
        info.timeout ?? iframeConfig.iframeLoadTimeout,
      )

      messageChannel?.port1.addEventListener('message', (e) => {
        const { key } = e.data
        if (key === 'load') {
          resolve(null)
          clearTimeout(sto)
        }
      })
    })

    if (contentLoadError) {
      status.set('error')
      rootTarget!.removeChild(element.target)
      return contentLoadError
    }

    status.set('activated')
    element.setVisible(true)
    element?.setAttribute({ 'data-mi-path': path })
    if (loadingPath) {
      postMessage('syncPath', loadingPath)
      element?.setAttribute({ 'data-mi-path': loadingPath })
    }
    postMessage('syncPosition', getRelativePosition(rootTarget, mainTarget))
    onMessage('asyncPointerEvents', setPointerEvents)
    onMessage('syncRootClick', (e) => {
      const { x, y } = e
      const elements = document.elementsFromPoint(x, y)
      let targetElement = elements[0] as HTMLElement
      if (targetElement === iframeTarget) targetElement = elements[1] as HTMLElement
      targetElement?.click?.()
    })
  }

  const hide = () => {
    status.set('deactivated')
    element!.setPointerEvents(false)
    element!.setVisible(false)
  }

  const destroy = () => {
    if (status.is('destroy')) return
    element?.setVisible(false)
    element?.setPointerEvents(false)
    rootTarget!.removeChild(element?.target!)
    messageChannel = null
    messageListeners = []
    status.set('destroy')
  }

  const postMessage = (key: string, data: any) => {
    if (!status.is('activated')) return
    messageChannel?.port1.postMessage({ key, data })
  }

  const onMessage = (key: string, callback: (data: any) => any) => {
    messageListeners.push({ key, callback })
    return () => (messageListeners = messageListeners.filter((item) => item.callback !== callback))
  }

  const setPointerEvents = (value: boolean) => element?.setPointerEvents(value)

  return {
    /** iframe的element对象 */
    element,
    /** iframe的状态管理器 */
    status,
    /** 加载iframe */
    load,
    /** 隐藏iframe */
    hide,
    /** 销毁iframe */
    destroy,
    /** 向iframe发送message */
    postMessage,
    /** 监听来自iframe的message */
    onMessage,
    /** iframe事件监听器。主要包括status变化 */
    event,
    /** 设置iframe的事件响应状态。true代表iframe内容可以交互，false表示iframe内容不可交互 */
    setPointerEvents,
  }
}

export { createMicroIframe }
