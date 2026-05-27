import { Finding } from "../../types/finding";
import { findingApi } from "../../api/findingApi";
import "../../styles/components/findings/FindingCard.css";

interface FindingCardProps {
  finding: Finding;
  onEdit: (finding: Finding) => void;
  onDelete: (findingId: string) => void;
}

function FindingCard({ finding, onEdit, onDelete }: FindingCardProps) {
  return (
    <article className="finding-card">
      <div className="finding-card__main">
        <div className="finding-card__top">
          <span className="finding-card__code">{finding.codigo}</span>
          <span className={`finding-card__level finding-card__level--${finding.nivel.replace(" ", "-").toLowerCase()}`}>
            {finding.nivel}
          </span>
        </div>

        <h3>{finding.nombre}</h3>

        <p>
          {finding.descripcion
            ? finding.descripcion
            : "Sin descripción registrada."}
        </p>

        <div className="finding-card__risk">
          <span>Impacto: {finding.impacto}</span>
          <span>Urgencia: {finding.urgencia}</span>
          <span>Riesgo: {finding.riesgo}</span>
        </div>

        <div className="finding-card__meta">
          <span>Evidencias relacionadas: {finding.evidencias.length}</span>
          <span>Subrayados: {finding.subrayados.length}</span>
        </div>
      </div>

      <div className="finding-card__actions">
        <button onClick={() => onEdit(finding)}>Editar</button>

        <a
          href={findingApi.downloadPdfUrl(finding.id)}
          target="_blank"
          rel="noreferrer"
        >
          PDF
        </a>

        <a
          href={findingApi.downloadWordUrl(finding.id)}
          target="_blank"
          rel="noreferrer"
        >
          Word
        </a>

        <button
          className="finding-card__delete"
          onClick={() => onDelete(finding.id)}
        >
          Eliminar
        </button>
      </div>
    </article>
  );
}

export default FindingCard;