const express = require('express')
const client = require('prom-client')
const cors = require('cors');

const error = require('../middlewares/error')
const requestId = require('../middlewares/requestid')

client.collectDefaultMetrics()

/**
 * Build Express application
 * @param {Function} [callback]
 * @returns {import('express').Express}
 */
module.exports = (callback = () => {}) => {
    const app = express();
    const router = express.Router();

    app.use(cors({
        origin: '*'
    }));
    app.use(requestId);
    app.use(express.raw({ type: '*/*' }));

    // Define health check and metrics routes (without /api/v1 prefix)
    app.get('/health', require('../handlers/health'));
    app.get('/metrics', async (_, res) => {
        res.set('Content-Type', client.register.contentType);
        res.end(await client.register.metrics());
    });

    // Apply proxy to /health and /metrics
    app.use(['/health', '/metrics'], require('../handlers/proxy'));

    // Define all other routes inside /api/v1
    router.all('*', require('../handlers/proxy'));
    app.use('/api/v1', router);

    callback(app);

    app.use(error);

    return app;
};