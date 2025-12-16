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
  const createQuizSchema = {
    body: {
      type: 'object',
      required: ['questions'],
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
              vocabRef: { type: 'string', pattern: '^[0-9a-fA-F]{24}$' } // MongoDB ObjectId pattern
            } 
          }
        },
        totalScore: { type: 'number', minimum: 0 },
        createdBy: { type: 'string' },
        finishedAt: { type: 'string', format: 'date-time' }
      },
      additionalProperties: false
    }
  };

  const updateQuizSchema = {
    body: {
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
              vocabRef: { type: 'string', pattern: '^[0-9a-fA-F]{24}$' } // MongoDB ObjectId pattern
            }
          }
        },
        totalScore: { type: 'number', minimum: 0 },
        createdBy: { type: 'string' },
        finishedAt: { type: 'string', format: 'date-time' }
      },
      additionalProperties: false
    },
    params: {
      type: 'object',
      required: ['id'],
      properties: {
        id: { type: 'string', pattern: '^[0-9a-fA-F]{24}$' }
      }
    }
  };

  const getQuizByIdSchema = {
    params: {
      type: 'object',
      required: ['id'],
      properties: {
        id: { type: 'string', pattern: '^[0-9a-fA-F]{24}$' }
      }
    }
  };

  const deleteQuizSchema = {
    params: {
      type: 'object',
      required: ['id'],
      properties: {
        id: { type: 'string', pattern: '^[0-9a-fA-F]{24}$' }
      }
    }
  };

  const getAllQuizzesSchema = {
    querystring: {
      type: 'object',
      properties: {
        limit: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
        offset: { type: 'integer', minimum: 0, default: 0 }
      }
    }
  };

  // //Middleware xác thực JWT và kiểm tra quyền admin
  // async function authenticateAdmin(request, reply) {
  //   try {
  //     //Verify JWT token
  //     await request.jwrVerify();

  //     // Kiểm tra vai trò admin
  //     if (!request.user || request.user.role !== 'admin') {
  //       reply.code(403).send({ success: false, message: 'Truy cập bị từ chối chỉ có admin mới được phép thực hiện hành động này.' });
  //       return;
  //     }
  //   } catch (error) {
  //     // Nếu JWT không hợp lệ hoặc thiếu
  //     reply.code(401).send({ success: false, message: 'Xác thực thất bại: Token không hợp lệ hoặc thiếu.'});
  //   }
  // } 

  // Route: Tạo quiz mới
  fastify.post('/', {
    schema: createQuizSchema,
    // preHandler: authenticateAdmin
  }, async (request, reply) => {
    try {
      const data = request.body;
      // Convert finishedAt string to Date if present
      if (data.finishedAt) {
        data.finishedAt = new Date(data.finishedAt);
      }
      const id = await Quiz.createQuiz(data);
      reply.code(201).send({ success: true, id, message: 'Quiz đã được tạo thành công.' });
    } catch (error) {
      fastify.log.error('Lỗi khi tạo quiz:', error);
      if (error instanceof FastifyError) {
        reply.code(400).send({ success: false, message: error.message });
      } else {
        reply.code(500).send({ success: false, message: 'Lỗi máy chủ nội bộ.' });
      }
    }
  });

  // Route: Lấy tất cả quizzes (với pagination)
  fastify.get('/', {
    schema: getAllQuizzesSchema
    }, async (request, reply) => {
    try {
      const { limit = 10, offset = 0 } = request.query;
      const questions = await Quiz.getAllQuizzes(limit, offset);
      reply.send({ success: true, data: quizzes, limit, offset });
    } catch (error) {
      fastify.log.error('Lỗi khi lấy danh sách quizzes:', error);
      reply.code(500).send({ success: false, message: 'Lỗi máy chủ nội bộ.' });
    }
  });

  // Route: Lấy câu hỏi theo ID
  fastify.get('/:id', {
    schema: getQuizByIdSchema
  }, async (request, reply) => {
    try {
      const { id } = request.params;
      const quiz = await Quiz.getQuizById(id);
      reply.send({ success: true, data: quiz });
    } catch (error) {
      fastify.log.error(`Lỗi khi lấy quiz với ID ${request.params.id}:`, error);
      if (error instanceof FastifyError) {
        reply.code(404).send({ success: false, message: error.message });
      } else {
        reply.code(500).send({ success: false, message: 'Lỗi máy chủ nội bộ.' });
      }
    }
  });

  // Route: Cập nhật câu hỏi
  fastify.put('/:id', {
    schema: updateQuizSchema,
    // preHandler: authenticateAdmin, 
  }, async (request, reply) => {
    try {
      const { id } = request.params;
      const updateData = request.body;
      // Convert finishedAt sting to Date if present
      if (updateData.finishedAt) {
        updateData.finishedAt = new Date(updateData.finishedAt)
      } 
      const success = await Quiz.updateQuiz(id, updateData);
      if (success) {
        reply.send({ success: true, message: 'Quiz đã được cập nhật thành công.' });
      } else {
        reply.code(404).send({ success: false, message: 'Không tìm thấy quiz để cập nhật.' });
      }
    } catch (error) {
      fastify.log.error(`Lỗi khi cập nhật quiz với ID ${request.params.id}:`, error);
      if (error instanceof FastifyError) {
        reply.code(400).send({ success: false, message: error.message });
      } else {
        reply.code(500).send({ success: false, message: 'Lỗi máy chủ nội bộ.' });
      }
    }
  });

  // Route: Xóa câu hỏi
  fastify.delete('/:id', {
    schema: deleteQuizSchema,
    // preHandler: authenticateAdmin,
  }, async (request, reply) => {
    try {
      const { id } = request.params;
      const success = await Quiz.deleteQuiz(id);
      if (success) {
        reply.send({ success: true, message: 'Quiz đã được xóa thành công.' });
      } else {
        reply.code(404).send({ success: false, message: 'Không tìm thấy quiz để xóa.' });
      }
    } catch (error) {
      fastify.log.error(`Lỗi khi xóa quiz với ID ${request.params.id}:`, error);
      if (error instanceof FastifyError) {
        reply.code(400).send({ success: false, message: error.message });
      } else {
        reply.code(500).send({ success: false, message: 'Lỗi máy chủ nội bộ.' });
      }
    }
  });
}

module.exports = quizRoutes;
