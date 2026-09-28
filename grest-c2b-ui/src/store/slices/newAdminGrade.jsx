import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  Core: "",
  Cosmetics: "",
  Display: "",
  Functional_major: "",
  Functional_minor: "",
  Warranty: "",
  Accessories: "",
  Functional: "",
  Physical: "",
  MobileID: "",
  storage: "",
  ram: "",
};

const optionsSlice = createSlice({
  name: "adminAnswer",
  initialState,
  reducers: {
    setSelectedOptions: (state, action) => {
      const { id, value } = action.payload;
      state[id] = value;
    },
    setMobileID: (state, action) => {
      state.MobileID = action.payload;
    },
    setStorage: (state, action) => {
      state.storage = action.payload;
    },
    setRam: (state, action) => {
      state.ram = action.payload;
    },
    resetAdminAnswer: () => initialState, // Reset action
  },
});

export const {
  setSelectedOptions,
  setMobileID,
  setStorage,
  setRam,
  resetAdminAnswer,
} = optionsSlice.actions;

export default optionsSlice.reducer;
