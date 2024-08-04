// routes/stats.js
const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const xml2js = require('xml2js');
const router = express.Router();
const { parseFlexibleDate } = require('../scripts/utils/convert-date');

const parser = new xml2js.Parser();

router.get('/', async (req, res) => {
  try {
    const { episodes, projectInfo } = req.app.locals;

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

    // Load and parse the audience.json file
    const audienceData = JSON.parse(await fs.readFile(path.join(__dirname, '../public/data/audience.json'), 'utf8'));

    const totalDuration = episodes.reduce((total, item, index) => {
      const duration = item['itunes:duration'] || item.duration;
      const parsedDuration = parseDuration(duration);
      return total + parsedDuration;
    }, 0);

    const totalHours = Math.round(totalDuration / 3600); // Convert seconds to hours and round

    // Load and parse the XML file
    const xmlData = await fs.readFile(path.join(__dirname, '../public/data/podcast-stats.xml'), 'utf8');
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
        pubDateConverted: parseFlexibleDate(item.pubDate), // Convert pubDate using parseFlexibleDate
        duration: item['itunes:duration'] || item.duration
      });
      return acc;
    }, {});

    console.log('episodesByYear:', JSON.stringify(episodesByYear, null, 2));

    // Sort episodes within each year from oldest to newest
    Object.keys(episodesByYear).forEach(year => {
      episodesByYear[year].sort((a, b) => a.pubDate - b.pubDate);
    });

    // Sort years from newest to oldest
    const sortedYears = Object.keys(episodesByYear).sort((a, b) => b - a);

    console.log(audienceData);

    // Process audience data
    const audienceSummary = audienceData.audience.dataSources.map(source => {
      const sourceName = source.name;
      const yearSummaries = Object.entries(source.years).map(([year, months]) => {
        const totalPlays = months.reduce((sum, month) => sum + month.plays, 0);
        return { year, totalPlays };
      });
      return { sourceName, yearSummaries };
    });

    res.render('stats', {
      projectInfo,
      listeners,
      totalHours: Math.round(totalDuration / 60 / 60),
      countries: countriesCount,
      guests: guestsCount,
      episodesByYear,
      audienceSummary,
      path: `${req.baseUrl}${req.path}`,
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