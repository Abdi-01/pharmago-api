const util = require('util');
const pool = require('../db');

module.exports = {
  asyncQuery: util.promisify(pool.query).bind(pool),
};
