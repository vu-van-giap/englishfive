const fastify = require('fastify')({ logger: true });
const path = require('node:path');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const wordRoutes = require('./routes/words');
const progressRoutes = require('./routes/progress');
const quizRoutes = require('./routes/quizs');
const vocabRoutes = require('./routes/vocabs');
const pronunciationRoutes = require('./routes/pronunciation');
const listeningRoutes = require('./routes/listening');
const flashcardRoutes = require('./routes/flashcards');

// Đăng ký plugin để phục vụ tệp tĩnh
fastify.register(require('@fastify/static'), {
  root: require('path').join(__dirname, '../feEnglish/public'), // Đường dẫn đến build của React
  prefix: '/', // Phục vụ từ root
});

// Plugins cần thiết
fastify.register(require('@fastify/formbody'));
fastify.register(require('@fastify/multipart'), {
  limits: { fileSize: 5 * 1024 * 1024 } // giới hạn 5MB
});
fastify.register(require('@fastify/mongodb'), {
  url: 'mongodb://localhost:27017/EnglishUp',
  forceClose: true,
});
// Cấu hình CORS để cho phép frontend truy cập API
fastify.register(require('@fastify/cors'), {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
});


// Đăng ký routes
fastify.register(authRoutes, { prefix: '/auth' });
fastify.register(userRoutes, { prefix: '/users' });
fastify.register(wordRoutes, { prefix: '/words' });
fastify.register(progressRoutes, { prefix: '/progress' });
fastify.register(quizRoutes, { prefix: '/quiz' });
fastify.register(vocabRoutes, { prefix: '/vocab' });
fastify.register(pronunciationRoutes, { prefix: '/pronunciation' });
fastify.register(listeningRoutes, { prefix: '/listening' });
fastify.register(flashcardRoutes, { prefix: '/flashcard' });

// 🔹 Khởi động server
const start = async () => {
  try {
    await fastify.listen({ port: 3000 });
    fastify.log.info('Backend API running on http://localhost:3000');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
