const { jidNumber } = require("./utils");

function getSender(message) {
  return message.key.participant || message.key.remoteJid;
}

function isOwner(sender) {
  const owners = (process.env.OWNER_NUMBERS || "")
    .split(",")
    .map(x => x.replace(/\D/g, ""))
    .filter(Boolean);

  return owners.includes(jidNumber(sender));
}

async function isGroupAdmin(sock, jid, sender) {
  try {
    const metadata = await sock.groupMetadata(jid);
    const participant = metadata.participants.find(p => p.id === sender);
    return !!participant && ["admin", "superadmin"].includes(participant.admin);
  } catch {
    return false;
  }
}

async function isBotAdmin(sock, jid) {
  try {
    const metadata = await sock.groupMetadata(jid);
    const botId = sock.user?.id;
    const participant = metadata.participants.find(p => p.id === botId);
    return !!participant && ["admin", "superadmin"].includes(participant.admin);
  } catch {
    return false;
  }
}

module.exports = {
  getSender,
  isOwner,
  isGroupAdmin,
  isBotAdmin
};
