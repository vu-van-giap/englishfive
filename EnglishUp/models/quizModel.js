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

  const collection = fastify.mongo.db.collection('quiz');

  // Tạo index để tối ưu query sort theo createdAt
  await collection.createIndex({ createdAt: -1 });
  await collection.createIndex({ topic: 1 });
 
  // Hàm validation tái sử dụng
  function validateQuestion({ prompt, choices, vocabRef }) {
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      throw new FastifyError('Prompt không hợp lệ: phải là chuỗi không rỗng.');
    }
    if (!Array.isArray(choices) || choices.length < 1) {
      throw new FastifyError('Choices không hợp lệ: phải là mảng với ít nhất 1 phần tử.');
    }
    const validChoices = choices.map(choice => {
      if (!choice.text || typeof choice.text !== 'string' || choice.text.trim().length === 0) {
        throw new FastifyError('Choice text không hợp lệ: phải là chuỗi không rỗng.');
      }
       return { 
        text: choice.text.trim(),
        isCorrect: Boolean(choice.isCorrect) // Đảm bảo boolean
      }; 
    });
    // Kiểm tra đúng 1 choice có is isCorrect: true
    const correctCount = validChoices.filter(c => c.isCorrect).length;
    if (correctCount !== 1) {
      throw new FastifyError('Choices không hợp lệ: phải có đúng 1 choice đúng (isCorrect: true).');
    }
    //vocabRef optional, nhưng nếu có thì phải là ObjectId hợp lệ
    let validVocabRef = null;
    if (vocabRef) {
      if (!ObjectId.isValid(vocabRef)) {
        throw new FastifyError('vocabRef không hợp lệ: phải là ObjectId hợp lệ.');
      }
      validVocabRef = new ObjectId(vocabRef);
    }
    return { prompt: prompt.trim(), choices: validChoices, vocabRef: validVocabRef };
  }

  //Hàm validation cho toàn bộ quiz
function validateQuizData({ title, topic, questions, totalScore, createdBy, finishedAt }) {
    if (title && (typeof title !== 'string' || title.trim().length === 0)) {
      throw new FastifyError('Title không hợp lệ: phải là chuỗi không rỗng.');
    }
    if (topic && (typeof topic !== 'string' || topic.trim().length === 0)) {
      throw new FastifyError('Topic không hợp lệ: phải là chuỗi không rỗng.');
    }
    if (!Array.isArray(questions) || questions.length === 0) {
      throw new FastifyError('Questions không hợp lệ: phải là mảng không rỗng.');
    }
    const validQuestions = questions.map(q => validateQuestion(q));
    if (totalScore !== undefined && (typeof totalScore !== 'number' || totalScore < 0)) {
      throw new FastifyError('TotalScore không hợp lệ: phải là số >= 0.');
    }
    if (createdBy && typeof createdBy !== 'string') {
      throw new FastifyError('CreatedBy không hợp lệ: phải là chuỗi.');
    }
    if (finishedAt && !(finishedAt instanceof Date)) {
      throw new FastifyError('FinishedAt không hợp lệ: phải là Date.');
    }
    return {
      title: title ? title.trim() : 'Quiz',
      topic: topic ? topic.trim() : undefined,
      questions: validQuestions,
      totalScore: totalScore || 0,
      createdBy: createdBy || undefined,
      finishedAt: finishedAt || undefined
    };
  }

  return {
    /**
     * Tạo câu hỏi mới
     * @param {Object} data - {title, topic, question:[{prompt, choices: [{text, isCorrect}], vocabRef}], totalScore, creatdBy, finishedAt}
     * @returns {string} ID của câu hỏi mới
     */
    async createQuiz(data) {
      try {
        const validatedData = validateQuizData(data);

        const doc = {
          ...validatedData,
          createdAt: new Date(),
        };

        const result = await collection.insertOne(doc);
        fastify.log.info(`Đã tạo quiz mới với ID: ${result.insertedId}`);
        return result.insertedId.toString();
      } catch (error) {
        fastify.log.error('Lỗi khi tạo quiz:', error);
        throw new FastifyError('Không thể tạo quiz mới.');
      }
    },

    /**
     * Lấy tất cả quizzes
     * @param {number} limit - Số lượng tối đa
     * @param {number} offset - Bỏ qua số lượng
     * @returns {Array} Danh sách quizzes
     */
    async getAllQuizzes(limit = 50, offset = 0) {
      try {
        const quizzes = await collection.find({}).sort({ createdAt: -1 }).skip(offset).limit(limit).toArray();
        return quizzes;
      } catch (error) {
        fastify.log.error('Lỗi khi lấy danh sách quizzes:', error);
        throw new FastifyError('Không thể lấy danh sách quizzes.');
      }
    },

    /**
     * Lấy câu hỏi theo ID
     * @param {string} id - ID của câu hỏi
     * @returns {Object|null} Câu hỏi hoặc null
     */
    async getQuizById(id) {
      try {
        if (!ObjectId.isValid(id)) throw new FastifyError('ID không hợp lệ.');
        const quiz = await collection.findOne({ _id: new ObjectId(id) });
        if (!quiz) {
          throw new FastifyError('Không tìm thấy câu hỏi với ID này.');
        }
        return quiz;
      } catch (error) {
        fastify.log.error(`Lỗi khi lấy câu hỏi với ID ${id}:`, error);
        throw new FastifyError('Không thể lấy quiz.');
      }
    },

    /**
     * Cập nhật câu hỏi
     * @param {string} id - ID của quiz
     * @param {Object} data - Dữ liệu cập nhật (có thể partial)
     * @returns {boolean} True nếu cập nhật thành công
     */
    async updateQuiz(id, data) {
      try {
        if (!ObjectId.isValid(id)) throw new FastifyError('ID không hợp lệ.');
        if (!data || typeof data !== 'object') throw new FastifyError('Dữ liệu cập nhật không hợp lệ.');

        // Validate nếu data có prompt/options/answer
     let validatedData = {};
      if (data.question || data.title || data.topic || data.totalScore !== undefined || data.createdBy || data.finishedAt) {
        // Lấy dữ liệu hiện tại để fill những field không được gửi lên
        const current = await collection.findOne({ _id: new ObjectId(id) });
        if (!current) throw new AppError('Không tìm thấy câu hỏi.', 404);

        const toValidate = {
          title: data.title !== undefined ? data.title : current.title,
          topic: data.topic !== undefined ? data.topic : current.topic,
          questions: data.questions !== undefined ? data.questions : current.questions,
          totalScore: data.totalScore !== undefined ? data.totalScore : current.totalScore,
          createdBy: data.createdBy !== undefined ? data.createdBy : current.createdBy,
          finishedAt: data.finishedAt !== undefined ? data.finishedAt : current.finishedAt,
        };

        validatedData = validateQuizData(toValidate);
    }

        const updateData = { ...data, ...validatedData, updatedAt: new Date() };

        const result = await collection.updateOne(
          { _id: new ObjectId(id) },
          { $set: updateData }
        );

        if (result.modifiedCount > 0) {
          fastify.log.info(`Cập nhật quiz với ID ${id}: thành công.`);
        } else {
          fastify.log.warn(`Cập nhật quiz với ID ${id}: không có thay đổi .`);
        }
        return result.modifiedCount > 0;
      } catch (error) {
        fastify.log.error(`Lỗi khi cập nhật quiz với ID=${id}:`, error);
        throw new FastifyError('Không thể cập nhật quiz.');
      }
    },

    /**
     * Xóa câu hỏi
     * @param {string} id - ID của quiz
     * @returns {boolean} True nếu xóa thành công
     */
    async deleteQuestion(id) {
      try {
        if (!ObjectId.isValid(id)) throw new FastifyError('ID không hợp lệ.');

        const result = await collection.deleteOne({ _id: new ObjectId(id) });
        if (result.deletedCount > 0) {
          fastify.log.info(`Xóa quiz với ID=${id}: thành công.`);
        } else {
          fastify.log.warn(`Xóa quiz với ID=${id}: không tìm thấy tài liệu.`);
        }
        return result.deletedCount > 0;
      } catch (error) {
        fastify.log.error(`Lỗi khi xóa quiz với ID=${id}:`, error);
        throw new FastifyError('Không thể xóa qiuz.');
      }
    },
  };
}

module.exports = quizModel;
