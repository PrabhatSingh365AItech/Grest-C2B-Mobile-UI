import { createSlice } from "@reduxjs/toolkit";

const DEFAULT_RESPONSE_DATA = {
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
}

// This Redux store has no persistence, so a real full-page reload (e.g. the
// DigiLocker verification step navigates away to DigiLocker and back) wipes
// it back to the defaults above - price included. DeviceQuote.jsx already
// saves the exact same quote data to sessionStorage('responsedatadata')
// right before dispatching it here, and that survives a full-page reload.
// Seed the initial state from it so quote/price data isn't lost across the
// DigiLocker round trip (or any other full reload) once it's been set once.
const getInitialResponseData = () => {
  try {
    const saved = JSON.parse(sessionStorage.getItem('responsedatadata'))
    if (saved && typeof saved === 'object') {
      return { ...DEFAULT_RESPONSE_DATA, ...saved }
    }
  } catch {
    // Malformed/absent - fall through to defaults.
  }
  return DEFAULT_RESPONSE_DATA
}

const responseSlice = createSlice({
  name: "responseData",
  initialState: getInitialResponseData(),

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
