import * as path from 'path'
import fastifyStatic from '@fastify/static'

import fp from 'fastify-plugin'
export default fp(async (app) => {
  app.register(fastifyStatic, {
    root: path.join(__dirname, '../../../frontend/vue/dist/'),
    prefix: '/spa/vue/',
  })

  app.get('/spa/vue', (req, reply) => {
    reply.sendFile('index.html') // sending path.join(__dirname, 'public', 'myHtml.html') directly with custom filename
  })

  app.get('/', (req, reply) => {
    reply.redirect('/spa/vue')
  })
})
