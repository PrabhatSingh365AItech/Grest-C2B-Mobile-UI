import React, { useState } from "react";
import AdminNavbar from "../../components/Admin_Navbar";
import SideMenu from "../../components/SideMenu";
import { AiOutlineFile } from "react-icons/ai";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
const CompanyListing = () => {
  const [sideMenu, setsideMenu] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [companyName, setCompanyName] = useState("");
  const [uniqueId, setUniqueId] = useState("");
  const [companyCode, setCompnayCode] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [address, setAddress] = useState("");
  const [gstNumber, setGstNumber] = useState("");
  const [panNumber, setPanNumber] = useState("");
  const [remarks, setRemarks] = useState("");
  const navigate = useNavigate();
  const handleFileUpload = (e) => {
    const files = e.target.files;
    setAttachedFiles((prevFiles) => [...prevFiles, ...Array.from(files)]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();

    formData.append("companyName", companyName);
    formData.append("uniqueId", uniqueId);
    formData.append("companyCode", companyCode);
    formData.append("contactNumber", contactNumber);
    formData.append("address", address);
    formData.append("gstNumber", gstNumber);
    formData.append("panNumber", panNumber);
    formData.append("remarks", remarks);
    attachedFiles.forEach((file, index) => {
      formData.append("files", file, `file-${index}`);
    });

    const userToken = sessionStorage.getItem("authToken");
    axios
      .post(
        `${import.meta.env.VITE_REACT_APP_ENDPOINT}/api/company/create`,
        formData,
        {
          headers: {
            Authorization: `${userToken}`,
          },
        }
      )
      .then((res) => {
        console.log("res is ", res);
        toast.success("Company Added");
        navigate("/companylistingdetails");
      })
      .catch((err) => {
        console.log(err);
      });
  };
  return (
    <div>
      <div className="navbar">
        <AdminNavbar setsideMenu={setsideMenu} sideMenu={sideMenu} />
        <SideMenu setsideMenu={setsideMenu} sideMenu={sideMenu} />
      </div>

      <div
        style={{
          boxShadow:
            "rgba(0, 0, 0, 0.3) 0px 0px 10px, rgba(0, 0, 0, 0.1) 0px 5px 12px",
        }}
        className="items-center bg-white max-w-[900px] flex py-8 mx-auto mt-4 justify-center flex-col"
      >
        <div className="flex flex-col  w-[900px]">
          <div className="mb-6 flex flex-col gap-2 border-b-2 mr-10 pb-2 ml-10">
            <p className="text-4xl font-bold">Company Listing</p>
            <p className="text-lg">All fields marked with * are required</p>
          </div>
          <div className="flex flex-wrap gap-2 ml-10 mb-10">
            <Link
              to="/companylistingdetails"
              className="font-medium text-sm text-white p-3 rounded bg-primary"
            >
              View Detail
            </Link>
          </div>
          <form onSubmit={handleSubmit} className="ml-10 flex flex-col gap-4">
            <div className="flex flex-col w-[70%] gap-2">
              <span className="font-medium text-xl">Name*</span>
              <input
                className="border-2 px-2 py-2 rounded-lg outline-none"
                type="text"
                value={companyName}
                required={true}
                onChange={(e) => setCompanyName(e.target.value)}
              />
            </div>
            <div className="flex flex-col w-[70%] gap-2">
              <span className="font-medium text-xl">Unique Id*</span>
              <input
                className="border-2 px-2 py-2 rounded-lg  outline-none "
                type="text"
                value={uniqueId}
                required={true}
                onChange={(e) => setUniqueId(e.target.value)}
              />
            </div>
            <div className="flex flex-col w-[70%] gap-2">
              <span className="font-medium text-xl">Company Code*</span>
              <input
                className="border-2 px-2 py-2 rounded-lg  outline-none "
                type="text"
                value={companyCode}
                required={true}
                onChange={(e) => setCompnayCode(e.target.value)}
              />
            </div>
            <div className="flex flex-col w-[70%] gap-2">
              <span className="font-medium text-xl">Address</span>
              <input
                className="border-2 px-2 py-2 rounded-lg  outline-none"
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
            <div className="flex flex-col w-[70%] gap-2">
              <span className="font-medium text-xl">Contact Number</span>
              <input
                className="border-2 px-2 py-2 rounded-lg  outline-none"
                type="text"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
              />
            </div>
            <div className="flex flex-col w-[70%] gap-2">
              <span className="font-medium text-xl">GST Number</span>
              <input
                className="border-2 px-2 py-2 rounded-lg  outline-none"
                type="text"
                value={gstNumber}
                onChange={(e) => setGstNumber(e.target.value)}
              />
            </div>
            <div className="flex flex-col w-[70%] gap-2">
              <span className="font-medium text-xl">PAN Number</span>
              <input
                className="border-2 px-2 py-2 rounded-lg  outline-none"
                type="text"
                value={panNumber}
                onChange={(e) => setPanNumber(e.target.value)}
              />
            </div>
            <div className="flex flex-col w-[70%] gap-2">
              <span className="font-medium text-xl">Remarks</span>
              <input
                className="border-2 px-2 py-2 rounded-lg  outline-none"
                type="text"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
              />
            </div>
            <div className="flex flex-col w-[70%] gap-2">
              <span className="font-medium text-xl">Attach Documents</span>
              <input
                className=" py-2 rounded-lg w-[250px] outline-none"
                onChange={handleFileUpload}
                type="file"
                multiple
              />
            </div>

            <div className="flex flex-wrap w-[90%] gap-2">
              {attachedFiles.length > 0 &&
                attachedFiles.map((file, index) => (
                  <div className="flex flex-col items-center">
                    <AiOutlineFile size={80} />
                    <p key={index}>{file.name}</p>
                  </div>
                ))}
            </div>

            <div className="mt-8">
              <button className="font-medium text-sm text-white p-3 rounded bg-primary">
                Submit Form
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CompanyListing;
