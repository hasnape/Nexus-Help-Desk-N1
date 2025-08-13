import React from "react";

const AgentIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    {...props}
  >
    <circle cx="10" cy="7" r="4" />
    <path d="M2 18c0-3.3137 3.134-6 7-6s7 2.6863 7 6" />
  </svg>
);

export default AgentIcon;