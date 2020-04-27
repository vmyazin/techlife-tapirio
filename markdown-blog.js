const fs = require('fs-extra');
const info = require('./blog/preferences.json');
const md = require('markdown-it')({ html: true });

class MarkdownBlog {
    constructor(path) {
        this.cachedPosts = [];
        this.info = info;
        this.path = path;
        this.getPosts();
    }
    async listFiles() {
        try {
          return await fs.readdir(this.path);
        } catch (err) {
          console.error('Error occured while reading directory', err);
        }
      }
    get posts() {
      return this.cachedPosts;
    }
    async getPosts() {
        if (this.cachedPosts.length > 0) {
          return this.cachedPosts;
        }
        const list = await this.listFiles();
        list.filter(f => f.endsWith('.json')).forEach(f => {
          const postData = JSON.parse(fs.readFileSync(this.path + f, 'utf8'));
          postData.slug = f.substr(0, f.length - 5);
          const md = this.path + postData.slug + '.md';
          // Check a post has title and a description
          MarkdownBlog.requiredFields.forEach(requiredField => {
            if (!postData[requiredField]) {
              throwError(`${f} is missing ${requiredField}`);
            }
          })
          if (fs.existsSync(md)) {
            this.cachedPosts.push(postData);
          } else {
            throwError(md, "doesn't exist? Error in .json? Forgot to copy file?");
          }
      
        })
        return this.cachedPosts;
      }
      getPostMetadata(slug) {
        return articles.find(a => a.slug === slug);
      }
      getPostMarkdown(slug) {
        return fs.readFileSync(this.path + slug + '.md', 'utf8');
      }
      renderMarkdown(slug) {
        return md.render(this.getPostMarkdown(slug));
      }
}

function throwError(message) {
  console.error("You messed up the file names. 😅");
  console.error(message);
  process.exit();
}

MarkdownBlog.requiredFields = ['title', 'description'];

module.exports = MarkdownBlog;