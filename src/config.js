require("dotenv").config();

module.exports = {
  PREFIX: process.env.PREFIX || "!",
  BOT_NAME: process.env.BOT_NAME || "Styven WhatsApp Bot",
  OWNER_NAME: process.env.OWNER_NAME || "Styven Emmanuel",
  MENU_IMAGE_URL: process.env.MENU_IMAGE_URL || ""
};
