import { useLocation, useNavigate, useParams } from "react-router-dom";
import { calculateResult } from "../hooks/calculateResult";

const QuizResultPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();

  if (!state) {
    return <p className="text-center mt-10">No result data</p>;
  }

  const { quiz, answers } = state;
  const result = calculateResult(quiz, answers);

  return (
    <div className="max-w-4xl mx-auto py-10">
      <h1 className="text-4xl font-bold text-center mb-6">
        Quiz Result 🎉
      </h1>

      {/* Tổng quan */}
      <div className="bg-green-100 rounded-lg p-6 mb-8 text-center">
        <p className="text-xl">
          Correct: <b>{result.correct}</b> / {result.total}
        </p>
        <p className="text-lg text-red-600">
          Wrong: {result.wrong}
        </p>
      </div>

      {/* Chi tiết từng câu */}
      <div className="space-y-6">
        {result.details.map((item, idx) => (
          <div
            key={idx}
            className={`border rounded-lg p-5 ${
              item.isCorrect ? "border-green-400" : "border-red-400"
            }`}
          >
            <h3 className="font-semibold mb-3">
              Question {idx + 1}: {item.question}
            </h3>

            <div className="space-y-2">
              {item.choices.map((c, i) => {
                let className = "border p-3 rounded";

                if (i === item.correctIndex) {
                  className += " bg-green-200 border-green-500";
                } else if (i === item.chosenIndex) {
                  className += " bg-red-200 border-red-500";
                }

                return (
                  <div key={i} className={className}>
                    {c.text}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Action */}
      <div className="flex justify-center gap-4 mt-10">
        <button
          onClick={() => navigate(`/quiz/${id}`)}
          className="px-6 py-3 bg-blue-500 text-white rounded"
        >
          Try Again
        </button>

        <button
          onClick={() => navigate(`/quiz/topic/${quiz.topic}`)}
          className="px-6 py-3 bg-gray-500 text-white rounded"
        >
          Back to Topic
        </button>
      </div>
    </div>
  );
};

export default QuizResultPage;
