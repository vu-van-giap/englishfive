import api from "../api/api";

export const getTopics = async () => {
  const res = await api.get("/vocab/topics");
  return res.data;
};
export const getAllVocabs = async () => {
  const res = await api.get("/vocab");
  return res.data;
};
export const searchVocabs = async (query, page = 1, limit = 10) => {
  try {
    const response = await api.get("/vocab/search", {
      params: { q: query, page, limit },
    });
    return response.data;
  } catch (error) {
    console.error("Error searching vocabs:", error);
    throw error.response?.data || error;
  }
};
export const getVocabsByTopic = async (topic, page = 1, limit = 10) => {
  try {
    const response = await api.get(`/vocab/topic/${topic}`, {
      params: { page, limit },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching vocabs by topic:", error);
    throw error.response?.data || error;
  }
};
export const getVocabById = async (id) => {
  try {
    const response = await api.get(`/vocab/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching vocab by id:", error);
    throw error.response?.data || error;
  }
};

export const createVocab = async (data) => {
  try {
    const response = await api.post("/vocab", data);
    console.log("Creating vocab with data:", data);
    return response.data;
  } catch (error) {
    console.error("Error creating vocab:", error);
    throw error.response?.data || error;
  }
};
export const updateVocab = async (id, data) => {
  try {
    const response = await api.put(`/vocab/${id}`, data);
    return response.data;
  } catch (error) {
    console.error("Error updating vocab:", error);
    throw error.response?.data || error;
  }
};
export const deleteVocab = async (id) => {
  try {
    const response = await api.delete(`/vocab/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting vocab:", error);
    throw error.response?.data || error;
  }
};
