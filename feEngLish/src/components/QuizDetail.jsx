import { useParams, useNavigate } from "react-router-dom";
import { useQuizDetail } from "../hooks/useQuizDetail";

const QuizDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    quiz,
    current,
    setCurrent,
    answers,
    selectAnswer
  } = useQuizDetail(id);

  if (!quiz) return <p>Loading...</p>;

  const question = quiz.questions[current];

  const nextQuestion = () => {
    if (current < quiz.questions.length - 1) {
      setCurrent(current + 1);
    } else {
      navigate(`/quiz/${id}/result`, {
        state: { quiz, answers }
      });
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-10">
      <h2 className="text-xl mb-2">
        Question {current + 1}/{quiz.questions.length}
      </h2>

      <h3 className="text-2xl mb-6">{question.prompt}</h3>

      <div className="space-y-3">
        {question.choices.map((c, i) => (
          <button
            key={i}
            onClick={() => selectAnswer(i)}
            className={`w-full p-4 rounded border text-left
              ${answers[current] === i ? "bg-blue-500 text-white" : ""}`}
          >
            {c.text}
          </button>
        ))}
      </div>

      <button
        onClick={nextQuestion}
        className="mt-6 px-6 py-3 bg-green-500 text-white rounded"
      >
        {current === quiz.questions.length - 1 ? "Finish" : "Next"}
      </button>
    </div>
  );
};

export default QuizDetailPage;
