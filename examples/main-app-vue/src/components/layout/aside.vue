<template>
  <div style="height: 100%; background-color: #fff">
    <div>左侧菜单</div>
    <template v-if="visible">
      <h2 @click="handleClick('/main-app/home')">主页</h2>
      <h2 @click="handleClick('/micro-app-1/home')">子应用-home</h2>
      <h2 @click="handleClick('/micro-app-1/test')">子应用-test</h2>
      <h2 @click="handleClick('/micro-app-2/home')">子应用2-home</h2>
      <h2 @click="handleClick('/micro-app-2/test')">子应用2-test</h2>
    </template>
    <button @click="toggle">toggle</button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const handleClick = (path: string) => {
  router.push(path)
}
const visible = ref(true)

const toggle = () => {
  visible.value = !visible.value
}
</script>

<style scoped></style>
