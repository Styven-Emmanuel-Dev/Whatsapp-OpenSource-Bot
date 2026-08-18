function jidNumber(jid = "") {
  return jid.split("@")[0];
}

function mentionFromMessage(message) {
  const context = message?.extendedTextMessage?.contextInfo;
  return context?.mentionedJid || [];
}

function getQuotedText(message) {
  return message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation || "";
}

function parseCommand(text, prefix) {
  if (!text.startsWith(prefix)) return null;

  const raw = text.slice(prefix.length).trim();
  if (!raw) return null;

  const parts = raw.split(/\s+/);
  const command = parts.shift().toLowerCase();

  return {
    command,
    args: parts,
    text: parts.join(" ")
  };
}

function isGroup(jid) {
  return jid?.endsWith("@g.us");
}

module.exports = {
  jidNumber,
  mentionFromMessage,
  getQuotedText,
  parseCommand,
  isGroup
};
