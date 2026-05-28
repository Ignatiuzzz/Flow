import toast from "react-hot-toast";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ProjectForm from "../components/projects/ProjectForm";
import ProjectList from "../components/projects/ProjectList";
import { projectApi } from "../api/projectApi";
import { Project, ProjectCreate } from "../types/project";
import "../styles/pages/ProjectsPage.css";

function ProjectsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const { data: projects = [] as Project[], isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: () => projectApi.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: (data: ProjectCreate) => projectApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
    onError: (error) => {
      console.error(error);
      toast.error("No se pudo guardar el proyecto.");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: ProjectCreate }) =>
      projectApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      setSelectedProject(null);
    },
    onError: (error) => {
      console.error(error);
      toast.error("No se pudo guardar el proyecto.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => projectApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
    onError: (error) => {
      console.error(error);
      toast.error("No se pudo eliminar el proyecto.");
    },
  });

  const handleSubmit = async (data: ProjectCreate) => {
    if (selectedProject) {
      await updateMutation.mutateAsync({ id: selectedProject.id, data });
    } else {
      await createMutation.mutateAsync(data);
    }
  };

  const handleDelete = (projectId: string) => {
    const confirmed = window.confirm(
      "¿Estás seguro de eliminar este proyecto?"
    );
    if (!confirmed) return;
    deleteMutation.mutate(projectId);
  };

  const handleOpen = (projectId: string) => {
    navigate(`/projects/${projectId}`);
  };

  return (
    <main className="projects-page relative min-h-screen overflow-hidden p-6 text-slate-900 md:p-8">
      <section className="projects-page__hero relative mb-8 flex flex-col gap-6 overflow-hidden rounded-3xl border border-white/20 bg-white/70 backdrop-blur-lg p-7 shadow-2xl lg:flex-row lg:items-center lg:justify-between animate-fade-in-up [&_h1]:mb-3 [&_h1]:text-4xl [&_h1]:font-extrabold [&_h1]:tracking-tight [&_h1]:text-slate-950 [&_p]:max-w-3xl [&_p]:text-sm [&_p]:leading-6 [&_p]:text-slate-600 [&_p]:md:text-base">
        <div className="projects-page__hero-content max-w-4xl">
          <span className="projects-page__eyebrow mb-3 inline-flex rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wide">
            Herramienta para Auditores
          </span>

          <h1>Proyectos de auditoría</h1>

          <p>
            Organiza trabajos de auditoría, registra hallazgos, relaciona
            evidencias, administra notas y genera la matriz consolidada del
            proyecto.
          </p>
        </div>

        <div className="projects-page__summary flex min-w-[160px] flex-col items-center justify-center rounded-2xl bg-emerald-950 px-4 py-4 text-center text-white shadow-xl ring-1 ring-emerald-700/40 hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all duration-300 [&_span]:text-center [&_span]:text-sm [&_span]:font-bold [&_span]:uppercase [&_span]:tracking-wide [&_span]:text-white [&_strong]:mt-1 [&_strong]:text-center [&_strong]:text-3xl [&_strong]:font-extrabold [&_strong]:text-white">
          <span>Total de proyectos</span>
          <strong>{projects.length}</strong>
        </div>
      </section>

      <section className="projects-page__content grid grid-cols-1 gap-6 xl:grid-cols-[420px_1fr]">
        <aside className="projects-page__side">
          <ProjectForm
            selectedProject={selectedProject}
            onSubmit={handleSubmit}
            onCancelEdit={() => setSelectedProject(null)}
          />
        </aside>

        <section className="projects-page__main rounded-3xl border border-white/20 bg-white/80 backdrop-blur-md p-6 shadow-2xl animate-fade-in-up">
          <div className="projects-page__section-header mb-5 flex flex-col gap-2 border-b border-slate-100 pb-5 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-slate-950 [&_p]:mt-1 [&_p]:text-sm [&_p]:text-slate-500">
            <div>
              <h2>Proyectos registrados</h2>
              <p>
                Selecciona un proyecto para continuar con documentos,
                hallazgos, evidencias, notas y matriz.
              </p>
            </div>
          </div>

          <ProjectList
            projects={projects}
            loading={isLoading}
            onOpen={handleOpen}
            onEdit={setSelectedProject}
            onDelete={handleDelete}
          />
        </section>
      </section>
    </main>
  );
}

export default ProjectsPage;