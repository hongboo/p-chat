module.exports = {
    "/api": {
        "target": 'http://localhost:8081',
        // "target": 'http://wwww.alemonice.com:8081',
        // "target": 'http://47.106.120.208:8081',
        "secure": false,
        "changeOrigin": true,
        "pathRewrite": {
            "^/api": ""
        }
    }
}