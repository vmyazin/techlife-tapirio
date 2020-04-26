let express = require('express');
let router = express.Router();
let md = require('markdown-it')();

let fs = require('fs');

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

module.exports = router;
