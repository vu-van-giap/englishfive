
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import ExerciseList from './ExerciseList';
import { getHistory, getStats } from '../../services/listening';

const ListeningPage = () => {
    const location = useLocation();
    const [activeTab, setActiveTab] = useState('exercises');
    const [user, setUser] = useState({
        username: '',
        role: 'user'
    });
    const [stats, setStats] = useState(null);
    const [history, setHistory] = useState([]);

    useEffect(() => {
        // Get user info from localStorage
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        setUser({
            username: userData.username || 'guest',
            role: userData.role || 'user'
        });

        const path = location.pathname;
        if (path.includes('/listening/history')) {
            setActiveTab('history');
            fetchHistory();
        } else if (path.includes('/listening/stats')) {
            setActiveTab('stats');
            fetchStats();
        } else {
            setActiveTab('exercises');
        }
    }, [location]);

    const fetchStats = async () => {
        try {
            const response = await getStats();
            if (response.success) {
                setStats(response.data);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const fetchHistory = async () => {
        try {
            const response = await getHistory({ page: 1, limit: 10 });
            if (response.success) {
                setHistory(response.items);
            }
        } catch (error) {
            console.error('Error fetching history:', error);
        }
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'history':
                return (
                    <div className="bg-white rounded-lg shadow-sm border">
                        <div className="p-4 border-b">
                            <h3 className="font-medium text-gray-900">Lịch sử làm bài</h3>
                        </div>
                        <div className="p-4">
                            {history.length > 0 ? (
                                <div className="space-y-3">
                                    {history.map((item, index) => (
                                        <div key={index} className="flex items-center p-3 hover:bg-gray-50 rounded-lg transition">
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-900">{item.exercise?.title || 'Bài tập không xác định'}</p>
                                                <p className="text-sm text-gray-600">
                                                    Điểm: <span className="font-medium">{item.score}/100</span>
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm text-gray-500">
                                                    {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                                                </div>
                                                <div className="text-xs text-gray-400">
                                                    Thời gian: {item.timeSpent}s
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <div className="w-20 h-20 mx-auto text-gray-300 mb-4">
                                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có lịch sử</h3>
                                    <p className="text-gray-600 mb-4">Hãy làm bài tập để xem lịch sử ở đây</p>
                                    <button
                                        onClick={() => setActiveTab('exercises')}
                                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                                    >
                                        Làm Bài Tập Ngay
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                );

            case 'stats':
                return (
                    <div className="bg-white rounded-lg shadow-sm border p-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div className="bg-linear-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-6">
                                <div className="flex items-center">
                                    <div>
                                        <p className="text-sm text-gray-600">Tổng số bài làm</p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {stats?.totalAttempts || 0}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-linear-to-r from-green-50 to-green-100 border border-green-200 rounded-lg p-6">
                                <div className="flex items-center">
                                    <div>
                                        <p className="text-sm text-gray-600">Điểm trung bình</p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {stats?.averageScore || 0}/100
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-linear-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-6">
                                <div className="flex items-center">
                                    <div>
                                        <p className="text-sm text-gray-600">Tổng điểm</p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {stats?.totalScore || 0}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="text-center py-8">
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                {stats ? 'Thống kê học tập' : 'Chưa có thống kê'}
                            </h3>
                            <p className="text-gray-600 mb-4">
                                {stats ? 'Tiếp tục luyện tập để cải thiện kỹ năng!' : 'Hãy làm bài tập để xem thống kê của bạn'}
                            </p>
                            <button
                                onClick={() => setActiveTab('exercises')}
                                className="inline-flex items-center px-4 py-2 bg-linear-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition"
                            >
                                Bắt đầu luyện tập
                            </button>
                        </div>
                    </div>
                );

            default:
                return <ExerciseList user={user} />;
        }
    };

    return (
        <div>
            <div className="h-[170px] bg-[#f0f9ff] flex justify-center items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 text-center">Listening Exercises</h1>
                    <p className="block text-gray-600 mt-2 text-center">Luyện nghe và điền từ vào chỗ trống</p>

                </div>
            </div>

            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex space-x-8">
                            <button
                                onClick={() => setActiveTab('exercises')}
                                className={`py-3 px-1 font-medium text-sm border-b-2 transition-colors ${activeTab === 'exercises'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                Bài Tập
                            </button>

                            <button
                                onClick={() => setActiveTab('history')}
                                className={`py-3 px-1 font-medium text-sm border-b-2 transition-colors ${activeTab === 'history'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                Lịch Sử
                            </button>

                            <button
                                onClick={() => setActiveTab('stats')}
                                className={`py-3 px-1 font-medium text-sm border-b-2 transition-colors ${activeTab === 'stats'
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
        </div>
    );
};

export default ListeningPage;