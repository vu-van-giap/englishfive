import TopicSelection from "./TopicSelection";
import ListVoCab from "./ListVocab";
import ListQuiz from "./ListQuiz";
export default function Content() {
  return (
    <>
      <div className="bg-red-50 p-4 md:p-6">
        <ListVoCab></ListVoCab>
        <TopicSelection></TopicSelection>
        <ListQuiz></ListQuiz>
      </div>
    </>
  );
}
