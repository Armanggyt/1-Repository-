const TelegramBot = require('node-telegram-bot-api');
const { exec } = require('child_process');

// Տեղադրիր քո բոտի TOKEN-ը
const TOKEN = '8779023674:AAH6kGzWFL6dCriArmWdrskLsMRk1KSOs6I';
const bot = new TelegramBot(TOKEN, { polling: true });

console.log("🚀 Բոտը պատրաստ է կառավարել հեռախոսը...");

bot.onText(/համար (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const phoneNumber = match[1];

    const opts = {
        reply_markup: {
            inline_keyboard: [
                [
                    { text: '📞 Զանգել', callback_data: `call_${phoneNumber}` },
                    { text: '💬 SMS ուղարկել', callback_data: `sms_${phoneNumber}` }
                ]
            ]
        }
    };

    bot.sendMessage(chatId, `Ի՞նչ անել ${phoneNumber} համարի հետ:`, opts);
});

bot.on('callback_query', (query) => {
    const data = query.data;
    const chatId = query.message.chat.id;

    if (data.startsWith('call_')) {
        const number = data.replace('call_', '');
        // ADB հրաման զանգահարելու համար
        exec(`adb shell am start -a android.intent.action.CALL -d tel:${number}`, (err) => {
            if (err) {
                bot.sendMessage(chatId, "❌ Սխալ՝ ADB-ն չի կարողանում զանգել:");
            } else {
                bot.sendMessage(chatId, `✅ Զանգը դեպի ${number} սկսվեց:`);
            }
        });
    }

    if (data.startsWith('sms_')) {
        const number = data.replace('sms_', '');
        // ADB հրաման SMS-ի պատուհանը բացելու համար
        exec(`adb shell am start -a android.intent.action.SENDTO -d sms:${number} --es sms_body "Barev botic"`);
        bot.sendMessage(chatId, `📝 SMS-ի պատուհանը բացվեց ${number} համարի համար:`);
    }
});