import { useParams, Link } from "react-router-dom";
import { useQuizByTopic } from "../../hooks/useQuizByTopic";

const QuizListPage = () => {
  const { topic } = useParams();
  const data = useQuizByTopic(topic);

  if (!data) return <p>Loading...</p>;

  return (
    <div className="max-w-7xl mx-auto py-10">
      <h1 className="text-4xl font-bold mb-6">{data.topic}</h1>

      <div className="grid grid-cols-3 gap-6">
        {data.quizzes.map(quiz => (
          <Link key={quiz._id} to={`/quiz/${quiz._id}`}>
            <div className="border rounded-lg p-4 hover:shadow-lg transition">
              <img
                src={quiz.topicImage}
                className="w-full h-40 object-cover rounded"
                alt=""
              />
              <h3 className="text-xl mt-3 font-semibold">{quiz.title}</h3>
              <p className="text-gray-600">
                {quiz.questions.length} questions
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default QuizListPage;
