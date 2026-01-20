import api from '../api/api';

/* =========================
   FORMAT HELPERS
========================= */

/**
 * Format dữ liệu tạo / cập nhật bài nghe
 */
export const formatExerciseForApi = (formData = {}) => {
    const payload = {};

    if (formData.title !== undefined)
        payload.title = formData.title;

    if (formData.audioUrl !== undefined)
        payload.audioUrl = formData.audioUrl;

    if (formData.transcript !== undefined)
        payload.transcript = formData.transcript;

    if (formData.difficulty !== undefined)
        payload.difficulty = formData.difficulty;

    if (formData.topic !== undefined)
        payload.topic = formData.topic || null;

    if (Array.isArray(formData.blanks)) {
        payload.blanks = formData.blanks.map(b => ({
            position: Number(b.position),
            answer: b.answer?.trim(),
            hint: b.hint || null
        }));
    }

    return payload;
};

/**
 * Format đáp án người dùng khi submit
 */
export const formatAnswersForApi = (userAnswers = {}) =>
    Object.entries(userAnswers).map(([position, userAnswer]) => ({
        position: Number(position),
        userAnswer: userAnswer?.trim() || ''
    }));


/* =========================
   LISTENING API
========================= */

/**
 * GET /listening
 * Lấy danh sách bài luyện nghe
 */
export const getExercises = async (params = {}) => {
    const res = await api.get('/listening', { params });
    return res.data;
};

/**
 * GET /listening/:id
 * Lấy chi tiết bài nghe (không có đáp án)
 */
export const getExerciseById = async (id) => {
    const res = await api.get(`/listening/${id}`);
    return res.data;
};

/**
 * POST /listening (admin)
 * Tạo bài luyện nghe
 */
export const createExercise = async (data) => {
    const res = await api.post('/listening', data);
    return res.data;
};

/**
 * PUT /listening/:id (admin)
 * Cập nhật bài luyện nghe
 */
export const updateExercise = async (id, data) => {
    const res = await api.put(`/listening/${id}`, data);
    return res.data;
};

/**
 * DELETE /listening/:id (admin)
 * Xóa bài luyện nghe
 */
export const deleteExercise = async (id) => {
    const res = await api.delete(`/listening/${id}`);
    return res.data;
};

/**
 * POST /listening/submit
 * Nộp bài và chấm điểm
 */
export const submitAnswers = async (exerciseId, answers, timeSpent = 0) => {
    const formattedAnswers = Array.isArray(answers)
        ? answers
        : formatAnswersForApi(answers);

    const res = await api.post('/listening/submit', {
        exerciseId,
        answers: formattedAnswers,
        timeSpent: Math.round(timeSpent)
    });

    return res.data;
};

/**
 * GET /listening/stats
 * Thống kê kết quả người dùng
 */
export const getStats = async () => {
    const res = await api.get('/listening/stats');
    console.log("lich su", res.data)
    return res.data;
};

/**
 * GET /listening/history
 * Lịch sử làm bài
 */
export const getHistory = async (params = {}) => {
    const res = await api.get('/listening/history', { params });
    console.log("History: ", res.data)
    return res.data;
};

/**
 * POST /listening/upload-audio (admin)
 * Upload file audio
 */
export const uploadAudio = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const res = await api.post('/listening/upload-audio', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });

    return res.data;
};

/**
 * DELETE /listening/delete-audio (admin)
 * Xóa file audio
 */
export const deleteAudio = async (filename) => {
    const res = await api.delete('/listening/delete-audio', {
        data: { filename }
    });

    return res.data;
};
