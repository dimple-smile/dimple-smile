<template>
  <template v-for="item in apps">
    <iframe
      v-if="keepAliveList.includes(item.name)"
      v-show="activeMicroAppName === item.name"
      :src="pureSrc(item)"
      :name="pureName(item)"
      frameborder="0"
      style="height: 100%; width: 100%"
      @load="(e) => handleAppLoad(e, item)"
    ></iframe>
  </template>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { bus } from '@dimple-smile/mframe'

const emit = defineEmits(['microAppLoad'])
const containerBus = bus('container')

const data = ref(containerBus.data.get())
containerBus.data.watch((newData) => (data.value = newData))
const layoutDataKeys = containerBus.expose.getLayoutDataKeys()

const apps = computed<any[]>(() => data.value.microApps || [])
const activeMicroAppName = computed(() => data.value.activeMicroAppName || '')
const keepAliveList = ref<any[]>([])

const parentData = computed(() => {
  const layoutData = {}
  layoutDataKeys.forEach((key) => {
    // @ts-ignore
    layoutData[key] = data.value[key]
  })
  return { origin: window.origin, layoutData }
})

watch(
  () => activeMicroAppName.value,
  (newVal) => {
    if (!keepAliveList.value.includes(newVal)) {
      keepAliveList.value.push(newVal)
    } else {
      containerBus.event.emit('microAppShow', newVal)
    }
  },
)

const pureSrc = (item: any) => {
  const { pathname, hash, search } = new URL(window.location.href)
  let initPathName = pathname + search
  if (data.value.initOptions.router?.mode === 'hash') initPathName = `/${hash}`
  const microAppInitOption = data.value.initOptions.microApps?.find((mItem) => mItem.name === item.name)
  if (microAppInitOption?.router?.mode === 'hash') initPathName = `/#${initPathName}`
  return item.origin
}

const pureName = (item: any) => {
  return JSON.stringify({ appInfo: item, parentData: parentData.value })
}

const handleAppLoad = (event: any, item: any) => {
  containerBus.event.emit('microAppLoad', { ...item, contentWindow: event.target.contentWindow })
  emit('microAppLoad', { event, item })
}
</script>

<style scoped></style>
