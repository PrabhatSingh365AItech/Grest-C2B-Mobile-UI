import React, { useEffect, useState } from "react";
import AdminNavbar from "../../components/Admin_Navbar";
import SideMenu from "../../components/SideMenu";
import { useNavigate } from "react-router";
import axios from "axios";
import toast from "react-hot-toast";
const navViewOfferr = "/viewofferdetail";

const initForm = {
  offerName: "",
  price: 0,
  validFrom: "",
  validTo: "",
  warranty: true,
};

const Offers = () => {
  const storedItem = sessionStorage.getItem("rowData");
  const userProfile = JSON.parse(sessionStorage.getItem("profile"));
  const item = storedItem && JSON.parse(storedItem);
  const authToken = sessionStorage.getItem("authToken");
  const [sideMenu, setsideMenu] = useState(false);
  const navigate = useNavigate();
  const [formData, setFormData] = useState(initForm);

  const getData = () => {
    const data = {
      offerName: formData.offerName,
      price: formData.price,
      validFrom: formData.validFrom,
      validTo: formData.validTo,
      warranty: formData.warranty,
      createdBy: userProfile._id,
      updatedBy: userProfile._id,
    };
    console.log(data);
    if (item && item.editoffer) {
      const config = {
        method: "put",
        maxBodyLength: Infinity,
        url: `${import.meta.env.VITE_REACT_APP_ENDPOINT}/api/offer/edit/${
          item?._id
        }`,
        data,
        headers: { authorization: authToken },
      };
      axios
        .request(config)
        .then((response) => {
          toast.success("Successfully updated offer details");
          sessionStorage.removeItem("rowData");
          navigate(navViewOfferr);
        })
        .catch((error) => {
          console.log(error);
          toast.error("Failed to updated offer details");
        });
    } else {
      const config = {
        method: "post",
        maxBodyLength: Infinity,
        url: `${import.meta.env.VITE_REACT_APP_ENDPOINT}/api/offer/create`,
        data,
        headers: { authorization: authToken },
      };

      axios
        .request(config)
        .then((response) => {
          toast.success("Successfully created offer");
          navigate(navViewOfferr);
        })
        .catch((error) => {
          console.log(error);
          toast.error("Failed to create offer");
        });
    }
  };

  const handleOffer = (e) => {
    e.preventDefault();
    getData();
  };

  useEffect(() => {
    if (item) {
      const date = new Date(item?.validFrom);
      const year = date.getFullYear();
      const month = `0${date.getMonth() + 1}`.slice(-2);
      const day = `0${date.getDate()}`.slice(-2);
      const dateto = new Date(item?.validTo);
      const yearto = dateto.getFullYear();
      const monthto = `0${dateto.getMonth() + 1}`.slice(-2);
      const dayto = `0${dateto.getDate()}`.slice(-2);

      setFormData({
        offerName: item?.offerName || "",
        price: item?.price || 0,
        validFrom: `${year}-${month}-${day}` || "",
        validTo: `${yearto}-${monthto}-${dayto}` || "",
        warranty: item?.warranty ?? true,
      });
    }
  }, []);

  return (
    <div className="min-h-screen  pb-8 bg-[#F5F4F9]">
      <div className="navbar">
        <AdminNavbar setsideMenu={setsideMenu} sideMenu={sideMenu} />
        <SideMenu setsideMenu={setsideMenu} sideMenu={sideMenu} />
      </div>
      <SubOffer
        formData={formData}
        setFormData={setFormData}
        handleOffer={handleOffer}
      />
    </div>
  );
};

const SubOffer = ({ formData, setFormData, handleOffer }) => {
  const navigate = useNavigate();
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;
    setFormData({
      ...formData,
      [name]: newValue,
    });
  };
  return (
    <div
      style={{
        boxShadow:
          "rgba(0, 0, 0, 0.3) 0px 0px 10px, rgba(0, 0, 0, 0.1) 0px 5px 12px",
      }}
      className="items-center bg-white max-w-[900px] flex py-8 mx-auto mt-4 justify-center flex-col"
    >
      <div className="flex flex-col  w-[900px]">
        <div className="mb-6 flex flex-col gap-2 border-b-2 mr-10 pb-2 ml-10">
          <p className="text-4xl font-bold">Offers</p>
          <p className="text-lg">All fields marked with * are required</p>
        </div>

        <div className="flex flex-wrap gap-2 ml-10 mb-10">
          <button
            onClick={() => navigate(navViewOfferr)}
            className="font-medium text-sm text-white p-3 rounded bg-primary"
          >
            View Detail
          </button>
        </div>
        <form className="ml-10 flex flex-col gap-4">
          <div className="flex flex-col w-[70%] gap-2">
            <span className="font-medium text-xl">Offer Name *</span>
            <input
              id="offerName"
              name="offerName"
              className="border-2 px-2 py-2 rounded-lg outline-none"
              type="text"
              required
              value={formData.offerName}
              onChange={handleChange}
            />
          </div>
          <div className="flex flex-col w-[70%] gap-2">
            <span className="font-medium text-xl">Price *</span>
            <input
              id="price"
              name="price"
              className="border-2 px-2 py-2 rounded-lg  outline-none "
              type="number"
              required
              value={formData.price}
              onChange={handleChange}
            />
          </div>
          <div className="flex flex-col w-[70%] gap-2 ">
            <span className="font-medium text-xl">Valid From *</span>
            <input
              id="validFrom"
              name="validFrom"
              className="border-2 px-2 py-2 rounded-lg  outline-none"
              type="date"
              required
              value={formData.validFrom}
              onChange={handleChange}
            />
          </div>
          <div className="flex flex-col w-[70%] gap-2">
            <span className="font-medium text-xl">Valid To *</span>
            <input
              id="validTo"
              name="validTo"
              className="border-2 px-2 py-2 rounded-lg  outline-none"
              type="date"
              required
              value={formData.validTo}
              onChange={handleChange}
            />
          </div>
          <span className="font-medium text-xl">If Warranty</span>
          <div className="flex gap-2 -mt-2">
            <div
              className={`text-primary font-medium w-[100px] h-[40px] flex items-center justify-center gap-1 p-2 rounded-lg ${
                formData.warranty === true
                  ? "bg-primary text-white"
                  : "border-primary border-2"
              }`}
              onClick={() =>
                setFormData({
                  ...formData,
                  warranty: true,
                })
              }
            >
              True
            </div>
            <div
              className={`text-primary  font-medium w-[100px] h-[40px] flex items-center justify-center gap-1 p-2 rounded-lg ${
                formData.warranty === false
                  ? "bg-primary text-white"
                  : "border-2 border-primary"
              }`}
              onClick={() =>
                setFormData({
                  ...formData,
                  warranty: false,
                })
              }
            >
              False
            </div>
          </div>
          <div className="mt-8">
            <button
              type="submit"
              onClick={(e) => handleOffer(e)}
              className="font-medium text-sm text-white px-8 py-3 rounded bg-primary"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Offers;
