module.exports = class UrlProcessor {
    /**
     * Creates a new URL processor
     * @param {object} route
     * @param {import('express').Request} req
     */
    constructor(route, req) {
        this.__route = route;
        this.__req = req;
    }

    /**
     * Processes the request
     * @typedef {import('./types').Result} Result
     * @returns {Result}
     */
    process() {
        let { path, params, query } = this.__req; // Lấy path, params, query
        const { target, pathRewrite, context } = this.__route;

        // Xử lý pathRewrite
        let servicePath = Object.entries(pathRewrite).reduce(
            (acc, [key, value]) => acc.replace(new RegExp(key), value),
            path
        );

        // Thay thế params trong context
        context.forEach((ctxPath) => {
            if (ctxPath.includes(":")) {
                Object.entries(params).forEach(([key, value]) => {
                    servicePath = servicePath.replace(`:${key}`, value);
                });
            }
        });

        // Xử lý query string
        const queryString = new URLSearchParams(query).toString();
        const finalUrl = queryString ? `${target}${servicePath}?${queryString}` : `${target}${servicePath}`;

        return {
            context: {
                url: finalUrl,
                method: this.__req.method,
            },
        };
    }
};
