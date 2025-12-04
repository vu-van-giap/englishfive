import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../../services/auth";
import { toast } from "react-toastify";

const Login = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const res = await login({ username, password });

            localStorage.setItem("token", res.data.token);
            localStorage.setItem("role", res.data.role);
            toast.success("Đăng nhập thành công");
            navigate("/");
        } catch (err) {
            toast.error(err.response?.data?.message || "Đăng nhập thất bại");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <h1 className="text-3xl font-semibold text-center text-blue-600">Login</h1>

                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                            Username
                        </label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter your username"
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full py-2 mt-2 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 transition duration-200"
                    >
                        Login
                    </button>

                    <div className="text-center space-y-2">
                        {/* <Link className="text-blue-500 hover:underline block" to="#">
                            Forgotten password?
                        </Link> */}
                        <span className="text-gray-500">Don't have an account?</span>
                        <Link className="text-blue-500 hover:underline block" to="/register">
                            Create an account
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
