import { Context } from 'egg'

export const Api: IApi = {
  name: '测试post',
  path: '/test',
  method: 'post',
  params: {},
  body: { name: { required: true, type: 'string' } },
}

export default async (ctx: Context) => {
  const TemplateModel = ctx.model.Template
  await TemplateModel.create([ctx.request.body])
  return await TemplateModel.find()
}
