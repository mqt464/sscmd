const { 
  SlashCommandBuilder, 
  EmbedBuilder, 
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");
const fs = require("fs");
const path = require("path");
const axios = require("axios");

const queueFilePath = path.resolve(__dirname, "../../../cache/movieQueue.json");
const API_KEY = process.env.OMDB_API_KEY;

module.exports = {
  data: new SlashCommandBuilder()
    .setName("movie")
    .setDescription("Manage the movie suggestion queue")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("add")
        .setDescription("Add a movie to the queue")
        .addStringOption((option) =>
          option
            .setName("title")
            .setDescription("Movie title")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("link")
            .setDescription("Optional link to the movie")
            .setRequired(false)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("view")
        .setDescription("View the movie suggestion queue")
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("remove")
        .setDescription("Remove a movie from the queue")
        .addIntegerOption((option) =>
          option
            .setName("index")
            .setDescription("Movie number to remove")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("pick")
        .setDescription("Picks a random movie from the queue")
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("edit")
        .setDescription("Edit a movie in the queue")
        .addIntegerOption((option) =>
          option
            .setName("index")
            .setDescription("Movie number to edit")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option.setName("title").setDescription("New movie title (optional)")
        )
        .addStringOption((option) =>
          option.setName("link").setDescription("New movie link (optional)")
        )
    )
    .addSubcommand((subcommand) =>
      subcommand.setName("shuffle").setDescription("Shuffle the movie queue")
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("search")
        .setDescription("Search for a movie")
        .addStringOption((option) =>
          option
            .setName("title")
            .setDescription("Movie title")
            .setRequired(true)
        )
    ),
  async execute(interaction, client) {
    const subcommand = interaction.options.getSubcommand();
    let movieQueue = loadMovieQueue();

    if (subcommand === "add") {
      const title = interaction.options.getString("title");
      const link = interaction.options.getString("link");
      movieQueue.push({ title, link });

      saveMovieQueue(movieQueue);

      const embed = new EmbedBuilder()
        .setTitle(`${title} added!`)
        .setDescription(
          "has been added to the movie queue!\ndo `/movie view` to view the current queue!"
        )
        .setColor(client.colourGreen)
        .setTimestamp(Date.now())
        .setFooter({
          iconURL: interaction.user.displayAvatarURL(),
          text: `movie added by ${interaction.user.tag}`,
        });

      await interaction.reply({
        embeds: [embed],
      });
    }

    if (subcommand === "view") {
      if (movieQueue.length === 0) {
        await interaction.reply(
          "There are no movies in the movie queue! Use `/movie add [Movie title]` to add a movie to the queue!"
        );
        return;
      }

      const queueList = movieQueue
        .map((movie, index) => {
          const movieTitle = movie.link
            ? `[${movie.title}](${movie.link})`
            : movie.title;
          return `> **${index + 1}**. ${movieTitle}`;
        })
        .join("\n");

      const embed = new EmbedBuilder()
        .setTitle("Movie Queue")
        .setDescription(`${queueList}\n`)
        .setColor(client.colour)
        .setTimestamp(Date.now())
        .setFooter({
          iconURL: interaction.user.displayAvatarURL(),
          text: `requested by ${interaction.user.tag}`,
        });

      await interaction.reply({
        embeds: [embed],
      });
    }

    if (subcommand === "remove") {
      const index = interaction.options.getInteger("index") - 1;
      if (index >= 0 && index < movieQueue.length) {
        const removedMovie = movieQueue.splice(index, 1);

        saveMovieQueue(movieQueue);

        const embed = new EmbedBuilder()
          .setTitle(`${removedMovie[0].title} removed!`)
          .setColor(client.colourRed)
          .setTimestamp(Date.now())
          .setFooter({
            iconURL: interaction.user.displayAvatarURL(),
            text: `removed by ${interaction.user.tag}`,
          });

        await interaction.reply({
          embeds: [embed],
        });
      } else {
        await interaction.reply(
          `Invalid index number! Please enter a valid number from the movie queue.`
        );
      }
    }

    if (subcommand === "pick") {
      if (movieQueue.length === 0) {
        await interaction.reply(
          "There are no movies in the queue! Use `/movie add [Movie title]` to add a movie to the queue!"
        );
        return;
      }

      const randomIndex =
        movieQueue[Math.floor(Math.random() * movieQueue.length)];
      const pickedMovie = randomIndex.link
        ? `[${randomIndex.title}](${randomIndex.link})`
        : randomIndex.title;

      const embed = new EmbedBuilder()
        .setTitle(pickedMovie)
        .setDescription(`${pickedMovie} was picked randomly from the queue!`)
        .setColor(client.colour)
        .setTimestamp(Date.now())
        .setFooter({
          iconURL: interaction.user.displayAvatarURL(),
          text: `picked by ${interaction.user.tag}`,
        });

      await interaction.reply({
        embeds: [embed],
      });
    }

    if (subcommand === "edit") {
      const index = interaction.options.getInteger("index") - 1;
      const newTitle = interaction.options.getString("title");
      const newLink = interaction.options.getString("link");

      if (index < 0 || index >= movieQueue.length) {
        await interaction.reply(
          "Invalid index number! Please enter a valid number from the movie queue."
        );
        return;
      }

      const movieToEdit = movieQueue[index];

      if (newTitle) movieToEdit.title = newTitle;
      if (newLink) movieToEdit.link = newLink;

      saveMovieQueue(movieQueue);

      const embed = new EmbedBuilder()
        .setTitle("movie updated!")
        .setDescription(
          `**${index + 1}. ${movieToEdit.title}**\n${
            movieToEdit.link ? `[Watch it here](${movieToEdit.link})` : ""
          }`
        )
        .setColor(client.colourGreen)
        .setTimestamp(Date.now())
        .setFooter({
          iconURL: interaction.user.displayAvatarURL(),
          text: `edited by ${interaction.user.tag}`,
        });

      await interaction.reply({
        embeds: [embed],
      });
    }

    if (subcommand === "shuffle") {
      if (movieQueue.length === 0) {
        await interaction.reply("There are no movies in the queue to shuffle!");
        return;
      }

      for (let i = movieQueue.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [movieQueue[i], movieQueue[j]] = [movieQueue[j], movieQueue[i]];
      }

      saveMovieQueue(movieQueue);

      const shuffledList = movieQueue
        .map((movie, index) => {
          const movieTitle = movie.link
            ? `[${movie.title}](${movie.link})`
            : movie.title;
          return `> **${index + 1}**. ${movieTitle}`;
        })
        .join("\n");

      const embed = new EmbedBuilder()
        .setTitle("Shuffled Movie Queue")
        .setDescription(`${shuffledList}\n`)
        .setColor(client.colour)
        .setTimestamp(Date.now())
        .setFooter({
          iconURL: interaction.user.displayAvatarURL(),
          text: `Shuffled by ${interaction.user.tag}`,
        });

      await interaction.reply({
        embeds: [embed],
      });
    }

    if (subcommand === "search") {
      const title = interaction.options.getString("title");
    
      try {
        const response = await axios.get(`http://www.omdbapi.com/?t=${encodeURIComponent(title)}&apikey=${API_KEY}`);
        const movieData = response.data;
    
        if (movieData.Response === "True") {
          const embed = new EmbedBuilder()
            .setTitle(movieData.Title)
            .setDescription(movieData.Plot)
            .addFields(
              { 
                name: "Year", 
                value: `${movieData.Year} *(${movieData.Released})*`, 
                inline: true 
              },
              {
                name: "Genre",
                value: movieData.Genre,
                inline: true
              },
              { 
                name: "Runtime", 
                value: movieData.Runtime, 
                inline: true 
              },
              {
                name: "Ratings", 
                value: `Imdb: **${movieData.imdbRating}**\nMetascore: **${movieData.Metascore}**`, 
                inline: false 
              },
              {
                name: "Director",
                value: movieData.Director,
                inline: true
              },
              {
                name: "Writer(s)",
                value: movieData.Writer,
                inline: true
              },
              { 
                name: "Rated", 
                value: movieData.Rated, 
                inline: true 
              },
              {
                name: "Actors",
                value: movieData.Actors,
                inline: false
              },
              { 
                name: "Awards", 
                value: movieData.Awards, 
                inline: false 
              },
              { 
                name: "Votes", 
                value: `⬆️ ${movieData.imdbVotes}`, 
                inline: false 
              }
            )
            .setImage(movieData.Poster)
            .setColor(client.colour)
            .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
            .setTimestamp();
    
          const button = new ButtonBuilder()
            .setCustomId(`add_movie`)
            .setLabel(`Add "${movieData.Title}" to queue (${movieData.imdbID})`)
            .setStyle(`Success`);
    
          await interaction.reply({ 
            embeds: [embed],
            components: [new ActionRowBuilder().addComponents(button)]
          });

          setTimeout(async () => {
            
            const disabledButton = new ButtonBuilder()
              .setCustomId(`add_movie`)
              .setLabel(`button has timed out`)
              .setStyle(ButtonStyle.Secondary)
              .setDisabled(true);
    
            
            const message = await interaction.fetchReply();
            await message.edit({
              components: [new ActionRowBuilder().addComponents(disabledButton)],
            });
          }, 120000); // 2 mins till timeout
    
        } else {
          await interaction.reply(`No results found for **${title}**.`);
        }
      } catch (error) {
        console.error("Error fetching movie data:", error);
        await interaction.reply("There was an error fetching movie data. Please try again later.");
      }
    }
  },
};

function loadMovieQueue() {
  if (!fs.existsSync(queueFilePath)) {
    fs.writeFileSync(queueFilePath, JSON.stringify([])); // create file if it doesnt exist
  }
  const fileData = fs.readFileSync(queueFilePath, "utf-8");
  return JSON.parse(fileData);
}

function saveMovieQueue(queue) {
  fs.writeFileSync(queueFilePath, JSON.stringify(queue, null, 2));
}
