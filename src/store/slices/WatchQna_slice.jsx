import { createSlice } from "@reduxjs/toolkit";

// Define the initial state of your QNA object
const initialState = {
  Functional: [],
  Physical: [],
  Accessories: [],
  Warranty: [],
};

// Create a slice for the QNA object
const qnaSlice = createSlice({
  name: "watch_QNA",
  initialState,
  reducers: {
    setGroupAnswers: (state, action) => {
      const { group, answers } = action.payload;
      state[group] = answers;
    },
    updateFunctionalObject: (state, action) => {
      const { index, newAnswer, newKey } = action.payload;
      if (state.Functional[index]) {
        state.Functional[index].answer = newAnswer;
        state.Functional[index].key = newKey;
      }
    },
    updatePhysicalObject: (state, action) => {
      const { index, newAnswer, newKey } = action.payload;
      if (state.Physical[index]) {
        state.Physical[index].answer = newAnswer;
        state.Physical[index].key = newKey;
      }
      for (let item = 0; item < state.Physical.length; item++) {
        if (item !== index) {
          state.Physical[item].answer = "A0";
          state.Physical[item].key = "no";
        }
      }
    },
    updateAccessoriesObject: (state, action) => {
      const { index, newAnswer, newKey } = action.payload;
      if (state.Accessories[index]) {
        state.Accessories[index].answer = newAnswer;
        state.Accessories[index].key = newKey;
      }
    },
    updateWatchWarrantyObject: (state, action) => {
      const { index, newAnswer, newKey } = action.payload;
      if (state.Warranty[index]) {
        state.Warranty[index].answer = newAnswer;
        state.Warranty[index].key = newKey;
      }

      for (let item = 0; item < state.Warranty.length; item++) {
        if (
          item !== index &&
          state.Warranty[item].quetion !== "Above 11 months"
        ) {
          state.Warranty[item].answer = "W2";
          state.Warranty[item].key = "no";
        } else if (
          item !== index &&
          state.Warranty[item].quetion === "Above 11 months"
        ) {
          state.Warranty[item].answer = "W1";
          state.Warranty[item].key = "no";
        }
      }
    },
    resetState: (state, action) => {
      if (action.type === "RESET_STATE") {
        return initialState;
      }else{
        return state;
      }
    },
  },
});

export const {
  setGroupAnswers,
  updateFunctionalObject,
  updatePhysicalObject,
  updateAccessoriesObject,
  updateWatchWarrantyObject,
  resetState,
} = qnaSlice.actions;

export default qnaSlice.reducer;
