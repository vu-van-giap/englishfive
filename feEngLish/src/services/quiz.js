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