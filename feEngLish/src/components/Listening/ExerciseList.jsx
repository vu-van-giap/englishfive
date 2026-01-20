import React, { useState, useEffect } from 'react';
import ExerciseFormModal from './ExerciseFormModal';
import ExerciseDetailModal from './ExerciseDetailModal';
import SubmitAnswerModal from './SubmitAnswerModal';
import { toast } from "react-toastify";
import {
    getExercises,
    getExerciseById,
    deleteExercise,
    createExercise,
    updateExercise,
    submitAnswers,
    formatExerciseForApi
} from '../../services/listening';

const ExerciseList = ({ user }) => {
    const [exercises, setExercises] = useState([]);
    const [filteredExercises, setFilteredExercises] = useState([]);
    const [loading, setLoading] = useState(true);
    const [apiError, setApiError] = useState(null);

    const [showFormModal, setShowFormModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showSubmitModal, setShowSubmitModal] = useState(false);

    const [selectedExercise, setSelectedExercise] = useState(null);
    const [selectedExerciseForPractice, setSelectedExerciseForPractice] = useState(null);
    const [mode, setMode] = useState('create');
    const [userAnswers, setUserAnswers] = useState({});
    const [submitResult, setSubmitResult] = useState(null);

    const [filters, setFilters] = useState({
        difficulty: '',
        topic: '',
        search: ''
    });

    useEffect(() => {
        fetchExercises();
    }, []);

    useEffect(() => {
        filterExercises();
    }, [filters, exercises]);

    /* ================= FETCH ================= */

    const fetchExercises = async () => {
        try {
            setLoading(true);
            setApiError(null);

            const response = await getExercises({ page: 1, limit: 50 });

            console.log('API Response:', response);

            if (response.success) {
                setExercises(response.items || []);
                setFilteredExercises(response.items || []);
            } else {
                setApiError(response.message || 'Failed to fetch exercises');
            }
        } catch (error) {
            console.error('Fetch error:', error);
            setApiError('Không thể kết nối tới server. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    const filterExercises = () => {
        let filtered = [...exercises];

        if (filters.difficulty)
            filtered = filtered.filter(ex => ex.difficulty === filters.difficulty);

        if (filters.topic)
            filtered = filtered.filter(ex =>
                ex.topic?.toLowerCase().includes(filters.topic.toLowerCase())
            );

        if (filters.search) {
            const s = filters.search.toLowerCase();
            filtered = filtered.filter(ex =>
                ex.title.toLowerCase().includes(s) ||
                ex.topic?.toLowerCase().includes(s)
            );
        }

        setFilteredExercises(filtered);
    };

    /* ================= HANDLERS ================= */

    const handlePractice = (exercise) => {
        setSelectedExerciseForPractice(exercise);
        setUserAnswers({});
        setShowDetailModal(true);
    };

    const handleSubmitAnswers = async (answers, timeSpent) => {
        try {
            if (!selectedExerciseForPractice) return;

            const response = await submitAnswers(
                selectedExerciseForPractice._id,
                answers,
                timeSpent
            );

            if (response.success) {
                setUserAnswers(answers);
                setSubmitResult(response.data); 
                setShowDetailModal(false);
                setShowSubmitModal(true);
            } else {
                alert(response.message || 'Có lỗi khi nộp bài');
            }
        } catch (error) {
            console.error('Submit error:', error);
            alert('Có lỗi khi nộp bài');
        }
    };



    const handleDelete = async (exerciseId) => {
        if (!confirm('Bạn có chắc chắn muốn xóa bài tập này?')) return;

        try {
            const response = await deleteExercise(exerciseId);
            if (response.success) {
                setExercises(prev => prev.filter(ex => ex._id !== exerciseId));
                toast.success("Xóa bài tập thành công.")
            } else {
                alert(response.message || 'Có lỗi khi xóa bài tập');
            }
        } catch (error) {
            console.error(error);
            alert('Có lỗi khi xóa bài tập');
        }
    };

    const handleCreate = () => {
        setSelectedExercise(null);
        setMode('create');
        setShowFormModal(true);
    };

    const handleUpdate = async (exercise) => {
        try {
            const res = await getExerciseById(exercise._id);
            if (res.success) {
                setSelectedExercise(res.data);
                setMode('update');
                setShowFormModal(true);
            }
        } catch (error) {
            console.error(error);
            alert('Không thể lấy thông tin bài tập');
        }
    };

    const handleSubmitForm = async (formData) => {
        try {
            const payload = formatExerciseForApi(formData);

            if (mode === 'create') {
                const res = await createExercise(payload);
                if (res.success) {
                    setExercises(prev => [
                        {
                            _id: res.exerciseId,
                            ...formData,
                            blanksCount: formData.blanks?.length || 0,
                            createdAt: new Date()
                        },
                        ...prev
                    ]);
                    setShowFormModal(false);
                }
            }

            if (mode === 'update' && selectedExercise) {
                const res = await updateExercise(selectedExercise._id, payload);
                if (res.success) {
                    setExercises(prev =>
                        prev.map(ex =>
                            ex._id === selectedExercise._id
                                ? { ...ex, ...payload }
                                : ex
                        )
                    );
                    setShowFormModal(false);
                }
            }
        } catch (error) {
            console.error(error);
            alert('Lỗi khi lưu bài tập');
        }
    };

    /* ================= UI HELPERS ================= */

    const getDifficultyColor = (difficulty) => {
        switch (difficulty) {
            case 'easy': return 'bg-green-100 text-green-800 border-green-200';
            case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'hard': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getDifficultyText = (difficulty) => {
        switch (difficulty) {
            case 'easy': return 'Dễ';
            case 'medium': return 'Trung bình';
            case 'hard': return 'Khó';
            default: return 'Không xác định';
        }
    };

    /* ================= RENDER ================= */

    if (loading) {
        return (
            <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-4 text-gray-600">Đang tải bài tập...</p>
            </div>
        );
    }

    if (apiError) {
        return (
            <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Lỗi tải dữ liệu</h3>
                <p className="text-gray-600">{apiError}</p>
                <button
                    onClick={fetchExercises}
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
                >
                    Thử lại
                </button>
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
                                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center"
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
                                            audio.play().catch(e => console.error('Audio error:', e));
                                        }}
                                        className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded hover:bg-blue-200 transition"
                                    >
                                        Nghe thử
                                    </button>
                                </div>
                            </div>

                            <div className="mb-4">
                                <div className="flex items-center text-sm text-gray-600 mb-2">
                                    <span>{exercise.blanksCount || 0} chỗ trống cần điền</span>
                                </div>
                            </div>

                            <div className="flex space-x-2">
                                <button
                                    onClick={() => handlePractice(exercise)}
                                    className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition flex items-center justify-center"
                                >
                                    Làm bài
                                </button>

                                {user.role === 'admin' && (
                                    <>
                                        <button
                                            onClick={() => handleUpdate(exercise)}
                                            className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition"
                                            title="Chỉnh sửa"
                                        >
                                            Sửa
                                        </button>
                                        <button
                                            onClick={() => handleDelete(exercise._id)}
                                            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
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
            {filteredExercises.length === 0 && !loading && (
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
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
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
                result={submitResult}
            />
        </div>
    );
};

export default ExerciseList;