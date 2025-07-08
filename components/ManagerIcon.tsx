import React from "react";

const ManagerIcon: React.FC<{ className?: string }> = ({
  className = "w-5 h-5",
}) => (
  <div
    className={`${className} bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold`}
  >
    M
  </div>
);

export default ManagerIcon;
