require('dotenv').config();
const { Client, GatewayIntentBits, Partials } = require('discord.js');
const http = require('http');
const config = require('./config');
const { loadCommands, registerSlashCommands } = require('./src/handlers/commandHandler');

const eventHandlerModule = require('./src/handlers/eventHandler');
const loadEvents = typeof eventHandlerModule === 'function' ? eventHandlerModule : eventHandlerModule.loadEvents;

http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Bot is running!');
}).listen(process.env.PORT || 3000);

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.MessageContent
  ],
  partials: [
    Partials.User,
    Partials.Message,
    Partials.GuildMember,
    Partials.Channel
  ]
});

async function start() {
  const commandsData = loadCommands(client);
  client._commandsData = commandsData;
  
  if (typeof loadEvents === 'function') {
    loadEvents(client);
  }

  if (commandsData && commandsData.length > 0) {
    await registerSlashCommands(client, commandsData);
  }

  if (!config.token) {
    console.error('Brak tokenu bota w .env');
    process.exit(1);
  }

  await client.login(config.token);
}

process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection:', err);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
});

start().catch(console.error);
