export const initialState = {
  Core: [],
  Cosmetics: [],
  Display: [],
  Functional: [],
  Accessories: [],
  Functional_major: [],
  Functional_minor: [],
  Warranty: [],
}

export function qnaReducer(state, action) {
  if (action.type === 'SET_GROUP_ANSWERS') {
    return { ...state, [action.group]: action.answers }
  }
  throw new Error(`Unknown action: ${action.type}`)
}
