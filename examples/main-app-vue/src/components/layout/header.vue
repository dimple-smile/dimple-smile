<template>
  <div style="display: flex; justify-content: center; align-items: center; gap: 10px; background-color: #fff">
    <h1>顶部菜单</h1>
    <el-button @click="visible = true">主应用打开弹窗</el-button>
    <el-dialog v-model="visible"> xxx </el-dialog>
    <h2 @click="handleClick('/micro-app-1/home')">子应用-home</h2>
    <h2 @click="handleClick('/micro-app-1/test')">子应用-test</h2>
    <el-select
      v-model="value"
      placeholder="Select"
      size="large"
      style="width: 240px"
    >
      <el-option
        v-for="item in options"
        :key="item.value"
        :label="item.label"
        :value="item.value"
      />
    </el-select>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElDialog } from 'element-plus'
import { useRouter } from 'vue-router'

const visible = ref(false)
const router = useRouter()

const handleClick = (path: string) => {
  router.push(path)
}

const value = ref('')

const options = [
  {
    value: 'Option1',
    label: 'Option1',
  },
  {
    value: 'Option2',
    label: 'Option2',
  },
  {
    value: 'Option3',
    label: 'Option3',
  },
  {
    value: 'Option4',
    label: 'Option4',
  },
  {
    value: 'Option5',
    label: 'Option5',
  },
]
</script>

<style scoped></style>
