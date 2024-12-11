import React from "react";

const Loading = ({ text = "Loading..." }) => {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="animate-spin rounded-full border-t-4 border-blue-500 w-16 h-16 mb-4"></div>
      <p className="text-lg text-gray-600">{text}</p>
    </div>
  );
};

export default Loading;
