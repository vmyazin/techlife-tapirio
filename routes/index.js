const express = require('express');
const router = express.Router();
const MarkdownBlog = require('../markdown-blog');
const blog = new MarkdownBlog('./blog/articles/');
const blogInfo = blog.info;

router.get('/', function (req, res, next) {
  res.render('index', { blogInfo });
});

router.get('/about', (req, res) => {
  res.render('about');
});

router.get('/contact', (req, res) => {
  res.render('contact');
});

router.get('/blog', async (req, res) => {
  const articles = blog.posts;
  res.render('blog', { articles, blogInfo });
});

router.get('/blog/:name', async (req, res) => {
  const slug = req.params.name;
  // Includes json info!!!
  const postMetaData = blog.getPostMetadata(slug);

  if (!postMetaData) {
    res.render('blog-not-found', slug);
    return;
  }
  res.render('article', Object.assign({},
    postMetaData,
    { blogInfo }, {
    content: blog.renderMarkdown(slug),
    isBlog: true,
    path: req.path,
    layout: 'blog',
    isBlogPost: true
  }));
});

module.exports = router;
