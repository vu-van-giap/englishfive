import { Link } from "react-router-dom";
import { logout } from "../services/auth";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export default function Header() {
  const token = localStorage.getItem("token");
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
                <span className="sr-only">Your Company</span>
                <img
                  src="../src/img/english FIVE.png"
                  alt=""
                  className="h-8 w-auto"
                />
              </Link>
            </div>
            <div className="flex lg:hidden">
              <button
                type="button"
                command="show-modal"
                commandfor="mobile-menu"
                className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
              >
                <span className="sr-only">Open main menu</span>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  aria-hidden="true"
                  className="size-6"
                >
                  <path
                    d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
            <div className="hidden lg:flex lg:gap-x-12 menu">
              <Link
                to="/"
                className="text-sm/6 font-semibold text-gray-900 mr-5 aa"
              >
                Trang chủ
              </Link>
              <Link
                to="/createword"
                className="text-sm/6 font-semibold text-gray-900 mr-5 aa"
              >
                FlashCard
              </Link>
              <Link
                to="/xemfl"
                className="text-sm/6 font-semibold text-gray-900 mr-5 aa"
              >
                Thẻ lật
              </Link>

              {/* <a
                href="/show_word"
                className="text-sm/6 font-semibold text-gray-900 mr-5 aa"
              >
                Quiz
              </a> */}
              <a
                href="/quiz_topic"
                className="text-sm/6 font-semibold text-gray-900 mr-5 aa"
              >
                Quiz
              </a>

              <a
                href="/quiz_manager"
                className="text-sm/6 font-semibold text-gray-900 mr-5 aa"
              >
                Manager Quiz
              </a>

              <a
                href="/vocab"
                className="text-sm/6 font-semibold text-gray-900 mr-5 aa"
              >
                Vocab
              </a>
              <a
                href="/listening"
                className="text-sm/6 font-semibold text-gray-900 mr-5 aa"
              >
                 Listening
              </a>
              
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

          <el-dialog>
            <dialog
              id="mobile-menu"
              className="backdrop:bg-transparent lg:hidden"
            >
              <div tabIndex={0} className="fixed inset-0 focus:outline-none">
                <el-dialog-panel className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white p-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
                  <div className="flex items-center justify-between">
                    <a href="#" className="-m-1.5 p-1.5">
                      <span className="sr-only">Your Company</span>
                      <img
                        src="../src/img/english FIVE.png"
                        alt=""
                        className="h-8 w-auto"
                      />
                    </a>
                    <button
                      type="button"
                      command="close"
                      commandfor="mobile-menu"
                      className="-m-2.5 rounded-md p-2.5 text-gray-700"
                    >
                      <span className="sr-only">Close menu</span>
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={1.5}
                        aria-hidden="true"
                        className="size-6"
                      >
                        <path
                          d="M6 18 18 6M6 6l12 12"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  </div>
                  <div className="mt-6 flow-root">
                    <div className="-my-6 divide-y divide-gray-500/10">
                      <div className="space-y-2 py-6">
                        <Link
                          to="/"
                          className="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-gray-900 hover:bg-gray-50"
                        >
                          Home
                        </Link>
                        <Link
                          to="/createword"
                          className="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-gray-900 hover:bg-gray-50"
                        >
                          FlashCard
                        </Link>
                        <a
                          href="#"
                          className="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-gray-900 hover:bg-gray-50"
                        >
                          Quiz
                        </a>
                        <a
                          href="/show_user"
                          className="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-gray-900 hover:bg-gray-50"
                        >
                          Audio
                        </a>
                        
                      </div>
                      <div className="py-6">
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
                    </div>
                  </div>
                </el-dialog-panel>
              </div>
            </dialog>
          </el-dialog>
        </header>
      </div>
    </>
  );
}
