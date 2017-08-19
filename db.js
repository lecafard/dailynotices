const config = require('./config'),
      sqlite = require('sqlite');

let db = sqlite.open(config.db);
module.exports = db;
