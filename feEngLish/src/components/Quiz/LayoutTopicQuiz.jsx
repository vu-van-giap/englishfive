import { useTopic } from "../../hooks/useTopic";
import TopicCard from "./TopicCard";
const LayoutTopicQuiz = ({onSelect}) => {
    const {topics} = useTopic();
    return (
        <>
            <div className="bg-[#f0f9ff]">
                <div className="max-w-7xl mx-auto ">
                    <div className="header_quiz py-10">
                        <h1 className="text-5xl font-semibold text-center">Chọn chủ đề bạn muốn học</h1>
                        <p className="text-2xl text-center mt-3">Chọn một chủ đề để bắt đầu hành trình quiz của bạn</p>
                    </div>
                    <div className="grid grid-cols-4 gap-4">
                        {
                            topics.map((topic, index) => (
                                <TopicCard key={index} topic= {topic} />
                            ))
                        }
                    </div>
                </div>
            </div>
        </>
    );
}

export default LayoutTopicQuiz;