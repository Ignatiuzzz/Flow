import toast from "react-hot-toast";
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  findingApi,
  FindingRelatedDocumentItem,
} from "../../api/findingApi";
import { Finding } from "../../types/finding";
import "../../styles/components/findings/FindingCard.css";

interface FindingCardProps {
  finding: Finding;
  onEdit: (finding: Finding) => void;
  onDelete: (findingId: string) => void;
}

function FindingCard({ finding, onEdit, onDelete }: FindingCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [relatedItems, setRelatedItems] = useState<FindingRelatedDocumentItem[]>(
    []
  );
  const [loadingRelated, setLoadingRelated] = useState(false);
  const [relatedLoaded, setRelatedLoaded] = useState(false);

  const levelClass = finding.nivel.replace(" ", "-").toLowerCase();

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

  const loadRelatedDocuments = async () => {
    if (relatedLoaded) return;

    try {
      setLoadingRelated(true);

      const response = await findingApi.getRelatedDocuments(finding.id);

      setRelatedItems(response.documentosRelacionados || []);
      setRelatedLoaded(true);
    } catch (error) {
      console.error(error);
      toast.error("No se pudieron cargar los subrayados relacionados.");
    } finally {
      setLoadingRelated(false);
    }
  };

  const handleToggleDetails = async () => {
    const nextExpandedState = !expanded;

    setExpanded(nextExpandedState);

    if (nextExpandedState) {
      await loadRelatedDocuments();
    }
  };

  return (
    <article className={expanded ? "finding-card finding-card--expanded" : "finding-card"}>
      <div className="finding-card__main">
        <div className="finding-card__top">
          <span className="finding-card__code">{finding.codigo}</span>

          <span
            className={`finding-card__level finding-card__level--${levelClass}`}
          >
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
        <button type="button" onClick={handleToggleDetails}>
          {expanded ? "Ver menos" : "Ver más"}
        </button>

        <button type="button" onClick={() => onEdit(finding)}>
          Editar
        </button>

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
          type="button"
          className="finding-card__delete"
          onClick={() => onDelete(finding.id)}
        >
          Eliminar
        </button>
      </div>

      {expanded && (
        <section className="finding-card__details">
          <div className="finding-card__details-header">
            <div>
              <span>Ficha completa</span>
              <h4>Información del hallazgo</h4>
            </div>

            <strong>{finding.codigo}</strong>
          </div>

          <div className="finding-card__detail-grid">
            <DetailItem label="Nombre" value={showValue(finding.nombre)} />
            <DetailItem label="Código" value={showValue(finding.codigo)} />
            <DetailItem label="Nivel" value={showValue(finding.nivel)} />
            <DetailItem label="Riesgo" value={showValue(finding.riesgo)} />
            <DetailItem label="Impacto" value={showValue(finding.impacto)} />
            <DetailItem label="Urgencia" value={showValue(finding.urgencia)} />
            <DetailItem
              label="Fecha de creación"
              value={formatDate(finding.fechaCreacion)}
            />
            <DetailItem
              label="Fecha de actualización"
              value={formatDate(finding.fechaActualizacion)}
            />
          </div>

          <div className="finding-card__text-grid">
            <DetailBlock
              label="Descripción"
              value={showValue(finding.descripcion)}
            />

            <DetailBlock label="Criterio" value={showValue(finding.criterio)} />

            <DetailBlock label="Objetivo" value={showValue(finding.objetivo)} />

            <DetailBlock label="Causa" value={showValue(finding.causa)} />

            <DetailBlock label="Efecto" value={showValue(finding.efecto)} />

            <DetailBlock
              label="Conclusión"
              value={showValue(finding.conclusion)}
            />

            <DetailBlock
              label="Justificación del riesgo"
              value={showValue(finding.justificacionRiesgo)}
            />

            <DetailBlock
              label="Recomendaciones"
              value={showValue(finding.recomendaciones)}
            />
          </div>

          <div className="finding-card__relations">
            <div className="finding-card__relations-header">
              <div>
                <span>Relaciones</span>
                <h4>Subrayados, documentos y evidencias</h4>
              </div>
            </div>

            <div className="finding-card__relation-summary">
              <div>
                <strong>{finding.evidencias.length}</strong>
                <span>Evidencias vinculadas</span>
              </div>

              <div>
                <strong>{finding.subrayados.length}</strong>
                <span>Subrayados vinculados</span>
              </div>
            </div>

            {loadingRelated && (
              <p className="finding-card__related-state">
                Cargando subrayados relacionados...
              </p>
            )}

            {!loadingRelated && relatedItems.length === 0 && (
              <p className="finding-card__related-state">
                Este hallazgo todavía no tiene subrayados relacionados desde
                documentos.
              </p>
            )}

            {!loadingRelated && relatedItems.length > 0 && (
              <div className="finding-card__highlight-list">
                {relatedItems.map((item) => {
                  const documentId = item.documento?.id;
                  const documentName =
                    item.documento?.nombreOriginal || "Documento no disponible";

                  return (
                    <article
                      key={item.subrayado.id}
                      className="finding-card__highlight-item"
                    >
                      <div className="finding-card__highlight-top">
                        <span>{item.subrayado.tipo}</span>

                        {item.subrayado.esNota && <strong>Nota</strong>}
                      </div>

                      <h5>{documentName}</h5>

                      <div className="finding-card__highlight-text">
                        <label>Texto subrayado</label>
                        <p>{showValue(item.subrayado.textoSubrayado)}</p>
                      </div>

                      <div className="finding-card__highlight-meta">
                        <div>
                          <label>Subtítulo</label>
                          <p>{showValue(item.subrayado.subtitulo)}</p>
                        </div>

                        <div>
                          <label>Observación</label>
                          <p>{showValue(item.subrayado.observacion)}</p>
                        </div>
                      </div>

                      <div className="finding-card__highlight-footer">
                        <span>
                          Creado: {formatDate(item.subrayado.fechaCreacion)}
                        </span>

                        {documentId && (
                          <Link
                            to={`/projects/${finding.proyectoId}/documents/${documentId}/viewer`}
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
    <div className="finding-card__detail-item">
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
    <div className="finding-card__detail-block">
      <span>{label}</span>
      <p>{value}</p>
    </div>
  );
}

export default FindingCard;