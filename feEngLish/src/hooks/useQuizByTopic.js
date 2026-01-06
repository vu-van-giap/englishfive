import { useEffect, useState } from "react";
import { getQuizByTopic } from "../services/quiz";

export const useQuizByTopic = (topic) => {
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!topic) return;
    getQuizByTopic(topic).then(res => {
      if (res.success) setData(res);
    });
  }, [topic]);

  return data;
};
