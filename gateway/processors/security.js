const { getClients } = require('../cache/clients')
const { jwtDecode } = require('jwt-decode')
const jwt = require('jsonwebtoken')
const { stringifyToBuffer } = require('../utils')
const { envConfig } = require('../constants/config')

module.exports = class SecurityProcessor {
    /**
     * Creates a new security handler
     * @typedef {import('./types').Route} Route
     * @param {Route} route
     * @param {import('express').Request} req
     */
    constructor(route, req) {
        this.__route = route
        this.__req = req
        this.__clients = getClients()
    }

    /**
     * Processes the request
     * @typedef {import('./types').Result} Result
     * @returns {Result}
     */
    process() {
        const { scope } = this.__route.security
        const { authorization } = this.__req.headers

        // get bearer token
        if (!authorization) {
            return {
                response: {
                    status: 401,
                    content: stringifyToBuffer({
                        error: 'unauthorized',
                        message: 'missing authorization header',
                    }),
                    headers: {
                        'content-type': 'application/json',
                    },
                },
            }
        }

        const [bearer, token] = authorization.split(' ')
        if (bearer !== 'Bearer') {
            return {
                response: {
                    status: 401,
                    content: stringifyToBuffer({
                        error: 'unauthorized',
                        message: 'invalid authorization header',
                    }),
                    headers: {
                        'content-type': 'application/json',
                    },
                },
            }
        }

        // decode token to get client_id claim
        let decoded
        try {
            decoded = jwtDecode(token)
        } catch {
            return {
                response: {
                    status: 401,
                    content: stringifyToBuffer({
                        error: 'unauthorized',
                        message: 'invalid token',
                    }),
                    headers: {
                        'content-type': 'application/json',
                    },
                },
            }
        }

        // get client
        const client = this.__clients.find(
            (client) => client._id === decoded.user_id
        )
        if (!client) {
            return {
                response: {
                    status: 401,
                    content: stringifyToBuffer({
                        error: 'unauthorized',
                        message: 'client not found',
                    }),
                    headers: {
                        'content-type': 'application/json',
                    },
                },
            }
        }

        // verify token
        let claims
        try {
            claims = jwt.verify(token, envConfig.jwtSecretAccessToken)
        } catch {
            return {
                response: {
                    status: 401,
                    content: stringifyToBuffer({
                        error: 'unauthorized',
                        message: 'invalid token',
                    }),
                    headers: {
                        'content-type': 'application/json',
                    },
                },
            }
        }

        // verify scope
        // if (!claims.scope.includes(scope)) {
        //     return {
        //         response: {
        //             status: 403,
        //             content: stringifyToBuffer({
        //                 error: 'forbidden',
        //                 message: 'insufficient scope',
        //             }),
        //             headers: {
        //                 'content-type': 'application/json',
        //             },
        //         },
        //     }
        // }

        const headers = {
            'X-Client-Id': client.id,
            // 'X-Client-Role': client.client_role,
        }

        return { context: { client, headers } }
    }
}
