const { FastifyError } = require('fastify');
const { ObjectId } = require('mongodb');

/**
    //Hàm khởi tạo Model Quiz
    @param {FastifyInstance} fastify - Dối tuợng Fastify được truyền từ ngoài vào (để dùng fastify.mongo)
    @returns {Object} Các phương thức thao tác với collection 'quiz'
*/
// Hàm khởi tạo Model (nhận vào fastify để dùng fastify.mongo)
module.exports = function (fastify) {
  const collection = fastify.mongo.db.collection('quiz');

  return {
    
    /**
    // Tạo câu hỏi mới
    @param {Object} data - Dữ liệu câu hỏi gồm prompt, options, answer
    @param {string} data.prompt - Câu hỏi (nội dung chính)
    @param {Array<string>} data.options - Danh sách các lựa chọn trả lời
    @param {string} data.answer - Đáp án đúng
    @returns {ObjectId} ID của câu hỏi mới tạo
    */
    async createQuestion({ prompt, options, answer }) {
      try { 
        // Kiểm tra dữ liệu đầu vào
        if (!prompt || !Array.isArray(options) || options.length < 2 || !answer || !options.includes(answer)) {
          throw new FastifyError('Dữ liệu không hợp lệ. Cần có prompt, options (>=2), và answer phải có trong options.');
        }

        // Tạo đối tượng tài liệu để lưu vào DB
        const doc = {
          prompt: prompt.trim(),
          options: options.map(opt => opt.trim()),
          answer: answer.trim(),
          createdAt: new Date(),
          updaytedAt: new Date(),
        };
        
        // Thực hiện thêm vào mongoDB
        const result = await collection.insertOne(doc);

        // Log kết quả để dễ debug
        fastify.log.info(`Đã tạo câu hỏi mới vối ID: ${result.insertedId}`);
        return result.insertedId;
      } catch (error) {
        fastify.log.error('Lỗi khi tạo câu hỏi:', error);
        throw new FastifyError('Không thể tạo câu hỏi mới.');
        }
      },
    
    /**
    // Lấy tất cả câu hỏi trong collection
    @returns {Array<Object>} Danh sách các câu hỏi  
    */
    async getAllQuestions() {
      try {
        const questions = await collection.find({}).sort({ createdAt: -1}).toArray();
        return questions;
      } catch (error) {
        fastify.log.error('Lỗi khi lấy danh sách câu hỏi:', error);
        throw new FastifyError('Không thể lấy danh sách câu hỏi.');
      }
    },
    /**
    // Lấy chi tiết từng câu hỏi theo ID
    @param {string} id - ID của câu hỏi (chuỗi hex)
    @returns {Object|null} Đối tượng câu hỏi hoặc null nếu không tìm thấy
    */
    async getQuestionById(id) {
      try {
        if (!ObjectId.isValid(id)) throw new FastifyError('ID không hợp lệ.');
        const question = await collection.findOne({ _id: new ObjectId(id) });
        return question;
      } catch (error) {
        fastify.log.error(`Lỗi khi lấy câu hỏi với ID ${id}:`, error);
        throw new FastifyError('Không thể lấy câu hỏi.');
      }
    },

    /**
    // Cập nhật câu hỏi
    @param {string} id - ID của câu hỏi cần cập nhật
    @param {Object} data - Dữ liệu cần cập nhập (prompt, options, answer)
    @returns {boolean} Trả về true nếu cập nhật thành công, false nếu không có thay đổi
    */
    async updateQuestion(id, data) {
      try {
        if (!ObjectId.isValid(id)) throw new FastifyError('ID không hợp lệ.');
        if (!data || typeof data !== 'object') throw new FastifyError('Dữ liệu cập nhật không hợp lệ.');


        const updateData = { ...data, updatedAt: new Date() };

        const result = await collection.updateOne(
          { _id: new ObjectId(id) },
          { $set: updateData }
        );
        
        fastify.log.info(`Cập nhật câu hỏi với ID ${id}: ${result.modifiedCount} tài liệu đã được cập nhật.`);
        return result.modifiedCount > 0;
      } catch (error) {
        fastify.log.error(`Lỗi khi cập nhật câu hỏi với ID=${id}:`, error);
        throw new FastifyError('Không thể cập nhật câu hỏi.');
      }
    },

    /**
    // Xóa câu hỏi theo ID
    @param {string} id - ID của câu hỏi cần xóa
    @returns {boolean} Trả về true nếu xóa thành công, false nếu không tìm thấy câu hỏi
    */
    async deleteQuestion(id) {
      try {
        if (!ObjectId.isValid(id)) throw new FastifyError('ID không hợp lệ.');
        
        const result = await collection.deleteOne({ _id: new ObjectId(id) });

        fastify.log.info(`Xóa câu hỏi với ID=${id} | deletedCount=${result.deletedCount}`);
        return result.deletedCount > 0;
      } catch (error) {
        fastify.log.error(`Lỗi khi xóa câu hỏi với ID=${id}:`, error);
        throw new FastifyError('Không thể xóa câu hỏi.');
      }
    },
  };
};

