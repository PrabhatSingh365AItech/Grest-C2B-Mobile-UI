import React, { useEffect, useReducer, useState } from "react";
import "../DeviceDetailnew/newDeviceqs.scss";
import { useQuestionContext } from "../../components/QuestionContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  setGroupAnswers,
  updateFunctionalObject,
  updatePhysicalObject,
  updateAccessoriesObject,
  updateWatchWarrantyObject,
} from "../../store/slices/WatchQna_slice";
import styles from "./Watch_qs.module.css";
import { setResponseData } from "../../store/slices/responseSlice";
import useUserProfile from "../../utils/useUserProfile";
import { CgSpinner } from "react-icons/cg";
import ProfileBox from "../../components/ProfileBox/ProfileBox";
import { IoIosArrowBack } from "react-icons/io";
import store from "../../store/store";
const currentDomain = window.location.origin;
const DEFAULT_LOGO = "/Grest_Logo.jpg";
const BUYBACK_LOGO = "/Grest_Logo_2.jpg"; // Use your actual buyback logo

const isBuybackDomain = currentDomain === import.meta.env.VITE_BUYBACK_URL;
const GREST_LOGO = isBuybackDomain ? BUYBACK_LOGO : DEFAULT_LOGO;
import question1 from "../../assets/question1.png";
import question2 from "../../assets/question2.png";
import question3 from "../../assets/question3.png";
import question4 from "../../assets/question4.png";
import question5 from "../../assets/question5.png";
import question6 from "../../assets/question6.png";
import question7 from "../../assets/question7.png";
import question8 from "../../assets/question8.png";
import question9 from "../../assets/question9.png";
const funcImg = [
  question1,
  question2,
  question3,
  question4,
  question5,
  question6,
  question7,
  question8,
  question9,
];
import acces1 from "../../assets/access1.png";
import acces2 from "../../assets/access2.png";
import acces3 from "../../assets/access3.png";
import acces4 from "../../assets/access4.png";
const AccImg = [acces1, acces2, acces3, acces4];
import { useSelector } from "react-redux";
import banner from "../../assets/banner.jpg";
import {
  MdRadioButtonChecked,
  MdRadioButtonUnchecked,
  MdOutlineKeyboardBackspace,
} from "react-icons/md";

const initialState = {
  Functional: [],
  Physical: [],
  Accessories: [],
  Warranty: [],
};

function Watchqs() {
  const id = JSON.parse(sessionStorage.getItem("dataModel"));
  const token = sessionStorage.getItem("authToken");
  const userToken = sessionStorage.getItem("authToken");
  const { answers, setAnswers } = useQuestionContext();
  const [visible, setVisible] = useState(1);
  const navigate = useNavigate();
  const profile = useUserProfile();
  const Functional = useSelector((state) => state.watchQNA.Functional);
  const Physical = useSelector((state) => state.watchQNA.Physical);
  const Accessories = useSelector((state) => state.watchQNA.Accessories);
  const Warranty = useSelector((state) => state.watchQNA.Warranty);
  const qna = useSelector((state) => state.watchQNA);
  const [WTCstate, dispatch] = useReducer(reducer, initialState);
  const [showPopup, setShowPopup] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  function reducer(state, action) {
    if (action.type === "SET_GROUP_ANSWERS") {
      return { ...state, [action.group]: action.answers };
    } else {
      throw new Error();
    }
  }

  const fetchData = async () => {
    try {
      const apiUrl = `${
        import.meta.env.VITE_REACT_APP_ENDPOINT
      }/api/questionnaires/findAll?page=0&limit=31&type=Watch`;
      const response = await axios.get(apiUrl, {
        headers: { authorization: userToken },
      });

      ["Functional", "Physical", "Accessories", "Warranty"].forEach((group) => {
        const answersTemp = response.data.data.filter(
          (question) => question.group === group
        );
        dispatch({ type: "SET_GROUP_ANSWERS", group, answers: answersTemp });
      });
      const populateAnswers = response.data.data.map((elem) => elem.default);
      if (answers.length === 0) {
        const currentAnswers = populateAnswers.map((answer, index) => {
          return {
            answer,
            quetion: response.data.data[index].quetion,
            key: response.data.data[index].yes === answer ? "yes" : "no",
            group: response.data.data[index].group,
          };
        });
        setAnswers(currentAnswers);
        ["Functional", "Physical", "Accessories", "Warranty"].forEach(
          (group) => {
            const answersTemp = currentAnswers.filter(
              (question) => question.group === group
            );
            store.dispatch(setGroupAnswers({ group, answers: answersTemp }));
          }
        );
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handlesubmit = async () => {
    setIsLoading(true);
    const finalPayload = {
      QNA: qna,
      phoneNumber: id?.phoneNumber ? id?.phoneNumber : "123456789",
      aadharNumber: id?.aadharNumber ? id?.aadharNumber : "123456789012",
      modelId: id?.models?._id,
      storage: id?.models?.config?.storage,
      ram: id?.models?.config?.RAM,
      name: id?.customerName ? id?.customerName : profile?.name,
    };
    const response = await axios
      .post(
        `${
          import.meta.env.VITE_REACT_APP_ENDPOINT
        }/api/questionnaires/calculatePriceWatch`,
        finalPayload,
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      )
      .catch((error) => {
        console.log(error);
        setIsLoading(false);
      });
    sessionStorage.setItem("LeadId", response.data.data.id);
    sessionStorage.setItem(
      "responsedatadata",
      JSON.stringify({ ...response.data.data, bonus: 0 })
    );
    sessionStorage.setItem("ExactQuote", true);
    store.dispatch(setResponseData({ ...response.data.data, bonus: 0 }));
    setIsLoading(false);
    navigate("/devicequote");
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [visible]);

  return (
    <>
      <div className={`popup ${showPopup ? "show" : ""}`}>
        <img src={banner} alt="banner" />
        <div className="text">
          Help us calculate your device value correctly by answering to the
          following questions
        </div>
        <button onClick={() => setShowPopup(false)}> Got it</button>
      </div>
      <div className="mainQContainer">
        <WatchHeader WTCstate={WTCstate} dispatch={dispatch} />

        <div className="innerContainer">
          <div className="flex items-center justify-center underline underline-offset-4 pt-4 text-lg font-medium tracking-tight text-{1.325rem}">
            {visible > 1 && visible <= 3 && (
              <div
                className="text-white rounded-[.45rem] flex flex-row justify-center items-center mr-2 bg-primary"
                onClick={() => setVisible(visible - 1)}
              >
                <MdOutlineKeyboardBackspace size={30} />
              </div>
            )}
            {visible === 1 && "Functional condition of the device"}
            {visible === 2 && "Physical condition of the device"}
            {visible === 3 && "Accessories available with device"}
            {visible === 4 && "Basic condition of the device"}
          </div>
          <div className="px-4 py-4 pt-0">
            <div className="questionList">
              {visible === 1 && (
                <FirstPart WTCstate={WTCstate} Functional={Functional} />
              )}
              {visible === 2 && (
                <SecondPart WTCstate={WTCstate} Physical={Physical} />
              )}
              {visible === 3 && (
                <ThirdPart WTCstate={WTCstate} Accessories={Accessories} />
              )}
              {visible === 4 && (
                <FourthPart WTCstate={WTCstate} Warranty={Warranty} />
              )}
            </div>
          </div>
        </div>

        {visible >= 4 ? (
          <div className="fixed bottom-0 flex flex-col w-full gap-2 p-4 bg-white border-t-2">
            <div
              onClick={handlesubmit}
              className="bg-primary relative text-center py-1 px-2 rounded-lg cursor-pointer flex justify-between text-white items-center"
            >
              {isLoading && (
                <CgSpinner
                  size={20}
                  className="absolute left-[28%] top-[8px] mt-1 animate-spin"
                />
              )}
              <p className="w-full p-1 text-xl font-medium">
                {isLoading ? "Submitting" : "Submit"}
              </p>
            </div>
          </div>
        ) : (
          <div className="fixed bottom-0 flex flex-col w-full gap-2 p-4 bg-white border-t-2">
            <div
              onClick={() => setVisible(visible + 1)}
              className="bg-primary py-1 px-2 text-center rounded-lg cursor-pointer flex justify-between text-white items-center"
            >
              <p className="w-full p-1 text-xl font-medium">Continue</p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default Watchqs;

const WatchHeader = ({ WTCstate, dispatch }) => {
  const navigate = useNavigate();

  return (
    <React.Fragment>
      <div className="flex items-center w-[99%] h-16 py-4 bg-white border-b-2 HEADER header">
        <div className="flex items-center justify-between w-full pr-2">
          <ProfileBox />
          <img
            onClick={() => navigate("/selectdevicetype")}
            className="w-40"
            src={GREST_LOGO}
            alt="app logo"
          />
        </div>
      </div>
      <div className={`${styles.quick_page_nav}`}>
        <IoIosArrowBack
          onClick={() => navigate("/selectmodel")}
          size={25}
          className="ml-2 text-primary"
        />
        <p className="ml-2 text-xl font-medium">Device Details</p>
      </div>
    </React.Fragment>
  );
};

const FirstPart = ({ WTCstate, Functional }) => {
  return (
    <div className="containClass">
      <div className="text-sm text-[#676767] py-1 font-medium text-center text-pretty">
        <p>Please choose appropriate condition to get accurate quote</p>
      </div>
      <div className="grid grid-cols-2">
        {WTCstate?.Functional &&
          WTCstate?.Functional.map((data, index) => (
            <div
              key={data._id}
              className={`${
                Functional[index]?.answer === data.yes
                  ? styles.option_selected
                  : styles.option_selected_not
              } flex flex-col justify-start items-center`}
              onClick={() => {
                if (Functional[index]?.answer === data.yes) {
                  store.dispatch(
                    updateFunctionalObject({
                      index: index,
                      newAnswer: data.no,
                      newKey: "no",
                    })
                  );
                } else {
                  store.dispatch(
                    updateFunctionalObject({
                      index: index,
                      newAnswer: data.yes,
                      newKey: "yes",
                    })
                  );
                }
              }}
            >
              <img src={funcImg[index]} className="bg-white" />
              <p className="py-2 px-2 w-[100%] flex flex-row items-center justify-center text-xs font-medium text-balance">
                {data.quetion}
              </p>
            </div>
          ))}
      </div>
      <div className="flex flex mt-4 bg-primary text-white font-medium py-2 px-3 text-sm text-pretty rounded-md">
        Continue, If you don't have any Above-Mentioned Issues.
      </div>
    </div>
  );
};

const SecondPart = ({ WTCstate, Physical }) => {
  return (
    <div className="containClass">
      <div className="text-sm text-[#676767] py-1 font-medium text-center text-pretty">
        <p>Please select your device physical condition</p>
      </div>
      {WTCstate?.Physical && (
        <div className="flex flex-col justify-start gap-2">
          <div
            className={`${
              Physical[0]?.answer === WTCstate?.Physical[0]?.yes
                ? styles.option_selected
                : styles.option_selected_not
            } p-2 text-black bg-white flex flex-col justify-start`}
            onClick={() => {
              store.dispatch(
                updatePhysicalObject({
                  index: 0,
                  newAnswer: WTCstate?.Physical[0]?.yes,
                  newKey: "yes",
                })
              );
            }}
          >
            <div className="flex flex-row items-center text-lg font-bold">
              {Physical[0]?.answer === WTCstate?.Physical[0]?.yes ? (
                <MdRadioButtonChecked
                  size={20}
                  className="mr-2 text-primary"
                />
              ) : (
                <MdRadioButtonUnchecked
                  size={20}
                  className="mr-2 text-[#676767]"
                />
              )}{" "}
              Flawless
            </div>
            <div className="ml-2 text-sm font-medium text-gray-500">
              <p>• Looks Like Brand new!</p>
              <p>• No imperfections!</p>
            </div>
          </div>
          <div
            className={`${
              Physical[1]?.answer === WTCstate?.Physical[1]?.yes
                ? styles.option_selected
                : styles.option_selected_not
            } p-2 text-black bg-white flex flex-col justify-start`}
            onClick={() => {
              store.dispatch(
                updatePhysicalObject({
                  index: 1,
                  newAnswer: WTCstate?.Physical[1]?.yes,
                  newKey: "yes",
                })
              );
            }}
          >
            <div className="flex flex-row items-center text-lg font-bold">
              {Physical[1]?.answer === WTCstate?.Physical[1]?.yes ? (
                <MdRadioButtonChecked
                  size={20}
                  className="mr-2 text-primary"
                />
              ) : (
                <MdRadioButtonUnchecked
                  size={20}
                  className="mr-2 text-[#676767]"
                />
              )}{" "}
              Good
            </div>
            <div className="ml-2 text-sm font-medium text-gray-500">
              <p>• Minor scratches</p>
              <p>• Normal signs of usage</p>
              <p>• No dents or bents on Corners</p>
            </div>
          </div>
          <div
            className={`${
              Physical[2]?.answer === WTCstate?.Physical[2].yes
                ? styles.option_selected
                : styles.option_selected_not
            } p-2 text-black bg-white flex flex-col justify-start`}
            onClick={() => {
              store.dispatch(
                updatePhysicalObject({
                  index: 2,
                  newAnswer: WTCstate?.Physical[2].yes,
                  newKey: "yes",
                })
              );
            }}
          >
            <div className="flex flex-row items-center text-lg font-bold">
              {Physical[2]?.answer === WTCstate?.Physical[2].yes ? (
                <MdRadioButtonChecked
                  size={20}
                  className="mr-2 text-primary"
                />
              ) : (
                <MdRadioButtonUnchecked
                  size={20}
                  className="mr-2 text-[#676767]"
                />
              )}{" "}
              Average
            </div>
            <div className="ml-2 text-sm font-medium text-gray-500">
              <p>• Moderate to heavy scratches</p>
              <p>• Slight wear, dent</p>
            </div>
          </div>
          <div
            className={`${
              Physical[3]?.answer === WTCstate?.Physical[3].yes
                ? styles.option_selected
                : styles.option_selected_not
            } p-2 text-black bg-white flex flex-col justify-start`}
            onClick={() => {
              store.dispatch(
                updatePhysicalObject({
                  index: 3,
                  newAnswer: WTCstate?.Physical[3].yes,
                  newKey: "yes",
                })
              );
            }}
          >
            <div className="flex flex-row items-center text-lg font-bold">
              {Physical[3]?.answer === WTCstate?.Physical[3].yes ? (
                <MdRadioButtonChecked
                  size={20}
                  className="mr-2 text-primary"
                />
              ) : (
                <MdRadioButtonUnchecked
                  size={20}
                  className="mr-2 text-[#676767]"
                />
              )}{" "}
              Below Average/Broken
            </div>
            <div className="ml-2 text-sm font-medium text-gray-500">
              <p>• Deep scratches</p>
              <p>• Major dents or warping</p>
              <p>• Glass broken</p>
            </div>
          </div>
        </div>
      )}
      <div className="flex flex mt-4 bg-primary text-white font-medium py-2 px-3 text-sm text-pretty rounded-md">
        Continue, If you don't have any Above-Mentioned Issues.
      </div>
    </div>
  );
};

const ThirdPart = ({ WTCstate, Accessories }) => {
  return (
    <div className="containClass">
      <div className="text-sm text-[#676767] py-1 font-medium text-center text-pretty">
        <p>Please select accessories which are not available</p>
      </div>
      <div className="grid grid-cols-2">
        {WTCstate?.Accessories &&
          WTCstate?.Accessories.map((data, index) => (
            <div
              key={data._id}
              className={`${
                Accessories[index]?.answer !== data.yes
                  ? styles.option_selected
                  : styles.option_selected_not
              } flex flex-col justify-start items-center`}
              onClick={() => {
                if (Accessories[index]?.answer === data.yes) {
                  store.dispatch(
                    updateAccessoriesObject({
                      index: index,
                      newAnswer: data.no,
                      newKey: "no",
                    })
                  );
                } else {
                  store.dispatch(
                    updateAccessoriesObject({
                      index: index,
                      newAnswer: data.yes,
                      newKey: "yes",
                    })
                  );
                }
              }}
            >
              <img src={AccImg[index]} className="bg-white" />
              <p className="py-2 px-2 w-[100%] flex flex-row items-center justify-center text-xs font-medium text-balance">
                {data.quetion}
              </p>
            </div>
          ))}
      </div>
      <div className="flex flex mt-4 bg-primary text-white font-medium py-2 px-3 text-sm text-pretty rounded-md">
        Continue, If you don't have any Above-Mentioned Issues.
      </div>
    </div>
  );
};

const FourthPart = ({ WTCstate, Warranty }) => {
  return (
    <div className="containClass">
      <div className="text-sm text-[#676767] py-1 font-medium text-center text-pretty">
        <p>Please choose appropriate condition to get accurate quote</p>
      </div>
      <div className="flex flex-col gap-4 mb-4 one">
        <div className="flex font-medium gap-1 two">
          <p className="text-xl">1.</p>
          <p className="text-xl three">What is your smartwatch's age?</p>
        </div>

        {WTCstate?.Warranty &&
          WTCstate?.Warranty.map((data, index) => (
            <div
              key={index}
              className="max-w-[500px]  flex gap-4 ml-3 flex-col"
            >
              <label
                className={`text-primary ${
                  styles.ansBox
                } font-medium  justify-center w-full h-[40px] flex  gap-1 p-2 rounded-lg ${
                  Warranty[index]?.answer === data.yes
                    ? "bg-primary text-white"
                    : ""
                }`}
              >
                <input
                  type="radio"
                  value={data.yes}
                  className="hidden"
                  onChange={(e) => {
                    store.dispatch(
                      updateWatchWarrantyObject({
                        index: index,
                        newAnswer: data.yes,
                        newKey: "yes",
                      })
                    );
                  }}
                  checked={Warranty[index]?.answer === data.yes}
                />{" "}
                {data.quetion}
              </label>
            </div>
          ))}
        <div className="border-b-2 opacity-10 border-[#595555] "></div>
      </div>
    </div>
  );
};
