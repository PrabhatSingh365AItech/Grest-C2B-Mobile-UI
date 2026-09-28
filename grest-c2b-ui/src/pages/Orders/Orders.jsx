import AppFooter from "../../components/AppFooter";
import ProfileBox from "../../components/ProfileBox/ProfileBox";
import { useNavigate, useParams } from "react-router";
const currentDomain = window.location.origin;
const DEFAULT_LOGO = "/Grest_Logo.jpg";
const BUYBACK_LOGO = "/Grest_Logo_2.jpg"; // Use your actual buyback logo

const isBuybackDomain = currentDomain === import.meta.env.VITE_BUYBACK_URL;
const GREST_LOGO = isBuybackDomain ? BUYBACK_LOGO : DEFAULT_LOGO;
import styles from "../SelectDevice/SelectDevice.module.css";
import { useEffect, useState } from "react";
import OrdersCreated from "../OrdersCreated/OrdersCreated";
import OrdersCompleted from "../OrdersCompleted/OrdersCompleted";
import QuotesCreated from "../QuotesCreated/QuotesCreated";
import axios from "axios";
import { IoArrowBack } from "react-icons/io5";
const ordCreated = "Order Created";
function Orders() {
  const { daysfilter } = useParams();
  const navigate = useNavigate();
    const token = sessionStorage.getItem("authToken");
  const [selectedBtn, setselectedBtn] = useState(ordCreated);
  const [deviceTypeChanged, setDeviceTypeChanged] = useState(false);
    const [categories, setCategories] = useState([]);
  const buttonList = [ordCreated, "Order Completed", "Quotes Created"];
  const handleDeviceChange = (e) => {
    const val = e.target.value;
    sessionStorage.setItem("DeviceType", val);
    setDeviceTypeChanged((prev) => !prev);
  };
  useEffect(() => {
    console.log(deviceTypeChanged);
  }, [deviceTypeChanged]);
    useEffect(() => {
      getCategories();
    }, []);
  const getCategories = async () => {
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_REACT_APP_ENDPOINT}/api/category/getAll`,
        {
          headers: { Authorization: token },
        }
      );
      setCategories(data.data);
    } catch (err) {
      console.log(err);
    }
  };
  return (
    <>
      <div className={`flex flex-col pb-16 bg-[#f9f9f84d] min-h-[100vh] `}>
        <div className="flex items-center w-[99%] h-16 py-4 bg-white border-b-2 HEADER ">
        <div className="flex items-center justify-between w-full max-w-screen overflow-hidden px-4 py-2">
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => navigate(-1)}
              className="text-xs flex items-center justify-center text-white bg-[--primary-color] hover:cursor-pointer p-2 rounded-full"
            >
              <IoArrowBack size={20} />
            </button>
            <img
              onClick={() => navigate("/selectdevicetype")}
              className="w-[120px] sm:w-[130px] md:w-[150px] object-contain cursor-pointer"
              src={GREST_LOGO}
              alt="app logo"
              />
          </div>
          <ProfileBox />
        </div>
        </div>
        <div
          className={`flex flex-shrink-0 gap-4 px-1 ${styles.select_button_box} justify-evenly`}
        >
          {buttonList.map((val, index) => (
            <div
              key={index}
              onClick={() => {
                setselectedBtn(val);
              }}
              className={
                selectedBtn === val
                  ? `${styles.button_checked} text-center`
                  : `${styles.button_unchecked} text-center`
              }
            >
              {val}
            </div>
          ))}
        </div>
        <div>
          <select
            onChange={handleDeviceChange}
            name=""
            id=""
            className="shadow-lg p-2 rounded-lg m-4"
            defaultValue={sessionStorage.getItem("DeviceType")}
          >
            {categories.map((cat) => (
              <option
                className="bg-white text-primary font-medium"
                key={cat?._id}
                value={cat?.categoryCode}
              >
                {cat?.categoryName}
              </option>
            ))}
          </select>
        </div>
        {selectedBtn === ordCreated && (
          <OrdersCreated daysfilters={daysfilter} head={true} />
        )}
        {selectedBtn === "Order Completed" && (
          <OrdersCompleted daysfilters={daysfilter} head={true} />
        )}
        {selectedBtn === "Quotes Created" && (
          <QuotesCreated daysfilters={daysfilter} head={true} />
        )}
        <AppFooter />
      </div>
    </>
  );
}

export default Orders;
