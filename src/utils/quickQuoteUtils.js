import axios from "axios";

export const reducer = (state, action) => {
  if (action.type === "SET_GROUP_ANSWERS") {
    return { ...state, [action.group]: action.answers };
  }
  throw new Error("Unknown action type");
};

export const logQuickQuoteAttempt = async (quoteResult, deviceModel, token) => {
  if (!token || !quoteResult?.id || !deviceModel?.models?._id) {
    console.error("❌ Cannot log quote: Missing critical data.");
    return;
  }

  const model = deviceModel.models;
  const config = model.config;
  const categoryInfo = model.categoryInfo;

  const logPayload = {
    quoteType: "QuickQuote",
    quoteAmount: quoteResult.price,
    grade: quoteResult.grade,
    deviceDetails: {
      modelId: model._id,
      name: model.name,
      brandId: model.brandId,
      categoryName: categoryInfo?.categoryName,
      ram: config?.RAM,
      rom: config?.storage,
      series: model.series,
    },
  };

  try {
    await axios.post(
      `${
        import.meta.env.VITE_REACT_APP_ENDPOINT
      }/api/quoteTracking/log-quote-attempt`,
      logPayload,
      { headers: { Authorization: token } }
    );
  } catch (error) {
    console.error("Error logging quick quote attempt:", error);
  }
};
