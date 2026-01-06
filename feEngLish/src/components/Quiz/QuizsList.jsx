import React, { useEffect, useState } from "react";
import Modal from "./Modal";
import QuizForm from "./ModalQuiz";
import QuizItem from "./QuizItem";
import TopicFilter from "./TopicFilter";
import {
  getAllQuiz,
  createQuiz,
  updateQuiz,
  deleteQuizById
} from '../../services/quiz';

export default function QuizList() {
  const [quizzes, setQuizzes] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editQuiz, setEditQuiz] = useState(null);
  const [topicFilter, setTopicFilter] = useState("");

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    const res = await getAllQuiz();
    if (res?.success) setQuizzes(res.data);
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
    setEditQuiz(null);
  };

  const handleFormSuccess = async (quizData) => {
    if (editQuiz) {
      await updateQuiz(editQuiz._id, quizData);
    } else {
      await createQuiz(quizData);
    }
    setIsModalOpen(false);
    setEditQuiz(null);
    fetchQuizzes();
  };

  const filteredQuizzes = topicFilter
    ? quizzes.filter(q => q.topic === topicFilter)
    : quizzes;

  return (
    <div>
      <div className="bg-[#f0f9ff] h-[170px] flex items-center justify-center">
        <h2 className="text-5xl font-bold">Trang quản lý Quiz</h2>
      </div>

      <div className="flex gap-4 p-4">
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={handleAddNew}
        >
          Tạo Quiz Mới
        </button>

        <TopicFilter value={topicFilter} onChange={setTopicFilter} />
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-4 gap-4">
        {filteredQuizzes.length === 0 ? (
          <p>Không có quiz nào</p>
        ) : (
          filteredQuizzes.map(quiz => (
            <QuizItem
              key={quiz._id}
              quiz={quiz}
              onEdit={() => handleEdit(quiz)}
              onDelete={async () => {
                await deleteQuizById(quiz._id);
                fetchQuizzes();
              }}
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
