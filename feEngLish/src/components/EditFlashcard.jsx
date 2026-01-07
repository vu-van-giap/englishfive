import React, { useState } from "react";
import flashcardService from "../services/flashcard";

const EditFlashcard = ({ card, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    front: card.front || "",
    back: card.back || "",
    topic: card.topic || "",
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

    // Validation
    if (!formData.front.trim()) {
      setMessage({ type: "error", text: "Front is required" });
      return;
    }

    if (!formData.back.trim()) {
      setMessage({ type: "error", text: "Back is required" });
      return;
    }

    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      await flashcardService.updateFlashcard(card._id, formData);

      setMessage({
        type: "success",
        text: "Flashcard updated successfully!",
      });

      // Auto-close after 1.5 seconds
      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        }
      }, 1500);
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to update flashcard",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-t-2xl">
        <h2 className="text-2xl font-bold">Edit Flashcard</h2>
        <p className="opacity-90 text-sm mt-1">Card ID: {card._id}</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-white p-6 rounded-b-2xl shadow-lg"
      >
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

        {/* Action buttons */}
        <div className="flex flex-wrap gap-4 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 min-w-[200px] bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 rounded-xl text-lg font-semibold hover:from-blue-600 hover:to-purple-700 hover:transform hover:-translate-y-1 hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin h-5 w-5 mr-3 text-white"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Updating...
              </span>
            ) : (
              "Update Flashcard"
            )}
          </button>

          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 min-w-[200px] bg-gray-500 text-white py-4 rounded-xl text-lg font-semibold hover:bg-gray-600 hover:transform hover:-translate-y-1 hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditFlashcard;
