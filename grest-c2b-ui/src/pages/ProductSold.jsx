import React, { useEffect, useState } from "react";
const currentDomain = window.location.origin;
const DEFAULT_LOGO = "/Grest_Logo.jpg";
const BUYBACK_LOGO = "/Grest_Logo_2.jpg"; // Use your actual buyback logo

const isBuybackDomain = currentDomain === import.meta.env.VITE_BUYBACK_URL;
const GREST_LOGO = isBuybackDomain ? BUYBACK_LOGO : DEFAULT_LOGO;
import User_Logo from "../assets/User_Logo.jpg";
import { useNavigate } from "react-router-dom";
import { BsCartCheckFill } from "react-icons/bs";
const navtoSelDevTP = "/selectdevicetype";

const ProductSold = () => {
  const [userName, setUserName] = useState();
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  useEffect(() => {
    const LoggedInUser = JSON.parse(sessionStorage.getItem("profile"));
    setUserName(LoggedInUser?.name);

    const ShowMessage = sessionStorage.getItem("messageReceived");
    setMessage(ShowMessage);
  }, []);
  const [countdown, setCountdown] = useState(10); // 10 seconds countdown

  useEffect(() => {
    let timer;
    if ( countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prevCount) => {
          console.log("Countdown:", prevCount - 1); // Log the countdown
          return prevCount - 1;
        });
      }, 1000);
    } else if (countdown === 0) {
      navigate("/selectdevicetype");
    }
    return () => clearInterval(timer);
  }, [countdown, navigate]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      navigate(navtoSelDevTP);
    }, 30000);

    return () => clearInterval(timeout);
  }, [navigate]);

  const handleReturn = () => {
    navigate(navtoSelDevTP);
  };
  return (
    <div className="bg-white min-h-screen">
      <div className="flex items-center w-[99%] h-16 py-4 bg-white border-b-2 HEADER ">
        <div className="flex items-center justify-between w-full ">
          <div className="flex flex-row-reverse items-center gap-2 ml-4">
            <p className="mr-4 text-base md:text-xl">{userName}</p>

            <img className="w-[30px]" src={User_Logo} alt="" />
          </div>

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
        <p className="font-medium text-2xl">
          {message.length > 0 ? message : ""}
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

export default ProductSold;
