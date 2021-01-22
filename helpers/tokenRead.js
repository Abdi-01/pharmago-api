const jwt = require('jsonwebtoken');

module.exports = {
  readToken: (req, res, next) => {
    jwt.verify(req.token, 'xsPharmago321', (err, decoded) => {
      if (err) {
        return res.status(401).send('User not Authorization');
      }
      req.user = decoded;
      next();
    });
  },
};
