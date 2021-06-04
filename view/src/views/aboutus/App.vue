<template>
  <div @click="add">
    {{ count }}
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const count = ref(0)
const add = () => count.value++
</script>
