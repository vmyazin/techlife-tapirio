const xml2js = require('xml2js');
const md = require('markdown-it')({ html: true });
const fs = require('fs-extra');
const xmlParser = new xml2js.Parser({explicitArray : false});

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
            const parsedXml = await this.parseXml(f);
        })
        return true;
    }
    async renderContent(file) {
        const content = (await this.getContent(file)).content;
        console.log("FILE", this.path + file, content);
        return md.render(content)
    }

    async parseXml(file) {
        const string = fs.readFileSync(this.path + file, 'utf8')
        try {
            const parsedXml = (await xmlParser.parseStringPromise(string)).article;
            Compiler.requiredTags.forEach(requiredField => {
                if (!parsedXml[requiredField]) {
                    throwError(`${file} is missing a tag: ${requiredField}`);
                }
            })
            Compiler.requiredMetaFields.forEach(requiredField => {
                if (!parsedXml.meta[requiredField]) {
                    throwError(`${requiredField} is not included in <meta> for ${file}`);
                }
            })
            parsedXml.meta.slug = file.substr(0, file.length - 4);
            return parsedXml;
        } catch (err) {
            console.log("ERROR in", file, "\n", err);
        }
    }

    async listMeta() {
        const files = await this.getFiles();
        const meta = [];
        for(let i = 0; i < files.length; i++) {
            meta.push((await this.parseXml(files[i])).meta)
        }
        return meta;
    }
    async getContent(file) {
        const content = await this.parseXml(file);
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