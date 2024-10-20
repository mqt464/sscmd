const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const { execute } = require('../../events/client/ready')

module.exports = {
  data: new SlashCommandBuilder()
      .setName('piratebay')
      .setDescription('returns a search inquiry on https://piratebay.org')
      .addStringOption((option) =>
        option
          .setName("search")
          .setDescription("your search inquiry")
          .setRequired(true)
      ),
  async execute(interaction, client) {
      const searchInput = interaction.options.getString('search');
      const data = searchInput.replace(/\s+/g, '+');
      const URL = `https://thepiratebay.org/search.php?q=${data}&all=on&search=Pirate+Search&page=0&orderby=`;

      const embed = new EmbedBuilder()
          .setTitle(`Pirate Bay`)
          .setDescription(`Search: [${searchInput}](${URL})`)
          .setColor(client.colour)
          .setTimestamp(Date.now())
          .setFooter({
            iconURL: interaction.user.displayAvatarURL(),
            text: `requested by ${interaction.user.tag}`,
          })

      await interaction.reply({
        embeds: [embed] 
      })
  }
}