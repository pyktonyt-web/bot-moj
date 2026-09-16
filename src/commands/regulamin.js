const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('regulamin')
    .setDescription('Wysyła oficjalny regulamin (tryb awaryjny)')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle('📜 Regulamin Serwera')
      .setDescription('1. Przestrzegaj zasad Discorda.\n2. Bądź uprzejmy.\n3. Zakaz spamu.')
      .setColor('#5865F2');

    return await interaction.reply({
      embeds: [embed],
      ephemeral: true
    });
  }
};
