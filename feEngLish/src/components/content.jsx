import Logo2 from "../img/trangtri.png";
import Page1 from "./page1";
import Page2 from "./page2";
import Page3 from "./page3";
export default function Content() {
  return (
    <>
      <main className="bg-white">
        <div className="">
          <div className="div1 max-w-prose text-left">
            <h1 className="text-4xl font-bold text-gray-900 ml-5 relative top-[200px] left-[100px]">
              Understand learn english easy with flash card, quiz audio
            </h1>
            <p className="ml-5 relative top-[200px] left-[100px]">
              Unlock rapid language acquisition. Our system uses spaced
              repetition flashcards, interactive quizzes, and native audio to
              make fluency accessible and fun.
            </p>
          </div>

          <button className="ml-5 relative top-[200px] left-[100px] bg-red-500 border rounded py-1 px-3 hover:bg-amber-300">
            Get Started
          </button>
          <button className="ml-5 relative top-[200px] left-[100px] bg-green-300 border rounded py-1 px-3 hover:bg-amber-300">
            Learn More
          </button>
          <img
            src={Logo2}
            alt=""
            className="w-[500px] absolute top-[200px] left-[700px]"
          />
        </div>
      </main>
      <Page1></Page1>
      <Page2></Page2>
      <Page3></Page3>
    </>
  );
}
