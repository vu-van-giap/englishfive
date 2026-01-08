import api from "../api/api";

export const getAllQuiz = async () => {
    const res = await api.get("/quiz");
    return res.data;
};

export const getQuizByTopic = async (topic) => {
    const res = await api.get(`/quiz/topic/${topic}`);
    return res.data;
};

export const getQuizById = async (id) => {
    const res = await api.get(`/quiz/${id}`);
    return res.data;
};
export const createQuiz = async (data) => {
  const res = await api.post('/quiz', data);
  return res.data;
};

export const updateQuiz = async (id, data) => {
  const res = await api.put(`/quiz/${id}`, data);
  return res.data;
};

export const deleteQuizById = async (id) => {
  const res = await api.delete(`/quiz/${id}`);
  return res.data;
};
