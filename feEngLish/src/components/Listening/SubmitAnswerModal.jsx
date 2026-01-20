import React from 'react';

const SubmitAnswerModal = ({ isOpen, onClose, exercise, userAnswers, result }) => {
    if (!isOpen || !exercise || !result) return null;

    const getFeedback = (score) => {
        if (score >= 90) return {
            text: 'Xuất sắc! 🎉',
            color: 'text-green-600',
            bgColor: 'bg-green-50',
            borderColor: 'border-green-200',
            emoji: '🏆',
            message: 'Khả năng nghe của bạn thật tuyệt vời!'
        };
        if (score >= 75) return {
            text: 'Tốt lắm! 👍',
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
            borderColor: 'border-blue-200',
            emoji: '🌟',
            message: 'Bạn đang làm rất tốt! Tiếp tục phát huy nhé!'
        };
        if (score >= 60) return {
            text: 'Khá tốt! 💪',
            color: 'text-yellow-600',
            bgColor: 'bg-yellow-50',
            borderColor: 'border-yellow-200',
            emoji: '📚',
            message: 'Hãy luyện tập thêm để cải thiện kỹ năng!'
        };
        if (score >= 40) return {
            text: 'Cần cố gắng! 🎯',
            color: 'text-orange-600',
            bgColor: 'bg-orange-50',
            borderColor: 'border-orange-200',
            emoji: '🎯',
            message: 'Hãy nghe lại nhiều lần và tập trung hơn!'
        };
        return {
            text: 'Đừng nản chí! 💪',
            color: 'text-red-600',
            bgColor: 'bg-red-50',
            borderColor: 'border-red-200',
            emoji: '🔥',
            message: 'Hãy luyện tập đều đặn mỗi ngày!'
        };
    };

    const feedback = getFeedback(result.score);

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 bg-opacity-50">
            <div className="flex items-center justify-center min-h-screen px-4 py-8">
                <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
                    {/* Header */}
                    <div className="px-6 py-4 bg-linear-to-r from-green-600 to-green-700 text-white rounded-t-lg">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-semibold">Kết quả bài làm</h3>
                                <p className="text-green-100 text-sm mt-1">Điểm số và đáp án chi tiết</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="text-white hover:text-gray-200 transition"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    <div className="p-6 space-y-6">
                        {/* Score Display */}
                        <div className={`p-6 rounded-lg border ${feedback.bgColor} ${feedback.borderColor}`}>
                            <div className="text-center">
                                <div className="text-5xl font-bold mb-2">{feedback.emoji}</div>
                                <h4 className="text-xl font-semibold mb-2">{feedback.text}</h4>
                                <div className="text-4xl font-bold mb-2">{result.score}/100</div>
                                <p className="text-gray-600 mb-4">{feedback.message}</p>

                                <div className="grid grid-cols-2 gap-4 mt-4">
                                    <div className="text-center p-3 bg-white rounded-lg border">
                                        <p className="text-sm text-gray-600">Số câu đúng</p>
                                        <p className="text-2xl font-bold text-green-600">
                                            {result.correctCount}
                                        </p>
                                    </div>
                                    <div className="text-center p-3 bg-white rounded-lg border">
                                        <p className="text-sm text-gray-600">Tổng số câu</p>
                                        <p className="text-2xl font-bold text-blue-600">
                                            {result.totalBlanks}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Results Details */}
                        <div>
                            <h4 className="font-medium text-gray-900 mb-4">Chi tiết câu trả lời</h4>
                            <div className="space-y-3">
                                {result.results?.map((item, index) => (
                                    <div
                                        key={index}
                                        className={`p-4 rounded-lg border ${item.isCorrect
                                                ? 'bg-green-50 border-green-200'
                                                : 'bg-red-50 border-red-200'
                                            }`}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="flex items-center mb-2">
                                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 ${item.isCorrect ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                                                        }`}>
                                                        {item.isCorrect ? (
                                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                            </svg>
                                                        ) : (
                                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                                            </svg>
                                                        )}
                                                    </div>
                                                    <span className="font-medium">Câu {index + 1} (Vị trí {item.position + 1})</span>
                                                </div>
                                                <div className="text-sm space-y-1">
                                                    <div>
                                                        <span className="text-gray-600">Câu trả lời của bạn: </span>
                                                        <span className={`font-medium ${item.isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                                                            {item.userAnswer || '(Chưa trả lời)'}
                                                        </span>
                                                    </div>
                                                    {!item.isCorrect && (
                                                        <div>
                                                            <span className="text-gray-600">Đáp án đúng: </span>
                                                            <span className="font-medium text-green-700">{item.correctAnswer}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${item.isCorrect
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                                }`}>
                                                {item.isCorrect ? 'ĐÚNG' : 'SAI'}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Tips for Improvement */}
                        {result.score < 70 && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="flex items-start">
                                    <svg className="w-5 h-5 text-blue-500 mt-0.5 mr-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                    </svg>
                                    <div>
                                        <h5 className="font-medium text-blue-800 mb-2">Mẹo cải thiện điểm số</h5>
                                        <ul className="text-sm text-blue-700 space-y-1">
                                            <li>• Nghe audio nhiều lần trước khi điền đáp án</li>
                                            <li>• Ghi chú những từ khó nghe</li>
                                            <li>• Luyện tập với các bài tập cùng chủ đề</li>
                                            <li>• Sử dụng tai nghe để nghe rõ hơn</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex justify-between items-center pt-6 border-t">
                            <div className="text-sm text-gray-600">
                                Hoàn thành lúc: {new Date().toLocaleTimeString('vi-VN')}
                            </div>

                            <div className="flex space-x-3">
                                <button
                                    onClick={onClose}
                                    className="px-6 py-2 bg-linear-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition"
                                >
                                    <div className="flex items-center">
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        Hoàn thành
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SubmitAnswerModal;