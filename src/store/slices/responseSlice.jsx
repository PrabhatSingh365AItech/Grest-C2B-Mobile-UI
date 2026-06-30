import { createSlice } from "@reduxjs/toolkit";

const responseSlice = createSlice({
  name: "responseData",
  initialState: {
    id: "",
    price: 0,
    grade: "",
    uniqueCode: "",
    bonus: 0,
    slabBonusAmount: 0,
    slabApplied: "",
    exactValue: 0,
    dynamicPricingEnabled: false,
    isSlabApplied: true,
    conversionFee: 10,
    mode: 'bonus',
    couponCode: '',
    couponDiscount: 0,
    name: "",
    email: "",
    phone: "",
  },

  reducers: {
    setResponseData: (state, action) => {
      const {
        id, price, grade, uniqueCode, bonus, slabBonusAmount, slabApplied,
        exactValue, dynamicPricingEnabled, isSlabApplied, conversionFee,
        mode, couponCode, couponDiscount
      } = action.payload;
      state.id = id;
      state.price = price;
      state.grade = grade;
      state.uniqueCode = uniqueCode;
      state.bonus = bonus ?? 0;
      state.slabBonusAmount = slabBonusAmount ?? 0;
      state.slabApplied = slabApplied ?? "";
      state.exactValue = exactValue ?? price ?? 0;
      state.dynamicPricingEnabled = dynamicPricingEnabled ?? false;
      state.isSlabApplied = isSlabApplied ?? true;
      state.conversionFee = conversionFee ?? 10;
      state.mode = mode ?? 'bonus';
      state.couponCode = couponCode ?? '';
      state.couponDiscount = couponDiscount ?? 0;
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
