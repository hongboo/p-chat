module.exports = {
    "proxy": {
        "/api": {
            "target": 'http://localhost:9001',
            "secure": false,
            "changeOrigin": true,
        },
    }
}