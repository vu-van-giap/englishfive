import api from "../api/api"

export const getAllUser = () =>{
    try {
        const res = api.get('/users');
        return res
    } catch (error) {
        console.log(error)
    }
}

export const createUser = async ({ username, fullname, password, role }) => {
  try {
    const res = await api.post(`/register`, {
      username,
      fullname,
      password,
      role, 
    });
    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
};

export const updateUser = async (id, data) => {
  try {
    const res = await api.put(`/users/${id}`, data);
    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
};
export const deleteUser = async (id) => {
  try {
    const res = await api.delete(`/users/${id}`);
    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
};