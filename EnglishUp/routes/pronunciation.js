// routes/pronunciation.js
const { ObjectId } = require('mongodb');
const auth = require('../auth-hook');
const pronunciationModel = require('../models/pronunciationModel');

/**
 * Plugin routes cho Pronunciation API
 * Hỗ trợ luyện phát âm theo chủ đề
 * @param {import('fastify').FastifyInstance} fastify
 * @param {object} options
 */
async function pronunciationRoutes(fastify, options) {
  const db = fastify.mongo.db;
  const Pronunciation = await pronunciationModel(fastify);

  // Ensure indexes
  Pronunciation.ensureIndexes().catch(err => {
    fastify.log.warn('Failed to ensure pronunciation indexes:', err.message);
  });

  // Schema validation
  const getPronunciationSchema = {
    params: {
      type: 'object',
      required: ['wordId'],
      properties: {
        wordId: { type: 'string', pattern: '^[0-9a-fA-F]{24}$' }
      }
    }
  };

  const savePronunciationAttemptSchema = {
    body: {
      type: 'object',
      required: ['wordId', 'transcription'],
      properties: {
        wordId: { type: 'string', pattern: '^[0-9a-fA-F]{24}$' },
        transcription: { type: 'string', minLength: 1 },
        accuracy: { type: 'number', minimum: 0, maximum: 100 }
      }
    }
  };

  // GET /pronunciation/:wordId: Lấy thông tin phát âm của từ
  fastify.get('/:wordId', {
    schema: getPronunciationSchema,
    onRequest: auth
  }, async (req, rep) => {
    try {
      const { wordId } = req.params;
      const word = await Pronunciation.getWordById(wordId);

      return rep.send({
        success: true,
        data: {
          word: word.english,
          vietnamese: word.vietnamese,
          syllables: word.syllables || word.english,
          phonetic: word.phonetic || word.pronunciation || '',
          audioUrl: word.audioUrl || null
        }
      });
    } catch (err) {
      fastify.log.error('GET /pronunciation/:wordId error:', err);
      const code = err.statusCode || 500;
      return rep.code(code).send({
        success: false,
        message: err.message || 'Internal Server Error'
      });
    }
  });

  // POST /pronunciation/practice: Lưu kết quả luyện phát âm
  fastify.post('/practice', {
    schema: savePronunciationAttemptSchema,
    onRequest: auth
  }, async (req, rep) => {
    try {
      const { wordId, transcription, accuracy } = req.body;
      const userId = req.user.username;

      // Lấy từ
      const word = await Pronunciation.getWordById(wordId);

      // So sánh
      const correctWord = word.english.toLowerCase();
      const userWord = transcription.toLowerCase().trim();
      const isCorrect = correctWord === userWord;
      
      // Tính accuracy
      let finalAccuracy = accuracy;
      if (finalAccuracy === undefined) {
        if (isCorrect) {
          finalAccuracy = 100;
        } else {
          const similarity = calculateSimilarity(correctWord, userWord);
          finalAccuracy = Math.round(similarity * 100);
        }
      }

      // Lưu kết quả
      await Pronunciation.saveAttempt(userId, wordId, {
        transcription: userWord,
        accuracy: finalAccuracy,
        isCorrect,
        topicId: word.topicId || null
      });

      return rep.code(201).send({
        success: true,
        data: {
          accuracy: finalAccuracy,
          isCorrect,
          feedback: getFeedback(finalAccuracy)
        }
      });
    } catch (err) {
      fastify.log.error('POST /pronunciation/practice error:', err);
      const code = err.statusCode || 500;
      return rep.code(code).send({
        success: false,
        message: err.message || 'Internal Server Error'
      });
    }
  });

  // GET /pronunciation/topics: Lấy danh sách chủ đề phát âm
  fastify.get('/topics', {
    onRequest: auth
  }, async (req, rep) => {
    try {
      const topics = await Pronunciation.getTopics();

      return rep.send({
        success: true,
        items: topics
      });
    } catch (err) {
      fastify.log.error('GET /pronunciation/topics error:', err);
      return rep.code(500).send({
        success: false,
        message: 'Internal Server Error'
      });
    }
  });

  // GET /pronunciation/topics/:topicId/words: Lấy danh sách từ theo chủ đề
  fastify.get('/topics/:topicId/words', {
    onRequest: auth
  }, async (req, rep) => {
    try {
      const { topicId } = req.params;

      // Lấy topic
      const topic = await Pronunciation.getTopicById(topicId);

      // Lấy words
      const words = await Pronunciation.getWordsByTopic(topicId);

      // Enrich words
      const enrichedWords = words.map(word => ({
        _id: word._id,
        word: word.english,
        vietnamese: word.vietnamese,
        syllables: word.syllables || word.english,
        phonetic: word.phonetic || word.pronunciation || '',
        audioUrl: word.audioUrl || null
      }));

      return rep.send({
        success: true,
        topic: {
          _id: topic._id,
          name: topic.name,
          description: topic.description,
          icon: topic.icon
        },
        words: enrichedWords
      });
    } catch (err) {
      fastify.log.error('GET /pronunciation/topics/:topicId/words error:', err);
      const code = err.statusCode || 500;
      return rep.code(code).send({
        success: false,
        message: err.message || 'Internal Server Error'
      });
    }
  });

  // GET /pronunciation/stats: Thống kê luyện phát âm
  fastify.get('/stats', {
    onRequest: auth
  }, async (req, rep) => {
    try {
      const userId = req.user.username;
      const stats = await Pronunciation.getUserStats(userId);

      return rep.send({
        success: true,
        data: stats
      });
    } catch (err) {
      fastify.log.error('GET /pronunciation/stats error:', err);
      return rep.code(500).send({
        success: false,
        message: 'Internal Server Error'
      });
    }
  });

  // GET /pronunciation/history: Lịch sử luyện tập
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

      const result = await Pronunciation.getAttemptHistory(userId, {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10)
      });

      // Populate word info
      const enrichedItems = await Promise.all(
        result.items.map(async (item) => {
          const word = await db.collection('words').findOne({
            _id: item.wordId
          });

          return {
            _id: item._id,
            wordId: item.wordId,
            word: word ? {
              english: word.english,
              vietnamese: word.vietnamese,
              phonetic: word.phonetic || word.pronunciation
            } : null,
            transcription: item.transcription,
            accuracy: item.accuracy,
            isCorrect: item.isCorrect,
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
      fastify.log.error('GET /pronunciation/history error:', err);
      return rep.code(500).send({
        success: false,
        message: 'Internal Server Error'
      });
    }
  });

  // Helper function: Tính độ tương đồng giữa 2 chuỗi
  function calculateSimilarity(str1, str2) {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  // Helper function: Levenshtein distance
  function levenshteinDistance(str1, str2) {
    const matrix = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }

  // Helper function: Feedback dựa trên độ chính xác
  function getFeedback(accuracy) {
    if (accuracy >= 95) return 'Xuất sắc! Phát âm hoàn hảo! 🎉';
    if (accuracy >= 85) return 'Rất tốt! Bạn phát âm chính xác! 👍';
    if (accuracy >= 70) return 'Khá tốt! Hãy thử lại để cải thiện! 💪';
    if (accuracy >= 50) return 'Cần cải thiện. Hãy nghe và thử lại! 🎯';
    return 'Hãy cố gắng luyện tập thêm! Bạn làm được! 💪';
  }
}

module.exports = pronunciationRoutes;