const { SlashCommandBuilder, EmbedBuilder, Embed } = require('discord.js')
const { execute } = require('../../events/client/ready')

module.exports = {
  data: new SlashCommandBuilder()
      .setName('embed')
      .setDescription('Returns an embed.'),
  async execute(interaction, client) {
      const embed = new EmbedBuilder()
          .setTitle('This is an Embed!')
          .setDescription('this is a very cool description')
          .setColor(client.colour)
          .setImage(client.user.displayAvatarURL())
          .setThumbnail(client.user.displayAvatarURL())
          .setTimestamp(Date.now())
          .setAuthor({
            url: `https://github.com/mqt464`,
            iconURL: interaction.user.displayAvatarURL(),
            name: interaction.user.tag,
          })
          .setFooter({
            iconURL: client.user.displayAvatarURL(),
            text: client.user.tag
          })
          .setURL(`https://github.com/mqt464`)
          .addFields([
            {
              name: `Field 1`,
              value: `Field 1 Valie`,
              inline: true
            },
            {
              name: `Field 2`,
              value: `Fieled 2 Valie`,
              inline: true
            },
          ]);

          await interaction.reply({
            embeds: [embed]
          })
  }
}