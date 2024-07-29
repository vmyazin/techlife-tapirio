// compiler.js
const md = require('markdown-it')({ html: true });
const fs = require('fs-extra');
const path = require('path');

class Compiler {
    constructor(contentPath) {
        this.contentPath = contentPath;
        this.files_ = null;
    }

    async getFiles() {
        if (!this.files_) {
            this.files_ = await this.listFiles();
        }
        return this.files_;
    }

    async compileAll() {
        const files = await this.getFiles();
        return Promise.all(files.map(f => this.parseFile(f)));
    }

    async renderContent(file) {
        const { content } = await this.getContent(file);
        return md.render(content);
    }

    async parseMeta(string, file) {
        const lines = string.split("\n");
        const meta = {};
        lines.forEach(l => {
            const i = l.indexOf(':');
            if (i > -1) meta[l.substring(0, i).trim()] = l.substring(i + 1).trim();
        });

        Compiler.requiredMetaFields.forEach(requiredField => {
            if (!meta[requiredField]) {
                this.throwError(`${requiredField} is not included in <meta> for ${file}`);
            }
        });

        meta.slug = path.basename(file, '.md');
        meta.tags = meta.tags ? meta.tags.split(',').map(t => t.trim()) : [];
        return meta;
    }

    async parseFile(file) {
        const filePath = path.join(this.contentPath, file);
        try {
            const string = await fs.readFile(filePath, 'utf8');
            const metaIndexStart = string.indexOf('---');
            const metaIndexEnds = string.indexOf('---', metaIndexStart + 1);

            if (metaIndexStart === -1 || metaIndexEnds === -1) {
                throw new Error('Invalid file format: missing metadata delimiters');
            }

            const content = string.substring(metaIndexEnds + 3).trim();
            const metaString = string.substring(metaIndexStart + 3, metaIndexEnds).trim();
            const meta = await this.parseMeta(metaString, file);
            return { meta, content };
        } catch (err) {
            console.error(`Error parsing file ${file}:`, err);
            return null;
        }
    }

    async listMeta() {
        const files = await this.getFiles();
        const metaPromises = files.map(file => this.parseFile(file).then(result => result?.meta));
        return (await Promise.all(metaPromises)).filter(Boolean);
    }

    async getContent(file) {
        return this.parseFile(file);
    }

    async listFiles() {
        try {
            const files = await fs.readdir(this.contentPath);
            return files.filter(file => path.extname(file).toLowerCase() === '.md');
        } catch (err) {
            console.error('Error occurred while reading directory:', err);
            return [];
        }
    }

    throwError(message) {
        console.error("An error occurred in the file processing:");
        console.error(message);
        throw new Error(message);
    }

    static requiredMetaFields = ['title', 'description'];
    static requiredTags = ['meta', 'content'];
}

module.exports = Compiler;