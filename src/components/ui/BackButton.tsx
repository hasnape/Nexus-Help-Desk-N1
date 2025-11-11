import React from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

const BackButton: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <button
      onClick={() => navigate(-1)}
      className="absolute top-4 left-4 text-primary hover:text-primary-dark text-sm font-medium"
    >
      ← {t("general.back", { default: "Retour" })}
    </button>
  );
};

export default BackButton;
