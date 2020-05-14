const md = require('markdown-it')({ html: true });
const fs = require('fs-extra');

class Compiler {
    constructor(path) {
        this.path = path;
    }
    async getFiles() {
        if (!this.files_) {
            this.files_ = await this.listFiles();
        }
        return this.files_;
    }
    async compileAll() {
        (await this.getFiles()).forEach(async (f) => {
            const parsedXml = await this.parseFile(f);
        })
        return true;
    }
    async renderContent(file) {
        const content = (await this.getContent(file)).content;
        console.log("FILE", this.path + file, content);
        return md.render(content)
    }

    async parseMeta(string, file) {
        const lines = string.split("\n");
        const meta = {};
        lines.forEach(l => {
            const i = l.indexOf(':');
            if (i > -1) meta[l.substring(0, i)] = l.substring(i + 1).trim();
        })
        Compiler.requiredMetaFields.forEach(requiredField => {
            if (!meta[requiredField]) {
                throwError(`${requiredField} is not included in <meta> for ${file}`);
            }
        })
        meta.slug = file.substr(0, file.length - 3);
        const tags = meta.tags;
        meta.tags = tags ? tags.split(',') : [];
        return meta;
    }
    async parseFile(file) {
        const string = fs.readFileSync(this.path + file, 'utf8')
        try {
            const metaIndexStart = string.indexOf('---');
            const metaIndexEnds = string.indexOf('---', metaIndexStart + 1);
            const content = string.substring(metaIndexEnds + 3);
            const metaString = string.substring(0, metaIndexEnds);
            const meta = await this.parseMeta(metaString, file);
            return { meta, content };
        } catch (err) {
            console.log("Error in format occured. Follow the pattren to create a file.", file, "\n", err);
        }
    }

    async listMeta() {
        const files = await this.getFiles();
        const meta = [];
        for(let i = 0; i < files.length; i++) {
            meta.push((await this.parseFile(files[i])).meta)
        }
        return meta;
    }
    async getContent(file) {
        const content = await this.parseFile(file);
        return content;
    }

    async listFiles() {
        try {
            return await fs.readdir(this.path);
        } catch (err) {
            console.error('Error occured while reading directory', err);
        }
    }
}

function throwError(message) {
    console.error("You messed up the file names. 😅");
    console.error(message);
    process.exit();
}

Compiler.requiredMetaFields = ['title', 'description'];
Compiler.requiredTags = ['meta', 'content'];

module.exports = Compiler;