import React, { useEffect, useState, createContext } from 'react';
import { io } from 'socket.io-client';
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
} from 'react-router-dom';
import ReactLoading from 'react-loading';
import Gameboard from './components/Gameboard/Gameboard';
import LoginPage from './components/LoginPage/LoginPage';

export const PlayerDataContext = createContext();
export const SocketContext = createContext();

function App() {
    const [playerData, setPlayerData] = useState();
    const [playerSocket, setPlayerSocket] = useState();
    const [redirect, setRedirect] = useState(false);
    const [authError, setAuthError] = useState();

    useEffect(() => {
        const authenticateAndConnect = async () => {
            try {
                const params = new URLSearchParams(window.location.search);
                const authToken = params.get('auth_token');

                if (authToken) {
                    const response = await fetch(
                        `https://rodsin-ludo.onrender.com/wordpress-auth?auth_token=${encodeURIComponent(authToken)}`,
                        {
                            credentials: 'include',
                        }
                    );

                    const result = await response.json();

                    if (!response.ok || !result.success) {
                        throw new Error(
                            result.message || 'WordPress authentication failed'
                        );
                    }

                    // Remove the authentication token from the browser URL
                    window.history.replaceState(
                        {},
                        document.title,
                        window.location.pathname
                    );
                }

                const socket = io('https://rodsin-ludo.onrender.com', {
                    withCredentials: true,
                });

                socket.on('player:data', data => {
                    const parsedData = JSON.parse(data);

                    setPlayerData(parsedData);

                    if (parsedData.roomId != null) {
                        setRedirect(true);
                    }
                });

                socket.on('connect_error', error => {
                    console.error('Socket connection error:', error);
                    setAuthError(
                        'Unable to connect to the Ludo server. Please refresh and try again.'
                    );
                });

                setPlayerSocket(socket);
            } catch (error) {
                console.error('WordPress authentication error:', error);
                setAuthError(error.message);
            }
        };

        authenticateAndConnect();
    }, []);

    if (authError) {
        return (
            <div
                style={{
                    color: 'white',
                    background: '#111',
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    padding: '20px',
                }}
            >
                {authError}
            </div>
        );
    }

    return (
        <SocketContext.Provider value={playerSocket}>
            <Router>
                <Routes>
                    <Route
                        path='/'
                        Component={() => {
                            if (redirect) {
                                return <Navigate to='/game' />;
                            }

                            if (playerSocket) {
                                return <LoginPage />;
                            }

                            return (
                                <ReactLoading
                                    type='spinningBubbles'
                                    color='white'
                                    height={667}
                                    width={375}
                                />
                            );
                        }}
                    />

                    <Route
                        path='/login'
                        Component={() => {
                            if (redirect) {
                                return <Navigate to='/game' />;
                            }

                            if (playerSocket) {
                                return <LoginPage />;
                            }

                            return (
                                <ReactLoading
                                    type='spinningBubbles'
                                    color='white'
                                    height={667}
                                    width={375}
                                />
                            );
                        }}
                    />

                    <Route
                        path='/game'
                        Component={() => {
                            if (playerData) {
                                return (
                                    <PlayerDataContext.Provider
                                        value={playerData}
                                    >
                                        <Gameboard />
                                    </PlayerDataContext.Provider>
                                );
                            }

                            return <Navigate to='/login' />;
                        }}
                    />
                </Routes>
            </Router>
        </SocketContext.Provider>
    );
}

export default App;
