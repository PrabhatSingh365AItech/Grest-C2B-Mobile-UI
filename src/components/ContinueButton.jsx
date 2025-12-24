import React from "react";
import { BsArrowRight } from "react-icons/bs";
import { Link } from "react-router-dom";
const ContinueButton = ({ moredevicedetail, buttonName }) => {
  return (
    <div className="fixed bottom-0 w-full   h-[75px] ">
      <div className="flex items-center gap-2 text-white bg-primary p-3 justify-center h-[75px]">
        <Link to={moredevicedetail}>
          {" "}
          <button className="font-bold">
            {buttonName ? buttonName : "Continue"}
          </button>
        </Link>
        <BsArrowRight size={23} />
      </div>
    </div>
  );
};

export default ContinueButton;
