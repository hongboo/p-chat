module.exports = {
    "/api": {
        "target": 'http://localhost:9001',
        "secure": false,
        "changeOrigin": true,
        "pathRewrite": {
            "^/api": ""
        }
    }
}