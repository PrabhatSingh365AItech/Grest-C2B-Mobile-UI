import React, { useEffect, useState } from "react";
import OrdersCard from "../../components/OrdersCard/OrdersCard";
const currentDomain = window.location.origin;
const DEFAULT_LOGO = "/Grest_Logo.jpg";
const BUYBACK_LOGO = "/Grest_Logo_2.jpg"; // Use your actual buyback logo

const isBuybackDomain = currentDomain === import.meta.env.VITE_BUYBACK_URL;
const GREST_LOGO = isBuybackDomain ? BUYBACK_LOGO : DEFAULT_LOGO;
import ProfileBox from "../../components/ProfileBox/ProfileBox";
import { useNavigate, useParams } from "react-router-dom";
import styles from "../SelectDeviceType/SelectDeviceType.module.css";
import { CiSearch } from "react-icons/ci";
import axios from "axios";
import { BeatLoader } from "react-spinners";
import { useQuestionContext } from "../../components/QuestionContext";

const OrdersCompleted = ({ daysfilters, head }) => {
  const [newOrderCompletedData, setNewOrderCompletedData] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { daysfilter } = useParams();
  const [flag, setFlag] = useState(true);
  const [serachval, setSerachval] = useState("");
  const { fromDateDup, toDateDup } = useQuestionContext();
  const deviceType = sessionStorage.getItem("DeviceType");
  const valDays = daysfilter === "custom" ? "" : daysfilter;
  const handleSeachSubmit = () => {
    setFlag(!flag);
  };

  useEffect(() => {
    setLoading(true);
    const userToken = sessionStorage.getItem("authToken");
    axios
      .get(
        `${
          import.meta.env.VITE_REACT_APP_ENDPOINT
        }/api/user/Dashboard/order/saled?time=${valDays}&search=${serachval}&fromdate=${fromDateDup}&todate=${toDateDup}&datareq=${deviceType}`,
        {
          headers: {
            authorization: `${userToken}`,
          },
        }
      )
      .then((res) => {
        console.log("ras", res.data?.Leads);
        const modifiedDataArray = res.data?.Leads.map((data) => {
          const storageValue = data.storage;
          const ramValue = data.ram;
          const filteredConfig = data.model?.config.filter(
            (configItem) => configItem.storage === storageValue && configItem.RAM === ramValue
          );

          return {
            ...data,
            model: {
              ...data.model,
              config: filteredConfig.length ? filteredConfig[0] : null,
            },
          };
        });
        console.log("modifiedData", modifiedDataArray);
        setNewOrderCompletedData(modifiedDataArray);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  }, [flag, deviceType]);

  useEffect(() => {
    if (serachval === "") {
      setFlag(!flag);
    }
  }, [serachval]);
  return (
    <div className="min-h-screen">
      {loading && (
        <div className="fixed top-0 left-0 z-50 flex items-center justify-center h-full w-full bg-black bg-opacity-50">
          <BeatLoader loading={loading} color="var(--primary-color)" size={15} />
        </div>
      )}
      {head === undefined && (
        <div className="flex items-center h-16 w-screen py-4 border-b-2 bg-white HEADER ">
          <div className="w-full flex items-center justify-between  ">
            <ProfileBox />
            <img
              className="w-40"
              onClick={() => navigate("/selectdevicetype")}
              src={GREST_LOGO}
              alt="app logo"
            />
          </div>
        </div>
      )}

      <div
        className={`mt-2 mx-auto flex items-center p-2 mb-1 bg-gray-200 rounded-lg w-[90%] ${styles.search_box}`}
      >
        <div className="flex items-center">
          <CiSearch className="inline ml-1" size={20} />
        </div>
        <input
          className="inline w-full mx-2 bg-gray-200 outline-none"
          placeholder="Search..."
          type="text"
          value={serachval}
          onChange={(e) => setSerachval(e.target.value)}
        />
        <div className="bg-primary text-center px-2 py-1 rounded-lg">
          <button onClick={handleSeachSubmit} className="text-white ">
            Search
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-4 mt-4">
        {newOrderCompletedData && newOrderCompletedData.length > 0 ? (
          newOrderCompletedData.map((item, index) => (
            <OrdersCard
              allData={item}
              key={index}
              itemData={item}
              title={"Order Completed"}
              customerName={item?.name}
              customerEmail={item.lead?.emailId}
              customerMobile={item?.phoneNumber}
              deviceName={item?.model?.name}
              savedBy={item.user?.name}
              deviceRam={item.model?.config?.RAM}
              deviceStorage={item.model?.config?.storage}
              price={item.price}
              quoteId={item.uniqueCode}
              phonePhoto={
                item.model?.phonePhotos?.front
                  ? item.model?.phonePhotos?.front
                  : "https://grest-c2b-images.s3.ap-south-1.amazonaws.com/gresTest/1705473080031front.jpg"
              }
              dateTime={item.updatedAt}
            />
          ))
        ) : (
          !loading && (
            <div className="flex flex-col items-center justify-center min-h-[300px] text-gray-500">
              <p className="text-lg font-medium">No completed orders found</p>
              <p className="text-sm">Try adjusting your date filter or search criteria</p>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default OrdersCompleted;
