import { findingApi } from "../../api/findingApi";
import { Finding } from "../../types/finding";
import "../../styles/components/findings/FindingCard.css";

interface FindingCardProps {
  finding: Finding;
  onEdit: (finding: Finding) => void;
  onDelete: (findingId: string) => void;
}

function FindingCard({ finding, onEdit, onDelete }: FindingCardProps) {
  const levelClass = finding.nivel.replace(" ", "-").toLowerCase();

  return (
    <article className="finding-card">
      <div className="finding-card__main">
        <div className="finding-card__top">
          <span className="finding-card__code">{finding.codigo}</span>

          <span className={`finding-card__level finding-card__level--${levelClass}`}>
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
          <div>
            <strong>{finding.impacto}</strong>
            <span>Impacto</span>
          </div>

          <div>
            <strong>{finding.urgencia}</strong>
            <span>Urgencia</span>
          </div>

          <div>
            <strong>{finding.riesgo}</strong>
            <span>Riesgo</span>
          </div>
        </div>

        <div className="finding-card__meta">
          <span>Evidencias: {finding.evidencias.length}</span>
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