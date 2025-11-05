// routes/auth.js
const { ObjectId } = require('mongodb'); 
const jwt = require('jsonwebtoken');   
const { createHmac, randomBytes } = require('crypto'); 
const SECRETKEY = require('../config').SECRETKEY;
async function authRoutes(fastify, options) {
  // Trang login
  fastify.get('/login', async (req, reply) => {
    return reply.render('login.pug');
  });

  // Xử lý login
  fastify.post('/login', async function (request, reply) {
      const user = await this.mongo.db.collection("users").findOne({ username: request.body.username });
      if (user) {
          const newHpass = createHmac('sha256', user.salt).update(request.body.password).digest('hex');
          if (newHpass === user.hpass) {
              const token = jwt.sign({username: user.username,role:user.role}, SECRETKEY);
              reply.cookie("token", token);
              return reply.redirect('/users');
          } else {
              reply.send("Login failed");
              return;
          }
      } else {
          reply.send(`${request.body.username} not found`);
          return;
      }
  });

   // Trang đăng ký tài khoản
  fastify.get('/register', async (req, reply) => {
    return reply.render('register.pug');
  });

  // Xử lý đăng ký tài khoản
  fastify.post('/register', async function (req, reply) {
    const db = this.mongo.db;
    const { username, fullname, password } = req.body;

    // Kiểm tra username tồn tại
    const existing = await db.collection('users').findOne({ username });
    if (existing) return reply.send('Tên người dùng đã tồn tại');

    const salt = randomBytes(16).toString('hex');
    const hpass = createHmac('sha256', salt).update(password).digest('hex');

    await db.collection('users').insertOne({
      username,
      fullname,
      role: 'user', // mặc định là user thường
      salt,
      hpass,
    });

    return reply.redirect('/login');
  });

  // Đăng xuất
  fastify.get('/logout', (req, reply) => {
    reply.clearCookie('token');
    reply.redirect('/login');
  });
}

module.exports = authRoutes;
