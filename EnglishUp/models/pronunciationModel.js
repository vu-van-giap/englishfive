// models/pronunciationModel.js
const { ObjectId } = require('mongodb');

/**
 * Model Pronunciation - Quản lý luyện phát âm
 * @param {import('fastify').FastifyInstance} fastify
 */
async function pronunciationModel(fastify) {
  if (!fastify || !fastify.mongo || !fastify.mongo.db) {
    throw new Error('pronunciationModel: fastify.mongo is not initialized');
  }

  const db = fastify.mongo.db;

  // Helper: validate ObjectId
  const isValidId = (id) => ObjectId.isValid(id);

  return {
    /**
     * Lấy từ theo ID
     * @param {string} wordId
     * @returns {Promise<object>}
     */
    async getWordById(wordId) {
      try {
        if (!isValidId(wordId)) {
          const e = new Error('Invalid wordId');
          e.statusCode = 400;
          throw e;
        }

        const word = await db.collection('words').findOne({
          _id: new ObjectId(wordId)
        });

        if (!word) {
          const e = new Error('Word not found');
          e.statusCode = 404;
          throw e;
        }

        return word;
      } catch (err) {
        fastify.log.error('getWordById error:', err);
        throw err;
      }
    },

    /**
     * Lưu kết quả luyện phát âm
     * @param {string} userId
     * @param {string} wordId
     * @param {object} data - { transcription, accuracy, isCorrect }
     * @returns {Promise<ObjectId>}
     */
    async saveAttempt(userId, wordId, data) {
      try {
        if (!userId || !isValidId(wordId)) {
          const e = new Error('userId and valid wordId are required');
          e.statusCode = 400;
          throw e;
        }

        const { transcription, accuracy, isCorrect, topicId } = data;

        const attempt = {
          userId,
          wordId: new ObjectId(wordId),
          topicId: topicId ? new ObjectId(topicId) : null,
          transcription,
          accuracy,
          isCorrect,
          createdAt: new Date()
        };

        const result = await db.collection('pronunciation_attempts').insertOne(attempt);
        fastify.log.info(`Pronunciation attempt saved: user=${userId}, word=${wordId}`);
        return result.insertedId;
      } catch (err) {
        fastify.log.error('saveAttempt error:', err);
        throw err;
      }
    },

    /**
     * Lấy danh sách chủ đề phát âm
     * @returns {Promise<Array>}
     */
    async getTopics() {
      try {
        const topics = await db.collection('pronunciation_topics')
          .find({})
          .sort({ order: 1 })
          .toArray();

        return topics;
      } catch (err) {
        fastify.log.error('getTopics error:', err);
        throw err;
      }
    },

    /**
     * Lấy chủ đề theo ID
     * @param {string} topicId
     * @returns {Promise<object>}
     */
    async getTopicById(topicId) {
      try {
        if (!isValidId(topicId)) {
          const e = new Error('Invalid topicId');
          e.statusCode = 400;
          throw e;
        }

        const topic = await db.collection('pronunciation_topics').findOne({
          _id: new ObjectId(topicId)
        });

        if (!topic) {
          const e = new Error('Topic not found');
          e.statusCode = 404;
          throw e;
        }

        return topic;
      } catch (err) {
        fastify.log.error('getTopicById error:', err);
        throw err;
      }
    },

    /**
     * Lấy danh sách từ theo chủ đề
     * @param {string} topicId
     * @returns {Promise<Array>}
     */
    async getWordsByTopic(topicId) {
      try {
        if (!isValidId(topicId)) {
          const e = new Error('Invalid topicId');
          e.statusCode = 400;
          throw e;
        }

        const words = await db.collection('words')
          .find({ topicId: new ObjectId(topicId) })
          .sort({ order: 1 })
          .toArray();

        return words;
      } catch (err) {
        fastify.log.error('getWordsByTopic error:', err);
        throw err;
      }
    },

    /**
     * Lấy thống kê luyện phát âm
     * @param {string} userId
     * @returns {Promise<object>}
     */
    async getUserStats(userId) {
      try {
        if (!userId) {
          const e = new Error('userId is required');
          e.statusCode = 400;
          throw e;
        }

        const stats = await db.collection('pronunciation_attempts').aggregate([
          { $match: { userId } },
          {
            $group: {
              _id: null,
              totalAttempts: { $sum: 1 },
              correctAttempts: {
                $sum: { $cond: ['$isCorrect', 1, 0] }
              },
              avgAccuracy: { $avg: '$accuracy' }
            }
          }
        ]).toArray();

        const result = stats[0] || {
          totalAttempts: 0,
          correctAttempts: 0,
          avgAccuracy: 0
        };

        result.successRate = result.totalAttempts > 0
          ? Math.round((result.correctAttempts / result.totalAttempts) * 100)
          : 0;
        result.avgAccuracy = Math.round(result.avgAccuracy || 0);

        return result;
      } catch (err) {
        fastify.log.error('getUserStats error:', err);
        throw err;
      }
    },

    /**
     * Lấy lịch sử luyện tập
     * @param {string} userId
     * @param {object} options - { page, limit }
     * @returns {Promise<object>}
     */
    async getAttemptHistory(userId, options = {}) {
      try {
        if (!userId) {
          const e = new Error('userId is required');
          e.statusCode = 400;
          throw e;
        }

        const page = Math.max(1, parseInt(options.page ?? 1, 10));
        const limit = Math.min(100, Math.max(1, parseInt(options.limit ?? 20, 10)));
        const skip = (page - 1) * limit;

        const items = await db.collection('pronunciation_attempts')
          .find({ userId })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .toArray();

        const total = await db.collection('pronunciation_attempts').countDocuments({ userId });

        return { items, total, page, limit };
      } catch (err) {
        fastify.log.error('getAttemptHistory error:', err);
        throw err;
      }
    },

    /**
     * Tạo indexes
     * @returns {Promise<void>}
     */
    async ensureIndexes() {
      try {
        await db.collection('pronunciation_attempts').createIndex(
          { userId: 1, createdAt: -1 },
          { background: true }
        );
        await db.collection('pronunciation_attempts').createIndex(
          { wordId: 1 },
          { background: true }
        );
        await db.collection('pronunciation_topics').createIndex(
          { order: 1 },
          { background: true }
        );

        fastify.log.info('pronunciation indexes ensured');
      } catch (err) {
        fastify.log.error('ensureIndexes error:', err);
      }
    }
  };
}

module.exports = pronunciationModel;