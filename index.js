import makeWASocket, { useSingleFileAuthState, fetchLatestBaileysVersion, delay } from '@whiskeysockets/baileys';
import { getEconomicNews, getCryptoEvents, getCryptoNews, getLatestEconomicHeadlines } from './newsFetcher.js';
import { generateDetailedSummary } from './newsHelper.js';
import fs from 'fs';
import { Boom } from '@hapi/boom';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const { state, saveState } = useSingleFileAuthState(path.join(__dirname, 'auth_info.json'));
const config = JSON.parse(fs.readFileSync('config.json'));

const sentTitlesFile = path.join(__dirname, 'sent_titles.json');
let sentTitles = new Set();

if (fs.existsSync(sentTitlesFile)) {
  try {
    const data = JSON.parse(fs.readFileSync(sentTitlesFile));
    sentTitles = new Set(data);
  } catch (err) {
    console.error("Failed to load sent_titles.json:", err.message);
  }
}

async function saveSentTitles() {
  fs.writeFileSync(sentTitlesFile, JSON.stringify([...sentTitles]));
}

async function startBot() {
  const { version } = await fetchLatestBaileysVersion();
  const sock = makeWASocket({
    version,
    auth: state,
    printQRInTerminal: true
  });

sock.ev.on('messages.upsert', async ({ messages }) => {
  const msg = messages[0];
  console.log("Chat ID:", msg.key.remoteJid);
});

  sock.ev.on('creds.update', saveState);

  async function sendNews() {
    try {
      const [forexNews, cryptoEvents, cryptoNews, econHeadlines] = await Promise.all([
        getEconomicNews(),
        getCryptoEvents(),
        getCryptoNews(),
        getLatestEconomicHeadlines()
      ]);

      let msg = `*📅 ECONOMIC & CRYPTO NEWS UPDATE*\n\n`;

      if (forexNews.length > 0) {
        msg += "🟡🔴 *Medium & High Impact Forex News:*
";
        forexNews.forEach(item => {
          msg += `🕒 *${item.time}* | 💥 *${item.currency}*
📌 ${item.event}
📉 Forecast: ${item.forecast} | Previous: ${item.previous}

`;
        });
      }

      if (cryptoEvents.length > 0) {
        msg += "📌 *Upcoming Crypto Events:*
";
        cryptoEvents.forEach(ev => {
          msg += `🪙 ${ev.coin} | ${ev.date}
📌 ${ev.title}
🔗 ${ev.proof}

`;
        });
      }

      if (cryptoNews.length > 0) {
        msg += "📰 *Top Crypto Headlines:*
";
        cryptoNews.forEach(news => {
          if (!sentTitles.has(news.title)) {
            msg += `• ${news.title}
🔗 ${news.link}
`;
            sentTitles.add(news.title);
          }
        });
      }

      if (msg.includes("📰") || msg.includes("🟡🔴") || msg.includes("📌")) {
        await sock.sendMessage(config.target, { text: msg });
      }

      for (const item of econHeadlines) {
        if (!sentTitles.has(item.title)) {
          await sock.sendMessage(config.target, {
          image: { url: item.image },
          caption: generateDetailedSummary(item.title, item.desc, item.link)
        });
          sentTitles.add(item.title);
          await delay(1000);
        }
      }

      await saveSentTitles();

    } catch (err) {
      console.error("Failed to fetch or send news:", err.message);
    }
  }

  await delay(5000);
  await sendNews();
  setInterval(sendNews, config.interval);
}

startBot();
