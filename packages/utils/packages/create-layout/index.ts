import { createElement } from '../create-element'

type LayoutType = 'header' | 'left-aside' | 'main' | 'right-aside' | 'footer'
type CreateElementResult = ReturnType<typeof createElement>

const loopCreate = (resultMap: Map<string, any>, layoutItem: any) => {
  if (!layoutItem) return
  const { type, rows = [], cols = [] } = layoutItem
  const style = { ...(layoutItem.style || {}) }
  const attribute = layoutItem.attribute || {}

  if (rows.length || cols.length) style.display = 'flex'
  let childs = cols
  if (rows.length > 0) {
    style.flexDirection = 'column'
    childs = rows
  }
  const element = createElement(layoutItem.tag || 'div', { style, attribute })
  if (type) resultMap.set(type, element)
  childs.map((item: any) => element.target.appendChild(loopCreate(resultMap, item)!.target))
  return element
}

type Config = {
  root: HTMLElement
  sizes: {
    header?: { height: number }
    'left-aside'?: { width: number }
    'right-aside'?: { width: number }
    footer?: { height: number }
  }
}
const createLayout = async (config: Config) => {
  const { root, sizes = {} } = config
  root.style.display = 'flex'
  root.style.flexDirection = 'column'
  const layoutElementMap = new Map<LayoutType, CreateElementResult>()

  const createLayoutItem = (type: keyof Config['sizes']) => {
    const size = sizes[type] as any
    const style: Partial<CSSStyleDeclaration> = {}
    if (size?.width) style.width = size?.width + 'px'
    if (size?.height) style.height = size?.height + 'px'
    const element = createElement('div', { style })
    layoutElementMap.set(type, element)
    return element
  }

  if (sizes.header) createLayoutItem('header').insertTo(root)
  const content = createElement('div', { style: { flex: '1', display: 'flex', minHeight: '0', overflow: 'hidden' } })
  if (sizes['left-aside']) createLayoutItem('left-aside').insertTo(content.target)
  const main = createElement('div', { style: { height: '100%', flex: '1' } })
  layoutElementMap.set('main', main)
  main.insertTo(content.target)
  if (sizes['right-aside']) createLayoutItem('right-aside').insertTo(content.target)
  content.insertTo(root)
  if (sizes.footer) createLayoutItem('footer').insertTo(root)

  await Promise.all([...layoutElementMap].map((item) => item[1].checkMounted()))

  return {
    getElement: (type: LayoutType) => layoutElementMap.get(type),
    getElements: (types: LayoutType[]) => {
      if(!types) types = [...layoutElementMap.keys()]
      return [...layoutElementMap].filter((item) => types.includes(item[0])).map((item) => item[1])
    },
    getElementsTarget: (types?: LayoutType[]) => {
      if(!types) types = [...layoutElementMap.keys()]
      return [...layoutElementMap].filter((item) => types.includes(item[0])).map((item) => item[1].target)
    },
    getRects: (keys?: LayoutType[]) => {
      if (!keys) keys = [...layoutElementMap.keys()]
      let result: any = {}
      keys.map((item) => {
        const { x, y, width, height } = layoutElementMap.get(item)?.target.getBoundingClientRect() || {}
        if (width === 0 || height === 0) return
        result[item] = { x, y, width, height }
      })
      return result
    },
    setSize: (data: Config['sizes']) => {
      Object.entries(data).map(([type, value]) => {
        const size = value as any
        const style: Partial<CSSStyleDeclaration> = {}
        if (size?.width) style.width = size?.width + 'px'
        if (size?.height) style.height = size?.height + 'px'
        layoutElementMap.get(type as LayoutType)?.setStyle(style)
      })
    },
  }
}

export { createLayout }
