// models/listeningModel.js
const { ObjectId } = require('mongodb');

/**
 * Model Listening - Luyện nghe và điền từ
 * User nghe audio và điền từ vào chỗ trống
 * @param {import('fastify').FastifyInstance} fastify
 */
async function listeningModel(fastify) {
  if (!fastify || !fastify.mongo || !fastify.mongo.db) {
    throw new Error('listeningModel: fastify.mongo is not initialized');
  }

  const db = fastify.mongo.db;
  const collection = db.collection('listening_exercises');

  // Helper: validate ObjectId
  const isValidId = (id) => ObjectId.isValid(id);

  return {
    /**
     * Tạo bài luyện nghe mới
     * @param {object} data - { title, audioUrl, transcript, blanks, difficulty, topic }
     * @returns {Promise<ObjectId>}
     */
    async createExercise(data) {
      try {
        const { title, audioUrl, transcript, blanks, difficulty, topic } = data;

        if (!title || !audioUrl || !transcript || !Array.isArray(blanks)) {
          const e = new Error('Missing required fields: title, audioUrl, transcript, blanks');
          e.statusCode = 400;
          throw e;
        }

        // Validate blanks
        blanks.forEach((blank, index) => {
          if (typeof blank.position !== 'number' || !blank.answer) {
            const e = new Error(`Invalid blank at index ${index}: position and answer required`);
            e.statusCode = 400;
            throw e;
          }
        });

        const doc = {
          title,
          audioUrl,
          transcript,
          blanks,
          difficulty: difficulty || 'medium',
          topic: topic || null,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        const result = await collection.insertOne(doc);
        fastify.log.info(`Listening exercise created: id=${result.insertedId}`);
        return result.insertedId;
      } catch (err) {
        fastify.log.error('createExercise error:', err);
        throw err;
      }
    },

    /**
     * Lấy danh sách bài luyện nghe
     * @param {object} options - { page, limit, difficulty, topic }
     * @returns {Promise<object>}
     */
    async getAllExercises(options = {}) {
      try {
        const page = Math.max(1, parseInt(options.page ?? 1, 10));
        const limit = Math.min(100, Math.max(1, parseInt(options.limit ?? 20, 10)));
        const skip = (page - 1) * limit;

        const filter = {};
        if (options.difficulty) filter.difficulty = options.difficulty;
        if (options.topic) filter.topic = options.topic;

        const items = await collection
          .find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .toArray();

        const total = await collection.countDocuments(filter);

        return { items, total, page, limit };
      } catch (err) {
        fastify.log.error('getAllExercises error:', err);
        throw err;
      }
    },

    /**
     * Lấy bài tập theo ID (không trả về đáp án)
     * @param {string} id
     * @param {boolean} includeAnswers - Admin xem có đáp án
     * @returns {Promise<object>}
     */
    async getExerciseById(id, includeAnswers = false) {
      try {
        if (!isValidId(id)) {
          const e = new Error('Invalid exercise id');
          e.statusCode = 400;
          throw e;
        }

        const exercise = await collection.findOne({ _id: new ObjectId(id) });

        if (!exercise) {
          const e = new Error('Exercise not found');
          e.statusCode = 404;
          throw e;
        }

        // Nếu không include answers, chỉ trả về positions
        if (!includeAnswers) {
          return {
            ...exercise,
            blanks: exercise.blanks.map(b => ({
              position: b.position,
              hint: b.hint || null
            }))
          };
        }

        return exercise;
      } catch (err) {
        fastify.log.error('getExerciseById error:', err);
        throw err;
      }
    },

    /**
     * Cập nhật bài tập
     * @param {string} id
     * @param {object} data
     * @returns {Promise<boolean>}
     */
    async updateExercise(id, data) {
      try {
        if (!isValidId(id)) {
          const e = new Error('Invalid exercise id');
          e.statusCode = 400;
          throw e;
        }

        const updateData = { ...data, updatedAt: new Date() };
        delete updateData._id;

        const result = await collection.updateOne(
          { _id: new ObjectId(id) },
          { $set: updateData }
        );

        fastify.log.info(`Exercise updated: id=${id}, modified=${result.modifiedCount}`);
        return result.modifiedCount > 0;
      } catch (err) {
        fastify.log.error('updateExercise error:', err);
        throw err;
      }
    },

    /**
     * Xóa bài tập
     * @param {string} id
     * @returns {Promise<boolean>}
     */
    async deleteExercise(id) {
      try {
        if (!isValidId(id)) {
          const e = new Error('Invalid exercise id');
          e.statusCode = 400;
          throw e;
        }

        const result = await collection.deleteOne({ _id: new ObjectId(id) });
        fastify.log.info(`Exercise deleted: id=${id}, deleted=${result.deletedCount}`);
        return result.deletedCount > 0;
      } catch (err) {
        fastify.log.error('deleteExercise error:', err);
        throw err;
      }
    },

    /**
     * Lưu kết quả làm bài
     * @param {string} userId
     * @param {string} exerciseId
     * @param {object} data - { answers, score, timeSpent }
     * @returns {Promise<ObjectId>}
     */
    async saveAttempt(userId, exerciseId, data) {
      try {
        if (!userId || !isValidId(exerciseId)) {
          const e = new Error('userId and valid exerciseId are required');
          e.statusCode = 400;
          throw e;
        }

        const { answers, score, timeSpent } = data;

        const doc = {
          userId,
          exerciseId: new ObjectId(exerciseId),
          answers,
          score,
          timeSpent: timeSpent || 0,
          createdAt: new Date()
        };

        const result = await db.collection('listening_attempts').insertOne(doc);
        fastify.log.info(`Listening attempt saved: user=${userId}, exercise=${exerciseId}`);
        return result.insertedId;
      } catch (err) {
        fastify.log.error('saveAttempt error:', err);
        throw err;
      }
    },

    /**
     * Lấy thống kê
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

        const attempts = await db.collection('listening_attempts')
          .find({ userId })
          .toArray();

        const totalAttempts = attempts.length;
        const totalScore = attempts.reduce((sum, a) => sum + (a.score || 0), 0);
        const averageScore = totalAttempts > 0 ? Math.round(totalScore / totalAttempts) : 0;

        return {
          totalAttempts,
          totalScore,
          averageScore
        };
      } catch (err) {
        fastify.log.error('getUserStats error:', err);
        throw err;
      }
    },

    /**
     * Lấy lịch sử làm bài
     * @param {string} userId
     * @param {object} options
     * @returns {Promise<object>}
     */
    async getAttemptHistory(userId, options = {}) {
      try {
        const page = Math.max(1, parseInt(options.page ?? 1, 10));
        const limit = Math.min(100, Math.max(1, parseInt(options.limit ?? 20, 10)));
        const skip = (page - 1) * limit;

        const items = await db.collection('listening_attempts')
          .find({ userId })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .toArray();

        const total = await db.collection('listening_attempts').countDocuments({ userId });

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
        await collection.createIndex({ difficulty: 1 }, { background: true });
        await collection.createIndex({ topic: 1 }, { background: true });
        await collection.createIndex({ createdAt: -1 }, { background: true });

        await db.collection('listening_attempts').createIndex(
          { userId: 1, createdAt: -1 },
          { background: true }
        );

        fastify.log.info('listening indexes ensured');
      } catch (err) {
        fastify.log.error('ensureIndexes error:', err);
      }
    }
  };
}

module.exports = listeningModel;