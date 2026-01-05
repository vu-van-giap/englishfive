import React, { useState, useEffect } from "react";
import flashcardService from "../services/flashcard";

const FlashcardViewer = () => {
  const [flashcards, setFlashcards] = useState([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFlashcards();
  }, []);

  const fetchFlashcards = async () => {
    try {
      setLoading(true);
      const data = await flashcardService.getAllFlashcards();
      setFlashcards(data.data || []);
    } catch (error) {
      console.error("Error fetching flashcards:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNextCard = () => {
    setCurrentCardIndex((prevIndex) =>
      prevIndex === flashcards.length - 1 ? 0 : prevIndex + 1
    );
    setIsFlipped(false);
  };

  const handlePreviousCard = () => {
    setCurrentCardIndex((prevIndex) =>
      prevIndex === 0 ? flashcards.length - 1 : prevIndex - 1
    );
    setIsFlipped(false);
  };

  const handleCardClick = () => {
    setIsFlipped(!isFlipped);
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="text-blue-500 text-xl">Loading flashcards...</div>
      </div>
    );
  }

  if (flashcards.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 text-lg">
        No flashcards available
      </div>
    );
  }

  const currentCard = flashcards[currentCardIndex];

  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold mb-6">Flashcard Viewer</h2>

      <div className="text-gray-600 text-sm mb-6">
        Card {currentCardIndex + 1} of {flashcards.length}
      </div>

      {/* Flashcard đơn giản - chỉ hiện 1 mặt */}
      <div className="w-full max-w-lg h-72 mx-auto mb-8">
        {!isFlipped ? (
          // Mặt trước
          <div
            onClick={handleCardClick}
            className="w-full h-full flex flex-col justify-center items-center p-8 rounded-2xl shadow-xl cursor-pointer bg-gradient-to-br from-blue-500 to-purple-600 text-white hover:shadow-2xl transition-shadow duration-300"
          >
            <h3 className="text-2xl font-bold mb-6">Question</h3>
            <p className="text-3xl mb-6">{currentCard.front}</p>
            <div className="text-sm opacity-80 mt-auto">
              Click to see answer
            </div>
          </div>
        ) : (
          // Mặt sau
          <div
            onClick={handleCardClick}
            className="w-full h-full flex flex-col justify-center items-center p-8 rounded-2xl shadow-xl cursor-pointer bg-gradient-to-br from-green-500 to-green-600 text-white hover:shadow-2xl transition-shadow duration-300"
          >
            <h3 className="text-2xl font-bold mb-6">Answer</h3>
            <p className="text-3xl mb-6">{currentCard.back}</p>
            {currentCard.topic && (
              <div className="bg-white/20 px-4 py-2 rounded-full text-sm mt-4">
                Topic: {currentCard.topic}
              </div>
            )}
            <div className="text-sm opacity-80 mt-auto">
              Click to see question
            </div>
          </div>
        )}
      </div>

      {/* Navigation controls */}
      <div className="flex flex-wrap justify-center gap-5 my-8">
        <button
          onClick={handlePreviousCard}
          disabled={flashcards.length <= 1}
          className="bg-blue-500 text-white px-8 py-3 rounded-full text-lg font-medium hover:bg-purple-600 hover:transform hover:-translate-y-1 transition-all duration-300 disabled:bg-gray-300 disabled:cursor-not-allowed min-w-40"
        >
          ← Previous
        </button>

        <button
          onClick={handleCardClick}
          className="bg-blue-500 text-white px-8 py-3 rounded-full text-lg font-medium hover:bg-purple-600 hover:transform hover:-translate-y-1 transition-all duration-300 min-w-40"
        >
          {isFlipped ? "Show Question" : "Show Answer"}
        </button>

        <button
          onClick={handleNextCard}
          disabled={flashcards.length <= 1}
          className="bg-blue-500 text-white px-8 py-3 rounded-full text-lg font-medium hover:bg-purple-600 hover:transform hover:-translate-y-1 transition-all duration-300 disabled:bg-gray-300 disabled:cursor-not-allowed min-w-40"
        >
          Next →
        </button>
      </div>

      {/* Card info */}
      <div className="bg-gray-50 p-5 rounded-xl max-w-lg mx-auto">
        <p className="mb-2">
          <strong className="text-gray-700">Current Card:</strong>{" "}
          {currentCard.front}
        </p>
        <p>
          <strong className="text-gray-700">Created:</strong>{" "}
          {new Date(currentCard.createdAt).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
};

export default FlashcardViewer;
