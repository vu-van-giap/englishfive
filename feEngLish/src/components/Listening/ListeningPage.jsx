// src/pages/ListeningPage.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import ExerciseList from '../components/Listening/ExerciseList';
import ListeningHistoryPage from './ListeningHistoryPage';
import ListeningStatsPage from './ListeningStatsPage';
import ExerciseFormModal from '../components/Listening/ExerciseFormModal';
import ExerciseDetailModal from '../components/Listening/ExerciseDetailModal';

const ListeningPage = () => {
  const location = useLocation();
  const [user] = useState({
    username: 'admin',
    role: 'admin'
  });

  const [activeTab, setActiveTab] = useState('exercises');

  useEffect(() => {
    if (location.pathname.includes('/listening/history')) {
      setActiveTab('history');
    } else if (location.pathname.includes('/listening/stats')) {
      setActiveTab('stats');
    } else {
      setActiveTab('exercises');
    }
  }, [location]);

  const renderContent = () => {
    switch (activeTab) {
      case 'history':
        return <ListeningHistoryPage />;
      case 'stats':
        return <ListeningStatsPage />;
      default:
        return <ExerciseList user={user} />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Listening Exercises</h1>
        <p className="text-gray-600 mt-2">Luyện nghe và điền từ vào chỗ trống</p>
      </div>

      {/* Tabs Navigation */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('exercises')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'exercises'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Bài Tập
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'history'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Lịch Sử
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'stats'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Thống Kê
            </button>
          </nav>
        </div>
      </div>

      {renderContent()}
    </div>
  );
};

export default ListeningPage;