const { 
  SlashCommandBuilder, 
  PermissionFlagsBits, 
  MessageFlags, 
  ContainerBuilder, 
  TextDisplayBuilder,
  ButtonStyle
} = require('discord.js');
const { 
  createSeparator, 
  createHeader, 
  createSectionWithButton, 
  createLogoMediaGallery, 
  getLogoAttachment, 
  createFooter 
} = require('../utils/componentsV2');
const config = require('../../config');

function buildRulesContainer() {
  const header = createHeader('REGULAMIN SERWERA × TEAM HEKERA', '📜');

  const intro = new TextDisplayBuilder().setContent(
    `> **Hejka!** 💬\n` +
    `> Zanim zaczniesz działać — przeczytaj to uważnie. Dołączając, akceptujesz te zasady. 😎`
  );

  // Zabezpieczenie przed pustą tablicą reguł (zapobiega błędom walidacji V2)
  const rulesList = config.rules && config.rules.length > 0 ? config.rules : [
    {
      number: 1,
      title: 'Zasada domyślna',
      emoji: '📌',
      points: ['Uzupełnij tablicę rules w pliku config.js!']
    }
  ];

  const ruleDisplays = rulesList.map(r => {
    const pointsText = r.points && r.points.length > 0 ? r.points.map(p => `> ${p}`).join('\n') : '> Brak punktów.';
    const content = `▎ ${r.emoji} ' **${r.number}. ${r.title}**\n` + pointsText;
    return new TextDisplayBuilder().setContent(content);
  });

  const outro = new TextDisplayBuilder().setContent(
    `> ✅ **Akceptując zasady – dołączasz do Teamu Hekera!** 💥\n` +
    `> 🎉 **Baw się dobrze i nagrywaj z klasą!**`
  );

  const acceptSection = createSectionWithButton(
    "🛡️ ' **Akceptacja Zasad**\nKliknij poniższy przycisk, aby potwierdzić zapoznanie się z regulaminem.",
    "✅ Akceptuję Regulamin",
    "btn_accept_rules",
    ButtonStyle.Success,
    "✅"
  );

  return new ContainerBuilder()
    .setAccentColor(config.colors.primary)
    .addTextDisplayComponents(header)
    .addSeparatorComponents(createSeparator())
    .addTextDisplayComponents(intro)
    .addSeparatorComponents(createSeparator())
    .addTextDisplayComponents(...ruleDisplays)
    .addSeparatorComponents(createSeparator())
    .addTextDisplayComponents(outro)
    .addSeparatorComponents(createSeparator())
    .addSectionComponents(acceptSection)
    .addMediaGalleryComponents(createLogoMediaGallery())
    .addSeparatorComponents(createSeparator())
    .addTextDisplayComponents(createFooter('© 2026 Team Hekera'));
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('regulamin')
    .setDescription('Wysyła oficjalny regulamin Teamu Hekera')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addChannelOption(option =>
      option
        .setName('kanal')
        .setDescription('Kanał, na który ma trafić regulamin')
        .setRequired(false)
    ),

  async execute(interaction) {
    const targetChannel = interaction.options.getChannel('kanal');
    const container = buildRulesContainer();

    if (targetChannel) {
      if (!targetChannel.isTextBased()) {
        return await interaction.reply({
          content: 'Wskazany kanał musi być kanałem tekstowym.',
          flags: MessageFlags.Ephemeral
        });
      }

      await targetChannel.send({
        flags: MessageFlags.IsComponentsV2,
        components: [container],
        files: [getLogoAttachment()]
      });

      return await interaction.reply({
        content: `Panel regulaminu został wysłany na kanał ${targetChannel}.`,
        flags: MessageFlags.Ephemeral
      });
    }

    return await interaction.reply({
      flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
      components: [container],
      files: [getLogoAttachment()]
    });
  },
  buildRulesContainer
};
