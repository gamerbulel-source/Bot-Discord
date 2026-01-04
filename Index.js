const { Client, GatewayIntentBits } = require('discord.js');
const TOKEN = process.env.TOKEN;

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once('ready', () => {
  console.log(`Bot online: ${client.user.tag}`);
});

client.login(TOKEN);
