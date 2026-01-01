import { deleteWord, getAllWord, updateWord } from "../services/word";
import styles from "../css/Listword.module.css"
import { useEffect, useState } from "react";
import ModalWord from "./ModalWord";
import { toast } from "react-toastify";
const ListWord = () => {
    const [listword, setListWord] = useState([]);
    const [openModal, setOpenModal] = useState(false);
    const [selectedWord, setSelectedWord] = useState(null);

    useEffect(() => {
        fetchWord();
    }, [])

    const fetchWord = async () => {
        try {
            const res = await getAllWord();
            setListWord(res.data);
        } catch (error) {
            console.log(error)
        }
    }

    const handleUpdate = (word) => {
        try {
            setSelectedWord(word);
            setOpenModal(true);
        } catch (error) {
            toast.warn("Update fail !")
        }
    }

    const handleDelete = async (idWord) => {
        try {
            const res = await deleteWord(idWord);
            toast.success(res.data.message);
            fetchWord();
        } catch (error) {
            console.log(error)
        }
    }
    const handleSubmitUpdate = async (event) => {
        event.preventDefault();

        const formData = Object.fromEntries(new FormData(event.target));
        try {
            const res = await updateWord(selectedWord?._id, formData);
            setOpenModal(false);
            fetchWord();
            toast.success(res.data.message);
        } catch (error) {
            console.log(error);
            toast.error(error)
        }
    }
    return (
        <>
            {listword.map((word, index) => (
                <div key={index} className={styles.container_word}>
                    <div className={styles.new_word}>
                        <div className={styles.content_word}>
                            <span>{word?.type}</span>
                            <h4>{word?.english}</h4>
                            <h5>{word?.vietnamese}</h5>
                            <p>{word?.pronunciation}</p>
                        </div>
                        <p>{word?.example}</p>
                        <div className={styles.action_word}>
                            <button onClick={() => handleUpdate(word)} className={styles.edit}><svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m14.304 4.844 2.852 2.852M7 7H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-4.5m2.409-9.91a2.017 2.017 0 0 1 0 2.853l-6.844 6.844L8 14l.713-3.565 6.844-6.844a2.015 2.015 0 0 1 2.852 0Z" />
                            </svg>
                            </button>
                            <button onClick={() => handleDelete(word?._id)} className={styles.delete}><svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 15v3c0 .5523.44772 1 1 1h16c.5523 0 1-.4477 1-1v-3M3 15V6c0-.55228.44772-1 1-1h16c.5523 0 1 .44772 1 1v9M3 15h18M8 15v4m4-4v4m4-4v4m-5.5061-7.4939L12 10m0 0 1.5061-1.50614M12 10l1.5061 1.5061M12 10l-1.5061-1.50614" />
                            </svg>
                            </button>
                        </div>
                    </div>
                </div>
            ))}

            <ModalWord
                isOpen={openModal}
                word={selectedWord}
                onClose={() => setOpenModal(false)}
                onSubmit={handleSubmitUpdate}
            />
        </>
    )
}

export default ListWord;