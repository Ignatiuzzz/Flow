import { FormEvent, useState } from "react";
import { Finding } from "../../types/finding";
import "../../styles/components/documents/HighlightNoteModal.css";

interface HighlightNoteModalProps {
  selectedText: string;
  findings: Finding[];
  onClose: () => void;
  onSubmit: (data: {
    hallazgoId?: string;
    subtitulo: string;
    observacion: string;
  }) => Promise<void>;
}

function HighlightNoteModal({
  selectedText,
  findings,
  onClose,
  onSubmit,
}: HighlightNoteModalProps) {
  const [hallazgoId, setHallazgoId] = useState("");
  const [subtitulo, setSubtitulo] = useState("");
  const [observacion, setObservacion] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    try {
      setLoading(true);

      await onSubmit({
        hallazgoId: hallazgoId || undefined,
        subtitulo: subtitulo.trim(),
        observacion: observacion.trim(),
      });

      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="highlight-modal__overlay fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/50 p-6">
      <form className="highlight-note-modal w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl" onSubmit={handleSubmit}>
        <div className="highlight-note-modal__header mb-5 flex items-center justify-between gap-4 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-slate-900 [&_button]:rounded-full [&_button]:bg-slate-100 [&_button]:px-3 [&_button]:py-1 [&_button]:text-xl [&_button]:font-bold [&_button]:text-slate-600 [&_button]:hover:bg-slate-200">
          <h2>Crear nota desde subrayado</h2>
          <button type="button" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="highlight-note-modal__selected mb-5 rounded-xl bg-yellow-50 p-4 text-sm text-slate-700 [&_p]:mt-2 [&_p]:text-slate-600">
          <strong>Texto subrayado:</strong>
          <p>{selectedText}</p>
        </div>

        <div className="highlight-note-modal__group mb-4 flex flex-col gap-2 [&_label]:text-sm [&_label]:font-semibold [&_label]:text-slate-700">
          <label>Hallazgo relacionado opcional</label>
          <select
            value={hallazgoId}
            onChange={(event) => setHallazgoId(event.target.value)}
          >
            <option value="">Sin hallazgo relacionado</option>

            {findings.map((finding) => (
              <option key={finding.id} value={finding.id}>
                {finding.codigo} - {finding.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="highlight-note-modal__group mb-4 flex flex-col gap-2 [&_label]:text-sm [&_label]:font-semibold [&_label]:text-slate-700">
          <label>Subtítulo del documento</label>
          <input
            value={subtitulo}
            onChange={(event) => setSubtitulo(event.target.value)}
            placeholder="Ej. Gestión de seguridad"
          />
        </div>

        <div className="highlight-note-modal__group mb-4 flex flex-col gap-2 [&_label]:text-sm [&_label]:font-semibold [&_label]:text-slate-700">
          <label>Observación del subrayado</label>
          <textarea
            rows={3}
            value={observacion}
            onChange={(event) => setObservacion(event.target.value)}
            placeholder="Comentario u observación sobre el texto subrayado"
          />
        </div>

        <div className="highlight-note-modal__actions mt-6 flex flex-wrap gap-3 [&_button]:rounded-xl [&_button]:bg-purple-600 [&_button]:px-5 [&_button]:py-3 [&_button]:text-sm [&_button]:font-semibold [&_button]:text-white [&_button]:hover:bg-purple-700 [&_button]:disabled:bg-purple-300">
          <button type="submit" disabled={loading}>
            {loading ? "Guardando..." : "Crear nota"}
          </button>

          <button type="button" onClick={onClose}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}

export default HighlightNoteModal;