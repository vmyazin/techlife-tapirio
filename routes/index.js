const express = require('express');
const router = express.Router();
const md = require('markdown-it')({ html: true });
const blogInfo = require('../blog/preferences.json');

const fs = require('fs-extra');
const articlesFolder = './blog/articles/';
const cachedArticles = [];

async function listDir() {
  try {
    return await fs.readdir(articlesFolder);
  } catch (err) {
    console.error('Error occured while reading directory', err);
  }
}

async function getArticles() {
  if (cachedArticles.length > 0) {
    return cachedArticles;
  }
  const list = await listDir();
  list.filter(f => f.endsWith('.json')).forEach(f => {
    const blogData = JSON.parse(fs.readFileSync(articlesFolder + f, 'utf8'));
    blogData.slug = f.substr(0, f.length - 5);
    const md = articlesFolder + blogData.slug + '.md';
    if (fs.existsSync(md)) {
      cachedArticles.push(blogData);
    } else {
      console.error("You messed up the file names. 😅");
      console.error(md, "doesn't exist? Error in .json? Forgot to copy file?");
      process.exit();
    }

  })
  return cachedArticles;
};

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
  const articles = await getArticles();
  res.render('blog', { articles, blogInfo });
});

router.get('/blog/:name', async (req, res) => {
  const articles = await getArticles();
  // Includes json info!!!
  const articleMetaData = articles.find(a => a.slug == req.params.name);
  if (!articleMetaData) {
    es.render('blog-not-found', req.params.name);
    return;
  }
  let postData = fs.readFileSync(articlesFolder + articleMetaData.slug + '.md', 'utf8');
  res.render('article', Object.assign({},
    articleMetaData,
    { blogInfo }, {
    content: md.render(postData),
    isBlog: true,
    path: req.path,
    layout: 'blog',
    isBlogPost: true
  }));
});

module.exports = router;
