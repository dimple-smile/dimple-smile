import { Context } from 'egg'

export const Api: IApi = { name: '测试get', path: '/test', params: {} }

export default async (ctx: Context) => {
  console.log(ctx.status)
  return 'test get'
}
