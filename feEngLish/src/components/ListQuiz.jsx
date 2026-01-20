import { useTopic } from "../hooks/useTopic";
import TopicCard from "./Quiz/TopicCard";
const ListQuiz = ({ onSelect }) => {
  const { topics } = useTopic();
  return (
    <>
      <div className="max-w-7xl mx-auto ">
        <h2 className="text-2xl font-bold text-gray-900 mb-[24px]">
          Chủ đề Quiz
        </h2>
        <div className="grid grid-cols-5 gap-6 ">
          {topics.slice(0, 5).map((topic, index) => (
            <TopicCard key={index} topic={topic} />
          ))}
        </div>
      </div>
    </>
  );
};

export default ListQuiz;
