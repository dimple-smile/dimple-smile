<template>
  <div style="height: 100%; color: #fff">
    <span>micro-app-1 home</span>
    <el-button @click="openMessage">open Message</el-button>
    <el-button @click="openMessageBox">open MessageBox</el-button>
    <el-button @click="openNotification">open Notification</el-button>

    <el-button @click="push">子应用自行跳转 /test</el-button>

    <el-button plain @click="dialogVisible = true"> Click to open the Dialog </el-button>
    <el-dialog v-model="dialogVisible" title="Tips" width="500">
      <span>This is a message</span>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">Cancel</el-button>
          <el-button type="primary" @click="dialogVisible = false"> Confirm </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
import { ElNotification } from 'element-plus'

const dialogVisible = ref(false)

const openMessage = () => {
  ElMessage({
    showClose: true,
    message: 'Congrats, this is a success message.',
    type: 'success',
  })
}

const openMessageBox = () => {
  ElMessageBox({ message: '这里是子应用的 MessageBox' })
}

const openNotification = () => {
  ElNotification({
    title: 'Success',
    message: 'This is a success message',
    type: 'success',
  })
}

const router = useRouter()
const push = () => {
  router.push('/micro-app-1/test')
}
</script>

<style scoped></style>
