const jwt = require("jsonwebtoken");

module.exports = {
  signToken: (payload) => {
    return jwt.sign(payload, process.env.JWT_KEY);
  },
  verifyToken: (token) => {
    return jwt.verify(token, process.env.JWT_KEY);
  },
};
