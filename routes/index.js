const express = require('express');
const router = express.Router();
const md = require('markdown-it')({ html: true});

const fs = require('fs-extra');
const testFolder = './blog/articles';

async function listDir() {
  try {
    return await fs.readdir(testFolder);
  } catch (err) {
    console.error('Error occured while reading directory', err);
  }
}


async function getArticles() {
  const listOfArticleFiles = await listDir();
  // console.log("Meow", listOfArticleFiles);
  return listOfArticleFiles;
};




router.get('/', function(req, res, next) {
  res.render('index', { title: 'Markdown Blog' });
});

router.get('/about', (req, res) => {
  res.render('about');
});

router.get('/blog', async (req, res) => {
  let list = await getArticles();
  console.log(list); // <- help here
  let blogData = fs.readFileSync('blog/articles/article1.md', 'utf8');
  let content = md.render(blogData);

  console.log(content);
  res.render('blog', { content });
});

router.get('/blog/:name', (req, res) => {
  let blogData = fs.readFileSync('blog/articles/' + req.params.name + '.md', 'utf8');

  const payload = Object.assign({});
  payload.content = md.render(blogData);
  payload.isBlog = true;
  payload.path = req.path;
  payload.layout = 'blog';
  payload.isBlogPost = true;

  res.render('article', payload);
});

module.exports = router;
