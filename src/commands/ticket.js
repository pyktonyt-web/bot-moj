const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { buildSuccessResponse, buildErrorResponse } = require('../utils/componentsV2');

function buildTicketPanelContainer() {
  const embed = new EmbedBuilder()
    .setTitle('🎫 Centrum Zgłoszeń (Tickety)')
    .setDescription(
      'Potrzebujesz pomocy, masz pytanie lub chcesz zgłosić problem?\n\n' +
      '> 🚀 **Kliknij przycisk poniżej**, aby otworzyć prywatny kanał zgłoszeniowy z administracją.\n' +
      '> ⚠️ Tworzenie zgłoszeń bez uzasadnionego powodu jest zabronione!'
    )
    .setColor('#5865F2')
    .setFooter({ text: '© 2026 Team Hekera' });

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('btn_create_ticket')
      .setLabel('Otwórz Ticket')
      .setStyle(ButtonStyle.Primary)
      .setEmoji('🎫')
  );

  return {
    embeds: [embed],
    components: [row]
  };
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticket')
    .setDescription('Wysyła panel zgłoszeń')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addChannelOption(opt =>
      opt.setName('kanal').setDescription('Kanał docelowy').setRequired(false)
    ),

  async execute(interaction) {
    const targetChan = interaction.options.getChannel('kanal') || interaction.channel;

    if (!targetChan.isTextBased()) {
      return await interaction.reply(buildErrorResponse('Błąd', 'Kanał musi być tekstowy!'));
    }

    const payload = buildTicketPanelContainer();
    await targetChan.send(payload);

    return await interaction.reply(
      buildSuccessResponse('Wysłano Panel', `Panel ticketów został wysłany na kanał ${targetChan}.`)
    );
  },
  buildTicketPanelContainer
};
