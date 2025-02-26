
# 子应用接入步骤

总体接入步骤
1. 安装@dimple-smile/mframe
2. 修改单页应用的挂载点

完成以上步骤即可完成接入。

## 1. 安装@dimple-smile/mframe
```
pnpm add @dimple-smile/mframe
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
import { createMicroApp } from '@dimple-smile/mframe' // 引入框架依赖

const app = createApp(App)
app.use(router)

// 使用mframe创建子应用，并修改原spa应用的挂载点
createMicroApp().then(res=>{
  app.mount(res.mountDom!)
})
```

### 2.2 主应用是react时

建设中...

### 2.3 主应用是angular时

建设中...

# 主应用接入步骤

总体接入步骤
1. 安装@dimple-smile/mframe
2. 修改单页应用的挂载点和布局组件的挂载点

完成以上步骤即可完成接入。

## 1. 安装@dimple-smile/mframe
```
pnpm add @dimple-smile/mframe
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
import { createMicroApp } from '@dimple-smile/mframe' // 引入框架依赖
import Nav from './layout-components/nav.vue' // 引入布局组件中的顶部导航组件
import Menu from './layout-components/menu.vue' // 引入布局组件中的左侧菜单组件
import Tab from './layout-components/tab.vue' // 引入布局组件中的标签栏组件

const app = createApp(App)
app.use(router)

// 使用mframe创建子应用，并修改原spa应用的挂载点
createMicroApp({
  // 子应用列表
  microApps: [
    {
      name: 'app1',
      origin: 'http://localhost:5174',
      activeRule: '/micro-app-1/*',
    },
    {
      name: 'app2',
      origin: 'http://localhost:5175',
      activeRule: '/micro-app-2/*',
      router: { mode: 'hash' },
    },
  ],
}).then(res => {
  const { mountDom, navDom, menuDom, tabDom } = res
  app.mount(res.mountDom!) // 修改应用的挂载点
  render(h(Nav), navDom!) // 修改布局组件中的顶部导航组件的挂载点
  render(h(Menu), menuDom!) // 修改布局组件中的左侧菜单组件的挂载点
  render(h(Tab), tabDom!) // 修改布局组件中的标签栏组件的挂载点
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