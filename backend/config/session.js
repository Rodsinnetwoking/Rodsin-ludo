const session = require('express-session');

const sessionMiddleware = session({
    credentials: true,
    cookie: {
        httpOnly: false,
        secure: false,
    },
    secret: 'secret',
    saveUninitialized: true,
    resave: true,
    maxAge: 20000,
});

const wrap = expressMiddleware => (socket, next) =>
    expressMiddleware(socket.request, {}, next);

module.exports = { sessionMiddleware, wrap };
