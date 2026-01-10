import { useState, useEffect } from "react";
import VocabCard from "./VocabCard";

export default function VocabList({ topic, onEdit }) {
  const [vocabs, setVocabs] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const mockData = [
      { _id: "1", word: "Hello", meaning: "Xin chào", examples: ["Hello world!"], topic },
      { _id: "2", word: "Food", meaning: "Thức ăn", examples: ["I love food"], topic }
    ];
    setVocabs(mockData);
    setTotal(mockData.length);
  }, [topic]);

  const handlePrev = () => setPage((p) => Math.max(1, p - 1));
  const handleNext = () => setPage((p) => p + 1);

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {vocabs.map((vocab) => (
          <VocabCard key={vocab._id} vocab={vocab} onEdit={() => onEdit(vocab)} />
        ))}
      </div>

      <div className="flex justify-between mt-4">
        <button
          onClick={handlePrev}
          disabled={page === 1}
          className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
        >
          Previous
        </button>
        <span>Page {page}</span>
        <button
          onClick={handleNext}
          className="px-3 py-1 bg-gray-300 rounded"
        >
          Next
        </button>
      </div>
    </div>
  );
}
