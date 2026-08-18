const fs = require("fs");
const path = require("path");

const DB_DIR = path.join(__dirname, "..", "database");

function ensure() {
  if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });
}

function file(name) {
  ensure();
  return path.join(DB_DIR, name);
}

function readJSON(name, fallback) {
  const target = file(name);
  if (!fs.existsSync(target)) {
    fs.writeFileSync(target, JSON.stringify(fallback, null, 2));
    return fallback;
  }

  try {
    return JSON.parse(fs.readFileSync(target, "utf8"));
  } catch {
    return fallback;
  }
}

function writeJSON(name, data) {
  fs.writeFileSync(file(name), JSON.stringify(data, null, 2));
}

module.exports = { readJSON, writeJSON };
