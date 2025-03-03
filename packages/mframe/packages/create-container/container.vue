<template>
  <div :style="containerStyle">
    <header
      v-show="visibles.nav"
      :ref="layoutDomRefs.nav"
      @mouseenter="(e) => handleMouseEvent('mouseenter', e, 'nav')"
      @mousemove="(e) => handleMouseEvent('mousemove', e, 'nav')"
    >
      <div v-if="isMainApp" :ref="teleportDomRefs.nav"></div>
      <div v-if="isMicroApp" style="pointer-events: none" :style="{ height: placeholderStyle.navHeight }"></div>
    </header>

    <section style="flex: 1; display: flex; min-height: 0">
      <aside
        v-show="visibles.menu"
        :ref="layoutDomRefs.menu"
        style="height: 100%"
        @mouseenter="(e) => handleMouseEvent('mouseenter', e, 'menu')"
        @mousemove="(e) => handleMouseEvent('mousemove', e, 'menu')"
      >
        <div v-if="isMainApp" :ref="teleportDomRefs.menu" style="height: 100%"></div>
        <div v-if="isMicroApp" style="pointer-events: none" :style="{ width: placeholderStyle.menuWidth }"></div>
      </aside>
      <main style="flex: 1; min-width: 0; display: flex; flex-direction: column">
        <header
          v-show="visibles.tab"
          :ref="layoutDomRefs.tab"
          @mouseenter="(e) => handleMouseEvent('mouseenter', e, 'tab')"
          @mousemove="(e) => handleMouseEvent('mousemove', e, 'tab')"
        >
          <div v-if="isMainApp" :ref="teleportDomRefs.tab"></div>
          <div v-if="isMicroApp" style="pointer-events: none" :style="{ height: placeholderStyle.tabHeight }"></div>
        </header>
        <section
          v-show="visibles.mount"
          :ref="layoutDomRefs.mount"
          style="flex: 1; min-height: 0"
          :style="mountStyle"
          @mouseenter="(e) => handleMouseEvent('mouseenter', e, 'mount')"
        >
          <div :ref="teleportDomRefs.mount" style="height: 100%"></div>
        </section>
      </main>
    </section>

    <template v-if="isMainApp">
      <div ref="microAppContainerRef" name="mframe-micro-app-container" :style="microAppsContainerStyle"></div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { bus, useIframeManager } from '@dimple-smile/mframe'

import type { CSSProperties } from 'vue'

const props = defineProps(['type', 'clearBackgroundStyles', 'microAppsContainerStyle'])
const emits = defineEmits(['layoutMounted'])

const microApps = computed<any[]>(() => data.value.microApps || [])

const containerBus = bus('container')
const mainAppBus = bus('mainApp')
const microAppBus = bus('microApp')

const isMainApp = computed(() => ['mainApp'].includes(props.type))
const isMicroApp = computed(() => ['microApp'].includes(props.type))
const data = ref(containerBus.data.get())
containerBus.data.watch((newData) => (data.value = newData))

const visibles = computed(() => {
  return {
    nav: data.value.navVisible ?? data.value.frameVisible ?? data.value.visible ?? true,
    menu: data.value.menuVisible ?? data.value.frameVisible ?? data.value.visible ?? true,
    tab: data.value.tabVisible ?? data.value.frameVisible ?? data.value.visible ?? true,
    mount: data.value.mountVisible ?? data.value.visible ?? true,
  }
})

const layoutDomRefs = {
  nav: ref<HTMLElement | null>(null),
  menu: ref<HTMLElement | null>(null),
  tab: ref<HTMLElement | null>(null),
  mount: ref<HTMLElement | null>(null),
}

const teleportDomRefs = {
  nav: ref<HTMLElement | null>(null),
  menu: ref<HTMLElement | null>(null),
  tab: ref<HTMLElement | null>(null),
  mount: ref<HTMLElement | null>(null),
}

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
    const excludeList = [
      document.documentElement,
      document.body,
      targetEl,
      layoutDomRefs.menu.value,
      layoutDomRefs.nav.value,
      layoutDomRefs.tab.value,
    ]
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
  let res = getDomElementInRect(layoutDomRefs.nav.value!)
  if (!res) res = getDomElementInRect(layoutDomRefs.tab.value!)
  if (!res) res = getDomElementInRect(layoutDomRefs.menu.value!)
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
      if (!activeMicroAppName.value) {
        return containerBus.data.set({ microAppStickStatus: false })
      }
      containerBus.data.set({ microAppStickStatus: target === 'mount' })
    }

    if (isMicroApp.value) {
      if (checkLayoutHasUsefulDom()) return microAppBus.cors.send('microAppStickStatus', true)
      microAppBus.cors.send('microAppStickStatus', target === 'mount')
    }
  }

  if (eventType === 'mousemove') {
    if (isMicroApp.value) {
      if (checkLayoutHasUsefulDom()) return microAppBus.cors.send('microAppStickStatus', true)
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
  () => {
    microAppContainerLoading.value = true
    setTimeout(() => {
      microAppContainerLoading.value = false
    }, 300)
  },
)

const microAppsContainerStyle = computed<CSSProperties>(() => {
  let resStyle: CSSProperties = {
    ...(props.microAppsContainerStyle || {}),
    display: microApps.value?.length && activeMicroAppName.value ? 'block' : 'none',
    position: 'absolute',
    zIndex: microAppContainerLoading.value ? -1 : 1,
    top: 0,
    left: 0,
    height: '100%',
    width: '100%',
  }
  if (isMainApp.value) {
    resStyle.pointerEvents = data.value.microAppStickStatus && activeMicroAppName.value ? 'all' : 'none'
  }
  return resStyle
})

const microAppContainerRef = ref<HTMLElement | null>(null)

if (isMainApp.value) {
  const onLayoutMounted = async () => {
    const createMutationObserver = (type: string) => {
      // @ts-ignore
      const dom = layoutDomRefs[type]?.value
      const handleChange = () => {
        const { x, y, width, height } = dom?.getBoundingClientRect() || {}
        containerBus.data.set({ [`${type}Rect`]: { x, y, width, height } })
      }
      handleChange()
      new MutationObserver(handleChange).observe(dom!, { childList: true, subtree: true })
    }
    await Promise.all([
      ...Object.keys(layoutDomRefs).map(async (dataKey) => {
        // @ts-ignore
        const domRef = layoutDomRefs[dataKey]
        await new Promise((res) => watch(() => domRef.value, res))
        createMutationObserver(dataKey)
      }),
      ...Object.keys(teleportDomRefs).map(async (dataKey) => {
        // @ts-ignore
        await new Promise((res) => watch(() => teleportDomRefs[dataKey].value, res))
      }),
    ])
    containerBus.event.emit('onLayoutMounted')
    emits('layoutMounted', {
      navDom: teleportDomRefs.nav.value,
      menuDom: teleportDomRefs.menu.value,
      tabDom: teleportDomRefs.tab.value,
      mountDom: teleportDomRefs.mount.value,
    })
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
  setTimeout(() => {
    containerBus.data.set(parentData.layoutData)
  }, 0)
  microAppBus.data.set({ appInfo })
  microAppBus.cors.on('layoutDataChange', (e: any) => {
    containerBus.data.set(e.data)
  })

  const onLayoutMounted = async () => {
    await Promise.all([
      ...Object.keys(layoutDomRefs).map(async (dataKey) => {
        // @ts-ignore
        const domRef = layoutDomRefs[dataKey]
        await new Promise((res) => watch(() => domRef.value, res))
      }),
    ])
    containerBus.event.emit('onLayoutMounted')
    emits('layoutMounted', {
      mountDom: teleportDomRefs.mount.value,
    })
  }
  onLayoutMounted()
}

onMounted(() => {
  containerBus.event.emit('onMounted')
})
</script>

<style scoped></style>
