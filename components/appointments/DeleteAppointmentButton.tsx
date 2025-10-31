import { useState } from "react";
import { useApp } from "@/App";

type Props = {
  appointmentId: string;
  ticketId: string;
  className?: string;
  label?: string;
  confirm?: boolean;
};

export default function DeleteAppointmentButton({
  appointmentId,
  ticketId,
  className,
  label = "Supprimer",
  confirm = true,
}: Props) {
  const { deleteAppointment } = useApp();
  const [loading, setLoading] = useState(false);

  const onDelete = async () => {
    if (!appointmentId || !ticketId) return;
    if (confirm && !window.confirm("Confirmer la suppression du rendez-vous ?")) return;
    setLoading(true);
    const ok = await deleteAppointment(appointmentId, ticketId);
    setLoading(false);
    if (!ok) {
      console.error("[DeleteAppointmentButton] suppression échouée");
      alert("Échec de la suppression.");
    }
  };

  return (
    <button
      type="button"
      onClick={onDelete}
      disabled={loading}
      className={`px-3 py-1 rounded-md border text-sm disabled:opacity-50 ${className ?? ""}`.trim()}
      title="Supprimer le rendez-vous"
      aria-label="Supprimer le rendez-vous"
    >
      {loading ? "Suppression..." : label || "Supprimer"}
    </button>
  );
}
