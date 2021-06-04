<template>
  <Layout />
</template>

<script lang="ts">
import Layout from './views/layout/App.vue'
import { onMounted } from 'vue'

export default {
  name: 'App',
  components: { Layout },
  setup() {
    onMounted(() => {})
  },
}
</script>
