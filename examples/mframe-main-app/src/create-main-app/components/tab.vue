<template>
  <div @click="handleClick">
    tab组件
  </div>
</template>

<script setup lang="ts">
const handleClick = ()=>{
  alert('this is tab')
}
</script>

<style scoped>

</style>