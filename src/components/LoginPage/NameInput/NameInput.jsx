import React, { useState, useContext, useEffect } from 'react';
import { SocketContext } from '../../../App';
import useInput from '../../../hooks/useInput';
import useKeyPress from '../../../hooks/useKeyPress';
import styles from './NameInput.module.css';

const NameInput = ({ isRoomPrivate, roomId }) => {
    const socket = useContext(SocketContext);

    const nickname = useInput('');
    const password = useInput('');

    const [errorMessage, setErrorMessage] = useState('');
    const [isJoining, setIsJoining] = useState(false);

    const handleButtonClick = () => {
        setErrorMessage('');

        if (!nickname.value.trim()) {
            setErrorMessage('Please enter your nickname.');
            return;
        }

        if (!socket || !socket.connected) {
            setErrorMessage('Connecting to game server. Please try again.');
            return;
        }

        setIsJoining(true);

        socket.emit('player:login', {
            name: nickname.value.trim(),
            password: password.value,
            roomId: roomId
        });
    };

    useKeyPress('Enter', handleButtonClick);

    useEffect(() => {
        if (!socket) return;

        const handleWrongPassword = () => {
            setIsJoining(false);
            setErrorMessage('Wrong room password.');
        };

        const handleInsufficientCoins = data => {
            setIsJoining(false);

            const balance = data?.balance ?? 0;
            const required = data?.required ?? 100;

            setErrorMessage(
                `You need ${required} Coins to join. Your balance is ${balance} Coins.`
            );
        };

        const handleWalletAuthentication = () => {
            setIsJoining(false);
            setErrorMessage(
                'Your WordPress account could not be identified. Please log in again.'
            );
        };

        const handleWalletError = () => {
            setIsJoining(false);
            setErrorMessage(
                'Unable to connect to your Coins wallet. Please try again.'
            );
        };

        const handleConnectError = () => {
            setIsJoining(false);
            setErrorMessage(
                'Unable to connect to the game server.'
            );
        };

        const handlePlayerData = () => {
            setIsJoining(false);
        };

        socket.on('error:wrongPassword', handleWrongPassword);
        socket.on('error:insufficientCoins', handleInsufficientCoins);
        socket.on('error:walletAuthentication', handleWalletAuthentication);
        socket.on('error:wallet', handleWalletError);
        socket.on('connect_error', handleConnectError);
        socket.on('player:data', handlePlayerData);

        return () => {
            socket.off('error:wrongPassword', handleWrongPassword);
            socket.off('error:insufficientCoins', handleInsufficientCoins);
            socket.off('error:walletAuthentication', handleWalletAuthentication);
            socket.off('error:wallet', handleWalletError);
            socket.off('connect_error', handleConnectError);
            socket.off('player:data', handlePlayerData);
        };
    }, [socket]);

    return (
        <div
            className={styles.container}
            style={{ height: isRoomPrivate ? '100px' : '75px' }}
        >
            <input
                placeholder="Nickname"
                type="text"
                {...nickname}
            />

            {isRoomPrivate ? (
                <input
                    placeholder="Room password"
                    type="text"
                    {...password}
                />
            ) : null}

            <button
                onClick={handleButtonClick}
                disabled={isJoining}
            >
                {isJoining ? 'JOINING...' : 'JOIN'}
            </button>

            {errorMessage ? (
                <div
                    style={{
                        color: 'red',
                        marginTop: '8px',
                        fontSize: '13px',
                        textAlign: 'center'
                    }}
                >
                    {errorMessage}
                </div>
            ) : null}
        </div>
    );
};

export default NameInput;
