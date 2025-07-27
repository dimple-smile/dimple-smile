import { createElement } from '@dimple-smile/utils'
import { createEvent } from '@dimple-smile/utils'
import { getRelativePosition } from '@dimple-smile/utils'
import { iframeConfig } from './config'

import type { CreateMicroIframeOptions, IframeLifeCycleKey } from './type'

/** 创建子应用 */
const createMicroIframe = (options: CreateMicroIframeOptions) => {
  const { rootTarget, mainTarget, info } = options || {}
  const { id, origin } = info || {}

  // State management
  let element: ReturnType<typeof createElement> | null = null
  let messageChannel: MessageChannel | null = null
  let loadingPath: string | undefined = ''
  
  const event = createEvent<{ [key in IframeLifeCycleKey]: any }>()
  const messageListeners = new Map<string, Set<(data: any) => any>>()
  const currentOrigin = new URL(origin, window.location.origin).origin
  
  const status = {
    value: 'registered' as IframeLifeCycleKey,
    set: (newValue: IframeLifeCycleKey) => {
      const oldValue = status.value
      status.value = newValue
      event.emit(newValue, { newValue, oldValue })
      element?.setAttribute({ 'data-mi-status': newValue })
    },
    is: (value: IframeLifeCycleKey | IframeLifeCycleKey[]) => 
      Array.isArray(value) ? value.includes(status.value) : status.value === value,
  }

  // Helper functions
  const getIframePath = (path?: string) => 
    info.routerConfig?.mode === 'hash' ? `/#${path}` : path

  const syncIframe = (path?: string) => {
    const position = getRelativePosition(rootTarget, mainTarget)
    element?.setAttribute({ 'data-mi-path': path })
    postMessage('syncPosition', position)
    postMessage('syncPath', path)
  }

  const cleanup = () => {
    element?.target && rootTarget!.removeChild(element.target)
    messageChannel = null
    messageListeners.clear()
  }

  const createIframeElement = (path?: string) => {
    const src = currentOrigin + (path || '')
    
    return createElement('iframe', {
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
        willChange: 'visibility',
      },
    })
  }

  const setupMessageChannel = (iframeTarget: HTMLIFrameElement) => {
    messageChannel = new MessageChannel()

    iframeTarget.contentWindow?.postMessage(
      { key: iframeConfig.connectKey, data: info }, 
      currentOrigin, 
      [messageChannel.port2]
    )

    messageChannel.port1.start()
    messageChannel.port2.start()

    messageChannel.port1.addEventListener('message', (e) => {
      const { key, data } = e.data
      if (!status.is('activated')) return
      messageListeners.get(key)?.forEach(callback => callback(data))
    })
  }

  const waitForIframeReady = () => 
    new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(
        () => reject(new Error(`${id} IFrame load timeout`)),
        info.timeout ?? iframeConfig.iframeLoadTimeout,
      )

      messageChannel?.port1.addEventListener('message', (e) => {
        if (e.data.key === 'load') {
          clearTimeout(timeout)
          resolve()
        }
      })
    })

  const handleError = (error: Error) => {
    status.set('error')
    cleanup()
    throw error
  }

  const load = async (path?: string): Promise<void> => {
    path = getIframePath(path)

    if (status.is('loading')) {
      loadingPath = path
      return
    }

    if (status.is('error')) return

    if (status.is(['activated', 'deactivated'])) {
      status.set('activated')
      element?.setVisible(true)
      syncIframe(path)
      return
    }

    try {
      status.set('loading')
      
      element = createIframeElement(path)
      element.insertTo(rootTarget)
      
      const iframeTarget = await new Promise<HTMLIFrameElement>((resolve, reject) => {
        element!.target!.onload = (e) => resolve(e.target as HTMLIFrameElement)
        element!.target!.onerror = () => reject(new Error(`${id} IFrame load failed`))
      })

      setupMessageChannel(iframeTarget)
      await waitForIframeReady()

      status.set('activated')
      element.setVisible(true)
      syncIframe(loadingPath || path)
      
      onMessage('asyncPointerEvents', setPointerEvents)
      onMessage('syncRootClick', ({ x, y }) => {
        const elements = document.elementsFromPoint(x, y)
        const targetElement = elements[0] === iframeTarget ? elements[1] : elements[0]
        ;(targetElement as HTMLElement)?.click?.()
      })
    } catch (error) {
      handleError(error as Error)
    }
  }

  const hide = () => {
    if (!element || status.is('destroy')) return
    status.set('deactivated')
    element.setPointerEvents(false)
    element.setVisible(false)
  }

  const destroy = () => {
    if (status.is('destroy')) return
    element?.setVisible(false)
    element?.setPointerEvents(false)
    cleanup()
    status.set('destroy')
  }

  const postMessage = (key: string, data: any) => {
    if (!status.is('activated') || !messageChannel) return
    messageChannel.port1.postMessage({ key, data })
  }

  const onMessage = (key: string, callback: (data: any) => any) => {
    if (!messageListeners.has(key)) messageListeners.set(key, new Set())
    messageListeners.get(key)!.add(callback)
    return () => messageListeners.get(key)?.delete(callback)
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
