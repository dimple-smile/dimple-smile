import { Context } from 'egg'

// 待实现的全局参数校验工具，根据api定义进行初步参数校验
const validate = (base: any, payload: any) => {
  console.log(base)
  console.log(payload)
}

export const Api: IApi = {
  name: '测试post',
  path: '/test',
  method: 'post',
  params: { id: { required: true, type: 'string', tip: '这个地址栏拼接参数' } },
  body: { name: { required: true, type: 'string' } },
}

export default async (ctx: Context) => {
  const params = validate(Api.params, ctx.request.query)
  const body = validate(Api.body, ctx.request.body)
  console.log(params)
  console.log(body)

  const p = new Promise((res, rej) => {
    setTimeout(() => {
      res(1)
    }, 10000)
    if (0) rej()
  })
  await p

  return 'test post'
}
