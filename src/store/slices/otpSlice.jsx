import { createSlice } from "@reduxjs/toolkit";

const otpSlice = createSlice({
  name: "otpVerification",
  initialState: {
    otpVerified: false,
  },

  reducers: {
    setOtpVerified: (state, action) => {
      state.otpVerified = action.payload;
    },
  },
});

export const { setOtpVerified } = otpSlice.actions;
export default otpSlice.reducer;
