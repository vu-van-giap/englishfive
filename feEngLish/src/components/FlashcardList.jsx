import React, { useState, useEffect } from "react";
import flashcardService from "../services/flashcard";

const FlashcardList = () => {
  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

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

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">Flashcard List</h2>

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
                <div className="text-gray-600">
                  <strong>Topic:</strong> {card.topic}
                </div>
              )}
              <div className="text-gray-500 text-sm mt-3">
                <span>User ID: {card.userId}</span> •
                <span className="ml-2">
                  Created: {new Date(card.createdAt).toLocaleDateString()}
                </span>
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
