import api from "../api/api";


export const login = async (data) =>{
    const res = await api.post("/auth/login", data);
    return res;
}

export const logout =()=>{
    const res = api.post("/auth/logout");
    return res
}