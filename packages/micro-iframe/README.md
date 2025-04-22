
# 子应用接入步骤

总体接入步骤
1. 安装@dimple-smile/micro-iframe
2. 修改单页应用的挂载点

完成以上步骤即可完成接入。

## 1. 安装@dimple-smile/micro-iframe
```
pnpm add @dimple-smile/micro-iframe
```

## 2. 修改SPA应用的挂载点

### 2.1 子应用是vue时
原应用的mian.ts代码最小化代码假设如下：
```
import { createApp } from 'vue'
import { router } from './router'
import App from './App.vue'

const app = createApp(App)
app.use(router)
app.mount('#app')

```
需要改为：

```
import { createApp } from 'vue'
import { router } from './router'
import App from './App.vue'
import { createMicroApp } from '@dimple-smile/micro-iframe' // 引入框架依赖

const app = createApp(App)
app.use(router)

// 使用mframe创建子应用，并修改原spa应用的挂载点
createMicroApp().then(res => app.mount(res.mountDom!))
```

### 2.2 主应用是react时

建设中...

### 2.3 主应用是angular时

建设中...

# 主应用接入步骤

总体接入步骤
1. 安装@dimple-smile/micro-iframe
2. 根据主应用的布局情况，找到主内容区节点，设置id
3. 创建主应用，传入根节点和主内容区节点

完成以上步骤即可完成接入。

## 1. 安装@dimple-smile/micro-iframe
```
pnpm add @dimple-smile/micro-iframe
```

## 2. 修改SPA应用的挂载点和布局组件的挂载点


### 2.1 主应用是vue时

原应用的mian.ts代码最小化代码假设如下：
```
import { createApp } from 'vue'
import { router } from './router'
import App from './App.vue'

const app = createApp(App)
app.use(router)
app.mount('#app')

```
需要改为：

```
import { createApp, h, render } from 'vue'
import { router } from './router'
import App from './App.vue'
import { createMainApp } from '@dimple-smile/micro-iframe' // 引入框架依赖
const app = createApp(App)
app.use(router)
app.mount('#app')

// 创建主应用，传入根节点和主内容区节点
createMainApp({
  root: '#app', // 根节点id
  main: '#main', // 主内容区id
  routerConfig: { mode: 'hash' },
  microApps: [
    {
      id: 'app1',
      origin: 'http://localhost:5174',
      activeRule: '/micro-app-1/*',
    },
    {
      id: 'app2',
      origin: 'http://localhost:5175',
      activeRule: '/micro-app-2/*',
      routerConfig: { mode: 'hash' },
    },
  ],
})

```

### 2.2 主应用是react时

建设中...

### 2.3 主应用是angular时

建设中...

## 3. 渲染外框组件（顶部nav、左侧menu、导航tab）

建设中...

## 4. 加载子应用

建设中...