const { ActivityType, Guild, APIMessage } = require("discord.js");
const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  name: "ready",
  once: true,
  async execute(client) {
    console.clear();
    console.log(`🟩 Ready! ${client.user.tag} is logged in and online...`);

    const guild = client.guilds.cache.get(`1263360886005956650`);
    const userId = `996765315281199104`;

    client.user.setStatus('dnd');

    setInterval(() => {
      checkSpotifyStatus(client, guild, userId);
    }, 360000); // 6 minutes 
  },
};

async function checkSpotifyStatus(client, guild, userId) {
  try {
    const member = await guild.members.fetch(userId);
    const spotifyStatus = member.presence?.activities?.find(
      (activity) => activity.name === "Spotify"
    );

    if (spotifyStatus && spotifyStatus.assets) {
      const albumCoverURL = `https://i.scdn.co/image/${spotifyStatus.assets.largeImage.slice(8)}`;

      const imagePath = path.resolve(`cache/album_cover.png`);
      await downloadImage(albumCoverURL, imagePath);

      const avatarBuffer = fs.readFileSync(imagePath);
      const songName = spotifyStatus.details;
      const artistName = spotifyStatus.state;

      await setBotAvatar(client, avatarBuffer);
      await client.user.setBanner(avatarBuffer);
      await client.user.setActivity(`${songName} - ${artistName}`, { type: ActivityType.Listening });

      console.log("avatar updated!");
    } else {
      return;
    }
  } catch (error) {
    if (error.code === 50013) {
      console.error("Missing permissions to update status:", error);
    } else if (error.code === 50001) {
      console.error("Invalid form body:", error);
    } else {
      console.error("Error fetching Spotify status:", error);
    }
  }
}

async function setBotAvatar(client, avatarBuffer, retries = 5) {
  while (retries > 0) {
    try {
      await client.user.setAvatar(avatarBuffer);
      return;
    } catch (error) {
      if (error.code === 50035) { 
        console.error("Invalid image file, could not set avatar:", error);
        return;
      } else if (error.code === 50001) { 
        console.error("Rate limit reached, retrying in 5 seconds...");
        await delay(5000);
      } else {
        console.error("Error setting avatar:", error);
        return;
      }
      retries--;
    }
  }
  console.error("Exceeded maximum retries for setting avatar.");
}

async function downloadImage(url, imagePath) {
  const response = await axios({
    url,
    method: "GET",
    responseType: "stream",
  });

  const writer = fs.createWriteStream(imagePath);

  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on("finish", resolve);
    writer.on("error", reject);
  });
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
