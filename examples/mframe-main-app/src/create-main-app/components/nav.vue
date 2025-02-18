<template>
  <div style="display: flex;justify-content: center;align-items: center;gap: 10px;background-color: #fff">
    <h1>顶部菜单</h1>
    <el-button @click="visible = true">主应用打开弹窗</el-button>
    <el-dialog v-model="visible"> xxx </el-dialog>
    <h2 @click="handleClick('/micro-app-1/home')">子应用-home</h2>
    <h2 @click="handleClick('/micro-app-1/test')">子应用-test</h2>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElDialog } from 'element-plus'
import { bus } from '@dimple-smile/mframe'

const visible = ref(false)

const containerBus = bus('container')

const handleClick = (path: string) => {
  containerBus.event.emit('menuItemClick', { path })
}
</script>

<style scoped></style>
