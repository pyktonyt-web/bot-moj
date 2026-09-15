const { 
  SlashCommandBuilder, 
  PermissionFlagsBits, 
  MessageFlags, 
  ContainerBuilder, 
  TextDisplayBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder
} = require('discord.js');
const { 
  createSeparator, 
  createLogoMediaGallery, 
  getLogoAttachment, 
  createFooter,
  buildSuccessResponse,
  buildErrorResponse
} = require('../utils/componentsV2');
const { updateGuildConfig } = require('../utils/storage');
const config = require('../../config');

function buildTicketPanelContainer() {
  const tConfig = config.tickets;

  const header = new TextDisplayBuilder().setContent(
    `### [ 🏷️ ' ${tConfig.panelTitle.toUpperCase()} ]`
  );

  const description = new TextDisplayBuilder().setContent(
    `> ${tConfig.panelDescription}`
  );

  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId('ticket_category_select')
    .setPlaceholder(tConfig.placeholder);

  for (const cat of tConfig.categories) {
    selectMenu.addOptions(
      new StringSelectMenuOptionBuilder()
        .setLabel(cat.label)
        .setDescription(cat.description)
        .setValue(cat.value)
        .setEmoji(cat.emoji)
    );
  }

  const menuRow = new ActionRowBuilder().addComponents(selectMenu);

  return new ContainerBuilder()
    .setAccentColor(config.colors.primary)
    .addTextDisplayComponents(header)
    .addSeparatorComponents(createSeparator())
    .addTextDisplayComponents(description)
    .addSeparatorComponents(createSeparator())
    .addActionRowComponents(menuRow)
    .addMediaGalleryComponents(createLogoMediaGallery())
    .addSeparatorComponents(createSeparator())
    .addTextDisplayComponents(createFooter());
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticket')
    .setDescription('Zarządzanie systemem ticketów')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand(sub =>
      sub
        .setName('panel')
        .setDescription('Wysyła panel zgłoszeniowy na kanał')
        .addChannelOption(opt =>
          opt
            .setName('kanal')
            .setDescription('Kanał tekstowy')
            .setRequired(true)
        )
        .addChannelOption(opt =>
          opt
            .setName('kategoria')
            .setDescription('Kategoria na kanały ticketów')
            .setRequired(false)
        )
        .addRoleOption(opt =>
          opt
            .setName('rola_support')
            .setDescription('Rola supportu')
            .setRequired(false)
        )
    ),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const guild = interaction.guild;

    if (sub === 'panel') {
      const targetChan = interaction.options.getChannel('kanal');
      const ticketCategory = interaction.options.getChannel('kategoria');
      const supportRole = interaction.options.getRole('rola_support');

      if (!targetChan.isTextBased()) {
        return await interaction.reply(
          buildErrorResponse('Błąd', 'Kanał musi być tekstowy!')
        );
      }

      const updates = {};
      if (ticketCategory) updates.ticketCategoryId = ticketCategory.id;
      if (supportRole) updates.ticketSupportRoleId = supportRole.id;
      if (Object.keys(updates).length > 0) {
        updateGuildConfig(guild.id, updates);
      }

      const container = buildTicketPanelContainer();

      await targetChan.send({
        flags: MessageFlags.IsComponentsV2,
        components: [container],
        files: [getLogoAttachment()]
      });

      return await interaction.reply(
        buildSuccessResponse(
          'Wysłano Panel',
          `Panel ticketów wysłany na ${targetChan}.\n` +
          `${ticketCategory ? `▎ 📁 ' Kategoria: ${ticketCategory.name}\n` : ''}` +
          `${supportRole ? `▎ 🛡️ ' Rola: ${supportRole}\n` : ''}`
        )
      );
    }
  },
  buildTicketPanelContainer
};
