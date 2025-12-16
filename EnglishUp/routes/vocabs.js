// routes/vocab.js (hoặc tên file tương tự)
const vocabModel = require('../models/vocabModel');

/**
 * Plugin routes cho Vocab API
 * @param {import('fastify').FastifyInstance} fastify
 * @param {object} options
 */
async function vocabRoutes(fastify, options) {
  // Khởi tạo Vocab model từ factory
  const Vocab = await vocabModel(fastify);

  // Tạo index 1 lần khi register plugin (hoặc ở server.js)
  Vocab.ensureIndexes().catch((err) => {
    fastify.log.warn('Failed to ensure vocab indexes:', err.message);
  });

  // POST /vocab: Tạo vocab mới
  fastify.post('/', async (req, rep) => {
    try {
      // fastify.log('Request body:', req.body);
      const id = await Vocab.createVocab(req.body);
      return rep.code(201).send({ message: 'Created', id });
    } catch (err) {
      const code = err.statusCode || 500;
      return rep.code(code).send({
        statusCode: code,
        error: code === 500 ? 'Internal Server Error' : 'Bad Request',
        message: err.message
      });
    }
  });

  // GET /vocab: Lấy danh sách vocab với pagination
  fastify.get('/', async (req, rep) => {
    try {
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 20;
      const res = await Vocab.getAllVocabs({ page, limit });
      return rep.send(res);
    } catch (err) {
      const code = err.statusCode || 500;
      return rep.code(code).send({
        statusCode: code,
        error: code === 500 ? 'Internal Server Error' : 'Bad Request',
        message: err.message
      });
    }
  });

  // GET /vocab/search: Tìm kiếm vocab
  fastify.get('/search', async (req, rep) => {
    try {
      const q = req.query.q || '';
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 20;
      const res = await Vocab.searchVocabs({ q, page, limit });
      return rep.send(res);
    } catch (err) {
      const code = err.statusCode || 500;
      return rep.code(code).send({
        statusCode: code,
        error: code === 500 ? 'Internal Server Error' : 'Bad Request',
        message: err.message
      });
    }
  });

    // GET /vocab/topic/:topic: Lấy vocab theo topic (thêm mới)
  fastify.get('/topic/:topic', async (req, rep) => {
    try {
      const topic = req.params.topic;
      if (!topic) {
        return rep.code(400).send({ message: 'Topic is required' });
      }
      const items = await Vocab.getVocabsByTopic(topic);
      return rep.send({ items });
    } catch (err) {
      const code = err.statusCode || 500;
      return rep.code(code).send({
        statusCode: code,
        error: code === 500 ? 'Internal Server Error' : 'Bad Request',
        message: err.message
      });
    }
  });

  // GET /vocab/:id: Lấy vocab theo ID
  fastify.get('/:id', async (req, rep) => {
    try {
      const doc = await Vocab.getVocabById(req.params.id);
      if (!doc) return rep.code(404).send({ message: 'Not found' });
      return rep.send(doc);
    } catch (err) {
      const code = err.statusCode || 500;
      return rep.code(code).send({
        statusCode: code,
        error: code === 500 ? 'Internal Server Error' : 'Bad Request',
        message: err.message
      });
    }
  });

  // PUT /vocab/:id: Cập nhật vocab
  fastify.put('/:id', async (req, rep) => {
    try {
      const ok = await Vocab.updateVocab(req.params.id, req.body);
      return rep.send({ success: ok });
    } catch (err) {
      const code = err.statusCode || 500;
      return rep.code(code).send({
        statusCode: code,
        error: code === 500 ? 'Internal Server Error' : 'Bad Request',
        message: err.message
      });
    }
  });

  // DELETE /vocab/:id: Xóa vocab
  fastify.delete('/:id', async (req, rep) => {
    try {
      const ok = await Vocab.deleteVocab(req.params.id);
      return rep.send({ success: ok });
    } catch (err) {
      const code = err.statusCode || 500;
      return rep.code(code).send({
        statusCode: code,
        error: code === 500 ? 'Internal Server Error' : 'Bad Request',
        message: err.message
      });
    }
  });
}

module.exports = vocabRoutes;