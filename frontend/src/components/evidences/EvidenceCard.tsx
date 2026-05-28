import { useState } from "react";
import { Link } from "react-router-dom";
import { Evidence } from "../../types/evidence";
import { evidenceApi } from "../../api/evidenceApi";
import { highlightApi } from "../../api/highlightApi";
import { HighlightRelations } from "../../types/highlight";
import "../../styles/components/evidences/EvidenceCard.css";

interface EvidenceCardProps {
  evidence: Evidence;
  onEdit: (evidence: Evidence) => void;
  onDelete: (evidenceId: string) => void;
}

function EvidenceCard({ evidence, onEdit, onDelete }: EvidenceCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [highlightRelations, setHighlightRelations] = useState<
    HighlightRelations[]
  >([]);
  const [loadingRelations, setLoadingRelations] = useState(false);
  const [relationsLoaded, setRelationsLoaded] = useState(false);

  const showValue = (value?: string | number | null) => {
    if (value === undefined || value === null || value === "") {
      return "No registrado";
    }

    return value;
  };

  const formatDate = (value?: string | null) => {
    if (!value) return "No registrada";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return value;

    return date.toLocaleString();
  };

  const loadHighlightRelations = async () => {
    if (relationsLoaded) return;

    if (!evidence.subrayados || evidence.subrayados.length === 0) {
      setHighlightRelations([]);
      setRelationsLoaded(true);
      return;
    }

    try {
      setLoadingRelations(true);

      const relations = await Promise.all(
        evidence.subrayados.map((highlightId) =>
          highlightApi.getRelations(highlightId)
        )
      );

      setHighlightRelations(relations);
      setRelationsLoaded(true);
    } catch (error) {
      console.error(error);
      alert("No se pudieron cargar los subrayados de la evidencia.");
    } finally {
      setLoadingRelations(false);
    }
  };

  const handleToggleDetails = async () => {
    const nextExpandedState = !expanded;

    setExpanded(nextExpandedState);

    if (nextExpandedState) {
      await loadHighlightRelations();
    }
  };

  const relatedFinding = highlightRelations.find(
    (relation) => relation.hallazgo
  )?.hallazgo;

  const relatedFindingLabel = relatedFinding
    ? `${relatedFinding.codigo} - ${relatedFinding.nombre}`
    : evidence.hallazgoId
    ? "Hallazgo relacionado"
    : "No registrado";

  return (
    <article
      className={
        expanded ? "evidence-card evidence-card--expanded" : "evidence-card"
      }
    >
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
          <span>Subrayados: {evidence.subrayados.length}</span>
        </div>
      </div>

      <div className="evidence-card__actions">
        <button type="button" onClick={handleToggleDetails}>
          {expanded ? "Ver menos" : "Ver más"}
        </button>

        <button type="button" onClick={() => onEdit(evidence)}>
          Editar
        </button>

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
          type="button"
          className="evidence-card__delete"
          onClick={() => onDelete(evidence.id)}
        >
          Eliminar
        </button>
      </div>

      {expanded && (
        <section className="evidence-card__details">
          <div className="evidence-card__details-header">
            <div>
              <span>Ficha desplegada</span>
              <h4>Información de la evidencia</h4>
            </div>

            <strong>{evidence.codigo}</strong>
          </div>

          <div className="evidence-card__detail-grid">
            <DetailItem label="Nombre" value={showValue(evidence.nombre)} />

            <DetailItem label="Código" value={showValue(evidence.codigo)} />

            <DetailItem
              label="Hallazgo relacionado"
              value={
                loadingRelations
                  ? "Cargando hallazgo..."
                  : showValue(relatedFindingLabel)
              }
            />

            <DetailItem
              label="Subrayados"
              value={evidence.subrayados.length}
            />

            <DetailItem
              label="Fecha de creación"
              value={formatDate(evidence.fechaCreacion)}
            />

            <DetailItem
              label="Fecha de actualización"
              value={formatDate(evidence.fechaActualizacion)}
            />
          </div>

          {evidence.objetivo && (
            <div className="evidence-card__text-grid">
              <DetailBlock
                label="Objetivo"
                value={showValue(evidence.objetivo)}
              />
            </div>
          )}

          <div className="evidence-card__relations">
            <div className="evidence-card__relations-header">
              <div>
                <span>Relaciones</span>
                <h4>Subrayados vinculados a la evidencia</h4>
              </div>
            </div>

            <div className="evidence-card__relation-summary">
              <div>
                <strong>{evidence.subrayados.length}</strong>
                <span>Subrayados vinculados</span>
              </div>

              <div>
                <strong>{relatedFinding || evidence.hallazgoId ? 1 : 0}</strong>
                <span>Hallazgos relacionados</span>
              </div>
            </div>

            {loadingRelations && (
              <p className="evidence-card__related-state">
                Cargando subrayados relacionados...
              </p>
            )}

            {!loadingRelations && highlightRelations.length === 0 && (
              <p className="evidence-card__related-state">
                Esta evidencia todavía no tiene subrayados relacionados desde
                documentos.
              </p>
            )}

            {!loadingRelations && highlightRelations.length > 0 && (
              <div className="evidence-card__highlight-list">
                {highlightRelations.map((relations) => {
                  const { subrayado, documento, hallazgo, nota } = relations;

                  const documentId = documento?.id;
                  const documentName =
                    documento?.nombreOriginal || "Documento no disponible";

                  return (
                    <article
                      key={subrayado.id}
                      className="evidence-card__highlight-item"
                    >
                      <div className="evidence-card__highlight-top">
                        <span>{subrayado.tipo}</span>

                        {hallazgo && <strong>Hallazgo vinculado</strong>}

                        {nota && <strong>Nota vinculada</strong>}
                      </div>

                      <h5>{documentName}</h5>

                      <div className="evidence-card__highlight-text">
                        <label>Texto subrayado</label>
                        <p>{showValue(subrayado.textoSubrayado)}</p>
                      </div>

                      <div className="evidence-card__highlight-meta">
                        <div>
                          <label>Subtítulo</label>
                          <p>{showValue(subrayado.subtitulo)}</p>
                        </div>

                        <div>
                          <label>Observación</label>
                          <p>{showValue(subrayado.observacion)}</p>
                        </div>
                      </div>

                      {(hallazgo || nota) && (
                        <div className="evidence-card__linked-data">
                          {hallazgo && (
                            <div>
                              <label>Hallazgo relacionado</label>
                              <p>
                                {hallazgo.codigo} - {hallazgo.nombre}
                              </p>
                            </div>
                          )}

                          {nota && (
                            <div>
                              <label>Nota relacionada</label>
                              <p>{nota.subtitulo || nota.texto}</p>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="evidence-card__highlight-footer">
                        <span>
                          Creado: {formatDate(subrayado.fechaCreacion)}
                        </span>

                        {documentId && (
                          <Link
                            to={`/projects/${evidence.proyectoId}/documents/${documentId}/viewer`}
                          >
                            Abrir documento
                          </Link>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      )}
    </article>
  );
}

interface DetailItemProps {
  label: string;
  value: string | number;
}

function DetailItem({ label, value }: DetailItemProps) {
  return (
    <div className="evidence-card__detail-item">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

interface DetailBlockProps {
  label: string;
  value: string | number;
}

function DetailBlock({ label, value }: DetailBlockProps) {
  return (
    <div className="evidence-card__detail-block">
      <span>{label}</span>
      <p>{value}</p>
    </div>
  );
}

export default EvidenceCard;