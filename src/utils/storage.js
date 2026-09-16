const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../../data/database.json');
const WARN_PATH = path.join(__dirname, '../../data/warnings.json');

function readJson(filePath, defaultValue = {}) {
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(defaultValue, null, 2), 'utf-8');
      return defaultValue;
    }
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data || '{}');
  } catch (err) {
    console.error(`Błąd odczytu ${filePath}:`, err.message);
    return defaultValue;
  }
}

function writeJson(filePath, data) {
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error(`Błąd zapisu ${filePath}:`, err.message);
    return false;
  }
}

function getGuildConfig(guildId) {
  const db = readJson(DB_PATH, { guilds: {} });
  if (!db.guilds) db.guilds = {};
  if (!db.guilds[guildId]) {
    db.guilds[guildId] = {
      welcomeChannelId: null,
      goodbyeChannelId: null,
      logChannelId: null,
      verifiedRoleId: null,
      unverifiedRoleId: null,
      statsCategoryId: null,
      statsChannels: {
        total: null,
        members: null,
        bots: null,
        online: null
      },
      selfRoleMapping: {}
    };
    writeJson(DB_PATH, db);
  }
  return db.guilds[guildId];
}

function updateGuildConfig(guildId, updates) {
  const db = readJson(DB_PATH, { guilds: {} });
  if (!db.guilds) db.guilds = {};
  db.guilds[guildId] = {
    ...getGuildConfig(guildId),
    ...updates
  };
  writeJson(DB_PATH, db);
  return db.guilds[guildId];
}

function getWarnings(guildId, userId) {
  const allWarns = readJson(WARN_PATH, {});
  const key = `${guildId}_${userId}`;
  return allWarns[key] || [];
}

function addWarning(guildId, userId, warningData) {
  const allWarns = readJson(WARN_PATH, {});
  const key = `${guildId}_${userId}`;
  if (!allWarns[key]) allWarns[key] = [];
  
  const record = {
    id: Date.now().toString(36).toUpperCase(),
    reason: warningData.reason || 'Brak podanego powodu',
    moderatorId: warningData.moderatorId,
    timestamp: Date.now()
  };

  allWarns[key].push(record);
  writeJson(WARN_PATH, allWarns);
  return record;
}

function clearWarnings(guildId, userId) {
  const allWarns = readJson(WARN_PATH, {});
  const key = `${guildId}_${userId}`;
  const count = (allWarns[key] || []).length;
  delete allWarns[key];
  writeJson(WARN_PATH, allWarns);
  return count;
}

module.exports = {
  getGuildConfig,
  updateGuildConfig,
  getWarnings,
  addWarning,
  clearWarnings
};
