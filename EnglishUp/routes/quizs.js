// routes/quiz.js
const quizModel = require('../models/quizModel');


async function quizRoutes(fastify, options) {
  // Tạo instance model (sử dụng fastify đã được truyền vào)
  let Quiz;
  try {
    Quiz = await quizModel(fastify);
  } catch (err) {
    // Nếu không thể tạo model (ví dụ fastify.mongo chưa register), ghi log và
    // throw để Fastify biết plugin này không thể khởi tạo.
    fastify.log.error('Cannot initialize Quiz model:', err);
    throw err;
  }

  // Schema cho validation
  const questionBodySchema = {
    type: 'object',
    required: ['prompt', 'options', 'answer'],
    properties: {
      prompt: { type: 'string', minLength: 1 },
      options: { type: 'array', minItems: 2, items: { type: 'string', minLength: 1 } },
      answer: { type: 'string', minLength: 1 },
    },
  };

  const idParamSchema = {
    type: 'object',
    required: ['id'],
    properties: {
      id: { type: 'string', pattern: '^[a-fA-F0-9]{24}$', description: 'MongoDB ObjectId' },
    },
  };

  const paginationQuerySchema = {
    type: 'object',
    properties: {
      limit: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
      offset: { type: 'integer', minimum: 0, default: 0 },
    },
  };

  // Hàm helper để chuẩn hóa response
  function sendResponse(rep, success, message, data = null, status = 200) {
    return rep.code(status).send({ success, message, ...(data && { data }) });
  }

  // Hàm helper để handle error và set status code
  function handleError(rep, err) {
    let status = 500;
    let message = 'Internal server error';
    if (err.message) {
      if (err.message.includes('không hợp lệ')) status = 400;
      else if (err.message.includes('không tìm thấy')) status = 404;
      message = err.message;
    }
    fastify.log.error('Route error:', err);
    return sendResponse(rep, false, message, null, status);
  }

  // GET /         => Lấy tất cả câu hỏi (với pagination)
  fastify.get('/', {
    schema: {
      querystring: paginationQuerySchema,
    },
  }, async (req, rep) => {
    try {
      const { limit = 10, offset = 0 } = req.query;
      // Giả sử model hỗ trợ pagination (cần sửa model nếu chưa)
      const questions = await Quiz.getAllQuestions(limit, offset); // Thêm params vào model nếu cần
      return sendResponse(rep, true, 'Questions retrieved', { questions, limit, offset });
    } catch (err) {
      return handleError(rep, err);
    }
  });

  // GET /:id      => Lấy câu hỏi theo ID
  fastify.get('/:id', {
    schema: {
      params: idParamSchema,
    },
  }, async (req, rep) => {
    try {
      const question = await Quiz.getQuestionById(req.params.id);
      return sendResponse(rep, true, 'Question retrieved', { question });
    } catch (err) {
      return handleError(rep, err);
    }
  });

  // POST /        => Tạo câu hỏi mới
  fastify.post('/', {
    schema: {
      body: questionBodySchema,
    },
  }, async (req, rep) => {
    try {
      const id = await Quiz.createQuestion(req.body);
      return sendResponse(rep, true, 'Question created', { id }, 201);
    } catch (err) {
      return handleError(rep, err);
    }
  });

  // PUT /:id      => Cập nhật quiz
  fastify.put('/:id', {
    schema: {
      params: idParamSchema,
      body: questionBodySchema, // Partial update, nhưng schema yêu cầu full – có thể làm optional nếu cần
    },
  }, async (req, rep) => {
    try {
      const success = await Quiz.updateQuestion(req.params.id, req.body);
      if (!success) {
        return sendResponse(rep, false, 'Question not found or no changes made', null, 404);
      }
      return sendResponse(rep, true, 'Question updated');
    } catch (err) {
      return handleError(rep, err);
    }
  });

  // DELETE /:id   => Xóa quiz
  fastify.delete('/:id', {
    schema: {
      params: idParamSchema,
    },
  }, async (req, rep) => {
    try {
      const success = await Quiz.deleteQuestion(req.params.id);
      if (!success) {
        return sendResponse(rep, false, 'Question not found', null, 404);
      }
      return sendResponse(rep, true, 'Question deleted');
    } catch (err) {
      return handleError(rep, err);
    }
  });
}

module.exports = quizRoutes;