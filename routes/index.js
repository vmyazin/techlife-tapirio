// routes/index.js
const cors = require("cors");
const express = require("express");
const router = express.Router();
const path = require("path");
const Project = require("../scripts/app.functions");
const { parse } = require("node-html-parser");
const moment = require("moment");
require("moment/locale/ru");

// Constants
const BLOG_PATH = path.join(__dirname, "..", "content", "articles");
const PODCAST_FEED_XML = path.join(__dirname, "..", "public", "podcast-feed.xml");
const DEFAULT_IMAGE = "/images/bg-photo-02.jpg";

// Initialize project
const project = new Project(BLOG_PATH, { podcastFeedXml: PODCAST_FEED_XML });
let projectInfo = project.info;
let podcast = {};
let episodes = [];

// Update current year
projectInfo.currentYear = new Date().getFullYear();

function parseFlexibleDate(dateString) {
  const formats = ["ddd, D MMM YYYY HH:mm:ss [UTC]", "ddd, D MMM YYYY HH:mm [UTC]"];
  let parsedDate = moment(dateString, formats, 'en', true);

  if (!parsedDate.isValid()) {
    const regex = /(\w{3}), (\d{1,2}) (\w{3}) (\d{4}) (\d{2}):(\d{2})(?::(\d{2}))? UTC/;
    const match = dateString.match(regex);
    if (match) {
      const [, , day, monthStr, year, hours, minutes, seconds] = match;
      const month = moment().month(monthStr).format('M') - 1;
      parsedDate = moment.utc([year, month, day, hours, minutes, seconds || 0]);
    }
  }

  return parsedDate.isValid() ? parsedDate.locale('ru').format('D MMMM YYYY') : 'Дата не указана';
}

async function initializeProject() {
  await project.init();
  project.sortBy({ property: "date", asc: false });

  podcast = project.podcastModule.json.rss;
  episodes = podcast.channel.item.map((episode) => {
    const [episodeNumber, ...titleParts] = episode.title.split(":");
    episode.episodeNum = episodeNumber.replace("#", "");
    episode.title = titleParts.join(":").trim();
    episode.pubDateConverted = parseFlexibleDate(episode.pubDate);

    const root = parse(episode.description);
    const img = root.querySelector("img");
    episode.shareImg = img ? img.getAttribute("src") : null;

    return episode;
  });
}

initializeProject();

// Route handlers
router.get("/", (_req, res) => {
  res.render("index", {
    podcast,
    articles: project.posts,
    projectInfo,
    isHeroParallax: true,
    heroImg: DEFAULT_IMAGE,
    path: "home",
  });
});

router.get("/home-2021", (req, res) => {
  res.render("home-2021", {
    podcast,
    projectInfo,
    path: req.path,
    pageTitle: "О нас",
    isHeroParallax: true,
    heroImg: "/images/bg-techlife-kamas.jpg",
  });
});

router.get("/about", (req, res) => {
  res.render("about", {
    projectInfo,
    path: req.path,
    pageTitle: "О нас",
    isHeroParallax: true,
    heroImg: "/images/bg-techlife-kamas.jpg",
    pageDescription: "Авторы Дмитрий Здоров и Василий Мязин давние друзья и записывают подкаст о технологиях часто находясь в разных странах",
  });
});

router.get("/resources", (req, res) => {
  res.render("resources", {
    projectInfo,
    path: req.path,
    isHeroParallax: true,
    pageTitle: "Ресурсы",
    heroImg: "/images/bg-lightning.jpg",
    pageDescription: "Дополнительные материалы в качестве приложения к подкасту; статьи, картинки, ссылки и т. п.",
  });
});

router.get("/guests", (req, res) => {
  res.render("guests", {
    projectInfo,
    path: req.path,
    isHeroParallax: true,
    pageTitle: "Инструкции для гостей подкаста",
    pageDescription: "Если вас пригласили на подкаст в гости, вам надо подготовится. Мы объясняем как это сделать.",
    heroImg: "",
    pageShareImg: "/images/og-techlife-guests-1200.jpg",
  });
});

router.get("/api/episode/:id", cors(), (req, res) => {
  const episode = episodes.find((obj) => obj.episodeNum === req.params.id) || null;
  res.json(episode);
});

router.get("/episodes/:id", (req, res) => {
  const slug = req.params.id;
  const index = episodes.findIndex((obj) => obj.episodeNum === slug);

  if (index !== -1) {
    res.render("episode", {
      projectInfo,
      episode: episodes[index],
      nextEpisode: episodes[index + 1] || null,
      prevEpisode: episodes[index - 1] || null,
      path: req.path,
      isEpisodePage: true,
      isHeroParallax: true,
      heroImg: DEFAULT_IMAGE,
      layout: "episode",
    });
  } else {
    res.status(404).render("error", { message: "Episode not found" });
  }
});

router.get("/tags", (req, res) => {
  res.render("tags", {
    tags: project.tags,
    isHeroParallax: true,
    heroImg: DEFAULT_IMAGE,
    projectInfo,
    path: req.path,
  });
});

router.get("/tags/:tag", async (req, res) => {
  const { tag } = req.params;
  const articles = await project.getPostsByTag(tag);
  res.render("tag", {
    tag,
    tags: project.tags,
    isHeroParallax: true,
    heroImg: DEFAULT_IMAGE,
    articles,
    projectInfo,
    path: req.path,
  });
});

router.get("/blog", (req, res) => {
  res.render("blog", {
    articles: project.posts,
    projectInfo,
    isHeroParallax: true,
    heroImg: DEFAULT_IMAGE,
    path: req.path,
  });
});

router.get("/api/search", cors(), (req, res) => {
  const search = req.query.name.toLowerCase();
  const results = search
    ? project.posts.filter((a) =>
      (a.title + a.description + a.author).toLowerCase().includes(search)
    )
    : [];
  res.json(results);
});

router.get("/blog/:filename", async (req, res) => {
  const { filename } = req.params;
  const postMetaData = project.getPostMetadata(filename);

  if (!postMetaData) {
    return res.status(404).render("blog-not-found", { slug: filename });
  }

  const content = await project.renderMarkdown(filename);
  res.render("article", {
    postMetaData,
    projectInfo,
    content,
    path: req.path,
    layout: "blog",
    isHeroParallax: true,
    heroImg: DEFAULT_IMAGE,
    isBlog: true,
    isBlogPost: true,
  });
});

module.exports = router;