const express = require('express')
const client = require('prom-client')

const error = require('../middlewares/error')
const requestId = require('../middlewares/requestid')

client.collectDefaultMetrics()

/**
 * Build Express application
 * @param {Function} [callback]
 * @returns {import('express').Express}
 */
module.exports = (callback = () => {}) => {
    const app = express()
    const router = express.Router()

    app.use(requestId)
    app.use(express.raw({ type: '*/*' }))

    app.get('/health', require('../handlers/health'))
    app.get('/metrics', async (_, res) => {
        res.set('Content-Type', client.register.contentType)
        res.end(await client.register.metrics())
    })
    router.all('*', require('../handlers/proxy'))

    app.use('/api/v1', router) // Apply the prefix here

    callback(app)

    app.use(error)

    return app
}
