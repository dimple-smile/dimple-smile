<template>
  <div>
    <h2 @click="handleClick('/main-app/home')">主页</h2>
    <h2 @click="handleClick('/micro-app-1/home')">子应用-home</h2>
    <h2 @click="handleClick('/micro-app-1/test')">子应用-test</h2>
  </div>
</template>

<script setup lang="ts">
import { bus } from '@dimple-smile/mframe'

const containerBus = bus('container')

const handleClick = (path: string) => {
  containerBus.event.emit('menuItemClick', { path })
}
</script>

<style scoped></style>
