import React, { useState, useEffect } from 'react';
import { getExerciseById } from '../../services/listening';

// 👉 THÊM BASE URL CỦA BACKEND Ở ĐÂY
const BASE_URL = 'http://localhost:3000';

const ExerciseDetailModal = ({ isOpen, onClose, exercise, onSubmit }) => {
    const [detailExercise, setDetailExercise] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userAnswers, setUserAnswers] = useState({});
    const [timeSpent, setTimeSpent] = useState(0);

    useEffect(() => {
        if (isOpen && exercise) {
            fetchExerciseDetail();

            const timer = setInterval(() => {
                setTimeSpent(prev => prev + 1);
            }, 1000);

            return () => clearInterval(timer);
        }
    }, [isOpen, exercise]);

    const fetchExerciseDetail = async () => {
        try {
            setLoading(true);
            const response = await getExerciseById(exercise._id);
            if (response.success) {
                setDetailExercise(response.data);

                const initialAnswers = {};
                response.data.blanks?.forEach(blank => {
                    initialAnswers[blank.position] = '';
                });
                setUserAnswers(initialAnswers);
            }
        } catch (error) {
            console.error('Error fetching exercise detail:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const handleAnswerChange = (position, value) => {
        setUserAnswers(prev => ({
            ...prev,
            [position]: value
        }));
    };

    const handleSubmit = () => {
        if (onSubmit) {
            onSubmit(userAnswers, timeSpent);
        }
    };

    const getAnsweredCount = () => {
        return Object.values(userAnswers).filter(answer => answer.trim() !== '').length;
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const renderTranscriptWithBlanks = () => {
        if (!detailExercise?.transcript) return null;

        const words = detailExercise.transcript.split(' ');
        return words.map((word, index) => {
            const blank = detailExercise.blanks?.find(b => b.position === index);

            if (blank) {
                return (
                    <span key={index} className="inline-block mx-1">
                        <input
                            type="text"
                            value={userAnswers[blank.position] || ''}
                            onChange={(e) => handleAnswerChange(blank.position, e.target.value)}
                            className="w-32 px-3 py-2 border-2 border-blue-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                            placeholder={blank.hint || `Chỗ trống`}
                        />
                        <span className="block text-xs text-gray-500 mt-1">
                            {blank.hint ? `Gợi ý: ${blank.hint}` : ''}
                        </span>
                    </span>
                );
            }
            return word + ' ';
        });
    };

    if (loading) {
        return (
            <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
                <div className="bg-white rounded-lg p-6">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-2">Đang tải bài tập...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center overflow-y-auto">
            <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto m-4">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b px-6 py-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">{detailExercise?.title}</h2>
                            <div className="flex items-center mt-1 space-x-2">
                                <span className="text-sm text-gray-600">
                                    {detailExercise?.blanks?.length || 0} chỗ trống
                                </span>
                                <span className="text-sm text-gray-600">•</span>
                                <span className="text-sm text-gray-600">⏱️ {formatTime(timeSpent)}</span>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    {/* Audio Player */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="font-medium text-gray-900 mb-1">Nghe Audio</h3>
                                <p className="text-sm text-gray-600">Nhấn play để nghe và điền từ</p>
                            </div>
                        </div>
                        <audio
                            controls
                            className="w-full"
                            // 👉 GHÉP BASE_URL + audioUrl
                            src={
                                detailExercise?.audioUrl
                                    ? `${BASE_URL}${detailExercise.audioUrl}`
                                    : ''
                            }
                        >
                            Trình duyệt của bạn không hỗ trợ audio.
                        </audio>
                    </div>

                    {/* Transcript with Blanks */}
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Transcript với chỗ trống</h3>
                            <div className="text-sm text-gray-600">
                                <span className="font-medium">{getAnsweredCount()}</span> / {detailExercise?.blanks?.length || 0} đã điền
                            </div>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 min-h-[200px]">
                            <div className="text-gray-700 leading-relaxed text-lg">
                                {renderTranscriptWithBlanks()}
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-between items-center pt-6 border-t">
                        <button
                            onClick={() => {
                                const clearedAnswers = {};
                                detailExercise?.blanks?.forEach(blank => {
                                    clearedAnswers[blank.position] = '';
                                });
                                setUserAnswers(clearedAnswers);
                                setTimeSpent(0);
                            }}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                        >
                            Làm lại
                        </button>

                        <div className="flex space-x-3">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={getAnsweredCount() !== detailExercise?.blanks?.length}
                                className={`px-6 py-2 rounded-lg ${
                                    getAnsweredCount() !== detailExercise?.blanks?.length
                                        ? 'bg-gray-300 cursor-not-allowed'
                                        : 'bg-green-500 hover:bg-green-600'
                                } text-white`}
                            >
                                Nộp bài
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExerciseDetailModal;
