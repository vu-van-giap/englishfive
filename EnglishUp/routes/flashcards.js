// routes/flashcards.js
const flashcardModel = require("../models/flashcardModel");

/**
 * Plugin routes cho Flashcard API
 * @param {import('fastify').FastifyInstance} fastify
 * @param {object} options
 */
async function flashcardRoutes(fastify, options) {
  // Khởi tạo Flashcard model từ factory
  const Flashcard = await flashcardModel(fastify);

  // Tạo index 1 lần khi register plugin
  Flashcard.ensureIndexes().catch((err) => {
    fastify.log.warn("Failed to ensure flashcard indexes:", err.message);
  });

  // POST /flashcard: Tạo flashcard mới
  fastify.post("/", async (req, rep) => {
    try {
      const id = await Flashcard.createFlashcard(req.body);
      return rep.code(201).send({ message: "Created", id });
    } catch (err) {
      const code = err.statusCode || 500;
      return rep.code(code).send({
        statusCode: code,
        error: code === 500 ? "Internal Server Error" : "Bad Request",
        message: err.message,
      });
    }
  });

  // GET /flashcard: Lấy danh sách flashcard với pagination
  fastify.get("/", async (req, rep) => {
    try {
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 0; // 0 = không giới hạn
      const res = await Flashcard.getAllFlashcards({ page, limit });
      return rep.send(res);
    } catch (err) {
      const code = err.statusCode || 500;
      return rep.code(code).send({
        statusCode: code,
        error: code === 500 ? "Internal Server Error" : "Bad Request",
        message: err.message,
      });
    }
  });

  // GET /flashcard/search: Tìm kiếm flashcard
  fastify.get("/search", async (req, rep) => {
    try {
      const query = req.query.q;
      if (!query) {
        return rep.code(400).send({ error: "Query parameter q is required" });
      }
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 0; // 0 = không giới hạn
      const res = await Flashcard.searchFlashcards(query, { page, limit });
      return rep.send(res);
    } catch (err) {
      const code = err.statusCode || 500;
      return rep.code(code).send({
        statusCode: code,
        error: code === 500 ? "Internal Server Error" : "Bad Request",
        message: err.message,
      });
    }
  });

  // GET /flashcard/:id: Lấy flashcard theo ID
  fastify.get("/:id", async (req, rep) => {
    try {
      const flashcard = await Flashcard.getFlashcardById(req.params.id);
      if (!flashcard) {
        return rep.code(404).send({ error: "Flashcard not found" });
      }
      return rep.send(flashcard);
    } catch (err) {
      const code = err.statusCode || 500;
      return rep.code(code).send({
        statusCode: code,
        error: code === 500 ? "Internal Server Error" : "Bad Request",
        message: err.message,
      });
    }
  });

  // GET /flashcard/topic/:topic: Lấy flashcards theo topic
  fastify.get("/topic/:topic", async (req, rep) => {
    try {
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 0; // 0 = không giới hạn
      const res = await Flashcard.getFlashcardsByTopic(req.params.topic, {
        page,
        limit,
      });
      return rep.send(res);
    } catch (err) {
      const code = err.statusCode || 500;
      return rep.code(code).send({
        statusCode: code,
        error: code === 500 ? "Internal Server Error" : "Bad Request",
        message: err.message,
      });
    }
  });

  // PUT /flashcard/:id: Cập nhật flashcard
  fastify.put("/:id", async (req, rep) => {
    try {
      const updated = await Flashcard.updateFlashcard(req.params.id, req.body);
      if (!updated) {
        return rep
          .code(404)
          .send({ error: "Flashcard not found or no changes" });
      }
      return rep.send({ message: "Updated" });
    } catch (err) {
      const code = err.statusCode || 500;
      return rep.code(code).send({
        statusCode: code,
        error: code === 500 ? "Internal Server Error" : "Bad Request",
        message: err.message,
      });
    }
  });

  // DELETE /flashcard/:id: Xóa flashcard
  fastify.delete("/:id", async (req, rep) => {
    try {
      const deleted = await Flashcard.deleteFlashcard(req.params.id);
      if (!deleted) {
        return rep.code(404).send({ error: "Flashcard not found" });
      }
      return rep.send({ message: "Deleted" });
    } catch (err) {
      const code = err.statusCode || 500;
      return rep.code(code).send({
        statusCode: code,
        error: code === 500 ? "Internal Server Error" : "Bad Request",
        message: err.message,
      });
    }
  });

  // NEW: GET /flashcard/all - Lấy tất cả flashcards không phân trang (backward compatibility)
  fastify.get("/all", async (req, rep) => {
    try {
      const res = await Flashcard.getAllFlashcards({ page: 1, limit: 0 });
      return rep.send(res);
    } catch (err) {
      const code = err.statusCode || 500;
      return rep.code(code).send({
        statusCode: code,
        error: code === 500 ? "Internal Server Error" : "Bad Request",
        message: err.message,
      });
    }
  });
}

module.exports = flashcardRoutes;
