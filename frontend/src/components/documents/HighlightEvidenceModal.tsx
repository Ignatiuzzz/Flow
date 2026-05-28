import { FormEvent, useState } from "react";
import { Evidence } from "../../types/evidence";
import { aiApi } from "../../api/aiApi";
import { AISuggestButton } from "../ai/AISuggestButton";
import "../../styles/components/documents/HighlightEvidenceModal.css";

interface HighlightEvidenceModalProps {
    selectedText: string;
    evidences: Evidence[];
    onClose: () => void;
    onSubmit: (data: {
        evidenciaId: string;
        subtitulo: string;
        observacion: string;
    }) => Promise<void>;
}

function HighlightEvidenceModal({
    selectedText,
    evidences,
    onClose,
    onSubmit,
}: HighlightEvidenceModalProps) {
    const [evidenciaId, setEvidenciaId] = useState("");
    const [subtitulo, setSubtitulo] = useState("");
    const [observacion, setObservacion] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();

        if (!evidenciaId) {
            alert("Selecciona una evidencia.");
            return;
        }

        try {
            setLoading(true);

            await onSubmit({
                evidenciaId,
                subtitulo: subtitulo.trim(),
                observacion: observacion.trim(),
            });

            onClose();
        } finally {
            setLoading(false);
        }
    };

    const handleSuggest = async () => {
        return await aiApi.suggestFromHighlight({
            textoSubrayado: selectedText,
            tipo: "evidencia"
        });
    };

    const handleApplySuggestions = (suggestions: Record<string, string>) => {
        if (suggestions.subtitulo) setSubtitulo(suggestions.subtitulo);
        if (suggestions.observacion) setObservacion(suggestions.observacion);
    };

    return (
        <div className="highlight-modal__overlay">
            <form className="highlight-evidence-modal" onSubmit={handleSubmit}>
                <div className="highlight-evidence-modal__header">
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <h2>Relacionar evidencia</h2>
                        <AISuggestButton 
                            onSuggest={handleSuggest} 
                            onApply={handleApplySuggestions} 
                            iconOnly 
                        />
                    </div>
                    <button type="button" onClick={onClose}>
                        ×
                    </button>
                </div>

                <div className="highlight-evidence-modal__selected">
                    <strong>Texto subrayado:</strong>
                    <p>{selectedText}</p>
                </div>

                <div className="highlight-evidence-modal__group">
                    <label>Evidencia existente</label>
                    <select
                        value={evidenciaId}
                        onChange={(event) => setEvidenciaId(event.target.value)}
                    >
                        <option value="">Selecciona una evidencia</option>
                        {evidences.map((evidence) => (
                            <option key={evidence.id} value={evidence.id}>
                                {evidence.codigo} - {evidence.nombre}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="highlight-evidence-modal__group">
                    <label>Subtítulo del documento</label>
                    <input
                        value={subtitulo}
                        onChange={(event) => setSubtitulo(event.target.value)}
                        placeholder="Ej. Procedimiento de atención"
                    />
                </div>

                <div className="highlight-evidence-modal__group">
                    <label>Observación</label>
                    <textarea
                        rows={3}
                        value={observacion}
                        onChange={(event) => setObservacion(event.target.value)}
                        placeholder="Observación opcional sobre el texto seleccionado"
                    />
                </div>

                <div className="highlight-evidence-modal__actions">
                    <button type="submit" disabled={loading}>
                        {loading ? "Guardando..." : "Relacionar evidencia"}
                    </button>

                    <button type="button" onClick={onClose}>
                        Cancelar
                    </button>
                </div>
            </form>
        </div>
    );
}

export default HighlightEvidenceModal;