const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require('discord.js');
const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID; // ID do bot
const GUILD_ID = process.env.GUILD_ID;   // ID do servidor de teste

if (!TOKEN || !CLIENT_ID || !GUILD_ID) {
  console.log('❌ TOKEN, CLIENT_ID ou GUILD_ID não definidos nas Secrets!');
  process.exit(1);
}

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// ====================
// Registrar Slash Command
// ====================
const commands = [
  new SlashCommandBuilder()
    .setName('pontuar')
    .setDescription('Soma ou subtrai pontos de um usuário')
    .addUserOption(option =>
      option.setName('usuario')
        .setDescription('Usuário que vai ganhar/perder pontos')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('pontos')
        .setDescription('Quantidade de pontos (+ ou -)')
        .setRequired(true))
].map(cmd => cmd.toJSON());

const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
  try {
    console.log('Registrando comando...');
    await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: commands });
    console.log('✅ Comando registrado!');
  } catch (err) {
    console.error(err);
  }
})();

// ====================
// Evento quando bot fica online
// ====================
client.once('ready', () => {
  console.log(`✅ Bot online: ${client.user.tag}`);
});

// ====================
// Evento de interação (Slash Command)
// ====================
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'pontuar') {
    const usuario = interaction.options.getUser('usuario');
    const pontos = interaction.options.getInteger('pontos');

    try {
      await interaction.guild.members.fetch(usuario.id);
      const member = interaction.guild.members.cache.get(usuario.id);

      // Pegando nickname atual e adicionando pontos
      let nickname = member.nickname || member.user.username;
      let pontosAtuais = 0;

      // Se já tiver algo como "⭐ 50 pts", extrai o número
      const match = nickname.match(/⭐ (\-?\d+) pts/);
      if (match) pontosAtuais = parseInt(match[1]);

      const novosPontos = pontosAtuais + pontos;

      // Atualiza o nickname
      await member.setNickname(`⭐ ${novosPontos} pts`);

      await interaction.reply(`✅ Pontuação de ${usuario.username} atualizada: ${novosPontos} pts`);
    } catch (err) {
      console.error(err);
      await interaction.reply('❌ Não consegui atualizar o nickname. O bot precisa de permissão Manage Nicknames.');
    }
  }
});

// ====================
// Logar bot
// ====================
client.login(TOKEN);