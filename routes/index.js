const cors = require('cors')
const express = require('express');
const router = express.Router();
router.blogPath = './content/articles/';
const Project = require('../scripts/app.functions');
const project = new Project(router.blogPath, {
  podcastFeedXml: './public/podcast-feed.xml'
});

const moment = require('moment');
require('moment/locale/ru');

let projectInfo = project.info;
let podcast = {},
    episodes = {}
projectInfo.currentYear = moment().year()

project.init().then(() => {
  project.sortBy({ property: "date", asc: false })
  
  podcast = project.podcastModule.json.rss;
  episodes = podcast.channel.item.map(episode => {
    let episodeNumber = episode.title.split(":")[0];
    // add episode number key
    episode.episodeNum = episodeNumber.replace("#",""); // add clean episode number to object
    // add clean title
    episode.title = episode.title.replace(episodeNumber + ": ", ""); // add clean episode title;

    episode.pubDateConverted = moment(episode.pubDate).locale('ru').format("LL"); // add neat episode date in Russian
    
    return episode;
  })

  console.log(episodes);
});


router.get('/', (req, res) => {
  const articles = project.posts;
  res.render('index', { podcast, articles, projectInfo, path: req.path });
});

router.get('/tags', async (req, res) => {
  const tags = project.tags;
  res.render('tags', { tags, projectInfo, path: req.path });
});

router.get('/tags/:tag', async (req, res) => {
  const tag = req.params.tag;
  const tags = project.tags;
  const articles = await project.getPostsByTag(tag);
  res.render('tag', { tag, tags, articles, projectInfo, path: req.path });
});

router.get('/about', (req, res) => {
  res.render('about', { projectInfo, path: req.path });
});

router.get('/contact', (req, res) => {
  res.render('contact', { projectInfo, path: req.path });
});

router.get('/blog', async (req, res) => {
  const articles = project.posts;
  res.render('blog', { articles, projectInfo, path: req.path });
});

router.get('/podcast', async (req, res) => {
  ///
  const articles = project.posts;
  res.render('blog', { articles, projectInfo, path: req.path });
});



router.route('/api/search').get(cors(), async (req, res) => {
  const articles = project.posts;
  const search = req.query.name.toLowerCase()

  if (search) {
    results = articles.filter((a) => (a.title + a.description + a.author).toLowerCase().includes(search));
  } else {
    results = []
  }
  res.json(results)
})

router.get('/blog/:filename', async (req, res) => {
  const slug = req.params.filename;
  const postMetaData = project.getPostMetadata(slug);

  if (!postMetaData) {
    res.render('blog-not-found', slug);
    return;
  }

  res.render('article', Object.assign({},
    { postMetaData },
    { projectInfo },
    {
      content: await project.renderMarkdown(slug),
      path: req.path,
      layout: 'blog',
      isBlog: true,
      isBlogPost: true
    }
  ));
});

module.exports = router;
