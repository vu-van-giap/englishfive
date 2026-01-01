import { useEffect, useState } from "react";
import { getQuizById } from "../services/quiz";

export const useQuizDetail = (id) => {
  const [quiz, setQuiz] = useState(null);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});

  useEffect(() => {
    getQuizById(id).then(res => {
      if (res.success) setQuiz(res.data);
    });
  }, [id]);

  const selectAnswer = (choiceIndex) => {
    setAnswers({ ...answers, [current]: choiceIndex });
  };

  return { quiz, current, setCurrent, answers, selectAnswer };
};
