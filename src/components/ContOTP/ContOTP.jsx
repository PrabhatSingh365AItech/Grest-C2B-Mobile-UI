import React, { useState, useEffect } from "react";
import styles from "./ContOTP.module.css";
import optImg from "../../assets/otpLogo.svg";
import OtpInput from "otp-input-react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setOtpVerified } from "../../store/slices/otpSlice";
import LoadingSpinner from "../LoadingSpinner";
import { MdEdit } from "react-icons/md";
import { IoArrowBack } from "react-icons/io5";
import toast from "react-hot-toast";
const currentDomain = window.location.origin;
const DEFAULT_LOGO = "/Grest_Logo.jpg";
const BUYBACK_LOGO = "/Grest_Logo_2.jpg"; // Use your actual buyback logo

const isBuybackDomain = currentDomain === import.meta.env.VITE_BUYBACK_URL;
const GREST_LOGO = isBuybackDomain ? BUYBACK_LOGO : DEFAULT_LOGO;
import axios from "axios";
const initOtp = {
  name: "",
  email: "",
  phone: "",
};
const buyBackUrl = import.meta.env.VITE_BUYBACK_URL;
const ContOTP = ({ setContinueOTPOpen }) => {
  const navigate = useNavigate();
  const deviceSelected = sessionStorage.getItem("DeviceType");
  console.log(deviceSelected);
  const [ph, setPh] = useState("");
  const [otpBoxOpen, setOtpBoxOpen] = useState(false);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const [timer, setTimer] = useState(30);
  const [disableResend, setDisableResend] = useState(false);
  const [otpData, setOtpData] = useState(initOtp);
  const [errMsg, setErrMsg] = useState("");
    const token = sessionStorage.getItem("authToken");

    const handleChange = (e) => {
      const { name, value } = e.target;
      let newValue = value;
      if (name === "name") {
        newValue = value.replace(/[^a-zA-Z\s]/g, ""); // allow only letters and spaces
      }
      setOtpData({
        ...otpData,
        [name]: newValue,
      });
    };
  const handleNumberEdit = () => {
    setLoading(false);
    setOtpBoxOpen(!otpBoxOpen);
  };

    const onSignup = async () => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (otpData.phone.length !== 10) {
        setErrMsg("Mobile: (Must have 10 Digits)");
        return;
      }
      if (!emailRegex.test(otpData.email)) {
        setErrMsg("Invalid Email Format");
        return;
      }
      if (otpData.name.length < 3) {
        setErrMsg("Please enter a name with at least 3 characters.");
        return;
      }

      setLoading(true);
      setErrMsg("");

      try {
        await axios.post(`${import.meta.env.VITE_REACT_APP_ENDPOINT}/api/sms/sendOtp`, {
          mobileNumber: otpData.phone,
        },{
          headers: { Authorization: token },
        });

        setDisableResend(true);
        setOtpBoxOpen(true);
      } catch (err) {
        setErrMsg("Failed to send OTP");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const onOTPVerify = async () => {
      const leadId = sessionStorage.getItem("LeadId");
      setLoading(true);

      try {
        const res = await axios.post(
          `${import.meta.env.VITE_REACT_APP_ENDPOINT}/api/sms/verifyOtp`,
          {
            otp,
            mobileNumber: otpData.phone,
          },{
            headers: { Authorization: token },
          }
        );

        if (res?.data?.success && currentDomain === buyBackUrl) {
          const response = await axios.post(
            `${import.meta.env.VITE_REACT_APP_ENDPOINT}/api/questionnaires/customerDetail`,
            {
              emailId: otpData.email,
              name: otpData.name,
              leadId,
              phoneNumber: otpData.phone,
            },{
              headers: { Authorization: token },
            }
          );

          if (response?.status !== 200) {
            setErrMsg("Failed to Save Details");
          } else {
            navigate("/thankyou");
          }
        } else {
          dispatch(setOtpVerified(true));
          navigate("/inputnumber");
        }
      } catch (err) {
        console.error(err);
        const isInvalidOtp =
          err.response?.status === 400 &&
          err.response?.data?.error === "Invalid OTP";
        if (!isInvalidOtp) {
          toast.error("Invalid or expired OTP");
        } else {
          toast.error("Invalid OTP. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    };

    const resendOTP = async () => {
      setDisableResend(true);
      try {
        await axios.post(`${import.meta.env.VITE_REACT_APP_ENDPOINT}/api/sms/resendOtp`, {
          mobileNumber: otpData.phone,
        },{
          headers: { Authorization: token },
        });
      } catch (err) {
        setErrMsg("Failed to resend OTP");
        console.error(err);
      }
    };

    useEffect(() => {
      let intrvl;
      if (disableResend && timer > 0) {
        intrvl = setInterval(() => setTimer((prev) => prev - 1), 1000);
      } else if (timer === 0) {
        setDisableResend(false);
      } else if (!disableResend) {
        setTimer(30);
      }

      return () => clearInterval(intrvl);
    }, [disableResend, timer]);

    // Add useEffect to handle body scroll
    useEffect(() => {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'auto';
      };
    }, []);

  useEffect(() => {
    localStorage.setItem("otpData", JSON.stringify(otpData));
  }, [otpData]);

  return (
    <MainOtpUI
      otpBoxOpen={otpBoxOpen}
      handleNumberEdit={handleNumberEdit}
      ph={ph}
      errMsg={errMsg}
      otp={otp}
      setOtp={setOtp}
      otpData={otpData}
      handleChange={handleChange}
      setPh={setPh}
      setOtpData={setOtpData}
      resendOTP={resendOTP}
      disableResend={disableResend}
      timer={timer}
      onOTPVerify={onOTPVerify}
      loading={loading}
      onSignup={onSignup}
    />
  );
};

export default ContOTP;

export const MainOtpUI = ({
  otpBoxOpen,
  handleNumberEdit,
  ph,
  errMsg,
  otp,
  setOtp,
  otpData,
  handleChange,
  setPh,
  setOtpData,
  resendOTP,
  disableResend,
  timer,
  onOTPVerify,
  loading,
  onSignup,
}) => {
  const navigate = useNavigate();
  return (
    <div className={`${styles.contopt_page}`} style={{ zIndex: 9999 }}>
      <button
        onClick={() => navigate(-1)}
        className="absolute top-0 left-4 text-xs flex items-center justify-center text-white bg-[--primary-color] hover:cursor-pointer p-2 rounded-full"
        style={{ marginTop: 'calc(env(safe-area-inset-top) + 0.5rem)' }}
      >
        <IoArrowBack size={20} />
      </button>
      <div className={`${styles.optbox_wrap}`}>
        <div className={`${styles.optimg_wrap}`}>
          <img src={optImg} />
        </div>
        <div className={`${styles.opt_heading}`}>
          <p className={`font-bold text-2xl`}>{otpBoxOpen ? 'OTP Verification' : 'Enter Details'}</p>
          {otpBoxOpen ? (
            <div className={`flex ${styles.Editresponsive}`}>
              <span className="flex flex-col items-center justify-center text-sm font-medium opacity-60">
                OTP sent to
              </span>
              <span
                className="text-sm font-medium text-left ml-[2px] text-primary flex items-center"
                onClick={handleNumberEdit}
              >
                <span className="text-sm font-medium opacity-60 text-[#000000]">
                  {" "}
                  +91-{ph}
                </span>
                <MdEdit /> Edit no.
              </span>
            </div>
          ) : (
            <span
              className={`flex flex-col items-center justify-center text-sm font-medium ${
                errMsg ? "text-red-500" : "opacity-60"
              } min-h-[40px]`}
            >
              {errMsg
                ? errMsg
                : "Please enter your details to continue."}
            </span>
          )}
        </div>
        <OTPComp
          otpBoxOpen={otpBoxOpen}
          otp={otp}
          setOtp={setOtp}
          otpData={otpData}
          handleChange={handleChange}
          errMsg={errMsg}
          ph={ph}
          setPh={setPh}
          setOtpData={setOtpData}
        />
        {otpBoxOpen && (
          <div className={styles.resend_otp_wrap}>
            <div className="flex flex-row gap-2 w-[300px] justify-center text-sm font-medium">
              <span className="opacity-60 min-w-[132px]">
                Didn't Receive OTP?
              </span>
              <button
                className="text-left min-w-[100px]"
                onClick={resendOTP}
                disabled={disableResend}
              >
                {disableResend ? `Resend in ${timer}` : "Resend OTP"}
              </button>
            </div>
          </div>
        )}

        <div className={`${styles.otp_button_wrap}`}>
          {otpBoxOpen ? (
            <>
              <ActionButton
                onClick={onOTPVerify}
                loading={loading}
                disabled={!otp}
              >
                Verify OTP
              </ActionButton>
              <div id="recaptcha"></div>
            </>
          ) : (
            <>
              <ActionButton onClick={onSignup} loading={loading}>
                Get OTP
              </ActionButton>
              <div id="recaptcha"></div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const ActionButton = ({ onClick, loading, disabled, children }) => (
  <button
    onClick={onClick}
    className={`${loading || disabled ? "opacity-[.8]" : ""}`}
    disabled={loading || disabled}
  >
    {loading ? (
      <>
        <div className={`${styles.spinner} -ml-4`}>
          <LoadingSpinner />
        </div>
        <span className="-ml-4">Loading</span>
      </>
    ) : (
      <span>{children}</span>
    )}
  </button>
);

const OTPComp = ({
  otpBoxOpen,
  otp,
  setOtp,
  otpData,
  errMsg,
  handleChange,
  ph,
  setPh,
  setOtpData,
}) => {
    useEffect(() => {
    return () => {
      setOtp("");
    };
    }, []);
  return (
    <React.Fragment>
      {otpBoxOpen ? (
        <div className={`${styles.otp_field_wrap}`}>
          <OtpInput
            value={otp}
            onChange={setOtp}
            OTPLength={6}
            otpType="number"
            disabled={false}
            autoFocus
            inputStyles={{
              border: "2px solid var(--primary-color)",
              borderRadius: ".55rem",
              outline: "none",
              marginRight: "10px",
            }}
            className={styles.otp_field}
          />
        </div>
      ) : (
        <div className={`${styles.form_fields_wrap}`}>
          <div>
            <input
              id="name"
              name="name"
              placeholder="Enter Name *"
              value={otpData?.name}
              onChange={handleChange}
              className="border-2 border-primary py-1 rounded-lg pl-[12px]"
            />
          </div>
          <div>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="Enter Email *"
              value={otpData?.email}
              onChange={handleChange}
              className="border-2 border-primary py-1 rounded-lg pl-[12px]"
            />
          </div>
          <div className="w-[100%] flex flex-row">
            <div className="flex border-primary rounded-lg border-2 w-[85%] flex-row justify-start">
              <span className="px-3 py-1 text-gray-600 bg-gray-200 rounded-lg">
                +91
              </span>
              <input
                type="tel"
                id="phone"
                value={ph}
                maxLength="10"
                onChange={(e) => {
                  setPh(e.target.value);
                  setOtpData({
                    ...otpData,
                    ["phone"]: e.target.value,
                  });
                }}
                className=""
                placeholder="Enter your Mobile *"
              />
            </div>
          </div>
        </div>
      )}
    </React.Fragment>
  );
};
