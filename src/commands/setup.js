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
      'Wybierz moduł, którym chcesz zarządzać lub rozstawić na serwerze.\n\n' +
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
    .setDescription('Aby uzyskać dostęp do serwera, kliknij przycisk poniżej i przepisz kod.')
    .setColor(config.colors.primary);

  const verifyRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('btn_verify_start').setLabel('Rozpocznij Weryfikację').setStyle(ButtonStyle.Success).setEmoji('🔐')
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
    .setDescription('Zaznacz interesujące Cię powiadomienia oraz platformy.')
    .setColor(config.colors.primary);

  await roleChan.send({ 
    embeds: [roleEmbed], 
    components: [new ActionRowBuilder().addComponents(selectMenu)] 
  });
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
    .addSubcommand(sub => sub.setName('panel').setDescription('Otwiera menu konfiguracyjne bota'))
    .addSubcommand(sub => sub.setName('wszystko').setDescription('Automatyczna konfiguracja serwera'))
    .addSubcommand(sub =>
      sub
        .setName('weryfikacja')
        .setDescription('Wysyła panel weryfikacji')
        .addChannelOption(opt => opt.setName('kanal').setDescription('Kanał tekstowy').setRequired(false))
        .addRoleOption(opt => opt.setName('rola_zweryfikowany').setDescription('Rola po weryfikacji').setRequired(false))
    )
    .addSubcommand(sub =>
      sub
        .setName('regulamin')
        .setDescription('Wysyła panel regulaminu')
        .addChannelOption(opt => opt.setName('kanal').setDescription('Kanał tekstowy').setRequired(false))
    )
    .addSubcommand(sub =>
      sub
        .setName('selfrole')
        .setDescription('Wysyła panel ról')
        .addChannelOption(opt => opt.setName('kanal').setDescription('Kanał tekstowy').setRequired(false))
    )
    .addSubcommand(sub =>
      sub
        .setName('statystyki')
        .setDescription('Tworzy liczniki statystyk')
    )
    .addSubcommand(sub =>
      sub
        .setName('powitania')
        .setDescription('Ustawia kanały powitań i pożegnań')
        .addChannelOption(opt => opt.setName('kanal_powitan').setDescription('Kanał powitań').setRequired(false))
        .addChannelOption(opt => opt.setName('kanal_pozegnan').setDescription('Kanał pożegnań').setRequired(false))
    )
    .addSubcommand(sub =>
      sub
        .setName('logi')
        .setDescription('Ustawia kanał logów')
        .addChannelOption(opt => opt.setName('kanal_logi').setDescription('Kanał logów').setRequired(true))
    )
    .addSubcommand(sub =>
      sub
        .setName('ticket')
        .setDescription('Wysyła panel ticketów')
        .addChannelOption(opt => opt.setName('kanal').setDescription('Kanał tekstowy').setRequired(false))
        .addChannelOption(opt => opt.setName('kategoria').setDescription('Kategoria na zgłoszenia').setRequired(false))
        .addRoleOption(opt => opt.setName('rola_support').setDescription('Rola supportu').setRequired(false))
    ),

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

    if (sub === 'weryfikacja') {
      const targetChan = interaction.options.getChannel('kanal') || interaction.channel;
      const verifiedRole = interaction.options.getRole('rola_zweryfikowany');

      if (!targetChan.isTextBased()) {
        return await interaction.reply(buildErrorResponse('Błąd', 'Kanał musi być kanałem tekstowym!'));
      }

      if (verifiedRole) {
        updateGuildConfig(guild.id, { verifiedRoleId: verifiedRole.id });
      }

      const verifyEmbed = new EmbedBuilder()
        .setTitle('🔐 WERYFIKACJA KONTA')
        .setDescription('Aby uzyskać dostęp do serwera, kliknij przycisk poniżej i przepisz kod.')
        .setColor(config.colors.primary);

      const verifyRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('btn_verify_start').setLabel('Rozpocznij Weryfikację').setStyle(ButtonStyle.Success).setEmoji('🔐')
      );

      await targetChan.send({ embeds: [verifyEmbed], components: [verifyRow] });

      return await interaction.reply(
        buildSuccessResponse('Wdrożono Panel Weryfikacji', `Wysłano panel na kanał ${targetChan}.${verifiedRole ? ` Rola: ${verifiedRole}.` : ''}`)
      );
    }

    if (sub === 'regulamin') {
      const targetChan = interaction.options.getChannel('kanal') || interaction.channel;
      if (!targetChan.isTextBased()) {
        return await interaction.reply(buildErrorResponse('Błąd', 'Kanał musi być tekstowy!'));
      }

      await targetChan.send(buildRulesContainer());
      return await interaction.reply(
        buildSuccessResponse('Wdrożono Regulamin', `Regulamin wysłany na ${targetChan}.`)
      );
    }

    if (sub === 'selfrole') {
      const targetChan = interaction.options.getChannel('kanal') || interaction.channel;
      if (!targetChan.isTextBased()) {
        return await interaction.reply(buildErrorResponse('Błąd', 'Kanał musi być tekstowy!'));
      }

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
        .setDescription('Zaznacz interesujące Cię powiadomienia oraz platformy z poniższej listy.')
        .setColor(config.colors.primary);

      await targetChan.send({
        embeds: [roleEmbed],
        components: [new ActionRowBuilder().addComponents(selectMenu)]
      });

      return await interaction.reply(
        buildSuccessResponse('Wdrożono Panel Ról', `Panel wysłano na ${targetChan}.`)
      );
    }

    if (sub === 'statystyki') {
      await interaction.deferReply({ ephemeral: true });

      try {
        const created = await setupStatsChannels(guild);
        return await interaction.editReply(
          buildSuccessResponse(
            'Utworzono Statystyki',
            `Utworzono kategorię **${created.category.name}** i kanały statystyk!`
          )
        );
      } catch (err) {
        return await interaction.editReply(
          buildErrorResponse('Błąd', `Nie udało się utworzyć statystyk: \`${err.message}\``)
        );
      }
    }

    if (sub === 'powitania') {
      const welcomeChan = interaction.options.getChannel('kanal_powitan');
      const goodbyeChan = interaction.options.getChannel('kanal_pozegnan');

      const updates = {};
      if (welcomeChan) updates.welcomeChannelId = welcomeChan.id;
      if (goodbyeChan) updates.goodbyeChannelId = goodbyeChan.id;

      updateGuildConfig(guild.id, updates);

      return await interaction.reply(
        buildSuccessResponse('Zapisano Ustawienia', 'Ustawienia kanałów powitań i pożegnań zostały zaktualizowane.')
      );
    }

    if (sub === 'logi') {
      const logChan = interaction.options.getChannel('kanal_logi');
      updateGuildConfig(guild.id, { logChannelId: logChan.id });

      return await interaction.reply(
        buildSuccessResponse('Zapisano Kanał Logów', `Logi będą wysyłane na kanał ${logChan}.`)
      );
    }

    if (sub === 'ticket') {
      const targetChan = interaction.options.getChannel('kanal') || interaction.channel;
      const ticketCategory = interaction.options.getChannel('kategoria');
      const supportRole = interaction.options.getRole('rola_support');

      if (!targetChan.isTextBased()) {
        return await interaction.reply(buildErrorResponse('Błąd', 'Kanał musi być tekstowy!'));
      }

      const updates = {};
      if (ticketCategory) updates.ticketCategoryId = ticketCategory.id;
      if (supportRole) updates.ticketSupportRoleId = supportRole.id;
      if (Object.keys(updates).length > 0) {
        updateGuildConfig(guild.id, updates);
      }

      await targetChan.send(buildTicketPanelContainer());

      return await interaction.reply(
        buildSuccessResponse('Wysłano Panel Ticketów', `Panel wysłany na ${targetChan}.`)
      );
    }
  },
  buildSetupControlPanel,
  executeAutoSetupAll
};
