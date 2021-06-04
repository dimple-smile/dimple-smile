interface IApi {
  method?: 'post' | 'delete' | 'put' | 'get'
  name: string
  path: string
  params?: object
  body?: object
  response?: object | any[]
  version?: number
  note?: string
}
