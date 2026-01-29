import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminNavbar from "../components/Admin_Navbar";
import SideMenu from "../components/SideMenu";
import { BeatLoader } from "react-spinners";
import axios from "axios";
import { IoIosCheckmarkCircle, IoIosCloseCircle } from "react-icons/io";
import CouponForm from "../components/CouponForm";
import toast from "react-hot-toast";

const FIELD_PRICE_RANGE_MIN = "devicePriceRange.min";
const FIELD_PRICE_RANGE_MAX = "devicePriceRange.max";
const PAGE_TITLE_CREATE = "Create Coupon";
const PAGE_TITLE_EDIT = "Edit Coupon";
const ROUTE_COUPON_DETAILS = "/coupondetails";

const LoadingSpinner = ({ isLoading }) => {
  if (!isLoading) {
    return null;
  }
  return (
    <div className="fixed top-0 left-0 z-50 flex items-center justify-center w-full h-full bg-black bg-opacity-50">
      <BeatLoader color="var(--primary-color)" loading={isLoading} size={15} />
    </div>
  );
};

const ResultModal = ({ isOpen, isSuccess, message, onClose }) => {
  if (!isOpen) {
    return null;
  }
  return (
    <div className="fixed top-0 left-0 z-50 flex items-center justify-center w-full h-full bg-black bg-opacity-50">
      <div
        className={`bg-white w-1/2 rounded-lg flex flex-col justify-center items-center p-5 gap-5 ${
          isSuccess ? "text-green-500" : "text-primary"
        }`}
      >
        {isSuccess ? (
          <IoIosCheckmarkCircle size={90} />
        ) : (
          <IoIosCloseCircle size={90} />
        )}
        <h6 className="text-3xl font-bold">
          {isSuccess ? "Success!" : "Error!"}
        </h6>
        <p className="text-lg font-medium text-slate-500 text-center">
          {message}
        </p>
        <button
          onClick={onClose}
          className={`shadow-md px-8 py-2 mt-2 rounded-lg text-lg font-medium
              transition-all duration-500 ease-in-out cursor-pointer hover:shadow-lg ${
                isSuccess ? "bg-green-500 text-white" : "text-white bg-primary"
              }`}
        >
          Okay
        </button>
      </div>
    </div>
  );
};

const PageHeader = ({ pageTitle, navigate }) => (
  <div className="flex flex-col w-full px-10">
    <div className="mb-6 flex flex-col gap-2 border-b-2 pb-2">
      <div className="flex items-center gap-6">
        <p className="text-4xl font-bold">{pageTitle}</p>
      </div>
      <p className="text-lg">All fields marked with * are required</p>
    </div>
    <div className="flex flex-wrap gap-2 mb-10">
      <button
        onClick={() => navigate(ROUTE_COUPON_DETAILS)}
        className="font-medium text-sm text-white p-3 rounded
            bg-primary shadow-sm hover:shadow-md transition-shadow"
      >
        View Details
      </button>
    </div>
  </div>
);

const FormContainer = ({ children }) => (
  <div
    style={{
      boxShadow:
        "rgba(0, 0, 0, 0.3) 0px 0px 10px, rgba(0, 0, 0, 0.1) 0px 5px 12px",
    }}
    className="items-center bg-white max-w-4xl flex py-8 mx-auto mt-4 justify-center flex-col"
  >
    {children}
  </div>
);

const useCouponAutoGenerate = (
  isEditMode,
  isCodeManuallyChanged,
  formData,
  storeData,
  setFormData
) => {
  useEffect(() => {
    if (
      !isEditMode &&
      !isCodeManuallyChanged &&
      formData.discountValue &&
      formData.storeId &&
      formData.storeId.length > 0 // Check if array has items
    ) {
      let storePrefix = "STR";

      // Logic for naming:
      if (formData.storeId.length === 1) {
        const selectedStore = storeData.find(
          (store) => store._id === formData.storeId[0]
        );
        if (selectedStore) {
          storePrefix = getStorePrefix(selectedStore.storeName);
        }
      } else {
        storePrefix = "MUL"; // "Multiple" stores
      }

      const value = formData.discountValue;
      const typeSuffix = formData.discountType === "Percentage" ? "P" : "";
      const baseCode = `SW${value}${typeSuffix}`;
      const generatedCode = `${storePrefix}-${baseCode}`.toUpperCase();
      setFormData((prev) => ({ ...prev, couponCode: generatedCode }));
    }
  }, [
    formData.discountValue,
    formData.discountType,
    formData.storeId,
    isCodeManuallyChanged,
    storeData,
    isEditMode,
    setFormData,
    formData,
  ]);
};

const formatDateForInput = (dateString) => {
  if (!dateString) {
    return "";
  }
  try {
    return new Date(dateString).toISOString().split("T")[0];
  } catch (e) {
    console.error("Invalid date string for formatting:", dateString);
    return "";
  }
};

const getStorePrefix = (storeName = "") => {
  return storeName
    .replace(/[^a-zA-Z0-9]/g, "")
    .substring(0, 3)
    .toUpperCase();
};

const validateCouponCode = (couponCode) => {
  if (!couponCode.trim()) {
    return "Coupon Code is required.";
  }
  if (/\s/.test(couponCode)) {
    return "Coupon Code cannot contain spaces.";
  }
  return null;
};

const validateDiscountValue = (discountValue) => {
  if (!discountValue) {
    return "Discount value is required.";
  }
  if (Number(discountValue) <= 0) {
    return "Discount value must be greater than zero.";
  }
  return null;
};

const validatePriceRange = (minPrice, maxPriceInput) => {
  if (minPrice < 0) {
    return "Minimum price cannot be negative.";
  }
  if (maxPriceInput && Number(maxPriceInput) <= minPrice) {
    return "Maximum price must be greater than minimum price.";
  }
  return null;
};

const validateDates = (validFrom, validTo, isEditMode) => {
  if (!validFrom || !validTo) {
    return 'Both "Valid From" and "Valid To" dates are required.';
  }
  const fromDate = new Date(validFrom);
  const toDate = new Date(validTo);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (toDate < fromDate) {
    return '"Valid To" date cannot be before "Valid From" date.';
  }
  if (!isEditMode && toDate < today) {
    return "The coupon validity period cannot end in the past.";
  }
  return null;
};

const validateForm = (formData, isEditMode) => {
  const errors = {};

  const couponCodeError = validateCouponCode(formData.couponCode);
  if (couponCodeError) {
    errors.couponCode = couponCodeError;
  }

  // CHANGED: Validation for array length
  if (!formData.storeId || formData.storeId.length === 0) {
    errors.storeId = "At least one store must be selected.";
  }

  const discountError = validateDiscountValue(formData.discountValue);
  if (discountError) {
    errors.discountValue = discountError;
  }

  const minPrice = Number(formData[FIELD_PRICE_RANGE_MIN]);
  const maxPriceInput = formData[FIELD_PRICE_RANGE_MAX];
  const priceRangeError = validatePriceRange(minPrice, maxPriceInput);
  if (priceRangeError) {
    errors.priceRange = priceRangeError;
  }

  const datesError = validateDates(
    formData.validFrom,
    formData.validTo,
    isEditMode
  );
  if (datesError) {
    errors.dates = datesError;
  }

  return errors;
};

const getStores = async (token) => {
  const endpoint = `${
    import.meta.env.VITE_REACT_APP_ENDPOINT
  }/api/store/findAll`;
  const config = {
    method: "get",
    url: `${endpoint}?page=0&limit=9999`,
    headers: { Authorization: token },
  };
  try {
    const response = await axios.request(config);
    return response.data.result.map((store) => ({
      storeName: store.storeName,
      _id: store._id,
      region: store.region,
    }));
  } catch (error) {
    console.error("Error fetching stores:", error);
    const errorMessage = `Failed to fetch stores: ${
      error.response?.data?.message || "Check permissions."
    }`;
    toast.error(errorMessage);
    return [];
  }
};

const initForm = {
  couponCode: "",
  storeId: [], //Initialize as array
  [FIELD_PRICE_RANGE_MIN]: "0",
  [FIELD_PRICE_RANGE_MAX]: "",
  discountType: "Fixed",
  discountValue: "",
  validFrom: "",
  validTo: "",
  status: "Active",
};

const CreateCoupon = () => {
  const { id } = useParams();
  const isEditMode = !!id;
  const token = sessionStorage.getItem("authToken");
  const navigate = useNavigate();
  const [formData, setFormData] = useState(initForm);
  const [storeData, setStoreData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [isSuccessModal, setIsSuccessModal] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [isCodeManuallyChanged, setIsCodeManuallyChanged] = useState(false);
  const [pageTitle, setPageTitle] = useState(PAGE_TITLE_CREATE);
  const [sideMenu, setSideMenu] = useState(false);

  useEffect(() => {
    const fetchAllStores = async () => {
      setIsLoading(true);
      const stores = await getStores(token);
      setStoreData(stores);
      setIsLoading(false);
    };
    if (token) {
      fetchAllStores();
    }
  }, [token]);

  useEffect(() => {
    if (!isEditMode) {
      return;
    }
    setIsLoading(true);
    setPageTitle(PAGE_TITLE_EDIT);
    const fetchCouponData = async () => {
      try {
        const endpoint = `${
          import.meta.env.VITE_REACT_APP_ENDPOINT
        }/api/coupons/list?id=${id}`;
        const response = await axios.get(endpoint, {
          headers: { Authorization: token },
        });

        if (response.data.data && response.data.data.length > 0) {
          const coupon = response.data.data[0];
          const maxPrice =
            coupon.devicePriceRange.max === Infinity
              ? ""
              : coupon.devicePriceRange.max;
          setFormData({
            ...coupon,
            // Ensure storeId is handled if backend returns object or string, but now it should be array
            storeId: Array.isArray(coupon.storeId)
              ? coupon.storeId
              : [coupon.storeId],
            [FIELD_PRICE_RANGE_MIN]: coupon.devicePriceRange.min,
            [FIELD_PRICE_RANGE_MAX]: maxPrice,
            validFrom: formatDateForInput(coupon.validFrom),
            validTo: formatDateForInput(coupon.validTo),
          });
        } else {
          throw new Error("Coupon not found.");
        }
      } catch (error) {
        toast.error("Could not load coupon data for editing.");
        navigate(ROUTE_COUPON_DETAILS);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCouponData();
  }, [id, isEditMode, token, navigate]);

  useCouponAutoGenerate(
    isEditMode,
    isCodeManuallyChanged,
    formData,
    storeData,
    setFormData
  );

  const handleChange = useCallback(
    (e) => {
      const { name, value } = e.target;

      if (name === "couponCode") {
        setIsCodeManuallyChanged(true);
      }
      if (["discountType", "discountValue", "storeId"].includes(name)) {
        setIsCodeManuallyChanged(false);
      }

      // We simply use the value passed in (which for storeId is already the array of IDs)
      setFormData((prevData) => ({ ...prevData, [name]: value }));

      if (formErrors[name] || formErrors.dates || formErrors.priceRange) {
        const newErrors = { ...formErrors };
        delete newErrors[name];
        if (name.includes("devicePriceRange")) {
          delete newErrors.priceRange;
        }
        if (name.includes("valid")) {
          delete newErrors.dates;
        }
        setFormErrors(newErrors);
      }
    },
    [formErrors]
  );

  const submitHandler = useCallback(
    async (event) => {
      event.preventDefault();
      const errors = validateForm(formData);
      setFormErrors(errors);
      if (Object.keys(errors).length > 0) {
        return;
      }
      setIsLoading(true);
      const payload = {
        couponCode: formData.couponCode.trim().toUpperCase(),
        storeId: formData.storeId, // Now sending array
        devicePriceRange: {
          min: Number(formData[FIELD_PRICE_RANGE_MIN]),
          max: formData[FIELD_PRICE_RANGE_MAX]
            ? Number(formData[FIELD_PRICE_RANGE_MAX])
            : Infinity,
        },
        discountType: formData.discountType,
        discountValue: Number(formData.discountValue),
        validFrom: formData.validFrom,
        validTo: formData.validTo,
        status: formData.status,
      };
      const apiEndpoint = import.meta.env.VITE_REACT_APP_ENDPOINT;
      const url = isEditMode
        ? `${apiEndpoint}/api/coupons/update/${id}`
        : `${apiEndpoint}/api/coupons/create`;
      const config = {
        method: isEditMode ? "put" : "post",
        url,
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
        data: payload,
      };

      try {
        await axios.request(config);
        const action = isEditMode ? "updated" : "created";
        setModalMessage(`Coupon ${action} successfully`);
        setIsSuccessModal(true);
        setIsModalOpen(true);
        if (isEditMode) {
          setTimeout(() => navigate(ROUTE_COUPON_DETAILS), 1500);
        } else {
          setFormData(initForm);
          setFormErrors({});
          setIsCodeManuallyChanged(false);
        }
      } catch (error) {
        const backendMessage = error.response?.data?.message;
        const errorMessage = backendMessage || "An unknown error occurred.";
        const action = isEditMode ? "update" : "create";
        setModalMessage(`Failed to ${action} coupon: ${errorMessage}`);
        setIsSuccessModal(false);
        setIsModalOpen(true);
      } finally {
        setIsLoading(false);
      }
    },
    [formData, token, isEditMode, id, navigate]
  );

  return (
    <div className="min-h-screen pb-20 bg-[#F5F4F9]">
      <div className="navbar">
        <AdminNavbar setsideMenu={setSideMenu} sideMenu={sideMenu} />
        <SideMenu setsideMenu={setSideMenu} sideMenu={sideMenu} />
      </div>

      <LoadingSpinner isLoading={isLoading} />

      <ResultModal
        isOpen={isModalOpen}
        isSuccess={isSuccessModal}
        message={modalMessage}
        onClose={() => setIsModalOpen(false)}
      />

      <FormContainer>
        <PageHeader pageTitle={pageTitle} navigate={navigate} />
        <div className="w-full px-10">
          <CouponForm
            formData={formData}
            submitHandler={submitHandler}
            handleChange={handleChange}
            storeData={storeData}
            errors={formErrors}
            formType={isEditMode ? "update" : "create"}
          />
        </div>
      </FormContainer>
    </div>
  );
};

export default CreateCoupon;
