// scripts/utils/episode-processor.js

const { parse } = require("node-html-parser");
const { parseFlexibleDate } = require('./convert-date');

/**
 * Processes an array of podcast episodes, extracting and formatting relevant information.
 * 
 * @param {Array} episodes - The array of raw episode objects from the podcast feed.
 * @returns {Array} - The processed array of episode objects with additional properties.
 */

function processEpisodes(episodes) {
  return episodes.map((episode) => {
    // Split the title into episode number and actual title
    const [episodeNumber, ...titleParts] = episode.title.split(":");
    episode.episodeNum = episodeNumber.replace("#", "");
    episode.title = titleParts.join(":").trim();

    // Convert the publication date to a more readable format
    episode.pubDateConverted = parseFlexibleDate(episode.pubDate);

    // Extract the share image from the episode description
    const root = parse(episode.description);
    const img = root.querySelector("img");
    episode.shareImg = img ? img.getAttribute("src") : null;

    return episode;
  });
}

module.exports = { processEpisodes };