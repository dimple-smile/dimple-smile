import fastify from 'fastify'
import autoLoad from '@fastify/autoload'
import { join } from 'path'
import { getEnv } from './utils/getEnv'
const server = fastify()

server.register(autoLoad, { dir: join(__dirname, 'services'), indexPattern: /.*index(\.ts|\.js|\.cjs|\.mjs)$/ })

getEnv().then((env) => {
  server.listen({ port: env.port }, (err, address) => {
    if (err) {
      console.error(err)
      process.exit(1)
    }
    console.log(`Server listening at ${address}`)
  })
})

export default server
