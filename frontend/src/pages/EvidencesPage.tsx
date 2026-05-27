import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { evidenceApi } from "../api/evidenceApi";
import { findingApi } from "../api/findingApi";
import EvidenceForm from "../components/evidences/EvidenceForm";
import EvidenceList from "../components/evidences/EvidenceList";
import { Evidence, EvidenceCreate } from "../types/evidence";
import { Finding } from "../types/finding";
import "../styles/pages/EvidencesPage.css";

function EvidencesPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [evidences, setEvidences] = useState<Evidence[]>([]);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [selectedEvidence, setSelectedEvidence] = useState<Evidence | null>(
    null
  );
  const [loading, setLoading] = useState(false);

  const currentProjectId = projectId || "";

  const loadEvidences = async () => {
    if (!currentProjectId) return;

    const data = await evidenceApi.getByProject(currentProjectId);
    setEvidences(data);
  };

  const loadFindings = async () => {
    if (!currentProjectId) return;

    const data = await findingApi.getByProject(currentProjectId);
    setFindings(data);
  };

  const loadPageData = async () => {
    try {
      setLoading(true);
      await Promise.all([loadEvidences(), loadFindings()]);
    } catch (error) {
      console.error(error);
      alert("No se pudieron cargar las evidencias o hallazgos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPageData();
  }, [currentProjectId]);

  const handleSubmit = async (data: EvidenceCreate) => {
    try {
      if (selectedEvidence) {
        await evidenceApi.update(selectedEvidence.id, data);
        setSelectedEvidence(null);
      } else {
        await evidenceApi.create(data);
      }

      await loadPageData();
    } catch (error) {
      console.error(error);
      alert("No se pudo guardar la evidencia.");
    }
  };

  const handleDelete = async (evidenceId: string) => {
    const confirmed = window.confirm(
      "¿Estás seguro de eliminar esta evidencia?"
    );

    if (!confirmed) return;

    try {
      await evidenceApi.delete(evidenceId);
      await loadPageData();
    } catch (error) {
      console.error(error);
      alert("No se pudo eliminar la evidencia.");
    }
  };

  const linkedEvidences = evidences.filter(
    (evidence) => evidence.hallazgoId
  ).length;

  const freeEvidences = evidences.length - linkedEvidences;

  return (
    <main className="evidences-page">
      <button
        className="evidences-page__back"
        onClick={() => navigate(`/projects/${currentProjectId}`)}
      >
        ← Volver al proyecto
      </button>

      <section className="evidences-page__hero">
        <div className="evidences-page__hero-content">
          <span className="evidences-page__eyebrow">
            Módulo de respaldo
          </span>

          <h1>Evidencias</h1>

          <p>
            Administra los respaldos del proyecto y relaciona evidencias con
            hallazgos cuando corresponda. Las evidencias permiten sustentar la
            revisión realizada por el auditor.
          </p>
        </div>

        <div className="evidences-page__summary">
          <span>Total evidencias</span>
          <strong>{evidences.length}</strong>
        </div>
      </section>

      <section className="evidences-page__stats">
        <article>
          <strong>{evidences.length}</strong>
          <span>Evidencias registradas</span>
        </article>

        <article>
          <strong>{linkedEvidences}</strong>
          <span>Relacionadas a hallazgo</span>
        </article>

        <article>
          <strong>{freeEvidences}</strong>
          <span>Generales del proyecto</span>
        </article>
      </section>

      <section className="evidences-page__content">
        <aside className="evidences-page__form">
          <EvidenceForm
            projectId={currentProjectId}
            findings={findings}
            selectedEvidence={selectedEvidence}
            onSubmit={handleSubmit}
            onCancelEdit={() => setSelectedEvidence(null)}
          />
        </aside>

        <section className="evidences-page__main">
          <div className="evidences-page__section-header">
            <div>
              <h2>Evidencias registradas</h2>
              <p>
                Revisa, edita, elimina o exporta las fichas de evidencia del
                proyecto.
              </p>
            </div>
          </div>

          <EvidenceList
            evidences={evidences}
            loading={loading}
            onEdit={setSelectedEvidence}
            onDelete={handleDelete}
          />
        </section>
      </section>
    </main>
  );
}

export default EvidencesPage;