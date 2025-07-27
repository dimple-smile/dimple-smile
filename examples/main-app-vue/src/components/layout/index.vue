<template>
  <div style="height: 100%; display: flex; flex-direction: column">
    <Header></Header>
    <div style="flex: 1; display: flex">
      <Aside></Aside>
      <div style="flex:1;height: 100%; display: flex; flex-direction: column">
        <Tab></Tab>
        <div style="flex: 1" id="main">
          <slot></slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Header from './header.vue'
import Aside from './aside.vue'
import Tab from './tab.vue'
</script>

<style scoped></style>
