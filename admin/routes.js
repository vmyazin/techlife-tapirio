const cors = require('cors')
const express = require('express');
const router = express.Router();
router.blogPath = './content/articles/';
const MarkdownBlog = require('../scripts/app.functions');
const blog = new MarkdownBlog(router.blogPath);
const blogInfo = blog.info;
blog.init().then(() => blog.sortBy({ property: "date", asc: false }));

router.get('/', (req, res) => {
  const articles = blog.posts;
  res.render('home', { articles, blogInfo, path: req.path });
});

router.route('/api/search').get(cors(), async (req, res) => {
  const articles = blog.posts;
  const search = req.query.name.toLowerCase()

  if (search) {
    results = articles.filter((a) => (a.title + a.description + a.author).toLowerCase().includes(search));
    console.info(search, results)
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
    { blogInfo },
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
