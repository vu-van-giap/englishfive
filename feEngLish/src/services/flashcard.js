import axios from "axios";

// Tạo instance axios với baseURL
const api = axios.create({
  baseURL: "http://localhost:3000", // Đổi port nếu backend chạy port khác
  headers: {
    "Content-Type": "application/json",
  },
});

const flashcardService = {
  // Lấy tất cả flashcards
  getAllFlashcards: async (page = 1, limit = 20) => {
    try {
      const response = await api.get(`/flashcard?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching flashcards:", error);
      throw error;
    }
  },

  // Tìm kiếm flashcards
  searchFlashcards: async (query, page = 1, limit = 20) => {
    try {
      const response = await api.get(
        `/flashcard/search?q=${query}&page=${page}&limit=${limit}`
      );
      return response.data;
    } catch (error) {
      console.error("Error searching flashcards:", error);
      throw error;
    }
  },

  // Lấy flashcards theo topic
  getFlashcardsByTopic: async (topic, page = 1, limit = 20) => {
    try {
      const response = await api.get(
        `/flashcard/topic/${topic}?page=${page}&limit=${limit}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching flashcards by topic:", error);
      throw error;
    }
  },

  // Lấy flashcard theo ID
  getFlashcardById: async (id) => {
    try {
      const response = await api.get(`/flashcard/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching flashcard by ID:", error);
      throw error;
    }
  },

  // Tạo flashcard mới
  createFlashcard: async (flashcardData) => {
    try {
      const response = await api.post("/flashcard", flashcardData);
      return response.data;
    } catch (error) {
      console.error("Error creating flashcard:", error);
      throw error;
    }
  },

  // Cập nhật flashcard
  updateFlashcard: async (id, flashcardData) => {
    try {
      const response = await api.put(`/flashcard/${id}`, flashcardData);
      return response.data;
    } catch (error) {
      console.error("Error updating flashcard:", error);
      throw error;
    }
  },

  // Xóa flashcard
  deleteFlashcard: async (id) => {
    try {
      const response = await api.delete(`/flashcard/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting flashcard:", error);
      throw error;
    }
  },
};

export default flashcardService;
