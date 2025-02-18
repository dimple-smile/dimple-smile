<template>
  <div @click="handleClick" style="background-color: #fff">
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