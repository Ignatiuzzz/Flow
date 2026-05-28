import { Project } from "../../types/project";
import "../../styles/components/projects/ProjectCard.css";

interface ProjectCardProps {
  project: Project;
  onOpen: (projectId: string) => void;
  onEdit: (project: Project) => void;
  onDelete: (projectId: string) => void;
}

function ProjectCard({ project, onOpen, onEdit, onDelete }: ProjectCardProps) {
  return (
    <article className="project-card flex flex-col gap-5 rounded-3xl border border-white/20 bg-white/80 backdrop-blur-md p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/40 hover:shadow-2xl hover:shadow-emerald-900/10 hover:scale-[1.01] animate-fade-in-up [&_h3]:mb-2 [&_h3]:text-xl [&_h3]:font-extrabold [&_h3]:tracking-tight [&_h3]:text-slate-950 [&_p]:mb-5 [&_p]:text-sm [&_p]:leading-6 [&_p]:text-slate-500">
      <div className="project-card__content min-w-0 flex-1">
        <div className="project-card__top mb-3 flex flex-wrap items-center gap-2">
          <span className="project-card__status rounded-full border px-3 py-1 text-xs font-bold capitalize">{project.estado}</span>
          <span className="project-card__date rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
            {new Date(project.fechaCreacion).toLocaleDateString()}
          </span>
        </div>

        <h3>{project.nombre}</h3>

        <p>
          {project.descripcion
            ? project.descripcion
            : "Sin descripción registrada."}
        </p>

        <div className="project-card__stats grid grid-cols-2 gap-3 md:grid-cols-4 [&_div]:rounded-2xl [&_div]:border [&_div]:px-4 [&_div]:py-3 [&_div]:transition-all [&_div]:duration-300 [&_div]:hover:scale-105 [&_div]:hover:shadow-md [&_strong]:block [&_strong]:text-lg [&_strong]:font-extrabold [&_span]:text-xs [&_span]:font-semibold [&_span]:text-slate-500">
          <div>
            <strong>{project.documentos.length}</strong>
            <span>Documentos</span>
          </div>

          <div>
            <strong>{project.hallazgos.length}</strong>
            <span>Hallazgos</span>
          </div>

          <div>
            <strong>{project.evidencias.length}</strong>
            <span>Evidencias</span>
          </div>

          <div>
            <strong>{project.notas.length}</strong>
            <span>Notas</span>
          </div>
        </div>
      </div>

      <div className="project-card__actions flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4 [&_button]:rounded-2xl [&_button]:bg-slate-100 [&_button]:px-4 [&_button]:py-2.5 [&_button]:text-center [&_button]:text-sm [&_button]:font-bold [&_button]:text-slate-800 [&_button]:transition-all [&_button]:duration-300 [&_button]:hover:bg-white [&_button]:hover:shadow-lg [&_button]:hover:-translate-y-0.5">
        <button
          className="project-card__open min-w-[160px] bg-emerald-950 text-white hover:bg-emerald-900 hover:shadow-[0_4px_15px_rgba(16,185,129,0.3)]"
          onClick={() => onOpen(project.id)}
        >
          Abrir proyecto
        </button>

        <button onClick={() => onEdit(project)}>Editar</button>

        <button
          className="project-card__delete bg-red-50 text-red-700 hover:bg-red-100 hover:shadow-red-500/20"
          onClick={() => onDelete(project.id)}
        >
          Eliminar
        </button>
      </div>
    </article>
  );
}

export default ProjectCard;