import { createSlice } from "@reduxjs/toolkit";

const adminAnswerSlice = createSlice({
  name: "adminAnswer",
  initialState: {
    BrandID:"",
    MobileID:"",
    configID:"",
    warrantyAnswer: "W1",
    coreAnswer: "C1",
    displayAnswer: "D1",
    majorFunctionsAnswer: "F1.1",
    minorFunctionsAnswer: "F2.1",
    cosmeticsAnswer: "A1",
  },

  reducers: {
    setWarrantyAnswer: (state, action) => {
      state.warrantyAnswer = action.payload;
    },
    setCoreAnswer: (state, action) => {
      state.coreAnswer = action.payload;
    },
    setDisplayAnswer: (state, action) => {
      state.displayAnswer = action.payload;
    },
    setMajorFunctionsAnswer: (state, action) => {
      state.majorFunctionsAnswer = action.payload;
    },
    setMinorFunctionsAnswer: (state, action) => {
      state.minorFunctionsAnswer = action.payload;
    },
    setCosmeticsAnswer: (state, action) => {
      state.cosmeticsAnswer = action.payload;
    },
    setMobileID: (state, action) => {
      state.MobileID = action.payload;
    },
    setBrandID: (state, action) => {
      state.BrandID = action.payload;
    },
    setconfigID: (state, action) => {
      state.configID = action.payload;
    },
  },
});

export const {
  setsideMenu,
  setWarrantyAnswer,
  setCoreAnswer,
  setDisplayAnswer,
  setMajorFunctionsAnswer,
  setMinorFunctionsAnswer,
  setCosmeticsAnswer,
  setMobileID,
  setBrandID,
  setconfigID

} = adminAnswerSlice.actions;

export default adminAnswerSlice.reducer;
