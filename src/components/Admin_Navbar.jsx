import React, { useState } from "react";
import { IoMdPerson } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInterceptor";
const currentDomain = window.location.origin;
const DEFAULT_LOGO = "/Grest_Logo.jpg";
const BUYBACK_LOGO = "/Grest_Logo_2.jpg"; // Use your actual buyback logo

const isBuybackDomain = currentDomain === import.meta.env.VITE_BUYBACK_URL;
const GREST_LOGO = isBuybackDomain ? BUYBACK_LOGO : DEFAULT_LOGO;

function AdminNavbar({ setsideMenu, sideMenu }) {
  const [showLogout, setShowLogout] = useState(false);
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      // Call backend logout endpoint to invalidate session
      await axiosInstance.post('/api/userregistry/logout');
    } catch (error) {
      console.error('Logout API error:', error);
      // Continue with logout even if API call fails
    } finally {
      // Clear all client-side data
      localStorage.clear();
      sessionStorage.clear();
      navigate("/");
    }
  };
  return (
    <>
      <div className="flex items-center justify-between w-screen h-20 px-4 py-0 bg-white">
        <div
          className={
            "flex justify-between hamburger flex-col w-[32px] h-[25px] cursor-pointer z-[100] ease-in-out duration-300 " +
            (sideMenu && "translate-x-[149px]")
          }
          onClick={() => setsideMenu(!sideMenu)}
        >
          <span
            className={
              "w-full line1 h-[3px] bg-black origin-left transition-all duration-950 ease-in " +
              (sideMenu && " rotate-45")
            }
          ></span>
          <span
            className={
              "line2 w-full  h-[3px] bg-black origin-left transition-all duration-950 ease-in " +
              (sideMenu && " opacity-0")
            }
          ></span>
          <span
            className={
              "line3 w-full  h-[3px] bg-black origin-left transition-all duration-950 ease-in " +
              (sideMenu && "-rotate-45")
            }
          ></span>
        </div>

            {/* Admin Section with Logout */}
            <div className="flex right relative">
          <div
            className="flex items-center admin w-[113px] cursor-pointer relative"
            onClick={() => setShowLogout(!showLogout)}
          >
            <IoMdPerson size={30} />
            <span>admin</span>
          </div>
          {showLogout && (
            <div className="absolute top-12 right-30 bg-white border shadow-md px-4 py-2 rounded-md">
              <button
                onClick={handleLogout}
                className="text-red-500 hover:text-red-700"
              >
                Logout
              </button>
            </div>
          )}
          <img className="w-28" src={GREST_LOGO} alt="" />
        </div>
      </div>
    </>
  );
}
export default AdminNavbar;
