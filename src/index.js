require("dotenv").config();
const { TOKEN } = process.env;
const { Client, Collection, GatewayIntentBits } = require("discord.js");
const fs = require("fs");

const { Guilds, GuildMessages } = GatewayIntentBits
const client = new Client({ intents: 32767 });

client.commands = new Collection();
client.buttons = new Collection();
client.selectMenus = new Collection();

client.commandArray = [];
client.colour = 0xffb6c1
client.colourGreen = 0x57F287
client.colourRed = 0xED4245

const functionFolders = fs.readdirSync("./src/functions");
for (const folder of functionFolders) {
  const functionFiles = fs
    .readdirSync(`./src/functions/${folder}`)
    .filter((file) => file.endsWith(".js"));
  for (const file of functionFiles)
    require(`./functions/${folder}/${file}`)(client);
}

client.handleEvents();
client.handleCommands();
client.handleComponents();
client.login(TOKEN);