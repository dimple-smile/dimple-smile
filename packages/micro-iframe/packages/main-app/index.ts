import { useRouter, useLoading, useMicroIframe } from '@dimple-smile/micro-iframe'
import { getElementAsync } from '@dimple-smile/utils'
import { getRelativePosition } from '@dimple-smile/utils'

import type { CreateMainAppOptions } from './type'

/** 创建主应用 */
const createMainApp = async (options: CreateMainAppOptions) => {
  const { root, main, microApps, routerConfig } = options || {}
  const loading = useLoading()
  const router = useRouter()
  loading.set('init', true)

  /** 获取根节点和主内容区节点 */
  const [rootTarget, mainTarget] = await Promise.all([
    getElementAsync(root || '#app'),
    getElementAsync(main || '#main'),
  ])
  if (!rootTarget || !mainTarget) {
    throw new Error('MicroIframe createMainApp Error: root & main muse be a useful target!')
  }

  /** 注册iframe子应用 */
  const { register, getIframe, setIframePath, iframeEvent } = useMicroIframe()
  register({ rootTarget, mainTarget, microApps })
  loading.set('init', false)

  /** 鼠标进入子应用时，使子应用可以进行交互 */
  mainTarget.addEventListener('mouseenter', () => {
    getIframe('status', 'activated')?.core.setPointerEvents(true)
  })

  /** 每个iframe加载完成后，同步path信息 */
  iframeEvent.on('loaded', (info) => {
    const iframe = getIframe('id', info.id)
    if (!iframe) return
    iframe.core.onMessage('syncPath', (path) => {
      const { pathname, search, hash } = new URL(window.location.href)
      let currentPath = pathname + search
      if (routerConfig?.mode === 'hash') currentPath = hash.replace('#', '')
      if (currentPath === path) return
      loading.set('syncPath', true)
      if (routerConfig?.mode === 'hash') path = `/#${path}`
      router.replaceState(path)
      setTimeout(() => {
        loading.set('syncPath', false)
      }, 50)
    })
  })

  /** 路由变化时，设置子应用的path，path满足子应用的activeRule时，子应用将会被激活 */
  const handleReplaceState = async () => {
    if (loading.get('syncPath').value) return
    await new Promise((res) => setTimeout(res, 0))
    const { pathname, hash, search } = new URL(window.location.href)
    let routePath = pathname + search
    if (routerConfig?.mode === 'hash') routePath = hash.replace('#', '')
    setIframePath(routePath)
  }
  router.addEventListener(['replaceState', 'popstate'], handleReplaceState)

  /** 主应用iframe内容区size变化时，同步给激活的子应用 */
  const resizeObserver = new ResizeObserver(() => {
    const activatedIframe = getIframe('status', 'activated')
    activatedIframe?.core.postMessage('syncPosition', getRelativePosition(rootTarget!, mainTarget!))
  })

  resizeObserver.observe(mainTarget!)
  resizeObserver.observe(rootTarget!)
}

export { createMainApp }
