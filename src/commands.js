const { parseCommand, mentionFromMessage, isGroup, jidNumber } = require("./utils");
const { sendMenu } = require("./menu");
const { getSender, isOwner, isGroupAdmin, isBotAdmin } = require("./permissions");
const { readJSON, writeJSON } = require("./database");

function registerCommands(sock, config) {
  sock.ev.on("messages.upsert", async ({ messages }) => {
    const message = messages?.[0];
    if (!message || message.key.fromMe) return;

    const jid = message.key.remoteJid;
    const text =
      message.message?.conversation ||
      message.message?.extendedTextMessage?.text ||
      "";

    const parsed = parseCommand(text.trim(), config.prefix);
    if (!parsed) return;

    const sender = getSender(message);
    const { command, args } = parsed;

    try {
      if (command === "menu" || command === "help") {
        return sendMenu(sock, jid, config);
      }

      if (command === "ping") {
        return sock.sendMessage(jid, { text: "🏓 Pong ! Bot opérationnel." });
      }

      if (command === "owner") {
        return sock.sendMessage(jid, {
          text: `👨‍💻 Owner : ${config.ownerName}`
        });
      }

      if (command === "profile") {
        return sock.sendMessage(jid, {
          text: `👤 Profil\n\n• JID : ${sender}\n• Numéro : ${jidNumber(sender)}`
        });
      }

      if (command === "userinfo") {
        const mentioned = mentionFromMessage(message)[0];
        const target = mentioned || sender;

        return sock.sendMessage(jid, {
          text: `👤 Utilisateur\n\n• JID : ${target}\n• Numéro : ${jidNumber(target)}`,
          mentions: [target]
        });
      }

      if (!isGroup(jid)) {
        if (["groupinfo", "admins", "promote", "demote", "add", "remove", "setname", "setdesc", "grouponly"].includes(command)) {
          return sock.sendMessage(jid, {
            text: "❌ Cette commande doit être utilisée dans un groupe."
          });
        }
      }

      if (command === "groupinfo") {
        const metadata = await sock.groupMetadata(jid);
        const admins = metadata.participants.filter(p => p.admin);

        return sock.sendMessage(jid, {
          text:
`👥 INFORMATIONS DU GROUPE

• Nom : ${metadata.subject}
• Membres : ${metadata.participants.length}
• Administrateurs : ${admins.length}
• ID : ${jid}`
        });
      }

      if (command === "admins") {
        const metadata = await sock.groupMetadata(jid);
        const admins = metadata.participants.filter(p => p.admin);
        const mentions = admins.map(p => p.id);

        return sock.sendMessage(jid, {
          text: "👑 Administrateurs :\n\n" + mentions.map(x => `• @${jidNumber(x)}`).join("\n"),
          mentions
        });
      }

      const groupCommands = ["promote", "demote", "add", "remove", "setname", "setdesc", "grouponly"];

      if (groupCommands.includes(command)) {
        const admin = await isGroupAdmin(sock, jid, sender);

        if (!admin && !isOwner(sender)) {
          return sock.sendMessage(jid, {
            text: "❌ Tu dois être administrateur du groupe."
          });
        }

        if (!(await isBotAdmin(sock, jid)) && ["promote", "demote", "add", "remove", "setname", "setdesc"].includes(command)) {
          return sock.sendMessage(jid, {
            text: "❌ Je dois être administrateur du groupe pour effectuer cette action."
          });
        }
      }

      if (command === "promote" || command === "demote" || command === "remove") {
        const target = mentionFromMessage(message)[0];

        if (!target) {
          return sock.sendMessage(jid, {
            text: `❌ Mentionne un utilisateur.\nExemple : ${config.prefix}${command} @user`
          });
        }

        const action = command === "promote" ? "promote" : command === "demote" ? "demote" : "remove";
        await sock.groupParticipantsUpdate(jid, [target], action);

        return sock.sendMessage(jid, {
          text: `✅ Action "${command}" effectuée sur @${jidNumber(target)}.`,
          mentions: [target]
        });
      }

      if (command === "add") {
        const number = (args[0] || "").replace(/\D/g, "");

        if (!number) {
          return sock.sendMessage(jid, {
            text: `❌ Utilise : ${config.prefix}add 24206XXXXXXXX`
          });
        }

        const target = `${number}@s.whatsapp.net`;
        await sock.groupParticipantsUpdate(jid, [target], "add");

        return sock.sendMessage(jid, {
          text: `✅ Demande d'ajout envoyée pour ${number}.`
        });
      }

      if (command === "setname") {
        if (!args.length) {
          return sock.sendMessage(jid, { text: `❌ Utilise : ${config.prefix}setname Nouveau nom` });
        }

        await sock.groupUpdateSubject(jid, args.join(" "));
        return sock.sendMessage(jid, { text: "✅ Nom du groupe modifié." });
      }

      if (command === "setdesc") {
        if (!args.length) {
          return sock.sendMessage(jid, { text: `❌ Utilise : ${config.prefix}setdesc Nouvelle description` });
        }

        await sock.groupUpdateDescription(jid, args.join(" "));
        return sock.sendMessage(jid, { text: "✅ Description du groupe modifiée." });
      }

      if (command === "grouponly") {
        const data = readJSON("groupOnly.json", {});
        data[jid] = !data[jid];
        writeJSON("groupOnly.json", data);

        return sock.sendMessage(jid, {
          text: `🛡️ Mode groupe : ${data[jid] ? "ACTIVÉ" : "DÉSACTIVÉ"}`
        });
      }
    } catch (error) {
      console.error(`Commande ${command}:`, error);
      await sock.sendMessage(jid, {
        text: "❌ Une erreur est survenue pendant l'exécution de la commande."
      }).catch(() => {});
    }
  });
}

module.exports = { registerCommands };
