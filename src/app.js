// Module dependencies
const Koa = require('koa');
const mount = require('koa-mount');
const serve = require('koa-static');
const compress = require('koa-compress');
const logger = require('koa-logger');

const redis = require('redis');


// Configuration
const Configs = require('./configs');

// Initial Koa
const app = new Koa();

// Start the server and listening
const server = app.listen(Configs.base.server.port, () => {
    console.log('Server listening at port %d', Configs.base.server.port);
});

// Create a Socket.io server
const io = socketio(server);

// Middleware
app.use(logger());
// serve files in public folder (css, js etc)
app.use(serve('./public'));  

app.use(router.routes());
app.use(router.allowedMethods());

// Connect to redis
const redisClient = redis.createClient(Configs.database.redis.port, Configs.database.redis.host);
const publishClient = redis.createClient(Configs.database.redis.port, Configs.database.redis.host);

// Chatroom
let numUsers = 0;

// Handle connections
io.on('connection', (socket) => {
    var addedUser = false;

    // when the client emits 'new message', this listens and executes
    socket.on('new message', (data) => {
        // we tell the client to execute 'new message'
        socket.broadcast.emit('new message', {
            username: socket.username,
            message: data
        });
    });

    // when the client emits 'add user', this listens and executes
    socket.on('add user', (username) => {
        if (addedUser) return;

        // we store the username in the socket session for this client
        socket.username = username;
        ++numUsers;
        addedUser = true;
        socket.emit('login', {
            numUsers: numUsers
        });
        // echo globally (all clients) that a person has connected
        socket.broadcast.emit('user joined', {
            username: socket.username,
            numUsers: numUsers
        });
    });

    // when the client emits 'typing', we broadcast it to others
    socket.on('typing', () => {
        socket.broadcast.emit('typing', {
            username: socket.username
        });
    });

    // when the client emits 'stop typing', we broadcast it to others
    socket.on('stop typing', () => {
        socket.broadcast.emit('stop typing', {
            username: socket.username
        });
    });

    // when the user disconnects.. perform this
    socket.on('disconnect', () => {
        if (addedUser) {
            --numUsers;

            // echo globally that this client has left
            socket.broadcast.emit('user left', {
                username: socket.username,
                numUsers: numUsers
            });
        }
    });
});
