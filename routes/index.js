let express = require('express');
let router = express.Router();
let md = require('markdown-it')({ html: true});

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
