import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getVocabById, getTopics, getVocabsByTopic } from '../../services/vocabs';
import { toast } from 'react-toastify';

const VocabDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vocab, setVocab] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedVocabs, setRelatedVocabs] = useState([]);
  const [topicInfo, setTopicInfo] = useState(null);

  useEffect(() => {
    loadVocabDetail();
  }, [id]);

  const loadVocabDetail = async () => {
    setLoading(true);
    try {
      const data = await getVocabById(id);
      setVocab(data);
      
      const topics = await getTopics();
      const topic = topics.find(t => t.value === data.topic);
      setTopicInfo(topic);
      
      if (data.topic) {
        const related = await getVocabsByTopic(data.topic, 1, 4);
        setRelatedVocabs(related.items.filter(v => v._id !== id));
      }
    } catch (error) {
      console.error('Error loading vocab detail:', error);
      toast.error('Không thể tải chi tiết từ vựng');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!vocab) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Không tìm thấy từ vựng</h2>
        <button 
          onClick={() => navigate('/vocab')}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg"
        >
          Quay lại trang chủ
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <button 
        onClick={() => navigate(-1)}
        className="text-blue-500 hover:text-blue-600 mb-8 flex items-center gap-1"
      >
        ← Quay lại
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  {topicInfo && (
                    <>
                      <span className="text-3xl">{topicInfo.emoji}</span>
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        {topicInfo.label}
                      </span>
                    </>
                  )}
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    vocab.level === 'A1' ? 'bg-green-100 text-green-800' :
                    vocab.level === 'A2' ? 'bg-blue-100 text-blue-800' :
                    vocab.level === 'B1' ? 'bg-yellow-100 text-yellow-800' :
                    vocab.level === 'B2' ? 'bg-orange-100 text-orange-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {vocab.level}
                  </span>
                </div>
                
                <h1 className="text-4xl font-bold text-gray-800 mb-2">{vocab.word}</h1>
                <p className="text-2xl text-gray-700 mb-1">{vocab.meaning}</p>
                
                {vocab.pronunciation && (
                  <p className="text-gray-500 italic text-lg">/{vocab.pronunciation}/</p>
                )}
                
                {vocab.partOfSpeech && (
                  <span className="inline-block mt-2 px-3 py-1 bg-gray-100 text-gray-600 rounded-lg">
                    {vocab.partOfSpeech}
                  </span>
                )}
              </div>
            </div>

            {vocab.tags && vocab.tags.length > 0 && (
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-gray-600 mb-2">TAGS</h3>
                <div className="flex flex-wrap gap-2">
                  {vocab.tags.map((tag, index) => (
                    <span 
                      key={index}
                      className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Examples */}
            {vocab.examples && vocab.examples.length > 0 && (
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">Ví dụ</h3>
                <div className="space-y-4">
                  {vocab.examples.map((example, index) => (
                    <div 
                      key={index}
                      className="p-4 bg-gray-50 rounded-lg border-l-4 border-blue-500"
                    >
                      <p className="text-gray-700 italic">"{example}"</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {relatedVocabs.length > 0 && (
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Từ vựng liên quan
              </h3>
              <div className="space-y-3">
                {relatedVocabs.map(relatedVocab => (
                  <div 
                    key={relatedVocab._id}
                    onClick={() => navigate(`/vocab/${relatedVocab._id}`)}
                    className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-gray-800">{relatedVocab.word}</p>
                        <p className="text-sm text-gray-600">{relatedVocab.meaning}</p>
                      </div>
                      <span className="text-blue-500">→</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-blue-50 rounded-xl shadow p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-3">Mẹo học từ vựng</h3>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-blue-500">✓</span>
                <span className="text-sm text-gray-700">Tạo câu với từ mới</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500">✓</span>
                <span className="text-sm text-gray-700">Sử dụng flashcard</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500">✓</span>
                <span className="text-sm text-gray-700">Ôn tập định kỳ</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500">✓</span>
                <span className="text-sm text-gray-700">Áp dụng vào giao tiếp</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VocabDetailPage;