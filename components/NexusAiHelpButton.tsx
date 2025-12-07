import React from "react";
import { Button } from "./FormElements";
import { Ticket } from "../types";
import { useTranslation } from "react-i18next";

interface NexusAiHelpButtonProps {
  role: "manager" | "agent" | "user" | null;
  ticket?: Ticket | null;
  onInsertPrompt?: (prompt: string) => void;
}

const NexusAiHelpButton: React.FC<NexusAiHelpButtonProps> = ({ role, ticket, onInsertPrompt }) => {
  const { t } = useTranslation();

  if (!ticket || !onInsertPrompt || (role !== "manager" && role !== "agent")) return null;

  const handleClick = () => {
    const prompt =
      "Peux-tu m’aider à rédiger une réponse professionnelle et concise pour ce ticket ?";
    onInsertPrompt(prompt);
  };

  return (
    <div className="fixed bottom-4 right-4 z-40">
      <Button
        type="button"
        variant="primary"
        size="sm"
        className="shadow-xl drop-shadow-lg rounded-full px-4 py-3 bg-indigo-600/90 hover:bg-indigo-500"
        onClick={handleClick}
      >
        {t("ticketDetail.getNexusHelp", { defaultValue: "Obtenir de l'aide Nexus" })}
      </Button>
    </div>
  );
};

export default NexusAiHelpButton;
