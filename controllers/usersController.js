const db = require('../database');
const { asyncQuery } = require('../helpers/asyncQuery');

module.exports = {
  getUser: async (req, res) => {
    try {
      let sqlGet = `SELECT * FROM tbuser`;
      let results = await asyncQuery(sqlGet);
      res
        .status(200)
        .send({ messages: 'Get user was successful', user: results });
    } catch (error) {
      console.log(error);
      res.status(500).send({ messages: 'Get user failed', errors: true });
    }
  },
};
