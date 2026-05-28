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
    <article className="project-card flex flex-col gap-5 rounded-2xl border border-slate-200/60 bg-white/90 backdrop-blur-md p-6 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-premium hover:scale-[1.01] animate-fade-in-up group [&_h3]:mb-2 [&_h3]:text-xl [&_h3]:font-bold [&_h3]:tracking-tight [&_h3]:text-slate-900 [&_p]:mb-5 [&_p]:text-sm [&_p]:leading-relaxed [&_p]:text-slate-600">
      <div className="project-card__content min-w-0 flex-1">
        <div className="project-card__top mb-4 flex flex-wrap items-center gap-3">
          <span className="project-card__status rounded-full border px-3 py-1.5 text-xs font-bold uppercase tracking-wider bg-slate-50 border-slate-200 text-slate-700">{project.estado}</span>
          <span className="project-card__date rounded-full bg-slate-100/50 px-3 py-1.5 text-xs font-semibold text-slate-500">
            {new Date(project.fechaCreacion).toLocaleDateString()}
          </span>
        </div>

        <h3>{project.nombre}</h3>

        <p>
          {project.descripcion
            ? project.descripcion
            : "Sin descripción registrada."}
        </p>

        <div className="project-card__stats grid grid-cols-2 gap-3 md:grid-cols-4 [&_div]:rounded-xl [&_div]:border [&_div]:border-slate-100 [&_div]:bg-slate-50/50 [&_div]:px-4 [&_div]:py-3 [&_div]:transition-all [&_div]:duration-300 group-hover:[&_div]:border-slate-200 [&_strong]:block [&_strong]:text-lg [&_strong]:font-bold [&_strong]:text-slate-900 [&_span]:text-xs [&_span]:font-semibold [&_span]:text-slate-500 [&_span]:uppercase [&_span]:tracking-wide">
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

      <div className="project-card__actions flex flex-wrap items-center gap-3 border-t border-slate-100 pt-5 [&_button]:rounded-xl [&_button]:px-5 [&_button]:py-2.5 [&_button]:text-center [&_button]:text-sm [&_button]:font-semibold [&_button]:transition-all [&_button]:duration-300">
        <button
          className="project-card__open min-w-[160px] bg-slate-900 text-white hover:bg-slate-800 shadow-sm hover:shadow-md hover:-translate-y-0.5"
          onClick={() => onOpen(project.id)}
        >
          Abrir proyecto
        </button>

        <button 
          className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-sm hover:shadow hover:-translate-y-0.5"
          onClick={() => onEdit(project)}
        >
          Editar
        </button>

        <button
          className="project-card__delete ml-auto bg-white text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
          onClick={() => onDelete(project.id)}
        >
          Eliminar
        </button>
      </div>
    </article>
  );
}

export default ProjectCard;