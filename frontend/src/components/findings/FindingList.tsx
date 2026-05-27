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
    return <p className="finding-list__message">Cargando hallazgos...</p>;
  }

  if (findings.length === 0) {
    return (
      <p className="finding-list__message">
        Todavía no hay hallazgos registrados para este proyecto.
      </p>
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