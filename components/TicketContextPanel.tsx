import React, { useMemo, useState } from "react";
import { Button } from "./FormElements";

export type TicketRole = "manager" | "agent" | "user";

export interface TicketContextPanelProps {
  role: TicketRole;
  ticket: {
    id: string;
    status?: string | null;
    ownerName?: string | null;
    ownerEmail?: string | null;
    language?: string | null;
    city?: string | null;
  };
  tasks?: Array<{
    id: string;
    label: string;
    completed: boolean;
  }>;
  onToggleTask?: (taskId: string) => void;
  onAddTask?: (label: string) => void;
  stageActions?: React.ReactNode;
  appointment?: {
    id: string;
    dateTimeLabel: string;
    city?: string | null;
    status: "pending" | "confirmed" | "cancelled";
  };
  appointmentForm?: React.ReactNode;
  onProposeAppointment?: () => void;
  onConfirmAppointment?: (id: string) => void;
  onCancelAppointment?: (id: string) => void;
  internalNotes?: Array<{
    id: string;
    authorName?: string | null;
    createdAtLabel: string;
    content: string;
  }>;
  onAddInternalNote?: (content: string) => void;
  className?: string;
}

const cardClassName = "rounded-2xl bg-slate-800 border border-slate-700 p-4 space-y-2 shadow";

const TicketContextPanel: React.FC<TicketContextPanelProps> = ({
  role,
  ticket,
  tasks = [],
  onToggleTask,
  onAddTask,
  appointment,
  stageActions,
  appointmentForm,
  onProposeAppointment,
  onConfirmAppointment,
  onCancelAppointment,
  internalNotes = [],
  onAddInternalNote,
  className,
}) => {
  const [newTaskLabel, setNewTaskLabel] = useState("");
  const [newNoteContent, setNewNoteContent] = useState("");

  const isInternal = role === "manager" || role === "agent";

  const appointmentStatusChip = useMemo(() => {
    if (!appointment) return null;
    const base = "rounded-full px-2 py-1 text-xs font-semibold";
    switch (appointment.status) {
      case "confirmed":
        return <span className={`${base} bg-emerald-200 text-emerald-800`}>confirmé</span>;
      case "pending":
        return <span className={`${base} bg-amber-200 text-amber-800`}>en attente</span>;
      default:
        return <span className={`${base} bg-rose-200 text-rose-800`}>annulé</span>;
    }
  }, [appointment]);

  const handleAddTask = () => {
    if (!newTaskLabel.trim() || !onAddTask || !isInternal) return;
    onAddTask(newTaskLabel.trim());
    setNewTaskLabel("");
  };

  const handleAddNote = () => {
    if (!newNoteContent.trim() || !onAddInternalNote || !isInternal) return;
    onAddInternalNote(newNoteContent.trim());
    setNewNoteContent("");
  };

  return (
    <div className={`bg-slate-900 text-white rounded-3xl p-4 space-y-4 ${className || ""}`}>
      <section className={cardClassName}>
        <h3 className="text-sm font-semibold">Étape du dossier</h3>
        <p className="text-xs text-slate-300">Suivez l’avancement du pipeline.</p>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-slate-700 px-3 py-1 text-xs font-semibold">{ticket.status || "—"}</span>
        </div>
        {stageActions && <div className="pt-2">{stageActions}</div>}
      </section>

      <section className={cardClassName}>
        <div className="space-y-1">
          <h3 className="text-sm font-semibold">Checklist du dossier</h3>
          <p className="text-xs text-slate-300">Assurez-vous que toutes les tâches sont suivies.</p>
        </div>
        {tasks.length === 0 ? (
          <p className="text-sm text-slate-300">Aucune tâche enregistrée pour ce ticket.</p>
        ) : (
          <div className="space-y-2">
            {tasks.map((task) => (
              <label key={task.id} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-500 bg-slate-900"
                  checked={task.completed}
                  onChange={() => onToggleTask && onToggleTask(task.id)}
                  disabled={!isInternal || !onToggleTask}
                />
                <span className={task.completed ? "line-through text-slate-400" : "text-white"}>{task.label}</span>
              </label>
            ))}
          </div>
        )}

        {isInternal && onAddTask && (
          <div className="space-y-2">
            <input
              type="text"
              value={newTaskLabel}
              onChange={(e) => setNewTaskLabel(e.target.value)}
              placeholder="Ajouter une tâche"
              className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <Button
              variant="primary"
              size="sm"
              onClick={handleAddTask}
              disabled={!newTaskLabel.trim()}
              className="w-full"
            >
              Ajouter une tâche
            </Button>
          </div>
        )}
      </section>

      <section className={cardClassName}>
        <div className="space-y-1">
          <h3 className="text-sm font-semibold">Rendez-vous</h3>
          <p className="text-xs text-slate-300">Proposez ou confirmez un créneau avec le client.</p>
        </div>

        {appointment ? (
          <div className="space-y-1 text-sm">
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold">{appointment.dateTimeLabel}</span>
              {appointmentStatusChip}
            </div>
            {appointment.city && <p className="text-slate-300 uppercase text-xs">{appointment.city}</p>}

            {isInternal && appointment.status === "pending" && (
              <div className="flex flex-wrap gap-2 pt-2">
                {onConfirmAppointment && (
                  <Button size="sm" variant="primary" onClick={() => onConfirmAppointment(appointment.id)}>
                    Confirmer
                  </Button>
                )}
                {onCancelAppointment && (
                  <Button size="sm" variant="danger" onClick={() => onCancelAppointment(appointment.id)}>
                    Annuler
                  </Button>
                )}
              </div>
            )}

            {isInternal && appointment.status === "confirmed" && onCancelAppointment && (
              <div className="pt-2">
                <Button size="sm" variant="danger" onClick={() => onCancelAppointment(appointment.id)}>
                  Annuler
                </Button>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-slate-300">Aucun rendez-vous planifié pour ce ticket.</p>
        )}

        {onProposeAppointment && (
          <Button variant="secondary" size="sm" onClick={onProposeAppointment} className="w-full">
            Proposer un RDV
          </Button>
        )}

        {appointmentForm && <div className="pt-2 space-y-2">{appointmentForm}</div>}
      </section>

      <section className={cardClassName}>
        <h3 className="text-sm font-semibold">Infos client / ticket</h3>
        <p className="text-xs text-slate-300">Détails clés pour ce dossier.</p>
        <div className="space-y-1 text-sm">
          <p>
            <span className="font-semibold">Propriétaire :</span> {ticket.ownerName || "—"}
          </p>
          <p>
            <span className="font-semibold">Email :</span> {ticket.ownerEmail || "—"}
          </p>
          <p>
            <span className="font-semibold">Langue :</span> {ticket.language || "—"}
          </p>
          <p>
            <span className="font-semibold">Ville :</span> {ticket.city || "—"}
          </p>
        </div>
      </section>

      {isInternal && (
        <section className={cardClassName}>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold">Notes internes</h3>
            <p className="text-xs text-slate-300">Partager une note pour l'équipe.</p>
          </div>

          {(!internalNotes || internalNotes.length === 0) && (
            <p className="text-sm text-slate-300">Aucune note interne pour ce ticket pour le moment.</p>
          )}

          {internalNotes && internalNotes.length > 0 && (
            <div className="space-y-3">
              {internalNotes.map((note) => (
                <div key={note.id} className="rounded-xl bg-slate-900 border border-slate-700 p-3">
                  <p className="text-xs text-slate-400">
                    par {note.authorName || "Non renseigné"} – {note.createdAtLabel}
                  </p>
                  <p className="mt-1 text-sm whitespace-pre-wrap">{note.content}</p>
                </div>
              ))}
            </div>
          )}

          {onAddInternalNote && (
            <div className="space-y-2">
              <textarea
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
                rows={3}
                placeholder="Ajouter une note interne"
                className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <Button
                variant="primary"
                size="sm"
                onClick={handleAddNote}
                disabled={!newNoteContent.trim()}
                className="w-full"
              >
                Ajouter la note
              </Button>
            </div>
          )}
        </section>
      )}
    </div>
  );
};

export default TicketContextPanel;
