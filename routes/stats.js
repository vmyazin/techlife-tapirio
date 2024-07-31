// routes/stats.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const xml2js = require('xml2js');
const router = express.Router();

const parser = new xml2js.Parser();

router.get('/', async (req, res) => {
  try {
    const { episodes, projectInfo } = req.app.locals;
    console.log(`Request path: ${req.path}`);

    console.log(`Total number of episodes: ${episodes.length}`);

    function parseDuration(duration) {
      if (typeof duration !== 'string') {
        console.log('Duration is not a string:', duration);
        return 0;
      }

      const parts = duration.split(':').map(part => parseInt(part, 10));

      if (parts.length === 2) {
        // MM:SS format
        return parts[0] * 60 + parts[1];
      } else if (parts.length === 3) {
        // HH:MM:SS format
        return parts[0] * 3600 + parts[1] * 60 + parts[2];
      } else {
        console.log('Unexpected duration format:', duration);
        return 0;
      }
    }

    const totalDuration = episodes.reduce((total, item, index) => {
      const duration = item['itunes:duration'] || item.duration;
      const parsedDuration = parseDuration(duration);
      return total + parsedDuration;
    }, 0);

    const totalHours = Math.round(totalDuration / 3600); // Convert seconds to hours and round
    console.log(`Total duration: ${totalDuration} seconds (${totalHours} hours)`);

    // Load and parse the XML file
    const xmlData = fs.readFileSync(path.join(__dirname, '../public/data/podcast-stats.xml'), 'utf8');
    const parsedData = await parser.parseStringPromise(xmlData);

    const listeners = parseInt(parsedData['podcast-stats'].listeners[0], 10);
    const countriesCount = parsedData['podcast-stats'].countries[0].country.length;
    const guestsCount = parsedData['podcast-stats'].guests[0].guest.length;

    // Group by year and sort episodes within each year
    const episodesByYear = episodes.reduce((acc, item) => {
      const year = new Date(item.pubDate).getFullYear();
      if (!acc[year]) acc[year] = [];

      // Extract episode number from title if it's not already present
      let episodeNum = item.episodeNum;
      if (!episodeNum) {
        const match = item.title.match(/^#?(\d+):/);
        episodeNum = match ? match[1] : 'undefined';
      }

      acc[year].push({
        episodeNum: episodeNum,
        title: item.title,
        pubDate: new Date(item.pubDate), // Keep the publication date for sorting
        // Add any other properties you need
      });
      return acc;
    }, {});

    // Sort episodes within each year from oldest to newest
    Object.keys(episodesByYear).forEach(year => {
      episodesByYear[year].sort((a, b) => a.pubDate - b.pubDate);
    });

    // Sort years from newest to oldest
    const sortedYears = Object.keys(episodesByYear).sort((a, b) => b - a);

    res.render('stats', {
      projectInfo,
      listeners,
      totalHours: Math.round(totalDuration / 60 / 60),
      countries: countriesCount,
      guests: guestsCount,
      episodesByYear,
      path: `${req.baseUrl}${req.path}`, // Adjusted path
      isHeroParallax: false,
      pageTitle: "Статистика подкаста",
      pageShareImg: "/images/og-techlife-stats-1200.jpg",
      pageDescription: "Визуализация статистики подкаста Технологии и жизнь",
    });

  } catch (error) {
    console.error(error);
    res.status(500).send('Error generating visualization');
  }
});

module.exports = router;