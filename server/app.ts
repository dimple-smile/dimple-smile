import { Application, Context, IBoot } from 'egg'
import * as path from 'path'
import * as fs from 'fs'
import getApiList from './app/utils/getApiList'

export default class FooBoot implements IBoot {
  private readonly app: Application

  constructor(app: Application) {
    this.app = app
  }

  configWillLoad() {
    // Ready to call configDidLoad,
    // Config, plugin files are referred,
    // this is the last chance to modify the config.
  }

  configDidLoad() {
    // Config, plugin files have loaded.
  }

  async didLoad() {
    // All files have loaded, start plugin here.
  }

  async willReady() {
    // All plugins have started, can do some thing before app ready.
    // this.app.province = province
    const apiList = getApiList(path.resolve(__dirname, './app/service'))
    let file = path.resolve(__dirname, './api.json')
    fs.writeFile(file, JSON.stringify(apiList, null, 2), { encoding: 'utf8' }, () => {})
  }

  async didReady() {
    // Worker is ready, can do some things
    // don't need to block the app boot.
  }

  async serverDidReady() {
    const app = this.app
    // const ctx = app.createAnonymousContext()
    // await ctx.service.init.service.initPlatform()
    // await ctx.service.init.service.initRoute()
    console.log('服务启动成功')

    app.on('response', (ctx: Context) => {
      const used = Date.now() - ctx.starttime
      const method = ctx.method.toLowerCase()
      const url = `${method} ${ctx.url}`
      const name = ''
      let clg = `${new Date().toLocaleString()} ${url} - ${used}ms`
      if (name) clg = `${new Date().toLocaleString()} ${url} - ${name} - ${used}ms`
      console.log(clg)
    })
  }

  async beforeClose() {
    // Do some thing before app close.
  }
}
