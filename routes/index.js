const express = require('express');
const router = express.Router();
const md = require('markdown-it')({ html: true});

const fs = require('fs-extra');
const testFolder = './blog/articles';
const cachedArticles = [];


async function listDir() {
  try {
    return await fs.readdir(testFolder);
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
    const blogData = JSON.parse(fs.readFileSync('blog/articles/' + f, 'utf8'));
    blogData.slug = f.substr(0, f.length - 5);
    const md = 'blog/articles/' + blogData.slug + '.md';
    if (fs.existsSync(md)) {
      cachedArticles.push(blogData);
    } else {
      console.error("You messed up with file names!");
      console.error(md, "doesn't exist? Error in .json? Forgot to copy file? Fix your sh*t.");
      process.exit();
    }
    
  })
  return cachedArticles;
};




router.get('/', function(req, res, next) {
  res.render('index', { title: 'Markdown Blog' });
});

router.get('/about', (req, res) => {
  res.render('about');
});

router.get('/blog', async (req, res) => {
  const articles = await getArticles();
  console.log(content);
  res.render('article-list', { articles });
});

router.get('/blog/:name', async (req, res) => {
  const articles = await getArticles();
  // Includes json info!!!
  const articleMetaData = articles.find(a => a.slug == req.params.name);
  if (!articleMetaData) {
    es.render('blog-not-found', req.params.name);
    return;
  }
  let blogData = fs.readFileSync('blog/articles/' + articleMetaData.slug + '.md', 'utf8');
  articleMetaData.content = md.render(blogData);
  articleMetaData.isBlog = true;
  articleMetaData.path = req.path;
  articleMetaData.layout = 'blog';
  articleMetaData.isBlogPost = true;

  res.render('article', articleMetaData);
});

module.exports = router;
