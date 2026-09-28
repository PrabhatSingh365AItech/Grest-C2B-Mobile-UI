import React, { useEffect, useRef, useState } from "react";
const currentDomain = window.location.origin;
const DEFAULT_LOGO = "/Grest_Logo.jpg";
const BUYBACK_LOGO = "/Grest_Logo_2.jpg"; // Use your actual buyback logo

const isBuybackDomain = currentDomain === import.meta.env.VITE_BUYBACK_URL;
const GREST_LOGO = isBuybackDomain ? BUYBACK_LOGO : DEFAULT_LOGO;
import AppFooter from "../../components/AppFooter";
import ProfileBox from "../../components/ProfileBox/ProfileBox";
import styles from "../SelectDevice/SelectDevice.module.css";
import { useNavigate } from "react-router";
import axios from "axios";
import laptop from "../../assets/laptop-logo.png";
import mobile from "../../assets/mobile-logo.png";
import watch from "../../assets/watch_logo.png";
import { ImCancelCircle } from "react-icons/im";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";

export const DeviceTypeFilter = ({
  setSelectedBtn,
  setDeviceType,
  selectedBtn,
}) => {

  const [categories, setCategories] = useState([]);
  const token = sessionStorage.getItem("authToken");
  useEffect(() => {
    getCategories();
  }, []);
    const staticCategories = [
      { name: "Laptops", image: laptop, apiType: "CTG3" },
      { name: "Mobiles", image: mobile, apiType: "CTG1" },
      { name: "Watches", image: watch, apiType: "CTG2" },
      { name: "More", image: null },
    ];

    const getCategories = async () => {

      try {
        const { data } = await axios.get(
          `${import.meta.env.VITE_REACT_APP_ENDPOINT}/api/category/getAll`,
          {headers: { Authorization: token },}
        );
        const mergedCategories = data.data.map((apiCat) => {
          const match = staticCategories.find(
            (staticCat) => staticCat.apiType === apiCat.categoryName
          );
          return {
            ...apiCat,
            image: match?.image || null, // Use the image from static data if available
            apiType: apiCat.categoryCode, // Ensure `apiType` is consistent
          };
        });

        // Append static categories that are not present in API data
        const additionalCategories = staticCategories.filter(
          (staticCat) =>
            !data.data.some(
              (apiCat) => apiCat.categoryName === staticCat.apiType
            )
        );

        // Update state with the merged categories
        setCategories([...mergedCategories, ...additionalCategories]);
      } catch (err) {
        console.log(err);
      }
    };

  const categoryContainerRef = useRef(null);

  const scrollDirection = (directive) => {
    const scrollAmount = 200;

    if (categoryContainerRef.current) {
      if (directive === "left") {
        categoryContainerRef.current.scrollBy({
          left: -scrollAmount,
          behavior: "smooth",
        });
      } else if (directive === "right") {
        categoryContainerRef.current.scrollBy({
          left: scrollAmount,
          behavior: "smooth",
        });
      }
    }
  };
  return (
    <div className={`${styles.select_button_wrap}`}>
      <button
        className={`translate-x-3 ${styles.scroll_button}`}
        onClick={() => scrollDirection("left")}
      >
        <IoIosArrowBack size={30} />
      </button>
      <div
        className={`flex flex-shrink-0 gap-4 overflow-x-auto px-1 scrollbar-hide scroll-smooth ${styles.select_button_box}`}
        ref={categoryContainerRef}
      >
        {categories.map((category, index) => (
          <div
            onClick={() => {
              setSelectedBtn(category.categoryCode);
              setDeviceType(category.apiType);
            }}
            key={index}
            className={
              selectedBtn === category.categoryCode
                ? styles.button_checked
                : styles.button_unchecked
            }
          >
            {category.image && <img src={category.image} alt={category.name} />}
            <span>{category?.categoryName || category?.name}</span>
          </div>
        ))}
      </div>
      <button
        className={`-translate-x-3 ${styles.scroll_button}`}
        onClick={() => scrollDirection("right")}
      >
        <IoIosArrowForward size={30} />
      </button>
    </div>
  );
};

function deviceSetter(DevType) {
  if (DevType === "CTG1") {
    return "Mobiles";
  } else if (DevType === "CTG3") {
    return "Laptops";
  } else if (DevType === "CTG2") {
    return "Watches";
  }
  return "More";
}

function Categories() {
  const Device = sessionStorage.getItem("DeviceType");
  const selBtn = deviceSetter(Device);
  const [brandList, setBrandList] = useState([]);
  const [popout, setPopout] = useState(false);
  const userToken = sessionStorage.getItem("authToken");
  const [selectedBtn, setSelectedBtn] = useState(selBtn);
  const [deviceType, setDeviceType] = useState(Device);

  useEffect(() => {
    console.log(deviceType);
    sessionStorage.setItem("DeviceType", deviceType);
  }, [deviceType]);

  const navigate = useNavigate();

  const handleBrandClick = (brandItem) => {
    console.log("morere", deviceType);
    if (deviceType === "Laptop" || deviceType === undefined) {
      handleDeviceClick();
    } else if (deviceType === "Watch" && brandItem.name !== "Apple") {
      handleDeviceClick();
    } else {
      const detail = { brand: brandItem, models: {}, _id: brandItem._id };
      sessionStorage.setItem("dataModel", JSON.stringify(detail));
      navigate(`/selectdevice/${detail.brand?._id}`);
    }
  };

  const handleDeviceClick = () => {
    setPopout(true);
  };
  const hanldeclose = () => {
    setPopout(false);
  };

  useEffect(() => {
    axios
      .get(
        `${
          import.meta.env.VITE_REACT_APP_ENDPOINT
        }/api/brands/getBrands?deviceType=${deviceType}`,
        {
          headers: {
            authorization: `${userToken}`,
          },
        }
      )
      .then((res) => {
        setBrandList(res.data.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [deviceType]);

  console.log(brandList);

  return (
    <>
      {popout && (
        <div className="absolute -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 h-[270px]  w-[270px] bg-white rounded-md ease-in-out duration-300">
          <div className="text h-[270px]   w-[270px] flex items-center justify-center flex-col relative">
            <ImCancelCircle
              className="absolute top-[7px] right-3"
              size={25}
              onClick={hanldeclose}
            />
            <div className="text-4xl font-bold text-primary p text-center">
              Coming
            </div>
            <div className="text-4xl font-bold text-primary p text-center">
              Soon !
            </div>
          </div>
        </div>
      )}
      <div
        className={
          popout
            ? `flex flex-col pb-16 bg-[#0e0e0d4d] min-h-[100vh] `
            : `flex flex-col pb-16 min-h-[100vh]`
        }
      >
        <div className="flex items-center w-[99%] h-16 py-4 bg-white border-b-2 HEADER ">
          <div className="flex items-center justify-between w-full pl-2">
            <img
              onClick={() => navigate("/selectdevicetype")}
              className="w-40"
              src={GREST_LOGO}
              alt="app logo"
            />
            <ProfileBox />
          </div>
        </div>
        <DeviceTypeFilter
          selectedBtn={selectedBtn}
          setSelectedBtn={setSelectedBtn}
          setDeviceType={setDeviceType}
        />
        <div
          className={` ${styles.cardsContainer} m-4 flex flex-wrap justify-center gap-2 md:gap-8 rounded-md`}
        >
          {brandList &&
            brandList.map((model) => (
              <div
                key={model._id}
                className={`${styles.card} bg-white w-[30%] md:w-[20%] lg:w-[15%] xl:w-[16%] rounded-lg gap-2 flex flex-col items-center px-2 pt-4 pb-2 text-center`}
                onClick={() => handleBrandClick(model)}
              >
                <div className="imagecont h-[60px] w-[80px] flex items-center justify-center">
                  <img
                    className="w-[60px] mb-2"
                    src={model?.logo}
                    alt={model.name}
                  />
                </div>
                <p className="text-[14px] font-medium">{model.name}</p>
              </div>
            ))}
        </div>

        <AppFooter />
      </div>
    </>
  );
}

export default Categories;
