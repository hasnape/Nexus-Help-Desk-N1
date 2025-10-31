import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useApp } from "@/App";

type Props = {
  appointmentId: string;
  ticketId: string;
  className?: string;
  label?: string;
  confirm?: boolean;
  onResult?: (ok: boolean) => void;
};

export default function DeleteAppointmentButton({
  appointmentId,
  ticketId,
  className,
  label,
  confirm = true,
  onResult,
}: Props) {
  const { deleteAppointment } = useApp();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const deleteLabel =
    label ??
    (t("appointment.delete_button", { defaultValue: "Supprimer le RDV" }) || "Supprimer le RDV");
  const deletingLabel =
    t("common.deleting", { defaultValue: "Suppression..." }) || "Suppression...";
  const confirmMessage =
    t("appointment.confirm_body", {
      defaultValue:
        "Voulez-vous vraiment supprimer ce rendez-vous ? Cette action est irréversible.",
    }) ||
    "Voulez-vous vraiment supprimer ce rendez-vous ? Cette action est irréversible.";

  const onDelete = async () => {
    if (!appointmentId || !ticketId) return;
    if (confirm && !window.confirm(confirmMessage)) return;
    setLoading(true);
    const ok = await deleteAppointment(appointmentId, ticketId);
    setLoading(false);
    onResult?.(ok);
    if (!ok) {
      console.error("[DeleteAppointmentButton] suppression échouée");
      if (!onResult) {
        alert("Échec de la suppression.");
      }
    }
  };

  return (
    <button
      type="button"
      onClick={onDelete}
      disabled={loading}
      className={`px-3 py-1 rounded-md border text-sm disabled:opacity-50 ${className ?? ""}`.trim()}
      title={deleteLabel}
      aria-label={deleteLabel}
    >
      {loading ? deletingLabel : deleteLabel}
    </button>
  );
}
