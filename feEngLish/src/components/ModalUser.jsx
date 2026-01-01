import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { updateUser, createUser } from "../services/user";

const ModalUser = ({ isOpen, onClose, user, mode, onSuccess }) => {
  const [formData, setFormData] = useState({
    username: "",
    fullname: "",
    role: "user",
    password: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen && user && mode === "update") {
      setFormData({
        username: user.username || "",
        fullname: user.fullname || "",
        role: user.role || "user",
        password: "",
      });
    }

    if (isOpen && mode === "add") {
      setFormData({
        username: "",
        fullname: "",
        role: "user",
        password: "",
      });
      setErrors({});
    }
  }, [user, mode, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.username.trim())
      newErrors.username = "Username không được để trống";

    if (!formData.fullname.trim())
      newErrors.fullname = "Full name không được để trống";

    if (mode === "add") {
      if (!formData.password)
        newErrors.password = "Password không được để trống";
      else if (formData.password.length < 6)
        newErrors.password = "Password phải ít nhất 6 ký tự";

      if (!formData.role)
        newErrors.role = "Vui lòng chọn role";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      toast.warning("Vui lòng kiểm tra lại form");
      return;
    }

    try {
      if (mode === "add") {
        await createUser(formData);
        toast.success("Thêm user thành công");
      } else {
        await updateUser(user._id, {
          username: formData.username,
          fullname: formData.fullname,
        });
        toast.success("Cập nhật user thành công");
      }

      onSuccess();
      onClose();
    } catch (error) {
      toast.error("Có lỗi xảy ra");
      console.error(error);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50">
      <div className="bg-white p-6 rounded w-[400px]">
        <h3 className="text-lg font-bold mb-4">
          {mode === "add" ? "Thêm User" : "Cập nhật User"}
        </h3>

        <form onSubmit={handleSubmit} className="grid gap-3">
          <div>
            <input
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Username"
              className="w-full border px-2 py-1 rounded"
            />
            {errors.username && (
              <span className="text-red-500 text-sm">
                {errors.username}
              </span>
            )}
          </div>

          <div>
            <input
              name="fullname"
              value={formData.fullname}
              onChange={handleChange}
              placeholder="Full name"
              className="w-full border px-2 py-1 rounded"
            />
            {errors.fullname && (
              <span className="text-red-500 text-sm">
                {errors.fullname}
              </span>
            )}
          </div>

          {mode === "add" && (
            <>
              <div>
                <input
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Password"
                  className="w-full border px-2 py-1 rounded"
                />
                {errors.password && (
                  <span className="text-red-500 text-sm">
                    {errors.password}
                  </span>
                )}
              </div>

              <div>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full border px-2 py-1 rounded"
                >
                  <option value="">Chọn role</option>
                  <option value="admin">Admin</option>
                  <option value="user">User</option>
                </select>
                {errors.role && (
                  <span className="text-red-500 text-sm">
                    {errors.role}
                  </span>
                )}
              </div>
            </>
          )}

          <div className="flex justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded"
            >
              Hủy
            </button>

            <button
              type="submit"
              className="bg-green-500 text-white px-4 py-2 rounded"
            >
              Lưu
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalUser;