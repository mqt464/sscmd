const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const { execute } = require("../../events/client/ready");
const { Component } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("github")
    .setDescription("link to my github"),
  async execute(interaction, client) {
    const button = new ButtonBuilder()
      .setURL(`https://github.com/mqt464/sscmd`)
      .setLabel(`github!`)
      .setStyle(ButtonStyle.Link);

    await interaction.reply({
      components: [new ActionRowBuilder().addComponents(button)],
    });
  },
};
