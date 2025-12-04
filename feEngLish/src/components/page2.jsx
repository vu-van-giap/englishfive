const people = [
  {
    name: "Bui Quang Thang",
    role: "Co-Founder / CEO",
    imageUrl: "/src/img/thang.webp",
  },
  {
    name: " Tran Van Dung",
    role: "Co-Founder / CTO",
    imageUrl: "/src/img/giap.webp",
  },
  {
    name: "Vu Van Giap",
    role: "Business Relations",
    imageUrl: "/src/img/Dung.webp",
  },
  {
    name: "Le Dinh Kien",
    role: "Front-end Developer",
    imageUrl: "/src/img/kien.webp",
  },

  {
    name: "Luong Thien Truong",
    role: "Director of Product",
    imageUrl: "/src/img/truong.webp",
  },
];
export default function Page2() {
  return (
    <>
      <div className="mt-50px flex justify-center items-center">
        <div className=" text-gray-900 text-[20px]  mt-5 mb-5">
          Meet our team
        </div>
      </div>
      <div>
        <ul className="grid gap-x-8 gap-y-12 sm:grid-cols-5 sm:gap-y-16 xl:col-span-2">
          {people.map((person) => (
            <li key={person.name}>
              <div className="flex justify-center gap-x-6 gap-y-7">
                <img
                  alt=""
                  src={person.imageUrl}
                  className="size-16 rounded-full outline-1 -outline-offset-1 outline-black/5"
                />
                <div>
                  <h3 className="text-base/7 font-semibold tracking-tight text-gray-900">
                    {person.name}
                  </h3>
                  <p className="text-sm/6 font-semibold text-indigo-600">
                    {person.role}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
