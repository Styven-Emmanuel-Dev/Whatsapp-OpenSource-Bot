require("dotenv").config();

const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore
} = require("@whiskeysockets/baileys");
const P = require("pino");
const readline = require("readline");
const fs = require("fs");
const path = require("path");
const {
  PREFIX,
  BOT_NAME,
  OWNER_NAME,
  MENU_IMAGE_URL
} = require("./src/config");
const { registerCommands } = require("./src/commands");

const SESSION_DIR = path.join(__dirname, "sessions");

function ask(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  return new Promise(resolve => rl.question(question, answer => {
    rl.close();
    resolve(answer.trim());
  }));
}

async function startBot() {
  if (!fs.existsSync(SESSION_DIR)) {
    fs.mkdirSync(SESSION_DIR, { recursive: true });
  }

  const { state, saveCreds } = await useMultiFileAuthState(SESSION_DIR);
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    logger: P({ level: "silent" }),
    printQRInTerminal: false,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, P({ level: "silent" }))
    },
    browser: [BOT_NAME, "Chrome", "1.0.0"],
    generateHighQualityLinkPreview: true,
    markOnlineOnConnect: false
  });

  sock.ev.on("creds.update", saveCreds);

  if (!sock.authState?.creds?.registered) {
    const phone = process.env.PHONE_NUMBER || await ask("Numéro WhatsApp (+ retiré) : ");
    const cleanPhone = phone.replace(/\D/g, "");

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      const code = await sock.requestPairingCode(cleanPhone);
      console.log("\n========================================");
      console.log("       STYVEN WHATSAPP BOT");
      console.log("       Pairing Code: " + code);
      console.log("========================================\n");
    } catch (error) {
      console.error("Impossible de générer le pairing code :", error.message);
    }
  }

  registerCommands(sock, {
    prefix: PREFIX,
    botName: BOT_NAME,
    ownerName: OWNER_NAME,
    menuImageUrl: MENU_IMAGE_URL
  });

  sock.ev.on("connection.update", ({ connection, lastDisconnect }) => {
    if (connection === "open") {
      console.log(`[${BOT_NAME}] Connecté avec succès.`);
    }

    if (connection === "close") {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

      console.log("Connexion fermée.", shouldReconnect ? "Reconnexion..." : "Session déconnectée.");

      if (shouldReconnect) {
        setTimeout(startBot, 3000);
      }
    }
  });
}

startBot().catch(error => {
  console.error("Erreur fatale :", error);
});
