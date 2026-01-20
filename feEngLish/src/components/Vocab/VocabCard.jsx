import React from "react";

const VocabCard = ({ vocab, onEdit, onDelete, onView }) => {
  const getLevelColor = (level) => {
    const colors = {
      A1: "bg-green-100 text-green-800",
      A2: "bg-blue-100 text-blue-800",
      B1: "bg-yellow-100 text-yellow-800",
      B2: "bg-orange-100 text-orange-800",
      C1: "bg-red-100 text-red-800",
      C2: "bg-purple-100 text-purple-800",
      other: "bg-gray-100 text-gray-800",
    };
    return colors[level] || colors.other;
  };
  const role = localStorage.getItem("role");
  console.log(role);
  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-800">{vocab.word}</h3>
            <p className="text-gray-500 italic">{vocab.pronunciation}</p>
          </div>
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(vocab.level)}`}
          >
            {vocab.level}
          </span>
        </div>

        <p className="text-lg text-gray-700 mb-2">{vocab.meaning}</p>

        {vocab.partOfSpeech && (
          <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 rounded text-sm">
            {vocab.partOfSpeech}
          </span>
        )}
      </div>

      {vocab.examples && vocab.examples.length > 0 && (
        <div className="px-4 pb-3">
          <h4 className="text-sm font-semibold text-gray-600 mb-1">Ví dụ:</h4>
          <ul className="space-y-1">
            {vocab.examples.slice(0, 2).map((example, index) => (
              <li key={index} className="text-sm text-gray-600 italic">
                "{example}"
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="px-4 pb-4 pt-2 bg-gray-50">
        <div className="flex flex-wrap gap-1 mb-3">
          {vocab.tags &&
            vocab.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-blue-50 text-blue-600 rounded-full text-xs"
              >
                #{tag}
              </span>
            ))}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onView && onView(vocab)}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
          >
            Xem
          </button>

          {role === "admin" ? (
            <>
              <button
                onClick={() => onEdit && onEdit(vocab)}
                className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
              >
                Sửa
              </button>

              <button
                onClick={() => onDelete && onDelete(vocab._id)}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
              >
                Xóa
              </button>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default VocabCard;
