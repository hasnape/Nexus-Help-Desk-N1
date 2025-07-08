import React from "react";

const AgentIcon: React.FC<{ className?: string }> = ({
  className = "w-5 h-5",
}) => (
  <div
    className={`${className} bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold`}
  >
    A
  </div>
);

export default AgentIcon;
