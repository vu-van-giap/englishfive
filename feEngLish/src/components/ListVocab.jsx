import { useEffect, useState } from "react";
import { getTopics } from "../services/vocabs";
import { useNavigate } from "react-router-dom";

const ListVoCab = () => {
  const [topics, setTopic] = useState([]);
  const navigate = useNavigate();
  useEffect(() => {
    const fetchTopic = async () => {
      try {
        const getTopicVocab = await getTopics();
        setTopic(getTopicVocab);
        console.log(getTopicVocab);
      } catch (error) {
        console.log("Lỗi lấy topic");
      }
    };
    fetchTopic();
  }, []);

  const handleTopicClick = (topic) => {
    navigate(`/vocab/topic/${topic.value}`);
  };

  return (
    <>
      <div className="max-w-7xl mx-auto mb-[25px]">
        <h2 className="text-2xl font-bold text-gray-900 mb-[24px]">
          Chủ đề Vocab
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6">
          {topics.slice(0, 5).map((topic) => (
            <div
              key={topic.value}
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer transform hover:-translate-y-1"
              onClick={() => handleTopicClick(topic)}
            >
              <div
                className="h-32 w-full bg-cover bg-center"
                style={{ backgroundImage: `url("${topic.imageUrl}")` }}
              />

              <div className="p-4 flex flex-col items-center">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-3xl">{topic.emoji}</span>
                  <h3 className="font-semibold text-gray-800">{topic.label}</h3>
                </div>
                <button className="mt-2 w-full bg-blue-500 hover:bg-blue-600 text-white py-1.5 rounded-lg text-sm font-medium transition-colors">
                  Xem từ vựng →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};
export default ListVoCab;
