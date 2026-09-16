const { PermissionFlagsBits, ChannelType } = require('discord.js');
const { getGuildConfig, updateGuildConfig } = require('./storage');
const config = require('../../config');

const lastUpdateMap = new Map();

async function updateServerStats(guild) {
  if (!guild) return;

  const now = Date.now();
  const lastRun = lastUpdateMap.get(guild.id) || 0;
  if (now - lastRun < 5 * 60 * 1000) {
    return;
  }

  const guildConf = getGuildConfig(guild.id);
  if (!guildConf?.statsChannels) return;

  const { members, bots, bans, newest, total } = guildConf.statsChannels;
  if (!members && !bots && !bans && !newest && !total) return;

  try {
    const guildMembers = await guild.members.fetch().catch(() => guild.members.cache);
    const totalCount = guild.memberCount;
    const botCount = guildMembers.filter(m => m.user.bot).size;
    const humanCount = totalCount - botCount;
    const bansCount = await guild.bans.fetch().then(b => b.size).catch(() => 0);

    const newestMember = guildMembers
      .filter(m => !m.user.bot && m.joinedTimestamp)
      .sort((a, b) => b.joinedTimestamp - a.joinedTimestamp)
      .first();

    let newestName = newestMember ? (newestMember.user.globalName || newestMember.user.username) : 'Brak';
    if (newestName.length > 10) {
      newestName = newestName.slice(0, 9) + '...';
    }

    const prefixes = config.statsLayout || {
      prefixMembers: 'Widzowie 🧒 : ',
      prefixBots: 'Boty 🤖 : ',
      prefixBans: 'Bany 🔨 : ',
      prefixNewest: 'Nowy ✨ : '
    };

    if (members) {
      const channel = guild.channels.cache.get(members) || await guild.channels.fetch(members).catch(() => null);
      if (channel) {
        const newName = `${prefixes.prefixMembers}${humanCount}`;
        if (channel.name !== newName) {
          await channel.setName(newName).catch(() => {});
        }
      }
    }

    if (bots) {
      const channel = guild.channels.cache.get(bots) || await guild.channels.fetch(bots).catch(() => null);
      if (channel) {
        const newName = `${prefixes.prefixBots}${botCount}`;
        if (channel.name !== newName) {
          await channel.setName(newName).catch(() => {});
        }
      }
    }

    if (bans) {
      const channel = guild.channels.cache.get(bans) || await guild.channels.fetch(bans).catch(() => null);
      if (channel) {
        const newName = `${prefixes.prefixBans}${bansCount}`;
        if (channel.name !== newName) {
          await channel.setName(newName).catch(() => {});
        }
      }
    }

    if (newest) {
      const channel = guild.channels.cache.get(newest) || await guild.channels.fetch(newest).catch(() => null);
      if (channel) {
        const newName = `${prefixes.prefixNewest}${newestName}`;
        if (channel.name !== newName) {
          await channel.setName(newName).catch(() => {});
        }
      }
    }

    lastUpdateMap.set(guild.id, now);
  } catch (err) {
    console.error(`Błąd aktualizacji statystyk (${guild.id}):`, err.message);
  }
}

async function setupStatsChannels(guild) {
  const everyoneRole = guild.roles.everyone;

  const categoryName = config.statsLayout?.categoryName || '📈 | ----statystyki----';
  const prefixes = config.statsLayout || {
    prefixMembers: 'Widzowie 🧒 : ',
    prefixBots: 'Boty 🤖 : ',
    prefixBans: 'Bany 🔨 : ',
    prefixNewest: 'Nowy ✨ : '
  };

  const category = await guild.channels.create({
    name: categoryName,
    type: ChannelType.GuildCategory,
    permissionOverwrites: [
      {
        id: everyoneRole.id,
        deny: [PermissionFlagsBits.Connect],
        allow: [PermissionFlagsBits.ViewChannel]
      }
    ]
  });

  const guildMembers = await guild.members.fetch().catch(() => guild.members.cache);
  const totalCount = guild.memberCount;
  const botCount = guildMembers.filter(m => m.user.bot).size;
  const humanCount = totalCount - botCount;
  const bansCount = await guild.bans.fetch().then(b => b.size).catch(() => 0);

  const newestMember = guildMembers
    .filter(m => !m.user.bot && m.joinedTimestamp)
    .sort((a, b) => b.joinedTimestamp - a.joinedTimestamp)
    .first();

  let newestName = newestMember ? (newestMember.user.globalName || newestMember.user.username) : 'Brak';
  if (newestName.length > 10) {
    newestName = newestName.slice(0, 9) + '...';
  }

  const membersChan = await guild.channels.create({
    name: `${prefixes.prefixMembers}${humanCount}`,
    type: ChannelType.GuildVoice,
    parent: category.id,
    permissionOverwrites: [
      {
        id: everyoneRole.id,
        deny: [PermissionFlagsBits.Connect],
        allow: [PermissionFlagsBits.ViewChannel]
      }
    ]
  });

  const botsChan = await guild.channels.create({
    name: `${prefixes.prefixBots}${botCount}`,
    type: ChannelType.GuildVoice,
    parent: category.id,
    permissionOverwrites: [
      {
        id: everyoneRole.id,
        deny: [PermissionFlagsBits.Connect],
        allow: [PermissionFlagsBits.ViewChannel]
      }
    ]
  });

  const bansChan = await guild.channels.create({
    name: `${prefixes.prefixBans}${bansCount}`,
    type: ChannelType.GuildVoice,
    parent: category.id,
    permissionOverwrites: [
      {
        id: everyoneRole.id,
        deny: [PermissionFlagsBits.Connect],
        allow: [PermissionFlagsBits.ViewChannel]
      }
    ]
  });

  const newestChan = await guild.channels.create({
    name: `${prefixes.prefixNewest}${newestName}`,
    type: ChannelType.GuildVoice,
    parent: category.id,
    permissionOverwrites: [
      {
        id: everyoneRole.id,
        deny: [PermissionFlagsBits.Connect],
        allow: [PermissionFlagsBits.ViewChannel]
      }
    ]
  });

  updateGuildConfig(guild.id, {
    statsCategoryId: category.id,
    statsChannels: {
      members: membersChan.id,
      bots: botsChan.id,
      bans: bansChan.id,
      newest: newestChan.id
    }
  });

  lastUpdateMap.set(guild.id, Date.now());

  return {
    category,
    membersChan,
    botsChan,
    bansChan,
    newestChan
  };
}

module.exports = {
  updateServerStats,
  setupStatsChannels
};
