const { 
  SlashCommandBuilder, 
  PermissionFlagsBits, 
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ChannelType
} = require('discord.js');
const { 
  buildSuccessResponse, 
  buildErrorResponse 
} = require('../utils/componentsV2');
const { updateGuildConfig } = require('../utils/storage');
const { setupStatsChannels } = require('../utils/statsUpdater');
const { buildTicketPanelContainer } = require('./ticket');
const { buildRulesContainer } = require('./regulamin');
const config = require('../../config');

function buildSetupControlPanel() {
  const embed = new EmbedBuilder()
    .setTitle('⚙️ CENTRUM KONFIGURACJI')
    .setDescription(
      'Wybierz moduł, który chcesz zarządzać lub rozstawić na serwerze.\n\n' +
      '🔐 **Weryfikacja**: Panel weryfikacji captcha.\n' +
      '📜 **Regulamin**: Oficjalne zasady Teamu Hekera.\n' +
      '🎫 **Tickety**: System zgłoszeń dla graczy.\n' +
      '🎭 **Self-Role**: Wybór ról powiadomień i platform.\n' +
      '📊 **Statystyki**: Liczniki kanałów głosowych.\n' +
      '🚀 **Auto-Setup**: Automatyczne tworzenie całej struktury.'
    )
    .setColor(config.colors.primary)
    .setFooter({ text: '© 2026 Team Hekera' });

  const row1 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('btn_setup_weryfikacja').setLabel('Weryfikacja').setStyle(ButtonStyle.Success).setEmoji('🔐'),
    new ButtonBuilder().setCustomId('btn_setup_regulamin').setLabel('Regulamin').setStyle(ButtonStyle.Primary).setEmoji('📜'),
    new ButtonBuilder().setCustomId('btn_setup_ticket').setLabel('Tickety').setStyle(ButtonStyle.Primary).setEmoji('🎫')
  );

  const row2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('btn_setup_selfrole').setLabel('Self-Role').setStyle(ButtonStyle.Secondary).setEmoji('🎭'),
    new ButtonBuilder().setCustomId('btn_setup_statystyki').setLabel('Statystyki').setStyle(ButtonStyle.Secondary).setEmoji('📊'),
    new ButtonBuilder().setCustomId('btn_setup_all').setLabel('Wszystko (Auto)').setStyle(ButtonStyle.Danger).setEmoji('🚀')
  );

  return {
    embeds: [embed],
    components: [row1, row2]
  };
}

async function executeAutoSetupAll(guild) {
  const createdChannels = [];

  const infoCat = await guild.channels.create({
    name: '📌 ── INFORMACJE ──',
    type: ChannelType.GuildCategory
  });

  const regChan = await guild.channels.create({
    name: '📜・regulamin',
    type: ChannelType.GuildText,
    parent: infoCat.id
  });
  await regChan.send(buildRulesContainer());
  createdChannels.push(`Regulamin: ${regChan}`);

  const verChan = await guild.channels.create({
    name: '🔐・weryfikacja',
    type: ChannelType.GuildText,
    parent: infoCat.id
  });

  const verifyEmbed = new EmbedBuilder()
    .setTitle('🔐 WERYFIKACJA KONTA')
    .setDescription('Kliknij przycisk poniżej, aby uzyskać dostęp do serwera.')
    .setColor(config.colors.primary);

  const verifyRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('btn_verify_start').setLabel('Rozpocznij Weryfikację').setStyle(ButtonStyle.Success).setEmoji('⚡')
  );

  await verChan.send({ embeds: [verifyEmbed], components: [verifyRow] });
  createdChannels.push(`Weryfikacja: ${verChan}`);

  const roleChan = await guild.channels.create({
    name: '🎭・wybór-ról',
    type: ChannelType.GuildText,
    parent: infoCat.id
  });

  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId('self_role_select')
    .setPlaceholder('🎭 | Wybierz role z listy...')
    .setMinValues(0)
    .setMaxValues(6);

  if (config.selfRoleCategories) {
    for (const cat of config.selfRoleCategories) {
      for (const opt of cat.options) {
        selectMenu.addOptions(
          new StringSelectMenuOptionBuilder()
            .setLabel(opt.label)
            .setDescription(opt.description)
            .setValue(opt.value)
            .setEmoji(opt.emoji)
        );
      }
    }
  }

  const roleEmbed = new EmbedBuilder()
    .setTitle('🎭 WYBÓR RÓL')
    .setDescription('Zaznacz interesujące Cię powiadomienia i platformy.')
    .setColor(config.colors.primary);

  await roleChan.send({ embeds: [roleEmbed], components: [new ActionRowBuilder().addComponents(selectMenu)] });
  createdChannels.push(`Self-Role: ${roleChan}`);

  const welcChan = await guild.channels.create({
    name: '👋・powitania',
    type: ChannelType.GuildText,
    parent: infoCat.id
  });
  createdChannels.push(`Powitania: ${welcChan}`);

  const helpCat = await guild.channels.create({
    name: '🎫 ── POMOC I TICKETY ──',
    type: ChannelType.GuildCategory
  });

  const tickChan = await guild.channels.create({
    name: '🎫・otwórz-ticket',
    type: ChannelType.GuildText,
    parent: helpCat.id
  });
  await tickChan.send(buildTicketPanelContainer());
  createdChannels.push(`Tickety: ${tickChan}`);

  const logChan = await guild.channels.create({
    name: '📑・logi-serwera',
    type: ChannelType.GuildText,
    parent: helpCat.id
  });
  createdChannels.push(`Logi: ${logChan}`);

  const statsRes = await setupStatsChannels(guild);
  createdChannels.push(`Statystyki: ${statsRes.category.name}`);

  updateGuildConfig(guild.id, {
    welcomeChannelId: welcChan.id,
    logChannelId: logChan.id,
    ticketCategoryId: helpCat.id
  });

  return createdChannels;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setup')
    .setDescription('Konfiguracja modułów bota')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(sub => sub.setName('panel').setDescription('Otwiera menu konfiguracyjne'))
    .addSubcommand(sub => sub.setName('wszystko').setDescription('Automatyczna konfiguracja serwera'))
    .addSubcommand(sub => sub.setName('regulamin').setDescription('Wysyła panel regulaminu').addChannelOption(o => o.setName('kanal').setRequired(false)))
    .addSubcommand(sub => sub.setName('ticket').setDescription('Wysyła panel ticketów').addChannelOption(o => o.setName('kanal').setRequired(false))),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand(false) || 'panel';
    const guild = interaction.guild;

    if (sub === 'panel') {
      return await interaction.reply({ ...buildSetupControlPanel(), ephemeral: true });
    }

    if (sub === 'wszystko') {
      await interaction.deferReply({ ephemeral: true });
      try {
        const results = await executeAutoSetupAll(guild);
        return await interaction.editReply(
          buildSuccessResponse(
            'Konfiguracja Zakończona',
            `Skonfigurowano serwer:\n` + results.map(r => `• ${r}`).join('\n')
          )
        );
      } catch (err) {
        return await interaction.editReply(
          buildErrorResponse('Błąd Setupu', `Wystąpił błąd: \`${err.message}\``)
        );
      }
    }

    if (sub === 'regulamin') {
      const targetChan = interaction.options.getChannel('kanal') || interaction.channel;
      await targetChan.send(buildRulesContainer());
      return await interaction.reply(buildSuccessResponse('Wdrożono Regulamin', `Wysłano na ${targetChan}.`));
    }

    if (sub === 'ticket') {
      const targetChan = interaction.options.getChannel('kanal') || interaction.channel;
      await targetChan.send(buildTicketPanelContainer());
      return await interaction.reply(buildSuccessResponse('Wysłano Ticket', `Wysłano na ${targetChan}.`));
    }
  },
  buildSetupControlPanel,
  executeAutoSetupAll
};
