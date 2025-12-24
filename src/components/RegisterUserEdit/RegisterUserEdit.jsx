import React, { useEffect, useState } from "react";
import { BeatLoader } from "react-spinners";
import axios from "axios";
import { IoClose } from "react-icons/io5";
const role = ["Super Admin", "Admin Manager", "Technician", "Sale User", "Super_Admin_Unicorn", "Admin_Manager_Unicorn"];

const RegisterUserEdit = ({ userData, setEditBoxOpen, setEditSuccess }) => {
  const token = sessionStorage.getItem("authToken");
  const [isGrest, setIsGrest] = useState(userData.grestMember ? "yes" : "no");
  const [isTableLoaded, setIsTableLoaded] = useState(false);
  const [formData, setFormData] = useState(userData);
  const [response, setResponse] = useState("");
  const [storeData, setStoreData] = useState([]);
  const [companyData, setCompanyData] = useState([]);

  const getStore = () => {
    setIsTableLoaded(true);
    const config = {
      method: "get",
      url: `${
        import.meta.env.VITE_REACT_APP_ENDPOINT
      }/api/store/findAll?page=0&limit=9999`,
      headers: { Authorization: token },
    };
    axios
      .request(config)
      .then((response2) => {
        console.log(response2.data.result);
        const storeNamesArray = response2.data.result.map((store) => ({
          storeName: store.storeName,
          _id: store._id,
          region: store.region,
        }));
        setStoreData(storeNamesArray);
        setIsTableLoaded(false);
      })
      .catch((error) => {
        console.log(error);
        setIsTableLoaded(false);
      });
  };

  const getCompany = () => {
    setIsTableLoaded(true);
    const config = {
      method: "get",
      url: `${
        import.meta.env.VITE_REACT_APP_ENDPOINT
      }/api/company/findAll?page=0&limit=9999`,
      headers: { Authorization: token },
    };

    axios
      .request(config)
      .then((response1) => {
        const storeNamesArray = response1.data.result.map((company) => ({
          companyName: company.companyName,
          _id: company._id,
        }));
        console.log(storeNamesArray);
        setCompanyData(storeNamesArray);
        setIsTableLoaded(false);
      })
      .catch((error) => {
        console.log(error);
        setIsTableLoaded(false);
      });
  };

  useEffect(() => {
    getStore();
    getCompany();
  }, []);

  const closeHandler = () => {
    setEditBoxOpen(false);
  };

  useEffect(() => {
    setFormData({
      ...formData,
      grestMember: isGrest === "yes",
    });
  }, [isGrest]);

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
    const data = {
      userID: formData._id,
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phoneNumber: formData.phoneNumber,
      companyId: formData.companyId,
      grestMember: formData.grestMember,
      role: formData.role,
      storeId: formData.storeId,
      city: formData.city,
      address: formData.address,
    };

    const config = {
      method: "put",
      maxBodyLength: Infinity,
      url: `${import.meta.env.VITE_REACT_APP_ENDPOINT}/api/userregistry/update`,
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
      data: data,
    };

    axios
      .request(config)
      .then((response2) => {
        console.log(response2);
        setIsTableLoaded(false);
        setResponse(response2.data.msg);
        setEditSuccess(true);
      })
      .catch((error) => {
        console.log(error);
        setIsTableLoaded(false);
        setResponse("Failed to update user");
      });
  };

  return (
    <div style={{ height: "100vh", overflowY: "auto" }}>
      {isTableLoaded && (
        <div className="fixed top-0 left-0 z-50 flex items-center justify-center w-full h-full bg-black bg-opacity-50">
          <BeatLoader color="var(--primary-color)" loading={isTableLoaded} size={15} />
        </div>
      )}
      <RegisterUserEditForm
        closeHandler={closeHandler}
        submitHandler={submitHandler}
        formData={formData}
        handleChange={handleChange}
        isGrest={isGrest}
        setIsGrest={setIsGrest}
        companyData={companyData}
        storeData={storeData}
        response={response}
      />
    </div>
  );
};

const RegisterUserEditForm = ({
  closeHandler,
  submitHandler,
  formData,
  handleChange,
  isGrest,
  setIsGrest,
  companyData,
  storeData,
  response,
}) => {
  return (
    <div
      style={{
        boxShadow:
          "rgba(0, 0, 0, 0.3) 0px 0px 10px, rgba(0, 0, 0, 0.1) 0px 5px 12px",
      }}
      className="items-center bg-white max-w-[900px] flex py-8 mx-auto mt-4 justify-center flex-col"
    >
      <RegisterUserEditSub
        closeHandler={closeHandler}
        submitHandler={submitHandler}
        formData={formData}
        handleChange={handleChange}
        storeData={storeData}
        companyData={companyData}
        isGrest={isGrest}
        setIsGrest={setIsGrest}
        response={response}
      />
    </div>
  );
};

const RegisterUserEditSub = ({
  closeHandler,
  submitHandler,
  formData,
  handleChange,
  storeData,
  companyData,
  isGrest,
  setIsGrest,
  response,
}) => {
  return (
    <div className="flex flex-col w-[900px]">
      <div className="mb-6 relative flex flex-col gap-2 border-b-2 mr-10 pb-2 ml-10">
        <IoClose
          size={35}
          onClick={closeHandler}
          className="absolute right-0 text-primary transition ease hover:rotate-[360deg] duration-500"
        />
        <p className="text-4xl font-bold">Update User Details</p>
        <p className="text-lg">All fields marked with * are required</p>
      </div>
      <form className="ml-10 flex flex-col gap-4" onSubmit={submitHandler}>
        <label className="flex flex-col gap-2 w-[70%]">
          <span className="font-medium text-xl">First name*</span>
          <input
            id="firstName"
            name="firstName"
            className="border-2 px-2 py-2 rounded-lg outline-none"
            placeholder="Enter first name"
            value={formData.firstName}
            onChange={handleChange}
            type="text"
            required
          />
        </label>
        <label className="flex flex-col gap-2 w-[70%]">
          <span className="font-medium text-xl">Last name</span>
          <input
            name="lastName"
            id="lastName"
            placeholder="Enter last name"
            value={formData.lastName}
            className="border-2 px-2 py-2 rounded-lg outline-none"
            onChange={handleChange}
            type="text"
          />
        </label>
        <label className="flex flex-col gap-2 w-[70%]">
          <span className="text-xl font-medium">Email*</span>
          <input
            name="email"
            id="email"
            minLength={5}
            placeholder="Enter your email address"
            className="border-2 px-2 py-2 rounded-lg  outline-none "
            value={formData.email}
            onChange={handleChange}
            type="email"
            required
          />
        </label>
        <label className="flex flex-col w-[70%] gap-2 ">
          <span className="font-medium text-xl">Mobile Number*</span>
          <input
            name="phoneNumber"
            id="phoneNumber"
            minLength={10}
            placeholder="Enter 10-digit mobile number"
            value={formData.phoneNumber}
            onChange={handleChange}
            className="border-2 px-2 py-2 rounded-lg  outline-none"
            type="number"
            required
          />
        </label>
        <label className="flex flex-col w-[70%] gap-2">
          <span className="font-medium text-xl">Store Name*</span>
          <select
            id="storeId"
            name="storeId"
            value={formData.storeId}
            className="outline-none text-base border-2 px-2 py-2 rounded-lg"
            onChange={handleChange}
            required
          >
            <option value="">None</option>
            {storeData.map((item) => (
              <option value={item._id} key={item._id}>
                {`${item.storeName}, ${item.region}`}
              </option>
            ))}
          </select>
        </label>
        <label className="flex w-[70%] flex-col gap-2">
          <span className="font-medium text-xl">Role*</span>
          <select
            id="role"
            className="outline-none text-base border-2 px-2 py-2 rounded-lg"
            name="role"
            value={formData.role}
            onChange={handleChange}
            required
          >
            <option value="">None</option>
            {role.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col w-[70%] gap-2">
          <span className="font-medium text-xl">City</span>
          <input
            name="city"
            id="city"
            value={formData.city}
            placeholder="Enter your city name"
            onChange={handleChange}
            className="border-2 px-2 py-2 rounded-lg  outline-none"
            type="text"
          />
        </label>
        <label className="flex flex-col w-[70%] gap-2">
          <span className="font-medium text-xl">Address</span>
          <input
            name="address"
            id="address"
            placeholder="Enter your full address"
            value={formData.address}
            onChange={handleChange}
            className="border-2 px-2 py-2 rounded-lg  outline-none"
            type="text"
          />
        </label>
        <div className="mt-8">
          <button
            type="submit"
            className="font-medium text-sm text-white p-3 rounded bg-primary"
          >
            Update Details
          </button>
          <p className="text-primary">{response}</p>
        </div>
      </form>
    </div>
  );
};

export default RegisterUserEdit;
