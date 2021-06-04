import { Application, Context } from 'egg'
import * as path from 'path'
import getApiList from './utils/getApiList'

export default (app: Application) => {
  const { router } = app
  const apiList = getApiList(path.resolve(__dirname, './service'), true)
  const generateRouter = (list: any[]) => {
    for (const item of list) {
      if (item.path && item.exportDefault) {
        const method = item.method || 'get'
        router[method](item.path, async (ctx: Context) => {
          ctx.body = await item.exportDefault(ctx)
        })
      }
      if (item.children && item.children.length > 0) generateRouter(item.children)
    }
  }
  generateRouter(apiList)

  // app.ws.route('/ws', (ctx: Context) => {
  //   if (!ctx.websocket) throw new Error('this function can only be use in websocket router')
  //   const ws = ctx.websocket
  //   ws.on('message', async (msg: any) => {
  //     const req = JSON.parse(msg || {})
  //     let res: { status: number; data?: any; message?: string } = { status: 404, message: '接口地址未找到' }
  //     const getApiService = (url: string, list: any[]) => {
  //       for (const item of list) {
  //         if (item.path && item.path === url && item.exportDefault) return item.exportDefault
  //         if (item.children && item.children.length > 0) return getApiService(url, item.children)
  //       }
  //     }
  //     const apiService = getApiService(req.url, apiList)
  //     if (apiService) {
  //       res.data = await apiService(ctx)
  //       res.status = ctx.status
  //       if (ctx.message) res.message = ctx.message
  //       else delete res.message
  //     }
  //     ws.send(JSON.stringify(res))
  //   }).on('close', (code, reason) => {
  //     console.log('websocket closed', code, reason)
  //   })
  // })

  router.get('/api', (ctx: Context) => {
    ctx.body = getApiList(path.resolve(__dirname, './service'))
  })
}
