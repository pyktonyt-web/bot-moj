const { 
  TextDisplayBuilder, 
  SeparatorBuilder, 
  ButtonBuilder, 
  EmbedBuilder,
  MessageFlags 
} = require('discord.js');

function createHeader(text, emoji) {
  return new TextDisplayBuilder().setContent(`### ${emoji} ${text}`);
}

function createSeparator() {
  return new SeparatorBuilder();
}

function createCallout(emoji, title, description) {
  return new TextDisplayBuilder().setContent(`> **${emoji} ${title}**\n> ${description}`);
}

function createSectionWithButton(text, buttonLabel, customId, style, emoji) {
  // Zwraca tekst lub strukturę sekcji wspieraną przez v2
  return new TextDisplayBuilder().setContent(text);
}

function createLogoMediaGallery() {
  // Jeśli używasz galerii mediów, zwróć odpowiedni builder lub pustą tablicę zabezpieczającą
  return [];
}

function getLogoAttachment() {
  // Możesz tutaj zwrócić ścieżkę do pliku lub null, jeśli nie używasz lokalnego obrazka
  return null;
}

function createFooter(text = '© 2026 Team Hekera') {
  return new TextDisplayBuilder().setContent(`-* ${text}`);
}

function buildSuccessResponse(title, description) {
  return {
    embeds: [
      new EmbedBuilder()
        .setTitle(`✅ ${title}`)
        .setDescription(description)
        .setColor('#57F287')
    ],
    flags: MessageFlags.Ephemeral
  };
}

function buildErrorResponse(title, description) {
  return {
    embeds: [
      new EmbedBuilder()
        .setTitle(`❌ ${title}`)
        .setDescription(description)
        .setColor('#ED4245')
    ],
    flags: MessageFlags.Ephemeral
  };
}

module.exports = {
  createSeparator,
  createHeader,
  createCallout,
  createSectionWithButton,
  createLogoMediaGallery,
  getLogoAttachment,
  createFooter,
  buildSuccessResponse,
  buildErrorResponse
};
