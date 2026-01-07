import React, { useState, useEffect } from "react";
import flashcardService from "../services/flashcard";
import EditFlashcard from "./EditFlashcard";

const FlashcardList = () => {
  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingCard, setEditingCard] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    fetchFlashcards();
  }, [currentPage]);

  const fetchFlashcards = async () => {
    try {
      setLoading(true);
      const data = await flashcardService.getAllFlashcards(currentPage);
      setFlashcards(data.data || []);
      setTotalPages(Math.ceil(data.total / data.limit));
      setError(null);
    } catch (err) {
      setError("Failed to fetch flashcards");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchFlashcards();
      return;
    }

    try {
      setLoading(true);
      const data = await flashcardService.searchFlashcards(
        searchQuery,
        currentPage
      );
      setFlashcards(data.data || []);
      setTotalPages(Math.ceil(data.total / data.limit));
      setError(null);
    } catch (err) {
      setError("Failed to search flashcards");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this flashcard?")) {
      return;
    }

    try {
      await flashcardService.deleteFlashcard(id);
      setFlashcards(flashcards.filter((card) => card._id !== id));
      setMessage({
        type: "success",
        text: "Flashcard deleted successfully!",
      });

      // Clear message after 3 seconds
      setTimeout(() => {
        setMessage({ type: "", text: "" });
      }, 3000);
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to delete flashcard",
      });
      console.error(err);
    }
  };

  const handleUpdateSuccess = () => {
    setEditingCard(null);
    fetchFlashcards(); // Refresh list

    setMessage({
      type: "success",
      text: "Flashcard updated successfully!",
    });

    // Clear message after 3 seconds
    setTimeout(() => {
      setMessage({ type: "", text: "" });
    }, 3000);
  };

  const handleCancelEdit = () => {
    setEditingCard(null);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12 text-blue-500 text-xl">
        Loading flashcards...
      </div>
    );
  }

  // Nếu đang chỉnh sửa, hiển thị form edit
  if (editingCard) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-blue-600">Edit Flashcard</h2>
          <button
            onClick={handleCancelEdit}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
          >
            ← Back to List
          </button>
        </div>
        <EditFlashcard
          card={editingCard}
          onSuccess={handleUpdateSuccess}
          onCancel={handleCancelEdit}
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">Flashcard List</h2>

      {/* Success/Error message */}
      {message.text && (
        <div
          className={`mb-6 px-4 py-3 rounded-lg font-medium ${
            message.type === "success"
              ? "bg-green-100 text-green-700 border border-green-400"
              : "bg-red-100 text-red-700 border border-red-400"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Search bar */}
      <div className="flex flex-wrap gap-3 mb-8">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search flashcards..."
          onKeyPress={(e) => e.key === "Enter" && handleSearch()}
          className="flex-1 min-w-[200px] px-5 py-3 border-2 border-blue-500 rounded-full text-lg focus:border-purple-600 focus:outline-none"
        />
        <button
          onClick={handleSearch}
          className="bg-blue-500 text-white px-6 py-3 rounded-full text-lg hover:bg-purple-600 hover:transform hover:-translate-y-1 transition-all duration-300"
        >
          Search
        </button>
        <button
          onClick={() => {
            setSearchQuery("");
            fetchFlashcards();
          }}
          className="bg-gray-500 text-white px-6 py-3 rounded-full text-lg hover:bg-gray-600 hover:transform hover:-translate-y-1 transition-all duration-300"
        >
          Clear
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Flashcard list */}
      <div className="space-y-4">
        {flashcards.length === 0 ? (
          <div className="text-center py-12 text-gray-500 text-lg">
            No flashcards found
          </div>
        ) : (
          flashcards.map((card) => (
            <div
              key={card._id}
              className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-blue-500 hover:shadow-xl hover:transform hover:-translate-y-1 transition-all duration-300"
            >
              <div className="mb-3">
                <strong className="text-blue-600">Front:</strong>{" "}
                <span className="text-lg">{card.front}</span>
              </div>
              <div className="mb-3">
                <strong className="text-green-600">Back:</strong>{" "}
                <span className="text-lg">{card.back}</span>
              </div>
              {card.topic && (
                <div className="text-gray-600 mb-3">
                  <strong>Topic:</strong> {card.topic}
                </div>
              )}
              <div className="text-gray-500 text-sm mt-3 mb-4">
                <span className="ml-2">
                  Created: {new Date(card.createdAt).toLocaleDateString()}
                </span>
              </div>

              {/* Action buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  onClick={() => setEditingCard(card)}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-300 flex items-center"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(card._id)}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors duration-300 flex items-center"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {flashcards.length > 0 && (
        <div className="flex flex-wrap justify-center items-center gap-5 mt-8">
          <button
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            className="bg-blue-500 text-white px-6 py-2 rounded-full hover:bg-purple-600 hover:transform hover:-translate-y-1 transition-all duration-300 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="font-semibold text-gray-700">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className="bg-blue-500 text-white px-6 py-2 rounded-full hover:bg-purple-600 hover:transform hover:-translate-y-1 transition-all duration-300 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default FlashcardList;
