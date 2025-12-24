import { configureStore, combineReducers } from "@reduxjs/toolkit";
import userReducer from "./slices/userSlice";
import otpReducer from "./slices/otpSlice";
import responseReducer from "./slices/responseSlice";
import adminAnswerReducer from "./slices/adminAnswerSlice";
import qnaSlice from "./slices/QNAslice"
import qnaQuickSlice from "./slices/quickQNAslice"
import adminGrade from "./slices/newAdminGrade"
import watchQNA from "./slices/WatchQna_slice"
const rootReducer = combineReducers({
  user: userReducer,
  otpVerification: otpReducer,
  responseData: responseReducer,
  adminAnswer: adminAnswerReducer,
  qna: qnaSlice,
  qnaQuick:qnaQuickSlice,
  adminGradePrice:adminGrade,
  watchQNA:watchQNA
});

const store = configureStore({
  reducer: rootReducer,
});

export default store;
