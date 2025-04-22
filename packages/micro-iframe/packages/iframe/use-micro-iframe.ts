import { createDeferPromise } from '@dimple-smile/utils'
import { createGlobMatcher } from '@dimple-smile/utils'
import { createEvent } from '@dimple-smile/utils'
import { createMicroIframe } from './create-micro-iframe'
import { iframeConfig } from './config'

import type { MicroAppInfo, RegisterOptions } from './type'

type GetIframeTypeMap = {
  /** 子应用的path */
  path: string

  /** 子应用的id */
  id: string

  /** 子应用的status */
  status: ReturnType<typeof createMicroIframe>['status']['value']
}

/** 子应用数据 */
const iframes: {
  /** SPA应用挂载点 */
  rootTarget: HTMLElement

  /** 主内容区挂载点。 */
  mainTarget: HTMLElement

  /** 子应用信息 */
  info: MicroAppInfo

  /** 子应用能力核心 */
  core: ReturnType<typeof createMicroIframe>

  /** 子应用的activeRule规则匹配器 */
  pathMatcher: (url: string) => boolean
}[] = []

/** 当前鼠标位置 */
const mousePoint = { x: 0, y: 0 }

/** iframe整体的生命周期。注意这里并不是指某一个子应用的生命周期 */
const iframeEvent = createEvent<{
  /** iframe加载时触发 */
  loading: (e: MicroAppInfo) => any
  /** iframe加载完成时触发。仅会在iframe挂载时触发一次 */
  loaded: (e: MicroAppInfo) => any
  /** iframe激活时触发 */
  activated: (e: MicroAppInfo) => any
  /** iframe停用时触发 */
  deactivated: (e: MicroAppInfo) => any
  /** iframe加载错误时触发 */
  error: (e: MicroAppInfo) => any
  /** iframe全部销毁时触发 */
  destroy: (e: MicroAppInfo) => any
  /** iframe的loading状态被打断时触发 */
  cancel: (e: MicroAppInfo) => any
}>()

let messageListeners: { key: string; callback: (data: any) => any }[] = []

/** 使用子应用的能力 */
const useMicroIframe = () => {
  const { promise, resolve } = createDeferPromise()
  let messageChannelPort: MessagePort | null = null
  let iframeInfo: any

  const register = (options: RegisterOptions) => {
    const { rootTarget, mainTarget, microApps } = options
    rootTarget!.style.position = 'relative'
    iframes.push(
      ...microApps.map((item) => {
        return {
          info: item,
          rootTarget,
          mainTarget,
          core: createMicroIframe({ rootTarget, mainTarget, info: item }),
          pathMatcher: (url: string) => {
            if (!item.activeRule) return false
            const test = createGlobMatcher(item.activeRule)
            return test(url)
          },
        }
      }),
    )

    /** 记录主应用鼠标位置 */
    window.addEventListener('mouseenter', (e) => {
      mousePoint.x = e.x
      mousePoint.y = e.y
    })

    /** 记录主应用鼠标位置 */
    window.addEventListener('mousemove', (e) => {
      mousePoint.x = e.x
      mousePoint.y = e.y
    })
  }

  /** 根据path/id/status三种类型其一来获取子应用 */
  const getIframe = <T extends keyof GetIframeTypeMap>(type: T, value: GetIframeTypeMap[T]) => {
    return iframes.find((item) => {
      if (type === 'id') return item.info.id === value
      if (type === 'path') return item.pathMatcher(value)
      if (type === 'status') return item.core.status.is(value as GetIframeTypeMap['status'])
      return false
    })
  }

  /** 设置子应用的path，path满足子应用的activeRule时，子应用将会被激活，不满足时会被隐藏 */
  const setIframePath = async (path: string) => {
    const matchIframe = getIframe('path', path)
    return loadIframe(matchIframe, path)
  }

  const loadIframe = async (matchIframe: ReturnType<typeof getIframe>, path?: string) => {
    const loadingIframe = getIframe('status', 'loading')
    const activatedIframe = getIframe('status', 'activated')
    if (!matchIframe) {
      activatedIframe?.core.hide()
      loadingIframe?.core.destroy()
      if (activatedIframe) iframeEvent.emit('deactivated', activatedIframe.info)
      if (loadingIframe) iframeEvent.emit('cancel', loadingIframe.info)
      return
    }
    const isFirstLoad = matchIframe.core.status.is('registered')
    if (isFirstLoad) iframeEvent.emit('loading', matchIframe.info)
    if (loadingIframe && matchIframe.info.id !== loadingIframe.info.id) loadingIframe.core.destroy()
    if (activatedIframe && matchIframe.info.id !== activatedIframe.info.id) activatedIframe.core.hide()
    const loadResult = await matchIframe.core.load(path)
    if (loadResult instanceof Error) return iframeEvent.emit('error', matchIframe.info)
    if (isFirstLoad) iframeEvent.emit('loaded', matchIframe.info)
    if (!isFirstLoad) iframeEvent.emit('activated', matchIframe.info)
    const mainTargetRect = matchIframe.mainTarget.getBoundingClientRect()
    const mouseInIframe =
      mousePoint.x >= mainTargetRect.x &&
      mousePoint.y >= mainTargetRect.y &&
      mousePoint.x <= mainTargetRect.x + mainTargetRect.width &&
      mousePoint.y <= mainTargetRect.y + mainTargetRect.height
    matchIframe.core.setPointerEvents(mouseInIframe)
  }

  const destroyIframe = (id?: string) => {
    let matchIframe: ReturnType<typeof getIframe>
    if (id) matchIframe = getIframe('id', id)
    if (!id) matchIframe = getIframe('status', 'activated')
    if (!matchIframe) return
    matchIframe.core.destroy()
    iframeEvent.emit('destroy', matchIframe.info)
  }

  return {
    /** 在主应用中注册子应用（仅在主应用中可用） */
    register,

    /** 根据path/id/status三种类型其一来获取子应用（仅在主应用中可用） */
    getIframe,

    /** 设置子应用的path，path满足子应用的activeRule时，子应用将会被激活，不满足时会被隐藏（仅在主应用中可用） */
    setIframePath,

    /** 手动加载iframe。默认情况下会根据history变化自动激化符合activeRule的iframe，如果没有设置activeRule，需要手动激活 */
    loadIframe: (id: string) => {
      const matchIframe = getIframe('id', id)
      if (!matchIframe) return
      loadIframe(matchIframe)
    },

    /** 销毁iframe。如果不传入具体的应用id，将销毁当前使用iframe */
    destroyIframe,

    /** iframe事件管理器。注意这里并不代表某个iframe，是整个可管理子应用列表的状态变化 */
    iframeEvent,

    /** 和主应用建立连接 */
    connect: async () => {
      window.addEventListener('message', (e) => {
        if (!e.ports.length) return
        const { key, data } = e.data
        if (key !== iframeConfig.connectKey) return
        messageChannelPort = e.ports[0]
        messageChannelPort.start()
        iframeInfo = data
        messageChannelPort.addEventListener('message', (e) => {
          const { key, data } = e.data
          messageListeners.map((item) => {
            if (item.key === key) item.callback(data)
          })
        })
        messageChannelPort.postMessage({ key: 'load' })
        resolve()
      })
      await promise
      return iframeInfo
    },

    /** 获取子应用信息 */
    getIframeInfo: async (): Promise<MicroAppInfo> => {
      await promise
      return iframeInfo
    },

    /** 监听来自主应用的message */
    onMessage: (key: string, callback: (data: any) => any) => {
      messageListeners.push({ key, callback })
      return () => (messageListeners = messageListeners.filter((item) => item.callback !== callback))
    },

    /** 发送message到主应用 */
    postMessage: async (key: string, data: any) => {
      await promise
      messageChannelPort?.postMessage({ key, data })
    },
  }
}

export { useMicroIframe }
