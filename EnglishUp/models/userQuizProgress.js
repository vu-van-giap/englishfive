// models/userQuizProgress.js
const { FastifyError } = require('fastify');
const { ObjectId } = require('mongodb');

/**
 * Khởi tạo User Quiz Progress Model - kết nối tới collection 'userQuizProgress' trong MongoDB
 * @param {FastifyInstance} fastify - Instance của Fastify đã register plugin mongodb
 * @returns {Promise<Object>} Object chứa các phương thức thao tác với tiến độ người dùng
 * @throws {Error} Nếu fastify.mongo chưa được khởi tạo
 */
async function userQuizProgress(fastify) {
  if (!fastify?.mongo?.db) {
    throw new FastifyError('userQuizProgress: fastify.mongo chưa được khởi tạo. Hãy register plugin mongodb trước.');
  }

  const collection = fastify.mongo.db.collection('userQuizProgress');
  const indexes = await collection.indexes();
  const exists = indexes.some(idx => idx.name === 'userId_1_quizId_1');
  if (!exists) {
    await collection.createIndex({ userId: 1, quizId: 1 },
        { unique: true, name: 'userId_1_quizId_1' });
    }

  // Tạo index để tối ưu query
  await collection.createIndex({ status: 1 });
  await collection.createIndex({ updatedAt: -1 });

  return {
    /**
     * Khởi tạo tiến độ cho user bắt đầu làm quiz (status = 'in_progress')
     * Nếu đã tồn tại, không làm gì (upsert = false)
     * @param {string} userId - ID người dùng (string của ObjectId)
     * @param {string} quizId - ID quiz (string của ObjectId)
     * @returns {Promise<boolean>} true nếu tạo mới, false nếu đã tồn tại
     */
    async startQuiz(userId, quizId) {
      try {
        if (!ObjectId.isValid(userId) || !ObjectId.isValid(quizId)) {
          throw new FastifyError('userId hoặc quizId không hợp lệ.');
        }

        const existing = await collection.findOne({ userId: new ObjectId(userId), quizId: new ObjectId(quizId) });
        if (existing) {
          fastify.log.info(`User ${userId} đã bắt đầu quiz ${quizId}.`);
          return false; // Đã tồn tại
        }

        const doc = {
          userId: new ObjectId(userId),
          quizId: new ObjectId(quizId),
          status: 'in_progress',
          progress: { currentQuestion: 0, answers: [] }, // Mặc định bắt đầu từ câu 0
          score: null,
          startedAt: new Date(),
          completedAt: null,
          updatedAt: new Date()
        };

        await collection.insertOne(doc);
        fastify.log.info(`User ${userId} bắt đầu quiz ${quizId}.`);
        return true;
      } catch (error) {
        fastify.log.error(`Lỗi khi bắt đầu quiz cho user ${userId}:`, error);
        throw new FastifyError('Không thể bắt đầu quiz.');
      }
    },

    /**
     * Cập nhật tiến độ của user (chỉ cho phép nếu status = 'in_progress')
     * @param {string} userId - ID người dùng
     * @param {string} quizId - ID quiz
     * @param {Object} progressData - Dữ liệu tiến độ (ví dụ: { currentQuestion: 1, answers: [...] })
     * @returns {Promise<boolean>} true nếu cập nhật thành công, false nếu không tìm thấy hoặc không phải in_progress
     */
    async updateProgress(userId, quizId, progressData) {
      try {
        if (!ObjectId.isValid(userId) || !ObjectId.isValid(quizId)) {
          throw new FastifyError('userId hoặc quizId không hợp lệ.');
        }
        if (!progressData || typeof progressData !== 'object') {
          throw new FastifyError('progressData không hợp lệ.');
        }

        const result = await collection.updateOne(
          { userId: new ObjectId(userId), quizId: new ObjectId(quizId), status: 'in_progress' },
          { $set: { progress: progressData, updatedAt: new Date() } }
        );

        if (result.modifiedCount > 0) {
          fastify.log.info(`Cập nhật tiến độ cho user ${userId} trên quiz ${quizId}.`);
        } else {
          fastify.log.warn(`Không thể cập nhật tiến độ: user ${userId} chưa bắt đầu hoặc đã hoàn thành quiz ${quizId}.`);
        }
        return result.modifiedCount > 0;
      } catch (error) {
        fastify.log.error(`Lỗi cập nhật tiến độ cho user ${userId}:`, error);
        throw new FastifyError('Không thể cập nhật tiến độ.');
      }
    },

    /**
     * Đánh dấu hoàn thành quiz cho user (status = 'completed', cập nhật score và completedAt)
     * @param {string} userId - ID người dùng
     * @param {string} quizId - ID quiz
     * @param {number} finalScore - Điểm số cuối cùng
     * @returns {Promise<boolean>} true nếu hoàn thành thành công, false nếu không tìm thấy hoặc đã hoàn thành
     */
    async completeQuiz(userId, quizId, finalScore) {
      try {
        if (!ObjectId.isValid(userId) || !ObjectId.isValid(quizId)) {
          throw new FastifyError('userId hoặc quizId không hợp lệ.');
        }
        if (typeof finalScore !== 'number' || finalScore < 0) {
          throw new FastifyError('finalScore không hợp lệ: phải là số >= 0.');
        }

        const result = await collection.updateOne(
          { userId: new ObjectId(userId), quizId: new ObjectId(quizId), status: 'in_progress' },
          {
            $set: {
              status: 'completed',
              score: finalScore,
              completedAt: new Date(),
              updatedAt: new Date()
            }
          }
        );

        if (result.modifiedCount > 0) {
          fastify.log.info(`User ${userId} hoàn thành quiz ${quizId} với điểm ${finalScore}.`);
        } else {
          fastify.log.warn(`Không thể hoàn thành: user ${userId} chưa bắt đầu hoặc đã hoàn thành quiz ${quizId}.`);
        }
        return result.modifiedCount > 0;
      } catch (error) {
        fastify.log.error(`Lỗi hoàn thành quiz cho user ${userId}:`, error);
        throw new FastifyError('Không thể hoàn thành quiz.');
      }
    },

    /**
     * Lấy tiến độ của user cho một quiz cụ thể
     * @param {string} userId - ID người dùng
     * @param {string} quizId - ID quiz
     * @returns {Promise<Object|null>} Object tiến độ hoặc null nếu không tìm thấy
     */
    async getUserProgress(userId, quizId) {
      try {
        if (!ObjectId.isValid(userId) || !ObjectId.isValid(quizId)) {
          throw new FastifyError('userId hoặc quizId không hợp lệ.');
        }

        const progress = await collection.findOne({ userId: new ObjectId(userId), quizId: new ObjectId(quizId) });
        return progress;
      } catch (error) {
        fastify.log.error(`Lỗi lấy tiến độ cho user ${userId} trên quiz ${quizId}:`, error);
        throw new FastifyError('Không thể lấy tiến độ.');
      }
    },

    /**
     * Lấy danh sách tất cả quiz mà user đã bắt đầu (với tiến độ), kèm thông tin quiz
     * Sử dụng aggregation để join với collection 'quiz'
     * @param {string} userId - ID người dùng
     * @param {number} [limit=50] - Số lượng tối đa
     * @param {number} [offset=0] - Phân trang
     * @returns {Promise<Array<Object>>} Mảng các object { progress: {...}, quiz: {...} }
     */
    async getAllUserProgress(userId, limit = 50, offset = 0) {
      try {
        if (!ObjectId.isValid(userId)) {
          throw new FastifyError('userId không hợp lệ.');
        }

        const pipeline = [
          { $match: { userId: new ObjectId(userId) } },
          { $sort: { updatedAt: -1 } },
          { $skip: offset },
          { $limit: limit },
          {
            $lookup: {
              from: 'quiz',
              localField: 'quizId',
              foreignField: '_id',
              as: 'quiz'
            }
          },
          { $unwind: '$quiz' }, // Giả sử mỗi progress có đúng 1 quiz
          {
            $project: {
              progress: '$$ROOT', // Toàn bộ document progress
              quiz: 1 // Document quiz
            }
          }
        ];

        const results = await collection.aggregate(pipeline).toArray();
        return results;
      } catch (error) {
        fastify.log.error(`Lỗi lấy danh sách tiến độ cho user ${userId}:`, error);
        throw new FastifyError('Không thể lấy danh sách tiến độ.');
      }
    }
  };
}

module.exports = userQuizProgress;