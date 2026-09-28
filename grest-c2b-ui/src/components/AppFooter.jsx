import React from "react";
import { MdOutlineHome } from "react-icons/md";
import { CiSearch } from "react-icons/ci";
import { IoBagAddOutline } from "react-icons/io5";
import { BiCategory } from "react-icons/bi";
import styles from "../styles/AppFooter.module.css";
import { useNavigate, useLocation } from "react-router";

const AppFooter = ({ days }) => {
  const show = true;
  const navigate = useNavigate();
  const location = useLocation();
  const currentDomain = window.location.origin;

  const isActive = (keyword) => location.pathname.includes(keyword);

  return (
    <div
      className={`${
        show ? "bottom-0" : "-bottom-[60px]"
      } bg-white flex border-2 py-2 justify-around w-[99%] footer fixed ${
        styles.footer_wrap
      }`}
    >
      <div
        onClick={() => navigate("/selectdevicetype")}
        className={`flex flex-col items-center ${
          isActive("selectdevicetype") ? "font-semibold text-primary" : ""
        }`}
      >
        <MdOutlineHome size={24} />
        <button className="text-sm">Home</button>
      </div>

      {currentDomain === import.meta.env.VITE_BUYBACK_URL && (
        <div onClick={() => navigate("/selectdevicetype", { state: { openSearch: true } })} className="flex flex-col items-center">
          <CiSearch size={24} />
          <button className="text-sm">Search Products</button>
        </div>
      )}

      {currentDomain !== import.meta.env.VITE_BUYBACK_URL && (
        <div
          onClick={() => navigate("/BrandList")}
          className={`flex flex-col items-center ${
            isActive("BrandList") ? "text-primary font-semibold" : ""
          }`}
        >
          <BiCategory size={24} />
          <button className="text-sm">Categories</button>
        </div>
      )}

      {currentDomain !== import.meta.env.VITE_BUYBACK_URL && (
        <div
          onClick={() => navigate(`/Orders/${days}`)}
          className={`flex flex-col items-center ${
            isActive("Orders") ? "text-primary font-semibold" : ""
          }`}
        >
          <IoBagAddOutline size={24} />
          <button className="text-sm">Orders</button>
        </div>
      )}
    </div>
  );
};

export default AppFooter;
