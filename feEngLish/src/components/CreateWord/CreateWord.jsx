import { useState } from "react";
import { createWord } from "../../services/word";
import { toast } from "react-toastify";

const CreateWord = () => {
  const [english, setEnglish] = useState("");
  const [vietnamese, setVietnamese] = useState("");
  const [type, setType] = useState("");
  const [pronunciation, setPronunciation] = useState("");
  const [example, setExample] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log({ english, vietnamese, type, pronunciation, example });
      const res = await createWord({ english, vietnamese, type, pronunciation, example });
      toast.success(res.data.message);

      // Reset form
      setEnglish("");
      setVietnamese("");
      setType("");
      setPronunciation("");
      setExample("");
    } catch (error) {
      toast.error("Failed to create word");
    }

  }
  return (
    <>
      <div className="h-screen">
        <div className="p-6 bg-white max-w-2xl mx-auto mt-24 rounded-lg shadow-md">
          <form className="space-y-4" onSubmit={handleSubmit} >
            <h3 className="text-center text-3xl font-semibold mb-6">Create new Word</h3>

            <div>
              <label htmlFor="new_word" className="block font-medium text-gray-700">
                Thêm từ mới.
              </label>
              <input
                id="new_word"
                type="text"
                value={english}
                onChange={event => setEnglish(event.target.value)}
                placeholder="Từ mới"
                required
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
                value={vietnamese}
                onChange={event => setVietnamese(event.target.value)}
                placeholder="Nghĩa của từ mới"
                required
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
                value={pronunciation}
                onChange={event => setPronunciation(event.target.value)}
                placeholder="Phiên âm"
                required
                className="w-full border border-gray-300 rounded-md p-2 mt-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="part_of_speech" className="block font-medium text-gray-700">
                Từ loại
              </label>
              <select
                id="part_of_speech"
                value={type}
                onChange={event => setType(event.target.value)}
                required
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
                value={example}
                onChange={event => setExample(event.target.value)}
                placeholder="Ví dụ"
                required
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
      </div>

    </>
  )

}
export default CreateWord;