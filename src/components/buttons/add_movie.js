const fs = require("fs");
const path = require("path");

// Path to your movie queue file
const queueFilePath = path.resolve(__dirname, "../../../cache/movieQueue.json");

module.exports = {
  data: {
    name: `add_movie`,
  },
  async execute(interaction, client) {
    const label = interaction.component.label;
    const titleMatch = label.match(/"([^"]+)"/); // extract movie name from quotes
    const linkMatch = label.match(/\(([^)]+)\)/);

    if (titleMatch) {
      const movieTitle = titleMatch[1];
      const movieQueue = loadMovieQueue();
      const movieLink = `https://www.imdb.com/title/${linkMatch[1]}`;

      const movieExists = movieQueue.some(movie => movie.title === movieTitle);
      if (movieExists) {
        await interaction.reply({
          content: `${movieTitle} is already in the queue!`,
          ephemeral: true,
        })
        return;
      }

      const movieObject = {
        title: movieTitle,
        link: movieLink,
      };

      movieQueue.push(movieObject);
      saveMovieQueue(movieQueue);

      await interaction.reply({
        content: `${movieTitle} was successfully added to the queue!`,
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content: `there was an error adding this movie to the queue`,
        ephemeral: true,
      });
    }
  },
};

function loadMovieQueue() {
  if (!fs.existsSync(queueFilePath)) {
    fs.writeFileSync(queueFilePath, JSON.stringify([])); // Create the file if it doesn't exist
  }
  const fileData = fs.readFileSync(queueFilePath, "utf-8");
  return JSON.parse(fileData);
}

function saveMovieQueue(queue) {
  fs.writeFileSync(queueFilePath, JSON.stringify(queue, null, 2));
}
