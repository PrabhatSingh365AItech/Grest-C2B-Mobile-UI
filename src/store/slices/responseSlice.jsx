import { createSlice } from "@reduxjs/toolkit";

const responseSlice = createSlice({
  name: "responseData",
  initialState: {
    id: "",
    price: 0,
    grade: "",
    uniqueCode: "",
    bonus: 0,
    name: "",
    email: "",
    phone: "",
  },

  reducers: {
    setResponseData: (state, action) => {
      const { id, price, grade, uniqueCode, bonus } = action.payload;
      state.id = id;
      state.price = price;
      state.grade = grade;
      state.uniqueCode = uniqueCode;
      state.bonus = bonus;
    },
    setLeadOTPData: (state, action) => {
      const { name, email, phone } = action.payload;
      state.name = name;
      state.email = email;
      state.phone = phone;
    },
  },
});

export const { setResponseData, setLeadOTPData } = responseSlice.actions;
export default responseSlice.reducer;
