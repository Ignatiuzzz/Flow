import { FormEvent, useEffect, useState } from "react";
import { Finding } from "../../types/finding";
import { Note, NoteCreate } from "../../types/note";
import "../../styles/components/notes/NoteForm.css";

interface NoteFormProps {
  projectId: string;
  findings: Finding[];
  selectedNote?: Note | null;
  onSubmit: (data: NoteCreate) => Promise<void>;
  onCancelEdit?: () => void;
}

function NoteForm({
  projectId,
  findings,
  selectedNote,
  onSubmit,
  onCancelEdit,
}: NoteFormProps) {
  const [hallazgoId, setHallazgoId] = useState("");
  const [subtitulo, setSubtitulo] = useState("");
  const [texto, setTexto] = useState("");
  const [loading, setLoading] = useState(false);

  const isEditing = Boolean(selectedNote);

  useEffect(() => {
    if (selectedNote) {
      setHallazgoId(selectedNote.hallazgoId || "");
      setSubtitulo(selectedNote.subtitulo || "");
      setTexto(selectedNote.texto || "");
    } else {
      resetForm();
    }
  }, [selectedNote]);

  const resetForm = () => {
    setHallazgoId("");
    setSubtitulo("");
    setTexto("");
  };

  const handleFindingChange = (selectedFindingId: string) => {
    setHallazgoId(selectedFindingId);

    const selectedFinding = findings.find(
      (finding) => finding.id === selectedFindingId
    );

    if (!selectedFinding) return;

    if (!subtitulo.trim()) {
      setSubtitulo(`Nota sobre ${selectedFinding.codigo}`);
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!texto.trim()) {
      alert("El texto de la nota es obligatorio.");
      return;
    }

    try {
      setLoading(true);

      await onSubmit({
        proyectoId: projectId,
        hallazgoId: hallazgoId || undefined,
        subtitulo: subtitulo.trim(),
        texto: texto.trim(),
      });

      if (!isEditing) {
        resetForm();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="note-form" onSubmit={handleSubmit}>
      <div className="note-form__header">
        <h2>{isEditing ? "Editar nota" : "Registrar nota"}</h2>

        <p>
          Registra una observación general o relaciónala con un hallazgo
          específico del proyecto.
        </p>
      </div>

      <div className="note-form__group">
        <label>Hallazgo relacionado</label>
        <select
          value={hallazgoId}
          onChange={(event) => handleFindingChange(event.target.value)}
        >
          <option value="">Sin hallazgo relacionado</option>

          {findings.map((finding) => (
            <option key={finding.id} value={finding.id}>
              {finding.codigo} - {finding.nombre}
            </option>
          ))}
        </select>
      </div>

      <div className="note-form__group">
        <label>Subtítulo</label>
        <input
          value={subtitulo}
          onChange={(event) => setSubtitulo(event.target.value)}
          placeholder="Ej. Observación preliminar"
        />
      </div>

      <div className="note-form__group">
        <label>Texto de la nota</label>
        <textarea
          value={texto}
          onChange={(event) => setTexto(event.target.value)}
          rows={7}
          placeholder="Escribe la nota o comentario del auditor"
        />
      </div>

      <div className="note-form__actions">
        <button type="submit" disabled={loading}>
          {loading
            ? "Guardando..."
            : isEditing
            ? "Guardar cambios"
            : "Crear nota"}
        </button>

        {isEditing && onCancelEdit && (
          <button
            type="button"
            className="note-form__cancel"
            onClick={onCancelEdit}
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}

export default NoteForm;