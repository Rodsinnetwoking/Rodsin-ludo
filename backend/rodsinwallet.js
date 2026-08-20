const axios = require('axios');

const API_URL = process.env.RODSIN_API_URL;
const SECRET = process.env.RODSIN_SECRET;

async function getBalance(userId) {
    try {
        const res = await axios.get(`${API_URL}/balance`, { params: { user_id: userId } });
        return res.data;
    } catch (error) {
        console.error("RODSIN Balance Error:", error.response?.data);
        return { success: false, balance: 0 };
    }
}

async function deductCoins(userId, amount) {
    try {
        const res = await axios.post(`${API_URL}/deduct`, { user_id: userId, amount: amount, secret: SECRET });
        return res.data;
    } catch (error) {
        console.error("RODSIN Deduct Error:", error.response?.data);
        return error.response?.data || { success: false };
    }
}

async function awardCoins(userId, amount) {
    try {
        const res = await axios.post(`${API_URL}/award`, { user_id: userId, amount: amount, secret: SECRET });
        return res.data;
    } catch (error) {
        console.error("RODSIN Award Error:", error.response?.data);
        return { success: false };
    }
}

module.exports = { getBalance, deductCoins, awardCoins };
