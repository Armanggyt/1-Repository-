const TelegramBot = require('node-telegram-bot-api');
const { exec } = require('child_process');

const TOKEN = 'ՔՈ_ՏՈԿԵՆԸ';
const bot = new TelegramBot(TOKEN, { polling: true });

bot.onText(/համար (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const phoneNumber = match[1];

    const opts = {
        reply_markup: {
            inline_keyboard: [
                [
                    { text: '📞 Զանգել', callback_data: `call_${phoneNumber}` },
                    { text: '💬 SMS', callback_data: `sms_${phoneNumber}` }
                ]
            ]
        }
    };

    bot.sendMessage(chatId, `Ընտրիր գործողությունը ${phoneNumber} համարի համար:`, opts);
});

// Կոճակների սեղմման մշակում
bot.on('callback_query', (query) => {
    const data = query.data;
    const chatId = query.message.chat.id;

    if (data.startsWith('call_')) {
        const number = data.replace('call_', '');
        // ADB հրաման՝ զանգահարելու համար
        exec(`adb shell am start -a android.intent.action.CALL -d tel:${number}`, (err) => {
            if (err) {
                bot.sendMessage(chatId, "❌ ADB-ն միացված չէ կամ հեռախոսը կապված չէ:");
            } else {
                bot.sendMessage(chatId, `🚀 Զանգը դեպի ${number} սկսված է:`);
            }
        });
    }

    if (data.startsWith('sms_')) {
        const number = data.replace('sms_', '');
        // ADB հրաման՝ SMS պատուհանը բացելու համար (կամ կարելի է ուղղակի ուղարկել)
        const message = "Barev, sa botic e";
        exec(`adb shell am start -a android.intent.action.SENDTO -d sms:${number} --es sms_body "${message}" --ez exit_on_sent true`);
        bot.sendMessage(chatId, `💬 SMS-ի պատուհանը բացվեց ${number}-ի համար:`);
    }
});