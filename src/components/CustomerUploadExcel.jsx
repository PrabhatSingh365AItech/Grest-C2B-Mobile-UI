import React, { useState } from "react";
import axios from "axios";
import { BeatLoader } from "react-spinners";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { IoCloseOutline } from "react-icons/io5";
const CustomerUploadExcel = ({ closeModal }) => {
  const [brandId, setBrandId] = useState("");
  const [message, setMessage] = useState("");
  const [flag, setFlag] = useState(false);
  const [file, setFile] = useState(null);

  const [loading, setLoading] = useState(false);

  const handleExcelFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
  };

  const handleSubmit = (e) => {
    setLoading(true);
    e.preventDefault();
    const formData = new FormData();
    formData.append("brandId", brandId);
    formData.append("file", file);

    axios
      .post(
        `${
          import.meta.env.VITE_REACT_APP_ENDPOINT
        }/api/grades/addEditModelsAndPrice`,
        formData
      )
      .then((res) => {
        setMessage(res.data.data.message);
        setFlag(true);
        toast.success(res.data.data.message);
      })
      .catch((err) => {
        console.log(err);
        toast.error(err.response.data.message);
      })
      .finally(() => {
        setLoading(false);
      });
  };
  return (
    <>
      <ToastContainer />
      <div className="fixed top-0 left-0 z-50 flex items-center justify-center w-full h-full px-2 bg-black bg-opacity-50">
        <div className="p-4 rounded-lg bg-[#F5F4F9] shadow-md w-full md:max-w-lg  overflow-y-auto max-h-96 md:max-h-[90%]  relative">
          <IoCloseOutline
            onClick={closeModal}
            className="cursor-pointer sticky top-0 left-[700px] text-gray-500 hover:text-gray-700"
            size={24}
          />
          {loading && (
            <div className="fixed top-0 left-0 z-50 flex items-center justify-center w-full h-full bg-black bg-opacity-50">
              <BeatLoader color="var(--primary-color)" loading={loading} size={15} />
            </div>
          )}

          <h2 className="mb-4 text-2xl font-semibold">Enter Details</h2>
          <form className="flex flex-col gap-4">
            <div className="flex flex-col">
              <label className="mb-1 text-lg">BrandId</label>
              <input
                className="outline-none w-[250px] rounded p-2"
                type="text"
                value={brandId}
                onChange={(e) => setBrandId(e.target.value)}
              />
            </div>
            <div>
              <input
                type="file"
                name="excelFile"
                id="excelFile"
                accept=".xlsx, .xls"
                onChange={(e) => handleExcelFileChange(e)}
              />
            </div>
          </form>
          <button
            onClick={closeModal}
            className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-tertiary focus:outline-none"
          >
            Close
          </button>
          <button
            onClick={handleSubmit}
            className="mt-4 ml-2 px-4 py-2 bg-primary text-white rounded hover:bg-tertiary focus:outline-none"
          >
            Apply
          </button>
          {flag && <p>{message}</p>}
        </div>
      </div>
    </>
  );
};

export default CustomerUploadExcel;
