import React from "react";

const DefectCard = ({ error }) => {
  return (
    <div className="flex flex-col gap-2 bg-white justify-center rounded-lg items-center w-[170px] p-3">
      <div>
        <img
          className="w-[60px]"
          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR8oCwBxkFgIel_R_sRjJ7wGdB0Z1UPREbaYA&usqp=CAU"
        />
      </div>
      <div>
        <p className="text-center text-primary font-semibold">{error}</p>
      </div>
    </div>
  );
};

export default DefectCard;
