<template>
  <div :style="containerStyle">
    <header
      v-show="navVisible"
      ref="navRef"
      @mouseenter="(e) => handleMouseEvent('mouseenter', e, 'nav')"
      @mousemove="(e) => handleMouseEvent('mousemove', e, 'nav')"
    >
      <div v-if="isMainApp && navTeleportId" :id="navTeleportId"></div>
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
        <div v-if="isMainApp && menuTeleportId" :id="menuTeleportId" style="height: 100%"></div>
        <div v-if="isMicroApp" style="pointer-events: none" :style="{ width: placeholderStyle.menuWidth }"></div>
      </aside>
      <main style="flex: 1; min-width: 0; display: flex; flex-direction: column">
        <header
          v-show="tabVisible"
          ref="tabRef"
          @mouseenter="(e) => handleMouseEvent('mouseenter', e, 'tab')"
          @mousemove="(e) => handleMouseEvent('mousemove', e, 'tab')"
        >
          <div v-if="isMainApp && tabTeleportId" :id="tabTeleportId"></div>
          <div v-if="isMicroApp" style="pointer-events: none" :style="{ height: placeholderStyle.tabHeight }"></div>
        </header>
        <section
          v-show="mountVisible"
          ref="mountRef"
          style="flex: 1; min-height: 0"
          :id="mountTeleportId"
          :style="mountStyle"
          @mouseenter="(e) => handleMouseEvent('mouseenter', e, 'mount')"
        ></section>
      </main>
    </section>

    <template v-if="isMainApp && microApps.length">
      <div ref="microAppContainerRef" name="mframe-micro-app-container" :style="microAppsContainerStyle"></div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { bus, useIframeManager } from '@dimple-smile/mframe'

import type { CSSProperties } from 'vue'

const props = defineProps([
  'type',
  'mountTeleportId',
  'navTeleportId',
  'menuTeleportId',
  'tabTeleportId',
  'clearBackgroundStyles',
  'microAppsContainerStyle',
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
const mountVisible = computed(() => data.value.mountVisible ?? data.value.visible ?? true)
const activeMicroAppName = computed(() => data.value.activeMicroAppName || '')

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
  function getDomElementInRect(targetEl: Element, step = 10) {
    if (!targetEl) return
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
    return
  }
  let res = getDomElementInRect(navRef.value!)
  if (!res) res = getDomElementInRect(tabRef.value!)
  if (!res) res = getDomElementInRect(menuRef.value!)
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

const microAppContainerLoading = ref(false)
watch(
  () => activeMicroAppName.value,
  (newVal) => {
    microAppContainerLoading.value = true
    setTimeout(() => {
      microAppContainerLoading.value = false
    }, 300)
  },
)

const microAppsContainerStyle = computed<CSSProperties>(() => {
  let resStyle: CSSProperties = {
    ...(props.microAppsContainerStyle || {}),
    position: 'absolute',
    zIndex: microAppContainerLoading.value ? -1 : 1,
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
const microAppContainerRef = ref<HTMLElement | null>(null)

if (isMainApp.value) {
  const layoutRectObj = { navRect: navRef, menuRect: menuRef, tabRect: tabRef, mountRect: mountRef }
  const createMutationObserver = (dom: any, dataKey: any) => {
    const handleChange = () => {
      const { x, y, width, height } = dom?.getBoundingClientRect() || {}
      containerBus.data.set({ [dataKey]: { x, y, width, height } })
    }
    handleChange()
    new MutationObserver(handleChange).observe(dom!, { childList: true, subtree: true })
  }
  const onLayoutMounted = async () => {
    await Promise.all(
      Object.keys(layoutRectObj).map(async (dataKey) => {
        // @ts-ignore
        const domRef = layoutRectObj[dataKey]
        await new Promise((res) => watch(() => domRef.value, res))
        createMutationObserver(domRef.value, dataKey)
      }),
    )
    containerBus.event.emit('onLayoutMounted')
  }
  onLayoutMounted()

  containerBus.data.watch(() => {
    const activeMicroAppName: any = data.value.activeMicroAppName
    if (!activeMicroAppName) return
    const layoutData = containerBus.data.get(containerBus.expose.getLayoutDataKeys())
    mainAppBus.cors.send(activeMicroAppName, 'layoutDataChange', layoutData)
  }, containerBus.expose.getLayoutDataKeys())

  mainAppBus.cors.on('microAppStickStatus', (e: any) => {
    containerBus.data.set({ microAppStickStatus: e.data })
  })

  const { setIframeMountDom } = useIframeManager()
  watch(() => microAppContainerRef.value, setIframeMountDom)
}

if (isMicroApp.value) {
  containerBus.data.set({ microAppStickStatus: true })
  let iframeData: any = {}
  try {
    iframeData = JSON.parse(window.name)
  } catch {}
  const { appInfo, parentData = {} } = iframeData
  containerBus.data.set(parentData.layoutData)
  microAppBus.data.set({ appInfo })
  microAppBus.cors.on('layoutDataChange', (e: any) => {
    containerBus.data.set(e.data)
  })
}

onMounted(() => {
  containerBus.event.emit('onMounted')
})
</script>

<style scoped></style>
