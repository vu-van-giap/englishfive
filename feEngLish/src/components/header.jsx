import { Link } from "react-router-dom";
import { logout } from "../services/auth";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export default function Header() {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const navigate = useNavigate();
  const handleLogout = async () => {
    try {
      const res = await logout();
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      toast.success(res.data.message);
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };
  return (
    <>
      <div className="bg-white">
        {/* background header */}
        <header className="absolute inset-x-0 top-0 z-50 bg-blue-400">
          <nav
            aria-label="Global"
            className="flex items-center justify-between p-6 lg:px-8"
          >
            {/* img */}
            <div className="flex lg:flex-1">
              <Link to="/" className="-m-1.5 p-1.5">
                <img
                  src="../src/img/english FIVE.png"
                  alt=""
                  className="h-8 w-auto"
                />
              </Link>
            </div>

            <div className="hidden lg:flex lg:gap-x-12 menu">
              <Link
                to="/"
                className="text-sm/6 font-semibold text-gray-900 mr-5 aa"
              >
                Home
              </Link>
              <Link
                to="/xemfl"
                className="text-sm/6 font-semibold text-gray-900 mr-5 aa"
              >
                Flashcard
              </Link>
              <Link
                to="/quiz_topic"
                className="text-sm/6 font-semibold text-gray-900 mr-5 aa"
              >
                Quiz
              </Link>

              {role === "admin" ? (
                <Link
                  to="/quiz_manager"
                  className="text-sm/6 font-semibold text-gray-900 mr-5 aa"
                >
                  Manager Quiz
                </Link>
              ) : null}
              <Link
                to="/vocab"
                className="text-sm/6 font-semibold text-gray-900 mr-5 aa"
              >
                Vocab
              </Link>
              <Link
                to="/listening"
                className="text-sm/6 font-semibold text-gray-900 mr-5 aa"
              >
                Listening
              </Link>
              {role === "admin" ? (
                <Link
                  to="/show_user"
                  className="text-sm/6 font-semibold text-gray-900 mr-5 aa"
                >
                  Manager User
                </Link>
              ) : null}
            </div>
            {/*  */}
            <div className="hidden lg:flex lg:flex-1 justify-content-center ml-5 ">
              {token ? (
                <button
                  onClick={handleLogout}
                  className="text-sm/6 font-semibold text-gray-900 bg-red-500 border p-1 rounded"
                >
                  Log out
                </button>
              ) : (
                <Link
                  to="/login"
                  className="text-sm/6 font-semibold text-gray-900 bg-blue-500 border p-1 rounded"
                >
                  Log in
                </Link>
              )}
            </div>
            {/* doi theme */}
          </nav>
        </header>
      </div>
    </>
  );
}
