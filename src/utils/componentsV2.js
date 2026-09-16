const {
  MessageFlags,
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  SectionBuilder,
  ThumbnailBuilder,
  ButtonBuilder,
  ButtonStyle,
  MediaGalleryBuilder,
  MediaGalleryItemBuilder,
  AttachmentBuilder
} = require('discord.js');
const path = require('path');
const config = require('../../config');

function createSeparator(spacing = SeparatorSpacingSize.Small, divider = true) {
  return new SeparatorBuilder().setDivider(divider).setSpacing(spacing);
}

function createHeader(title, emoji = '💻') {
  return new TextDisplayBuilder().setContent(`### [ ${emoji} ' ${title.toUpperCase()} ]`);
}

function createCodeblockHeader(text) {
  return new TextDisplayBuilder().setContent(`\`\`\`${config.brandName} × ${text.toUpperCase()}\`\`\``);
}

function createCallout(emoji, title, description) {
  return new TextDisplayBuilder().setContent(`▎ ${emoji} ' **${title}**: ${description}`);
}

function createSectionWithThumbnail(contentLines, avatarUrl) {
  const content = Array.isArray(contentLines) ? contentLines.join('\n') : contentLines;
  return new SectionBuilder()
    .addTextDisplayComponents(new TextDisplayBuilder().setContent(content))
    .setThumbnailAccessory(
      new ThumbnailBuilder({
        media: { url: avatarUrl || 'https://cdn.discordapp.com/embed/avatars/0.png' }
      })
    );
}

function createSectionWithButton(text, buttonLabel, buttonUrlOrCustomId, style = ButtonStyle.Link, emoji = null) {
  const btn = new ButtonBuilder().setLabel(buttonLabel).setStyle(style);
  if (emoji) btn.setEmoji(emoji);

  if (style === ButtonStyle.Link) {
    btn.setURL(buttonUrlOrCustomId);
  } else {
    btn.setCustomId(buttonUrlOrCustomId);
  }

  return new SectionBuilder()
    .addTextDisplayComponents(new TextDisplayBuilder().setContent(text))
    .setButtonAccessory(btn);
}

function createFooter(customText = null) {
  return new TextDisplayBuilder().setContent(customText || config.systemFooter);
}

function createLogoMediaGallery() {
  return new MediaGalleryBuilder().addItems(
    new MediaGalleryItemBuilder().setURL(`attachment://${config.assets.logoAttachmentName}`)
  );
}

function getLogoAttachment() {
  const fullPath = path.join(__dirname, '../../', config.assets.logoPath);
  return new AttachmentBuilder(fullPath, { name: config.assets.logoAttachmentName });
}

function buildSuccessResponse(title, message, options = {}) {
  const container = new ContainerBuilder()
    .setAccentColor(config.colors.primary)
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`### [ ✅ ' ${title.toUpperCase()} ]`),
      createCallout('⚡', 'Status Operacji', message)
    )
    .addSeparatorComponents(createSeparator())
    .addTextDisplayComponents(createFooter());

  return {
    flags: (options.ephemeral !== false ? MessageFlags.Ephemeral : 0) | MessageFlags.IsComponentsV2,
    components: [container]
  };
}

function buildErrorResponse(title, message, options = {}) {
  const container = new ContainerBuilder()
    .setAccentColor(config.colors.danger)
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`### [ ❌ ' ${title.toUpperCase()} ]`),
      createCallout('⚠️', 'Błąd', message)
    )
    .addSeparatorComponents(createSeparator())
    .addTextDisplayComponents(createFooter());

  return {
    flags: (options.ephemeral !== false ? MessageFlags.Ephemeral : 0) | MessageFlags.IsComponentsV2,
    components: [container]
  };
}

module.exports = {
  createSeparator,
  createHeader,
  createCodeblockHeader,
  createCallout,
  createSectionWithThumbnail,
  createSectionWithButton,
  createFooter,
  createLogoMediaGallery,
  getLogoAttachment,
  buildSuccessResponse,
  buildErrorResponse
};
