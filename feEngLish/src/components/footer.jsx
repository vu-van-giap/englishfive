import LogoFoot from "../img/anhlogo.png";

export default function Footerr() {
  return (
    <>
      <footer className="bg-white lg:grid lg:grid-cols-3">
        <div className="anh relative block h-full">
          <img src={LogoFoot} alt="" className="h-full w-full object-cover" />
        </div>
        {/* lien lac */}
        <div className="lienlac py-16 px-4">
          <span>CALL US:</span>
          <br />
          <a href="" className="text-3xl">
            0123456789
          </a>
          <ul>
            <li>Monday to Friday: 10am - 5pm</li>
            <li>Weekend: 10am - 3pm</li>
          </ul>
        </div>
        {/* social media */}
        <div className="mangxahoiii mt-[30px]">
          <h3 className="text-2xl">Social media</h3>
          <ul className=" space-y-5 ml-[50px]">
            <li>
              <a href="" className="fb hover:bg-blue-500 border rounded">
                <i class="fa-brands fa-facebook"></i>
              </a>
            </li>
            <li>
              <a href="" className="ig hover:bg-pink-400 border rounded">
                <i class="fa-brands fa-instagram"></i>
              </a>
            </li>
            <li>
              <a href="" className="twitter hover:bg-blue-400 border rounded">
                <i class="fa-brands fa-twitter"></i>
              </a>
            </li>
            <li>
              <a
                href=""
                className="youtube fb hover:bg-red-100 text-red-600 border rounded"
              >
                <i class="fa-brands fa-youtube"></i>
              </a>
            </li>
            <li>
              <a href="" className="tiktok border rounded hover:bg-blue-400">
                <i class="fa-brands fa-tiktok"></i>
              </a>
            </li>
          </ul>
        </div>
        <br />
        <div className="flex justify-center items-center text-center mx-auto">
          © 2025. ENGFIVE. All rights reserved.
        </div>
      </footer>
    </>
  );
}
