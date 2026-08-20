const axios = require('axios');

const WP_API_URL = 'https://rodsin.totalh.net/wp-json/rodsin/v1';
const SECRET_KEY = 'rodsin_secret_2026'; // <-- Must match .htaccess

// Helper to add key to all requests
const withKey = (url) => `${url}&key=${SECRET_KEY}`;

exports.getBalance = async (userId) => {
    try {
        const url = withKey(`${WP_API_URL}/balance?user_id=${userId}`);
        const res = await axios.get(url, { timeout: 10000 });
        return res.data;
    } catch (error) {
        console.error('RODSIN getBalance Error:', error.response?.data || error.message);
        return { error: 'Failed to get balance' };
    }
};

exports.deductCoins = async (userId, amount) => {
    try {
        const url = withKey(`${WP_API_URL}/deduct?user_id=${userId}&amount=${amount}`);
        const res = await axios.post(url, {}, { timeout: 10000 });
        return res.data;
    } catch (error) {
        console.error('RODSIN deductCoins Error:', error.response?.data || error.message);
        return { error: 'Failed to deduct coins' };
    }
};

exports.awardCoins = async (userId, amount) => {
    try {
        const url = withKey(`${WP_API_URL}/award?user_id=${userId}&amount=${amount}`);
        const res = await axios.post(url, {}, { timeout: 10000 });
        return res.data;
    } catch (error) {
        console.error('RODSIN awardCoins Error:', error.response?.data || error.message);
        return { error: 'Failed to award coins' };
    }
};
