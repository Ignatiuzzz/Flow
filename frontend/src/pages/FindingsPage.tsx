import toast from "react-hot-toast";
import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { findingApi } from "../api/findingApi";
import FindingForm from "../components/findings/FindingForm";
import FindingList from "../components/findings/FindingList";
import { Finding, FindingCreate } from "../types/finding";
import "../styles/pages/FindingsPage.css";

function FindingsPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const queryClient = useQueryClient();

  const [selectedFinding, setSelectedFinding] = useState<Finding | null>(null);

  const currentProjectId = projectId || "";

  const { data: findings = [] as Finding[], isLoading: loading } = useQuery({
    queryKey: ["findings", currentProjectId],
    queryFn: () => findingApi.getByProject(currentProjectId),
    enabled: !!currentProjectId,
  });

  const createMutation = useMutation({
    mutationFn: (data: FindingCreate) => findingApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["findings", currentProjectId] });
    },
    onError: (error) => {
      console.error(error);
      toast.error("No se pudo guardar el hallazgo.");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: FindingCreate }) =>
      findingApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["findings", currentProjectId] });
      setSelectedFinding(null);
    },
    onError: (error) => {
      console.error(error);
      toast.error("No se pudo guardar el hallazgo.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => findingApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["findings", currentProjectId] });
    },
    onError: (error) => {
      console.error(error);
      toast.error("No se pudo eliminar el hallazgo.");
    },
  });

  const handleSubmit = async (data: FindingCreate) => {
    if (selectedFinding) {
      await updateMutation.mutateAsync({ id: selectedFinding.id, data });
    } else {
      await createMutation.mutateAsync(data);
    }
  };

  const handleDelete = (findingId: string) => {
    const confirmed = window.confirm(
      "¿Estás seguro de eliminar este hallazgo?"
    );
    if (!confirmed) return;
    deleteMutation.mutate(findingId);
  };

  const highestRisk = useMemo(() => {
    if (findings.length === 0) return 0;
    return Math.max(...findings.map((finding: Finding) => finding.riesgo || 0));
  }, [findings]);

  const criticalFindings = useMemo(() => {
    return findings.filter(
      (finding: Finding) => finding.nivel === "Alto" || finding.nivel === "Extremo"
    ).length;
  }, [findings]);

  const averageRisk = useMemo(() => {
    if (findings.length === 0) return 0;

    const total = findings.reduce(
      (sum: number, finding: Finding) => sum + (finding.riesgo || 0),
      0
    );

    return Number((total / findings.length).toFixed(1));
  }, [findings]);

  return (
    <main className="findings-page relative min-h-screen overflow-hidden px-5 pt-5 pb-4 text-slate-900 md:px-6 md:pt-6 md:pb-4">
      <button
        className="findings-page__back mb-4 rounded-2xl bg-white/70 backdrop-blur-md px-4 py-2 text-sm font-bold text-emerald-950 shadow-lg ring-1 ring-emerald-900/10 transition-all hover:bg-white hover:-translate-x-1"
        onClick={() => navigate(`/projects/${currentProjectId}`)}
      >
        ← Volver al proyecto
      </button>

      <section className="findings-page__hero relative mb-4 flex flex-col gap-4 overflow-hidden rounded-3xl border bg-white/70 backdrop-blur-lg p-5 shadow-2xl lg:flex-row lg:items-center lg:justify-between animate-fade-in-up [&_h1]:mb-2 [&_h1]:text-3xl [&_h1]:font-extrabold [&_h1]:tracking-tight [&_h1]:text-slate-950 [&_p]:max-w-3xl [&_p]:text-sm [&_p]:leading-6 [&_p]:text-slate-600">
        <div className="findings-page__hero-content max-w-4xl">
          <span className="findings-page__eyebrow mb-2 inline-flex rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wide">
            Módulo de evaluación
          </span>

          <h1>Hallazgos</h1>

          <p>
            Registra y administra los hallazgos de auditoría. Cada hallazgo
            alimenta la matriz del proyecto y puede ser relacionado con
            evidencias, notas y documentos.
          </p>
        </div>

        <div className="findings-page__summary flex min-w-[160px] flex-col items-center justify-center rounded-2xl px-4 py-4 text-center text-white shadow-xl ring-1 hover:shadow-[0_0_20px_rgba(138,69,21,0.3)] transition-all duration-300 [&_span]:text-center [&_span]:text-sm [&_span]:font-bold [&_span]:uppercase [&_span]:tracking-wide [&_span]:text-white [&_strong]:mt-1 [&_strong]:text-center [&_strong]:text-3xl [&_strong]:font-extrabold [&_strong]:text-white">
          <span>Total hallazgos</span>
          <strong>{findings.length}</strong>
        </div>
      </section>

      <section className="findings-page__stats mb-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4 [&_article]:rounded-2xl [&_article]:border [&_article]:bg-white/80 [&_article]:backdrop-blur-sm [&_article]:px-5 [&_article]:py-4 [&_article]:shadow-xl [&_article]:animate-fade-in-up [&_article]:hover:-translate-y-1 [&_article]:hover:shadow-2xl [&_article]:transition-all [&_article]:duration-300 [&_strong]:block [&_strong]:text-2xl [&_strong]:font-extrabold [&_strong]:tracking-tight [&_span]:mt-1 [&_span]:block [&_span]:text-sm [&_span]:font-bold [&_span]:text-slate-500">
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

      <section className="findings-page__content grid grid-cols-1 gap-5 xl:grid-cols-[520px_1fr]">
        <aside className="findings-page__form">
          <FindingForm
            projectId={currentProjectId}
            selectedFinding={selectedFinding}
            onSubmit={handleSubmit}
            onCancelEdit={() => setSelectedFinding(null)}
          />
        </aside>

        <section className="findings-page__main rounded-3xl border bg-white/80 backdrop-blur-md p-5 shadow-2xl animate-fade-in-up">
          <div className="findings-page__section-header mb-4 flex flex-col gap-1 border-b border-slate-100 pb-4 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:tracking-tight [&_h2]:text-slate-950 [&_p]:mt-1 [&_p]:text-sm [&_p]:text-slate-500">
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