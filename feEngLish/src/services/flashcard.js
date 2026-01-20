import axios from "axios";

// Tạo instance axios với baseURL
const api = axios.create({
  baseURL: "http://localhost:3000", // Đổi port nếu backend chạy port khác
  headers: {
    "Content-Type": "application/json",
  },
});

const flashcardService = {
  // Lấy tất cả flashcards (không giới hạn)
  getAllFlashcards: async (page = 1, limit = 0) => {
    try {
      const response = await api.get(`/flashcard?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching flashcards:", error);
      throw error;
    }
  },

  // Lấy tất cả flashcards không phân trang (alternative)
  getAllFlashcardsUnlimited: async () => {
    try {
      const response = await api.get(`/flashcard?limit=0`);
      return response.data;
    } catch (error) {
      console.error("Error fetching all flashcards:", error);
      throw error;
    }
  },

  // Tìm kiếm flashcards (không giới hạn)
  searchFlashcards: async (query, page = 1, limit = 0) => {
    try {
      const response = await api.get(
        `/flashcard/search?q=${query}&page=${page}&limit=${limit}`,
      );
      return response.data;
    } catch (error) {
      console.error("Error searching flashcards:", error);
      throw error;
    }
  },

  // Lấy flashcards theo topic (không giới hạn)
  getFlashcardsByTopic: async (topic, page = 1, limit = 0) => {
    try {
      const response = await api.get(
        `/flashcard/topic/${topic}?page=${page}&limit=${limit}`,
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching flashcards by topic:", error);
      throw error;
    }
  },

  // Lấy tất cả flashcards theo topic không phân trang
  getAllFlashcardsByTopic: async (topic) => {
    try {
      const response = await api.get(`/flashcard/topic/${topic}?limit=0`);
      return response.data;
    } catch (error) {
      console.error("Error fetching all flashcards by topic:", error);
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
