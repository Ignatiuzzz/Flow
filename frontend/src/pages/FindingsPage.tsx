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

  const currentProjectId = projectId || "";

  const [selectedFinding, setSelectedFinding] = useState<Finding | null>(null);
  const [textoSubrayadoOrigen, setTextoSubrayadoOrigen] = useState<string | undefined>(undefined);
  const [documentoIdOrigen, setDocumentoIdOrigen] = useState<string | undefined>(undefined);

  const { data: findings = [], isLoading: loading } = useQuery({
    queryKey: ["findings", currentProjectId],
    queryFn: () => findingApi.getByProject(currentProjectId),
    enabled: !!currentProjectId,
  });

  const createMutation = useMutation({
    mutationFn: (data: FindingCreate) => findingApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["findings", currentProjectId] });
      queryClient.invalidateQueries({ queryKey: ["projectStats", currentProjectId] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<FindingCreate> }) =>
      findingApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["findings", currentProjectId] });
      queryClient.invalidateQueries({ queryKey: ["projectStats", currentProjectId] });
      setSelectedFinding(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => findingApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["findings", currentProjectId] });
      queryClient.invalidateQueries({ queryKey: ["projectStats", currentProjectId] });
      setSelectedFinding(null);
    },
  });

  const handleCreateOrUpdate = async (data: FindingCreate) => {
    if (selectedFinding) {
      await updateMutation.mutateAsync({ id: selectedFinding.id, data });
    } else {
      await createMutation.mutateAsync(data);
    }
  };

  const handleEdit = async (finding: Finding) => {
    setSelectedFinding(finding);
    setTextoSubrayadoOrigen(undefined);
    setDocumentoIdOrigen(undefined);
    try {
      const related = await findingApi.getRelatedDocuments(finding.id);
      if (related.documentosRelacionados.length > 0) {
        const first = related.documentosRelacionados[0];
        setTextoSubrayadoOrigen(first.subrayado?.textoSubrayado || undefined);
        setDocumentoIdOrigen(first.documento?.id || undefined);
      }
    } catch {
    }
  };

  const handleDelete = (id: string) => {
    const confirmed = window.confirm("¿Estás seguro de eliminar este hallazgo?");
    if (!confirmed) return;
    deleteMutation.mutate(id);
  };

  const highOrExtremeCount = useMemo(() => {
    return findings.filter((f: Finding) => f.nivel === "Alto" || f.nivel === "Extremo").length;
  }, [findings]);

  const maxRisk = useMemo(() => {
    if (findings.length === 0) return 0;
    return Math.max(...findings.map((f: Finding) => f.riesgo || 0));
  }, [findings]);

  const avgRisk = useMemo(() => {
    if (findings.length === 0) return 0;
    const total = findings.reduce((sum: number, f: Finding) => sum + (f.riesgo || 0), 0);
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
          <span className="findings-page__eyebrow">Auditoría central</span>

          <h1>Hallazgos del proyecto</h1>

          <p>
            Registra y evalúa los problemas o anomalías detectadas durante la
            auditoría. Clasifícalos por riesgo para priorizar las acciones correctivas.
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
          <strong>{highOrExtremeCount}</strong>
          <span>Alto o Extremo</span>
        </article>

        <article>
          <strong>{avgRisk}</strong>
          <span>Riesgo promedio</span>
        </article>

        <article>
          <strong>{maxRisk}</strong>
          <span>Riesgo máximo</span>
        </article>
      </section>

      <section className="findings-page__content">
        <aside className="findings-page__form">
          <FindingForm
            projectId={currentProjectId}
            selectedFinding={selectedFinding}
            textoSubrayadoOrigen={textoSubrayadoOrigen}
            documentoIdOrigen={documentoIdOrigen}
            onSubmit={handleCreateOrUpdate}
            onCancelEdit={() => {
              setSelectedFinding(null);
              setTextoSubrayadoOrigen(undefined);
              setDocumentoIdOrigen(undefined);
            }}
          />
        </aside>

        <section className="findings-page__main">
          <div className="findings-page__section-header">
            <h2>Inventario de hallazgos</h2>
            <p>
              Explora y gestiona los hallazgos registrados. Desde aquí puedes editarlos
              o eliminarlos del proyecto.
            </p>
          </div>

          <FindingList
            findings={findings}
            loading={loading}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </section>
      </section>
    </main>
  );
}

export default FindingsPage;