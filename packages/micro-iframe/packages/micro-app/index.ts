import { getElementAsync } from '@dimple-smile/utils'
import { extractBackground } from '@dimple-smile/utils'
import { elementFromRect } from '@dimple-smile/utils'
import { createLayout } from '@dimple-smile/utils'
import { useMicroIframe, useLoading } from '@dimple-smile/micro-iframe'

import { useRouter } from '../router'

const genLayoutSize = (rootTarget: HTMLElement, iframePosition: any) => {
  const rootRect = rootTarget.getBoundingClientRect()
  const headerHeight = iframePosition.top - rootRect.top
  const leftAsideWidth = iframePosition.left - rootRect.left
  return {
    header: { height: headerHeight },
    'left-aside': { width: leftAsideWidth },
    'right-aside': { width: rootRect.width - iframePosition.width - leftAsideWidth },
    footer: { height: rootRect.height - iframePosition.height - headerHeight },
  }
}

const createMicroApp = async (options?: {
  /** 应用挂载点。支持 #id，或者传入dom，默认值为#app。支持document.body或者其他dom */
  root?: string | HTMLElement | Element

  /** 是否抽取html、body、root节点的背景样式到内容区。默认抽取，防止子应用的背景颜色等样式覆盖主应用 */
  extractBackgroundToMount?: Boolean
}) => {
  if (!options) options = {}
  const { root = '#app', extractBackgroundToMount = true } = options
  const rootTarget = await getElementAsync(root)
  if (!rootTarget) {
    throw new Error('MicroIframe createMicroApp Error: root muse be a useful target!')
  }
  const iframeData: any = JSON.parse(window.name || '{}')
  const { microAppInfo, position } = iframeData || {}
  if (!microAppInfo) return { mountDom: root }

  rootTarget.style.position = 'relative'
  const layout = await createLayout({ root: rootTarget, sizes: genLayoutSize(rootTarget, position) })
  const mainContainer = layout.getElement('main')!

  if (extractBackgroundToMount) {
    const extractBackgroundStyle = extractBackground([document.documentElement, document.body, rootTarget])
    mainContainer.setStyle(extractBackgroundStyle)
  }

  const { connect, onMessage, postMessage, getIframeInfo } = useMicroIframe()
  await connect()
  const router = useRouter()

  rootTarget.addEventListener('click', (e) => {
    const target = e.target as HTMLDivElement
    if (!layout.getElementsTarget(['header', 'footer', 'left-aside', 'right-aside']).includes(target)) return
    postMessage('syncRootClick', { x: e.x, y: e.y })
  })

  onMessage('syncPosition', (data) => {
    layout.setSize(genLayoutSize(rootTarget, data))
  })

  const loading = useLoading()
  onMessage('syncPath', async (path) => {
    loading.set('syncPath', true)
    const { pathname, search, hash } = new URL(window.location.href)
    const info = await getIframeInfo()
    let currentPath = pathname + search
    if (info.routerConfig?.mode === 'hash') currentPath = hash.replace('#', '')
    if (currentPath === path) return
    router.replaceState(path)
    setTimeout(() => {
      loading.set('syncPath', false)
    }, 0)
  })
  const handleReplaceState = async () => {
    if (loading.get('syncPath').value) return
    await new Promise((res) => setTimeout(res, 0))
    const { pathname, hash, search } = new URL(window.location.href)
    let routePath = pathname + search
    if (microAppInfo.routerConfig?.mode === 'hash') routePath = hash.replace('#', '')
    postMessage('syncPath', routePath)
  }

  router.addEventListener(['replaceState', 'popstate'], handleReplaceState)

  const createCoverChecker = () => {
    const elements = new Set<HTMLElement>()
    const io = new IntersectionObserver(
      (entries) => {
        entries.map((item) => {
          const target = item.target as HTMLElement
          if (item.intersectionRatio === 0) {
            io.unobserve(target)
            elements.delete(target)
          }
          scan()
          if (elements.size === 0) {
            io.disconnect()
            postMessage('asyncPointerEvents', false)
          }
        })
      },
      { threshold: [0] },
    )
    const scan = () => {
      const rects = layout.getRects(['header', 'left-aside', 'right-aside', 'footer'])
      let res: any[] = []
      Object.entries(rects).map(([key, value]) => {
        res.push(
          ...elementFromRect(value as any, {
            excludeElements: layout.getElementsTarget(),
          }),
        )
      })
      res
        .filter((item) => !elements.has(item))
        .map((item) => {
          elements.add(item)
          io.observe(item)
          return item
        })
      return res
    }

    scan()
    return { elements }
  }

  mainContainer.addEventListener('mouseleave', (e: any) => {
    const iframeRect = mainContainer.target.getBoundingClientRect()
    const mouseInIframe =
      e.x >= iframeRect.x &&
      e.x <= iframeRect.x + iframeRect.width &&
      e.y >= iframeRect.y &&
      e.y <= iframeRect.y + iframeRect.height
    if (mouseInIframe) return
    const { elements } = createCoverChecker()
    if (elements.size > 0) return
    postMessage('asyncPointerEvents', false)
    return
  })

  return { mountDom: mainContainer?.target }
}

export { createMicroApp }
