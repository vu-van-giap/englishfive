const fastify = require('fastify')({ logger: true });
const path = require('node:path');
// Import các routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');


// Plugins
fastify.register(require('@fastify/cookie'));
fastify.register(require('@fastify/formbody'));
fastify.register(require('@fastify/view'), {
  engine: { pug: require('pug') },
  root: './views',
  propertyName: 'render',
});
fastify.register(require('@fastify/static'), {
  root: path.join(__dirname, 'public'),
  prefix: '/static/',
});
fastify.register(require('@fastify/mongodb'), {
  url: 'mongodb://localhost:27017/demo',
  forceClose: true,
});
fastify.register(require('@fastify/multipart'), {
  limits: {
    fileSize: 5 * 1024 * 1024 // giới hạn 5MB
  }
});

// Routes
fastify.register(authRoutes);
fastify.register(userRoutes);


// Start server
fastify.listen({ port: 3000 }, (err) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
});
