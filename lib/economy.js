const fs = require('fs-extra');
const path = require('path');

const ECONOMY_FILE = path.join(__dirname, '../data/economy.json');
fs.ensureDirSync(path.join(__dirname, '../data'));

let economyData = {};
if (fs.existsSync(ECONOMY_FILE)) {
    try {
        economyData = fs.readJsonSync(ECONOMY_FILE);
    } catch (e) {
        economyData = {};
    }
}

function saveEconomy() {
    fs.writeJsonSync(ECONOMY_FILE, economyData);
}

const economy = {
    getUser: (userId) => {
        if (!economyData[userId]) {
            economyData[userId] = {
                coins: 100, // Initial free coins
                premium: false,
                commandsUsed: 0,
                lastDaily: 0
            };
            saveEconomy();
        }
        return economyData[userId];
    },

    addCoins: (userId, amount) => {
        const user = economy.getUser(userId);
        user.coins += amount;
        saveEconomy();
        return user.coins;
    },

    deductCoins: (userId, amount) => {
        const user = economy.getUser(userId);
        if (user.coins < amount) return false;
        user.coins -= amount;
        saveEconomy();
        return true;
    },

    setPremium: (userId, status) => {
        const user = economy.getUser(userId);
        user.premium = status;
        saveEconomy();
    },

    getLeaderboard: () => {
        return Object.entries(economyData)
            .map(([id, data]) => ({ id, coins: data.coins }))
            .sort((a, b) => b.coins - a.coins)
            .slice(0, 10);
    }
};

module.exports = economy;
