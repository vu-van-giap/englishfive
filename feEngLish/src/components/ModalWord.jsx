const ModalWord = ({ isOpen, onClose, word, onSubmit }) => {
  if (!isOpen || !word) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-4">
          <h3 className="text-lg font-semibold">Update Word</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-black"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <form className="grid gap-4 mt-4" onSubmit={onSubmit}>
          <input
            name="english"
            defaultValue={word.english}
            placeholder="English"
            className="border px-3 py-2 rounded"
          />

          <input
            name="vietnamese"
            defaultValue={word.vietnamese}
            placeholder="Vietnamese"
            className="border px-3 py-2 rounded"
          />

          <input
            name="type"
            defaultValue={word.type}
            placeholder="Type (noun, verb...)"
            className="border px-3 py-2 rounded"
          />

          <input
            name="pronunciation"
            defaultValue={word.pronunciation}
            placeholder="Pronunciation"
            className="border px-3 py-2 rounded"
          />

          <textarea
            name="example"
            defaultValue={word.example}
            placeholder="Example"
            className="border px-3 py-2 rounded resize-none"
            rows={3}
          />

          {/* Footer */}
          <div className="flex justify-end gap-3 border-t pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="bg-green-500 text-white px-4 py-2 rounded"
            >
              Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalWord;
