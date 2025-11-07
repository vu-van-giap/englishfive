import "../css/header.css";
import { Link } from "react-router-dom";

export default function Header() {
  return (
    <>
      <div class="bg-white">
        <header class="absolute inset-x-0 top-0 z-50">
          <nav
            aria-label="Global"
            class="flex items-center justify-between p-6 lg:px-8"
          >
            {/* img */}
            <div class="flex lg:flex-1">
              <Link to="/" class="-m-1.5 p-1.5">
                <span class="sr-only">Your Company</span>
                <img
                  src="../src/img/english FIVE.png"
                  alt=""
                  class="h-8 w-auto"
                />
              </Link>
            </div>
            <div class="flex lg:hidden">
              <button
                type="button"
                command="show-modal"
                commandfor="mobile-menu"
                class="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
              >
                <span class="sr-only">Open main menu</span>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.5"
                  aria-hidden="true"
                  class="size-6"
                >
                  <path
                    d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </button>
            </div>
            <div class="hidden lg:flex lg:gap-x-12 menu">
              <Link
                to="/"
                class="text-sm/6 font-semibold text-gray-900 mr-5 aa"
              >
                Home
              </Link>
              <a href="#" class="text-sm/6 font-semibold text-gray-900 mr-5 aa">
                FlashCard
              </a>
              <a href="#" class="text-sm/6 font-semibold text-gray-900 mr-5 aa">
                Quiz
              </a>
              <a href="#" class="text-sm/6 font-semibold text-gray-900 mr-5 aa">
                Audio
              </a>
            </div>
            <div class="hidden lg:flex lg:flex-1 justify-content-center ml-5 ">
              <a
                href="#"
                class="text-sm/6 font-semibold text-gray-900 bg-blue-500 border p-1 rounded"
              >
                Log in
              </a>
              <Link
                to="/register"
                class="text-sm/6 font-semibold text-gray-900 bg-red-500 border p-1 rounded ml-5"
              >
                Sign up
              </Link>
            </div>
            {/* doi theme */}
          </nav>

          <el-dialog>
            <dialog id="mobile-menu" class="backdrop:bg-transparent lg:hidden">
              <div tabindex="0" class="fixed inset-0 focus:outline-none">
                <el-dialog-panel class="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white p-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
                  <div class="flex items-center justify-between">
                    <a href="#" class="-m-1.5 p-1.5">
                      <span class="sr-only">Your Company</span>
                      <img
                        src="../src/img/english FIVE.png"
                        alt=""
                        class="h-8 w-auto"
                      />
                    </a>
                    <button
                      type="button"
                      command="close"
                      commandfor="mobile-menu"
                      class="-m-2.5 rounded-md p-2.5 text-gray-700"
                    >
                      <span class="sr-only">Close menu</span>
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="1.5"
                        aria-hidden="true"
                        class="size-6"
                      >
                        <path
                          d="M6 18 18 6M6 6l12 12"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                      </svg>
                    </button>
                  </div>
                  <div class="mt-6 flow-root">
                    <div class="-my-6 divide-y divide-gray-500/10">
                      <div class="space-y-2 py-6">
                        <Link
                          to="/"
                          class="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-gray-900 hover:bg-gray-50"
                        >
                          Home
                        </Link>
                        <a
                          href="#"
                          class="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-gray-900 hover:bg-gray-50"
                        >
                          FlashCard
                        </a>
                        <a
                          href="#"
                          class="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-gray-900 hover:bg-gray-50"
                        >
                          Quiz
                        </a>
                        <a
                          href="#"
                          class="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-gray-900 hover:bg-gray-50"
                        >
                          Audio
                        </a>
                      </div>
                      <div class="py-6">
                        <a
                          href="#"
                          class="-mx-3 block rounded-lg px-3 py-2.5 text-base/7 font-semibold text-gray-900 hover:bg-gray-50"
                        >
                          Log in
                        </a>
                        <Link
                          to="/register"
                          class="-mx-3 block rounded-lg px-3 py-2.5 text-base/7 font-semibold text-gray-900 hover:bg-gray-50"
                        >
                          Sign up
                        </Link>
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
