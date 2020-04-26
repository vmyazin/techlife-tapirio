const express = require('express');
const router = express.Router();
const md = require('markdown-it')({ html: true});

const fs = require('fs');
const fsPromises = fs.promises;
const testFolder = './blog/articles';

function listDir() {
  try {
    return fsPromises.readdir(testFolder);
  } catch (err) {
    console.error('Error occured while reading directory', err);
  }
}

let listOfArticleFiles = listDir();
function getArticles() {
  listOfArticleFiles.then(function(result) {
    console.log(result); // I need this outside the function
    return result;
  });
};

getArticles();


router.get('/', function(req, res, next) {
  res.render('index', { title: 'Markdown Blog' });
});

router.get('/about', (req, res) => {
  res.render('about');
});

router.get('/blog', (req, res) => {
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
