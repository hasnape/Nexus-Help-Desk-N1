import React from "react";

const UserIcon: React.FC<{ className?: string }> = ({
  className = "w-5 h-5",
}) => (
  <div
    className={`${className} bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold`}
  >
    U
  </div>
);

export default UserIcon;
