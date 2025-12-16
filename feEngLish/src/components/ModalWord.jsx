const ModalWord = ({ isOpen, onClose, word, onSubmit }) => {
  if (!isOpen || !word) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-base w-full max-w-md p-6">
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-4">
          <h3 className="text-lg font-medium">Update Word</h3>
          <button onClick={onClose}>✕</button>
        </div>

        {/* Body */}
        <form
          className="grid gap-4 mt-4"
          onSubmit={onSubmit}
        >
          <input name="english" defaultValue={word.english} placeholder="English" />
          <input name="vietnamese" defaultValue={word.vietnamese} placeholder="Vietnamese" />
          <input name="type" defaultValue={word.type} placeholder="Type (noun, verb...)" />
          <input name="pronunciation" defaultValue={word.pronunciation} placeholder="Pronunciation" />
          <textarea name="example" defaultValue={word.example} placeholder="Example" />

          {/* Footer */}
          <div className="flex justify-end gap-3 border-t pt-4">
            <button type="button" onClick={onClose}>Cancel</button>
            <button type="submit" className="bg-brand text-white px-4 py-2 rounded-base">
              Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalWord;
