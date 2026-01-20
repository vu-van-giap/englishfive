import React, { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import flashcardService from "../services/flashcard";

const FlashcardViewer = () => {
  const { topic } = useParams(); // Lấy topic từ URL params
  const location = useLocation(); // Lấy topic từ navigation state
  const [flashcards, setFlashcards] = useState([]);
  const [filteredFlashcards, setFilteredFlashcards] = useState([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState("all");
  const [showTopicFilter, setShowTopicFilter] = useState(false);

  useEffect(() => {
    fetchFlashcards();
  }, []);

  useEffect(() => {
    // Xác định topic từ URL params hoặc navigation state
    if (topic) {
      // Nếu có topic từ URL params (vd: /flashcards/topic/biển)
      setSelectedTopic(topic);
    } else if (location.state?.topic) {
      // Nếu có topic từ navigation state
      setSelectedTopic(location.state.topic);
    } else {
      // Mặc định là "all"
      setSelectedTopic("all");
    }
  }, [topic, location.state]);

  useEffect(() => {
    // Cập nhật flashcards đã lọc khi selectedTopic thay đổi
    if (selectedTopic === "all") {
      setFilteredFlashcards(flashcards);
    } else {
      // Lọc theo topic được chọn
      const topicCards = flashcards.filter(
        (card) => card.topic === selectedTopic,
      );
      setFilteredFlashcards(topicCards);
    }
    // Reset về card đầu tiên khi filter thay đổi
    setCurrentCardIndex(0);
    setIsFlipped(false);
  }, [selectedTopic, flashcards]);

  const fetchFlashcards = async () => {
    try {
      setLoading(true);
      const data = await flashcardService.getAllFlashcards();
      const fetchedFlashcards = data.data || [];
      setFlashcards(fetchedFlashcards);
      setFilteredFlashcards(fetchedFlashcards);

      // Extract unique topics từ flashcards
      const uniqueTopics = [
        ...new Set(
          fetchedFlashcards
            .map((card) => card.topic)
            .filter((topic) => topic && topic.trim() !== ""),
        ),
      ].sort();

      setTopics(uniqueTopics);
    } catch (error) {
      console.error("Error fetching flashcards:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNextCard = () => {
    setCurrentCardIndex((prevIndex) =>
      prevIndex === filteredFlashcards.length - 1 ? 0 : prevIndex + 1,
    );
    setIsFlipped(false);
  };

  const handlePreviousCard = () => {
    setCurrentCardIndex((prevIndex) =>
      prevIndex === 0 ? filteredFlashcards.length - 1 : prevIndex - 1,
    );
    setIsFlipped(false);
  };

  const handleCardClick = () => {
    setIsFlipped(!isFlipped);
  };

  const handleTopicChange = (topic) => {
    setSelectedTopic(topic);
  };

  const handleRefresh = () => {
    fetchFlashcards();
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

  const currentCard = filteredFlashcards[currentCardIndex];

  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold mb-6">Flashcard Viewer</h2>

      {/* Control Panel */}
      <div className="mb-8 p-4 bg-white rounded-xl shadow-md max-w-4xl mx-auto">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div className="flex flex-wrap gap-3 items-center">
            <button
              onClick={handleRefresh}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              ↻ Refresh
            </button>

            <button
              onClick={() => setShowTopicFilter(!showTopicFilter)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              {selectedTopic === "all" ? (
                <>🌐 All Topics ({flashcards.length})</>
              ) : (
                <>
                  🏷️ {selectedTopic} ({filteredFlashcards.length})
                </>
              )}
              <span className="text-xs">▼</span>
            </button>
          </div>
        </div>

        {/* Topic Filter Dropdown */}
        {showTopicFilter && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="text-left mb-3 text-sm font-medium text-gray-700">
              Filter by Topic:
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  handleTopicChange("all");
                  setShowTopicFilter(false);
                }}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedTopic === "all"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                }`}
              >
                🌐 All ({flashcards.length})
              </button>

              {topics.map((topic) => {
                const topicCount = flashcards.filter(
                  (card) => card.topic === topic,
                ).length;
                return (
                  <button
                    key={topic}
                    onClick={() => {
                      handleTopicChange(topic);
                      setShowTopicFilter(false);
                    }}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      selectedTopic === topic
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                    }`}
                  >
                    🏷️ {topic} ({topicCount})
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* No cards message for filtered view */}
      {filteredFlashcards.length === 0 ? (
        <div className="py-12 text-gray-500 text-lg">
          No flashcards found for the selected filter.
          <div className="mt-4">
            <button
              onClick={() => handleTopicChange("all")}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg"
            >
              Show All Cards
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Flashcard */}
          <div className="w-full max-w-lg h-72 mx-auto mb-8 relative">
            {/* Card Counter trên thẻ flashcard */}
            <div className="absolute top-4 left-4 bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium z-10">
              📄 {currentCardIndex + 1}/{filteredFlashcards.length}
            </div>

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
                <div className="text-sm opacity-80 mt-auto">
                  Click to see question
                </div>
              </div>
            )}
          </div>

          {/* Navigation controls - ĐÃ BỎ HIỂN THỊ CARD COUNTER Ở ĐÂY */}
          <div className="flex flex-wrap justify-center gap-5 my-8">
            <button
              onClick={handlePreviousCard}
              disabled={filteredFlashcards.length <= 1}
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
              disabled={filteredFlashcards.length <= 1}
              className="bg-blue-500 text-white px-8 py-3 rounded-full text-lg font-medium hover:bg-purple-600 hover:transform hover:-translate-y-1 transition-all duration-300 disabled:bg-gray-300 disabled:cursor-not-allowed min-w-40"
            >
              Next →
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default FlashcardViewer;
