import React, { useState } from "react";
import flashcardService from "../services/flashcard";

const CreateFlashcard = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    front: "",
    back: "",
    topic: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.front.trim() || !formData.back.trim()) {
      setMessage({
        type: "error",
        text: "Front and Back are required",
      });
      return;
    }

    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      await flashcardService.createFlashcard(formData);

      setMessage({
        type: "success",
        text: "Flashcard created successfully!",
      });

      // Reset form
      setFormData({
        front: "",
        back: "",
        topic: "",
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to create flashcard",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-8 text-center">
        Create New Flashcard
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Front input */}
        <div>
          <label
            htmlFor="front"
            className="block text-gray-700 font-semibold mb-2"
          >
            Front (Question):
          </label>
          <textarea
            id="front"
            name="front"
            value={formData.front}
            onChange={handleChange}
            placeholder="Enter question or word..."
            rows="3"
            required
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all duration-300"
          />
        </div>

        {/* Back input */}
        <div>
          <label
            htmlFor="back"
            className="block text-gray-700 font-semibold mb-2"
          >
            Back (Answer):
          </label>
          <textarea
            id="back"
            name="back"
            value={formData.back}
            onChange={handleChange}
            placeholder="Enter answer or definition..."
            rows="3"
            required
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all duration-300"
          />
        </div>

        {/* Topic input */}
        <div>
          <label
            htmlFor="topic"
            className="block text-gray-700 font-semibold mb-2"
          >
            Topic (Optional):
          </label>
          <input
            type="text"
            id="topic"
            name="topic"
            value={formData.topic}
            onChange={handleChange}
            placeholder="e.g., Vocabulary, Grammar..."
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all duration-300"
          />
        </div>

        {/* Message display */}
        {message.text && (
          <div
            className={`px-4 py-3 rounded-lg font-medium ${
              message.type === "success"
                ? "bg-green-100 text-green-700 border border-green-400"
                : "bg-red-100 text-red-700 border border-red-400"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Submit button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 rounded-xl text-lg font-semibold hover:from-blue-600 hover:to-purple-700 hover:transform hover:-translate-y-1 hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Creating..." : "Create Flashcard"}
        </button>
      </form>
    </div>
  );
};

export default CreateFlashcard;
