// src/components/Vocab/Filters.jsx
import React, { useState, useEffect } from 'react';
import { getTopics } from '../../services/vocabs';

const Filters = ({ filters, onFilterChange, topics: propTopics }) => {
  const [topics, setTopics] = useState(propTopics || []);
  const [loading, setLoading] = useState(!propTopics);
  
  const levelOptions = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'other'];

  useEffect(() => {
    if (!propTopics) {
      loadTopics();
    } else {
      setTopics(propTopics);
    }
  }, [propTopics]);

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

  const handleChange = (name, value) => {
    onFilterChange({
      ...filters,
      [name]: value
    });
  };

  return (
    <div className="flex flex-wrap gap-4 items-end">
      {/* Topic Filter */}
      <div className="flex-1 min-w-[200px]">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Lọc theo chủ đề
        </label>
        {loading ? (
          <div className="h-10 bg-gray-100 rounded-lg animate-pulse"></div>
        ) : (
          <select
            value={filters.topic}
            onChange={(e) => handleChange('topic', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="">Tất cả chủ đề</option>
            {topics.map(topic => (
              <option key={topic.value} value={topic.value}>
                {topic.emoji} {topic.label}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Level Filter */}
      <div className="flex-1 min-w-[150px]">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Lọc theo trình độ
        </label>
        <select
          value={filters.level}
          onChange={(e) => handleChange('level', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
        >
          <option value="">Tất cả trình độ</option>
          {levelOptions.map(level => (
            <option key={level} value={level}>{level}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default Filters;