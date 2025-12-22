// routes/progress.js
const { ObjectId } = require('mongodb');
const auth = require('../auth-hook');
const progressModel = require('../models/progressModel');

/**
 * Plugin routes cho Progress API
 * Theo dõi: số từ học, điểm quiz, % hoàn thành quiz
 * @param {import('fastify').FastifyInstance} fastify
 * @param {object} options
 */
async function progressRoutes(fastify, options) {
  const db = fastify.mongo.db;
  const Progress = await progressModel(fastify);

  // GET /progress: Lấy tiến độ tổng quan (số từ học, điểm quiz, % hoàn thành)
  fastify.get('/', {
    onRequest: auth
  }, async (req, rep) => {
    try {
      const userId = req.user.username;
      const progress = await Progress.getProgress(userId);

      return rep.send({
        success: true,
        data: progress
      });
    } catch (err) {
      fastify.log.error('GET /progress error:', err);
      const code = err.statusCode || 500;
      return rep.code(code).send({
        success: false,
        message: err.message || 'Internal Server Error'
      });
    }
  });

  // GET /progress/vocab: Chi tiết từ vựng đã học
  fastify.get('/vocab', {
    onRequest: auth,
    querystring: {
      type: 'object',
      properties: {
        page: { type: 'integer', minimum: 1, default: 1 },
        limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
        status: { type: 'string', enum: ['new', 'learning', 'mastered'] }
      }
    }
  }, async (req, rep) => {
    try {
      const userId = req.user.username;
      const { page, limit, status } = req.query;

      const result = await Progress.getVocabDetails(userId, {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        status
      });

      // Populate vocab information
      const enrichedItems = await Promise.all(
        result.items.map(async (item) => {
          const vocab = await db.collection('vocab').findOne({
            _id: item.vocabId
          });

          return {
            _id: item._id,
            vocabId: item.vocabId,
            word: vocab?.word || null,
            meaning: vocab?.meaning || null,
            topic: vocab?.topic || null,
            status: item.status,
            reviewCount: item.reviewCount || 0,
            lastStudied: item.lastStudied,
            createdAt: item.createdAt
          };
        })
      );

      return rep.send({
        success: true,
        items: enrichedItems,
        total: result.total,
        page: result.page,
        limit: result.limit
      });
    } catch (err) {
      fastify.log.error('GET /progress/vocab error:', err);
      return rep.code(500).send({
        success: false,
        message: 'Internal Server Error'
      });
    }
  });

  // GET /progress/quiz: Chi tiết quiz đã làm
  fastify.get('/quiz', {
    onRequest: auth,
    querystring: {
      type: 'object',
      properties: {
        page: { type: 'integer', minimum: 1, default: 1 },
        limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 }
      }
    }
  }, async (req, rep) => {
    try {
      const userId = req.user.username;
      const { page, limit } = req.query;

      const result = await Progress.getQuizDetails(userId, {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10)
      });

      // Populate quiz information
      const enrichedItems = await Promise.all(
        result.items.map(async (item) => {
          const quiz = await db.collection('quiz').findOne({
            _id: item.quizId
          });

          return {
            _id: item._id,
            quizId: item.quizId,
            quiz: quiz ? {
              prompt: quiz.prompt,
              options: quiz.options,
              answer: quiz.answer
            } : null,
            userAnswer: item.userAnswer,
            isCorrect: item.isCorrect,
            score: item.score,
            timeSpent: item.timeSpent || 0,
            createdAt: item.createdAt
          };
        })
      );

      return rep.send({
        success: true,
        items: enrichedItems,
        total: result.total,
        page: result.page,
        limit: result.limit
      });
    } catch (err) {
      fastify.log.error('GET /progress/quiz error:', err);
      return rep.code(500).send({
        success: false,
        message: 'Internal Server Error'
      });
    }
  });
}

module.exports = progressRoutes;