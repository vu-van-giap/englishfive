import Logo from "../img/anhlogo.png";
import { Link } from "react-router-dom";
export default function Header() {
  return (
    <>
      <header className="bg-blue-400 w-full">
        <div className="container flex items-center justify-between h-[60px] px-5">
          <div className="anhlogo">
            <img src={Logo} alt="Logo" className="w-[50px]" />
          </div>

          <div className="menu space-x-5 mx-auto">
            <Link to="/" className="text-white hover:text-black">
              Home
            </Link>
            <Link to="/createword" className="text-white hover:text-black">
              FlashCard
            </Link>
            <Link to="#" className="text-white hover:text-black">
              Quiz
            </Link>
            <a href="#" className="text-white hover:text-black">
              Audio
            </a>
          </div>

          <div className="dangkynhap space-x-5">
            <Link
              to="/login"
              className="text-white hover:bg-amber-300 bg-blue-800 border rounded py-1 px-3"
            >
              Log in
            </Link>
            <Link
              to="/register"
              className="bg-red-500 hover:bg-amber-300 text-white py-1 px-3 rounded"
            >
              Sign up
            </Link>
          </div>
        </div>
      </header>
    </>
  );
}
