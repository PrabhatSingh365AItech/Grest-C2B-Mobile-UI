import React, { useEffect, useState } from "react";
import DevicePriceCards from "../components/DevicePriceCards";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useQuestionContext } from "../components/QuestionContext";
const currentDomain = window.location.origin;
const DEFAULT_LOGO = "/Grest_Logo.jpg";
const BUYBACK_LOGO = "/Grest_Logo_2.jpg"; // Use your actual buyback logo

const isBuybackDomain = currentDomain === import.meta.env.VITE_BUYBACK_URL;
const GREST_LOGO = isBuybackDomain ? BUYBACK_LOGO : DEFAULT_LOGO;
import { setOtpVerified } from "../store/slices/otpSlice";
import { useDispatch, useSelector } from "react-redux";
import User_Logo from "../assets/User_Logo.jpg";
import SummaryModal from "../components/SummaryModal";
import { CgSpinner } from "react-icons/cg";
import apple_watch from "../assets/apple_watch.png";
import ReactDOMServer from "react-dom/server";
import html2pdf from "html2pdf.js";
import PurchaseReceipt from "../components/PurchaseReceipt";
import { IoArrowBack } from "react-icons/io5";
export const CouponCard = ({ title, code, hanldePermanenet, isSelected }) => {
  return (
    <div
      className={`bg-gradient-to-br from-[#f4bdcd]   max-w-[400px]
       text-white rounded-md mx-4 px-2 py-4 ${
         isSelected ? "to-[#f70e4c]" : " to-[#dd6887]"
       }
      }
       `}
    >
      <div></div>
      <div
        className="flex items-center justify-between gap-1"
        onClick={hanldePermanenet}
      >
        <div className="rounded-full bg-white flex items-center justify-center border-2 h-[70px] w-[70px]">
          <img className="w-[75%]" src={GREST_LOGO} alt="" />
        </div>
        <div className="">
          <p className="font-bold  w-[80px] text-xl relative ]">{code}</p>
          <p className="text-sm pl-1 w-[160px] font-medium">{title}</p>
        </div>
        <div className="border-l-2 h-[80px]"></div>
        <div className="h-[80px] w-[80px] p-2 font-bold text-[20px] text-center">
          <p className="">Grab Offer</p>
        </div>
      </div>
    </div>
  );
};

//cupon card dynamic created discount
export const DynamicCouponCard = ({
  discount,
  hanldePermanenet,
  isSelected,
}) => {
  return (
    <div
      className={`bg-gradient-to-br from-[#f4bdcd]   max-w-[400px]
       text-white rounded-md mx-4 px-2 py-4 ${
         isSelected === discount ? "to-[#f70e4c]" : " to-[#dd6887]"
       }
      }
       `}
    >
      <div></div>
      <div
        className="flex items-center justify-between gap-1"
        onClick={hanldePermanenet}
      >
        <div className="rounded-full bg-white flex items-center justify-center border-2 h-[70px] w-[70px]">
          <img className="w-[75%]" src={GREST_LOGO} alt="" />
        </div>
        <div className="">
          <p className="font-bold  w-[80px] text-xl relative ]">{`GRU${discount}`}</p>

          <p className="text-sm pl-1 w-[160px] font-medium">{`Unlock a ${discount} Bonus on Your Old Mobile Phone Trade-In!`}</p>
        </div>
        <div className="border-l-2 h-[80px]"></div>
        <div className="h-[80px] w-[80px] p-2 font-bold text-[20px] text-center">
          <p className="">Grab Offer</p>
        </div>
      </div>
    </div>
  );
};

function hanldlejsx_pdf(leadData, setReceipt) {
  console.log("store is", leadData?.store?.storeName);
  console.log("store is", leadData?.emailId);

  const dateString = leadData?.updatedAt;
  const formattedDate = new Date(dateString).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const printElement = ReactDOMServer.renderToString(
    <PurchaseReceipt
      phoneNumber={leadData?.phoneNumber}
      aadharNumber={leadData?.aadharNumber}
      uniqueCode={leadData?.uniqueCode}
      emailId={leadData?.emailId}
      name={leadData?.name}
      price={leadData?.price}
      imeiNumber={leadData?.documentId?.IMEI}
      phoneName={leadData?.modelId?.name}
      type={leadData?.modelId?.type}
      storeName={leadData?.store?.storeName}
      region={leadData?.store?.region}
      address={leadData?.store?.address}
      storage={leadData?.storage}
      RAM={leadData?.ram}
      formattedDate={formattedDate}
    />
  );

  html2pdf()
    .set({
      margin: 10,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, logging: false },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      pagebreak: { mode: ["css", "legacy"] }, // Ensure page breaks work
    })
    .from(printElement)
    .outputPdf("blob") // Get Blob output
    .then((blob) => {
      const file = new File([blob], "Purchase_Receipt.pdf", {
        type: "application/pdf",
      });
      console.log("Generated PDF File:", file);
      setReceipt(file); // Store in state
    })
    .catch((err) => console.error("PDF Generation Error:", err));
}

const SpecialOffers = () => {
  const storedDisableBtn = sessionStorage.getItem("disableBtn");
  const initialDisableBtn = storedDisableBtn
    ? JSON.parse(storedDisableBtn)
    : false;
  const discountAvailable = 0;
  const userToken = sessionStorage.getItem("authToken");
  const [discountData, setDiscountData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const responseData = useSelector((state) => state.responseData);
  const Price = useSelector((state) => state.responseData.price);
  const [isSelected, setIsSelected] = useState(null);
  const [extraBonus, setExtraBonus] = useState(0);
  const [disableBtn, setDisableBtn] = useState(initialDisableBtn);
  const [phonePrice, setPhonePrice] = useState(Price + responseData.bonus);
  const dispatch = useDispatch(false);
  const { setAnswers } = useQuestionContext();
  const leadId = sessionStorage.getItem("LeadId");
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(setOtpVerified(false));
  }, []);
  const handleViewSummary = () => {
    const bonus = Number(phonePrice) - Number(Price);
    setExtraBonus(bonus);
    setShowModal(true);
  };
  const handleCloseModal = () => {
    setShowModal(false);
  };
  useEffect(() => {
    axios
      .get(
        `${
          import.meta.env.VITE_REACT_APP_ENDPOINT
        }/api/discounts/findByLeadId?leadId=${leadId}`,
        { headers: { authorization: userToken } }
      )
      .then((res) => {
        setDiscountData(res.data.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  const handleOffer = (number) => {
    const finalPayload = {
      leadId: leadId,
      discount: number,
    };
    axios
      .post(
        `${
          import.meta.env.VITE_REACT_APP_ENDPOINT
        }/api/discounts/applyDiscount`,
        finalPayload,
        { headers: { authorization: userToken, "X-Skip-Interceptor": "true" } }
      )
      .then((res) => {
        const newPrice = res.data.data.price + discountAvailable;
        console.log("dasd", res.data.data);
        localStorage.setItem("ItemPrice", newPrice);
        setPhonePrice(newPrice);
      })
      .catch((err) => {
        console.log(err);
      });
  };
  const navigateHome = () => {
    if (disableBtn) {
      setTimeout(() => {
        navigate("/selectDeviceType");
        sessionStorage.setItem("disableBtn", JSON.stringify(false));
        sessionStorage.setItem("myMessageKey", "");
      }, 30000);
    } else {
      console.log("clicked");
    }
  };

  const handleSubmit = () => {
    setIsLoading(true);
    const userIdToken = sessionStorage.getItem("authToken");
    const LeadId = sessionStorage.getItem("LeadId");
    const formData = new FormData();
    formData.append("id", LeadId);
    formData.append("bonusPrice", responseData.bonus);
    formData.append("sellingPrice", Math.round(responseData.price));
    axios
      .post(
        `${
          import.meta.env.VITE_REACT_APP_ENDPOINT
        }/api/questionnaires/item-purchased`,
        formData,
        { headers: { Authorization: userIdToken } }
      )
      .then((response) => {
        setAnswers([]);
        sessionStorage.setItem("messageReceived", response.data.message);
        sessionStorage.setItem("disableBtn", JSON.stringify(true));
        setDisableBtn(true);
        navigate("/productsold");
        navigateHome();
      })
      .catch((err) => {
        console.log(err);
        setIsLoading(false);
      });
  };

  const hanldePermanenet = (code) => {
    if (isSelected === code) {
      setIsSelected("0");
    } else {
      setIsSelected(code);
    }
  };

  useEffect(() => {
    if (isSelected === "0") {
      handleOffer(0.00001);
    }
    if (isSelected === "GRU250") {
      handleOffer(250);
    } else if (isSelected === "GRU500") {
      handleOffer(500);
    } else {
      handleOffer(isSelected);
    }
  }, [isSelected]);

  return (
    <div className="min-h-screen mb-10 overflow-y-auto bg-white">
      <SubSpecialOffers
        navigate={navigate}
        phonePrice={phonePrice}
        Price={Price}
        hanldePermanenet={hanldePermanenet}
        isSelected={isSelected}
        discountData={discountData}
        handleViewSummary={handleViewSummary}
        handleSubmit={handleSubmit}
        isLoading={isLoading}
        showModal={showModal}
        handleCloseModal={handleCloseModal}
        extraBonus={extraBonus}
      />
    </div>
  );
};

const SubSpecialOffers = ({
  phonePrice,
  Price,
  hanldePermanenet,
  isSelected,
  discountData,
  handleViewSummary,
  handleSubmit,
  isLoading,
  showModal,
  handleCloseModal,
  extraBonus,
}) => {
  const navigate = useNavigate();
  const Device = sessionStorage.getItem("DeviceType");
  const DummyImg =
    Device === "CTG1"
      ? "https://grest-c2b-images.s3.ap-south-1.amazonaws.com/gresTest/1705473080031front.jpg"
      : apple_watch;
  const phoneImg = JSON.parse(sessionStorage.getItem("dataModel"));
  const phoneFrontPhoto =
    phoneImg?.models?.phonePhotos?.front ||
    phoneImg?.models?.phonePhotos?.upFront;
  const dataModelInfo = JSON.parse(sessionStorage.getItem("dataModel"));
  const LoggedInUser = JSON.parse(sessionStorage.getItem("profile"));
  return (
    <div>
      <div className="flex items-center w-[99%] h-16 py-4 bg-white border-b-2 HEADER header">
        <div className="flex items-center justify-between w-full pr-4">
          <div className="flex items-center gap-2 ml-4">
            <button
              onClick={() => navigate(-1)}
              className="text-xs ml-2 flex items-center justify-center text-white bg-[--primary-color] hover:cursor-pointer p-2 rounded-full"
            >
              <IoArrowBack size={24} />
            </button>
            <img
              onClick={() => navigate("/selectdevicetype")}
              className="w-40"
              src={GREST_LOGO}
              alt="app logo"
            />
          </div>
          <p className=" text-base md:text-xl">{LoggedInUser?.name}</p>
          <img className="w-[30px]" src={User_Logo} alt="" />
        </div>
      </div>
      <div className="w-[90%] md:w-[70%] mx-auto mt-4  ">
        <p className="mb-2 text-lg font-medium">
          The best price for your phone is:
        </p>
        <DevicePriceCards
          phonePhoto={phoneFrontPhoto ? phoneFrontPhoto : DummyImg}
          model={dataModelInfo?.models?.name}
          price={phonePrice}
          ram={dataModelInfo?.models?.config?.RAM}
          storage={dataModelInfo?.models?.config?.storage}
          type={dataModelInfo?.models?.type}
        />
      </div>
      <div className="fixed bottom-0 flex flex-col w-full gap-2 p-4 bg-white border-t-2 ">
        <div className="flex justify-between text-lg font-medium">
          <p className="text-xl">₹{Math.round(Number(phonePrice))}</p>
          <p
            onClick={handleViewSummary}
            className="text-primary cursor-pointer"
          >
            View Summary
          </p>
        </div>
        <div
          onClick={handleSubmit}
          className={`bg-primary relative text-center py-1 px-2 rounded-lg flex justify-between text-white items-center cursor-pointer`}
        >
          {isLoading && (
            <CgSpinner
              size={20}
              className="absolute left-[30%] top-[8px] mt-1 animate-spin"
            />
          )}
          <p className="w-full p-1 text-xl font-medium">Sell Now</p>
        </div>
      </div>
      <SummaryModal
        show={showModal}
        price={Price}
        sellingPrice={phonePrice}
        onClose={handleCloseModal}
        bonus={extraBonus}
      />
    </div>
  );
};

export default SpecialOffers;
