// Importando a biblioteca
const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require('discord.js');

// Variáveis do seu bot (definidas no Render/Railway)
const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;

// Criando o client do Discord
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers
  ]
});

// Banco simples em memória
const pontos = new Map();

// Criando comando Slash /pontuar
const command = new SlashCommandBuilder()
  .setName('pontuar')
  .setDescription('Adiciona ou remove pontos de um jogador')
  .addUserOption(opt =>
    opt.setName('usuario')
      .setDescription('Jogador')
      .setRequired(true)
  )
  .addIntegerOption(opt =>
    opt.setName('pontos')
      .setDescription('Pontos (pode ser negativo)')
      .setRequired(true)
  );

// Registrando o comando no Discord
const rest = new REST({ version: '10' }).setToken(TOKEN);
(async () => {
  await rest.put(
    Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
    { body: [command.toJSON()] }
  );
  console.log('Slash command registrado');
})();

// Evento quando alguém usa comando
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'pontuar') {
    const user = interaction.options.getUser('usuario');
    const value = interaction.options.getInteger('pontos');

    const atual = pontos.get(user.id) || 0;
    const novo = atual + value;
    pontos.set(user.id, novo);

    const member = await interaction.guild.members.fetch(user.id);

    try {
      await member.setNickname(`⭐ ${novo} pts`);
    } catch {
      await interaction.reply({
        content: `⚠️ Não consegui mudar o nick de ${user.username}.`,
        ephemeral: true
      });
      return;
    }

    await interaction.reply(
      `✅ ${user.username} agora tem **${novo} pontos**`
    );
  }
});

// Logando o bot
client.login(TOKEN);
