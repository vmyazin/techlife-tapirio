// routes/index.js
const cors = require("cors");
const express = require("express");
const router = express.Router();
const path = require("path");
const Project = require("../scripts/app.functions");
const { processEpisodes } = require('../scripts/utils/episode-processor');

const statsRouter = require('./stats');

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

async function initializeProject() {
  await project.init();
  project.sortBy({ property: "date", asc: false });

  podcast = project.podcastModule.json.rss;
  episodes = processEpisodes(podcast.channel.item);

  // Make episodes available to the entire app
  router.use((req, res, next) => {
    req.app.locals.episodes = episodes;
    req.app.locals.podcast = podcast;
    next();
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

router.use('/stats', (req, res, next) => {
  res.locals.noIndex = true;
  next();
}, statsRouter);

router.get("/guests", (req, res) => {
  res.render("guests", {
    projectInfo,
    path: req.path,
    isHeroParallax: true,
    pageTitle: "Инструкции для гостей подкаста",
    pageDescription: "Если вас пригласили на подкаст в гости, вам надо подготовится. Мы объясняем как это сделать.",
    heroImg: "",
    pageShareImg: "/images/og-techlife-guests-1200.jpg",
    noIndex: true,
  });
});

router.get("/api/episode/:id", cors(), (req, res) => {
  const episode = episodes.find((obj) => obj.episodeNum === req.params.id) || null;
  res.json(episode);
});

router.get("/episodes/:id", (req, res, next) => {
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
    // Pass to the 404 handler
    next();
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