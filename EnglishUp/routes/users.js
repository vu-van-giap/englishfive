// routes/users.js
const { ObjectId } = require('mongodb');
const { createHmac, randomBytes } = require('crypto');
const auth = require('../auth-hook');
const oth = require('../oth-hook');

async function userRoutes(fastify, options) {

  fastify.get('/', { onRequest: auth }, async (req, reply) => {
    const users = await fastify.mongo.db.collection('users').find().toArray();
    reply.send(users);
  });

  fastify.post('/', { onRequest: [auth, oth('admin')] }, async (req, reply) => {
    const { username, fullname, password, role } = req.body;
    const salt = randomBytes(16).toString('hex');
    const hpass = createHmac('sha256', salt).update(password).digest('hex');

    await fastify.mongo.db.collection('users').insertOne({
      username, fullname, role, salt, hpass
    });

    reply.send({ message: 'Tạo user thành công' });
  });

  fastify.put('/:id', { onRequest: auth }, async (req, reply) => {
    const { fullname, username, role } = req.body;
    await fastify.mongo.db.collection('users').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { fullname, username, role } }
    );
    reply.send({ message: 'Cập nhật thành công' });
  });

  fastify.delete('/:id', { onRequest: [auth, oth('admin')] }, async (req, reply) => {
    await fastify.mongo.db.collection('users').deleteOne({ _id: new ObjectId(req.params.id) });
    reply.send({ message: 'Xóa thành công' });
  });
}

module.exports = userRoutes;
