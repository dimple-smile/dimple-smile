
# 子应用接入步骤

总体接入步骤
1. 安装@dimple-smile/mframe
2. 修改单页应用的挂载点
3. 同步路由

完成3个步骤即可完成接入。

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
const { mountDom } = createMicroApp() // 使用mframe创建子应用，并修改原spa应用的挂载点
app.mount(mountDom!)

```

### 2.2 主应用是react时

建设中...

### 2.3 主应用是angular时

建设中...

## 3.同步路由

mframe要求由主应用管理菜单信息，主应用切换菜单时，发生了路由变化会自动同步信息给子应用，子应用需要自行响应来自主应用的菜单路由信息变化，同时子应用内如果需要主动改变路由，需要主动上报路由信息让主应用进行响应。

## 3.1 同步主应用下发的路由信息

### 3.1.1 子应用使用vue-router进行路由控制时

```
import { createApp } from 'vue'
import { router } from './router'
import App from './App.vue'
import { createMicroApp } from '@dimple-smile/mframe' // 引入框架依赖

import { syncRouter } from '@dimple-smile/mframe' // 引入路由同步工具


const app = createApp(App)
app.use(router)
const { mountDom } = createMicroApp() // 使用mframe创建子应用，并修改原spa应用的挂载点
app.mount(mountDom!)

// 使用路由同步工具的callback自行响应路由的变化。这里的处理是：当主应用下发路由信息时，使用【子应用自身的vue-router】进行路由跳转
syncRouter((e) => {
  const { url } = e.route
  router.push('/' + url)
})
```

### 3.1.2 子应用使用react-router进行路由控制时

建设中...

### 3.1.3 子应用使用angular-router进行路由控制时

建设中...

### 3.1.3 子应用使用原生js进行路由控制时

建设中...


## 3.2 上报路由信息给主应用

### 3.1.1 子应用使用vue-router进行路由控制时

```
import { createApp, watch } from 'vue'
import { router } from './router'
import App from './App.vue'
import { createMicroApp } from '@dimple-smile/mframe' // 引入框架依赖

import { reportRouter } from '@dimple-smile/mframe' // 引入路由上报工具


const app = createApp(App)
app.use(router)
const { mountDom } = createMicroApp() // 使用mframe创建子应用，并修改原spa应用的挂载点
app.mount(mountDom!)

// 监听【子应用自身的vue-router】路由信息的变化，变化时上报信息给主应用。（如果发现上报之后无响应，需要确认主应用是否已经完成接收路由上报的能力，否则无法响应上报信息。）
watch(
  () => router.currentRoute.value,
  (newRoute) => {
    reportRouter({ 
      // type: 'history', // 可不填，默认为history，可选值为 history | hash
      path: newRoute.fullPath,
    })
  },
)
```

### 3.1.2 子应用使用react-router进行路由控制时

建设中...

### 3.1.3 子应用使用angular-router进行路由控制时

建设中...

### 3.1.3 子应用使用原生js进行路由控制时

建设中...



# 主应用接入步骤

## 1. 安装@dimple-smile/mframe
```
pnpm add @dimple-smile/mframe
```

## 2. 修改SPA应用的挂载点

文档建设中，以下是完整示例代码

创建一个create-main-app.ts
```
import { h, render, watch } from 'vue'
import { createMainApp as createDasMainApp, bus, router as mframeRouter } from '@dimple-smile/mframe'

import type { Router } from 'vue-router'

import Nav from './components/nav.vue'
import Menu from './components/menu.vue'
import Tab from './components/tab.vue'

const containerBus = bus('container')

const createMainApp = (opt: { router: Router }) => {
  const { router } = opt || {}

  const { mountDom, navDom, menuDom, tabDom } = createDasMainApp({
    // 配置子应用列表
    microApps: [
      {
        name: 'app1',
        origin: 'http://localhost:5174',
        activeRule: '/micro-app-1/*',
      },
    ],

    // 响应子应用上报的路由信息
    onMicroAppRouterChange: (data) => {
      const { path } = data
      router.push(path)
    },
  })

  render(h(Nav), navDom!) // 渲染顶部nav组件
  render(h(Menu), menuDom!) // 渲染左侧menu组件
  render(h(Tab), tabDom!) // 渲染导航tab组件

  // menu组件中点击时需要主动emit事件，这里才可以监听到。containerBus.event.emit('menuItemClick', { path: 'xxxx' })
  containerBus.event.on('menuItemClick', (e) => {
    router.push(e.path)
  })

  watch(
    () => router.currentRoute.value,
    (route) => {
      // 通过解析route的fullPath去激活子应用，子应用的激活规则是在配置时配置的activeRule
      mframeRouter.resolve(route.fullPath)
    },
  )

  return { mountDom }
}

export { createMainApp }



```
接下来在主应用的main.ts中引入create-main-app.ts，修改挂载点即可

```
import { createApp } from 'vue'
import { router } from './router'
import App from './App.vue'
import { createMicroApp } from './create-micro-app'

const app = createApp(App)
app.use(router)

const { mountDom } = createMicroApp({ router })
app.mount(mountDom!)

```


### 2.1 主应用是vue时

建设中...

### 2.2 主应用是react时

建设中...

### 2.3 主应用是angular时

建设中...

## 3. 渲染外框组件（顶部nav、左侧menu、导航tab）

建设中...

## 4. 加载子应用

建设中...

## 5. 响应子应用路由上报

建设中...