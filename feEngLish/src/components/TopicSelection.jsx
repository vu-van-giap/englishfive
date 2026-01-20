import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import flashcardService from "../services/flashcard";

const TopicSelection = () => {
  const [flashcards, setFlashcards] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAllTopics, setShowAllTopics] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchFlashcards();
  }, []);

  const fetchFlashcards = async () => {
    try {
      setLoading(true);
      const data = await flashcardService.getAllFlashcards(1, 0);
      const fetchedFlashcards = data.data || [];
      setFlashcards(fetchedFlashcards);

      // Lấy danh sách topic không trùng
      const uniqueTopics = [
        ...new Set(
          fetchedFlashcards
            .map((card) => card.topic)
            .filter((topic) => topic && topic.trim() !== ""),
        ),
      ].sort();

      // Đếm số flashcard theo topic
      const topicsWithCount = uniqueTopics.map((topic) => ({
        name: topic,
        count: fetchedFlashcards.filter((card) => card.topic === topic).length,
      }));

      setTopics(topicsWithCount);
    } catch (error) {
      console.error("Error fetching flashcards:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTopicClick = (topicName) => {
    navigate(`/flashcards/topic/${encodeURIComponent(topicName)}`);
  };

  const handleShowAllTopics = () => {
    setShowAllTopics(!showAllTopics);
  };

  // Chỉ hiển thị 4 topic đầu khi chưa xem tất cả
  const displayedTopics = showAllTopics ? topics : topics.slice(0, 4);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-blue-600 text-lg">Đang tải chủ đề...</div>
      </div>
    );
  }

  return (
    <div className=" bg-red-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* CHỦ ĐỀ TỪ VỰNG */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Chủ đề flashcard
            </h2>

            {topics.length > 4 && (
              <button
                onClick={handleShowAllTopics}
                className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-2"
              >
                {showAllTopics ? (
                  <>
                    Thu gọn <span className="text-lg">↑</span>
                  </>
                ) : (
                  <>
                    Xem tất cả ({topics.length})
                    <span className="text-lg">↓</span>
                  </>
                )}
              </button>
            )}
          </div>

          {topics.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              Chưa có chủ đề nào.
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {displayedTopics.map((topic) => (
                  <div
                    key={topic.name}
                    onClick={() => handleTopicClick(topic.name)}
                    className="bg-white rounded-xl shadow border border-gray-200 p-6 cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-bold text-gray-900">
                        {topic.name}
                      </h3>
                      <div className="text-2xl">
                        {getTopicEmoji(topic.name)}
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="text-3xl font-bold text-blue-600">
                        {topic.count}
                      </div>
                      <div className="text-sm text-gray-600">thẻ từ vựng</div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Bắt đầu học</span>
                      <span className="text-blue-600 font-medium">→</span>
                    </div>
                  </div>
                ))}
              </div>

              {showAllTopics && (
                <div className="mt-6 text-center text-gray-600">
                  Đang hiển thị {displayedTopics.length}/{topics.length} chủ đề
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Emoji theo chủ đề
const getTopicEmoji = (topic) => {
  const t = topic.toLowerCase();

  if (t.includes("food") || t.includes("đồ ăn")) return "🍕";
  if (t.includes("animal") || t.includes("động vật")) return "🐶";
  if (t.includes("color") || t.includes("màu")) return "🎨";
  if (t.includes("travel") || t.includes("du lịch")) return "✈️";
  if (t.includes("family") || t.includes("gia đình")) return "👨‍👩‍👧‍👦";
  if (t.includes("work") || t.includes("công việc")) return "💼";
  if (t.includes("health") || t.includes("sức khỏe")) return "🏥";
  if (t.includes("sport") || t.includes("thể thao")) return "⚽";
  if (t.includes("music") || t.includes("âm nhạc")) return "🎵";
  if (t.includes("tech") || t.includes("công nghệ")) return "💻";
  if (t.includes("nature") || t.includes("thiên nhiên")) return "🌳";
  if (t.includes("shopping") || t.includes("mua sắm")) return "🛒";
  if (t.includes("biển")) return "🌊";
  if (t.includes("hành động")) return "🎬";
  if (t.includes("số")) return "🔢";

  return "📝";
};

export default TopicSelection;
