// models/quizModel.js
const { FastifyError } = require('fastify');
const { ObjectId } = require('mongodb');

/**
 * Hàm khởi tạo Model Quiz
 * @param {FastifyInstance} fastify - Đối tượng Fastify (để dùng fastify.mongo và fastify.log)
 * @returns {Object} Các phương thức thao tác với collection 'quiz'
 */
async function quizModel(fastify) {
  if (!fastify || !fastify.mongo || !fastify.mongo.db) {
    throw new FastifyError('quizModel: fastify.mongo chưa được khởi tạo. Hãy register fastify-mongodb trước khi register routes.');
  }

  const collection = fastify.mongo.db.collection('quizs');

  // Tạo index để tối ưu query sort theo createdAt
  await collection.createIndex({ createdAt: -1 });

  // Hàm validation tái sử dụng
  function validateQuestionData({ prompt, options, answer }) {
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      throw new FastifyError('Prompt không hợp lệ: phải là chuỗi không rỗng.');
    }
    if (!Array.isArray(options) || options.length < 2) {
      throw new FastifyError('Options không hợp lệ: phải là mảng với ít nhất 2 phần tử.');
    }
    const trimmedOptions = options.map(opt => String(opt).trim()).filter(opt => opt.length > 0);
    if (trimmedOptions.length < 2 || new Set(trimmedOptions).size !== trimmedOptions.length) {
      throw new FastifyError('Options không hợp lệ: phải có ít nhất 2 phần tử không rỗng và không trùng lặp.');
    }
    if (!answer || typeof answer !== 'string' || answer.trim().length === 0) {
      throw new FastifyError('Answer không hợp lệ: phải là chuỗi không rỗng.');
    }
    const trimmedAnswer = answer.trim();
    if (!trimmedOptions.includes(trimmedAnswer)) {
      throw new FastifyError('Answer không hợp lệ: phải có trong options.');
    }
    return { prompt: prompt.trim(), options: trimmedOptions, answer: trimmedAnswer };
  }

  return {
    /**
     * Tạo câu hỏi mới
     * @param {Object} data - { prompt, options, answer }
     * @returns {string} ID của câu hỏi mới
     */
    async createQuestion({ prompt, options, answer }) {
      try {
        const validatedData = validateQuestionData({ prompt, options, answer });

        const doc = {
          ...validatedData,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const result = await collection.insertOne(doc);
        fastify.log.info(`Đã tạo câu hỏi mới với ID: ${result.insertedId}`);
        return result.insertedId.toString();
      } catch (error) {
        fastify.log.error('Lỗi khi tạo câu hỏi:', error);
        throw new FastifyError('Không thể tạo câu hỏi mới.');
      }
    },

    /**
     * Lấy tất cả câu hỏi
     * @returns {Array} Danh sách câu hỏi
     */
    async getAllQuestions() {
      try {
        const questions = await collection.find({}).sort({ createdAt: -1 }).toArray();
        return questions;
      } catch (error) {
        fastify.log.error('Lỗi khi lấy danh sách câu hỏi:', error);
        throw new FastifyError('Không thể lấy danh sách câu hỏi.');
      }
    },

    /**
     * Lấy câu hỏi theo ID
     * @param {string} id - ID của câu hỏi
     * @returns {Object|null} Câu hỏi hoặc null
     */
    async getQuestionById(id) {
      try {
        if (!ObjectId.isValid(id)) throw new FastifyError('ID không hợp lệ.');
        const question = await collection.findOne({ _id: new ObjectId(id) });
        if (!question) {
          throw new FastifyError('Không tìm thấy câu hỏi với ID này.');
        }
        return question;
      } catch (error) {
        fastify.log.error(`Lỗi khi lấy câu hỏi với ID ${id}:`, error);
        throw new FastifyError('Không thể lấy câu hỏi.');
      }
    },

    /**
     * Cập nhật câu hỏi
     * @param {string} id - ID của câu hỏi
     * @param {Object} data - Dữ liệu cập nhật (có thể partial)
     * @returns {boolean} True nếu cập nhật thành công
     */
    async updateQuestion(id, data) {
      try {
        if (!ObjectId.isValid(id)) throw new FastifyError('ID không hợp lệ.');
        if (!data || typeof data !== 'object') throw new FastifyError('Dữ liệu cập nhật không hợp lệ.');

        // Validate nếu data có prompt/options/answer
        let validatedData = {};
        if (data.prompt || data.options || data.answer) {
          validatedData = validateQuestionData({
            prompt: data.prompt || '',
            options: data.options || [],
            answer: data.answer || '',
          });
        }

        const updateData = { ...data, ...validatedData, updatedAt: new Date() };

        const result = await collection.updateOne(
          { _id: new ObjectId(id) },
          { $set: updateData }
        );

        if (result.modifiedCount > 0) {
          fastify.log.info(`Cập nhật câu hỏi với ID ${id}: thành công.`);
        } else {
          fastify.log.warn(`Cập nhật câu hỏi với ID ${id}: không có thay đổi (có thể ID không tồn tại).`);
        }
        return result.modifiedCount > 0;
      } catch (error) {
        fastify.log.error(`Lỗi khi cập nhật câu hỏi với ID=${id}:`, error);
        throw new FastifyError('Không thể cập nhật câu hỏi.');
      }
    },

    /**
     * Xóa câu hỏi
     * @param {string} id - ID của câu hỏi
     * @returns {boolean} True nếu xóa thành công
     */
    async deleteQuestion(id) {
      try {
        if (!ObjectId.isValid(id)) throw new FastifyError('ID không hợp lệ.');

        const result = await collection.deleteOne({ _id: new ObjectId(id) });
        if (result.deletedCount > 0) {
          fastify.log.info(`Xóa câu hỏi với ID=${id}: thành công.`);
        } else {
          fastify.log.warn(`Xóa câu hỏi với ID=${id}: không tìm thấy tài liệu.`);
        }
        return result.deletedCount > 0;
      } catch (error) {
        fastify.log.error(`Lỗi khi xóa câu hỏi với ID=${id}:`, error);
        throw new FastifyError('Không thể xóa câu hỏi.');
      }
    },
  };
}

module.exports = quizModel;
