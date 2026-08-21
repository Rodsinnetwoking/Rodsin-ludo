const axios = require('axios');
const BASE = 'https://rodsin.totalh.net';
const KEY = 'rodsin_secret_2026';

exports.getBalance = async (userId) => {
    const res = await axios.get(`${BASE}/rodsin-balance.php?user_id=${userId}&key=${KEY}`, {timeout: 10000});
    return res.data;
};
exports.deductCoins = async (userId, amount) => {
    const res = await axios.post(`${BASE}/rodsin-deduct.php?user_id=${userId}&amount=${amount}&key=${KEY}`, {}, {timeout: 10000});
    return res.data;
};
exports.awardCoins = async (userId, amount) => {
    const res = await axios.post(`${BASE}/rodsin-award.php?user_id=${userId}&amount=${amount}&key=${KEY}`, {}, {timeout: 10000});
    return res.data;
};
