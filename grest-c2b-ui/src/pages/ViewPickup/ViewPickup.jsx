import React, { useEffect, useState } from "react";
import ViewPickupTable from "../../components/ViewPickupTable/ViewPickupTable";
import { useNavigate } from "react-router-dom";
import { BeatLoader } from "react-spinners";
const currentDomain = window.location.origin;
const DEFAULT_LOGO = "/Grest_Logo.jpg";
const BUYBACK_LOGO = "/Grest_Logo_2.jpg"; // Use your actual buyback logo

const isBuybackDomain = currentDomain === import.meta.env.VITE_BUYBACK_URL;
const GREST_LOGO = isBuybackDomain ? BUYBACK_LOGO : DEFAULT_LOGO;
import User_Logo from "../../assets/User_Logo.jpg";
import axios from "axios";

const ViewPickup = () => {
  const [userName, setUserName] = useState();
  const [isTableLoaded, setIsTableLoaded] = useState(false);
  const [viewTableData, setViewTableData] = useState([]);
  const navigate = useNavigate();
  useEffect(() => {
    setIsTableLoaded(true);
    const LoggedInUser = JSON.parse(sessionStorage.getItem("profile"));
    setUserName(LoggedInUser?.name);

    axios
      .get("https://api.npoint.io/df522245ea811d01e617")
      .then((res) => {
        setViewTableData(res.data);
        setIsTableLoaded(false);
      })
      .catch((err) => {
        console.log(err);
        setIsTableLoaded(false);
      });
  }, []);
  return (
    <div className="min-h-screen bg-white pb-8 ">
      {isTableLoaded && (
        <div className="fixed top-0 left-0 z-50 flex items-center justify-center w-full h-full bg-black bg-opacity-50">
          <BeatLoader color="var(--primary-color)" loading={isTableLoaded} size={15} />
        </div>
      )}
      <div className="flex items-center w-[99%] h-16 py-4 bg-white border-b-2 HEADER header">
        <div className="flex items-center justify-between w-full ">
          <div className="flex flex-row-reverse items-center gap-2 ml-4">
            <p className="mr-4 text-base md:text-xl">{userName}</p>

            <img className="w-[30px]" src={User_Logo} alt="" />
          </div>

          <img
            onClick={() => navigate("/selectdevicetype")}
            className="w-40"
            src={GREST_LOGO}
            alt="app logo"
          />
        </div>
      </div>
      <div className="mt-10">
        <ViewPickupTable viewTableData={viewTableData} />
      </div>
    </div>
  );
};

export default ViewPickup;
