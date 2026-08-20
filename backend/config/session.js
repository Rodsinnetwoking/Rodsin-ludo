const session = require('express-session');

const sessionMiddleware = session({
    secret: process.env.SESSION_SECRET || 'RODSIN-LUDO-SESSION-SECRET-CHANGE-ME',
    resave: false,
    saveUninitialized: false,

    cookie: {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 24 * 60 * 60 * 1000,
    },
});

const wrap = expressMiddleware => (socket, next) =>
    expressMiddleware(socket.request, {}, next);

module.exports = {
    sessionMiddleware,
    wrap,
};
