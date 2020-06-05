const cors = require('cors')
const express = require('express');
const router = express.Router();
router.blogPath = './content/articles/';
const MarkdownBlog = require('../scripts/app.functions');
const blog = new MarkdownBlog(router.blogPath, {
  podcastFeedXml: './public/podcast-feed.xml'
});

const projectInfo = blog.info;
let podcast = {};

blog.init().then(() => {
  blog.sortBy({ property: "date", asc: false })
  podcast = blog.podcastModule.json;
});

router.get('/', (req, res) => {
  const articles = blog.posts;
  res.render('index', { podcast, articles, projectInfo, path: req.path });
});

router.get('/tags', async (req, res) => {
  const tags = blog.tags;
  res.render('tags', { tags, projectInfo, path: req.path });
});

router.get('/tags/:tag', async (req, res) => {
  const tag = req.params.tag;
  const tags = blog.tags;
  const articles = await blog.getPostsByTag(tag);
  res.render('tag', { tag, tags, articles, projectInfo, path: req.path });
});

router.get('/about', (req, res) => {
  res.render('about', { projectInfo, path: req.path });
});

router.get('/contact', (req, res) => {
  res.render('contact', { projectInfo, path: req.path });
});

router.get('/blog', async (req, res) => {
  const articles = blog.posts;
  res.render('blog', { articles, projectInfo, path: req.path });
});

router.get('/podcast', async (req, res) => {
  ///
  const articles = blog.posts;
  res.render('blog', { articles, projectInfo, path: req.path });
});



router.route('/api/search').get(cors(), async (req, res) => {
  const articles = blog.posts;
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
  const postMetaData = blog.getPostMetadata(slug);

  if (!postMetaData) {
    res.render('blog-not-found', slug);
    return;
  }

  res.render('article', Object.assign({},
    { postMetaData },
    { projectInfo },
    {
      content: await blog.renderMarkdown(slug),
      path: req.path,
      layout: 'blog',
      isBlog: true,
      isBlogPost: true
    }
  ));
});

module.exports = router;
