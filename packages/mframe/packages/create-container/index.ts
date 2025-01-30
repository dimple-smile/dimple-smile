import { h, render } from 'vue'

import Container from './components/container.vue'

const prefix = `dimple-smile-mframe-container-`
function clearBackground(element: HTMLElement) {
  // 获取计算后的样式
  const removedStyleKeys = [
    'background',
    'background-color',
    'background-image',
    'background-size',
    'background-position',
    'background-repeat',
    'background-attachment',
    'opacity',
    'box-shadow',
    'filter',
  ]

  const computedStyle = getComputedStyle(element)
  const removedStyles = {}
  removedStyleKeys.map((key) => {
    removedStyles[key] = computedStyle[key]
  })
  removedStyleKeys.map((key) => {
    element.style[key] = 'none'
  })
  return removedStyles
}

const createContainer = (opt?: {
  /** 支持 #id，或者传入dom，默认值为#app。支持document.body或者其他dom */
  appendTo?: String | HTMLElement

  /** 容器类型。默认为microApp */
  type?: 'mainApp' | 'microApp'

  /** 作为子应用时，是否自动清除html、body、挂载点的背景颜色。默认清除，防止子应用的背景颜色覆盖主应用，但是会自动继到可用的布局容器中 */
  autoClearBackground?: Boolean
}) => {
  const { appendTo = '#app', type, autoClearBackground } = opt || {}

  let appendToDom: any
  if (typeof appendTo === 'string') appendToDom = document.getElementById(appendTo.replace('#', ''))
  if (appendTo instanceof HTMLElement) appendToDom = appendTo
  if (!appendToDom) throw new Error('appendTo must be #id string or HTMLElement')

  let clearBackgroundStyles = {}
  if (type === 'microApp' && autoClearBackground !== false) {
    Object.assign(clearBackgroundStyles, clearBackground(document.documentElement))
    Object.assign(clearBackgroundStyles, clearBackground(document.body))
    Object.assign(clearBackgroundStyles, clearBackground(appendToDom))
  }

  const mountTeleportId = `${prefix}-mount-${new Date().getTime()}`
  const navTeleportId = `${prefix}-nav-${new Date().getTime()}`
  const menuTeleportId = `${prefix}-menu-${new Date().getTime()}`
  const tabTeleportId = `${prefix}-tab-${new Date().getTime()}`
  const vnode = h(Container, {
    type: type,
    mountTeleportId,
    navTeleportId,
    menuTeleportId,
    tabTeleportId,
    clearBackgroundStyles,
  })
  render(vnode, appendToDom)
  return {
    mountDom: document.getElementById(mountTeleportId),
    navDom: document.getElementById(navTeleportId),
    menuDom: document.getElementById(menuTeleportId),
    tabDom: document.getElementById(tabTeleportId),
  }
}

export { createContainer }
