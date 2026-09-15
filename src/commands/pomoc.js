const { 
  SlashCommandBuilder, 
  MessageFlags, 
  ContainerBuilder, 
  ButtonStyle
} = require('discord.js');
const { 
  createSeparator, 
  createHeader, 
  createCallout, 
  createSectionWithButton, 
  createLogoMediaGallery, 
  getLogoAttachment, 
  createFooter 
} = require('../utils/componentsV2');
const config = require('../../config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('pomoc')
    .setDescription('Centrum pomocy i spis funkcji bota'),

  async execute(interaction) {
    const header = createHeader('POMOC I FUNKCJE BOTA', '💻');

    const desc1 = createCallout('🛡️', 'Moderacja', 'Komendy `/mod` (panel GUI, ban, kick, timeout, warn, clear, lock, slowmode).');
    const desc2 = createCallout('🔐', 'Weryfikacja', 'System autoryzacji z losowym kodem bezpieczeństwa w modalu.');
    const desc3 = createCallout('📜', 'Regulamin', 'Interaktywny panel zasad serwera z przyciskiem akceptacji.');
    const desc4 = createCallout('🎭', 'Self-Role', 'Wybór ról powiadomień, platform i gier.');
    const desc5 = createCallout('📊', 'Statystyki', 'Automatyczne kanały liczników głosowych oraz komenda `/statystyki`.');
    const desc6 = createCallout('🎫', 'Tickety', 'Zgłoszenia Hakerolandia z wyborem kategorii.');
    const desc7 = createCallout('⚙️', 'Setup', 'Komenda `/setup` do szybkiego rozstawienia serwera.');

    const setupSection = createSectionWithButton(
      "🛠️ ' **Zarządzanie**\nUżyj `/setup`, aby rozstawić panele na kanałach.",
      "Discord",
      "https://discord.com",
      ButtonStyle.Link,
      "🔗"
    );

    const container = new ContainerBuilder()
      .setAccentColor(config.colors.primary)
      .addTextDisplayComponents(header)
      .addSeparatorComponents(createSeparator())
      .addTextDisplayComponents(desc1, desc2, desc3, desc4, desc5, desc6, desc7)
      .addSeparatorComponents(createSeparator())
      .addSectionComponents(setupSection)
      .addMediaGalleryComponents(createLogoMediaGallery())
      .addSeparatorComponents(createSeparator())
      .addTextDisplayComponents(createFooter());

    return await interaction.reply({
      flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
      components: [container],
      files: [getLogoAttachment()]
    });
  }
};
