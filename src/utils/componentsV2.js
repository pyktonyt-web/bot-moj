// Przykład struktury pliku src/utils/componentsV2.js

const { TextDisplayBuilder, SeparatorBuilder, ButtonBuilder } = require('discord.js');

function createHeader(text, emoji) {
  return new TextDisplayBuilder().setContent(`### ${emoji} ${text}`);
}

function createSeparator() {
  return new SeparatorBuilder();
}

function createSectionWithButton(text, buttonLabel, customId, style, emoji) {
  // Twoja implementacja sekcji z przyciskiem
}

function createLogoMediaGallery() {
  // Twoja implementacja galerii logo
}

function getLogoAttachment() {
  // Zwracanie załącznika
}

function createFooter(text) {
  return new TextDisplayBuilder().setContent(`-* ${text}`);
}

module.exports = {
  createSeparator,
  createHeader,
  createSectionWithButton,
  createLogoMediaGallery,
  getLogoAttachment,
  createFooter
};
