import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTopics } from '../../services/vocabs';

const TopicGrid = () => {
  const navigate = useNavigate();
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTopics();
  }, []);

  const loadTopics = async () => {
    try {
      setLoading(true);
      const data = await getTopics();
      setTopics(data);
    } catch (error) {
      console.error('Error loading topics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTopicClick = (topic) => {
    navigate(`/vocab/topic/${topic.value}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {topics.map((topic) => (
        <div 
          key={topic.value} 
          className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer transform hover:-translate-y-1"
          onClick={() => handleTopicClick(topic)}
        >
          <div 
            className="h-32 bg-cover bg-center relative"
            style={{ backgroundImage: `url(${topic.imageUrl})` }}
          >
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
              <span className="text-4xl">{topic.emoji}</span>
            </div>
          </div>
          <div className="p-4">
            <h3 className="font-semibold text-gray-800 text-center">{topic.label}</h3>
            <button className="mt-2 w-full bg-blue-500 hover:bg-blue-600 text-white py-1.5 rounded-lg text-sm font-medium transition-colors">
              Xem từ vựng →
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TopicGrid;