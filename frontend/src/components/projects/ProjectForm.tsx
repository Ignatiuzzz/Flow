import toast from "react-hot-toast";
import { FormEvent, useEffect, useState } from "react";
import { Project, ProjectCreate } from "../../types/project";
import "../../styles/components/projects/ProjectForm.css";

interface ProjectFormProps {
  selectedProject?: Project | null;
  onSubmit: (data: ProjectCreate) => Promise<void>;
  onCancelEdit?: () => void;
}

function ProjectForm({
  selectedProject,
  onSubmit,
  onCancelEdit,
}: ProjectFormProps) {
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [loading, setLoading] = useState(false);

  const isEditing = Boolean(selectedProject);

  useEffect(() => {
    if (selectedProject) {
      setNombre(selectedProject.nombre);
      setDescripcion(selectedProject.descripcion || "");
    } else {
      setNombre("");
      setDescripcion("");
    }
  }, [selectedProject]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!nombre.trim()) {
      toast.error("El nombre del proyecto es obligatorio.");
      return;
    }

    try {
      setLoading(true);

      await onSubmit({
        nombre: nombre.trim(),
        descripcion: descripcion.trim(),
      });

      if (!isEditing) {
        setNombre("");
        setDescripcion("");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="project-form rounded-3xl border border-white/20 bg-white/70 backdrop-blur-md p-6 shadow-2xl animate-slide-in-left" onSubmit={handleSubmit}>
      <div className="project-form__header mb-6 border-b border-slate-100 pb-5 [&_span]:mb-3 [&_span]:inline-flex [&_span]:rounded-full [&_span]:border [&_span]:px-3 [&_span]:py-1 [&_span]:text-xs [&_span]:font-bold [&_span]:uppercase [&_span]:tracking-wide [&_h2]:mb-2 [&_h2]:text-2xl [&_h2]:font-extrabold [&_h2]:tracking-tight [&_h2]:text-slate-950 [&_p]:text-sm [&_p]:leading-6 [&_p]:text-slate-500">
        <span>{isEditing ? "Modo edición" : "Nuevo proyecto"}</span>

        <h2>{isEditing ? "Editar proyecto" : "Crear proyecto"}</h2>

        <p>
          Define el proyecto base sobre el cual se registrarán hallazgos,
          evidencias, notas y matriz.
        </p>
      </div>

      <div className="project-form__group mb-5 flex flex-col gap-2 [&_label]:text-sm [&_label]:font-bold [&_label]:text-slate-800">
        <label>Nombre del proyecto</label>
        <input
          type="text"
          value={nombre}
          onChange={(event) => setNombre(event.target.value)}
          placeholder="Ej. Auditoría documental SAFI"
        />
      </div>

      <div className="project-form__group mb-5 flex flex-col gap-2 [&_label]:text-sm [&_label]:font-bold [&_label]:text-slate-800">
        <label>Descripción</label>
        <textarea
          value={descripcion}
          onChange={(event) => setDescripcion(event.target.value)}
          placeholder="Describe brevemente el alcance u objetivo del proyecto"
          rows={5}
        />
      </div>

      <div className="project-form__actions mt-6 flex flex-wrap gap-3 [&_button]:rounded-2xl [&_button]:bg-emerald-950 [&_button]:px-5 [&_button]:py-3 [&_button]:text-sm [&_button]:font-bold [&_button]:text-white [&_button]:shadow-lg [&_button]:transition-all [&_button]:duration-300 [&_button]:hover:bg-emerald-900 [&_button]:hover:shadow-[0_4px_15px_rgba(16,185,129,0.3)] [&_button]:hover:-translate-y-0.5 [&_button]:disabled:bg-emerald-300">
        <button type="submit" disabled={loading}>
          {loading
            ? "Guardando..."
            : isEditing
            ? "Guardar cambios"
            : "Crear proyecto"}
        </button>

        {isEditing && onCancelEdit && (
          <button
            type="button"
            className="project-form__cancel bg-slate-200 text-slate-800 hover:bg-slate-300"
            onClick={onCancelEdit}
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}

export default ProjectForm;