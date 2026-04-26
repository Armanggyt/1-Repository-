const TelegramBot = require('node-telegram-bot-api');
const gTTS = require('gtts'); // Ձայնի գրադարանը
const fs = require('fs');

const TOKEN = '8779023674:AAH6kGzWFL6dCriArmWdrskLsMRk1KSOs6I';
const bot = new TelegramBot(TOKEN, { polling: true });

console.log("🚀 Ձայնային հիշեցնող բոտը միացված է...");

bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (!text || text.startsWith('/')) return;

    const parts = text.split(' ');
    if (parts.length < 3) return;

    const duration = parseInt(parts[0]);
    const unit = parts[1].toLowerCase();
    const task = parts.slice(2).join(' ');

    let milliseconds = 0;
    if (unit.includes('վայրկյան')) milliseconds = duration * 1000;
    else if (unit.includes('րոպե')) milliseconds = duration * 60 * 1000;
    else if (unit.includes('ժամ')) milliseconds = duration * 60 * 60 * 1000;

    if (isNaN(duration) || milliseconds === 0) return;

    bot.sendMessage(chatId, `✅ Հիշեցումը սահմանվեց։ ${duration} ${unit} հետո ես կխոսեմ քեզ հետ։`);

    // Սպասում ենք նշված ժամանակին
    setTimeout(() => {
        // Ստեղծում ենք ձայնային ֆայլը
        const gtts = new gTTS(`Հիշեցում։ ${task}`, 'hy'); // 'hy' նշանակում է հայերեն
        const fileName = `reminder_${chatId}.mp3`;

        gtts.save(fileName, function (err, result) {
            if (err) {
                bot.sendMessage(chatId, `🔔 ՀԻՇԵՑՈՒՄ: ${task}`);
                return;
            }
            // Ուղարկում ենք ձայնային հաղորդագրությունը
            bot.sendVoice(chatId, fileName).then(() => {
                fs.unlinkSync(fileName); // Ուղարկելուց հետո ջնջում ենք ֆայլը սերվերից
            });
        });
    }, milliseconds);
});