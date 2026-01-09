// src/components/Vocab/VocabModal.jsx
import React, { useState, useEffect } from 'react';
import { getTopics } from '../../services/vocabs'; // Thêm import service

const VocabModal = ({ isOpen, onClose, onSubmit, initialData, mode = 'create' }) => {
  const [formData, setFormData] = useState({
    word: '',
    meaning: '',
    pronunciation: '',
    partOfSpeech: '',
    examples: ['', ''],
    topic: 'general',
    level: 'A1',
    tags: []
  });

  const [tagInput, setTagInput] = useState('');
  const [topics, setTopics] = useState([]); // Thêm state cho topics
  const [loadingTopics, setLoadingTopics] = useState(false); // Thêm loading state

  // Load topics từ backend khi modal mở
  useEffect(() => {
    if (isOpen) {
      loadTopics();
    }
  }, [isOpen]);

  // Load topics từ service
  const loadTopics = async () => {
    try {
      setLoadingTopics(true);
      const topicsData = await getTopics();
      setTopics(topicsData);
    } catch (error) {
      console.error('Error loading topics:', error);
      // Fallback topics nếu API fail
      setTopics([
        { value: 'general', label: 'Chung / Cơ bản', emoji: '📚' },
        { value: 'family', label: 'Gia đình', emoji: '👨‍👩‍👧‍👦' },
        { value: 'food', label: 'Ẩm thực', emoji: '🍔' },
        { value: 'travel', label: 'Du lịch', emoji: '✈️' },
        { value: 'work', label: 'Công việc', emoji: '💼' },
        { value: 'education', label: 'Học tập', emoji: '🎓' },
        { value: 'health', label: 'Sức khỏe', emoji: '🏥' },
        { value: 'nature', label: 'Thiên nhiên', emoji: '🌳' },
        { value: 'animals', label: 'Động vật', emoji: '🐘' },
        { value: 'technology', label: 'Công nghệ', emoji: '💻' },
        { value: 'sports', label: 'Thể thao', emoji: '⚽' },
        { value: 'shopping', label: 'Mua sắm', emoji: '🛍️' },
        { value: 'weather', label: 'Thời tiết', emoji: '☀️' },
        { value: 'emotions', label: 'Cảm xúc', emoji: '😊' },
        { value: 'home', label: 'Nhà cửa', emoji: '🏠' }
      ]);
    } finally {
      setLoadingTopics(false);
    }
  };

  // Cập nhật form khi có initialData
  useEffect(() => {
    if (initialData) {
      setFormData({
        word: initialData.word || '',
        meaning: initialData.meaning || '',
        pronunciation: initialData.pronunciation || '',
        partOfSpeech: initialData.partOfSpeech || '',
        examples: initialData.examples?.length ? [...initialData.examples, ''] : ['', ''],
        topic: initialData.topic || 'general',
        level: initialData.level || 'A1',
        tags: initialData.tags || []
      });
    }
  }, [initialData]);

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleExampleChange = (index, value) => {
    const newExamples = [...formData.examples];
    newExamples[index] = value;
    setFormData(prev => ({ ...prev, examples: newExamples }));
  };

  const addExample = () => {
    setFormData(prev => ({ ...prev, examples: [...prev.examples, ''] }));
  };

  const removeExample = (index) => {
    const newExamples = formData.examples.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, examples: newExamples }));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({ 
        ...prev, 
        tags: [...prev.tags, tagInput.trim()] 
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Lọc bỏ các ví dụ trống
    const filteredExamples = formData.examples.filter(ex => ex.trim() !== '');
    
    const submitData = {
      ...formData,
      examples: filteredExamples
    };

    onSubmit(submitData);
  };

  const partOfSpeechOptions = [
    'noun', 'verb', 'adjective', 'adverb', 'preposition', 
    'conjunction', 'interjection', 'pronoun', 'determiner'
  ];

  const levelOptions = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'other'];

  return (
    <div className="fixed inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">
            {mode === 'edit' ? 'Chỉnh sửa từ vựng' : 'Thêm từ vựng mới'}
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Word */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Từ vựng *
              </label>
              <input
                type="text"
                name="word"
                value={formData.word}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Nhập từ vựng"
                required
              />
            </div>

            {/* Meaning */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nghĩa *
              </label>
              <input
                type="text"
                name="meaning"
                value={formData.meaning}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Nhập nghĩa"
                required
              />
            </div>

            {/* Pronunciation */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phát âm
              </label>
              <input
                type="text"
                name="pronunciation"
                value={formData.pronunciation}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="/phát âm/"
              />
            </div>

            {/* Part of Speech */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Từ loại
              </label>
              <select
                name="partOfSpeech"
                value={formData.partOfSpeech}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Chọn từ loại</option>
                {partOfSpeechOptions.map(pos => (
                  <option key={pos} value={pos}>{pos}</option>
                ))}
              </select>
            </div>

            {/* Topic */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Chủ đề
              </label>
              {loadingTopics ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                  <span className="text-sm text-gray-500">Đang tải chủ đề...</span>
                </div>
              ) : (
                <select
                  name="topic"
                  value={formData.topic}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {topics.map(topic => (
                    <option key={topic.value} value={topic.value}>
                      {topic.emoji} {topic.label}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trình độ
              </label>
              <select
                name="level"
                value={formData.level}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {levelOptions.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>

            {/* Tags */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tags
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Nhập tag và nhấn Enter"
                />
                <button 
                  type="button"
                  onClick={handleAddTag}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Thêm
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <span 
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {tag}
                    <button 
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Examples */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ví dụ
              </label>
              <div className="space-y-2 mb-2">
                {formData.examples.map((example, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={example}
                      onChange={(e) => handleExampleChange(index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder={`Ví dụ ${index + 1}`}
                    />
                    {formData.examples.length > 1 && (
                      <button 
                        type="button"
                        onClick={() => removeExample(index)}
                        className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button 
                type="button"
                onClick={addExample}
                className="px-4 py-2 border border-dashed border-gray-300 text-gray-600 rounded-lg hover:border-gray-400 hover:text-gray-800"
              >
                + Thêm ví dụ
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium"
            >
              {mode === 'edit' ? 'Cập nhật' : 'Thêm mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VocabModal;