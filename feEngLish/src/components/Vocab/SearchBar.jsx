// src/components/Vocab/SearchBar.jsx
import React, { useState } from 'react';

const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(query);
  };

  const handleClear = () => {
    setQuery('');
    onSearch('');
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Tìm kiếm từ vựng, nghĩa hoặc tag..."
          className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
          🔍
        </div>
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        )}
      </div>
      <button
        type="submit"
        className="mt-3 w-full md:w-auto bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium"
      >
        Tìm kiếm
      </button>
    </form>
  );
};

export default SearchBar;