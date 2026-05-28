import { Project } from "../../types/project";
import ProjectCard from "./ProjectCard";

interface ProjectListProps {
  projects: Project[];
  loading: boolean;
  onOpen: (projectId: string) => void;
  onEdit: (project: Project) => void;
  onDelete: (projectId: string) => void;
}

function ProjectList({
  projects,
  loading,
  onOpen,
  onEdit,
  onDelete,
}: ProjectListProps) {
  if (loading) {
    return (
      <div className="project-list__state flex min-h-[260px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50/50 p-8 text-center animate-pulse [&_h3]:mb-2 [&_h3]:text-lg [&_h3]:font-bold [&_h3]:text-slate-900 [&_p]:max-w-md [&_p]:text-sm [&_p]:leading-relaxed [&_p]:text-slate-500">
        <div className="project-list__loader mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-slate-800" />
        <p>Cargando proyectos...</p>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="project-list__state flex min-h-[260px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50/50 p-8 text-center [&_h3]:mb-2 [&_h3]:text-lg [&_h3]:font-bold [&_h3]:text-slate-900 [&_p]:max-w-md [&_p]:text-sm [&_p]:leading-relaxed [&_p]:text-slate-500">
        <h3>No hay proyectos todavía</h3>
        <p>
          Crea tu primer proyecto para comenzar a registrar documentos,
          hallazgos, evidencias y notas.
        </p>
      </div>
    );
  }

  return (
    <div className="project-list flex flex-col gap-6">
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          onOpen={onOpen}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

export default ProjectList;