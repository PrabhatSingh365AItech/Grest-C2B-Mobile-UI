import React, { useState } from "react";
import AdminNavbar from "../components/Admin_Navbar";
import SideMenu from "../components/SideMenu";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";
import AdminFinalPriceTable from "../components/AdminFinalPriceTable";

const AdminFinalPrice = () => {
  const [sideMenu, setsideMenu] = useState(false);
  const navigate = useNavigate();
  const handleBack = () => {
    navigate("/admin/question");
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="navbar">
        <AdminNavbar setsideMenu={setsideMenu} sideMenu={sideMenu} />
        <SideMenu setsideMenu={setsideMenu} sideMenu={sideMenu} />
      </div>
      <div className="w-[90%] mt-2 mx-auto">
        <button
          onClick={handleBack}
          className="text-center  px-4 py-2 rounded-lg bg-[#EC2752] text-white cursor-pointer"
        >
          Back To Home
        </button>
      </div>
      <div className="flex justify-center">
        <AdminFinalPriceTable />
      </div>
      <Footer />
    </div>
  );
};
export default AdminFinalPrice;
