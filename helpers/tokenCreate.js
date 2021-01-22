const jwt = require('jsonwebtoken');

module.exports = {
  createJWTToken: (payload) => {
    return jwt.sign(payload, 'xsPharmago321', {
      expiresIn: '12h',
    });
  },
};
