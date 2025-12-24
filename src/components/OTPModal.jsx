import React, { useState } from "react";
import OtpInput from "otp-input-react";

const OTPModal = () => {
  const [otp, setOtp] = useState("");
  const [showOtp, setShowOtp] = useState(false);
  const handleDetailSubmit = () => {
    setShowOtp(!showOtp);
  };
  return (
    <>
      {!showOtp ? (
        <div>
          <p className="display block font-medium text-xl">Save Quote</p>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex flex-col gap-2 mt-4 pb-4"
          >
            <input
              className="outline-none border-2 p-2"
              type="text"
              placeholder="Quote Id"
            />
            <input
              className="outline-none border-2 p-2"
              type="text"
              placeholder="Name"
            />
            <input
              className="outline-none border-2 p-2"
              type="number"
              placeholder="Mobile"
            />
            <input
              className="outline-none border-2 p-2"
              type="email"
              placeholder="Email Id"
            />
            <p className="font-medium">Please select reason</p>
            <label className="flex items-center gap-2">
              <input type="radio" name="reason" />{" "}
              <span>Quote value is too low.</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" name="reason" />{" "}
              <span>Customer just wanted to know the device value.</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" name="reason" />{" "}
              <span>Customer will come later.</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" name="reason" />{" "}
              <span>Other, please specify below.</span>
            </label>
            <textarea
              className="outline-none border-2 p-2 h-[100px]"
              placeholder="Write here"
            />

            <button
              onClick={handleDetailSubmit}
              className="text-white bg-primary p-2 rounded-md"
            >
              Submit
            </button>
          </form>
        </div>
      ) : (
        <div>
          <p className="display block font-medium text-xl">Customer Consent</p>
          <OtpInput
            value={otp}
            onChange={setOtp}
            OTPLength={6}
            otpType="number"
            disabled={false}
            autoFocus
            className="m-[20px] "
          ></OtpInput>
          <button className="text-white bg-primary p-2 rounded-md">
            Submit
          </button>
        </div>
      )}
    </>
  );
};

export default OTPModal;
