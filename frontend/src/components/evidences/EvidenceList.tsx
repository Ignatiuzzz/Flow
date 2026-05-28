import { Evidence } from "../../types/evidence";
import EvidenceCard from "./EvidenceCard";
import "../../styles/components/evidences/EvidenceList.css";

interface EvidenceListProps {
  evidences: Evidence[];
  loading: boolean;
  onEdit: (evidence: Evidence) => void;
  onDelete: (evidenceId: string) => void;
}

function EvidenceList({
  evidences,
  loading,
  onEdit,
  onDelete,
}: EvidenceListProps) {
  if (loading) {
    return <p className="evidence-list__message flex min-h-[260px] flex-col items-center justify-center rounded-3xl border border-dashed bg-white p-8 text-center text-sm leading-6 text-slate-500">Cargando evidencias...</p>;
  }

  if (evidences.length === 0) {
    return (
      <p className="evidence-list__message flex min-h-[260px] flex-col items-center justify-center rounded-3xl border border-dashed bg-white p-8 text-center text-sm leading-6 text-slate-500">
        Todavía no hay evidencias registradas para este proyecto.
      </p>
    );
  }

  return (
    <div className="evidence-list flex flex-col gap-4">
      {evidences.map((evidence) => (
        <EvidenceCard
          key={evidence.id}
          evidence={evidence}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

export default EvidenceList;