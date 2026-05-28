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
    <main className="evidences-page relative min-h-screen overflow-hidden px-5 pt-5 pb-4 text-slate-900 md:px-6 md:pt-6 md:pb-4">
      <button
        className="evidences-page__back mb-4 rounded-2xl bg-white/70 backdrop-blur-md px-4 py-2 text-sm font-bold text-emerald-950 shadow-lg ring-1 ring-emerald-900/10 transition-all hover:bg-white hover:-translate-x-1"
        onClick={() => navigate(`/projects/${currentProjectId}`)}
      >
        ← Volver al proyecto
      </button>

      <section className="evidences-page__hero relative mb-4 flex flex-col gap-4 overflow-hidden rounded-3xl border bg-white/70 backdrop-blur-lg p-5 shadow-2xl lg:flex-row lg:items-center lg:justify-between animate-fade-in-up [&_h1]:mb-2 [&_h1]:text-3xl [&_h1]:font-extrabold [&_h1]:tracking-tight [&_h1]:text-slate-950 [&_p]:max-w-3xl [&_p]:text-sm [&_p]:leading-6 [&_p]:text-slate-600">
        <div className="evidences-page__hero-content max-w-4xl">
          <span className="evidences-page__eyebrow mb-2 inline-flex rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wide">
            Módulo de respaldo
          </span>

          <h1>Evidencias</h1>

          <p>
            Administra los respaldos del proyecto y relaciona evidencias con
            hallazgos cuando corresponda. Las evidencias permiten sustentar la
            revisión realizada por el auditor.
          </p>
        </div>

        <div className="evidences-page__summary flex min-w-[160px] flex-col items-center justify-center rounded-2xl px-4 py-4 text-center text-white shadow-xl ring-1 hover:shadow-[0_0_20px_rgba(20,93,160,0.3)] transition-all duration-300 [&_span]:text-center [&_span]:text-sm [&_span]:font-bold [&_span]:uppercase [&_span]:tracking-wide [&_span]:text-white [&_strong]:mt-1 [&_strong]:text-center [&_strong]:text-3xl [&_strong]:font-extrabold [&_strong]:text-white">
          <span>Total evidencias</span>
          <strong>{evidences.length}</strong>
        </div>
      </section>

      <section className="evidences-page__stats mb-4 grid grid-cols-1 gap-3 md:grid-cols-3 [&_article]:rounded-2xl [&_article]:border [&_article]:bg-white/80 [&_article]:backdrop-blur-sm [&_article]:px-5 [&_article]:py-4 [&_article]:shadow-xl [&_article]:animate-fade-in-up [&_article]:hover:-translate-y-1 [&_article]:hover:shadow-2xl [&_article]:transition-all [&_article]:duration-300 [&_strong]:block [&_strong]:text-2xl [&_strong]:font-extrabold [&_strong]:tracking-tight [&_span]:mt-1 [&_span]:block [&_span]:text-sm [&_span]:font-bold [&_span]:text-slate-500">
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

      <section className="evidences-page__content grid grid-cols-1 gap-5 xl:grid-cols-[520px_1fr]">
        <aside className="evidences-page__form">
          <EvidenceForm
            projectId={currentProjectId}
            findings={findings}
            selectedEvidence={selectedEvidence}
            onSubmit={handleSubmit}
            onCancelEdit={() => setSelectedEvidence(null)}
          />
        </aside>

        <section className="evidences-page__main rounded-3xl border bg-white/80 backdrop-blur-md p-5 shadow-2xl animate-fade-in-up">
          <div className="evidences-page__section-header mb-4 flex flex-col gap-1 border-b border-slate-100 pb-4 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:tracking-tight [&_h2]:text-slate-950 [&_p]:mt-1 [&_p]:text-sm [&_p]:text-slate-500">
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