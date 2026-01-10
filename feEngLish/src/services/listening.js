import api from '../api/api';
export const getExercises = async (params = {}) => {
    try {
        const response = await api.get('/listening', { params });
        return response.data;
    } catch (error) {
        console.error('Error fetching exercises:', error);
        throw error;
    }
}
export const getExerciseById = async (id) => {
    try {
        const response = await api.get(`/listening/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching exercise:', error);
        throw error;
    }
}

export const createExercise = async (exerciseData) => {
    try {
        const response = await api.post('/listening', exerciseData);
        return response.data;
    } catch (error) {
        console.error('Error creating exercise:', error);
        throw error;
    }
}
export const updateExercise = async (id, exerciseData) => {
    try {
        const response = await api.put(`/listening/${id}`, exerciseData);
        return response.data;
    } catch (error) {
        console.error('Error updating exercise:', error);
        throw error;
    }
}
export const deleteExercise = async (id) => {
    try {
        const response = await api.delete(`/listening/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting exercise:', error);
        throw error;
    }
}

export const uploadAudio = async (file) => {
    try {
        const formData = new FormData();
        formData.append('audio', file);
        const response = await api.post('/listening/upload-audio', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error uploading audio:', error);
        throw error;
    }
}

export const deleteAudio = async (filename) => {
    try {
        const response = await api.delete('/listening/delete-audio', {
            data: { filename }
        });
        return response.data;
    } catch (error) {
        console.error('Error deleting audio:', error);
        throw error;
    }
}
export const submitAnswers = async (exerciseId, answers, timeSpent = 0) => {
    try {
        const response = await api.post('/listening/submit', {
            exerciseId,
            answers,
            timeSpent
        });
        return response.data;
    } catch (error) {
        console.error('Error submitting answers:', error);
        throw error;
    }
}
export const getStats = async () => {
    try {
        const response = await api.get('/listening/stats');
        return response.data;
    } catch (error) {
        console.error('Error fetching stats:', error);
        throw error;
    }
}
export const getHistory = async (params = {}) => {
    try {
        const response = await api.get('/listening/history', { params });
        return response.data;
    } catch (error) {
        console.error('Error fetching history:', error);
        throw error;
    }
}
export const formatExerciseForApi = (formData) => {
    return {
        title: formData.title,
        audioUrl: formData.audioUrl,
        transcript: formData.transcript,
        blanks: formData.blanks.map(blank => ({
            position: parseInt(blank.position),
            answer: blank.answer.trim(),
            hint: blank.hint?.trim() || ''
        })),
        difficulty: formData.difficulty,
        topic: formData.topic || ''
    };
}
export const formatAnswersForApi = (userAnswers) => {
    return Object.entries(userAnswers).map(([position, userAnswer]) => ({
        position: parseInt(position),
        userAnswer: userAnswer.trim()
    }));
}
