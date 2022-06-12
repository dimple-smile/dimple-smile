import fp from 'fastify-plugin'
export default fp(async (app) =>
  app.get('/home', async (req) => {
    return `hello //${req.hostname}`
  })
)
