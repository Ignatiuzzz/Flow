import { Evidence } from "../../types/evidence";
import { evidenceApi } from "../../api/evidenceApi";
import "../../styles/components/evidences/EvidenceCard.css";

interface EvidenceCardProps {
  evidence: Evidence;
  onEdit: (evidence: Evidence) => void;
  onDelete: (evidenceId: string) => void;
}

function EvidenceCard({ evidence, onEdit, onDelete }: EvidenceCardProps) {
  return (
    <article className="evidence-card">
      <div className="evidence-card__main">
        <div className="evidence-card__top">
          <span className="evidence-card__code">{evidence.codigo}</span>

          {evidence.hallazgoId && (
            <span className="evidence-card__linked">
              Relacionada a hallazgo
            </span>
          )}
        </div>

        <h3>{evidence.nombre}</h3>

        <p>
          {evidence.descripcionEvidencia
            ? evidence.descripcionEvidencia
            : "Sin descripción registrada."}
        </p>

        <div className="evidence-card__meta">
          <span>Documento: {evidence.documentoNombre || "No registrado"}</span>
          <span>Subtítulo: {evidence.subtitulo || "No registrado"}</span>
          <span>Subrayados: {evidence.subrayados.length}</span>
        </div>
      </div>

      <div className="evidence-card__actions">
        <button onClick={() => onEdit(evidence)}>Editar</button>

        <a
          href={evidenceApi.downloadPdfUrl(evidence.id)}
          target="_blank"
          rel="noreferrer"
        >
          PDF
        </a>

        <a
          href={evidenceApi.downloadWordUrl(evidence.id)}
          target="_blank"
          rel="noreferrer"
        >
          Word
        </a>

        <button
          className="evidence-card__delete"
          onClick={() => onDelete(evidence.id)}
        >
          Eliminar
        </button>
      </div>
    </article>
  );
}

export default EvidenceCard;