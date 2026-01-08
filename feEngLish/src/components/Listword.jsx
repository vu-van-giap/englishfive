import { deleteWord, getAllWord, updateWord } from "../services/word";
import styles from "../css/Listword.module.css";
import { useEffect, useState } from "react";
import ModalWord from "./ModalWord";
import { toast } from "react-toastify";
import { RssIcon } from "@heroicons/react/16/solid";

const ListWord = () => {
  const [listword, setListWord] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedWord, setSelectedWord] = useState(null);

  useEffect(() => {
    fetchWord();
  }, []);

  const fetchWord = async () => {
    try {
      const res = await getAllWord();
      setListWord(res.data || []);
    } catch (error) {
      toast.error("Failed to load words");
      console.error(error);
    }
  };

  const handleUpdate = (word) => {
    setSelectedWord(word);
    setOpenModal(true);
  };

  const handleDelete = async (idWord) => {
    if (!window.confirm("Delete this word?")) return;

    try {
      const res = await deleteWord(idWord);
      toast.success(res.data.message || "Deleted successfully");
      fetchWord();
    } catch (error) {
      toast.error("Delete failed");
      console.error(error);
    }
  };

  const handleSubmitUpdate = async (event) => {
    event.preventDefault();

    const formData = Object.fromEntries(new FormData(event.target));

    try {
      const res = await updateWord(selectedWord?._id, formData);
      toast.success(res.data.message || "Updated successfully");
      setOpenModal(false);
      setSelectedWord(null);
      fetchWord();
    } catch (error) {
      toast.error("Update failed");
      console.error(error);
    }
  };

  return (
    <>
      {listword.map((word) => (
        <div key={word._id} className={styles.container_word}>
          <div className={styles.new_word}>
            <div className={styles.content_word}>
              <span>{word?.type}</span>
              <h4>{word?.english}</h4>
              <h5>{word?.vietnamese}</h5>
              <p>{word?.pronunciation}</p>
            </div>

            <p>{word?.example}</p>

            <div className={styles.action_word}>
              {/* Edit */}
              <button
                onClick={() => handleUpdate(word)}
                className={styles.edit}
                title="Edit"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="m14.304 4.844 2.852 2.852M7 7H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-4.5m2.409-9.91a2.017 2.017 0 0 1 0 2.853l-6.844 6.844L8 14l.713-3.565 6.844-6.844a2.015 2.015 0 0 1 2.852 0Z"
                  />
                </svg>
              </button>

              {/* Delete */}
              <button
                onClick={() => handleDelete(word._id)}
                className={styles.delete}
                title="Delete"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 15v3c0 .552.448 1 1 1h16c.552 0 1-.448 1-1v-3M3 15V6c0-.552.448-1 1-1h16c.552 0 1 .448 1 1v9M3 15h18M8 15v4m4-4v4m4-4v4"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      ))}

      <ModalWord
        isOpen={openModal}
        word={selectedWord}
        onClose={() => {
          setOpenModal(false);
          setSelectedWord(null);
        }}
        onSubmit={handleSubmitUpdate}
      />
    </>
  );
};

export default ListWord;
