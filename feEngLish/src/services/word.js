import api from "../api/api";

export const createWord = async (data) => {
    const token = localStorage.getItem("token");
    const res = await api.post(
        "/words",
        data,
        { headers: { Authorization: `Bearer ${token}` } },
    );
    return res;
}