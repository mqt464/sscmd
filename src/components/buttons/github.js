module.exports = {
  data: {
    name: `github`,
  },
  async execute(interaction, client) {
    await interaction.reply({
      content: `https://github.com/mqt464`,
    });
  },
};
