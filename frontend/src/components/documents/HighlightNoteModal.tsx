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
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();

        try {
            setLoading(true);

            await onSubmit({
                hallazgoId: hallazgoId || undefined,
                subtitulo: subtitulo.trim(),
            });

            onClose();
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="highlight-modal__overlay">
            <form className="highlight-note-modal" onSubmit={handleSubmit}>
                <div className="highlight-note-modal__header">
                    <h2>Crear nota desde subrayado</h2>
                    <button type="button" onClick={onClose}>
                        ×
                    </button>
                </div>

                <div className="highlight-note-modal__selected">
                    <strong>Texto subrayado:</strong>
                    <p>{selectedText}</p>
                </div>

                <div className="highlight-note-modal__group">
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

                <div className="highlight-note-modal__group">
                    <label>Subtítulo</label>
                    <input
                        value={subtitulo}
                        onChange={(event) => setSubtitulo(event.target.value)}
                        placeholder="Ej. Nota sobre evidencia documental"
                    />
                </div>

                <div className="highlight-note-modal__actions">
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