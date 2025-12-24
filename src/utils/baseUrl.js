const currentURL = window.location.href;
export const baseUrl = currentURL.includes("grest-fe-lthp-uat.vercel.app")
  ? "https://grestuat.trainright.fit"
  : "https://grest.trainright.fit";
