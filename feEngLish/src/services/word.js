
import api from "../api/api";



export const getAllWord = async () => {
    const res = await api.get("/words")
    return res;
}

export const createWord = async (data) => {
    console.log(data)
    const res = await api.post(
        "/words",
        data,
    );
    return res;
}

export const updateWord = async (idWord, dataWord) => {
    const res = await api.put(
        `/words/${idWord}`,
        dataWord
    );
    return res;
}

export const deleteWord = async (idWord) => {
    const res = await api.delete(
        `/words/${idWord}`);
    return res;
}