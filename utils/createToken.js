const JWT = require("jsonwebtoken");

const createToken = (payload) =>
  JWT.sign({ userId: payload }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE_IN,
  });

module.exports = createToken;
