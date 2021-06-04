<template>
  <div id="reactContainer" :ref="reactContainer"></div>
  <div :ref="reactContent">7777</div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'

const reactContainer = ref()
const reactContent = ref()

onMounted(() => {
  const ws = new WebSocket('ws://localhost:7001/ws', ['test','bymm'])
  ws.onopen = () => {
    console.log('ws连接成功')
    ws.send(JSON.stringify({ name: 1 }))
  }
  ws.onmessage = e => {
    const data = e.data
    console.log('接收到的数据', data)
  }
})
</script>

<style scoped></style>
