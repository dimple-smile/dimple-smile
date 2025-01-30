<template>
  <template v-for="item in apps">
    <iframe
      v-if="keepAliveList.includes(item.name)"
      v-show="activeMicroAppName === item.name"
      :src="item.origin"
      :name="JSON.stringify({ name: item.name, parentData })"
      frameborder="0"
      style="height: 100%; width: 100%"
      @load="(e) => handleAppLoad(e, item)"
    ></iframe>
  </template>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { bus, router } from '@dimple-smile/mframe'

const containerBus = bus('container')
const mainAppBus = bus('mainApp')

const data = ref(containerBus.data.get())
containerBus.data.watch((newData) => (data.value = newData))
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

const apps = computed<any[]>(() => data.value.microApps || [])
const activeMicroAppName = computed(() => data.value.activeMicroAppName || '')
const keepAliveList = ref<any[]>([])

const parentData = computed(() => {
  const containerConfig = {}
  containerConfigKeys.forEach((key) => {
    // @ts-ignore
    containerConfig[key] = data.value[key]
  })
  return { origin: window.origin, containerConfig }
})

watch(
  () => activeMicroAppName.value,
  (newVal) => {
    if (!keepAliveList.value.includes(newVal)) {
      keepAliveList.value.push(newVal)
    } else {
      setMicroAppContainerConfig()
    }
  },
)

const setMicroAppContainerConfig = () => {
  const containerConfig = containerBus.data.get(containerConfigKeys)
  mainAppBus.cors.send(activeMicroAppName.value!, 'containerConfigChang', containerConfig)
}
containerBus.data.watch(setMicroAppContainerConfig, containerConfigKeys)

const handleAppLoad = (event: any, item: any) => {
  containerBus.event.emit('microAppLoad', { event, item })
  const contentWindow = event.target.contentWindow
  const { name, origin } = item
  setMicroAppContainerConfig()

  mainAppBus.expose.connectMicroApp({ name, origin, contentWindow })
  mainAppBus.cors.send(name, 'syncRouter', {
    appInfo: item,
    route: router.getCurrentLocation(),
  })
}
</script>

<style scoped></style>
