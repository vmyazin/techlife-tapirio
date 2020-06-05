const fs = require('fs-extra');
const xml2js = require('xml2js');
const xmlParser = new xml2js.Parser({explicitArray : false});

class GetPodcastFeed {
  constructor(xmlSourcePath) {
    this.xmlSourcePath = xmlSourcePath;
  }

  async convert() {
    const file = this.xmlSourcePath;
    console.log(file);
    const string = fs.readFileSync(file, 'utf8')
    this.json = (await xmlParser.parseStringPromise(string));
    // this.podcastItems = this.json.someItems.ChangeThis.ChangeThis
    // this.meta = this.json.someMeta;
    //console.log(this.json);
  }  
}

module.exports = GetPodcastFeed;