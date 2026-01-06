// models/quizModel.js
const { FastifyError } = require('fastify');
const { ObjectId } = require('mongodb');

// Mapping topic -> hình ảnh đại diện (có thể mở rộng dễ dàng)
const TOPIC_IMAGES = {
  'Family': 'https://www.shutterstock.com/image-photo/directly-above-shot-happy-family-260nw-2484961857.jpg', // Happy family cartoon
  'Food and Drinks': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSsaYKkdPy6VHcUADle6BurPp8Y-vdHxGvaqA&s', // Colorful food
  'Animals': 'https://hoanghamobile.com/tin-tuc/wp-content/uploads/2024/06/hinh-anh-con-vat.jpg', // Cute animals
  'Colors': 'https://benative.vn/wp-content/uploads/2019/07/tu-vung-tieng-anh-theo-chu-de-mau-sac.jpg', // Rainbow colors
  'Daily Routines': 'https://thumbs.dreamstime.com/b/routine-child-boy-going-back-to-school-wake-up-brushes-teeth-takes-shower-eat-has-breakfast-vector-cartoon-129680865.jpg',
  'Weather': 'https://alokiddy.com.vn/Uploads/images/huong/tu-vung-tieng-anh-ve-thoi-tiet-weather.jpg',
  'Jobs': 'https://media.istockphoto.com/id/1281220412/vi/vec-to/t%C3%ACm-ki%E1%BA%BFm-%E1%BB%A9ng-vi%C3%AAn-ho%E1%BA%B7c-c%C3%B4ng-vi%E1%BB%87c-t%E1%BB%91t-nh%E1%BA%A5t-nh%C3%A2n-s%E1%BB%B1-s%C4%83n-%C4%91%E1%BA%A7u-ng%C6%B0%E1%BB%9Di-ch%E1%BB%8Dn-nh%C3%A2n-t%C3%A0i-cho-v%E1%BB%8B-tr%C3%AD.jpg?s=612x612&w=0&k=20&c=nW3bXA_mtV2Q3H-tDRW1O4-dFeDNNFYgizFydjl7wd4=', // Occupations
  'Travel': 'https://upload.urbox.vn/strapi/vietravel_001_2c952c7e85.png', // Holiday travels
  'Sports': 'https://www.shutterstock.com/image-photo/dynamic-collage-athletes-various-sports-260nw-2493176587.jpg',
  'Body Parts': 'https://www.shutterstock.com/image-vector/body-part-little-african-boy-600nw-2355921939.jpg',
  'Studying': 'https://media.vneconomy.vn/images/upload/2023/06/09/khuyen-hoc-soc-trang-7.jpg?w=900'
};
/**
 * Khởi tạo Quiz Model - kết nối tới collection 'quiz' trong MongoDB
 * @param {FastifyInstance} fastify - Instance của Fastify đã register plugin mongodb
 * @returns {Promise<Object>} Object chứa các phương thức thao tác với quiz
 * @throws {Error} Nếu fastify.mongo chưa được khởi tạo
 */
async function quizModel(fastify) {
  if (!fastify?.mongo?.db) {
    throw new FastifyError('quizModel: fastify.mongo chưa được khởi tạo. Hãy register plugin mongodb trước.');
  }

  const collection = fastify.mongo.db.collection('quiz');

  // Tạo index để tối ưu query sort theo createdAt
  await collection.createIndex({ createdAt: -1 });
  await collection.createIndex({ topic: 1 });

  /**
   * Validate một câu hỏi riêng lẻ
   * @param {Object} question
   * @param {string} question.prompt - Câu hỏi (không rỗng)
   * @param {Array<Object>} question.choices - Danh sách lựa chọn, ít nhất 1 phần tử
   * @param {string} [question.vocabRef] - ID từ vựng liên kết (optional, phải là ObjectId hợp lệ)
   * @returns {Object} Câu hỏi đã được validate và chuẩn hóa
   * @throws {FastifyError} Nếu dữ liệu không hợp lệ
   * @private
   */
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

/**
   * Validate dữ liệu toàn bộ quiz
   * @param {Object} data
   * @param {string} [data.title] - Tiêu đề quiz
   * @param {string} [data.topic] - Chủ đề quiz
   * @param {Array<Object>} data.questions - Danh sách câu hỏi (bắt buộc, không rỗng)
   * @param {number} [data.totalScore] - Tổng điểm
   * @param {string} [data.createdBy] - Người tạo quiz
   * @param {Date} [data.finishedAt] - Thời gian kết thúc (nếu có)
   * @returns {Object} Dữ liệu quiz đã được validate và chuẩn hóa
   * @throws {FastifyError} Nếu có field không hợp lệ
   * @private
   */
  //Hàm validation cho toàn bộ quiz
function validateQuizData({ title, topic, questions, totalScore, createdBy, finishedAt }) {
    if (title !== undefined && (typeof title !== 'string' || title.trim().length === 0)) {
      throw new FastifyError('Title không hợp lệ: phải là chuỗi không rỗng.');
    }
    if (topic !== undefined && (typeof topic !== 'string' || topic.trim().length === 0)) {
      throw new FastifyError('Topic không hợp lệ: phải là chuỗi không rỗng.');
    }
    if (!Array.isArray(questions) || questions.length === 0) {
      throw new FastifyError('Questions không hợp lệ: phải là mảng không rỗng.');
    }
    const validQuestions = questions.map(q => validateQuestion(q));
    if (totalScore !== undefined && (typeof totalScore !== 'number' || totalScore < 0)) {
      throw new FastifyError('TotalScore không hợp lệ: phải là số >= 0.');
    }
    if (createdBy !== undefined && typeof createdBy !== 'string') {
      throw new FastifyError('CreatedBy không hợp lệ: phải là chuỗi.');
    }
    if (finishedAt !== undefined && !(finishedAt instanceof Date)) {
      throw new FastifyError('FinishedAt không hợp lệ: phải là Date.');
    }
    return {
      title: title ? title.trim() : 'Quiz',
      topic: topic ? topic.trim() : undefined,
      questions: validQuestions,
      totalScore: totalScore ?? 0,
      createdBy: createdBy || undefined,
      finishedAt: finishedAt || undefined
    };
  }

  return {
    /**
     * Tạo quiz mới
     * @param {Object} data - Dữ liệu quiz
     * @param {string} [data.title='Quiz'] - Tiêu đề
     * @param {string} [data.topic] - Chủ đề (sẽ tự động gắn hình ảnh từ TOPIC_IMAGES)
     * @param {Array<Object>} data.questions - Danh sách câu hỏi
     * @param {number} [data.totalScore=0] - Tổng điểm
     * @param {string} [data.createdBy] - Người tạo
     * @param {Date} [data.finishedAt] - Thời gian kết thúc
     * @returns {Promise<string>} ID (string) của quiz vừa tạo
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
     * Lấy danh sách tất cả quiz (có phân trang)
     * @param {number} [limit=50] - Số lượng tối đa
     * @param {number} [offset=0] - Bỏ qua bao nhiêu bản ghi
     * @returns {Promise<Array<Object>>} Mảng các quiz, mỗi quiz có thêm field topicImage
     */
    async getAllQuizzes(limit = 50, offset = 0) {
  try {
    let quizzes = await collection
      .find({})
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .toArray();

    // Thêm topicImage cho từng quiz
    quizzes = quizzes.map(quiz => ({
      ...quiz,
      topicImage: TOPIC_IMAGES[quiz.topic] || null // Nếu không có thì null
    }));

    return quizzes;
  } catch (error) {
    fastify.log.error('Lỗi khi lấy danh sách quizzes:', error);
    throw new FastifyError('Không thể lấy danh sách quizzes.');
  }
},

    /**
     * Lấy quiz theo ID
     * @param {string} id - ID quiz (dạng string của ObjectId)
     * @returns {Promise<Object>} Quiz chi tiết, có thêm topicImage
     * @throws {FastifyError} Nếu ID không hợp lệ hoặc không tìm thấy
     */
    async getQuizById(id) {
      try {
        if (!ObjectId.isValid(id)) throw new FastifyError('ID không hợp lệ.');
        const quiz = await collection.findOne({ _id: new ObjectId(id) });
        if (!quiz) throw new FastifyError('Không tìm thấy quiz.');

        return {
          ...quiz,
          topicImage: TOPIC_IMAGES[quiz.topic] || null
        };
      } catch (error) {
        fastify.log.error(`Lỗi khi lấy quiz ID ${id}:`, error);
        throw new FastifyError('Không thể lấy quiz.');
      }
    },

    /**
     * Cập nhật quiz (partial update - chỉ cập nhật các field được gửi)
     * @param {string} id - ID quiz
     * @param {Object} data - Các field muốn cập nhật
     * @param {string} [data.title] - Tiêu đề mới
     * @param {string} [data.topic] - Chủ đề mới
     * @param {Array<Object>} [data.questions] - Danh sách câu hỏi mới
     * @param {number} [data.totalScore] - Tổng điểm mới
     * @param {string} [data.createdBy] - Người tạo mới
     * @param {Date} [data.finishedAt] - Thời gian kết thúc mới
     * @returns {Promise<boolean>} true nếu có thay đổi, false nếu không
     */
    async updateQuiz(id, data) {
      try {
        if (!ObjectId.isValid(id)) throw new FastifyError('ID không hợp lệ.');
        if (!data || typeof data !== 'object') throw new FastifyError('Dữ liệu cập nhật không hợp lệ.');

        let updateData = { updatedAt: new Date() };

        if (
          data.title !== undefined ||
          data.topic !== undefined ||
          data.questions !== undefined ||
          data.totalScore !== undefined ||
          data.createdBy !== undefined ||
          data.finishedAt !== undefined
        ) {
        
        // Lấy dữ liệu hiện tại để fill những field không được gửi lên
        const current = await collection.findOne({ _id: new ObjectId(id) });
        if (!current) throw new FastifyError('Không tìm thất quiz để cập nhập.');

        const toValidate = {
            title: data.title ?? current.title,
            topic: data.topic ?? current.topic,
            questions: data.questions ?? current.questions,
            totalScore: data.totalScore ?? current.totalScore,
            createdBy: data.createdBy ?? current.createdBy,
            finishedAt: data.finishedAt ?? current.finishedAt,
          };

        const validated = validateQuizData(toValidate);
        updateData = { ...updateData, ...validated };
      } else {
        // Nếu chỉ cập nhập các field khác (ví dụ: thêm field mới), giữ nguyên data
        updateData = { ...updateData, ...data };
      }

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
     * Xóa quiz theo ID
     * @param {string} id - ID quiz cần xóa
     * @returns {Promise<boolean>} true nếu xóa thành công, false nếu không tìm thấy
     */
    async deleteQuiz(id) {
      try {
        if (!ObjectId.isValid(id)) throw new FastifyError('ID không hợp lệ.');
        const result = await collection.deleteOne({ _id: new ObjectId(id) });

        fastify.log.info(`Xóa quiz ID ${id}: ${result.deletedCount > 0 ? 'thành công' : 'không tìm thấy'}`);
        return result.deletedCount > 0;
      } catch (error) {
        fastify.log.error(`Lỗi xóa quiz ID ${id}:`, error);
        throw new FastifyError('Không thể xóa quiz.');
      }
    },

    /**
     * Lấy danh sách quiz theo chủ đề
     * @param {string} topic - Tên chủ đề (ví dụ: "Family", "Animals")
     * @param {number} [limit=50] - Số lượng tối đa
     * @param {number} [offset=0] - Phân trang
     * @returns {Promise<Object>} 
     *   { topic: string, topicImage: string|null, quizzes: Array<Object> }
     *   Mỗi quiz trong mảng có thêm field topicImage
     */
    async getQuizzesByTopic(topic, limit = 50, offset = 0) {
  try {
    if (!topic || typeof topic !== 'string') throw new Error('Topic không hợp lệ.');

    const normalizedTopic = topic.trim();
    let quizzes = await collection
      .find({ topic: normalizedTopic })
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .toArray();

    const topicImage = TOPIC_IMAGES[normalizedTopic] || null;

    // Trả về kèm thông tin topic chung (hữu ích cho trang list quiz theo topic)
    return {
      topic: normalizedTopic,
      topicImage,
      quizzes: quizzes.map(quiz => ({
        ...quiz,
        topicImage // Vẫn thêm cho từng quiz nếu cần
      }))
    };
  } catch (error) {
    fastify.log.error(`Lỗi lấy quiz theo topic ${topic}:`, error);
    throw new FastifyError('Không thể lấy quiz theo topic.');
  }
},
  };
}

module.exports = quizModel;
