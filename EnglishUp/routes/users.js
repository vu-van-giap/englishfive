// routes/users.js
const { ObjectId, MongoClient } = require('mongodb');
const { createHmac, randomBytes } = require('crypto');
const auth = require('../auth-hook');
const oth = require('../oth-hook');

async function userRoutes(fastify, options) {
  // Danh sách user
  fastify.get('/users', { onRequest: auth }, async function (req, reply) {
  // Nếu user thường, redirect về trang bài viết
  if (req.user.role !== 'admin') {
    return reply.redirect('/posts');
  }
  // Admin mới xem được danh sách user
  const users = await this.mongo.db.collection('users').find().toArray();
  return reply.render('users.pug', {
    users,
    user: req.user,
  });
 });


  // Trang tạo user
  fastify.get('/create-user', { onRequest: [auth, oth('admin')] }, (req, reply) => {
    reply.render('create-user.pug');
  }); 

  // Xử lý tạo user
  fastify.post('/user', { onRequest: [auth, oth('admin')] }, async function (req, reply) {
    const salt = randomBytes(16).toString('hex');
    const hpass = createHmac('sha256', salt).update(req.body.password).digest('hex');

    await this.mongo.db.collection('users').insertOne({
      username: req.body.username,
      fullname: req.body.fullname,
      role: req.body.role,
      salt,
      hpass,
    });

    return reply.redirect('/users');
  });

  // Trang cập nhật user
  fastify.get('/update-user/:id', { onRequest: auth }, async function (req, reply) {
  if (req.user.role !== 'admin') {
    return reply.send('Bạn không có quyền cập nhật người dùng');
  }
  const user = await this.mongo.db.collection('users').findOne({ _id: new ObjectId(req.params.id) });
  return reply.render('update-user.pug', { user });
  });

  // Xử lý cập nhật user
  fastify.post('/update-user/:id', { onRequest: auth }, async function (req, reply) {
  if (req.user.role !== 'admin') {
    return reply.send('Bạn không có quyền chỉnh sửa người dùng');
  }

  await this.mongo.db.collection('users').updateOne(
    { _id: new ObjectId(req.params.id) },
    { $set: { fullname: req.body.fullname, username: req.body.username, role: req.body.role } }
  );
  return reply.redirect('/users');
  });

  // Xóa user
  fastify.get('/delete-user/:id', { onRequest: [auth, oth('admin')] }, async function (req, reply) {
    await this.mongo.db.collection('users').deleteOne({ _id: new ObjectId(req.params.id) });
    return reply.redirect('/users');
  });
}

module.exports = userRoutes;
