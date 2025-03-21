require('./traces')

const buildApp = require('./app')
const logger = require('./logger')
const { launch } = require('./cache/clients')

const dotenv = require('dotenv')
dotenv.config()

async function run() {
    await launch()

    const app = buildApp()

    app.listen(3000, () => {
        logger.info('API Gateway started', { port: process.env.PORT })
    })

    process.on('uncaughtException', (err) => {
        logger.error('Uncaught Exception:', err)
    })

    // Catch unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
        logger.error('Unhandled Rejection at:', promise, 'reason:', reason)
    })
}

run()
