// routes/listening.js
const { ObjectId } = require('mongodb');
const auth = require('../auth-hook');
const listeningModel = require('../models/listeningModel');

/**
 * Plugin routes cho Listening API
 * Luyện nghe và điền từ vào chỗ trống (fill in the blanks)
 * @param {import('fastify').FastifyInstance} fastify
 * @param {object} options
 */
async function listeningRoutes(fastify, options) {
  const db = fastify.mongo.db;
  const Listening = await listeningModel(fastify);

  // Ensure indexes
  Listening.ensureIndexes().catch(err => {
    fastify.log.warn('Failed to ensure listening indexes:', err.message);
  });

  // Schema validation
  const createExerciseSchema = {
    body: {
      type: 'object',
      required: ['title', 'audioUrl', 'transcript', 'blanks'],
      properties: {
        title: { type: 'string', minLength: 1 },
        audioUrl: { type: 'string', minLength: 1 },
        transcript: { type: 'string', minLength: 1 },
        blanks: {
          type: 'array',
          minItems: 1,
          items: {
            type: 'object',
            required: ['position', 'answer'],
            properties: {
              position: { type: 'integer', minimum: 0 },
              answer: { type: 'string', minLength: 1 },
              hint: { type: 'string' }
            }
          }
        },
        difficulty: { type: 'string', enum: ['easy', 'medium', 'hard'] },
        topic: { type: 'string' }
      }
    }
  };

  const submitAnswersSchema = {
    body: {
      type: 'object',
      required: ['exerciseId', 'answers'],
      properties: {
        exerciseId: { type: 'string', pattern: '^[0-9a-fA-F]{24}$' },
        answers: {
          type: 'array',
          items: {
            type: 'object',
            required: ['position', 'userAnswer'],
            properties: {
              position: { type: 'integer' },
              userAnswer: { type: 'string' }
            }
          }
        },
        timeSpent: { type: 'number', minimum: 0 }
      }
    }
  };

  // POST /listening: Tạo bài luyện nghe (admin only)
  fastify.post('/', {
    schema: createExerciseSchema,
    onRequest: auth
  }, async (req, rep) => {
    try {
      if (req.user.role !== 'admin') {
        return rep.code(403).send({
          success: false,
          message: 'Only admin can create exercises'
        });
      }

      const id = await Listening.createExercise(req.body);

      return rep.code(201).send({
        success: true,
        message: 'Exercise created successfully',
        exerciseId: id.toString()
      });
    } catch (err) {
      fastify.log.error('POST /listening error:', err);
      const code = err.statusCode || 500;
      return rep.code(code).send({
        success: false,
        message: err.message || 'Internal Server Error'
      });
    }
  });

  // GET /listening: Lấy danh sách bài luyện nghe
  fastify.get('/', {
    onRequest: auth,
    querystring: {
      type: 'object',
      properties: {
        page: { type: 'integer', minimum: 1, default: 1 },
        limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
        difficulty: { type: 'string', enum: ['easy', 'medium', 'hard'] },
        topic: { type: 'string' }
      }
    }
  }, async (req, rep) => {
    try {
      const { page, limit, difficulty, topic } = req.query;

      const result = await Listening.getAllExercises({
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        difficulty,
        topic
      });

      // Không trả về transcript và answers trong list
      const sanitizedItems = result.items.map(item => ({
        _id: item._id,
        title: item.title,
        audioUrl: item.audioUrl,
        difficulty: item.difficulty,
        topic: item.topic,
        blanksCount: item.blanks.length,
        createdAt: item.createdAt
      }));

      return rep.send({
        success: true,
        items: sanitizedItems,
        total: result.total,
        page: result.page,
        limit: result.limit
      });
    } catch (err) {
      fastify.log.error('GET /listening error:', err);
      return rep.code(500).send({
        success: false,
        message: 'Internal Server Error'
      });
    }
  });

  // POST /listening/submit: Nộp bài và chấm điểm
  fastify.post('/submit', {
    schema: submitAnswersSchema,
    onRequest: auth
  }, async (req, rep) => {
    try {
      const userId = req.user.username;
      const { exerciseId, answers, timeSpent } = req.body;

      // Lấy bài tập có đáp án để chấm
      const exercise = await Listening.getExerciseById(exerciseId, true);

      // Chấm điểm
      let correctCount = 0;
      const results = answers.map(userAns => {
        const correctBlank = exercise.blanks.find(b => b.position === userAns.position);
        
        if (!correctBlank) {
          return {
            position: userAns.position,
            userAnswer: userAns.userAnswer,
            correctAnswer: null,
            isCorrect: false
          };
        }

        // So sánh
        const isCorrect = userAns.userAnswer.toLowerCase().trim() === 
                         correctBlank.answer.toLowerCase().trim();
        
        if (isCorrect) correctCount++;

        return {
          position: userAns.position,
          userAnswer: userAns.userAnswer,
          correctAnswer: correctBlank.answer,
          isCorrect
        };
      });

      const totalBlanks = exercise.blanks.length;
      const score = Math.round((correctCount / totalBlanks) * 100);

      // Lưu kết quả
      await Listening.saveAttempt(userId, exerciseId, {
        answers: results,
        score,
        timeSpent
      });

      return rep.send({
        success: true,
        data: {
          score,
          correctCount,
          totalBlanks,
          percentage: score,
          results,
          feedback: getFeedback(score)
        }
      });
    } catch (err) {
      fastify.log.error('POST /listening/submit error:', err);
      const code = err.statusCode || 500;
      return rep.code(code).send({
        success: false,
        message: err.message || 'Internal Server Error'
      });
    }
  });

  // POST /listening/upload-audio: Upload file audio
  fastify.post('/upload-audio', {
    onRequest: auth
  }, async (req, rep) => {
    try {
      // 1. Check if admin
      if (req.user.role !== 'admin') {
        return rep.code(403).send({
          success: false,
          message: 'Only admin can upload audio files'
        });
      }

      // 2. Get uploaded file
      const data = await req.file();
      
      if (!data) {
        return rep.code(400).send({
          success: false,
          message: 'No file uploaded. Please select a file.'
        });
      }

      // 3. Validate file type
      const allowedTypes = ['audio/mpeg', 'audio/mp3', 'audio/m4a'];
      if (!allowedTypes.includes(data.mimetype)) {
        return rep.code(400).send({
          success: false,
          message: `Invalid file type: ${data.mimetype}. Only audio files (mp3, wav, ogg, m4a) are allowed.`
        });
      }

      // 4. Validate file size (already handled by multipart config, but double check)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (data.file.bytesRead > maxSize) {
        return rep.code(400).send({
          success: false,
          message: 'File too large. Maximum size is 10MB.'
        });
      }

      // 5. Generate unique filename
      const timestamp = Date.now();
      const originalName = data.filename
        .replace(/\s+/g, '-')           // Replace spaces with dashes
        .replace(/[^a-zA-Z0-9.-]/g, ''); // Remove special characters
      const filename = `${timestamp}-${originalName}`;
      
      // 6. Define file path
      const fs = require('fs');
      const path = require('path'); 
      const filepath = path.join(__dirname, '../uploads/audio', filename);

      // 7. Save file to disk
      const pump = require('util').promisify(require('stream').pipeline);
      await pump(data.file, fs.createWriteStream(filepath));

      // 8. Generate accessible URL
      const audioUrl = `/uploads/audio/${filename}`;
      const fullUrl = `http://localhost:3000${audioUrl}`;

      fastify.log.info(`Audio file uploaded successfully: ${filename}`);

      // 9. Return success response
      return rep.code(201).send({
        success: true,
        message: 'Audio file uploaded successfully',
        audioUrl: audioUrl,          // Relative URL
        fullUrl: fullUrl,             // Full URL for testing
        filename: filename,
        size: data.file.bytesRead,
        mimetype: data.mimetype
      });

    } catch (err) {
      fastify.log.error('POST /listening/upload-audio error:', err);
      return rep.code(500).send({
        success: false,
        message: 'Failed to upload file',
        error: err.message
      });
    }
  });

  // DELETE /listening/delete-audio: Xóa file audio
  fastify.delete('/delete-audio', {
    onRequest: auth,
    body: {
      type: 'object',
      required: ['filename'],
      properties: {
        filename: { type: 'string', minLength: 1 }
      }
    }
  }, async (req, rep) => {
    try {
      if (req.user.role !== 'admin') {
        return rep.code(403).send({
          success: false,
          message: 'Only admin can delete audio files'
        });
      }

      const { filename } = req.body;
      const fs = require('fs');
      const path = require('path');
      const filepath = path.join(__dirname, '../uploads/audio', filename);

      // Check if file exists
      if (!fs.existsSync(filepath)) {
        return rep.code(404).send({
          success: false,
          message: 'File not found'
        });
      }

      // Delete file
      fs.unlinkSync(filepath);

      fastify.log.info(`Audio file deleted: ${filename}`);

      return rep.send({
        success: true,
        message: 'Audio file deleted successfully'
      });

    } catch (err) {
      fastify.log.error('DELETE /listening/delete-audio error:', err);
      return rep.code(500).send({
        success: false,
        message: 'Failed to delete file'
      });
    }
  });

  // GET /listening/stats: Thống kê
  fastify.get('/stats', {
    onRequest: auth
  }, async (req, rep) => {
    try {
      const userId = req.user.username;
      const stats = await Listening.getUserStats(userId);

      return rep.send({
        success: true,
        data: stats
      });
    } catch (err) {
      fastify.log.error('GET /listening/stats error:', err);
      return rep.code(500).send({
        success: false,
        message: 'Internal Server Error'
      });
    }
  });

  // GET /listening/history: Lịch sử làm bài
  fastify.get('/history', {
    onRequest: auth,
    querystring: {
      type: 'object',
      properties: {
        page: { type: 'integer', minimum: 1, default: 1 },
        limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 }
      }
    }
  }, async (req, rep) => {
    try {
      const userId = req.user.username;
      const { page, limit } = req.query;

      const result = await Listening.getAttemptHistory(userId, {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10)
      });

      // Populate exercise info
      const enrichedItems = await Promise.all(
        result.items.map(async (item) => {
          const exercise = await db.collection('listening_exercises').findOne({
            _id: item.exerciseId
          });

          return {
            _id: item._id,
            exerciseId: item.exerciseId,
            exercise: exercise ? {
              title: exercise.title,
              difficulty: exercise.difficulty
            } : null,
            score: item.score,
            timeSpent: item.timeSpent,
            createdAt: item.createdAt
          };
        })
      );

      return rep.send({
        success: true,
        items: enrichedItems,
        total: result.total,
        page: result.page,
        limit: result.limit
      });
    } catch (err) {
      fastify.log.error('GET /listening/history error:', err);
      return rep.code(500).send({
        success: false,
        message: 'Internal Server Error'
      });
    }
  });

  // DELETE /listening/:id: Xóa bài tập (admin only)
  fastify.delete('/:id', {
    onRequest: auth,
    params: {
      type: 'object',
      required: ['id'],
      properties: {
        id: { type: 'string', pattern: '^[0-9a-fA-F]{24}$' }
      }
    }
  }, async (req, rep) => {
    try {
      // Check if admin
      if (req.user.role !== 'admin') {
        return rep.code(403).send({
          success: false,
          message: 'Only admin can delete exercises'
        });
      }

      const { id } = req.params;
      const success = await Listening.deleteExercise(id);

      if (success) {
        return rep.send({
          success: true,
          message: 'Exercise deleted successfully'
        });
      } else {
        return rep.code(404).send({
          success: false,
          message: 'Exercise not found'
        });
      }
    } catch (err) {
      fastify.log.error('DELETE /listening/:id error:', err);
      const code = err.statusCode || 500;
      return rep.code(code).send({
        success: false,
        message: err.message || 'Internal Server Error'
      });
    }
  });

  // PUT /listening/:id: Cập nhật bài luyện nghe (admin only)
  fastify.put('/:id', {
    onRequest: auth,
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', pattern: '^[0-9a-fA-F]{24}$' }
        }
      },
    }
  }, async (req, rep) => {
    try {
      // Check admin
      if (req.user.role !== 'admin') {
        return rep.code(403).send({
          success: false,
          message: 'Only admin can update exercises'
        });
      }

      const { id } = req.params;
      const updateData = req.body;

      // Không cho body rỗng
      if (!updateData || Object.keys(updateData).length === 0) {
        return rep.code(400).send({
          success: false,
          message: 'No data provided for update'
        });
      }

      const updated = await Listening.updateExercise(id, updateData);

      if (!updated) {
        return rep.code(404).send({
          success: false,
          message: 'Exercise not found'
        });
      }

      return rep.send({
        success: true,
        message: 'Exercise updated successfully'
      });
    } catch (err) {
      fastify.log.error('PUT /listening/:id error:', err);
      const code = err.statusCode || 500;
      return rep.code(code).send({
        success: false,
        message: err.message || 'Internal Server Error'
      });
    }
  });


  // GET /listening/:id: Lấy chi tiết bài tập (không có đáp án)
    fastify.get('/:id', {
      onRequest: auth
    }, async (req, rep) => {
      try {
        const { id } = req.params;
        const exercise = await Listening.getExerciseById(id, false);

        return rep.send({
          success: true,
          data: exercise
        });
      } catch (err) {
        fastify.log.error('GET /listening/:id error:', err);
        const code = err.statusCode || 500;
        return rep.code(code).send({
          success: false,
          message: err.message || 'Internal Server Error'
        });
      }
    });

  // Helper: Feedback
  function getFeedback(score) {
    if (score >= 90) return 'Xuất sắc! Khả năng nghe tuyệt vời! 🎉';
    if (score >= 75) return 'Tốt lắm! Tiếp tục phát huy! 👍';
    if (score >= 60) return 'Khá tốt! Hãy luyện tập thêm! 💪';
    if (score >= 40) return 'Cần cố gắng hơn! Nghe lại nhiều lần! 🎯';
    return 'Đừng nản chí! Hãy luyện tập đều đặn! 💪';
  }
}

module.exports = listeningRoutes;