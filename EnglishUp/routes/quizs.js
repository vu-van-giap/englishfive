// routes/quizRoutes.js
const quizModel = require('../models/quizModel');

/**
 * Plugin Fastify cho các routes liên quan đến Quiz
 * @param {FastifyInstance} fastify
 * @param {Object} options
 */
async function quizRoutes(fastify, options) {
  // Khởi tạo model
  const Quiz = await quizModel(fastify);

  // ==================== JSON Schemas ====================

  const quizIdParamsSchema = {
    type: 'object',
    required: ['id'],
    properties: {
      id: { type: 'string', pattern: '^[0-9a-fA-F]{24}$' } // ObjectId hex string
    }
  };

  const paginationQuerySchema = {
    type: 'object',
    properties: {
      limit: { type: 'integer', minimum: 1, maximum: 100, default: 50 },
      offset: { type: 'integer', minimum: 0, default: 0 }
    }
  };

  const topicParamSchema = {
    type: 'object',
    required: ['topic'],
    properties: {
      topic: { type: 'string', minLength: 1 }
    }
  };

  const createUpdateQuizBodySchema = {
    type: 'object',
    properties: {
      title: { type: 'string', minLength: 1 },
      topic: { type: 'string', minLength: 1 },
      questions: {
        type: 'array',
        minItems: 1,
        items: {
          type: 'object',
          required: ['prompt', 'choices'],
          properties: {
            prompt: { type: 'string', minLength: 1 },
            choices: {
              type: 'array',
              minItems: 1,
              items: {
                type: 'object',
                required: ['text', 'isCorrect'],
                properties: {
                  text: { type: 'string', minLength: 1 },
                  isCorrect: { type: 'boolean' }
                }
              }
            },
            vocabRef: { type: ['string', 'null'], pattern: '^[0-9a-fA-F]{24}$' }
          }
        }
      },
      totalScore: { type: 'number', minimum: 0 },
      createdBy: { type: 'string' },
      finishedAt: { type: ['string', 'null'], format: 'date-time' }
    },
    required: ['questions'], // Chỉ bắt buộc questions khi tạo mới
    additionalProperties: false
  };

  // ==================== Routes ====================

  // POST /api/quizzes - Tạo quiz mới (admin only nếu bật auth)
  fastify.post('/', {
    schema: {
      body: createUpdateQuizBodySchema,
      response: {
        201: { type: 'object', properties: { success: { type: 'boolean' }, id: { type: 'string' }, message: { type: 'string' } } }
      }
    },
    // preHandler: authenticateAdmin // Bỏ comment khi cần auth
  }, async (request, reply) => {
    try {
      let data = request.body;

      if (data.finishedAt) {
        data.finishedAt = new Date(data.finishedAt);
      }

      const id = await Quiz.createQuiz(data);

      return reply.code(201).send({
        success: true,
        id,
        message: 'Quiz đã được tạo thành công.'
      });
    } catch (error) {
      fastify.log.error('Lỗi tạo quiz:', error);
      const statusCode = error instanceof Error && error.message.includes('không hợp lệ') ? 400 : 500;
      return reply.code(statusCode).send({
        success: false,
        message: error.message || 'Lỗi máy chủ nội bộ.'
      });
    }
  });

  // GET /api/quizzes - Lấy tất cả quiz (có phân trang)
  fastify.get('/', {
    schema: {
      querystring: paginationQuerySchema,
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'array' },
            limit: { type: 'integer' },
            offset: { type: 'integer' },
            total: { type: 'integer' }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { limit = 50, offset = 0 } = request.query;

      const quizzes = await Quiz.getAllQuizzes(Number(limit), Number(offset));
      const total = await fastify.mongo.db.collection('quiz').countDocuments();

      return reply.send({
        success: true,
        data: quizzes,
        limit: Number(limit),
        offset: Number(offset),
        total
      });
    } catch (error) {
      fastify.log.error('Lỗi lấy danh sách quizzes:', error);
      return reply.code(500).send({ success: false, message: 'Lỗi máy chủ nội bộ.' });
    }
  });

  // GET /api/quizzes/topic/:topic - Lấy quiz theo chủ đề (rất hữu ích cho frontend hiển thị hình ảnh)
  fastify.get('/topic/:topic', {
    schema: {
      params: topicParamSchema,
      querystring: paginationQuerySchema,
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            topic: { type: 'string' },
            topicImage: { type: ['string', 'null'] },
            quizzes: { type: 'array' },
            limit: { type: 'integer' },
            offset: { type: 'integer' },
            total: { type: 'integer' }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { topic } = request.params;
      const { limit = 50, offset = 0 } = request.query;

      const result = await Quiz.getQuizzesByTopic(topic, Number(limit), Number(offset));
      const total = await fastify.mongo.db.collection('quiz').countDocuments({ topic: result.topic });

      return reply.send({
        success: true,
        topic: result.topic,
        topicImage: result.topicImage,
        quizzes: result.quizzes,
        limit: Number(limit),
        offset: Number(offset),
        total
      });
    } catch (error) {
      fastify.log.error(`Lỗi lấy quiz theo topic ${request.params.topic}:`, error);
      const statusCode = error.message.includes('không hợp lệ') ? 400 : 500;
      return reply.code(statusCode).send({
        success: false,
        message: error.message || 'Lỗi máy chủ nội bộ.'
      });
    }
  });

  // GET /api/quizzes/:id - Lấy chi tiết 1 quiz
  fastify.get('/:id', {
    schema: {
      params: quizIdParamsSchema
    }
  }, async (request, reply) => {
    try {
      const { id } = request.params;
      const quiz = await Quiz.getQuizById(id);

      return reply.send({ success: true, data: quiz });
    } catch (error) {
      fastify.log.error(`Lỗi lấy quiz ID ${request.params.id}:`, error);
      const statusCode = error.message.includes('không tìm thấy') ? 404 : 400;
      return reply.code(statusCode).send({
        success: false,
        message: error.message || 'Lỗi máy chủ nội bộ.'
      });
    }
  });

  // PUT /api/quizzes/:id - Cập nhật quiz (partial)
  fastify.put('/:id', {
    schema: {
      params: quizIdParamsSchema,
      body: createUpdateQuizBodySchema
    },
    // preHandler: authenticateAdmin
  }, async (request, reply) => {
    try {
      const { id } = request.params;
      let updateData = request.body;

      if (updateData.finishedAt) {
        updateData.finishedAt = new Date(updateData.finishedAt);
      }

      const success = await Quiz.updateQuiz(id, updateData);

      if (!success) {
        return reply.code(404).send({ success: false, message: 'Không tìm thấy quiz để cập nhật.' });
      }

      return reply.send({ success: true, message: 'Quiz đã được cập nhật thành công.' });
    } catch (error) {
      fastify.log.error(`Lỗi cập nhật quiz ID ${request.params.id}:`, error);
      const statusCode = error.message.includes('không hợp lệ') ? 400 : 500;
      return reply.code(statusCode).send({
        success: false,
        message: error.message || 'Lỗi máy chủ nội bộ.'
      });
    }
  });

  // DELETE /api/quizzes/:id - Xóa quiz
  fastify.delete('/:id', {
    schema: {
      params: quizIdParamsSchema
    },
    // preHandler: authenticateAdmin
  }, async (request, reply) => {
    try {
      const { id } = request.params;
      const success = await Quiz.deleteQuiz(id);

      if (!success) {
        return reply.code(404).send({ success: false, message: 'Không tìm thấy quiz để xóa.' });
      }

      return reply.send({ success: true, message: 'Quiz đã được xóa thành công.' });
    } catch (error) {
      fastify.log.error(`Lỗi xóa quiz ID ${request.params.id}:`, error);
      return reply.code(400).send({
        success: false,
        message: error.message || 'Lỗi máy chủ nội bộ.'
      });
    }
  });
}

module.exports = quizRoutes;