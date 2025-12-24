import React, { useState } from "react";
import { BeatLoader } from "react-spinners";
import axios from "axios";
import { IoClose } from "react-icons/io5";

const EditCompany = ({ companyData, setEditBoxOpen, setEditSuccess }) => {
  const [isTableLoading, setIsTableLoading] = useState(false);
  const [formValues, setFormValues] = useState(companyData);
  const [attachedFiles, setAttachedFiles] = useState([]);
  const handleFileUpload = (e) => {
    const files = e.target.files;
    setAttachedFiles((prevFiles) => [...prevFiles, ...Array.from(files)]);
  };
  const closeHandler = () => {
    setEditBoxOpen(false);
  };
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;
    console.log("name", e.target.name);
    if (type === "file") {
      setFormValues({
        ...formValues,
        [name]: files,
      });
    } else {
      setFormValues({
        ...formValues,
        [name]: newValue,
      });
    }
  };
  const handleSubmit = (event) => {
    event.preventDefault();
    setIsTableLoading(true);
    const token = sessionStorage.getItem("authToken");
    const formData = new FormData();
    formData.append("companyName", formValues.companyName);
    formData.append("uniqueId", formValues.uniqueId);
    formData.append("companyCode", formValues.companyCode);
    formData.append("contactNumber", formValues.contactNumber);
    formData.append("address", formValues.address);
    formData.append("gstNumber", formValues.gstNumber);
    formData.append("panNumber", formValues.panNumber);
    formData.append("remarks", formValues.remarks);
    formData.append("id", formValues._id);
    if (attachedFiles.length) {
      attachedFiles.forEach((file, index) => {
        formData.append("files", file, `file-${index}`);
      });
    }
    if (formValues.documents && formValues.documents.length > 0) {
      for (let i = 0; i < formValues.documents.length; i++) {
        formData.append("documents", formValues.documents[i]);
      }
    }
    axios
      .put(
        `${import.meta.env.VITE_REACT_APP_ENDPOINT}/api/company/edit`,
        formData,
        { headers: { Authorization: token } }
      )
      .then((res) => {
        setIsTableLoading(false);
        setEditSuccess(true);
      })
      .catch((err) => {
        setIsTableLoading(false);
      });
  };
  return (
    <div>
      {isTableLoading && (
        <div className="fixed top-0 left-0 z-50 flex items-center justify-center w-full h-full bg-black bg-opacity-50">
          <BeatLoader color="var(--primary-color)" loading={isTableLoading} size={15} />
        </div>
      )}
      <div
        style={{
          boxShadow:
            "rgba(0, 0, 0, 0.3) 0px 0px 10px, rgba(0, 0, 0, 0.1) 0px 5px 12px",
        }}
        className="items-center bg-white max-w-[900px] flex py-8 mx-auto mt-4 justify-center flex-col"
      >
        <div className="flex flex-col  w-[900px]">
          <div className="relative mb-6 flex flex-col gap-2 border-b-2 mr-10 pb-2 ml-10">
            <IoClose
              size={35}
              className="absolute right-0 text-primary transition ease hover:rotate-[360deg] duration-500"
              onClick={closeHandler}
            />
            <p className="text-4xl font-bold">Update Company Listing</p>
            <p className="text-lg">All fields marked with * are required</p>
          </div>
          <form onSubmit={handleSubmit} className="ml-10 flex flex-col gap-4">
            <div className="flex flex-col w-[70%] gap-2">
              <span className="font-medium text-xl">Name*</span>
              <input
                className="border-2 px-2 py-2 rounded-lg outline-none"
                type="text"
                name="companyName"
                value={formValues.companyName}
                required={true}
                onChange={handleChange}
              />
            </div>
            <div className="flex flex-col w-[70%] gap-2">
              <span className="font-medium text-xl">Unique Id*</span>
              <input
                className="border-2 px-2 py-2 rounded-lg  outline-none "
                type="text"
                name="uniqueId"
                value={formValues.uniqueId}
                required={true}
                onChange={handleChange}
              />
            </div>
            <div className="flex flex-col w-[70%] gap-2">
              <span className="font-medium text-xl">Company Code*</span>
              <input
                className="border-2 px-2 py-2 rounded-lg  outline-none "
                type="text"
                name="companyCode"
                value={formValues.companyCode}
                required={true}
                onChange={handleChange}
              />
            </div>
            <div className="flex flex-col w-[70%] gap-2">
              <span className="font-medium text-xl">Adddress</span>
              <input
                className="border-2 px-2 py-2 rounded-lg  outline-none"
                type="text"
                name="address"
                value={formValues.address}
                onChange={handleChange}
              />
            </div>
            <div className="flex flex-col w-[70%] gap-2">
              <span className="font-medium text-xl">Contact Number</span>
              <input
                className="border-2 px-2 py-2 rounded-lg  outline-none"
                type="text"
                name="contactNumber"
                value={formValues.contactNumber}
                onChange={handleChange}
              />
            </div>
            <div className="flex flex-col w-[70%] gap-2">
              <span className="font-medium text-xl">GST Number</span>
              <input
                className="border-2 px-2 py-2 rounded-lg  outline-none"
                type="text"
                name="gstNumber"
                value={formValues.gstNumber}
                onChange={handleChange}
              />
            </div>
            <div className="flex flex-col w-[70%] gap-2">
              <span className="font-medium text-xl">PAN Number</span>
              <input
                className="border-2 px-2 py-2 rounded-lg  outline-none"
                type="text"
                name="panNumber"
                value={formValues.panNumber}
                onChange={handleChange}
              />
            </div>
            <div className="flex flex-col w-[70%] gap-2">
              <span className="font-medium text-xl">Remarks</span>
              <input
                className="border-2 px-2 py-2 rounded-lg  outline-none"
                type="text"
                name="remarks"
                value={formValues.remarks}
                onChange={handleChange}
              />
            </div>
            <div className="flex flex-col w-[70%] gap-2">
              <span className="font-medium text-xl">Attach New Documents</span>
              <input
                className=" py-2 rounded-lg w-[250px] outline-none"
                type="file"
                multiple
                onChange={handleFileUpload}
              />
            </div>
            <div className="mt-8">
              <button
                type="submit"
                className="font-medium text-sm text-white p-3 rounded bg-primary"
              >
                Update Details
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
export default EditCompany;
