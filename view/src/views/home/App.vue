<template>
  <div class="home">
    <div class="container">
      <header class="header">
        <div class="nav">
          <div class="active">HOME</div>
          <div>ABOUT</div>
          <div>UI FRAMEWORK</div>
          <div>BLOG</div>
          <div>CONTACT</div>
        </div>
        <div class="icons">
          <svg-icon name="twiter" width="20px" height="20px" color="#fff"></svg-icon>
          <svg-icon name="google" width="22px" height="22px" color="#fff"></svg-icon>
          <svg-icon name="github" width="20px" height="20px" color="#fff"></svg-icon>
        </div>
      </header>
      <main class="main">
        <svg-icon name="logo" width="120px" height="120px"></svg-icon>
        <div class="name">梨涡浅笑</div>
      </main>
      <footer class="footer">
        <div class="item">
          <div class="name">Roc Xie</div>
          <div>WEB前端开发工程师</div>
        </div>
        <!-- <div class="divider"></div>
        <div class="item">
          <div>Microsoft Corporation</div>
          <div>美国华盛顿州西雅图雷德蒙市</div>
        </div>
        <div class="divider"></div>
        <div class="item">
          <div>xcp3719@icloud.com</div>
          <div>400-820-3800</div>
        </div> -->
      </footer>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
export default defineComponent({
  setup() {
    return {}
  },
})
</script>

<style lang="scss" scope>
.home {
  background: linear-gradient(to right, #232526, #414345);
  .container {
    min-height: 100vh;
    // width: 1200px;
    margin: auto;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    color: rgba(255, 255, 255, 0.8);
    .header {
      padding: 40px 0;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      .nav div {
        font-size: 20px;
        font-weight: 500;
        cursor: pointer;
        color: rgba(255, 255, 255, 0.4);
      }
      .nav div.active {
        color: rgba(255, 255, 255, 0.8);
      }
      .icons {
        display: flex;
        align-items: center;
        svg {
          margin-left: 20px;
          cursor: pointer;
        }
      }
    }
    .main {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      margin-bottom: 100px;
      .logo {
        width: 100px;
        height: 100px;
      }
      .name {
        font-size: 40px;
        margin-top: 20px;
      }
    }
    .footer {
      font-size: 14px;
      padding: 40px 0;
      display: flex;
      justify-content: center;
      align-items: center;
      color: rgba(255, 255, 255, 0.4);
      .divider {
        height: 30px;
        width: 1px;
        background: rgba(255, 255, 255, 0.8);
        margin: 0 20px;
      }
      .item {
        text-align: center;
        .name {
          font-weight: 500;
          color: rgba(255, 255, 255, 0.8);
        }
      }
    }
  }
}
</style>