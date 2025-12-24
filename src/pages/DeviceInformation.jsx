import React, { useEffect, useState } from "react";
import { useAnswerContext } from "../components/AnswerContext";
import { useQuestionContext } from "../components/QuestionContext";
import useUserProfile from "../utils/useUserProfile";
const currentDomain = window.location.origin;
const DEFAULT_LOGO = "/Grest_Logo.jpg";
const BUYBACK_LOGO = "/Grest_Logo_2.jpg"; // Use your actual buyback logo

const isBuybackDomain = currentDomain === import.meta.env.VITE_BUYBACK_URL;
const GREST_LOGO = isBuybackDomain ? BUYBACK_LOGO : DEFAULT_LOGO;
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { setResponseData } from "../store/slices/responseSlice";
import User_Logo from "../assets/User_Logo.jpg";
import { useNavigate } from "react-router-dom";
const DeviceInformation = () => {
  const [userName, setUserName] = useState();
  const [questions, setQuestions] = useState([]);
  const { setFormAnswers, filteredAnswers } = useAnswerContext();
  const { answers, setAnswers } = useQuestionContext();
  const navigate = useNavigate();
  const profile = useUserProfile();
  const dispatch = useDispatch();
  const otpVerified = useSelector((state) => state.otpVerification.otpVerified);

  const handleChange = (event, questionIndex, group, key) => {
    const { value } = event.target;

    const updatedAnswers = [...answers];
    updatedAnswers[questionIndex] = {
      quetion: questions[questionIndex].quetion,
      answer: value,
      key,
      group,
    };

    setAnswers(updatedAnswers);
  };
  useEffect(() => {
    const LoggedInUser = JSON.parse(sessionStorage.getItem("profile"));
    setUserName(LoggedInUser?.name);
    const fetchData = async () => {
      try {
        const apiUrl = `${
          import.meta.env.VITE_REACT_APP_ENDPOINT
        }/api/questionnaires/findAll?page=0&limit=31`;

        const response = await axios.get(apiUrl);

        setQuestions(response.data.data);
        const newPopulateAnswers = response.data.data.map((ele) => ele.default);

        if (answers.length === 0) {
          const newAnswers = newPopulateAnswers.map((answer, index) => {
            return {
              quetion: response.data.data[index].quetion,
              answer,
              key: response.data.data[index].yes === answer ? "yes" : "no",
              group: response.data.data[index].group,
            };
          });

          setAnswers(newAnswers);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
    const token = sessionStorage.getItem("authToken");
    if (!token) {
      navigate("/");
    }
  }, []);

  const handleSubmit = async () => {
    const formattedAnswers = {};
    answers.forEach((ele, index) => {
      const groupName = ele.group;

      if (!formattedAnswers[groupName]) {
        formattedAnswers[groupName] = [];
      }
      formattedAnswers[groupName].push({
        quetion: ele.quetion,
        answer: ele.answer,
        key: ele.key,
      });
    });
    setFormAnswers(formattedAnswers);
    if (otpVerified === true) {
      const token = sessionStorage.getItem("authToken");
      const phoneNumber = sessionStorage.getItem("phoneNumber");
      let id = localStorage.getItem("dataModel");
      id = JSON.parse(id);
      const finalPayload = {
        QNA: filteredAnswers,
        phoneNumber: phoneNumber,
        modelId: id?.models?._id,
        storage: id?.models?.config?.storage,
        aadharNumber: "1234567890",
        ram: id?.models?.config?.RAM,
        name: profile.name,
      };
      const response = await axios.post(
        `${
          import.meta.env.VITE_REACT_APP_ENDPOINT
        }/api/questionnaires/calculatePrice`,
        finalPayload,
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );

      sessionStorage.setItem("LeadId", response.data.data.id);
      sessionStorage.setItem(
        "responsedatadata",
        JSON.stringify({ ...response.data.data, bonus: 0 })
      );
      dispatch(setResponseData({ ...response.data.data, bonus: 0 }));
      console.log("clicked");
      navigate("/inputnumber");
    } else {
      navigate("/inputnumber");
    }
  };

  return (
    <div className="pb-20">
      <div className="flex items-center border-b-2 w-screen h-16 py-4 bg-white HEADER ">
        <div className="flex items-center justify-between w-full ">
          <div className="flex ml-4 gap-2 flex-row-reverse items-center">
            <p className="mr-4 text-base  md:text-xl">{userName}</p>

            <img className="w-[30px]" src={User_Logo} alt="" />
          </div>

          <img
            onClick={() => navigate("/selectdevicetype")}
            className="w-40"
            src={GREST_LOGO}
            alt="app logo"
          />
        </div>
      </div>
      <div className="w-[90%] md:w-[70%]  mx-auto">
        <h1 className="text-primary font-semibold text-lg my-4">
          Tell Us More About Your Device
        </h1>
        <div className="my-4">
          <form>
            {questions &&
              questions.map((data, index) => (
                <div className="flex flex-col gap-4 mb-4" key={data._id}>
                  <div className="flex gap-1">
                    <p className="text-xl">{index + 1}.</p>
                    <p className="text-xl">{data.quetion}</p>
                  </div>
                  <div className="max-w-[500px] flex gap-4 ml-3">
                    <label
                      className={`text-primary font-medium w-[150px] h-[40px] flex items-center gap-1 p-2 rounded-lg ${
                        answers[index].answer === data.yes
                          ? "bg-primary text-white"
                          : ""
                      }`}
                    >
                      <input
                        name={data._id}
                        type="radio"
                        value={data.yes}
                        onChange={(e) =>
                          handleChange(e, index, data.group, "yes")
                        }
                        checked={answers[index].answer === data.yes}
                      />{" "}
                      Yes
                    </label>
                    <label
                      className={`text-primary font-medium  w-[150px] h-[40px] flex items-center gap-1 p-2 rounded-lg ${
                        answers[index].answer === data.no
                          ? "bg-primary text-white"
                          : ""
                      }`}
                    >
                      <input
                        name={data._id}
                        type="radio"
                        value={data.no}
                        onChange={(e) =>
                          handleChange(e, index, data.group, "no")
                        }
                        checked={answers[index].answer === data.no}
                      />{" "}
                      No
                    </label>
                  </div>
                  <div className="border-b-2 opacity-10 border-[#9C9C9C] max-w-[500px]"></div>
                </div>
              ))}
          </form>
        </div>
      </div>
      <div onClick={handleSubmit}>
        <ContinueButton />
      </div>
    </div>
  );
};

export default DeviceInformation;
