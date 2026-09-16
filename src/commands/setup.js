const { 
  SlashCommandBuilder, 
  PermissionFlagsBits, 
  MessageFlags, 
  ContainerBuilder, 
  TextDisplayBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ChannelType
} = require('discord.js');
const { 
  createSeparator, 
  createHeader, 
  createCallout, 
  createSectionWithButton, 
  createLogoMediaGallery, 
  getLogoAttachment, 
  createFooter,
  buildSuccessResponse, 
  buildErrorResponse 
} = require('../utils/componentsV2');
const { updateGuildConfig } = require('../utils/storage');
const { setupStatsChannels } = require('../utils/statsUpdater');
const { buildTicketPanelContainer } = require('./ticket');
const { buildRulesContainer } = require('./regulamin');
const config = require('../../config');

function buildSetupControlPanel() {
  const header = createHeader('CENTRUM KONFIGURACJI', '⚙️');

  const desc1 = createCallout('🔐', 'Weryfikacja', 'Panel weryfikacji captcha.');
  const desc2 = createCallout('📜', 'Regulamin', 'Regulamin serwera Team Hekera.');
  const desc3 = createCallout('🎫', 'Tickety', 'Panel zgłoszeń Hakerolandia.');
  const desc4 = createCallout('🎭', 'Self-Role', 'Wybór ról powiadomień i gier.');
  const desc5 = createCallout('📊', 'Statystyki', 'Liczniki na kanałach głosowych.');
  const desc6 = createCallout('🚀', 'Auto-Setup', 'Tworzy wszystkie kanały i panele automatycznie.');

  const row1 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('btn_setup_weryfikacja')
      .setLabel('Weryfikacja')
      .setStyle(ButtonStyle.Success)
      .setEmoji('🔐'),
    new ButtonBuilder()
      .setCustomId('btn_setup_regulamin')
      .setLabel('Regulamin')
      .setStyle(ButtonStyle.Primary)
      .setEmoji('📜'),
    new ButtonBuilder()
      .setCustomId('btn_setup_ticket')
      .setLabel('Tickety')
      .setStyle(ButtonStyle.Primary)
      .setEmoji('🎫')
  );

  const row2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('btn_setup_selfrole')
      .setLabel('Self-Role')
      .setStyle(ButtonStyle.Secondary)
      .setEmoji('🎭'),
    new ButtonBuilder()
      .setCustomId('btn_setup_statystyki')
      .setLabel('Statystyki')
      .setStyle(ButtonStyle.Secondary)
      .setEmoji('📊'),
    new ButtonBuilder()
      .setCustomId('btn_setup_all')
      .setLabel('Wszystko (Auto)')
      .setStyle(ButtonStyle.Danger)
      .setEmoji('🚀')
  );

  return new ContainerBuilder()
    .setAccentColor(config.colors.primary)
    .addTextDisplayComponents(header)
    .addSeparatorComponents(createSeparator())
    .addTextDisplayComponents(desc1, desc2, desc3, desc4, desc5, desc6)
    .addSeparatorComponents(createSeparator())
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent('> *Wybierz moduł, który chcesz rozstawić.*')
    )
    .addActionRowComponents(row1)
    .addActionRowComponents(row2)
    .addMediaGalleryComponents(createLogoMediaGallery())
    .addSeparatorComponents(createSeparator())
    .addTextDisplayComponents(createFooter());
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
  await regChan.send({
    flags: MessageFlags.IsComponentsV2,
    components: [buildRulesContainer()],
    files: [getLogoAttachment()]
  });
  createdChannels.push(`Regulamin: ${regChan}`);

  const verChan = await guild.channels.create({
    name: '🔐・weryfikacja',
    type: ChannelType.GuildText,
    parent: infoCat.id
  });

  const verifySection = createSectionWithButton(
    "🛡️ ' **Weryfikacja Konta**\nAby uzyskać dostęp do serwera, kliknij przycisk poniżej i przepisz kod.",
    "⚡ Rozpocznij Weryfikację",
    "btn_verify_start",
    ButtonStyle.Success,
    "🔐"
  );

  const verifyContainer = new ContainerBuilder()
    .setAccentColor(config.colors.primary)
    .addTextDisplayComponents(createHeader('WERYFIKACJA KONTA', '🔐'))
    .addSeparatorComponents(createSeparator())
    .addTextDisplayComponents(
      createCallout('🤖', 'Ochrona', 'Wpisz kod captcha, aby odblokować dostęp.'),
      createCallout('⏱️', 'Czas', 'Zajmuje kilka sekund.')
    )
    .addSeparatorComponents(createSeparator())
    .addSectionComponents(verifySection)
    .addMediaGalleryComponents(createLogoMediaGallery())
    .addSeparatorComponents(createSeparator())
    .addTextDisplayComponents(createFooter());

  await verChan.send({
    flags: MessageFlags.IsComponentsV2,
    components: [verifyContainer],
    files: [getLogoAttachment()]
  });
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

  const roleContainer = new ContainerBuilder()
    .setAccentColor(config.colors.primary)
    .addTextDisplayComponents(createHeader('WYBÓR RÓL', '🎭'))
    .addSeparatorComponents(createSeparator())
    .addTextDisplayComponents(
      createCallout('🔔', 'Powiadomienia', 'Zaznacz interesujące Cię powiadomienia.'),
      createCallout('💻', 'Platformy', 'Zaznacz platformę na której grasz.')
    )
    .addSeparatorComponents(createSeparator())
    .addActionRowComponents(new ActionRowBuilder().addComponents(selectMenu))
    .addMediaGalleryComponents(createLogoMediaGallery())
    .addSeparatorComponents(createSeparator())
    .addTextDisplayComponents(createFooter());

  await roleChan.send({
    flags: MessageFlags.IsComponentsV2,
    components: [roleContainer],
    files: [getLogoAttachment()]
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
  await tickChan.send({
    flags: MessageFlags.IsComponentsV2,
    components: [buildTicketPanelContainer()],
    files: [getLogoAttachment()]
  });
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
    .addSubcommand(sub =>
      sub
        .setName('panel')
        .setDescription('Otwiera menu konfiguracyjne bota')
    )
    .addSubcommand(sub =>
      sub
        .setName('wszystko')
        .setDescription('Automatyczna konfiguracja serwera')
    )
    .addSubcommand(sub =>
      sub
        .setName('weryfikacja')
        .setDescription('Wysyła panel weryfikacji')
        .addChannelOption(opt =>
          opt
            .setName('kanal')
            .setDescription('Kanał tekstowy')
            .setRequired(false)
        )
        .addRoleOption(opt =>
          opt
            .setName('rola_zweryfikowany')
            .setDescription('Rola po weryfikacji')
            .setRequired(false)
        )
    )
    .addSubcommand(sub =>
      sub
        .setName('regulamin')
        .setDescription('Wysyła panel regulaminu')
        .addChannelOption(opt =>
          opt
            .setName('kanal')
            .setDescription('Kanał tekstowy')
            .setRequired(false)
        )
    )
    .addSubcommand(sub =>
      sub
        .setName('selfrole')
        .setDescription('Wysyła panel ról')
        .addChannelOption(opt =>
          opt
            .setName('kanal')
            .setDescription('Kanał tekstowy')
            .setRequired(false)
        )
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
        .addChannelOption(opt =>
          opt
            .setName('kanal_powitan')
            .setDescription('Kanał powitań')
            .setRequired(false)
        )
        .addChannelOption(opt =>
          opt
            .setName('kanal_pozegnan')
            .setDescription('Kanał pożegnań')
            .setRequired(false)
        )
    )
    .addSubcommand(sub =>
      sub
        .setName('logi')
        .setDescription('Ustawia kanał logów')
        .addChannelOption(opt =>
          opt
            .setName('kanal_logi')
            .setDescription('Kanał logów')
            .setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub
        .setName('ticket')
        .setDescription('Wysyła panel ticketów')
        .addChannelOption(opt =>
          opt
            .setName('kanal')
            .setDescription('Kanał tekstowy')
            .setRequired(false)
        )
        .addChannelOption(opt =>
          opt
            .setName('kategoria')
            .setDescription('Kategoria na zgłoszenia')
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
    const sub = interaction.options.getSubcommand(false) || 'panel';
    const guild = interaction.guild;

    if (sub === 'panel') {
      const container = buildSetupControlPanel();
      return await interaction.reply({
        flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
        components: [container],
        files: [getLogoAttachment()]
      });
    }

    if (sub === 'wszystko') {
      await interaction.deferReply({ flags: MessageFlags.Ephemeral });
      try {
        const results = await executeAutoSetupAll(guild);
        return await interaction.editReply(
          buildSuccessResponse(
            'Konfiguracja Zakończona',
            `Skonfigurowano serwer:\n` + results.map(r => `▎ 🚀 ' ${r}`).join('\n')
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

      const verifySection = createSectionWithButton(
        "🛡️ ' **Weryfikacja Konta**\nAby uzyskać dostęp do serwera, kliknij przycisk poniżej i przepisz kod.",
        "⚡ Rozpocznij Weryfikację",
        "btn_verify_start",
        ButtonStyle.Success,
        "🔐"
      );

      const container = new ContainerBuilder()
        .setAccentColor(config.colors.primary)
        .addTextDisplayComponents(createHeader('WERYFIKACJA KONTA', '🔐'))
        .addSeparatorComponents(createSeparator())
        .addTextDisplayComponents(
          createCallout('🤖', 'Ochrona', 'Przepisz kod captcha, aby odblokować dostęp do serwera.'),
          createCallout('⏱️', 'Czas', 'Zajmuje kilka sekund.')
        )
        .addSeparatorComponents(createSeparator())
        .addSectionComponents(verifySection)
        .addMediaGalleryComponents(createLogoMediaGallery())
        .addSeparatorComponents(createSeparator())
        .addTextDisplayComponents(createFooter());

      await targetChan.send({
        flags: MessageFlags.IsComponentsV2,
        components: [container],
        files: [getLogoAttachment()]
      });

      return await interaction.reply(
        buildSuccessResponse('Wdrożono Panel Weryfikacji', `Wysłano panel na kanał ${targetChan}.${verifiedRole ? ` Rola: ${verifiedRole}.` : ''}`)
      );
    }

    if (sub === 'regulamin') {
      const targetChan = interaction.options.getChannel('kanal') || interaction.channel;
      if (!targetChan.isTextBased()) {
        return await interaction.reply(buildErrorResponse('Błąd', 'Kanał musi być tekstowy!'));
      }

      const container = buildRulesContainer();
      await targetChan.send({
        flags: MessageFlags.IsComponentsV2,
        components: [container],
        files: [getLogoAttachment()]
      });

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

      const menuRow = new ActionRowBuilder().addComponents(selectMenu);

      const container = new ContainerBuilder()
        .setAccentColor(config.colors.primary)
        .addTextDisplayComponents(createHeader('WYBÓR RÓL', '🎭'))
        .addSeparatorComponents(createSeparator())
        .addTextDisplayComponents(
          createCallout('🔔', 'Powiadomienia', 'Zaznacz powiadomienia, które chcesz otrzymywać.'),
          createCallout('💻', 'Platformy', 'Wybierz platformy sprzętowe.')
        )
        .addSeparatorComponents(createSeparator())
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent('> *Wybierz role z poniższej listy.*')
        )
        .addActionRowComponents(menuRow)
        .addMediaGalleryComponents(createLogoMediaGallery())
        .addSeparatorComponents(createSeparator())
        .addTextDisplayComponents(createFooter());

      await targetChan.send({
        flags: MessageFlags.IsComponentsV2,
        components: [container],
        files: [getLogoAttachment()]
      });

      return await interaction.reply(
        buildSuccessResponse('Wdrożono Panel Ról', `Panel wysłano na ${targetChan}.`)
      );
    }

    if (sub === 'statystyki') {
      await interaction.deferReply({ flags: MessageFlags.Ephemeral });

      try {
        const created = await setupStatsChannels(guild);
        return await interaction.editReply(
          buildSuccessResponse(
            'Utworzono Statystyki',
            `Utworzono kategorię **${created.category.name}** i kanały:\n` +
            `▎ 🧒 ' Widzowie: ${created.membersChan}\n` +
            `▎ 🤖 ' Boty: ${created.botsChan}\n` +
            `▎ 🔨 ' Bany: ${created.bansChan}\n` +
            `▎ ✨ ' Nowy: ${created.newestChan}`
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
        buildSuccessResponse(
          'Zapisano Ustawienia',
          `${welcomeChan ? `▎ 👋 ' **Powitania**: ${welcomeChan}\n` : ''}` +
          `${goodbyeChan ? `▎ 🚪 ' **Pożegnania**: ${goodbyeChan}\n` : ''}`
        )
      );
    }

    if (sub === 'logi') {
      const logChan = interaction.options.getChannel('kanal_logi');
      updateGuildConfig(guild.id, { logChannelId: logChan.id });

      return await interaction.reply(
        buildSuccessResponse('Zapisano Kanał Logów', `Logi będą wysyłane na ${logChan}.`)
      );
    }

    if (sub === 'ticket') {
      const targetChan = interaction.options.getChannel('kanal') || interaction.channel;
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
          'Wysłano Panel Ticketów',
          `Panel wysłany na ${targetChan}.\n` +
          `${ticketCategory ? `▎ 📁 ' Kategoria: ${ticketCategory.name}\n` : ''}` +
          `${supportRole ? `▎ 🛡️ ' Rola: ${supportRole}\n` : ''}`
        )
      );
    }
  },
  buildSetupControlPanel,
  executeAutoSetupAll
};
