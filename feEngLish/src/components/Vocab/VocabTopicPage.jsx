import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getTopics, getVocabsByTopic } from '../../services/vocabs';
import VocabCard from '../../components/Vocab/VocabCard';
import { toast } from 'react-toastify';

const VocabTopicPage = () => {
  const { topic } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [vocabs, setVocabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [topicInfo, setTopicInfo] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 1
  });

  // Lấy page từ query params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const page = params.get('page') || '1';
    setPagination(prev => ({ ...prev, page: parseInt(page) }));
  }, [location.search]);

  useEffect(() => {
    loadTopicData();
  }, [topic, pagination.page]);

  const loadTopicData = async () => {
    setLoading(true);
    try {
      // Load topic info từ service
      const topics = await getTopics();
      const currentTopic = topics.find(t => t.value === topic);
      setTopicInfo(currentTopic);

      // Load vocabs theo topic
      const data = await getVocabsByTopic(topic, pagination.page, pagination.limit);
      setVocabs(data.items || []);
      setPagination(prev => ({
        ...prev,
        total: data.total || 0,
        totalPages: data.totalPages || 1
      }));
    } catch (error) {
      console.error('Error loading topic data:', error);
      toast.error('Lỗi khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
    // Update URL với page mới
    navigate(`/vocab/topic/${topic}?page=${newPage}`, { replace: true });
  };

  const handleView = (vocab) => {
    navigate(`/vocab/${vocab._id}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header với topic info */}
      <div className="mb-8">
        <button 
          onClick={() => navigate('/vocab')}
          className="text-blue-500 hover:text-blue-600 mb-4 flex items-center gap-1"
        >
          ← Quay lại trang chủ
        </button>
        
        {topicInfo && (
          <div className="flex items-center gap-4">
            <div className="text-4xl">{topicInfo.emoji}</div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">{topicInfo.label}</h1>
              <p className="text-gray-600 mt-1">Từ vựng theo chủ đề</p>
            </div>
          </div>
        )}
      </div>

      {/* Vocab List */}
      <div className="bg-white rounded-xl shadow p-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-gray-600">Đang tải từ vựng...</p>
          </div>
        ) : vocabs.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Chưa có từ vựng trong chủ đề này</h3>
            <p className="text-gray-500">Hãy thêm từ vựng mới cho chủ đề này</p>
            <button 
              onClick={() => navigate('/vocab/search')}
              className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg"
            >
              Thêm từ mới
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vocabs.map(vocab => (
                <VocabCard
                  key={vocab._id}
                  vocab={vocab}
                  onView={handleView}
                />
              ))}
            </div>

            {pagination.totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-8">
                <button 
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className={`px-4 py-2 rounded-lg ${pagination.page === 1 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                  ←
                </button>
                
                <span className="text-gray-600">
                  Trang {pagination.page} / {pagination.totalPages}
                </span>

                <button 
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className={`px-4 py-2 rounded-lg ${pagination.page === pagination.totalPages 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                  →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default VocabTopicPage;