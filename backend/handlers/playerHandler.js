const { getRoom, updateRoom } = require('../services/roomService');
const { COLORS } = require('../utils/constants');
const { getBalance, deductCoins } = require('../rodsinWallet');

const ENTRY_FEE = 100;

module.exports = socket => {
    const req = socket.request;

    const handleLogin = async data => {
        try {
            const room = await getRoom(data.roomId);

            if (!room) {
                return socket.emit('error:changeRoom');
            }

            if (room.isFull()) {
                return socket.emit('error:changeRoom');
            }

            if (room.started) {
                return socket.emit('error:changeRoom');
            }

            if (room.private && room.password !== data.password) {
                return socket.emit('error:wrongPassword');
            }

            // The WordPress user ID should have been saved
            // during WordPress authentication.
            const wordpressUserId = req.session.wordpressUserId;

            if (!wordpressUserId) {
                return socket.emit('error:walletAuthentication');
            }

            // Check the player's real GamiPress Coins balance.
            const wallet = await getBalance(wordpressUserId);

            if (wallet.error) {
                console.error('Wallet balance error:', wallet.error);
                return socket.emit('error:wallet');
            }

            const balance = Number(wallet.balance || 0);

            // Player must have at least 100 Coins to enter.
            if (balance < ENTRY_FEE) {
                return socket.emit('error:insufficientCoins', {
                    balance,
                    required: ENTRY_FEE,
                });
            }

            // Deduct the 100-Coins entry fee before adding
            // the player to the Ludo room.
            const deduction = await deductCoins(
                wordpressUserId,
                ENTRY_FEE
            );

            if (deduction.error) {
                console.error('Wallet deduction error:', deduction.error);
                return socket.emit('error:wallet');
            }

            // Add the player only after the wallet deduction succeeds.
            addPlayerToExistingRoom(room, data, wordpressUserId);
        } catch (error) {
            console.error('Player login / wallet error:', error);
            socket.emit('error:wallet');
        }
    };

    const handleExit = async () => {
        req.session.reload(err => {
            if (err) return socket.disconnect();

            req.session.destroy();
            socket.emit('redirect');
        });
    };

    const handleReady = async () => {
        const room = await getRoom(req.session.roomId);

        room.getPlayer(req.session.playerId).changeReadyStatus();

        if (room.canStartGame()) {
            room.startGame();
        }

        await updateRoom(room);
    };

    const addPlayerToExistingRoom = async (
        room,
        data,
        wordpressUserId
    ) => {
        /*
         * Store the WordPress user ID in the Ludo player's
         * sessionID field.
         *
         * This allows us to identify the correct GamiPress
         * wallet later when awarding the winner.
         */
        room.addPlayer(data.name, String(wordpressUserId));

        if (room.isFull()) {
            room.startGame();
        }

        await updateRoom(room);
        reloadSession(room);
    };

    // Since it is not bound to an HTTP request, the session
    // must be manually reloaded and saved.
    const reloadSession = room => {
        req.session.reload(err => {
            if (err) return socket.disconnect();

            req.session.roomId = room._id.toString();

            req.session.playerId =
                room.players[room.players.length - 1]._id.toString();

            req.session.color =
                COLORS[room.players.length - 1];

            req.session.wordpressUserId =
                room.players[room.players.length - 1].sessionID;

            req.session.save();

            socket.join(room._id.toString());

            socket.emit(
                'player:data',
                JSON.stringify(req.session)
            );
        });
    };

    socket.on('player:login', handleLogin);
    socket.on('player:ready', handleReady);
    socket.on('player:exit', handleExit);
};
