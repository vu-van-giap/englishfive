// backend/routes/auth.js
const jwt = require('jsonwebtoken');
const { createHmac, randomBytes } = require('crypto');
const { SECRETKEY } = require('../config');

async function authRoutes(fastify, options) {
  const db = fastify.mongo.db;

  // Đăng ký
  fastify.post('/register', async (req, reply) => {
    const { username, fullname, password } = req.body;
    const existing = await db.collection('users').findOne({ username });
    if (existing) return reply.code(400).send({ message: 'Tên người dùng đã tồn tại' });

    const salt = randomBytes(16).toString('hex');
    const hpass = createHmac('sha256', salt).update(password).digest('hex');

    await db.collection('users').insertOne({
      username, fullname, role: 'user', salt, hpass,
    });

    reply.send({ message: 'Đăng ký thành công' });
  });

  // Đăng nhập
  fastify.post('/login', async (req, reply) => {
    const { username, password } = req.body;
    const user = await db.collection('users').findOne({ username });
    if (!user) return reply.code(404).send({ message: 'Người dùng không tồn tại' });

    const newHpass = createHmac('sha256', user.salt).update(password).digest('hex');
    if (newHpass !== user.hpass) return reply.code(401).send({ message: 'Sai mật khẩu' });

    const token = jwt.sign({ username: user.username, role: user.role }, SECRETKEY, { expiresIn: '1d' });
    reply.send({ token, role: user.role });
  });

  // Đăng xuất
  fastify.post('/logout', async (req, reply) => {
    reply.send({ message: 'Đăng xuất thành công' });
  });
}

module.exports = authRoutes;
