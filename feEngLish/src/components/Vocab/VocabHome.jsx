import React from 'react';
import { useNavigate } from 'react-router-dom';
import TopicGrid from '../../components/Vocab/TopicGrid';

const VocabHome = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="text-center mb-12 ">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Học từ vựng tiếng Anh
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Khám phá và học từ vựng theo chủ đề. Chọn chủ đề bạn quan tâm để bắt đầu học ngay!
          </p>
      </div>
      <div className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Chủ đề từ vựng</h2>
          <button
            onClick={() => navigate('/vocab/search')}
            className="text-blue-500 hover:text-blue-600 font-medium"
          >
            Xem tất cả →
          </button>
        </div>
        <TopicGrid />
      </div>
    </div>
  );
};

export default VocabHome;