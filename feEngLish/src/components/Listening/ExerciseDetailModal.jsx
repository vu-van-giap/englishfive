import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getExerciseById, submitAnswers } from '../../services/listening';
import SubmitAnswerModal from './SubmitAnswerModal';

const ExerciseDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [exercise, setExercise] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userAnswers, setUserAnswers] = useState({});
    const [timeSpent, setTimeSpent] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showResultModal, setShowResultModal] = useState(false);
    const [result, setResult] = useState(null);

    useEffect(() => {
        fetchExercise();

        // Start timer
        const timer = setInterval(() => {
            setTimeSpent(prev => prev + 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [id]);

    const fetchExercise = async () => {
        try {
            setLoading(true);
            const response = await getExerciseById(id);
            if (response.success) {
                setExercise(response.data);

                // Initialize answers object
                const initialAnswers = {};
                response.data.blanks?.forEach(blank => {
                    initialAnswers[blank.position] = '';
                });
                setUserAnswers(initialAnswers);
            }
        } catch (err) {
            setError('Không thể tải bài tập. Vui lòng thử lại.');
            console.error('Error fetching exercise:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAnswerChange = (position, value) => {
        setUserAnswers(prev => ({
            ...prev,
            [position]: value
        }));
    };

    const handleSubmit = async () => {
        try {
            setIsSubmitting(true);

            const formattedAnswers = Object.entries(userAnswers).map(([position, userAnswer]) => ({
                position: parseInt(position),
                userAnswer: userAnswer.trim()
            }));

            const response = await submitAnswers(id, formattedAnswers, timeSpent);

            if (response.success) {
                setResult(response.data);
                setShowResultModal(true);
            }
        } catch (err) {
            alert('Có lỗi xảy ra khi nộp bài. Vui lòng thử lại!');
            console.error('Error submitting answers:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleModalClose = () => {
        setShowResultModal(false);
        navigate('/listening/exercises');
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const renderTranscriptWithBlanks = () => {
        if (!exercise?.transcript) return null;

        const words = exercise.transcript.split(' ');
        return words.map((word, index) => {
            const blank = exercise.blanks?.find(b => b.position === index);

            if (blank) {
                return (
                    <span key={index} className="inline-block mx-1">
                        <input
                            type="text"
                            value={userAnswers[blank.position] || ''}
                            onChange={(e) => handleAnswerChange(blank.position, e.target.value)}
                            className="w-32 px-3 py-2 border-2 border-blue-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                            placeholder={blank.hint || `Chỗ trống ${blank.position + 1}`}
                            disabled={isSubmitting}
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

    const getAnsweredCount = () => {
        return Object.values(userAnswers).filter(answer => answer.trim() !== '').length;
    };


    if (error) return <div className="text-center text-red-600 py-8">{error}</div>;
    if (!exercise) return <div className="text-center py-8">Không tìm thấy bài tập</div>;

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{exercise.title}</h1>
                        <div className="flex items-center mt-2 space-x-3">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${exercise.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                                    exercise.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-red-100 text-red-800'
                                }`}>
                                {exercise.difficulty === 'easy' ? 'Dễ' :
                                    exercise.difficulty === 'medium' ? 'Trung bình' : 'Khó'}
                            </span>
                            {exercise.topic && (
                                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                                    {exercise.topic}
                                </span>
                            )}
                            <span className="text-gray-600 text-sm">
                                {exercise.blanks?.length || 0} chỗ trống
                            </span>
                            <span className="text-gray-600 text-sm">
                                ⏱️ {formatTime(timeSpent)}
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate('/listening/exercises')}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                    >
                        Quay lại
                    </button>
                </div>
            </div>

            {/* Audio Player */}
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="font-medium text-gray-900 mb-1">Nghe Audio</h3>
                        <p className="text-sm text-gray-600">Nhấn play để nghe và điền từ vào chỗ trống</p>
                    </div>

                    <audio
                        controls
                        className="w-96"
                        src={exercise.audioUrl}
                        onPlay={() => console.log('Audio playing')}
                        onPause={() => console.log('Audio paused')}
                    >
                        Trình duyệt của bạn không hỗ trợ audio element.
                    </audio>
                </div>

                <div className="mt-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Hướng dẫn:</span>
                        <span>Nghe kỹ và điền từ còn thiếu vào chỗ trống</span>
                    </div>
                </div>
            </div>

            {/* Transcript Section */}
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Transcript với chỗ trống</h3>
                    <div className="text-sm text-gray-600">
                        <span className="font-medium">{getAnsweredCount()}</span> / {exercise.blanks?.length || 0} đã điền
                    </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 min-h-[200px]">
                    <div className="text-gray-700 leading-relaxed text-lg">
                        {renderTranscriptWithBlanks()}
                    </div>
                </div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-100">
                        <p className="text-sm text-blue-600">Đã điền</p>
                        <p className="text-xl font-bold text-blue-700">{getAnsweredCount()}</p>
                    </div>

                    <div className="text-center p-3 bg-green-50 rounded-lg border border-green-100">
                        <p className="text-sm text-green-600">Còn lại</p>
                        <p className="text-xl font-bold text-green-700">
                            {(exercise.blanks?.length || 0) - getAnsweredCount()}
                        </p>
                    </div>

                    <div className="text-center p-3 bg-purple-50 rounded-lg border border-purple-100">
                        <p className="text-sm text-purple-600">Thời gian</p>
                        <p className="text-xl font-bold text-purple-700">{formatTime(timeSpent)}</p>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between items-center pt-6 border-t">
                <button
                    onClick={() => {
                        // Clear all answers
                        const clearedAnswers = {};
                        exercise.blanks?.forEach(blank => {
                            clearedAnswers[blank.position] = '';
                        });
                        setUserAnswers(clearedAnswers);
                        setTimeSpent(0);
                    }}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                    Làm lại từ đầu
                </button>

                <button
                    onClick={handleSubmit}
                    disabled={isSubmitting || getAnsweredCount() !== exercise.blanks?.length}
                    className={`px-8 py-3 rounded-lg transition ${isSubmitting || getAnsweredCount() !== exercise.blanks?.length
                            ? 'bg-gray-300 cursor-not-allowed'
                            : 'bg-linear-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
                        } text-white`}
                >
                    {isSubmitting ? (
                        <div className="flex items-center">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                            Đang nộp...
                        </div>
                    ) : (
                        'Nộp bài và xem kết quả'
                    )}
                </button>
            </div>

            {/* Result Modal */}
            {result && (
                <SubmitAnswerModal
                    isOpen={showResultModal}
                    onClose={handleModalClose}
                    exercise={exercise}
                    userAnswers={userAnswers}
                    result={result}
                />
            )}
        </div>
    );
};

export default ExerciseDetailPage;