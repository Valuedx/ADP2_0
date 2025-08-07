// src/brandingConfig.ts
import ValueDXLogo from './Images/valuedx-logo-black-400x106.png';
import AutomationEdgeLogo from './Images/AutomationEdge_Logo.png';

const branding: Record<string, {
  copyright: string;
  logo: string;
  companyUrl: string;
}> = {
  "adp.valuedx.com": {
    logo: ValueDXLogo,
    copyright: "© 2025 ValueDX Technologies | All Rights Reserved",
    companyUrl: "https://valuedx.com",
  },
  "adp.automationedge.com": {
    logo: AutomationEdgeLogo,
    copyright: "© 2025 AutomationEdge Technologies | All Rights Reserved",
    companyUrl: "https://automationedge.com",
  },
  "localhost": {
    logo: ValueDXLogo,
    copyright: "© 2025 Local Dev | All Rights Reserved",
    companyUrl: "http://localhost:8080",
  },
};

export default branding;
