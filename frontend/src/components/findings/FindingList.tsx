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
      <div className="finding-list__state flex min-h-[260px] flex-col items-center justify-center rounded-3xl border border-dashed bg-white p-8 text-center [&_h3]:mb-2 [&_h3]:text-lg [&_h3]:font-extrabold [&_h3]:tracking-tight [&_h3]:text-slate-900 [&_p]:max-w-md [&_p]:text-sm [&_p]:leading-6 [&_p]:text-slate-500">
        <div className="finding-list__loader mb-4 h-10 w-10 animate-spin rounded-full border-4" />
        <p>Cargando hallazgos...</p>
      </div>
    );
  }

  if (findings.length === 0) {
    return (
      <div className="finding-list__state flex min-h-[260px] flex-col items-center justify-center rounded-3xl border border-dashed bg-white p-8 text-center [&_h3]:mb-2 [&_h3]:text-lg [&_h3]:font-extrabold [&_h3]:tracking-tight [&_h3]:text-slate-900 [&_p]:max-w-md [&_p]:text-sm [&_p]:leading-6 [&_p]:text-slate-500">
        <h3>No hay hallazgos todavía</h3>
        <p>
          Registra el primer hallazgo del proyecto para alimentar la matriz de
          auditoría.
        </p>
      </div>
    );
  }

  return (
    <div className="finding-list flex flex-col gap-4">
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