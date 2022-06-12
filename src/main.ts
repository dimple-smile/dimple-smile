import fastify from 'fastify'
import autoLoad from '@fastify/autoload'
import { join } from 'path'
const app = fastify()

app.register(autoLoad, { dir: join(__dirname, 'services'), indexPattern: /.*index(\.ts|\.js|\.cjs|\.mjs)$/ })

app.listen({ port: 3000 }, (err, address) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  console.log(`Server listening at ${address}`)
})

export { app }
export default app
