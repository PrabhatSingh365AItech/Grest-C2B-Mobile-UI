import React from "react";
import { BsCalendar3 } from "react-icons/bs";
import DatePicker from "react-datepicker";
import { IoCloseCircle } from "react-icons/io5";

function FromDatecom({
  showFromdate,
  fromDate,
  handleFromDateChange,
  toDate,
  handleToDateChange,
  setshowFromdate,
  searchCustom,
}) {
  const onClose = () => {
    setshowFromdate(false);
  };
  return (
    <>
      <div
        className={`fixed bg-white rounded-t-3xl bottom-0 left-0 w-full p-4 transition-all 
      duration-500 ${
        showFromdate ? "h-[35%]" : "hidden"
      } overflow-visible z-10 shadow-[0px_-116px_53px_19px_#00000024]`}
      >
        <IoCloseCircle
          onClick={onClose}
          size={24}
          className="text-primary absolute top-5 right-4"
        />
        <div className="flex flex-col w-full h-full content">
          <h2 className="text-2xl font-bold text-center mb-[15px]">
            Custom Date
          </h2>
          <div className="date flex w-[100vw] justify-around flex-col">
            <div className="flex items-center outline-none mb-[10px]">
              <p className="block w-[63px] text-xl font-medium text-gray-600 ">
                From :{" "}
              </p>
              <div className="flex inputbox  w-[250px] bg-white border-2 items-center rounded-md justify-between px-[5px]">
                <DatePicker
                  getPopupContainer={() =>
                    document.getElementById("date-popup")
                  }
                  popupStyle={{ position: "relative" }}
                  selected={fromDate}
                  onChange={handleFromDateChange}
                  dateFormat="yyyy-MM-dd"
                  className="mt-1 p-2 w-[150px] sm:w-[250px]  rounded-md outline-none"
                  placeholderText="Select from date"
                  popperPlacement="top-start"
                />
                <BsCalendar3 size={18} />
              </div>
              <div id="date-popup" />
            </div>
            <div className="flex items-center outline-none">
              <p className="block text-xl font-medium text-gray-600 w-[63px] ">
                To :{" "}
              </p>
              <div className="flex inputbox  w-[250px] bg-white border-2 items-center rounded-md justify-between px-[5px]">
                <DatePicker
                  selected={toDate}
                  onChange={handleToDateChange}
                  dateFormat="yyyy-MM-dd"
                  className="mt-1 p-2 w-[150px] sm:w-[250px]  rounded-md outline-none"
                  placeholderText="Select to date"
                  popperPlacement="top-start"
                />
                <BsCalendar3 size={18} />
              </div>
            </div>

            <div className="b flex items-center justify-center">
              <div
                onClick={searchCustom}
                className="bg-primary py-1 px-2 text-center rounded-lg cursor-pointer flex justify-between text-white items-center mt-1"
              >
                <p className="w-full p-1 text-xl font-medium">Search</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default FromDatecom;
