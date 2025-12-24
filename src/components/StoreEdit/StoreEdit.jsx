import React, { useState } from "react";
import { BeatLoader } from "react-spinners";
import axios from "axios";
import { IoClose } from "react-icons/io5";

const StoreEdit = ({ storeData, setEditBoxOpen, setEditSuccess }) => {
  const [isTableLoaded, setIsTableLoaded] = useState(false);
  const [formData, setFormData] = useState(storeData);
  const [response, setResponse] = useState("");

  const closeHandler = () => {
    setEditBoxOpen(false);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;

    setFormData({
      ...formData,
      [name]: newValue,
    });
  };

  const submitHandler = (event) => {
    event.preventDefault();
    setIsTableLoaded(true);
    const token = sessionStorage.getItem("authToken");

    if (formData.email.length <= 5) {
      setResponse("Email size is too small, must be more than 5");
      setIsTableLoaded(false);
      return;
    }

    if (formData.contactNumber.length <= 5) {
      setResponse("Phone number is invalid, size must be more than 5");
      setIsTableLoaded(false);
      return;
    }

    const data = {
      id: formData._id,
      storeName: formData.storeName,
      uniqueId: formData.uniqueId,
      email: formData.email,
      contactNumber: formData.contactNumber,
      region: formData.region,
      address: formData.address,
    };

    const config = {
      method: "put",
      maxBodyLength: Infinity,
      url: `${import.meta.env.VITE_REACT_APP_ENDPOINT}/api/store/edit`,
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
      data,
    };

    axios
      .request(config)
      .then((response1) => {
        setIsTableLoaded(false);
        setResponse(response1.data.msg);
        setEditSuccess(true);
      })
      .catch((error) => {
        setIsTableLoaded(false);
        setResponse("Failed to update data");
      });
  };

  return (
    <div className="min-h-screen pb-8 bg-[#F5F4F9]">
      {isTableLoaded && (
        <div className="fixed top-0 left-0 z-50 flex items-center justify-center w-full h-full bg-black bg-opacity-50">
          <BeatLoader color="var(--primary-color)" loading={isTableLoaded} size={15} />
        </div>
      )}

      <div
        style={{
          boxShadow:
            "rgba(0, 0, 0, 0.3) 0px 0px 10px, rgba(0, 0, 0, 0.1) 0px 5px 12px",
        }}
        className="bg-white w-full max-w-[900px] mx-auto mt-4 py-8 flex flex-col items-center px-4 md:px-10 relative"
      >
        {/* Close Icon */}
        <IoClose
          size={30}
          className="absolute top-4 right-4 text-primary transition hover:rotate-[360deg] duration-500 cursor-pointer"
          onClick={closeHandler}
        />

        <div className="flex flex-col w-full">
          {/* Heading */}
          <div className="mb-6 border-b-2 pb-2">
            <p className="text-3xl md:text-4xl font-bold">Update Store Details</p>
            <p className="text-base md:text-lg">All fields marked with * are required</p>
          </div>

          {/* Form */}
          <form className="flex flex-col gap-4" onSubmit={submitHandler}>
            {[
              { label: "Store Name", name: "storeName", type: "text" },
              { label: "Unique Id", name: "uniqueId", type: "text" },
              { label: "Email", name: "email", type: "email" },
              { label: "Contact Number", name: "contactNumber", type: "number" },
              { label: "Region", name: "region", type: "text" },
              { label: "Adddress", name: "address", type: "text" },
            ].map(({ label, name, type }) => (
              <div key={name} className="flex flex-col gap-2 w-full md:w-[70%]">
                <label className="font-medium text-base md:text-xl">
                  {label}*
                </label>
                <input
                  id={name}
                  name={name}
                  type={type}
                  value={formData[name]}
                  onChange={handleChange}
                  required
                  className="border-2 px-3 py-2 rounded-lg outline-none"
                />
              </div>
            ))}

            <div className="mt-8 flex flex-row flex-wrap items-center gap-4">
              <button
                type="submit"
                className="font-medium text-sm text-white px-4 py-2 rounded bg-primary"
              >
                Update Details
              </button>
              <p className="text-primary">{response}</p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StoreEdit;
