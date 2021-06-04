import { Context } from 'egg'

export const Api: IApi = { name: '服务入口', path: '/' }

export default async (ctx: Context) => {
  ctx.status = 200
  return 'egg serverless for dimple-smile'
}
