import React from "react";
import { Button } from "./FormElements";
import { Ticket } from "../types";
import { useTranslation } from "react-i18next";

interface NexusAiHelpButtonProps {
  role: "manager" | "agent" | "user" | null;
  ticket?: Ticket | null;
  onClick?: () => void;
}

const NexusAiHelpButton: React.FC<NexusAiHelpButtonProps> = ({ role, ticket, onClick }) => {
  const { t } = useTranslation();

  if (!ticket || (role !== "manager" && role !== "agent")) return null;

  return (
    <div className="fixed bottom-4 right-4 z-40">
      <Button
        type="button"
        variant="primary"
        size="sm"
        className="shadow-xl drop-shadow-lg rounded-full px-4 py-3 bg-indigo-600/90 hover:bg-indigo-500"
        onClick={onClick}
      >
        {t("ticketDetail.getNexusHelp", { defaultValue: "Obtenir de l'aide Nexus" })}
      </Button>
    </div>
  );
};

export default NexusAiHelpButton;
