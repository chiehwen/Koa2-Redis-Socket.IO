module.exports = {
    redis: {
        host: '127.0.0.1',
        port: process.env.REDIS_PORT | 6379
    },
    mongodb: {
        username: '',
        password: '',
        uri: 'mongodb://localhost:27017'
    }
}