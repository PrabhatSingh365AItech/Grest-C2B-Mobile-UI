import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import downArrow from "../assets/down.png";
import FAQ from "../components/FAQ";
import { AiOutlineInfoCircle } from "react-icons/ai";
import CircleCard from "../components/CircleCard";
import ContinueButton from "../components/ContinueButton";
import DeviceCard from "../components/DeviceCard";
const currentDomain = window.location.origin;
const DEFAULT_LOGO = "/Grest_Logo.jpg";
const BUYBACK_LOGO = "/Grest_Logo_2.jpg"; // Use your actual buyback logo

const isBuybackDomain = currentDomain === import.meta.env.VITE_BUYBACK_URL;
const GREST_LOGO = isBuybackDomain ? BUYBACK_LOGO : DEFAULT_LOGO;
const DeviceDetails = () => {
  const WEBSITE_SHORT_NAME = currentDomain === import.meta.env.VITE_BUYBACK_URL ? import.meta.env.VITE_BUYBACK_SHORT_NAME : import.meta.env.VITE_WEBSITE_SHORT_NAME;

  const [dataModel, setDataModel] = useState({});
  const navigate = useNavigate();
  const grestWork = [
    {
      title: "Add",
      detail: "product details",
    },
    {
      title: "Pickup",
      detail: "your device",
    },
    {
      title: "Get Paid",
      detail: "your money",
    },
  ];
  useEffect(() => {
    const data = localStorage.getItem("dataModel");
    setDataModel(JSON.parse(data));
    const token = sessionStorage.getItem("authToken");
    if (!token) {
      navigate("/");
    }
  }, []);

  function handleback() {
    navigate("/selectPhone");
  }
  const handleLogoClick = () => {
    navigate("/selectPhone");
  };
  return (
    <div className="pb-20">
      <div className="flex items-center w-screen py-4 h-24 HEADER bg-white">
        <img
          src={downArrow}
          alt="arrow"
          className=" h-5 md:h-8 w-12.5 transform rotate-90"
          onClick={handleback}
        />
        <div className="flex items-center justify-between w-full ">
          <span className="w-4/5 text-xl md:text-3xl ml-4">Device details</span>
          <img
            onClick={handleLogoClick}
            className="w-36 sm:w-40"
            src={GREST_LOGO}
            alt="app logo"
          />
        </div>
      </div>
      <div className="w-[90%] md:w-[70%]  mx-auto mt-8">
        <DeviceCard
          model={dataModel?.models?.name}
          price={dataModel?.models?.config?.price}
        />
        <div className="flex justify-between p-4 bg-white border-t-2 ">
          <div className="flex flex-col items-center">
            <p className="text-[#9C9C9C]">Core</p>
            <p className="text-lg">{dataModel?.models?.core}</p>
          </div>
          <div className="flex flex-col items-center">
            <p className="text-[#9C9C9C]">Back Camera</p>
            <p className="text-lg">{dataModel?.models?.back_camera}</p>
          </div>
          <div className="flex flex-col items-center">
            <p className="text-[#9C9C9C]">Storage</p>
            <p className="text-lg">{dataModel?.models?.config?.storage}</p>
          </div>
          <div className="flex flex-col items-center">
            <p className="text-[#9C9C9C]">Chipset</p>
            <p className="text-lg">{dataModel?.models?.chipset}</p>
          </div>
        </div>
        <div className=" bg-[#FEEBE5] rounded-b-lg p-2 text-sm flex justify-between md:justify-start gap-2 ">
          <div>
            <AiOutlineInfoCircle />
          </div>
          <p className="text-justify">
            This price depends on the condition of your product and is not
            final. The final price offer will be quoted at the diagnosis by our
            experts.
          </p>
        </div>
        {/* how grest works */}
        <div>
          <div className="my-4">
            <h1 className="text-primary font-semibold text-2xl">
              How {WEBSITE_SHORT_NAME} Works?
            </h1>
          </div>
          <div className="flex justify-around gap-2 text-center">
            {grestWork.map((ele, index) => (
              <CircleCard key={index} title={ele.title} detail={ele.detail} />
            ))}
          </div>
        </div>
        {/* FAQ */}
        <div className="mt-4">
          <div className="text-primary font-semibold text-2xl mb-2">
            FAQ's
          </div>
          <FAQ />
        </div>
      </div>
      <ContinueButton moredevicedetail={"/deviceinfo"} />
    </div>
  );
};

export default DeviceDetails;
