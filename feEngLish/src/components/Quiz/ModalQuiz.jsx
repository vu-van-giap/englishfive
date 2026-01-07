import React, { useState } from "react";

export const TOPIC_KEYS = [
  "Family",
  "Food and Drinks",
  "Animals",
  "Colors",
  "Daily Routines",
  "Weather",
  "Jobs",
  "Travel",
  "Sports",
  "Body Parts",
];

export default function QuizForm({ quiz, onSuccess }) {
  const [title, setTitle] = useState(quiz?.title || "");
  const [topic, setTopic] = useState(quiz?.topic || "");
  const [questions, setQuestions] = useState(
    quiz?.questions || [
      {
        prompt: "",
        choices: [
          { text: "", isCorrect: true },
          { text: "", isCorrect: false },
        ],
      },
    ]
  );

  const addQuestion = () => {
    setQuestions(prev => [
      ...prev,
      {
        prompt: "",
        choices: [
          { text: "", isCorrect: true },
          { text: "", isCorrect: false },
        ],
      },
    ]);
  };

  const updatePrompt = (qi, value) => {
    const copy = [...questions];
    copy[qi].prompt = value;
    setQuestions(copy);
  };

  const updateChoiceText = (qi, ci, value) => {
    const copy = [...questions];
    copy[qi].choices[ci].text = value;
    setQuestions(copy);
  };

  const setCorrectChoice = (qi, ci) => {
    const copy = [...questions];
    copy[qi].choices = copy[qi].choices.map((c, i) => ({
      ...c,
      isCorrect: i === ci,
    }));
    setQuestions(copy);
  };

  const addChoice = (qi) => {
    const copy = [...questions];
    copy[qi].choices.push({ text: "", isCorrect: false });
    setQuestions(copy);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    onSuccess({
      title,
      topic,
      questions,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3 className="text-2xl font-bold text-center mb-4">
        {quiz ? "Cập nhật Quiz" : "Tạo Quiz Mới"}
      </h3>

      <input
        className="w-full border p-2 mb-3"
        placeholder="Title"
        value={title}
        onChange={e => setTitle(e.target.value)}
      />

      <select
        className="w-full border p-2 mb-4"
        value={topic}
        onChange={e => setTopic(e.target.value)}
      >
        <option value="">-- Chọn topic --</option>
        {TOPIC_KEYS.map(t => (
          <option key={t} value={t}>{t}</option>
        ))}
      </select>

      {questions.map((q, qi) => (
        <div key={qi} className="border p-3 mb-4">
          <input
            className="w-full border p-2 mb-2"
            placeholder="Câu hỏi"
            value={q.prompt}
            onChange={e => updatePrompt(qi, e.target.value)}
          />

          {q.choices.map((c, ci) => (
            <div key={ci} className="flex items-center mb-2">
              <input
                type="radio"
                checked={c.isCorrect}
                onChange={() => setCorrectChoice(qi, ci)}
              />
              <input
                className="ml-2 border p-1 flex-1"
                placeholder={`Đáp án ${ci + 1}`}
                value={c.text}
                onChange={e => updateChoiceText(qi, ci, e.target.value)}
              />
            </div>
          ))}

          <button
            type="button"
            className="bg-green-500 text-white px-3 py-1 rounded"
            onClick={() => addChoice(qi)}
          >
            Thêm đáp án
          </button>
        </div>
      ))}

      <div className="flex justify-between">
        <button
          type="button"
          onClick={addQuestion}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Thêm câu hỏi
        </button>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          {quiz ? "Cập nhật" : "Tạo mới"}
        </button>
      </div>
    </form>
  );
}
