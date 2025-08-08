// src/hooks/useBranding.ts
import branding from "../../brandingConfig";

const useBranding = () => {
  const hostname = window.location.hostname;
  return branding[hostname] || branding["adp.valuedx.com"]; // default
};

export default useBranding;
