<template>
  <div :style="containerStyle">
    <header
      v-show="navVisible"
      ref="navRef"
      @mouseenter="(e) => handleMouseEvent('mouseenter', e, 'nav')"
      @mousemove="(e) => handleMouseEvent('mousemove', e, 'nav')"
    >
      <div v-if="isMainApp">microAppStickStatus:{{ microAppStickStatus }}</div>
      <div v-show="isMainApp && navTeleportId" :id="navTeleportId"></div>
      <div v-if="isMicroApp" style="pointer-events: none" :style="{ height: placeholderStyle.navHeight }"></div>
    </header>

    <section style="flex: 1; display: flex; min-height: 0">
      <aside
        v-show="menuVisible"
        ref="menuRef"
        style="height: 100%"
        @mouseenter="(e) => handleMouseEvent('mouseenter', e, 'menu')"
        @mousemove="(e) => handleMouseEvent('mousemove', e, 'menu')"
      >
        <div v-show="isMainApp && menuTeleportId" :id="menuTeleportId" style="height: 100%"></div>
        <div v-if="isMicroApp" style="pointer-events: none" :style="{ width: placeholderStyle.menuWidth }"></div>
      </aside>
      <main style="flex: 1; min-width: 0; display: flex; flex-direction: column">
        <header
          v-show="tabVisible"
          ref="tabRef"
          @mouseenter="(e) => handleMouseEvent('mouseenter', e, 'tab')"
          @mousemove="(e) => handleMouseEvent('mousemove', e, 'tab')"
        >
          <div v-show="isMainApp && tabTeleportId" :id="tabTeleportId"></div>
          <div v-if="isMicroApp" style="pointer-events: none" :style="{ height: placeholderStyle.tabHeight }"></div>
        </header>
        <section
          ref="mountRef"
          style="flex: 1; min-height: 0"
          :id="mountTeleportId"
          :style="mountStyle"
          @mouseenter="(e) => handleMouseEvent('mouseenter', e, 'mount')"
        ></section>
      </main>
    </section>

    <template v-if="isMainApp && microApps.length">
      <div v-show="activeMicroAppName" name="mframe-micro-app-container" :style="microAppsContainerStyle">
        <MicroAppsComponet></MicroAppsComponet>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { CSSProperties } from 'vue'

import MicroAppsComponet from './micro-apps.vue'

import { bus, pollVariable } from '@dimple-smile/mframe'

const props = defineProps([
  'type',
  'mountTeleportId',
  'navTeleportId',
  'menuTeleportId',
  'tabTeleportId',
  'clearBackgroundStyles',
])

const mountTeleportId = computed(() => props.mountTeleportId || '')
const navTeleportId = computed(() => props.navTeleportId || '')
const menuTeleportId = computed(() => props.menuTeleportId || '')
const tabTeleportId = computed(() => props.tabTeleportId || '')
const microApps = computed<any[]>(() => data.value.microApps || [])

const containerBus = bus('container')
const mainAppBus = bus('mainApp')
const microAppBus = bus('microApp')

const isMainApp = computed(() => ['mainApp'].includes(props.type))
const isMicroApp = computed(() => ['microApp'].includes(props.type))
const data = ref(containerBus.data.get())
containerBus.data.watch((newData) => (data.value = newData))

const navVisible = computed(() => data.value.navVisible ?? data.value.visible ?? true)
const menuVisible = computed(() => data.value.menuVisible ?? data.value.visible ?? true)
const tabVisible = computed(() => data.value.tabVisible ?? data.value.visible ?? true)

const activeMicroAppName = computed(() => data.value.activeMicroAppName || '')
const microAppStickStatus = computed(() => data.value.microAppStickStatus)

const placeholderStyle = computed(() => {
  return {
    navHeight: (data.value?.navRect?.height || 0) + 'px',
    menuWidth: (data.value?.menuRect?.width || 0) + 'px',
    tabHeight: (data.value?.tabRect?.height || 0) + 'px',
  }
})

const containerStyle = computed<CSSProperties>(() => {
  return {
    position: 'relative',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  }
})

const checkLayoutHasUsefulDom = () => {
  function getDomElementInRect(targetEl, step = 10) {
    const rect = targetEl.getBoundingClientRect()
    const { x, y, width, height } = rect
    const startX = x
    const startY = y
    const endX = x + width
    const endY = y + height
    const excludeList = [document.documentElement, document.body, targetEl, menuRef.value, navRef.value, tabRef.value]
    for (let x = startX; x <= endX; x += step) {
      for (let y = startY; y <= endY; y += step) {
        const element = document.elementFromPoint(x, y)
        if (element && !excludeList.includes(element)) {
          return element
        }
      }
    }
    return null
  }
  let res = getDomElementInRect(navRef.value)
  if (!res) res = getDomElementInRect(tabRef.value)
  if (!res) res = getDomElementInRect(menuRef.value)
  return res
}

const mouseEventPoint = { x: -1, y: -1 }
const handleMouseEvent = (
  eventType: 'mouseenter' | 'mouseleave' | 'mousemove',
  event: MouseEvent,
  target: 'nav' | 'menu' | 'tab' | 'mount',
) => {
  if (mouseEventPoint.x === event.x && mouseEventPoint.y === event.y) return
  mouseEventPoint.x = event.x
  mouseEventPoint.y = event.x

  if (eventType === 'mouseenter') {
    if (isMainApp.value) {
      if (!activeMicroAppName.value) return
      containerBus.data.set({ microAppStickStatus: target === 'mount' })
    }

    if (isMicroApp.value) {
      if (checkLayoutHasUsefulDom()) return
      microAppBus.cors.send('microAppStickStatus', target === 'mount')
    }
  }

  if (eventType === 'mousemove') {
    if (isMicroApp.value) {
      if (checkLayoutHasUsefulDom()) return
      microAppBus.cors.send('microAppStickStatus', target === 'mount')
    }
  }
}

const mountStyle = computed<CSSProperties>(() => {
  const clearBackgroundStyles = isMicroApp.value ? props.clearBackgroundStyles || {} : {}
  let resStyle: CSSProperties = { ...clearBackgroundStyles }
  return resStyle
})

const microAppsContainerStyle = computed<CSSProperties>(() => {
  let resStyle: CSSProperties = {
    ...(data.value.microAppsContainerStyle || {}),
    position: 'absolute',
    zIndex: 1,
    top: 0,
    left: 0,
    height: '100%',
    width: '100%',
  }
  if (isMainApp.value) resStyle.pointerEvents = data.value.microAppStickStatus ? 'all' : 'none'
  return resStyle
})

const navRef = ref<HTMLElement | null>(null)
const menuRef = ref<HTMLElement | null>(null)
const tabRef = ref<HTMLElement | null>(null)
const mountRef = ref<HTMLElement | null>(null)

const containerConfigKeys = [
  'visible',
  'menuCollapse',
  'navVisible',
  'menuVisible',
  'tabVisible',
  'frameVisible',
  'navRect',
  'menuRect',
  'tabRect',
  'mountRect',
]

const setMicroAppContainerConfig = async () => {
  const containerConfig = containerBus.data.get(containerConfigKeys)
  const activeMicroAppName: any = await pollVariable(() => data.value.activeMicroAppName)
  mainAppBus.cors.send(activeMicroAppName!, 'containerConfigChang', containerConfig)
}
containerBus.data.watch(setMicroAppContainerConfig, containerConfigKeys)

if (isMainApp.value) {
  const createLayoutWatch = (key: any, dataRef: any) => {
    watch(
      () => dataRef.value,
      (dom) => {
        const { x, y, width, height } = dom?.getBoundingClientRect() || {}
        containerBus.data.set({ [key]: { x, y, width, height } })

        const ob = new MutationObserver((e) => {
          const { x, y, width, height, top, left } = dom?.getBoundingClientRect() || {}
          containerBus.data.set({ [key]: { x, y, width, height, top, left } })
        })
        ob.observe(dom!, { childList: true, subtree: true })
      },
    )
  }

  createLayoutWatch('navRect', navRef)
  createLayoutWatch('menuRect', menuRef)
  createLayoutWatch('tabRect', tabRef)
  createLayoutWatch('mountRect', mountRef)
  mainAppBus.cors.on('microAppStickStatus', (e) => {
    containerBus.data.set({ microAppStickStatus: e.data })
  })
}

if (isMicroApp.value) {
  containerBus.data.set({ microAppStickStatus: true })
  let iframeData: any = {}
  try {
    iframeData = JSON.parse(window.name)
  } catch {}
  const { parentData = {} } = iframeData
  containerBus.data.set(parentData.containerConfig)
  microAppBus.cors.on('containerConfigChang', (e: any) => {
    containerBus.data.set(e.data)
  })
}

</script>

<style scoped></style>
