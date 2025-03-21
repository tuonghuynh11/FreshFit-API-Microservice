const fetch = require('node-fetch')
const routes = require('../routes/routes.json')

const authRoute = routes.find((route) => route.name === 'auth-clients-service')

/**
 * @typedef {Object} Client
 * @property {string} _id
 */

/**
 * Fetches the clients from the auth service
 * @typedef {import('node-fetch').Response} Response
 * @typedef {Client[]} Clients
 * @returns {Promise<Clients>}
 */
exports.getClients = async () => {
    const url = `${authRoute.target}/clients`
    const response = await fetch(url)
    return response.json()
}
