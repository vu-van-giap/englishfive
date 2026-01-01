// models/progressModel.js
const { ObjectId } = require('mongodb');

/**
 * Model Progress - Theo dõi tiến độ học tập
 * @param {import('fastify').FastifyInstance} fastify
 */
async function progressModel(fastify) {
  if (!fastify || !fastify.mongo || !fastify.mongo.db) {
    throw new Error('progressModel: fastify.mongo is not initialized');
  }

  const db = fastify.mongo.db;

  return {
    /**
     * Lấy tiến độ tổng quan
     * @param {string} userId
     * @returns {Promise<object>}
     */
    async getProgress(userId) {
      try {
        if (!userId) {
          const e = new Error('userId is required');
          e.statusCode = 400;
          throw e;
        }

        // 1. Đếm số từ đã học
        const wordsLearned = await this.getWordsLearned(userId);

        // 2. Lấy điểm quiz và % hoàn thành
        const quizProgress = await this.getQuizProgress(userId);

        return {
          userId,
          wordsLearned,
          quizScore: quizProgress.totalScore,
          quizAverage: quizProgress.averageScore,
          quizCompletion: quizProgress.completionPercentage,
          totalQuizzes: quizProgress.totalQuizzes,
          correctAnswers: quizProgress.correctAnswers,
          incorrectAnswers: quizProgress.incorrectAnswers
        };
      } catch (err) {
        fastify.log.error('getProgress error:', err);
        throw err;
      }
    },

    /**
     * Đếm số từ đã học
     * @param {string} userId
     * @returns {Promise<number>}
     */
    async getWordsLearned(userId) {
      try {
        // Đếm từ collection user_vocab (từ user đã học)
        const count = await db.collection('user_vocab').countDocuments({ userId });
        return count;
      } catch (err) {
        fastify.log.error('getWordsLearned error:', err);
        return 0;
      }
    },

    /**
     * Lấy thông tin quiz
     * @param {string} userId
     * @returns {Promise<object>}
     */
    async getQuizProgress(userId) {
      try {
        const quizAttempts = await db.collection('quiz_attempts')
          .find({ userId })
          .toArray();

        const totalQuizzes = quizAttempts.length;

        if (totalQuizzes === 0) {
          return {
            totalQuizzes: 0,
            correctAnswers: 0,
            incorrectAnswers: 0,
            totalScore: 0,
            averageScore: 0,
            completionPercentage: 0
          };
        }

        // Đếm câu đúng/sai
        const correctAnswers = quizAttempts.filter(a => a.isCorrect).length;
        const incorrectAnswers = totalQuizzes - correctAnswers;

        // Tính % hoàn thành = % câu trả lời đúng
        const completionPercentage = Math.round((correctAnswers / totalQuizzes) * 100);

        // Tính tổng điểm và điểm trung bình
        const totalScore = quizAttempts.reduce((sum, a) => sum + (a.score || 0), 0);
        const averageScore = Math.round(totalScore / totalQuizzes);

        return {
          totalQuizzes,
          correctAnswers,
          incorrectAnswers,
          totalScore,
          averageScore,
          completionPercentage
        };
      } catch (err) {
        fastify.log.error('getQuizProgress error:', err);
        return {
          totalQuizzes: 0,
          correctAnswers: 0,
          incorrectAnswers: 0,
          totalScore: 0,
          averageScore: 0,
          completionPercentage: 0
        };
      }
    },

    /**
     * Lấy chi tiết từ vựng đã học
     * @param {string} userId
     * @param {object} options
     * @returns {Promise<object>}
     */
    async getVocabDetails(userId, options = {}) {
      try {
        const page = Math.max(1, parseInt(options.page ?? 1, 10));
        const limit = Math.min(100, Math.max(1, parseInt(options.limit ?? 20, 10)));
        const skip = (page - 1) * limit;

        const filter = { userId };
        if (options.status) filter.status = options.status;

        const items = await db.collection('user_vocab')
          .find(filter)
          .sort({ lastStudied: -1 })
          .skip(skip)
          .limit(limit)
          .toArray();

        const total = await db.collection('user_vocab').countDocuments(filter);

        return { items, total, page, limit };
      } catch (err) {
        fastify.log.error('getVocabDetails error:', err);
        throw err;
      }
    },

    /**
     * Lấy chi tiết quiz đã làm
     * @param {string} userId
     * @param {object} options
     * @returns {Promise<object>}
     */
    async getQuizDetails(userId, options = {}) {
      try {
        const page = Math.max(1, parseInt(options.page ?? 1, 10));
        const limit = Math.min(100, Math.max(1, parseInt(options.limit ?? 20, 10)));
        const skip = (page - 1) * limit;

        const items = await db.collection('quiz_attempts')
          .find({ userId })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .toArray();

        const total = await db.collection('quiz_attempts').countDocuments({ userId });

        return { items, total, page, limit };
      } catch (err) {
        fastify.log.error('getQuizDetails error:', err);
        throw err;
      }
    }
  };
}

module.exports = progressModel;