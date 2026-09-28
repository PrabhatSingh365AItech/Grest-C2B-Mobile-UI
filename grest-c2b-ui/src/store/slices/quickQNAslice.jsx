import { createSlice } from "@reduxjs/toolkit";

// Define the initial state of your QNA object
const initialState = {
  Core: [],
  Cosmetics: [],
  Display: [],
  Functional_major: [],
  Functional_minor: [],
  Warranty: [],
};

// Create a slice for the QNA object
const qnaQuickSlice = createSlice({
  name: "QNAquick",
  initialState,
  reducers: {
    setGroupAnswerss: (state, action) => {
      const { group, answers } = action.payload;
      state[group] = answers;
    },
    updateCoreObjects: (state, action) => {
      const { index, newAnswer, newKey } = action.payload;
      if (state.Core[index]) {
        state.Core[index].answer = newAnswer;
        state.Core[index].key = newKey;
      }
    },
    updateCosmeticsObjects: (state, action) => {
      const { index, newAnswer, newKey } = action.payload;
      if (state.Cosmetics[index]) {
        state.Cosmetics[index].answer = newAnswer;
        state.Cosmetics[index].key = newKey;
      }
    },
    updateDisplayObjects: (state, action) => {
      const { index, newAnswer, newKey } = action.payload;
      if (state.Display[index]) {
        state.Display[index].answer = newAnswer;
        state.Display[index].key = newKey;
      }
    },
    updateFunctionalMajorObjects: (state, action) => {
      const { index, newAnswer, newKey } = action.payload;
      if (state.Functional_major[index]) {
        state.Functional_major[index].answer = newAnswer;
        state.Functional_major[index].key = newKey;
      }
    },
    updateFunctionalMinorObjects: (state, action) => {
      const { index, newAnswer, newKey } = action.payload;
      if (state.Functional_minor[index]) {
        state.Functional_minor[index].answer = newAnswer;
        state.Functional_minor[index].key = newKey;
      }
    },
    updateWarrantyObjects: (state, action) => {
      const { index, newAnswer, newKey } = action.payload;
      if (state.Warranty[index]) {
        state.Warranty[index].key = newKey;
        state.Warranty[index].answer = newAnswer;
      }
      for (let item = 0; item < state.Warranty.length; item++) {
        if (
          item !== index &&
          state.Warranty[item].quetion === "Above 11 months"
        ) {
          state.Warranty[item].answer = "W1";
          state.Warranty[item].key = "no";
        }
        else if (
          item !== index &&
          state.Warranty[item].quetion !== "Above 11 months"
        ) {
          state.Warranty[item].answer = "W2";
          state.Warranty[item].key = "no";
        }
      }
    },
  },
});

export const {
  setGroupAnswerss,
  updateCoreObjects,
  updateCosmeticsObjects,
  updateDisplayObjects,
  updateFunctionalMajorObjects,
  updateFunctionalMinorObjects,
  updateWarrantyObjects,
} = qnaQuickSlice.actions;

export default qnaQuickSlice.reducer;
