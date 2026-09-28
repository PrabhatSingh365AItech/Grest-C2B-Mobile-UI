import React, { useEffect, useState } from "react";
const currentDomain = window.location.origin;
const DEFAULT_LOGO = "/Grest_Logo.jpg";
const BUYBACK_LOGO = "/Grest_Logo_2.jpg"; // Use your actual buyback logo

const isBuybackDomain = currentDomain === import.meta.env.VITE_BUYBACK_URL;
const GREST_LOGO = isBuybackDomain ? BUYBACK_LOGO : DEFAULT_LOGO;
import { useNavigate } from "react-router-dom";
import { BsCartCheckFill } from "react-icons/bs";
const navtoSelDevTP = "/selectdevicetype";

const ThankYou = () => {
  const [countdown, setCountdown] = useState(10); // 10 seconds countdown
  const navigate = useNavigate();

  useEffect(() => {
    let timer;
    if ( countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prevCount) => {
          return prevCount - 1;
        });
      }, 1000);
    } else if (countdown === 0) {
      navigate("/selectdevicetype");
    }
    return () => clearInterval(timer);
  }, [navigate, countdown]);

  const handleReturn = () => {
    navigate(navtoSelDevTP);
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      navigate(navtoSelDevTP);
    }, 30000);
    return () => clearInterval(timeout);
  }, [navigate]);

  return (
    <div className=" min-h-screen bg-white">
      <div className="w-screen flex items-center h-16 py-4 bg-white border-b-2 HEADER ">
        <div className="flex items-center w-full justify-between ">

          <img
            onClick={() => navigate(navtoSelDevTP)}
            className="w-40"
            src={GREST_LOGO}
            alt="app logo"
          />
        </div>
      </div>
      <div className="flex flex-col items-center justify-center gap-2 h-[70vh]">
        <BsCartCheckFill size={84} color="var(--primary-color)" />
        <p className="font-medium text-xl p-4 text-center ">
        Thank you, Dear Customer!
        we have successfully saved your details. Our Grest Team will call you back shortly.
        </p>
      </div>
      <div className="fixed bottom-0 w-full ">
        <div
          onClick={handleReturn}
          className=" bg-primary mb-20 text-center p-3 mx-2 text-lg rounded-lg cursor-pointer flex justify-between  text-white items-center"
        >
          <p className="font-medium  text-2xl flex-1 mx-4">Return To Home ({countdown}s)</p>
        </div>
      </div>
    </div>
  );
};

export default ThankYou;
