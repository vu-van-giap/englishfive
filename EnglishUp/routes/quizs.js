// routes/quizs.js
const { FastifyError } = require('fastify');
const quizModel = require('../models/quizModel');

/**
 * Plugin Fastify cho routes của quiz
 * @param {FastifyInstance} fastify - Đối tượng Fastify
 * @param {Object} options - Tùy chọn plugin
 */
async function quizRoutes(fastify, options) {
  // Khởi tạo Quiz model từ factory
  const Quiz = await quizModel(fastify);

  // Schema cho validation (sử dụng Fastify's JSON Schema)
  const createQuestionSchema = {
    body: {
      type: 'object',
      required: ['prompt', 'options', 'answer'],
      properties: {
        prompt: { type: 'string', minLength: 1 },
        options: { 
          type: 'array', 
          minItems: 2, 
          items: { type: 'string', minLength: 1 },
          uniqueItems: true
        },
        answer: { type: 'string', minLength: 1 }
      }
    }
  };

  const updateQuestionSchema = {
    body: {
      type: 'object',
      properties: {
        prompt: { type: 'string', minLength: 1 },
        options: { 
          type: 'array', 
          minItems: 2, 
          items: { type: 'string', minLength: 1 },
          uniqueItems: true
        },
        answer: { type: 'string', minLength: 1 }
      },
      additionalProperties: false
    },
    params: {
      type: 'object',
      required: ['id'],
      properties: {
        id: { type: 'string', pattern: '^[0-9a-fA-F]{24}$' } // MongoDB ObjectId pattern
      }
    }
  };

  const getQuestionByIdSchema = {
    params: {
      type: 'object',
      required: ['id'],
      properties: {
        id: { type: 'string', pattern: '^[0-9a-fA-F]{24}$' }
      }
    }
  };

  const deleteQuestionSchema = {
    params: {
      type: 'object',
      required: ['id'],
      properties: {
        id: { type: 'string', pattern: '^[0-9a-fA-F]{24}$' }
      }
    }
  };

  // Route: Tạo câu hỏi mới
  fastify.post('/', {
    schema: createQuestionSchema,
    preHandler: async (request, reply) => {
      // Có thể thêm middleware xác thực người dùng nếu cần (e.g., JWT)
      // Ví dụ: await request.jwtVerify();
    }
  }, async (request, reply) => {
    try {
      const { prompt, options, answer } = request.body;
      const id = await Quiz.createQuestion({ prompt, options, answer });
      reply.code(201).send({ success: true, id, message: 'Câu hỏi đã được tạo thành công.' });
    } catch (error) {
      fastify.log.error('Lỗi khi tạo câu hỏi:', error);
      if (error instanceof FastifyError) {
        reply.code(400).send({ success: false, message: error.message });
      } else {
        reply.code(500).send({ success: false, message: 'Lỗi máy chủ nội bộ.' });
      }
    }
  });

  // Route: Lấy tất cả câu hỏi
  fastify.get('/', async (request, reply) => {
    try {
      const questions = await Quiz.getAllQuestions();
      reply.send({ success: true, data: questions });
    } catch (error) {
      fastify.log.error('Lỗi khi lấy danh sách câu hỏi:', error);
      reply.code(500).send({ success: false, message: 'Lỗi máy chủ nội bộ.' });
    }
  });

  // Route: Lấy câu hỏi theo ID
  fastify.get('/:id', {
    schema: getQuestionByIdSchema
  }, async (request, reply) => {
    try {
      const { id } = request.params;
      const question = await Quiz.getQuestionById(id);
      reply.send({ success: true, data: question });
    } catch (error) {
      fastify.log.error(`Lỗi khi lấy câu hỏi với ID ${request.params.id}:`, error);
      if (error instanceof FastifyError) {
        reply.code(404).send({ success: false, message: error.message });
      } else {
        reply.code(500).send({ success: false, message: 'Lỗi máy chủ nội bộ.' });
      }
    }
  });

  // Route: Cập nhật câu hỏi
  fastify.put('/:id', {
    schema: updateQuestionSchema,
    preHandler: async (request, reply) => {
      // Middleware xác thực người dùng nếu cần
    }
  }, async (request, reply) => {
    try {
      const { id } = request.params;
      const updateData = request.body;
      const success = await Quiz.updateQuestion(id, updateData);
      if (success) {
        reply.send({ success: true, message: 'Câu hỏi đã được cập nhật thành công.' });
      } else {
        reply.code(404).send({ success: false, message: 'Không tìm thấy câu hỏi để cập nhật.' });
      }
    } catch (error) {
      fastify.log.error(`Lỗi khi cập nhật câu hỏi với ID ${request.params.id}:`, error);
      if (error instanceof FastifyError) {
        reply.code(400).send({ success: false, message: error.message });
      } else {
        reply.code(500).send({ success: false, message: 'Lỗi máy chủ nội bộ.' });
      }
    }
  });

  // Route: Xóa câu hỏi
  fastify.delete('/:id', {
    schema: deleteQuestionSchema,
    preHandler: async (request, reply) => {
      // Middleware xác thực người dùng nếu cần
    }
  }, async (request, reply) => {
    try {
      const { id } = request.params;
      const success = await Quiz.deleteQuestion(id);
      if (success) {
        reply.send({ success: true, message: 'Câu hỏi đã được xóa thành công.' });
      } else {
        reply.code(404).send({ success: false, message: 'Không tìm thấy câu hỏi để xóa.' });
      }
    } catch (error) {
      fastify.log.error(`Lỗi khi xóa câu hỏi với ID ${request.params.id}:`, error);
      if (error instanceof FastifyError) {
        reply.code(400).send({ success: false, message: error.message });
      } else {
        reply.code(500).send({ success: false, message: 'Lỗi máy chủ nội bộ.' });
      }
    }
  });
}

module.exports = quizRoutes;
