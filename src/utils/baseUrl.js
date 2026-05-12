const currentURL = window.location.href;

// DPDP Compliance: Enforce HTTPS for all API calls
// Warn if current site is loaded over HTTP in production
if (import.meta.env.PROD && window.location.protocol === 'http:') {
  console.warn('WARNING: Site loaded over HTTP. HTTPS required for DPDP compliance.');
}

export const baseUrl = currentURL.includes("grest-fe-lthp-uat.vercel.app")
  ? "https://grestuat.trainright.fit"
  : "https://grest.trainright.fit";
