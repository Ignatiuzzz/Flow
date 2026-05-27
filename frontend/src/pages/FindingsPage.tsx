import { useEffect, useState } from "react";
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

  return (
    <main className="findings-page">
      <button
        className="findings-page__back"
        onClick={() => navigate(`/projects/${currentProjectId}`)}
      >
        Volver al proyecto
      </button>

      <section className="findings-page__header">
        <div>
          <h1>Hallazgos</h1>
          <p>
            Registra hallazgos manualmente. Cada hallazgo generará una evidencia
            inicial y alimentará la matriz del proyecto.
          </p>
        </div>
      </section>

      <section className="findings-page__content">
        <div className="findings-page__form">
          <FindingForm
            projectId={currentProjectId}
            selectedFinding={selectedFinding}
            onSubmit={handleSubmit}
            onCancelEdit={() => setSelectedFinding(null)}
          />
        </div>

        <div className="findings-page__list">
          <FindingList
            findings={findings}
            loading={loading}
            onEdit={setSelectedFinding}
            onDelete={handleDelete}
          />
        </div>
      </section>
    </main>
  );
}

export default FindingsPage;