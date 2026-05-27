import { FormEvent, useState } from "react";
import "../../styles/components/documents/HighlightFindingModal.css";

interface HighlightFindingModalProps {
  selectedText: string;
  onClose: () => void;
  onSubmit: (data: {
    nombre: string;
    descripcion: string;
  }) => Promise<void>;
}

function HighlightFindingModal({
  selectedText,
  onClose,
  onSubmit,
}: HighlightFindingModalProps) {
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState(selectedText);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!nombre.trim()) {
      alert("El nombre del hallazgo es obligatorio.");
      return;
    }

    if (!descripcion.trim()) {
      alert("La descripción del hallazgo es obligatoria.");
      return;
    }

    try {
      setLoading(true);

      await onSubmit({
        nombre: nombre.trim(),
        descripcion: descripcion.trim(),
      });

      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="highlight-modal__overlay">
      <form className="highlight-finding-modal" onSubmit={handleSubmit}>
        <div className="highlight-finding-modal__header">
          <h2>Registrar hallazgo desde subrayado</h2>
          <button type="button" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="highlight-finding-modal__selected">
          <strong>Texto subrayado:</strong>
          <p>{selectedText}</p>
        </div>

        <div className="highlight-finding-modal__group">
          <label>Nombre del hallazgo</label>
          <input
            value={nombre}
            onChange={(event) => setNombre(event.target.value)}
            placeholder="Ej. Ausencia de procedimiento documentado"
          />
        </div>

        <div className="highlight-finding-modal__group">
          <label>Descripción</label>
          <textarea
            rows={5}
            value={descripcion}
            onChange={(event) => setDescripcion(event.target.value)}
            placeholder="Describe el hallazgo identificado"
          />
        </div>

        <div className="highlight-finding-modal__actions">
          <button type="submit" disabled={loading}>
            {loading ? "Guardando..." : "Crear hallazgo"}
          </button>

          <button type="button" onClick={onClose}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}

export default HighlightFindingModal;