<script setup lang="ts">
import {bus} from '@dimple-smile/mframe';

const containerBus = bus('container')
</script>

<template>
  <router-view></router-view>
</template>

<style>
html,
body,
#app {
  height: 100%;
}
</style>
