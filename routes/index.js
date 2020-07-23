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
    // add clean episode number to object
    episode.episodeNum = episodeNumber.replace("#","");
    // add clean episode title
    episode.title = episode.title.replace(episodeNumber + ": ", ""); 
    // add neat episode date in Russian
    episode.pubDateConverted = moment(episode.pubDate).locale('ru').format("LL"); 
    
    return episode;
  })
});

router.get('/', (req, res) => {
  const articles = project.posts;
  res.render('index', { podcast, articles, projectInfo, path: "home" });
});

router.get('/about', (req, res) => {
  res.render('about', {
    projectInfo,
    path: req.path,
    pageTitle: 'О нас'
 });
});

router.get('/resources', (req, res) => {
  res.render('resources', {
    projectInfo,
    path: req.path,
    pageTitle: 'Ресурсы'
  });
});

router.route('/api/episode/:id').get(cors(), async (req, res) => {
  if (req.params.id) {
    result = episodes.find(obj => {
      return obj.episodeNum === req.params.id;
    });
  } else {
    result = []
  }
  res.json(result)
})

router.get('/episodes/:id', async (req, res) => {
  const slug = req.params.id;
  if (slug) {
    result = episodes.find(obj => {
      if (obj.episodeNum !== 'undefined') {
        return obj.episodeNum === slug;
      } else {
        res.render('error');
      }
    })
  } else {
    result = []
  }

  res.render('episode', Object.assign({},
    { projectInfo },
    {
      episode: result,
      path: req.path,
      isEpisodePage: true,
      layout: 'episode'
    }
  ));

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

  router.get('/blog', async (req, res) => {
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

});

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
