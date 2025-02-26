<template>
  <div @click="handleClick" style="background-color: #fff">tab组件{{ tabItems }}</div>
</template>

<script setup lang="ts">
import { ref, computed, watch, toRaw } from 'vue'
import { bus } from '@dimple-smile/mframe'

const containerBus = bus('container')
const data = ref(containerBus.data.get())
containerBus.data.watch((res) => (data.value = res))
const tabItems = computed(() => data.value.tabItems)
const handleClick = () => {
  containerBus.data.set({
    tabItems: [{ label: 'xx', value: 'xx' }],
  })
}
</script>

<style scoped></style>
