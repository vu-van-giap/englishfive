
const CreateWord = () => {
  return (
    <>
      <div className="p-6 bg-white max-w-2xl mx-auto mt-4 rounded-lg shadow-md">
        <form className="space-y-4">
          <h3 className="text-center text-3xl font-semibold mb-6">Create new Word</h3>

          <div>
            <label htmlFor="new_word" className="block font-medium text-gray-700">
              Thêm từ mới
            </label>
            <input
              id="new_word"
              type="text"
              placeholder="Từ mới"
              className="w-full border border-gray-300 rounded-md p-2 mt-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="pronunciation" className="block font-medium text-gray-700">
              Phiên âm
            </label>
            <input
              id="pronunciation"
              type="text"
              placeholder="Phiên âm"
              className="w-full border border-gray-300 rounded-md p-2 mt-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="meaning" className="block font-medium text-gray-700">
              Nghĩa từ mới
            </label>
            <input
              id="meaning"
              type="text"
              placeholder="Nghĩa của từ mới"
              className="w-full border border-gray-300 rounded-md p-2 mt-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="part_of_speech" className="block font-medium text-gray-700">
              Từ loại
            </label>
            <select
              id="part_of_speech"
              className="w-full border border-gray-300 rounded-md p-2 mt-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">-- Chọn từ loại --</option>
              <option value="noun">Danh từ</option>
              <option value="verb">Động từ</option>
              <option value="adjective">Tính từ</option>
              <option value="adverb">Trạng từ</option>
            </select>
          </div>

          <div>
            <label htmlFor="example" className="block font-medium text-gray-700">
              Ví dụ
            </label>
            <input
              id="example"
              type="text"
              placeholder="Ví dụ"
              className="w-full border border-gray-300 rounded-md p-2 mt-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition"
          >
            Add New Word
          </button>
        </form>
      </div>

    </>

  )

}
export default CreateWord;