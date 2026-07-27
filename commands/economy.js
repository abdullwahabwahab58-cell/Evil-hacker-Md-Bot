const economy = require('../lib/economy');

const economyCommands = {
    balance: async (sock, from, msg, sender) => {
        const user = economy.getUser(sender);
        const text = `*\u{1F4B0} YOUR BALANCE*\n\n*User:* @${sender.split('@')[0]}\n*Coins:* ${user.coins} \u{1F4B2}\n*Status:* ${user.premium ? 'Premium \u{2B50}' : 'Free'}`;
        await sock.sendMessage(from, { text, mentions: [sender] }, { quoted: msg });
    },

    daily: async (sock, from, msg, sender) => {
        const user = economy.getUser(sender);
        const now = Date.now();
        const dailyTime = 24 * 60 * 60 * 1000; // 24 hours

        if (now - user.lastDaily < dailyTime) {
            const remaining = dailyTime - (now - user.lastDaily);
            const hours = Math.floor(remaining / (60 * 60 * 1000));
            const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
            return await sock.sendMessage(from, { text: `❌ You already claimed your daily coins. Come back in *${hours}h ${minutes}m*.` }, { quoted: msg });
        }

        const amount = 50;
        economy.addCoins(sender, amount);
        user.lastDaily = now;
        require('../lib/economy').saveEconomy; // Manual save trigger if needed, but addCoins already saves
        
        await sock.sendMessage(from, { text: `\u{1F381} *DAILY REWARD*\n\nYou claimed *${amount} Coins*! \nNew Balance: ${user.coins + amount} Coins` }, { quoted: msg });
    },

    addcoins: async (sock, from, msg, isOwner, args) => {
        if (!isOwner) return sock.sendMessage(from, { text: "❌ This command is only for the Owner." });
        
        const target = msg.message.extendedTextMessage?.contextInfo?.participant || args[0]?.replace('@', '') + '@s.whatsapp.net';
        const amount = parseInt(args[1]);

        if (!target || isNaN(amount)) return sock.sendMessage(from, { text: "❌ Usage: .addcoins @user amount" });

        economy.addCoins(target, amount);
        await sock.sendMessage(from, { text: `✅ Added *${amount} Coins* to @${target.split('@')[0]}`, mentions: [target] }, { quoted: msg });
    },

    leaderboard: async (sock, from, msg) => {
        const lb = economy.getLeaderboard();
        let text = `*\u{1F3C6} COINS LEADERBOARD*\n\n`;
        lb.forEach((user, i) => {
            text += `${i + 1}. @${user.id.split('@')[0]} — *${user.coins} Coins*\n`;
        });
        await sock.sendMessage(from, { text, mentions: lb.map(u => u.id) }, { quoted: msg });
    }
};

module.exports = economyCommands;
