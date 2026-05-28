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
    return (
      <div className="evidence-list__message">
        <div className="evidence-list__loader"></div>
        <p>Cargando evidencias...</p>
      </div>
    );
  }

  if (evidences.length === 0) {
    return (
      <div className="evidence-list__message">
        <p>Todavía no hay evidencias registradas para este proyecto.</p>
      </div>
    );
  }

  return (
    <div className="evidence-list">
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