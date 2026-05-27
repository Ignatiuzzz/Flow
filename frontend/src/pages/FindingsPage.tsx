import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { findingApi } from "../api/findingApi";
import FindingForm from "../components/findings/FindingForm";
import FindingList from "../components/findings/FindingList";
import { Finding, FindingCreate } from "../types/finding";
import "../styles/pages/FindingsPage.css";

function FindingsPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [findings, setFindings] = useState<Finding[]>([]);
  const [selectedFinding, setSelectedFinding] = useState<Finding | null>(null);
  const [loading, setLoading] = useState(false);

  const currentProjectId = projectId || "";

  const loadFindings = async () => {
    if (!currentProjectId) return;

    try {
      setLoading(true);
      const data = await findingApi.getByProject(currentProjectId);
      setFindings(data);
    } catch (error) {
      console.error(error);
      alert("No se pudieron cargar los hallazgos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFindings();
  }, [currentProjectId]);

  const handleSubmit = async (data: FindingCreate) => {
    try {
      if (selectedFinding) {
        await findingApi.update(selectedFinding.id, data);
        setSelectedFinding(null);
      } else {
        await findingApi.create(data);
      }

      await loadFindings();
    } catch (error) {
      console.error(error);
      alert("No se pudo guardar el hallazgo.");
    }
  };

  const handleDelete = async (findingId: string) => {
    const confirmed = window.confirm(
      "¿Estás seguro de eliminar este hallazgo?"
    );

    if (!confirmed) return;

    try {
      await findingApi.delete(findingId);
      await loadFindings();
    } catch (error) {
      console.error(error);
      alert("No se pudo eliminar el hallazgo.");
    }
  };

  const highestRisk = useMemo(() => {
    if (findings.length === 0) return 0;
    return Math.max(...findings.map((finding) => finding.riesgo || 0));
  }, [findings]);

  const criticalFindings = useMemo(() => {
    return findings.filter(
      (finding) => finding.nivel === "Alto" || finding.nivel === "Extremo"
    ).length;
  }, [findings]);

  const averageRisk = useMemo(() => {
    if (findings.length === 0) return 0;

    const total = findings.reduce(
      (sum, finding) => sum + (finding.riesgo || 0),
      0
    );

    return Number((total / findings.length).toFixed(1));
  }, [findings]);

  return (
    <main className="findings-page">
      <button
        className="findings-page__back"
        onClick={() => navigate(`/projects/${currentProjectId}`)}
      >
        ← Volver al proyecto
      </button>

      <section className="findings-page__hero">
        <div className="findings-page__hero-content">
          <span className="findings-page__eyebrow">
            Módulo de evaluación
          </span>

          <h1>Hallazgos</h1>

          <p>
            Registra y administra los hallazgos de auditoría. Cada hallazgo
            alimenta la matriz del proyecto y puede ser relacionado con
            evidencias, notas y documentos.
          </p>
        </div>

        <div className="findings-page__summary">
          <span>Total hallazgos</span>
          <strong>{findings.length}</strong>
        </div>
      </section>

      <section className="findings-page__stats">
        <article>
          <strong>{findings.length}</strong>
          <span>Hallazgos registrados</span>
        </article>

        <article>
          <strong>{criticalFindings}</strong>
          <span>Alto o extremo</span>
        </article>

        <article>
          <strong>{averageRisk}</strong>
          <span>Riesgo promedio</span>
        </article>

        <article>
          <strong>{highestRisk}</strong>
          <span>Riesgo máximo</span>
        </article>
      </section>

      <section className="findings-page__content">
        <aside className="findings-page__form">
          <FindingForm
            projectId={currentProjectId}
            selectedFinding={selectedFinding}
            onSubmit={handleSubmit}
            onCancelEdit={() => setSelectedFinding(null)}
          />
        </aside>

        <section className="findings-page__main">
          <div className="findings-page__section-header">
            <div>
              <h2>Hallazgos registrados</h2>
              <p>
                Revisa, edita, elimina o exporta las fichas de hallazgos del
                proyecto.
              </p>
            </div>
          </div>

          <FindingList
            findings={findings}
            loading={loading}
            onEdit={setSelectedFinding}
            onDelete={handleDelete}
          />
        </section>
      </section>
    </main>
  );
}

export default FindingsPage;