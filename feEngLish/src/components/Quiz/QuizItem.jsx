import React from 'react';

export default function QuizItem({ quiz, onEdit, onDelete }) {
  return (
    <div style={{ border: '1px solid #ccc', padding: 10, marginBottom: 10, position: 'relative', height: "245px" }}>
      <h3 className='text-center text-2xl'>{quiz.title}</h3>
      <p>Topic: {quiz.topic}</p>
      {quiz.topicImage && <img src={quiz.topicImage} alt={quiz.topic} width={150} />}
      <p>Số câu hỏi: {quiz.questions.length}</p>
      <div className='absolute bottom-2'>
      <button className='px-2 bg-blue-500 text-white rounded' onClick={onEdit} style={{ marginRight: 5 }}>Sửa</button>
      <button className='px-2 bg-red-500 text-white rounded' onClick={onDelete}>Xóa</button>
      </div>
    </div>
  );
}
