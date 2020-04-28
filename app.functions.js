const fs = require('fs-extra');
const info = require('./blog/preferences.json');
const md = require('markdown-it')({ html: true });

class MarkdownBlog {
  constructor(path) {
    this._posts = [];
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
    return this._posts;
  }

  async getPosts() {
    if (this._posts.length > 0) {
      return this._posts;
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
      this._posts.push(postData);
      } else {
      throwError(md, "doesn't exist? Error in .json? Forgot to copy file?");
      }
    })
    
    return this._posts;
  }
  
  getPostMetadata(slug) {
    return this._posts.find(a => a.slug === slug);
  }
  
  getPostMarkdown(slug) {
    return fs.readFileSync(this.path + slug + '.md', 'utf8');
  }

  renderMarkdown(slug) {
    return md.render(this.getPostMarkdown(slug));
  }
  // outside blog.sortBy("date", true)
  // inside this class this.sortBy("date", true)
  sortBy(props) {
    let asc = 1; // ascending true, default
    if(props.asc !== undefined) {
      asc = props.asc ? 1 : -1;
    } 

    this._posts = this._posts.sort((a, b) => {
      const alc = a[props.property].toLowerCase();
      const blc = b[props.property].toLowerCase();
      return alc < blc ? -1 * asc : alc > blc ? 1 * asc : 0;
    });
    
    return this;
  }  
}

function throwError(message) {
  console.error("You messed up the file names. 😅");
  console.error(message);
  process.exit();
}

MarkdownBlog.requiredFields = ['title', 'description'];

module.exports = MarkdownBlog;