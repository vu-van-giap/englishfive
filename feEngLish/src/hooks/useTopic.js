import { useEffect, useState } from "react"
import { getAllQuiz } from "../services/quiz";

export const useTopic = () => {
    const [topics, setTopic] = useState([]);

    useEffect(() => {
        const fetchTopics = async () => {
            try {
                const quizs = await getAllQuiz();
                const map = {};

                quizs.data.forEach(quiz => {
                    const topic = quiz.topic?.trim();
                    if (!topic) return;
                    if (!map[topic]) {
                        map[topic] = {
                            name: topic,
                            image: quiz.topicImage || "",
                            quizCount: 0
                        }
                    }
                    map[topic].quizCount += 1;
                })
                setTopic(Object.values(map));

            } catch (error) {
                console.error("Error fetching topics:", error);
            }
        };
        fetchTopics();
    },[]
    );
    return { topics };
}