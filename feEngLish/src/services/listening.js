import api from "../api/api";

export const formatExerciseForApi = (formData = {}) => {
  const payload = {};

  if (formData.title !== undefined) payload.title = formData.title;

  if (formData.audioUrl !== undefined) payload.audioUrl = formData.audioUrl;

  if (formData.transcript !== undefined)
    payload.transcript = formData.transcript;

  if (formData.difficulty !== undefined)
    payload.difficulty = formData.difficulty;

  if (formData.topic !== undefined) payload.topic = formData.topic || null;

  if (Array.isArray(formData.blanks)) {
    payload.blanks = formData.blanks.map((b) => ({
      position: Number(b.position),
      answer: b.answer?.trim(),
      hint: b.hint || null,
    }));
  }

  return payload;
};

export const formatAnswersForApi = (userAnswers = {}) =>
  Object.entries(userAnswers).map(([position, userAnswer]) => ({
    position: Number(position),
    userAnswer: userAnswer?.trim() || "",
  }));

export const getExercises = async (params = {}) => {
  const res = await api.get("/listening", { params });
  return res.data;
};

export const getExerciseById = async (id) => {
  const res = await api.get(`/listening/${id}`);
  return res.data;
};

export const createExercise = async (data) => {
  const res = await api.post("/listening", data);
  return res.data;
};

export const updateExercise = async (id, data) => {
  const res = await api.put(`/listening/${id}`, data);
  return res.data;
};

export const deleteExercise = async (id) => {
  const res = await api.delete(`/listening/${id}`);
  return res.data;
};

export const submitAnswers = async (exerciseId, answers, timeSpent = 0) => {
  const formattedAnswers = Array.isArray(answers)
    ? answers
    : formatAnswersForApi(answers);

  const res = await api.post("/listening/submit", {
    exerciseId,
    answers: formattedAnswers,
    timeSpent: Math.round(timeSpent),
  });

  return res.data;
};

export const getStats = async () => {
  const res = await api.get("/listening/stats");
  console.log("lich su", res.data);
  return res.data;
};

export const getHistory = async (params = {}) => {
  const res = await api.get("/listening/history", { params });
  console.log("History: ", res.data);
  return res.data;
};

export const uploadAudio = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await api.post("/listening/upload-audio", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data;
};

export const deleteAudio = async (filename) => {
  const res = await api.delete("/listening/delete-audio", {
    data: { filename },
  });

  return res.data;
};
