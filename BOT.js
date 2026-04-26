const TelegramBot = require('node-telegram-bot-api');
const { exec } = require('child_process');
const screenshot = require('screenshot-desktop');
const NodeWebcam = require('node-webcam');
const fs = require('fs');

const TOKEN = '8779023674:AAH6kGzWFL6dCriArmWdrskLsMRk1KSOs6I';
const bot = new TelegramBot(TOKEN, { polling: true });

// Տեսախցիկի կարգավորում
const webcam = NodeWebcam.create({
    width: 1280, height: 720, quality: 100,
    saveShots: true, output: "jpeg", device: false, callbackReturn: "location"
});

console.log("🌟 Իդեալական Համակարգը Միացված է...");

const mainMenu = {
    reply_markup: {
        keyboard: [
            ['👁️ Տեսնել Սենյակը', '🖥️ Էկրանի Վիճակը'],
            ['🔊 Ասել Բարձր', '📊 Համակարգի Առողջություն'],
            ['🔒 Գաղտնի Ռեժիմ', '🛑 Անջատել Ամեն Ինչ']
        ],
        resize_keyboard: true
    }
};

bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, "🤖 Ես քո տան և համակարգչի պահապանն եմ։ Հրամայիր՝ ինչ անել։", mainMenu);
});

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    switch (text) {
        // 1. Տեսախցիկ (Սենյակի վերահսկողություն)
        case '👁️ Տեսնել Սենյակը':
            bot.sendMessage(chatId, "📸 Միացնում եմ տեսախցիկը...");
            webcam.capture("room_shot", (err, location) => {
                if (!err) bot.sendPhoto(chatId, location, { caption: "🏠 Քո սենյակի վիճակը հիմա" });
                else bot.sendMessage(chatId, "❌ Տեսախցիկը զբաղված է կամ անջատված:");
            });
            break;

        // 2. Էկրանի վերահսկողություն
        case '🖥️ Էկրանի Վիճակը':
            screenshot().then((img) => {
                fs.writeFileSync('pc_screen.png', img);
                bot.sendPhoto(chatId, 'pc_screen.png', { caption: "🖥️ Քո համակարգչի էկրանը" });
            });
            break;

        // 3. Ձայնային կապ (Համակարգիչը խոսում է քո ձայնով)
        case '🔊 Ասել Բարձր':
            bot.sendMessage(chatId, "Գրիր հրամանը այսպես՝ Say: Բարև ձեզ");
            break;

        // 4. Համակարգի Առողջություն (CPU, RAM, Ջերմաստիճան)
        case '📊 Համակարգի Առողջություն':
            exec('powershell "Get-WmiObject Win32_Processor | Select-Object -ExpandProperty LoadPercentage"', (err, cpu) => {
                exec('powershell "Get-WmiObject Win32_OperatingSystem | Select-Object -ExpandProperty FreePhysicalMemory"', (err, mem) => {
                    const info = `💻 CPU Ծանրաբեռնվածություն: ${cpu.trim()}%\n🧠 Ազատ հիշողություն: ${(mem/1024).toFixed(0)} MB`;
                    bot.sendMessage(chatId, info);
                });
            });
            break;

        // 5. Գաղտնի ռեժիմ (Անջատում է էկրանը և կողպում)
        case '🔒 Գաղտնի Ռեժիմ':
            bot.sendMessage(chatId, "🕵️‍♂️ Գաղտնի ռեժիմ միացված է։ Էկրանը հանգչում է...");
            exec('powershell (Add-Type \'[DllImport(\"user32.dll\")]public static extern int SendMessage(int hWnd, int hMsg, int wParam, int lParam);\' -Name a -Passthru)::SendMessage(-1, 0x0112, 0xF170, 2)');
            exec('rundll32.exe user32.dll,LockWorkStation');
            break;
    }
});

// Խոսելու ֆունկցիան
bot.onText(/Say: (.+)/, (msg, match) => {
    const message = match[1];
    exec(`powershell Add-Type -AssemblyName System.Speech; (New-Object System.Speech.Synthesis.SpeechSynthesizer).Speak('${message}')`);
    bot.sendMessage(msg.chat.id, `📣 Արտաբերվեց բարձրախոսով`);
});