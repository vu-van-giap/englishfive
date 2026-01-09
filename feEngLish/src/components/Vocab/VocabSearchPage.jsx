// src/pages/Vocab/VocabSearchPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {getTopics, getAllVocabs, getVocabById, getVocabsByTopic } from '../../services/vocabs';
import VocabCard from '../../components/Vocab/VocabCard';
import VocabModal from '../../components/Vocab/VocabModal';
import SearchBar from '../../components/Vocab/SearchBar';
import Filters from '../../components/Vocab/Filters';
import { toast } from 'react-toastify';

const VocabSearchPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [vocabs, setVocabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [topics, setTopics] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    topic: '',
    level: '',
    sortBy: 'newest'
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 1
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVocab, setEditingVocab] = useState(null);

  // Lấy query params từ URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('q') || '';
    const topic = params.get('topic') || '';
    const level = params.get('level') || '';
    const page = params.get('page') || '1';
    
    setSearchQuery(q);
    setFilters({
      topic,
      level,
      sortBy: 'newest'
    });
    setPagination(prev => ({ ...prev, page: parseInt(page) }));
  }, [location.search]);

  useEffect(() => {
    loadTopics();
  }, []);

  useEffect(() => {
    loadVocabs();
  }, [pagination.page, searchQuery, filters]);

  const loadTopics = async () => {
    try {
      const data = await getTopics();
      setTopics(data);
    } catch (error) {
      console.error('Error loading topics:', error);
    }
  };

  const loadVocabs = async () => {
    setLoading(true);
    try {
      let data;
      if (searchQuery) {
        data = await searchVocabs(searchQuery, pagination.page, pagination.limit);
      } else if (filters.topic) {
        data = await getVocabsByTopic(filters.topic, pagination.page, pagination.limit);
      } else {
        data = await getAllVocabs(pagination.page, pagination.limit);
      }
      
      setVocabs(data.items || []);
      setPagination(prev => ({
        ...prev,
        total: data.total || 0,
        totalPages: data.totalPages || 1
      }));
    } catch (error) {
      console.error('Error loading vocabs:', error);
      toast.error('Lỗi khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    setPagination(prev => ({ ...prev, page: 1 }));
    updateURL({ q: query, page: 1 });
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, page: 1 }));
    updateURL({ ...newFilters, page: 1 });
  };

  const updateURL = (params) => {
    const queryParams = new URLSearchParams();
    
    if (params.q) queryParams.set('q', params.q);
    if (params.topic) queryParams.set('topic', params.topic);
    if (params.level) queryParams.set('level', params.level);
    if (params.page && params.page > 1) queryParams.set('page', params.page);
    
    navigate(`/vocab/search?${queryParams.toString()}`, { replace: true });
  };

  const handleCreate = () => {
    setEditingVocab(null);
    setIsModalOpen(true);
  };

  const handleEdit = (vocab) => {
    setEditingVocab(vocab);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa từ vựng này?')) {
      try {
        await deleteVocab(id);
        toast.success('Xóa thành công!');
        loadVocabs();
      } catch (error) {
        toast.error(error.message || 'Xóa thất bại');
      }
    }
  };

  const handleView = (vocab) => {
    navigate(`/vocab/${vocab._id}`);
  };

  const handleSubmit = async (data) => {
    try {
      if (editingVocab) {
        await updateVocab(editingVocab._id, data);
        toast.success('Cập nhật thành công!');
      } else {
        await createVocab(data);
        toast.success('Thêm mới thành công!');
      }
      loadVocabs();
      setIsModalOpen(false);
    } catch (error) {
      toast.error(error.message || 'Lỗi khi lưu dữ liệu');
    }
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
    updateURL({ page: newPage });
  };

  const handleResetFilters = () => {
    setFilters({
      topic: '',
      level: '',
      sortBy: 'newest'
    });
    setSearchQuery('');
    setPagination(prev => ({ ...prev, page: 1 }));
    navigate('/vocab/search');
  };

  const getTopicLabel = (topicValue) => {
    const topic = topics.find(t => t.value === topicValue);
    return topic ? topic.label : topicValue;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <button 
            onClick={() => navigate('/vocab')}
            className="text-blue-500 hover:text-blue-600 mb-4 flex items-center gap-1"
          >
            ← Quay lại trang chủ
          </button>
          <h1 className="text-3xl font-bold text-gray-800">Tìm kiếm từ vựng</h1>
          <p className="text-gray-600 mt-2">Tìm kiếm và quản lý từ vựng</p>
        </div>
        <button 
          onClick={handleCreate}
          className="mt-4 md:mt-0 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2"
        >
          <span>+</span>
          <span>Thêm từ mới</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow p-6 mb-8">
        <div className="mb-6">
          <SearchBar onSearch={handleSearch} initialQuery={searchQuery} />
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <Filters filters={filters} onFilterChange={handleFilterChange} topics={topics} />
          <button 
            onClick={handleResetFilters}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Xóa bộ lọc
          </button>
        </div>

        {/* Search info */}
        {(searchQuery || filters.topic || filters.level) && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              Đang hiển thị kết quả cho: 
              {searchQuery && <span className="font-medium"> "{searchQuery}"</span>}
              {filters.topic && <span className="font-medium ml-2">Chủ đề: {getTopicLabel(filters.topic)}</span>}
              {filters.level && <span className="font-medium ml-2">Trình độ: {filters.level}</span>}
            </p>
          </div>
        )}
      </div>

      {/* Results Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800">
            {searchQuery ? 'Kết quả tìm kiếm' : 'Tất cả từ vựng'}
          </h2>
          {!loading && (
            <p className="text-gray-600 text-sm mt-1">
              Hiển thị {vocabs.length} / {pagination.total} từ vựng
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Sắp xếp:</span>
          <select 
            value={filters.sortBy} 
            onChange={(e) => handleFilterChange({...filters, sortBy: e.target.value})}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
          >
            <option value="newest">Mới nhất</option>
            <option value="oldest">Cũ nhất</option>
            <option value="a-z">A-Z</option>
            <option value="z-a">Z-A</option>
          </select>
        </div>
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
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Không tìm thấy từ vựng</h3>
            <p className="text-gray-500 mb-6">
              {searchQuery 
                ? `Không tìm thấy từ vựng nào cho "${searchQuery}"`
                : 'Chưa có từ vựng nào. Hãy thêm từ mới!'}
            </p>
            <div className="flex gap-3 justify-center">
              <button 
                onClick={handleResetFilters}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Xóa tìm kiếm
              </button>
              <button 
                onClick={handleCreate}
                className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
              >
                Thêm từ mới
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vocabs.map(vocab => (
                <VocabCard
                  key={vocab._id}
                  vocab={vocab}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onView={handleView}
                />
              ))}
            </div>

            {pagination.totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-8 pt-6 border-t">
                <button 
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className={`px-4 py-2 rounded-lg flex items-center gap-1 ${pagination.page === 1 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                  ← Trước
                </button>
                
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    let pageNum;
                    if (pagination.totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (pagination.page <= 3) {
                      pageNum = i + 1;
                    } else if (pagination.page >= pagination.totalPages - 2) {
                      pageNum = pagination.totalPages - 4 + i;
                    } else {
                      pageNum = pagination.page - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-10 h-10 rounded-lg ${pagination.page === pageNum 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <span className="text-gray-600 text-sm">
                  Trang {pagination.page} / {pagination.totalPages}
                </span>

                <button 
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className={`px-4 py-2 rounded-lg flex items-center gap-1 ${pagination.page === pagination.totalPages 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                  Sau →
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal */}
      <VocabModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        initialData={editingVocab}
        mode={editingVocab ? 'edit' : 'create'}
      />
    </div>
  );
};

export default VocabSearchPage;