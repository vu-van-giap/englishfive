
import React, { useState, useEffect } from 'react';
import ExerciseFormModal from './ExerciseFormModal';
import ExerciseDetailModal from './ExerciseDetailModal';
import SubmitAnswerModal from './SubmitAnswerModal';
import {
    getExercises,
    getExerciseById, deleteExercise, createExercise, updateExercise, submitAnswers, formatExerciseForApi, formatAnswersForApi
} from '../../services/listening';

const ExerciseList = ({ user }) => {
    const [exercises, setExercises] = useState([]);
    const [filteredExercises, setFilteredExercises] = useState([]);
    const [loading, setLoading] = useState(true);

    // State for modals
    const [showFormModal, setShowFormModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showSubmitModal, setShowSubmitModal] = useState(false);

    const [selectedExercise, setSelectedExercise] = useState(null);
    const [selectedExerciseForPractice, setSelectedExerciseForPractice] = useState(null);
    const [mode, setMode] = useState('create');
    const [userAnswers, setUserAnswers] = useState({});

    const [filters, setFilters] = useState({
        difficulty: '',
        topic: '',
        search: ''
    });

    // Fetch exercises from API
    useEffect(() => {
        fetchExercises();
    }, []);

    useEffect(() => {
        filterExercises();
    }, [filters, exercises]);

    const fetchExercises = async () => {
        try {
            setLoading(true);
            const response = await getExercises({
                page: 1,
                limit: 50
            });

            if (response.success) {
                setExercises(response.items);
                setFilteredExercises(response.items);
            }
        } catch (error) {
            console.error('Error fetching exercises:', error);
            alert('Không thể tải danh sách bài tập. Vui lòng thử lại!');
        } finally {
            setLoading(false);
        }
    };

    const filterExercises = () => {
        let filtered = [...exercises];

        if (filters.difficulty) {
            filtered = filtered.filter(ex => ex.difficulty === filters.difficulty);
        }

        if (filters.topic) {
            filtered = filtered.filter(ex =>
                ex.topic?.toLowerCase().includes(filters.topic.toLowerCase())
            );
        }

        if (filters.search) {
            const searchTerm = filters.search.toLowerCase();
            filtered = filtered.filter(ex =>
                ex.title.toLowerCase().includes(searchTerm) ||
                ex.topic?.toLowerCase().includes(searchTerm)
            );
        }

        setFilteredExercises(filtered);
    };

    const handleCreate = () => {
        setSelectedExercise(null);
        setMode('create');
        setShowFormModal(true);
    };

    const handleUpdate = async (exercise) => {
        try {
            // Fetch full exercise data with answers for editing
            const response = await getExerciseById(exercise._id);
            if (response.success) {
                setSelectedExercise(response.data);
                setMode('update');
                setShowFormModal(true);
            }
        } catch (error) {
            console.error('Error fetching exercise details:', error);
            alert('Không thể tải chi tiết bài tập để chỉnh sửa');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Bạn có chắc muốn xóa bài tập này?')) {
            try {
                const response = await deleteExercise(id);
                if (response.success) {
                    setExercises(exercises.filter(ex => ex._id !== id));
                    alert('Xóa bài tập thành công!');
                }
            } catch (error) {
                console.error('Error deleting exercise:', error);
                alert('Không thể xóa bài tập. Vui lòng thử lại!');
            }
        }
    };

    const handlePractice = async (exercise) => {
        try {
            // Fetch exercise details without answers
            const response = await getExerciseById(exercise._id);
            if (response.success) {
                setSelectedExerciseForPractice(response.data);

                // Initialize answers
                const initialAnswers = {};
                if (response.data.blanks) {
                    response.data.blanks.forEach(blank => {
                        initialAnswers[blank.position] = '';
                    });
                }
                setUserAnswers(initialAnswers);
                setShowDetailModal(true);
            }
        } catch (error) {
            console.error('Error fetching exercise for practice:', error);
            alert('Không thể tải bài tập để làm. Vui lòng thử lại!');
        }
    };

    const handleSubmitForm = async (formData) => {
        try {
            const formattedData = formatExerciseForApi(formData);

            if (mode === 'create') {
                const response = await createExercise(formattedData);
                if (response.success) {
                    // Add new exercise to list
                    const newExercise = {
                        _id: response.exerciseId,
                        ...formData,
                        blanksCount: formData.blanks.length,
                        createdAt: new Date().toISOString().split('T')[0]
                    };
                    setExercises([newExercise, ...exercises]);
                    alert('Tạo bài tập thành công!');
                }
            } else if (mode === 'update' && selectedExercise) {
                const response = await updateExercise(selectedExercise._id, formattedData);
                if (response.success) {
                    // Update exercise in list
                    const updatedExercises = exercises.map(ex =>
                        ex._id === selectedExercise._id
                            ? {
                                ...ex,
                                ...formData,
                                blanksCount: formData.blanks.length,
                                updatedAt: new Date().toISOString().split('T')[0]
                            }
                            : ex
                    );
                    setExercises(updatedExercises);
                    alert('Cập nhật bài tập thành công!');
                }
            }
            setShowFormModal(false);
        } catch (error) {
            console.error('Error saving exercise:', error);
            alert('Lỗi khi lưu bài tập. Vui lòng thử lại!');
        }
    };

    const handleSubmitAnswers = async () => {
        try {
            if (!selectedExerciseForPractice) return;

            const formattedAnswers = formatAnswersForApi(userAnswers);
            const response = await submitAnswers(
                selectedExerciseForPractice._id,
                formattedAnswers,
                0 // timeSpent - bạn có thể tính thời gian thực tế
            );

            if (response.success) {
                setShowDetailModal(false);
                setShowSubmitModal(true);
            }
        } catch (error) {
            console.error('Error submitting answers:', error);
            alert('Lỗi khi nộp bài. Vui lòng thử lại!');
        }
    };

    const getDifficultyColor = (level) => {
        switch (level) {
            case 'easy': return 'bg-green-100 text-green-800 border-green-200';
            case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'hard': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getDifficultyText = (level) => {
        switch (level) {
            case 'easy': return 'Dễ';
            case 'medium': return 'Trung bình';
            case 'hard': return 'Khó';
            default: return 'Chưa xác định';
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="text-gray-600">Đang tải bài tập...</p>
            </div>
        );
    }

    return (
        <div>
            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm border mb-6">
                <div className="p-4 border-b">
                    <h3 className="font-medium text-gray-900">Tìm kiếm & Lọc</h3>
                </div>
                <div className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Từ khóa
                            </label>
                            <input
                                type="text"
                                value={filters.search}
                                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Tên bài tập, chủ đề..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Độ khó
                            </label>
                            <select
                                value={filters.difficulty}
                                onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">Tất cả độ khó</option>
                                <option value="easy">Dễ</option>
                                <option value="medium">Trung bình</option>
                                <option value="hard">Khó</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Chủ đề
                            </label>
                            <input
                                type="text"
                                value={filters.topic}
                                onChange={(e) => setFilters({ ...filters, topic: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Lọc theo chủ đề..."
                            />
                        </div>

                        <div className="flex items-end">
                            <div className="flex space-x-2 w-full">
                                <button
                                    onClick={() => setFilters({ difficulty: '', topic: '', search: '' })}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                                >
                                    Xóa lọc
                                </button>
                                {user.role === 'admin' && (
                                    <button
                                        onClick={handleCreate}
                                        className="flex-1 px-4 py-2 bg-linear-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition flex items-center justify-center"
                                    >
                                        Tạo mới
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Exercises Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredExercises.map((exercise) => (
                    <div key={exercise._id} className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-lg transition-shadow duration-300">
                        <div className="p-4 border-b">
                            <div className="flex justify-between items-start">
                                <div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getDifficultyColor(exercise.difficulty)}`}>
                                        {getDifficultyText(exercise.difficulty)}
                                    </span>
                                    {exercise.topic && (
                                        <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                                            {exercise.topic}
                                        </span>
                                    )}
                                </div>
                                <div className="text-gray-500 text-sm">
                                    {new Date(exercise.createdAt).toLocaleDateString('vi-VN')}
                                </div>
                            </div>
                        </div>

                        <div className="p-5">
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">{exercise.title}</h3>

                            <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                                <div className="flex items-center space-x-3">
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-blue-700">Audio file</p>
                                        <p className="text-xs text-blue-600 truncate">{exercise.audioUrl}</p>
                                    </div>
                                    <button
                                        onClick={() => {
                                            const audio = new Audio(exercise.audioUrl);
                                            audio.play();
                                        }}
                                        className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded hover:bg-blue-200 transition"
                                    >
                                        Nghe thử
                                    </button>
                                </div>
                            </div>

                            <div className="mb-4">
                                <div className="flex items-center text-sm text-gray-600 mb-2">
                                    <span>{exercise.blanksCount} chỗ trống cần điền</span>
                                </div>
                            </div>

                            <div className="flex space-x-2">
                                <button
                                    onClick={() => handlePractice(exercise)}
                                    className="flex-1 px-4 py-2 bg-linear-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition flex items-center justify-center"
                                >
                                    Làm bài
                                </button>

                                {user.role === 'admin' && (
                                    <>
                                        <button
                                            onClick={() => handleUpdate(exercise)}
                                            className="px-4 py-2 bg-linear-to-r from-yellow-500 to-yellow-600 text-white rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition"
                                            title="Chỉnh sửa"
                                        >
                                            Sửa
                                        </button>
                                        <button
                                            onClick={() => handleDelete(exercise._id)}
                                            className="px-4 py-2 bg-linear-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition"
                                            title="Xóa"
                                        >
                                            Xóa
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Empty State */}
            {filteredExercises.length === 0 && (
                <div className="text-center py-12">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy bài tập</h3>
                    <p className="text-gray-600 mb-4">
                        {filters.difficulty || filters.topic || filters.search
                            ? 'Thử thay đổi tiêu chí lọc hoặc tạo bài tập mới'
                            : 'Chưa có bài tập nào. Hãy bắt đầu tạo bài tập đầu tiên!'}
                    </p>
                    {user.role === 'admin' && (
                        <button
                            onClick={handleCreate}
                            className="px-6 py-3 bg-linear-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition"
                        >
                            Tạo Bài Tập Đầu Tiên
                        </button>
                    )}
                </div>
            )}

            {/* Modals */}
            <ExerciseFormModal
                isOpen={showFormModal}
                onClose={() => setShowFormModal(false)}
                onSubmit={handleSubmitForm}
                exercise={selectedExercise}
                mode={mode}
            />

            <ExerciseDetailModal
                isOpen={showDetailModal}
                onClose={() => setShowDetailModal(false)}
                exercise={selectedExerciseForPractice}
                onSubmit={handleSubmitAnswers}
            />

            <SubmitAnswerModal
                isOpen={showSubmitModal}
                onClose={() => setShowSubmitModal(false)}
                exercise={selectedExerciseForPractice}
                userAnswers={userAnswers}
            />
        </div>
    );
};

export default ExerciseList;