const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fetch = require("node-fetch").default;

module.exports = {
  data: new SlashCommandBuilder()
    .setName("kos")
    .setDescription("KOS a user")
    .addStringOption((option) =>
      option
        .setName("username")
        .setDescription("A valid ROBLOX username")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setDescription("why is this user being kos'd?")
        .setRequired(true)
    ),

  async execute(interaction, client) {
    const username = interaction.options.getString("username");

    const profileResponse = await fetch(
      `https://www.roblox.com/users/profile?username=${username}`
    );

    if (!profileResponse.ok) {
      return await interaction.reply({
        content: "User not found!",
        ephemeral: true,
      });
    }

    const userIdMatch = profileResponse.url.match(/users\/(\d+)\/profile/);

    if (!userIdMatch) {
      return await interaction.reply({
        content: "User not found!",
        ephemeral: true,
      });
    }

    const userId = userIdMatch[1];

    const userResponse = await fetch(
      `https://users.roblox.com/v1/users/${userId}`
    );
    const userData = await userResponse.json();

    if (userResponse.status !== 200) {
      return await interaction.reply({
        content: "Error fetching user data!",
        ephemeral: true,
      });
    }

    const displayName = userData.displayName;
    const userName = username;

    const avatarThumbnailResponse = await fetch(
      `https://www.roblox.com/avatar-thumbnails?params=[{userId:${userId}}]`
    );

    const avatarBodyResponse = await fetch(
      `https://thumbnails.roblox.com/v1/users/avatar?userIds=${userId}&size=250x250&format=Png&isCircular=false`
    );

    if (!avatarThumbnailResponse.ok) {
      return await interaction.reply({
        content: "Error fetching avatar!",
        ephemeral: true,
      });
    }

    if (!avatarBodyResponse.ok) {
      return await interaction.reply({
        content: "Error fetching avatar!",
        ephemeral: true,
      });
    }

    const avatarData = await avatarBodyResponse.json();
    const avatarBodyUrl = avatarData.data[0]?.imageUrl;

    const thumbnailData = await avatarThumbnailResponse.json();
    const thumbnailUrl = thumbnailData[0]?.thumbnailUrl;

    const embed = new EmbedBuilder()
      .setTitle(`${displayName} (${userName})`)
      .setImage(avatarBodyUrl)
      .setThumbnail(thumbnailUrl)
      .setTimestamp(Date.now())
      .setColor(client.colour)
      .setURL(`https://www.roblox.com/users/${userId}/profile`)
      .setFooter({
        iconURL: interaction.user.displayAvatarURL(),
        text: `kos created by ${interaction.user.tag}`,
      })
      .addFields([
        {
          name: "Reason",
          value: interaction.options.getString("reason"),
        },
        {
          name: "User Bio",
          value: userData.description,
        },
        {
          name: `UserId`,
          value: userId,
          inline: true
        },
        {
          name: `Banned?`,
          value: userData.isBanned.toString(),
          inline: true
        }
      ]);

    const kosMsg = await client.channels.cache
      .get("1263743356991705128")
      .send({ embeds: [embed] });
    const msgLink = `https://discord.com/channels/${interaction.guild.id}/${kosMsg.channel.id}/${kosMsg.id}`;

    await interaction.reply({
      content: `KOS created! You can view it [here](${msgLink}).`,
      ephemeral: true,
    });
  },
};
