// backend/utils/jwt.js
const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key'; // Use env variable in production

function generateToken(payload, expiresIn = '15h') {
  return jwt.sign(payload, SECRET, { expiresIn });
}

function verifyToken(token) {
  return jwt.verify(token, SECRET);
}

module.exports = { generateToken, verifyToken };