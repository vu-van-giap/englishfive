// routes/words.js
const { ObjectId } = require('mongodb');
const auth = require('../auth-hook');
const role = require('../role-hook');

async function wordRoutes(fastify, options) {
  const db = fastify.mongo.db;

  // Lấy danh sách từ vựng
  fastify.get('/', { onRequest: auth }, async (req, reply) => {
    const words = await db.collection('words').find().toArray();
    reply.send(words);
  });

  // Thêm từ vựng mới
  fastify.post('/', { onRequest: [auth, role('admin')] }, async (req, reply) => {
    const { english, vietnamese, type, pronunciation, example } = req.body;

    await db.collection('words').insertOne({
      english,
      vietnamese, 
      type,
      pronunciation,
      example,
      createdAt: new Date()
    });

    reply.send({ message: 'Thêm từ vựng thành công' });
  });

  // Cập nhật từ vựng
  fastify.put('/:id', { onRequest: [auth, role('admin')] }, async (req, reply) => {
    const { english, vietnamese, type, pronunciation, example } = req.body;
    
    await db.collection('words').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { english, vietnamese, type, pronunciation, example } }
    );

    reply.send({ message: 'Cập nhật thành công' });
  });

  // Xóa từ vựng
  fastify.delete('/:id', { onRequest: [auth, role('admin')] }, async (req, reply) => {
    await db.collection('words').deleteOne({ _id: new ObjectId(req.params.id) });
    reply.send({ message: 'Xóa thành công' });
  });
}

module.exports = wordRoutes;
