const { 
  SlashCommandBuilder, 
  MessageFlags, 
  ContainerBuilder, 
  ChannelType
} = require('discord.js');
const { 
  createSeparator, 
  createHeader, 
  createCallout, 
  createSectionWithThumbnail, 
  createLogoMediaGallery, 
  getLogoAttachment, 
  createFooter 
} = require('../utils/componentsV2');
const config = require('../../config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('statystyki')
    .setDescription('Wyświetla statystyki i informacje o serwerze'),

  async execute(interaction) {
    const guild = interaction.guild;
    const members = await guild.members.fetch().catch(() => guild.members.cache);
    const totalCount = guild.memberCount;
    const botCount = members.filter(m => m.user.bot).size;
    const humanCount = totalCount - botCount;
    const onlineCount = members.filter(m => m.presence && m.presence.status !== 'offline').size;

    const textChannels = guild.channels.cache.filter(c => c.type === ChannelType.GuildText).size;
    const voiceChannels = guild.channels.cache.filter(c => c.type === ChannelType.GuildVoice).size;
    const rolesCount = guild.roles.cache.size;

    const createdSec = Math.floor(guild.createdTimestamp / 1000);
    const ping = interaction.client.ws.ping;
    const iconUrl = guild.iconURL({ extension: 'png', size: 256 }) || 'https://cdn.discordapp.com/embed/avatars/0.png';

    const infoLines = [
      `▎ 👑 ' **Właściciel:** <@${guild.ownerId}>`,
      `▎ 📅 ' **Data utworzenia:** <t:${createdSec}:D> (<t:${createdSec}:R>)`,
      `▎ ⚡ ' **Ping:** \`${ping}ms\``,
      `▎ 💎 ' **Boosty:** Poziom ${guild.premiumTier} (${guild.premiumSubscriptionCount || 0})`
    ];
    const infoSection = createSectionWithThumbnail(infoLines, iconUrl);

    const stat1 = createCallout('👥', 'Użytkownicy', `Wszyscy: **${totalCount}** | Ludzie: **${humanCount}** | Boty: **${botCount}**`);
    const stat2 = createCallout('🟢', 'Aktywność', `Online: **${onlineCount > 0 ? onlineCount : 'Synchronizacja'}**`);
    const stat3 = createCallout('📂', 'Kanały i Role', `Tekst: **${textChannels}** | Voice: **${voiceChannels}** | Role: **${rolesCount}**`);

    const container = new ContainerBuilder()
      .setAccentColor(config.colors.primary)
      .addTextDisplayComponents(createHeader(`STATYSTYKI × ${guild.name}`, '📊'))
      .addSectionComponents(infoSection)
      .addSeparatorComponents(createSeparator())
      .addTextDisplayComponents(stat1, stat2, stat3)
      .addSeparatorComponents(createSeparator())
      .addMediaGalleryComponents(createLogoMediaGallery())
      .addTextDisplayComponents(createFooter());

    return await interaction.reply({
      flags: MessageFlags.IsComponentsV2,
      components: [container],
      files: [getLogoAttachment()]
    });
  }
};
