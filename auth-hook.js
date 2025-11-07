// backend/auth-hook.js
const jwt = require('jsonwebtoken');
const { SECRETKEY } = require('./config');

async function auth(req, reply) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return reply.code(401).send({ message: 'Thiếu token' });

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, SECRETKEY);
    req.user = decoded; // chứa { username, role }
  } catch (err) {
    return reply.code(401).send({ message: 'Token không hợp lệ' });
  }
}

module.exports = auth;
