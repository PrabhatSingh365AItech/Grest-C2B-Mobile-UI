import React from "react";

const CircleCard = ({ title, detail }) => {
  return (
    <div className="flex flex-col items-center">
      <img
        className="w-20 h-20 rounded-full"
        src="https://cdn.pixabay.com/photo/2022/05/10/04/10/money-transfer-7185873_1280.png"
        alt=""
      />
      <p className="font-bold">{title}</p>
      <p className="text-[#9C9C9C]">{detail}</p>
    </div>
  );
};

export default CircleCard;
