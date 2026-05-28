import toast from "react-hot-toast";
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
            toast.error("Selecciona una evidencia.");
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
        <div className="highlight-modal__overlay fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/50 p-6">
            <form className="highlight-evidence-modal w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl" onSubmit={handleSubmit}>
                <div className="highlight-evidence-modal__header mb-5 flex items-center justify-between gap-4 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-slate-900 [&_button]:rounded-full [&_button]:bg-slate-100 [&_button]:px-3 [&_button]:py-1 [&_button]:text-xl [&_button]:font-bold [&_button]:text-slate-600 [&_button]:hover:bg-slate-200">
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

                <div className="highlight-evidence-modal__selected mb-5 rounded-xl bg-yellow-50 p-4 text-sm text-slate-700 [&_p]:mt-2 [&_p]:text-slate-600">
                    <strong>Texto subrayado:</strong>
                    <p>{selectedText}</p>
                </div>

                <div className="highlight-evidence-modal__group mb-4 flex flex-col gap-2 [&_label]:text-sm [&_label]:font-semibold [&_label]:text-slate-700">
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

                <div className="highlight-evidence-modal__group mb-4 flex flex-col gap-2 [&_label]:text-sm [&_label]:font-semibold [&_label]:text-slate-700">
                    <label>Subtítulo del documento</label>
                    <input
                        value={subtitulo}
                        onChange={(event) => setSubtitulo(event.target.value)}
                        placeholder="Ej. Procedimiento de atención"
                    />
                </div>

                <div className="highlight-evidence-modal__group mb-4 flex flex-col gap-2 [&_label]:text-sm [&_label]:font-semibold [&_label]:text-slate-700">
                    <label>Observación</label>
                    <textarea
                        rows={3}
                        value={observacion}
                        onChange={(event) => setObservacion(event.target.value)}
                        placeholder="Observación opcional sobre el texto seleccionado"
                    />
                </div>

                <div className="highlight-evidence-modal__actions mt-6 flex flex-wrap gap-3 [&_button]:rounded-xl [&_button]:bg-emerald-600 [&_button]:px-5 [&_button]:py-3 [&_button]:text-sm [&_button]:font-semibold [&_button]:text-white [&_button]:hover:bg-emerald-700 [&_button]:disabled:bg-emerald-300">
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