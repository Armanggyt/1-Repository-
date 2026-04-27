const TelegramBot = require('node-telegram-bot-api');
const { exec } = require('child_process');

const TOKEN = '8622820107:AAFwVrD1OxvISSmYGkDFjsTj5sdo6ixpslQ';
const bot = new TelegramBot(TOKEN, { polling: true });

// Քո ծրագրերի ուղիները (Paths)
// ՈՒՇԱԴՐՈՒԹՅՈՒՆ. Պետք է ստուգես, որ այս ուղիները ճիշտ են քո համակարգչում
const apps = {
    'pubg': '"C:\\Program Files (x86)\\Steam\\steamapps\\common\\PUBG\\TslGame\\Binaries\\Win64\\TslGame.exe"',
    'cs': '"C:\\Program Files (x86)\\Steam\\steam.exe" -applaunch 730',
    'roblox': 'start roblox://',
    'capcut': 'start capcut',
    'steam': 'start steam://'
};

console.log("🎮 Համակարգչի կառավարման բոտը պատրաստ է...");

bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text.toLowerCase();

    // 1. Համակարգչի ԱՆՋԱՏՈՒՄ
    if (text === 'անջատել համակարգիչը') {
        bot.sendMessage(chatId, "⚠️ Համակարգիչը կանջատվի 30 վայրկյանից:");
        exec('shutdown /s /t 30');
    }

    // 2. Անջատման ՉԵՂԱՐԿՈՒՄ
    if (text === 'չեղարկել') {
        exec('shutdown /a');
        bot.sendMessage(chatId, "✅ Անջատումը չեղարկվեց:");
    }

    // 3. Ծրագրերի ՄԻԱՑՈՒՄ
    if (text.startsWith('բացիր ')) {
        const appName = text.replace('բացիր ', '').trim();

        if (apps[appName]) {
            exec(apps[appName], (err) => {
                if (err) {
                    bot.sendMessage(chatId, `❌ Չհաջողվեց բացել ${appName}-ը:`);
                } else {
                    bot.sendMessage(chatId, `✅ ${appName}-ը միացված է:`);
                }
            });
        } else {
            bot.sendMessage(chatId, "❓ Այդ ծրագիրը ցուցակում չկա: Կարող ես գրել 'բացիր pubg' կամ 'բացիր cs':");
        }
    }
});