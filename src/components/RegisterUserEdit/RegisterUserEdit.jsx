import React, { useEffect, useState, useRef } from "react";
import { BeatLoader } from "react-spinners";
import axios from "axios";
import { IoClose } from "react-icons/io5";
import { FaAngleDown } from "react-icons/fa6";
import { USER_ROLES } from "../../constants/roleConstants";

const defaultRoles = [
  "Super Admin",
  "Company Admin",
  "Admin Manager",
  "Technician",
  "Sale User",
  "Super_Admin_Unicorn",
  "Admin_Manager_Unicorn",
];

const role = import.meta.env.VITE_REACT_APP_ROLES
  ? import.meta.env.VITE_REACT_APP_ROLES.split(",").map((item) => item.trim())
  : defaultRoles;

/* -------------------- Helper Functions (Extracted) -------------------- */

// Filter roles based on logged-in user
const getFilteredRoles = (isSuperAdmin, isCompanyAdmin, isAdminManager) => {
  if (isSuperAdmin) {
    // Super Admin can see all roles except Technician
    return role.filter((r) => r !== USER_ROLES.TECHNICIAN);
  } else if (isCompanyAdmin) {
    // Company Admin can only see: Admin Manager, Technician, Sale User
    return role.filter(
      (r) =>
        r === USER_ROLES.ADMIN_MANAGER ||
        r === USER_ROLES.TECHNICIAN ||
        r === USER_ROLES.SALE_USER
    );
  } else if (isAdminManager) {
    // Admin Manager can only see: Technician, Sale User
    return role.filter(
      (r) => r === USER_ROLES.TECHNICIAN || r === USER_ROLES.SALE_USER
    );
  }
  return [];
};

const getSelectedStoresDisplay = (formData, storeData) => {
  const selectedCount = (formData.assignedStores || []).length;
  if (selectedCount === 0) {
    return "Select Stores";
  }
  if (selectedCount === 1) {
    const store = storeData.find((s) => s._id === formData.assignedStores[0]);
    return store ? `${store.storeName} - ${store.region}` : "Select Stores";
  }
  return `${selectedCount} stores selected`;
};

const RegisterUserEdit = ({ userData, setEditBoxOpen, setEditSuccess }) => {
  const token = sessionStorage.getItem("authToken");
  const LoggedInUser = JSON.parse(sessionStorage.getItem("profile"));
  const isSuperAdmin = LoggedInUser?.role === USER_ROLES.SUPER_ADMIN;
  const isCompanyAdmin = LoggedInUser?.role === USER_ROLES.COMPANY_ADMIN;
  const isAdminManager = LoggedInUser?.role === USER_ROLES.ADMIN_MANAGER;

  const [isGrest, setIsGrest] = useState(userData.grestMember ? "yes" : "no");
  const [isTableLoaded, setIsTableLoaded] = useState(false);
  const [formData, setFormData] = useState(userData);
  const [apiMessage, setApiMessage] = useState("");
  const [storeData, setStoreData] = useState([]);
  const [companyData, setCompanyData] = useState([]);

  const getStore = async () => {
    if (!formData.companyId) {
      return;
    }
    setIsTableLoaded(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_REACT_APP_ENDPOINT}/api/store/findAll`,
        {
          headers: { Authorization: token },
          params: { companyId: formData.companyId },
        }
      );
      setStoreData(response.data.result || []);
    } catch (error) {
      console.log(error);
      setStoreData([]);
    } finally {
      setIsTableLoaded(false);
    }
  };

  const getCompany = async () => {
    if (!isSuperAdmin) {
      return;
    }
    setIsTableLoaded(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_REACT_APP_ENDPOINT}/api/company/findAll`,
        { headers: { Authorization: token } }
      );
      setCompanyData(response.data.result || []);
    } catch (error) {
      console.log(error);
    } finally {
      setIsTableLoaded(false);
    }
  };

  useEffect(() => {
    // Set company ID for Company Admin/Admin Manager automatically
    if ((isCompanyAdmin || isAdminManager) && LoggedInUser?.companyId) {
      setFormData((prev) => ({ ...prev, companyId: LoggedInUser.companyId }));
    }
  }, []);

  useEffect(() => {
    getCompany();
  }, []);

  useEffect(() => {
    getStore();
  }, [formData.companyId]);

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

    // For Company Admin/Admin Manager, ensure their company ID is used
    const finalCompanyId =
      isCompanyAdmin || isAdminManager
        ? LoggedInUser.companyId
        : formData.companyId;

    const payload = {
      userID: formData._id,
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phoneNumber: formData.phoneNumber,
      companyId: finalCompanyId,
      grestMember: formData.grestMember,
      role: formData.role,
      city: formData.city,
      address: formData.address,
    };

    // Add store fields based on role
    if (
      formData.role === USER_ROLES.ADMIN_MANAGER ||
      formData.role === USER_ROLES.TECHNICIAN
    ) {
      payload.assignedStores = formData.assignedStores || [];
    } else if (
      formData.role !== USER_ROLES.SUPER_ADMIN &&
      formData.role !== USER_ROLES.COMPANY_ADMIN
    ) {
      payload.storeId = formData.storeId;
    }

    const config = {
      method: "put",
      maxBodyLength: Infinity,
      url: `${import.meta.env.VITE_REACT_APP_ENDPOINT}/api/userregistry/update`,
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
      data: payload,
    };

    axios
      .request(config)
      .then((response2) => {
        console.log(response2);
        setIsTableLoaded(false);
        setApiMessage(response2.data.msg);
        setEditSuccess(true);
      })
      .catch((error) => {
        console.log(error);
        setIsTableLoaded(false);
        setApiMessage("Failed to update user");
      });
  };

  return (
    <div style={{ height: "100vh", overflowY: "auto" }}>
      {isTableLoaded && (
        <div className="fixed top-0 left-0 z-50 flex items-center justify-center w-full h-full bg-black bg-opacity-50">
          <BeatLoader
            color="var(--primary-color)"
            loading={isTableLoaded}
            size={15}
          />
        </div>
      )}
      <RegisterUserEditForm
        closeHandler={closeHandler}
        submitHandler={submitHandler}
        formData={formData}
        setFormData={setFormData}
        handleChange={handleChange}
        isGrest={isGrest}
        setIsGrest={setIsGrest}
        companyData={companyData}
        storeData={storeData}
        response={apiMessage}
        isSuperAdmin={isSuperAdmin}
        isCompanyAdmin={isCompanyAdmin}
        isAdminManager={isAdminManager}
      />
    </div>
  );
};

const RegisterUserEditForm = ({
  closeHandler,
  submitHandler,
  formData,
  setFormData,
  handleChange,
  isGrest,
  setIsGrest,
  companyData,
  storeData,
  response,
  isSuperAdmin,
  isCompanyAdmin,
  isAdminManager,
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
        setFormData={setFormData}
        handleChange={handleChange}
        storeData={storeData}
        companyData={companyData}
        isGrest={isGrest}
        setIsGrest={setIsGrest}
        response={response}
        isSuperAdmin={isSuperAdmin}
        isCompanyAdmin={isCompanyAdmin}
        isAdminManager={isAdminManager}
      />
    </div>
  );
};

const FormFields = ({ formData, handleChange, companyData, isSuperAdmin }) => (
  <>
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
    {isSuperAdmin && (
      <label className="flex flex-col w-[70%] gap-2">
        <span className="font-medium text-xl">Company*</span>
        <select
          id="companyId"
          name="companyId"
          value={formData.companyId}
          className="outline-none text-base border-2 px-2 py-2 rounded-lg"
          onChange={handleChange}
          required
        >
          <option value="">Select Company</option>
          {companyData.map((company) => (
            <option key={company._id} value={company._id}>
              {company.name} ({company.companyCode})
            </option>
          ))}
        </select>
      </label>
    )}
  </>
);

const StoreFields = ({
  formData,
  handleChange,
  storeData,
  showStoreDropdown,
  setShowStoreDropdown,
  handleStoreToggle,
  dropdownRef,
  isSuperAdmin,
  isCompanyAdmin,
  isAdminManager,
}) => {
  const showAssignedStores =
    (isSuperAdmin || isCompanyAdmin || isAdminManager) &&
    (formData.role === USER_ROLES.ADMIN_MANAGER ||
      formData.role === USER_ROLES.TECHNICIAN);

  const showSingleStore =
    (isSuperAdmin || isCompanyAdmin || isAdminManager) &&
    formData.role &&
    formData.role !== USER_ROLES.ADMIN_MANAGER &&
    formData.role !== USER_ROLES.TECHNICIAN &&
    formData.role !== USER_ROLES.SUPER_ADMIN &&
    formData.role !== USER_ROLES.COMPANY_ADMIN;

  if (showAssignedStores) {
    return (
      <label className="flex flex-col w-[70%] gap-2">
        <span className="font-medium text-xl">Assigned Stores*</span>
        <div className="relative" ref={dropdownRef}>
          <div
            onClick={() => setShowStoreDropdown(!showStoreDropdown)}
            className="outline-none text-base border-2 px-2 py-2 rounded-lg cursor-pointer flex justify-between items-center"
          >
            <span>{getSelectedStoresDisplay(formData, storeData)}</span>
            <FaAngleDown
              className={`${showStoreDropdown && "rotate-180"}`}
              size={17}
            />
          </div>
          {showStoreDropdown && (
            <div className="absolute z-10 w-full mt-1 bg-white border-2 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {storeData.length > 0 ? (
                storeData.map((store) => (
                  <div
                    key={store._id}
                    className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleStoreToggle(store._id)}
                  >
                    <input
                      type="checkbox"
                      checked={(formData.assignedStores || []).includes(
                        store._id
                      )}
                      onChange={() => {}}
                      className="cursor-pointer"
                    />
                    <span>{`${store.storeName} - ${store.region}`}</span>
                  </div>
                ))
              ) : (
                <div className="px-3 py-2 text-gray-500">
                  No stores available
                </div>
              )}
            </div>
          )}
        </div>
      </label>
    );
  }

  if (showSingleStore) {
    return (
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
    );
  }

  return null;
};

const RegisterUserEditSub = ({
  closeHandler,
  submitHandler,
  formData,
  setFormData,
  handleChange,
  storeData,
  companyData,
  isGrest,
  setIsGrest,
  response,
  isSuperAdmin,
  isCompanyAdmin,
  isAdminManager,
}) => {
  const [showStoreDropdown, setShowStoreDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowStoreDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleStoreToggle = (storeId) => {
    const currentStores = formData.assignedStores || [];
    const updatedStores = currentStores.includes(storeId)
      ? currentStores.filter((id) => id !== storeId)
      : [...currentStores, storeId];
    setFormData({ ...formData, assignedStores: updatedStores });
  };

  const filteredRoles = getFilteredRoles(
    isSuperAdmin,
    isCompanyAdmin,
    isAdminManager
  );

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
        <FormFields
          formData={formData}
          handleChange={handleChange}
          companyData={companyData}
          isSuperAdmin={isSuperAdmin}
        />
        <StoreFields
          formData={formData}
          handleChange={handleChange}
          storeData={storeData}
          showStoreDropdown={showStoreDropdown}
          setShowStoreDropdown={setShowStoreDropdown}
          handleStoreToggle={handleStoreToggle}
          dropdownRef={dropdownRef}
          isSuperAdmin={isSuperAdmin}
          isCompanyAdmin={isCompanyAdmin}
          isAdminManager={isAdminManager}
        />
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
            {filteredRoles.map((item) => (
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
