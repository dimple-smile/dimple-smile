import { h, render } from 'vue'
import { bus } from '@dimple-smile/mframe'
import Container from './container.vue'

import type { ContainerInitOptions } from '../bus/container/type'

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
    // @ts-ignore
    removedStyles[key] = computedStyle[key]
  })
  removedStyleKeys.map((key: any) => {
    element.style[key] = 'none'
  })
  return removedStyles
}

const createContainer = (opt?: ContainerInitOptions) => {
  const { appendTo = '#app', type, autoClearBackground } = opt || {}

  const isMicroApp = type === 'microApp'

  let appendToDom: any
  if (typeof appendTo === 'string') appendToDom = document.getElementById(appendTo.replace('#', ''))
  if (appendTo instanceof HTMLElement) appendToDom = appendTo
  if (!appendToDom) throw new Error('appendTo must be #id string or HTMLElement')

  const containerBus = bus('container')
  containerBus.data.set({ initOptions: opt })

  let clearBackgroundStyles = {}
  if (isMicroApp && autoClearBackground !== false) {
    Object.assign(clearBackgroundStyles, clearBackground(document.documentElement))
    Object.assign(clearBackgroundStyles, clearBackground(document.body))
    Object.assign(clearBackgroundStyles, clearBackground(appendToDom))
  }

  const mountTeleportId = `${prefix}-mount-${new Date().getTime()}`
  const navTeleportId = `${prefix}-nav-${new Date().getTime()}`
  const menuTeleportId = `${prefix}-menu-${new Date().getTime()}`
  const tabTeleportId = `${prefix}-tab-${new Date().getTime()}`
  const vnode = h(Container, {
    type,
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
