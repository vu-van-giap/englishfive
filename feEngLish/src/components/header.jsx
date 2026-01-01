import { Link, useNavigate } from "react-router-dom";
import { logout } from "../services/auth";
import { toast } from "react-toastify";
import { useState } from "react";
import logo from "../img/english FIVE.png";

export default function Header() {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const [openMenu, setOpenMenu] = useState(false);

  const handleLogout = async () => {
    try {
      const res = await logout();
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      toast.success(res.data.message || "Logout successful");
      navigate("/login");
    } catch (error) {
      toast.error("Logout failed");
      console.error(error);
    }
  };

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-blue-400">
      <nav className="flex items-center justify-between p-6 lg:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <img src={logo} alt="English Five" className="h-8 w-auto" />
        </Link>

        {/* Mobile button */}
        <button
          onClick={() => setOpenMenu(true)}
          className="lg:hidden text-gray-800"
        >
          ☰
        </button>

        {/* Desktop menu */}
        <div className="hidden lg:flex gap-x-8">
          <Link to="/" className="font-semibold text-gray-900">
            Trang chủ
          </Link>
          <Link to="/createword" className="font-semibold text-gray-900">
            FlashCard
          </Link>
          <Link to="/xemfl" className="font-semibold text-gray-900">
            Thẻ lật
          </Link>
          <Link to="/quiz_topic" className="font-semibold text-gray-900">
            Quiz
          </Link>
          <Link to="/vocab" className="font-semibold text-gray-900">
            Vocab
          </Link>
          <Link to="/show_user" className="font-semibold text-gray-900">
            Audio
          </Link>
        </div>

        {/* Auth */}
        <div className="hidden lg:block">
          {token ? (
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-3 py-1 rounded"
            >
              Log out
            </button>
          ) : (
            <Link
              to="/login"
              className="bg-blue-500 text-white px-3 py-1 rounded"
            >
              Log in
            </Link>
          )}
        </div>
      </nav>

      {/* Mobile menu */}
      {openMenu && (
        <div className="lg:hidden fixed inset-0 bg-black/40 z-50">
          <div className="absolute right-0 top-0 w-64 h-full bg-white p-6">
            <button
              onClick={() => setOpenMenu(false)}
              className="mb-6 text-gray-700"
            >
              ✕
            </button>

            <div className="flex flex-col gap-4">
              <Link to="/" onClick={() => setOpenMenu(false)}>
                Trang chủ
              </Link>
              <Link to="/createword" onClick={() => setOpenMenu(false)}>
                FlashCard
              </Link>
              <Link to="/xemfl" onClick={() => setOpenMenu(false)}>
                Thẻ lật
              </Link>
              <Link to="/quiz_topic" onClick={() => setOpenMenu(false)}>
                Quiz
              </Link>
              <Link to="/vocab" onClick={() => setOpenMenu(false)}>
                Vocab
              </Link>
              <Link to="/show_user" onClick={() => setOpenMenu(false)}>
                Audio
              </Link>

              {token ? (
                <button
                  onClick={handleLogout}
                  className="bg-red-500 text-white px-3 py-1 rounded mt-4"
                >
                  Log out
                </button>
              ) : (
                <Link
                  to="/login"
                  className="bg-blue-500 text-white px-3 py-1 rounded mt-4"
                >
                  Log in
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
