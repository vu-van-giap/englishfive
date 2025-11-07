const fastify = require('fastify')({ logger: true });
const path = require('node:path');
const fastifyCors = require('@fastify/cors');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');

// Plugins cần thiết
fastify.register(fastifyCors, { origin: '*' }); // Cho phép frontend gọi API
fastify.register(require('@fastify/formbody'));
fastify.register(require('@fastify/multipart'), {
  limits: { fileSize: 5 * 1024 * 1024 } // giới hạn 5MB
});
fastify.register(require('@fastify/mongodb'), {
  url: 'mongodb://localhost:27017/EnglishUp',
  forceClose: true,
});

// 🔹 Đăng ký routes API
fastify.register(authRoutes, { prefix: '/api/auth' });
fastify.register(userRoutes, { prefix: '/api/users' });

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
