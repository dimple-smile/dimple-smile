import { h, render, ref, watch } from 'vue'
import { bus } from '@dimple-smile/mframe'
import Container from './container.vue'

import type { ContainerInitOptions, ContainerResult } from '../bus/container/type'

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

const createContainer = async (opt?: ContainerInitOptions): Promise<ContainerResult> => {
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

  const loading = ref(true)
  let result = {}
  const vnode = h(Container, {
    type,
    clearBackgroundStyles,
    onLayoutMounted: (teleportDoms) => {
      result = teleportDoms
      loading.value = false
    },
  })
  render(vnode, appendToDom)
  if (loading.value) await new Promise((res) => watch(() => loading.value, res))
  return result as ContainerResult
}

export { createContainer }
