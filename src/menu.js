async function sendMenu(sock, jid, config) {
  const text = `
╭━━━〔 ${config.botName} 〕━━━╮
┃
┃ 👋 Bonjour !
┃ 👨‍💻 Créé par : ${config.ownerName}
┃ ⚡ Préfixe : ${config.prefix}
┃
┣━━〔 GÉNÉRAL〕━━
┃ ${config.prefix}menu
┃ ${config.prefix}help
┃ ${config.prefix}ping
┃ ${config.prefix}owner
┃
┣━━〔 GROUPE 〕━━
┃ ${config.prefix}groupinfo
┃ ${config.prefix}admins
┃ ${config.prefix}promote @user
┃ ${config.prefix}demote @user
┃ ${config.prefix}add numéro
┃ ${config.prefix}remove @user
┃ ${config.prefix}setname nom
┃ ${config.prefix}setdesc texte
┃ ${config.prefix}grouponly
┃
┣━━〔 UTILISATEUR 〕━━
┃ ${config.prefix}profile
┃ ${config.prefix}userinfo @user
┃
╰━━━━━━━━━━━━━━━━━━╯

© ${config.ownerName}
`.trim();

  if (config.menuImageUrl) {
    try {
      await sock.sendMessage(jid, {
        image: { url: config.menuImageUrl },
        caption: text
      });
      return;
    } catch (error) {
      console.log("Image du menu indisponible, envoi texte.");
    }
  }

  await sock.sendMessage(jid, { text });
}

module.exports = { sendMenu };
