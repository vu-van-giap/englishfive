import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../css/auth.css";

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullname: "",
    username: "",
    password: ""
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("http://localhost:3000/auth/register", {
        method: 'POST',                   // Phương thức HTTP
        headers: {
          'Content-Type': 'application/json',      // Định dạng dữ liệu gửi đi
        },
        body: JSON.stringify({                    // Chuyển object thành JSON string
          username: formData.username,
          fullname: formData.fullname,
          password: formData.password
        })
      });

      if (!response.ok) {                             // Kiểm tra status code
        const data = await response.json();              // Đọc body của response
        throw new Error(data.message || "Đăng ký thất bại");
      }
      
      // Redirect to login after successful registration
      navigate("/login");
    } catch (err) {
      setError(err.message || "Đăng ký thất bại");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <h1 className="text-3xl font-semibold text-center text-blue-600">Sign up</h1>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="fullname" className="block text-sm font-medium text-gray-700 mb-1">
              Full name:
            </label>
            <input
              type="text"
              name="fullname"
              id="fullname"
              value={formData.fullname}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Username:
            </label>
            <input
              type="text"
              name="username"
              id="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password:
            </label>
            <input
              type="password"
              name="password"
              id="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 mt-4 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 transition duration-200"
          >
            Register
          </button>

          <div className="text-center mt-4">
            <Link to="/login" className="text-blue-500 hover:underline">
              ← Back to Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
