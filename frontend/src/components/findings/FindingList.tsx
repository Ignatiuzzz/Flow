import { Finding } from "../../types/finding";
import FindingCard from "./FindingCard";
import "../../styles/components/findings/FindingList.css";

interface FindingListProps {
  findings: Finding[];
  loading: boolean;
  onEdit: (finding: Finding) => void;
  onDelete: (findingId: string) => void;
}

function FindingList({
  findings,
  loading,
  onEdit,
  onDelete,
}: FindingListProps) {
  if (loading) {
    return (
      <div className="finding-list__state">
        <div className="finding-list__loader" />
        <p>Cargando hallazgos...</p>
      </div>
    );
  }

  if (findings.length === 0) {
    return (
      <div className="finding-list__state">
        <h3>No hay hallazgos todavía</h3>
        <p>
          Registra el primer hallazgo del proyecto para alimentar la matriz de
          auditoría.
        </p>
      </div>
    );
  }

  return (
    <div className="finding-list">
      {findings.map((finding) => (
        <FindingCard
          key={finding.id}
          finding={finding}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

export default FindingList;