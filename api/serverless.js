'use strict'

require('dotenv').config()

// 引入 Fastify 框架
const Fastify = require('fastify')

// 实例化 Fastify
const app = Fastify({ logger: true })

// 将应用注册为一个常规插件
app.register(require('../src/main').default)

const main = async (req, res) => {
  await app.ready()
  app.server.emit('request', req, res)
}

exports.default = main
module.exports = main
