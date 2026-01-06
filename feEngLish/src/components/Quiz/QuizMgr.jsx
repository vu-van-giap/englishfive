import React, { useEffect, useState } from 'react';
import Modal from './Modal';
import QuizForm from './ModalQuiz';
import QuizItem from './QuizItem';
import TopicFilter from './TopicFilter';
import { getAllQuiz, createQuiz, updateQuiz, deleteQuizById } from '../../services/quiz';


export default function QuizList() {
  const [quizzes, setQuizzes] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editQuiz, setEditQuiz] = useState(null);
  const [topicFilter, setTopicFilter] = useState('');

  useEffect(() => {
    fetchQuizzes();
  }, [])

  const fetchQuizzes = async () => {
    const res = await getAllQuiz();
    if (res.success) setQuizzes(res.data);
  };
  
  const handleAddNew = () => {
    setEditQuiz(null);
    setIsModalOpen(true);
  };

  const handleEdit = (quiz) => {
    setEditQuiz(quiz);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleFormSuccess = (newQuiz) => {
    if (editQuiz) {
      setQuizzes(prev => prev.map(q => q._id === newQuiz._id ? newQuiz : q));
    } else {
      setQuizzes(prev => [...prev, newQuiz]);
    }
    setIsModalOpen(false);
  };

  const filteredQuizzes = topicFilter
    ? quizzes.filter(q => q.topic.toLowerCase() === topicFilter.toLowerCase())
    : quizzes;

  return (
    <div>
      <div className='bg-[#f0f9ff] h-[170px] flex items-center justify-center '>
        <h2 className='w-full text-center font-bold text-5xl'>Trang quản lý Quiz</h2>
      </div>
      <div style={{ marginBottom: 20 }}>
        <button className='bg-blue-500 p-2 rounded text-white' onClick={handleAddNew} style={{ marginRight: 10 }}>Tạo Quiz Mới</button>
        <TopicFilter value={topicFilter} onChange={setTopicFilter} />
      </div>
      <div className='max-w-7xl mx-auto grid grid-cols-4 gap-4'>
        {filteredQuizzes.length === 0 ? (
          <p>Không có quiz nào</p>
        ) : (
          filteredQuizzes.map(question => (
            <QuizItem
              key={question._id}
              quiz={question}
              onEdit={() => handleEdit(question)}
              onDelete={() => setQuizzes(prev => prev.filter(item => item._id !== question._id))}
            />
          ))
        )}
      </div>


      <Modal isOpen={isModalOpen} onClose={handleModalClose}>
        <QuizForm quiz={editQuiz} onSuccess={handleFormSuccess} />
      </Modal>
    </div>
  );
}
