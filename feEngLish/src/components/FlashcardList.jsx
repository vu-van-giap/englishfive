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
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      setCurrentPage(1);

      if (!searchQuery.trim()) {
        await fetchFlashcards();
        return;
      }

      const data = await flashcardService.searchFlashcards(searchQuery, 1);
      setFlashcards(data.data || []);
      setTotalPages(Math.ceil(data.total / data.limit));
      setError(null);
    } catch (err) {
      setError("Failed to search flashcards");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this flashcard?")) return;

    try {
      await flashcardService.deleteFlashcard(id);
      setFlashcards((prev) => prev.filter((c) => c._id !== id));

      setMessage({ type: "success", text: "Flashcard deleted successfully!" });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to delete flashcard",
      });
    }
  };

  const handleUpdateSuccess = () => {
    setEditingCard(null);
    fetchFlashcards();

    setMessage({ type: "success", text: "Flashcard updated successfully!" });
    setTimeout(() => setMessage({ type: "", text: "" }), 3000);
  };

  if (loading) {
    return (
      <div className="text-center py-12 text-blue-500 text-xl">
        Loading flashcards...
      </div>
    );
  }

  if (editingCard) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-blue-600">Edit Flashcard</h2>
          <button
            onClick={() => setEditingCard(null)}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg"
          >
            ← Back
          </button>
        </div>

        <EditFlashcard
          card={editingCard}
          onSuccess={handleUpdateSuccess}
          onCancel={() => setEditingCard(null)}
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">Flashcard List</h2>

      {message.text && (
        <div
          className={`mb-6 px-4 py-3 rounded-lg ${
            message.type === "success"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Search */}
      <div className="flex gap-3 mb-8">
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder="Search flashcards..."
          className="flex-1 px-5 py-3 border-2 rounded-full"
        />
        <button
          onClick={handleSearch}
          className="bg-blue-500 text-white px-6 py-3 rounded-full"
        >
          Search
        </button>
        <button
          onClick={() => {
            setSearchQuery("");
            setCurrentPage(1);
            fetchFlashcards();
          }}
          className="bg-gray-500 text-white px-6 py-3 rounded-full"
        >
          Clear
        </button>
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-6">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {flashcards.length === 0 ? (
          <div className="text-center text-gray-500">No flashcards found</div>
        ) : (
          flashcards.map((card) => (
            <div
              key={card._id}
              className="border rounded-xl p-6 hover:shadow-lg"
            >
              <p>
                <strong>Front:</strong> {card.front}
              </p>
              <p>
                <strong>Back:</strong> {card.back}
              </p>

              {card.topic && (
                <p className="text-gray-600">
                  <strong>Topic:</strong> {card.topic}
                </p>
              )}

              <p className="text-sm text-gray-500 mt-2">
                Created:{" "}
                {new Date(card.createdAt).toLocaleDateString()}
              </p>

              <div className="flex justify-end gap-3 mt-4">
                <button
                  onClick={() => setEditingCard(card)}
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(card._id)}
                  className="bg-red-500 text-white px-4 py-2 rounded"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {flashcards.length > 0 && (
        <div className="flex justify-center gap-4 mt-8">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
          >
            Previous
          </button>
          <span>
            Page {currentPage} / {totalPages}
          </span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default FlashcardList;
