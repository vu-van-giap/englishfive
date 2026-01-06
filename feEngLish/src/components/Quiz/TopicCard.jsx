import { Link } from "react-router-dom";

const TopicCard = ({ topic }) => {
    return (
        <>
            <Link to={`/quiz/topic/${topic.name}`}>
                <div
                    className="
                        container_card 
                        w-[200px] 
                        h-[255px] 
                        rounded-lg 
                        text-white 
                        bg-lime-500
                        flex flex-col 
                        items-center 
                        justify-center 
                        cursor-pointer
                        transition-all
                        duration-300
                        ease-in-out
                        hover:-translate-y-2
                        hover:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_10px_10px_-5px_rgba(0,0,0,0.04)]
                    "
                >
                    <img className="w-30 h-30 rounded-full" src={topic.image} alt="" />
                    <h4 className="my-1.5 text-2xl">{topic.name}</h4>
                    <p>{topic.quizCount} questions</p>
                </div>
            </Link>
        </>
    );
}
export default TopicCard;