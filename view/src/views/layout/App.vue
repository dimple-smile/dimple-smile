<template>
  <div :ref="loadingRef">
    <router-view></router-view>
    <!-- <div class="fixed top-10 w-full flex justify-center">
      <div class="text-white bg-red-400 py-2 px-4 rounded">
        消息
      </div>
    </div> -->
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import api from './api'
import showLoading from '@/utils/showLoading'

const loadingRef = ref()
onMounted(async () => {
  const loading = showLoading({ target: loadingRef.value })
  const res0 = await api.getApiList({ name: 555 })

  console.log(res0)
  loading.hide()
})
</script>

<style scoped></style>
