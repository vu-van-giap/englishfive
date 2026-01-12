
import React, { useState, useEffect } from 'react';
import { uploadAudio } from '../../services/listening';

const ExerciseFormModal = ({ isOpen, onClose, onSubmit, exercise = null, mode = 'create' }) => {
    const [formData, setFormData] = useState({
        title: '',
        audioUrl: '',
        transcript: '',
        difficulty: 'medium',
        topic: '',
        blanks: [{ position: 0, answer: '', hint: '' }]
    });

    const [isUploading, setIsUploading] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (exercise && mode === 'update') {
            setFormData({
                title: exercise.title || '',
                audioUrl: exercise.audioUrl || '',
                transcript: exercise.transcript || '',
                difficulty: exercise.difficulty || 'medium',
                topic: exercise.topic || '',
                blanks: exercise.blanks || [{ position: 0, answer: '', hint: '' }]
            });
        } else {
            setFormData({
                title: '',
                audioUrl: '',
                transcript: '',
                difficulty: 'medium',
                topic: '',
                blanks: [{ position: 0, answer: '', hint: '' }]
            });
        }
    }, [exercise, mode]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleBlankChange = (index, field, value) => {
        const newBlanks = [...formData.blanks];
        newBlanks[index] = { ...newBlanks[index], [field]: value };

        if (field === 'position') {
            newBlanks[index][field] = parseInt(value) || 0;
        }

        setFormData(prev => ({
            ...prev,
            blanks: newBlanks
        }));
    };

    const addBlank = () => {
        const lastPosition = formData.blanks.length > 0
            ? Math.max(...formData.blanks.map(b => b.position))
            : -1;

        setFormData(prev => ({
            ...prev,
            blanks: [...prev.blanks, { position: lastPosition + 1, answer: '', hint: '' }]
        }));
    };

    const removeBlank = (index) => {
        if (formData.blanks.length > 1) {
            const newBlanks = formData.blanks.filter((_, i) => i !== index);
            setFormData(prev => ({
                ...prev,
                blanks: newBlanks
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.title.trim()) newErrors.title = 'Tiêu đề không được để trống';
        if (!formData.audioUrl.trim()) newErrors.audioUrl = 'URL audio không được để trống';
        if (!formData.transcript.trim()) newErrors.transcript = 'Transcript không được để trống';

        formData.blanks.forEach((blank, index) => {
            if (!blank.answer.trim()) {
                newErrors[`blank_${index}`] = 'Đáp án không được để trống';
            }
        });

        return newErrors;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const formErrors = validateForm();
        if (Object.keys(formErrors).length > 0) {
            setErrors(formErrors);
            return;
        }

        setErrors({});
        onSubmit(formData);
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(true);

        try {
            const response = await uploadAudio(file);

            if (response.success) {
                setFormData(prev => ({
                    ...prev,
                    audioUrl: response.audioUrl
                }));
                alert('Upload audio thành công!');
            }
        } catch (error) {
            console.error('Error uploading audio:', error);
            alert('Upload thất bại. Vui lòng thử lại!');
        } finally {
            setIsUploading(false);
        }
    };

    // ... rest of the component remains similar ...

    return (
        // Modal JSX remains similar, just update the file upload handler
        <div className="fixed inset-0 z-50 overflow-y-auto bg-white/60 backdrop-blur-sm">
            {/* ... rest of modal JSX ... */}

            {/* Update the file upload section */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Audio URL *
                </label>
                <div className="flex space-x-2">
                    <input
                        type="text"
                        name="audioUrl"
                        value={formData.audioUrl}
                        onChange={handleChange}
                        className={`flex-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${errors.audioUrl ? 'border-red-500' : 'border-gray-300'
                            }`}
                        placeholder="URL hoặc nhấn Upload"
                    />
                    <label className={`px-4 py-3 bg-linear-to-r from-blue-500 to-blue-600 text-white rounded-lg cursor-pointer hover:from-blue-600 hover:to-blue-700 transition flex items-center ${isUploading ? 'opacity-50' : ''}`}>
                        {isUploading ? 'Đang tải...' : 'Upload'}
                        <input
                            type="file"
                            accept="audio/*"
                            onChange={handleFileUpload}
                            className="hidden"
                            disabled={isUploading}
                        />
                    </label>
                </div>
                {errors.audioUrl && <p className="mt-2 text-sm text-red-600">
                    {errors.audioUrl}
                </p>}
                {formData.audioUrl && (
                    <p className="mt-2 text-sm text-green-600">
                        Audio: {formData.audioUrl}
                    </p>
                )}
            </div>

            {/* ... rest of modal JSX ... */}
        </div>
    );
};

export default ExerciseFormModal;