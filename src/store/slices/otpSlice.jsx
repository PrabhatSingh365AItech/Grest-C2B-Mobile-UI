import { createSlice } from "@reduxjs/toolkit";

const savedState = localStorage.getItem("otpVerified");
const initialOtpVerified = savedState ? JSON.parse(savedState) : false;
console.log(`[otpSlice] INIT: localStorage("otpVerified") = ${savedState}, initialOtpVerified = ${initialOtpVerified}`);

const otpSlice = createSlice({
  name: "otpVerification",
  initialState: {
    otpVerified: initialOtpVerified,
  },

  reducers: {
    setOtpVerified: (state, action) => {
      console.log(`[otpSlice] setOtpVerified: ${state.otpVerified} → ${action.payload}`);
      state.otpVerified = action.payload;
      localStorage.setItem("otpVerified", JSON.stringify(action.payload));
    },
  },
});

export const { setOtpVerified } = otpSlice.actions;
export default otpSlice.reducer;
