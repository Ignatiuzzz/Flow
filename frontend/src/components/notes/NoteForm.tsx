import toast from "react-hot-toast";
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
      toast.error("El texto de la nota es obligatorio.");
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
    <form className="note-form rounded-3xl border bg-white p-6 shadow-2xl" onSubmit={handleSubmit}>
      <div className="note-form__header mb-5 border-b border-slate-100 pb-5 [&_h2]:mb-2 [&_h2]:text-2xl [&_h2]:font-extrabold [&_h2]:tracking-tight [&_h2]:text-slate-950 [&_p]:text-sm [&_p]:leading-6 [&_p]:text-slate-500">
        <h2>{isEditing ? "Editar nota" : "Registrar nota"}</h2>

        <p>
          Registra una observación general o relaciónala con un hallazgo
          específico del proyecto.
        </p>
      </div>

      <div className="note-form__group mb-4 flex flex-col gap-2 [&_label]:text-sm [&_label]:font-bold [&_label]:text-slate-700">
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

      <div className="note-form__group mb-4 flex flex-col gap-2 [&_label]:text-sm [&_label]:font-bold [&_label]:text-slate-700">
        <label>Subtítulo</label>
        <input
          value={subtitulo}
          onChange={(event) => setSubtitulo(event.target.value)}
          placeholder="Ej. Observación preliminar"
        />
      </div>

      <div className="note-form__group mb-4 flex flex-col gap-2 [&_label]:text-sm [&_label]:font-bold [&_label]:text-slate-700">
        <label>Texto de la nota</label>
        <textarea
          value={texto}
          onChange={(event) => setTexto(event.target.value)}
          rows={7}
          placeholder="Escribe la nota o comentario del auditor"
        />
      </div>

      <div className="note-form__actions mt-5 flex flex-wrap gap-3 [&_button]:rounded-2xl [&_button]:px-5 [&_button]:py-3 [&_button]:text-sm [&_button]:font-bold [&_button]:text-white [&_button]:shadow-sm [&_button]:transition [&_button]:disabled:opacity-60">
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
            className="note-form__cancel text-slate-800"
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