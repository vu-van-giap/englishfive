const quizModel = require('../models/quizModel');

module.exports = async function (fastify) {
  const Quiz = quizModel(fastify);

  // Lấy tất cả câu hỏi
  fastify.get('/quiz', async (req, rep) => {
    const questions = await Quiz.getAllQuestions();
    rep.send(questions);
  });

  // Tao câu hỏi mới
  fastify.post('/quiz', async (req, rep) => {
    const id = await Quiz.createQuestion(req.body);
    rep.code(201).send({ message: 'Question created', id });
  });

  // Cập nhật quiz
  fastify.put('/quiz/:id', async (req, rep) => {
    const success = await Quiz.updateQuestion(req.params.id, req.body);
    rep.send({ updated: success });
  });

  // Xóa quiz
  fastify.delete('/quiz/:id', async (req, rep) => {
    const success = await Quiz.deleteQuestion(req.params.id);
    rep.send({ deleted: success });
  });
};
