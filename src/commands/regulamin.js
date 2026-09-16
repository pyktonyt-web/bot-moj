const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { buildSuccessResponse, buildErrorResponse } = require('../utils/componentsV2');
const config = require('../../config');

function buildRulesContainer() {
  const description = [
    'Hejka! 💬',
    'Zanim zaczniesz działać — przeczytaj to uważnie. Dołączając, akceptujesz te zasady. 😎',
    '',
    '━━━━━━━━━━━━━━━',
    '**💠┃1. SZACUNEK**',
    '💬 Szanuj innych — bez wyzywania i kłótni.',
    '🚫 Zero rasizmu, seksizmu, homofobii i toksyczności.',
    '😎 Zachowuj kulturę – baw się, nie spinaj.',
    '━━━━━━━━━━━━━━━',
    '**🛡️┃2. ADMINI I MODZI**',
    '👑 Decyzje administracji są ostateczne.',
    '🧩 Nie dyskutuj publicznie – napisz na priv.',
    '🤝 Szanuj ekipę, a ekipa uszanuje Ciebie.',
    '━━━━━━━━━━━━━━━',
    '**💬┃3. CZAT I KANAŁY**',
    '🧠 Pisz na odpowiednich kanałach.',
    '🚫 Zakaz spamu, floodu i nadużywania @everyone.',
    '🧹 Bez reklam, łańcuszków i dziwnych linków.',
    '━━━━━━━━━━━━━━━',
    '**🎥┃4. TREŚCI**',
    '🎮 Serwer o Robloxie i nagrywkach – trzymajmy się tematu.',
    '🎶 Używaj tylko legalnych materiałów.',
    '🙈 Bez NSFW, drastycznych lub obraźliwych treści.',
    '━━━━━━━━━━━━━━━',
    '**🚫┃5. ZAKAZY**',
    '🔒 Nie podawaj danych – swoich ani cudzych.',
    '👻 Nie podszywaj się pod innych.',
    '🐍 Nie wysyłaj podejrzanych linków.',
    '🚫 Nie wolno przeklinać',
    '🔒 Zakaz wysyłania cheatów',
    '━━━━━━━━━━━━━━━',
    '**⚙️┃6. KARY**',
    '⚠️ Ostrzeżenie → Mute → Kick → Ban.',
    '🚪 Omijanie bana = perm ban.',
    '🔧 Admin decyduje o karze.',
    '━━━━━━━━━━━━━━━',
    '✅ **Akceptując zasady – dołączasz do Teamu Hekera! 💥**',
    '🎉 Baw się dobrze i nagrywaj z klasą!'
  ].join('\n');

  const embed = new EmbedBuilder()
    .setTitle('📜┃REGULAMIN SERWERA')
    .setDescription(description)
    .setColor(config.colors?.primary || '#5865F2')
    .setFooter({ text: '© 2026 Team Hekera' });

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('btn_accept_rules')
      .setLabel('Akceptuję Regulamin')
      .setStyle(ButtonStyle.Success)
      .setEmoji('✅')
  );

  return {
    embeds: [embed],
    components: [row]
  };
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
    const targetChannel = interaction.options.getChannel('kanal') || interaction.channel;

    if (!targetChannel.isTextBased()) {
      return await interaction.reply(buildErrorResponse('Błąd', 'Kanał musi być tekstowy!'));
    }

    const payload = buildRulesContainer();
    await targetChannel.send(payload);

    return await interaction.reply(
      buildSuccessResponse('Wdrożono Regulamin', `Regulamin został wysłany na kanał ${targetChannel}.`)
    );
  },
  buildRulesContainer
};
