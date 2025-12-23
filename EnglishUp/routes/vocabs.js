// routes/vocab.js
const vocabModel = require('../models/vocabModel');
const topicsConfig = require('../config/topics'); // Danh sách chủ đề + ảnh

const validTopics = topicsConfig.map(t => t.value);

/**
 * Plugin routes cho Vocab API
 * @param {import('fastify').FastifyInstance} fastify
 * @param {object} options
 */
async function vocabRoutes(fastify, options) {
  // Khởi tạo model
  const Vocab = await vocabModel(fastify);

  // Đảm bảo index khi khởi động
  await Vocab.ensureIndexes().catch((err) => {
    fastify.log.warn('Không thể đảm bảo chỉ mục cho từ vựng:', err.message);
  });

  // GET /api/vocab/topics - Lấy danh sách tất cả chủ đề (dùng cho frontend hiển thị card)
  fastify.get('/topics', async (request, reply) => {
    return reply.send(topicsConfig);
  });

  // POST /api/vocab - Tạo vocab mới
  fastify.post('/', async (request, reply) => {
    try {
      const id = await Vocab.createVocab(request.body);
      return reply.code(201).send({ message: 'Vocab tạo thành công', id: id.toString() });
    } catch (err) {
      const statusCode = err.statusCode || 500;
      const errorType = statusCode >= 500 ? 'Lỗi máy chủ nội bộ' : 'Bad Request';
      return reply.code(statusCode).send({
        statusCode,
        error: errorType,
        message: err.message,
      });
    }
  });

  // GET /api/vocab - Lấy tất cả vocab (có pagination + sort)
  fastify.get('/', async (request, reply) => {
    try {
      const { page, limit } = request.query;
      const result = await Vocab.getAllVocabs({
        page: page ? parseInt(page, 10) : undefined,
        limit: limit ? parseInt(limit, 10) : undefined,
      });
      return reply.send(result);
    } catch (err) {
      const statusCode = err.statusCode || 500;
      return reply.code(statusCode).send({
        statusCode,
        error: statusCode >= 500 ? 'Lỗi máy chủ nội bộ' : 'Bad Request',
        message: err.message,
      });
    }
  });

  // GET /api/vocab/search?q=...&page=...&limit=...
  fastify.get('/search', async (request, reply) => {
    try {
      const { q, page, limit } = request.query;
      const result = await Vocab.searchVocabs({
        q: q || '',
        page: page ? parseInt(page, 10) : undefined,
        limit: limit ? parseInt(limit, 10) : undefined,
      });
      return reply.send(result);
    } catch (err) {
      const statusCode = err.statusCode || 500;
      return reply.code(statusCode).send({
        statusCode,
        error: statusCode >= 500 ? 'Lỗi máy chủ nội bộ' : 'Bad Request',
        message: err.message,
      });
    }
  });

  // GET /api/vocab/topic/:topic - Lấy vocab theo topic (có pagination)
  fastify.get('/topic/:topic', async (request, reply) => {
    try {
      const { topic } = request.params;
      const { page, limit } = request.query;


      if (!topic || !validTopics.includes(topic.toLowerCase())) {
        return reply.code(400).send({ error: 'Bad Request', message: 'Chủ đề không hợp lệ hoặc bị thiếu' });
      }

      // Vì model hiện chỉ có getVocabsByTopic không hỗ trợ pagination,
      // ta sẽ tự thêm pagination ở đây (đơn giản)
      const pageNum = Math.max(1, parseInt(page, 10) || 1);
      const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
      const skip = (pageNum - 1) * limitNum;

      const items = await fastify.mongo.db
        .collection('vocab')
        .find({ topic: topic.toLowerCase() })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .toArray();

      const total = await fastify.mongo.db.collection('vocab').countDocuments({ topic: topic.toLowerCase() });

      return reply.send({ items, total, page: pageNum, limit: limitNum });
    } catch (err) {
      const statusCode = err.statusCode || 500;
      return reply.code(statusCode).send({
        statusCode,
        error: statusCode >= 500 ? 'Lỗi máy chủ nội bộ' : 'Bad Request',
        message: err.message,
      });
    }
  });

  // GET /api/vocab/:id - Lấy chi tiết 1 vocab
  fastify.get('/:id', async (request, reply) => {
    try {
      const doc = await Vocab.getVocabById(request.params.id);
      if (!doc) {
        return reply.code(404).send({ error: 'Không tìm thấy', message: 'Không tìm thấy Vocab' });
      }
      return reply.send(doc);
    } catch (err) {
      const statusCode = err.statusCode || 500;
      return reply.code(statusCode).send({
        statusCode,
        error: statusCode >= 500 ? 'Lỗi máy chủ nội bộ' : 'Bad Request',
        message: err.message,
      });
    }
  });

  // PUT /api/vocab/:id - Cập nhật vocab
  fastify.put('/:id', async (request, reply) => {
    try {
      const success = await Vocab.updateVocab(request.params.id, request.body);
      if (!success) {
        return reply.code(404).send({ error: 'Not Found', message: 'Không tìm thấy Vocab hoặc không có thay đổi' });
      }
      return reply.send({ success: true, message: 'Vocab đã được cập nhập thành công' });
    } catch (err) {
      const statusCode = err.statusCode || 500;
      return reply.code(statusCode).send({
        statusCode,
        error: statusCode >= 500 ? 'Lỗi máy chủ nội bộ' : 'Bad Request',
        message: err.message,
      });
    }
  });

  // DELETE /api/vocab/:id - Xóa vocab
  fastify.delete('/:id', async (request, reply) => {
    try {
      const success = await Vocab.deleteVocab(request.params.id);
      if (!success) {
        return reply.code(404).send({ error: 'Không tìm thấy', message: 'Không tìm thấy Vocab' });
      }
      return reply.code(200).send({ success: true, message: 'Vocab đã xóa thành công' });
    } catch (err) {
      const statusCode = err.statusCode || 500;
      return reply.code(statusCode).send({
        statusCode,
        error: statusCode >= 500 ? 'Lỗi máy chủ nội bộ' : 'Bad Request',
        message: err.message,
      });
    }
  });
}

module.exports = vocabRoutes;