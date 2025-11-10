// routes/progress.js
const { ObjectId } = require('mongodb');
const auth = require('../auth-hook');

async function progressRoutes(fastify, options) {
  const db = fastify.mongo.db;

  // Lấy tiến độ học tập của user
  fastify.get('/', { onRequest: auth }, async (req, reply) => {
    const progress = await db.collection('progress')
      .find({ userId: req.user.username })
      .toArray();
    reply.send(progress);
  });

  // Cập nhật tiến độ khi học từ mới
  fastify.post('/', { onRequest: auth }, async (req, reply) => {
    const { wordId, status } = req.body;
    
    await db.collection('progress').insertOne({
      userId: req.user.username,
      wordId: new ObjectId(wordId),
      status, // 'new', 'learning', 'mastered'
      updatedAt: new Date()
    });

    reply.send({ message: 'Cập nhật tiến độ thành công' });
  });

  // Lấy thống kê học tập
  fastify.get('/stats', { onRequest: auth }, async (req, reply) => {
    const stats = await db.collection('progress').aggregate([
      { $match: { userId: req.user.username } },
      { $group: {
        _id: '$status',
        count: { $sum: 1 }
      }}
    ]).toArray();
    
    reply.send(stats);
  });
}

module.exports = progressRoutes;
