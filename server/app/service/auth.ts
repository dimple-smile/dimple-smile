import { Context } from 'egg'
export const Api: IApi = { name: '认证', path: '/auth' }

export default async (ctx: Context) => {
  console.log(ctx.status)
  return 'auth'
}
