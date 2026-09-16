const fs = require('fs');
const path = require('path');

function loadEvents(client) {
  // Nasłuchiwanie na użycie komend slash
  client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
      await command.execute(interaction, client);
    } catch (error) {
      console.error(`Błąd podczas wykonywania komendy ${interaction.commandName}:`, error);
      
      const errorMessage = { content: 'Wystąpił błąd podczas wykonywania tej komendy!', ephemeral: true };
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(errorMessage);
      } else {
        await interaction.reply(errorMessage);
      }
    }
  });

  console.log('Załadowano handler interakcji (slash commands).');
}

module.exports = loadEvents;
