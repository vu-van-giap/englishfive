import { useState } from "react";
const Page3 = () => {
  const [display, setDisplay] = useState(false);
  const [display1, setDisplay1] = useState(false);
  const [display2, setDisplay2] = useState(false);
  return (
    <>
      <div className="bg-amber-300 border-2">
        <span className="">
          Whar are the basic flashcard ?{" "}
          <button onClick={() => setDisplay(!display)}>➕</button>
        </span>
        {display ? (
          <p className="mt-5">You can learn vocab so easy and quickly</p>
        ) : null}
      </div>
      {/* cai 2 */}
      <div className="bg-amber-300 border-2">
        <span className="">
          How do i get started ?{" "}
          <button onClick={() => setDisplay1(!display1)}>➕</button>
        </span>
        {display1 ? (
          <p className="mt-5">
            You just need create your account and click on thing do you like to
            learn
          </p>
        ) : null}
      </div>
      {/* cai 3 */}
      <div className="bg-amber-300 border-2">
        <span className="">
          HWhat support options are available? ?{" "}
          <button onClick={() => setDisplay2(!display2)}>➕</button>
        </span>
        {display2 ? (
          <p className="mt-5">
            Call my web numberphone or social media like facebook,instagram,...
          </p>
        ) : null}
      </div>
    </>
  );
};

export default Page3;
