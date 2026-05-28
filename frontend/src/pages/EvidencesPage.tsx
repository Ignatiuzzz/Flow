import toast from "react-hot-toast";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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

  const queryClient = useQueryClient();

  const [selectedEvidence, setSelectedEvidence] = useState<Evidence | null>(null);

  const currentProjectId = projectId || "";

  const { data: evidences = [] as Evidence[], isLoading: loadingEvidences } = useQuery({
    queryKey: ["evidences", currentProjectId],
    queryFn: () => evidenceApi.getByProject(currentProjectId),
    enabled: !!currentProjectId,
  });

  const { data: findings = [] as Finding[], isLoading: loadingFindings } = useQuery({
    queryKey: ["findings", currentProjectId],
    queryFn: () => findingApi.getByProject(currentProjectId),
    enabled: !!currentProjectId,
  });

  const loading = loadingEvidences || loadingFindings;

  const createMutation = useMutation({
    mutationFn: (data: EvidenceCreate) => evidenceApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["evidences", currentProjectId] });
    },
    onError: (error) => {
      console.error(error);
      toast.error("No se pudo guardar la evidencia.");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: EvidenceCreate }) =>
      evidenceApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["evidences", currentProjectId] });
      setSelectedEvidence(null);
    },
    onError: (error) => {
      console.error(error);
      toast.error("No se pudo guardar la evidencia.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => evidenceApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["evidences", currentProjectId] });
    },
    onError: (error) => {
      console.error(error);
      toast.error("No se pudo eliminar la evidencia.");
    },
  });

  const handleSubmit = async (data: EvidenceCreate) => {
    if (selectedEvidence) {
      await updateMutation.mutateAsync({ id: selectedEvidence.id, data });
    } else {
      await createMutation.mutateAsync(data);
    }
  };

  const handleDelete = (evidenceId: string) => {
    const confirmed = window.confirm(
      "¿Estás seguro de eliminar esta evidencia?"
    );
    if (!confirmed) return;
    deleteMutation.mutate(evidenceId);
  };

  const linkedEvidences = evidences.filter(
    (evidence: Evidence) => evidence.hallazgoId
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