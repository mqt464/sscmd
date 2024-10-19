const { SlashCommandBuilder } = require("discord.js");
const { execute } = require("../../events/client/ready");
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("gif")
    .setDescription("converts an image sent into a gif")
    .addAttachmentOption((option) =>
      option
        .setName("image")
        .setDescription("the image that will be converted into a gif")
        .setRequired(true)
    ),

  async execute(interaction, client) {
    const attachment = interaction.options.getAttachment("image");

    if (!attachment) {
      await interaction.reply({
        content: "please upload a valid image",
        ephemeral: true,
      });
      return;
    }

    const imagePath = path.resolve(`cache/${attachment.name}`);
    const gifPath = path.resolve(
      `cache/${path.parse(attachment.name).name}.gif`
    );

    try {
      await downloadImage(attachment.url, imagePath);
      await fs.rename(imagePath, gifPath);

      await interaction.reply({
        files: [gifPath],
      });

      await fs.unlink(gifPath);
    } catch (error) {
      console.error(error);
    }
  },
};

async function downloadImage(url, imagePath) {
  const response = await axios({
    url,
    method: "GET",
    responseType: "stream",
  });

  return new Promise((resolve, reject) => {
    const writer = fs.createWriteStream(imagePath);
    response.data.pipe(writer);
    writer.on("finish", resolve);
    writer.on("error", reject);
  });
}
