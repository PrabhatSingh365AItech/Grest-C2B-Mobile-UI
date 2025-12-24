import React from "react";
import { IoCloseCircle } from "react-icons/io5";
const SummaryModal = ({ show, onClose, price, bonus, sellingPrice }) => {
  return (
    <div
      className={`fixed bg-white rounded-l-3xl rounded-r-3xl bottom-0 left-0 w-full p-4 transition-all 
      duration-500 ${show ? "h-[40%]" : "hidden"} overflow-hidden`}
    >
      <div>
        <div>
          <IoCloseCircle
            onClick={onClose}
            size={24}
            className="text-primary absolute top-5 right-4"
          />
        </div>
        <div>
          <p className="font-medium text-lg">Price Summary</p>
        </div>
        <div className="text-sm mx-2 ">
          <div className="font-medium mt-4 flex flex-col gap-4">
            <div className="flex justify-between">
              <p>Base Price</p>
              <p>₹{price}</p>
            </div>
            <div className="flex justify-between">
              <p>Pickup Charges</p>
              <div className="flex gap-2">
                <p className="text-primary">Free</p>
                <p className="line-through">₹100</p>
              </div>
            </div>
            <div className="flex justify-between">
              <p>Extra Bonus</p>
              <p>+₹{bonus}</p>
            </div>
            <div className="flex justify-between text-lg font-semibold">
              <p>Total Amount</p>
              <p>{sellingPrice}</p>
            </div>
          </div>
        </div>
      </div>
      <button
        className="bg-primary fixed bottom-0 mb-4 rounded text-white px-4 py-2 mt-4"
        onClick={onClose}
      >
        Close
      </button>
    </div>
  );
};

export default SummaryModal;
