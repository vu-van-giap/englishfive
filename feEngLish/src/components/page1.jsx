import Ceo from "../img/thang.webp";
export default function Page1() {
  return (
    <>
      <div className="container ">
        <div className="mt-[300px]">
          <p className="text-center mx-auto text-[30px] font-semibold text-gray-900 ">
            “Keep moving forward”
          </p>
        </div>
        <img
          src={Ceo}
          alt=""
          className="mx-auto mt-[60px] size-[50px] rounded-full"
        />
        <div className="bocten mt-4  space-x-3  ">
          <div className="font-semibold text-gray-900 mx-auto  text-center">
            Bui Quang Thang -
            <span className="text-gray-600">Ceo of EngLishFive</span>
          </div>
        </div>
      </div>
    </>
  );
}
