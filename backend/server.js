const express = require('express');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
require('dotenv').config();
const { sessionMiddleware } = require('./config/session');

const PORT = process.env.PORT;

const app = express();

app.use(cookieParser());
app.use(
    express.urlencoded({
        extended: true,
    })
);
app.use(express.json());
app.set('trust proxy', 1);
app.use(
    cors({
        origin: 'https://rodsin-ludo-1.onrender.com',
        credentials: true,
    })
);
app.use(sessionMiddleware);
app.get('/wordpress-auth', (req, res) => {
    try {
        const { auth_token } = req.query;

        if (!auth_token) {
            return res.status(401).json({
                success: false,
                message: 'Missing authentication token',
            });
        }

        const parts = auth_token.split('.');

        if (parts.length !== 2) {
            return res.status(401).json({
                success: false,
                message: 'Invalid authentication token',
            });
        }

        const encodedPayload = parts[0];
        const receivedSignature = parts[1];

        const secret =
            'RODSIN-LUDO-AUTH-2026-CHANGE-THIS-SECRET-8f4Kp92Lm7Qx';

        const crypto = require('crypto');

        const expectedSignature = crypto
            .createHmac('sha256', secret)
            .update(encodedPayload)
            .digest('hex');

        if (
            !crypto.timingSafeEqual(
                Buffer.from(receivedSignature),
                Buffer.from(expectedSignature)
            )
        ) {
            return res.status(401).json({
                success: false,
                message: 'Invalid authentication signature',
            });
        }

        const payload = JSON.parse(
            Buffer.from(encodedPayload, 'base64').toString('utf8')
        );

        if (!payload.user_id || !payload.expires) {
            return res.status(401).json({
                success: false,
                message: 'Invalid authentication data',
            });
        }

        if (Date.now() / 1000 > payload.expires) {
            return res.status(401).json({
                success: false,
                message: 'Authentication token expired',
            });
        }

        req.session.userId = payload.user_id;
        req.session.wordpressUserId = payload.user_id;

        req.session.save(err => {
            if (err) {
                console.error('Session save error:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Could not create game session',
                });
            }

            res.json({
                success: true,
                userId: payload.user_id,
            });
        });
    } catch (error) {
        console.error('WordPress authentication error:', error);

        res.status(401).json({
            success: false,
            message: 'Authentication failed',
        });
    }
});
const server = app.listen(PORT);

require('./config/database')(mongoose);
require('./config/socket')(server);

if (process.env.NODE_ENV === 'production') {
    const buildPath = path.join(__dirname, '../build');

    app.use(express.static(buildPath));

    app.get('*', (req, res) => {
        res.sendFile(path.join(buildPath, 'index.html'));
    });
}

module.exports = { server };
