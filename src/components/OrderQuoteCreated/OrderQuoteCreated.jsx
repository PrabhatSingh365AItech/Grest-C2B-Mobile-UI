import React, { useEffect, useState } from "react";
import OrdersCard from "../../components/OrdersCard/OrdersCard";
const currentDomain = window.location.origin;
const DEFAULT_LOGO = "/Grest_Logo.jpg";
const BUYBACK_LOGO = "/Grest_Logo_2.jpg"; // Use your actual buyback logo

const isBuybackDomain = currentDomain === import.meta.env.VITE_BUYBACK_URL;
const GREST_LOGO = isBuybackDomain ? BUYBACK_LOGO : DEFAULT_LOGO;
import ProfileBox from "../../components/ProfileBox/ProfileBox";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import styles from "../../pages/SelectDeviceType/SelectDeviceType.module.css";
import { CiSearch } from "react-icons/ci";
import axios from "axios";
import { BeatLoader } from "react-spinners";
import { useQuestionContext } from "../../components/QuestionContext";

const OrderQuoteCreated = ({ orderType, daysfilters, head }) => {
  const [data, setData] = useState([]);
  const [flag, setFlag] = useState(true);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { daysfilter } = useParams();
  const { fromDateDup, toDateDup } = useQuestionContext();
  const [serachval, setSerachval] = useState("");
  const deviceType = sessionStorage.getItem("DeviceType");
  const valDays = daysfilter === "custom" ? "" : daysfilter;
  const location = useLocation();
  console.log("loc", location);
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
        }/api/leadSet/getCount?time=${valDays}&search=${serachval}&fromdate=${fromDateDup}&todate=${toDateDup}&datareq=${deviceType}`,
        {
          headers: {
            authorization: `${userToken}`,
          },
        }
      )
      .then((res) => {
        const modifiedDataArray = res.data?.data?.[orderType]?.data.map(
          (leadSetItem) => {
            const storageValue = leadSetItem.lead?.storage;
            const filteredConfig = leadSetItem.lead?.model?.config.filter(
              (configItem) => configItem.storage === storageValue
            );

            return {
              ...leadSetItem,
              lead: {
                ...leadSetItem.lead,
                model: {
                  ...leadSetItem.lead.model,
                  config: filteredConfig.length ? filteredConfig[0] : null,
                },
              },
            };
          }
        );
        setData(modifiedDataArray);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  }, [flag, deviceType]);
  const handleDelete = (itemId) => {
    setLoading(true);
    const userToken = sessionStorage.getItem("authToken");
    axios
      .delete(
        `${
          import.meta.env.VITE_REACT_APP_ENDPOINT
        }/api/leadSet/delete/${itemId}`,
        {
          headers: {
            authorization: `${userToken}`,
          },
        }
      )
      .then((res) => {
        console.log("deleted");
        setFlag(!flag);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  };
  useEffect(() => {
    if (serachval === "") {
      setFlag(!flag);
    }
  }, [serachval]);
  return (
    <div className="min-h-screen">
      {loading && (
        <div className="fixed top-0 left-0 z-50 flex items-center justify-center w-full h-full bg-black bg-opacity-50">
          <BeatLoader color="var(--primary-color)" loading={loading} size={15} />
        </div>
      )}
      {head === undefined && (
        <div className="flex items-center w-[99%] h-16 py-4 bg-white border-b-2 HEADER ">
          <div className="flex items-center justify-between w-full ">
            <ProfileBox />
            <img
              onClick={() => navigate("/selectdevicetype")}
              className="w-40"
              src={GREST_LOGO}
              alt="app logo"
            />
          </div>
        </div>
      )}

      <div
        className={`mx-auto mt-2 flex items-center bg-gray-200  p-2 mb-1 rounded-lg w-[90%] ${styles.search_box}`}
      >
        <div className="flex items-center">
          <CiSearch size={20} className="inline ml-1" />
        </div>
        <input
          placeholder="Search..."
          className="inline w-full mx-2 bg-gray-200 outline-none"
          type="text"
          value={serachval}
          onChange={(e) => setSerachval(e.target.value)}
        />
        <div className=" text-center bg-primary px-2  py-1 rounded-lg">
          <button className="text-white " onClick={handleSeachSubmit}>
            Search
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-4 mt-4">
        {data && data.length > 0 ? (
          data.map((item, index) => (
            <OrdersCard
              allData={item}
              key={index}
              itemData={item}
              title={orderType === "quoteData" ? "Quote Saved" : "Order Saved"}
              customerName={item.lead?.name}
              customerEmail={item.lead?.emailId}
              customerMobile={item.lead?.phoneNumber}
              deviceName={item.lead?.model?.name}
              savedBy={item.user?.name}
              deviceRam={item.lead?.model?.config?.RAM}
              deviceStorage={item.lead?.model?.config?.storage}
              price={item.lead?.price}
              quoteId={item.lead?.uniqueCode}
              dateTime={item.updatedAt}
              phonePhoto={
                item.lead?.model?.phonePhotos?.front
                  ? item.lead?.model?.phonePhotos?.front
                  : "https://grest-c2b-images.s3.ap-south-1.amazonaws.com/gresTest/1705473080031front.jpg"
              }
              handleDelete={handleDelete}
            />
          ))
        ) : (
          !loading && (
            <div className="flex flex-col items-center justify-center min-h-[300px] text-gray-500">
              <p className="text-lg font-medium">
                {orderType === "quoteData" ? "No quotes found" : "No orders found"}
              </p>
              <p className="text-sm">Try adjusting your date filter or search criteria</p>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default OrderQuoteCreated;
