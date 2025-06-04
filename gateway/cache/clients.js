const { getClients } = require('../clients/auth')

let clients
async function refreshClients() {
    clients = await getClients()
}

exports.launch = async () => {
    const refreshInterval =
        process.env.CLIENTS_REFRESH_INTERVAL || 1000 * 60 * 5

    await refreshClients()
    setInterval(refreshClients, refreshInterval)
}

/**
 * Manually refresh clients on-demand
 * Can be called from any service/controller
 */
exports.refreshNow = async () => {
    await refreshClients()
}

/**
 * Returns the clients
 * @typedef {import('../clients/auth').Client} Client
 * @returns {Client[]}
 */
exports.getClients = () => clients
