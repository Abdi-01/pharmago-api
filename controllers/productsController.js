const db = require('../database');
const { asyncQuery } = require('../helpers/asyncQuery');

module.exports = {
  getProducts: async (req, res) => {
    // console.log('req', req.query.keywordSearch.length);
    const { keywordSearch } = req.query;
    try {
      let sqlGet =
        keywordSearch != undefined
          ? `SELECT * FROM tbproduct WHERE name LIKE "${keywordSearch}%"`
          : `SELECT * FROM tbproduct`;

      let results = await asyncQuery(sqlGet);
      res
        .status(200)
        .send({ messages: 'Get products was successful', products: results });
    } catch (error) {
      console.log(error);
      res.status(500).send({ messages: 'Get products failed', errors: true });
    }
  },
};
