import React, { useState, useEffect, useRef } from 'react';
import { uploadAudio } from '../../services/listening';

const ExerciseFormModal = ({ isOpen, onClose, onSubmit, exercise = null, mode = 'create' }) => {
    const originalExerciseRef = useRef(null);

    const [formData, setFormData] = useState({
        title: '',
        audioUrl: '',
        transcript: '',
        difficulty: 'medium',
        topic: '',
        blanks: [{ position: 0, answer: '', hint: '' }]
    });

    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        if (!isOpen) return;

        if (exercise && mode === 'update') {
            const data = {
                title: exercise.title || '',
                audioUrl: exercise.audioUrl || '',
                transcript: exercise.transcript || '',
                difficulty: exercise.difficulty || 'medium',
                topic: exercise.topic || '',
                blanks: exercise.blanks || [{ position: 0, answer: '', hint: '' }]
            };

            setFormData(data);
            originalExerciseRef.current = data;
        }

        if (mode === 'create') {
            const empty = {
                title: '',
                audioUrl: '',
                transcript: '',
                difficulty: 'medium',
                topic: '',
                blanks: [{ position: 0, answer: '', hint: '' }]
            };

            setFormData(empty);
            originalExerciseRef.current = null;
        }
    }, [isOpen, exercise, mode]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleBlankChange = (index, field, value) => {
        const newBlanks = [...formData.blanks];
        newBlanks[index][field] = field === 'position' ? Number(value) : value;
        setFormData(prev => ({ ...prev, blanks: newBlanks }));
    };

    const addBlank = () => {
        setFormData(prev => ({
            ...prev,
            blanks: [...prev.blanks, { position: 0, answer: '', hint: '' }]
        }));
    };

    const removeBlank = (index) => {
        if (formData.blanks.length > 1) {
            setFormData(prev => ({
                ...prev,
                blanks: prev.blanks.filter((_, i) => i !== index)
            }));
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const res = await uploadAudio(file);
            if (res?.success && res.audioUrl) {
                setFormData(prev => ({ ...prev, audioUrl: res.audioUrl }));
                alert('Upload audio thành công');
            } else {
                alert(res?.message || 'Upload audio thất bại');
            }
        } catch (err) {
            console.error('Upload audio error', err);
            alert('Upload audio thất bại');
        } finally {
            setIsUploading(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Validate required fields
        if (!formData.title.trim()) {
            alert('Vui lòng nhập tiêu đề bài tập');
            return;
        }
        if (!formData.audioUrl.trim()) {
            alert('Vui lòng nhập URL audio hoặc upload file');
            return;
        }
        if (!formData.transcript.trim()) {
            alert('Vui lòng nhập transcript');
            return;
        }
        
        // Validate blanks
        for (let i = 0; i < formData.blanks.length; i++) {
            const blank = formData.blanks[i];
            if (!blank.answer.trim()) {
                alert(`Vui lòng nhập đáp án cho chỗ trống ${i + 1}`);
                return;
            }
        }
        
        onSubmit(formData);
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center overflow-y-auto">
            <div className="bg-white w-full max-w-3xl rounded-lg p-6 max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-bold mb-4">
                    {mode === 'create' ? 'Tạo bài listening' : 'Cập nhật bài listening'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề *</label>
                        <input
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="Tiêu đề bài tập"
                            className="w-full border px-4 py-2 rounded"
                            required
                        />
                    </div>

                    {/* AUDIO */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Audio URL *</label>
                        <input
                            name="audioUrl"
                            value={formData.audioUrl}
                            onChange={handleChange}
                            placeholder="Audio URL"
                            className="w-full border px-4 py-2 rounded mb-2"
                            required
                        />
                        <div className="text-sm text-gray-600 mb-2">Hoặc upload file:</div>
                        <input
                            type="file"
                            accept="audio/*"
                            onChange={handleFileUpload}
                            className="w-full"
                        />
                        {isUploading && <p className="text-sm text-blue-600">Đang upload...</p>}
                    </div>

                    {/* TRANSCRIPT */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Transcript *</label>
                        <textarea
                            name="transcript"
                            value={formData.transcript}
                            onChange={handleChange}
                            placeholder="Transcript (có ___ cho chỗ trống)"
                            className="w-full border px-4 py-2 rounded h-32"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* DIFFICULTY */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Độ khó</label>
                            <select
                                name="difficulty"
                                value={formData.difficulty}
                                onChange={handleChange}
                                className="w-full border px-4 py-2 rounded"
                            >
                                <option value="easy">Dễ</option>
                                <option value="medium">Trung bình</option>
                                <option value="hard">Khó</option>
                            </select>
                        </div>

                        {/* TOPIC */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Chủ đề</label>
                            <input
                                name="topic"
                                value={formData.topic}
                                onChange={handleChange}
                                placeholder="Chủ đề"
                                className="w-full border px-4 py-2 rounded"
                            />
                        </div>
                    </div>

                    {/* BLANKS */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-sm font-medium text-gray-700">Chỗ trống *</label>
                            <button
                                type="button"
                                onClick={addBlank}
                                className="text-sm text-blue-600 hover:text-blue-800"
                            >
                                + Thêm chỗ trống
                            </button>
                        </div>
                        
                        {formData.blanks.map((b, i) => (
                            <div key={i} className="flex gap-2 mb-2 items-center">
                                <div className="flex-1 grid grid-cols-3 gap-2">
                                    <input
                                        type="number"
                                        value={b.position}
                                        onChange={e => handleBlankChange(i, 'position', e.target.value)}
                                        placeholder="Vị trí"
                                        className="border px-2 py-1 rounded"
                                        min="0"
                                    />
                                    <input
                                        value={b.answer}
                                        onChange={e => handleBlankChange(i, 'answer', e.target.value)}
                                        placeholder="Đáp án *"
                                        className="border px-2 py-1 rounded"
                                        required
                                    />
                                    <input
                                        value={b.hint}
                                        onChange={e => handleBlankChange(i, 'hint', e.target.value)}
                                        placeholder="Gợi ý"
                                        className="border px-2 py-1 rounded"
                                    />
                                </div>
                                {formData.blanks.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeBlank(i)}
                                        className="px-2 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200"
                                    >
                                        Xóa
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* ACTIONS */}
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={isUploading}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
                        >
                            {mode === 'create' ? 'Tạo bài tập' : 'Cập nhật'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ExerciseFormModal;