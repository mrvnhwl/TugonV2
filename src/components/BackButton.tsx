import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const BackButton: React.FC = () => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(-1)}
      className="flex items-center text-indigo-600 hover:text-indigo-800 font-medium mb-4"
    >
      <ArrowLeft className="w-5 h-5 mr-2" />
      Back
    </button>
  );
};

export default BackButton;
