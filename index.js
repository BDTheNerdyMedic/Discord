const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');
require('dotenv').config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const prefix = '!';
const defaultPort = 25565;

let baseURL = 'https://api.mcsrvstat.us/3/'; // Replace with your actual base URL
let server = 'rgminecraft.com'; // Replace with your actual default server

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  if (command === 'serverstatus') {
    let specifiedPort = args.length > 0 ? parseInt(args[0]) : null;
    const port = specifiedPort || defaultPort;

    try {
      // Check online status first
      const response = await axios.get(baseURL + server + ':' + port);
      const isOnline = response.data.online;

      if (isOnline) {
        // If online, fetch detailed data
        const data = response.data; // Assuming the API response is an object

        // Format the message with bold headings and omit values when the server is offline
        const formattedMessage = `
**Server:** ${data.hostname}:${data.port}
${isOnline ? `**MOTD:** ${data.motd.clean}` : ''}
${isOnline ? `**Version:** ${data.version}` : ''}
**Online:** :green_circle:
${isOnline ? `**Players:** ${data.players.online}/${data.players.max}` : ''}
`.replace(/^ {2}/gm, ''); // Remove leading whitespace

        // Send the formatted message to the channel where the command was used
        message.channel.send(formattedMessage);
      } else {
        // If not online, send a message indicating the server is offline with the same format
        const offlineMessage = `
**Server:** ${server}:${port}
**Online:** :red_circle:
`.replace(/^ {2}/gm, ''); // Remove leading whitespace

        message.channel.send(offlineMessage);
      }
    } catch (error) {
      console.error('Error fetching data from the API:', error);
      message.channel.send('Error fetching data from the API.');
    }
  }
});

// Use process.env.BOT_TOKEN to access the token from the environment
client.login(process.env.BOT_TOKEN);
