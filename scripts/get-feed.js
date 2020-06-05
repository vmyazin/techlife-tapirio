const feedXml = require('../public/podcast-feed.xml')
const parser = new xml2js.Parser()
let data

class GetFeed {
  constructor(feedXml) {
    this.items = result;
  }
  
  init() {
    data += feedXml.toString()
    console.log('data', data);

    parser.parseString(data, function(err, result) {
      console.log('FINISHED', err, result);
    });
  }
}