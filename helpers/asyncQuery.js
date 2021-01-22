const util = require('util');
const db = require('../db');

module.exports = {
  asyncQuery: util.promisify(db.query).bind(db),
};
