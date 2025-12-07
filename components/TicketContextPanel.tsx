import React, { useMemo, useState } from "react";
import { Button, Input } from "./FormElements";

export type TicketRole = "manager" | "agent" | "user" | null;

export type ChecklistItem = {
  id: string;
  label: string;
  completed: boolean;
};

export type AppointmentInfo = {
  id?: string;
  dateTimeLabel: string;
  city?: string | null;
  status: "pending" | "confirmed" | "cancelled";
};

export type InternalNote = {
  id: string;
  authorName?: string | null;
  createdAtLabel: string;
  content: string;
};

export interface TicketContextPanelProps {
  ticket: {
    id: string;
    status?: string | null;
    ownerName?: string | null;
    ownerEmail?: string | null;
    language?: string | null;
    city?: string | null;
  } | null;
  role: TicketRole;
  // Étape du dossier
  caseStageLabel?: string;
  onCaseStageChange?: (nextStage: string) => void;
  // Checklist
  checklistItems?: ChecklistItem[];
  onAddChecklistItem?: (label: string) => void;
  onToggleChecklistItem?: (itemId: string) => void;
  // Rendez-vous
  appointment?: AppointmentInfo | null;
  onProposeAppointment?: () => void;
  onConfirmAppointment?: (id?: string) => void;
  onCancelAppointment?: (id?: string) => void;
  appointmentForm?: React.ReactNode;
  // Notes internes
  internalNotes?: InternalNote[];
  onAddInternalNote?: (content: string) => void;
  className?: string;
}

const cardClassName =
  "rounded-2xl bg-slate-900/70 border border-slate-800 p-4 space-y-2 shadow-sm backdrop-blur";

const TicketContextPanel: React.FC<TicketContextPanelProps> = ({
  role,
  ticket,
  caseStageLabel,
  onCaseStageChange,
  checklistItems = [],
  onAddChecklistItem,
  onToggleChecklistItem,
  appointment,
  onProposeAppointment,
  onConfirmAppointment,
  onCancelAppointment,
  appointmentForm,
  internalNotes = [],
  onAddInternalNote,
  className,
}) => {
  const [newTaskLabel, setNewTaskLabel] = useState("");
  const [newNoteContent, setNewNoteContent] = useState("");
  const [showNoteComposer, setShowNoteComposer] = useState(false);

  const canEdit = role === "manager" || role === "agent";
  const isUser = role === "user";

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
    if (!newTaskLabel.trim() || !onAddChecklistItem || !canEdit) return;
    onAddChecklistItem(newTaskLabel.trim());
    setNewTaskLabel("");
  };

  const handleAddNote = () => {
    if (!newNoteContent.trim() || !onAddInternalNote || !canEdit) return;
    onAddInternalNote(newNoteContent.trim());
    setNewNoteContent("");
    setShowNoteComposer(false);
  };

  return (
    <aside className={`bg-slate-950/70 text-white rounded-3xl p-4 space-y-4 ${className || ""}`}>
      <section className={cardClassName}>
        <h3 className="text-sm font-semibold">Étape du dossier</h3>
        <p className="text-xs text-slate-300">Suivez et ajustez la progression du ticket.</p>
        {ticket ? (
          <div className="flex flex-col gap-2">
            {canEdit ? (
              <Input
                value={caseStageLabel ?? ticket.status ?? ""}
                onChange={(e) => onCaseStageChange && onCaseStageChange(e.target.value)}
                placeholder="Définir l’étape"
                aria-label="Étape du dossier"
              />
            ) : (
              <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold">
                {caseStageLabel || ticket.status || "—"}
              </span>
            )}
          </div>
        ) : (
          <span className="text-xs text-slate-400">Ticket non chargé.</span>
        )}
      </section>

      <section className={cardClassName}>
        <div className="space-y-1">
          <h3 className="text-sm font-semibold">Checklist du dossier</h3>
          <p className="text-xs text-slate-300">Assurez-vous que toutes les tâches sont suivies.</p>
        </div>
        {checklistItems.length === 0 ? (
          <p className="text-sm text-slate-300">Aucune tâche enregistrée pour ce ticket.</p>
        ) : (
          <div className="space-y-2">
            {checklistItems.map((task) => (
              <label key={task.id} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-500 bg-slate-900"
                  checked={task.completed}
                  onChange={() => onToggleChecklistItem && onToggleChecklistItem(task.id)}
                  disabled={!canEdit || !onToggleChecklistItem}
                />
                <span className={task.completed ? "line-through text-slate-400" : "text-white"}>{task.label}</span>
              </label>
            ))}
          </div>
        )}

        {canEdit && onAddChecklistItem && (
          <div className="space-y-2">
            <input
              type="text"
              value={newTaskLabel}
              onChange={(e) => setNewTaskLabel(e.target.value)}
              placeholder="Ajouter une tâche"
              className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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

            {canEdit && appointment.status === "pending" && (
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

            {canEdit && appointment.status === "confirmed" && onCancelAppointment && (
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

        {canEdit && onProposeAppointment && (
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
            <span className="font-semibold">Propriétaire :</span> {ticket?.ownerName || "—"}
          </p>
          <p>
            <span className="font-semibold">Email :</span> {ticket?.ownerEmail || "—"}
          </p>
          <p>
            <span className="font-semibold">Langue :</span> {ticket?.language || "—"}
          </p>
          <p>
            <span className="font-semibold">Ville :</span> {ticket?.city || "—"}
          </p>
        </div>
      </section>

      {!isUser && (
        <section className={cardClassName}>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold">Notes internes</h3>
            <p className="text-xs text-slate-300">Partager une note pour l'équipe.</p>
          </div>

          {(internalNotes?.length ?? 0) === 0 && (
            <p className="text-sm text-slate-300">Aucune note interne pour ce ticket pour le moment.</p>
          )}

          {internalNotes && internalNotes.length > 0 && (
            <div className="space-y-3">
              {internalNotes.map((note) => (
                <div key={note.id} className="rounded-xl bg-slate-950 border border-slate-800 p-3">
                  <p className="text-xs text-slate-400">
                    par {note.authorName || "Non renseigné"} – {note.createdAtLabel}
                  </p>
                  <p className="mt-1 text-sm whitespace-pre-wrap">{note.content}</p>
                </div>
              ))}
            </div>
          )}

          {canEdit && onAddInternalNote && (
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="secondary" onClick={() => setShowNoteComposer(true)}>
                  Ajouter une note interne
                </Button>
                <Button size="sm" variant="outline" onClick={() => setShowNoteComposer(true)}>
                  Partager une note pour l’équipe
                </Button>
              </div>
              {showNoteComposer && (
                <div className="space-y-2">
                  <textarea
                    value={newNoteContent}
                    onChange={(e) => setNewNoteContent(e.target.value)}
                    rows={3}
                    placeholder="Ajouter une note interne"
                    className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
            </div>
          )}
        </section>
      )}
    </aside>
  );
};

export default TicketContextPanel;
