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
      alert("El nombre del proyecto es obligatorio.");
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
    <form className="project-form" onSubmit={handleSubmit}>
      <h2 className="project-form__title">
        {isEditing ? "Editar proyecto" : "Crear proyecto"}
      </h2>

      <div className="project-form__group">
        <label>Nombre</label>
        <input
          type="text"
          value={nombre}
          onChange={(event) => setNombre(event.target.value)}
          placeholder="Ej. Auditoría SAFI 2026"
        />
      </div>

      <div className="project-form__group">
        <label>Descripción</label>
        <textarea
          value={descripcion}
          onChange={(event) => setDescripcion(event.target.value)}
          placeholder="Describe brevemente el objetivo del proyecto"
          rows={4}
        />
      </div>

      <div className="project-form__actions">
        <button type="submit" disabled={loading}>
          {loading
            ? "Guardando..."
            : isEditing
            ? "Actualizar proyecto"
            : "Crear proyecto"}
        </button>

        {isEditing && onCancelEdit && (
          <button
            type="button"
            className="project-form__cancel"
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