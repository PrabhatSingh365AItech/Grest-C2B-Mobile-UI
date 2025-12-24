import React from "react";
import { IoMdSearch } from "react-icons/io";
const Searchbar = () => {
  return (
    <div className="flex items-center bg-white border-2 border-black w-[70%] mx-auto rounded-lg mt-4">
      <IoMdSearch className="" size={30} />
      <input
        type="text"
        placeholder="Search Here"
        className="w-full outline-none ml-1 p-2 rounded-lg "
      />
      <button className=" border-2 p-2 text-sm sm:text-lg bg-black text-white rounded-lg">
        Search
      </button>
    </div>
  );
};

export default Searchbar;
