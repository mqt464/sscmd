const {
  SlashCommandBuilder,
  ContextMenuCommandBuilder,
  ApplicationCommandType,
} = require("discord.js");
const { execute } = require("../../events/client/ready");

module.exports = {
  data: new ContextMenuCommandBuilder()
    .setName("get Avatar")
    .setType(ApplicationCommandType.User),
  async execute(interaction, client) {
    await interaction.reply({
      content: `${interaction.targetUser.displayAvatarURL()}`,
    });
  },
};
