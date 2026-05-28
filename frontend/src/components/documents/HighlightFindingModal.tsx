import toast from "react-hot-toast";
import { FormEvent, useState } from "react";
import { aiApi } from "../../api/aiApi";
import { AISuggestButton } from "../ai/AISuggestButton";
import "../../styles/components/documents/HighlightFindingModal.css";

interface HighlightFindingModalProps {
    selectedText: string;
    proyectoId?: string;
    documentoId?: string;
    onClose: () => void;
    onSubmit: (data: {
        codigo: string;
        nombre: string;
        subtitulo: string;
        descripcion: string;
        observacion: string;
    }) => Promise<void>;
}

function HighlightFindingModal({
    selectedText,
    proyectoId,
    documentoId,
    onClose,
    onSubmit,
}: HighlightFindingModalProps) {
    const [codigo, setCodigo] = useState("");
    const [nombre, setNombre] = useState("");
    const [subtitulo, setSubtitulo] = useState("");
    const [descripcion, setDescripcion] = useState(selectedText);
    const [observacion, setObservacion] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();

        if (!codigo.trim()) {
            toast.error("El código del hallazgo es obligatorio.");
            return;
        }

        if (!nombre.trim()) {
            toast.error("El nombre del hallazgo es obligatorio.");
            return;
        }

        if (!descripcion.trim()) {
            toast.error("La descripción del hallazgo es obligatoria.");
            return;
        }

        try {
            setLoading(true);

            await onSubmit({
                codigo: codigo.trim(),
                nombre: nombre.trim(),
                subtitulo: subtitulo.trim(),
                descripcion: descripcion.trim(),
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
            tipo: "hallazgo",
            proyectoId: proyectoId,
            documentoId: documentoId,
        });
    };

    const handleApplySuggestions = (suggestions: Record<string, string>) => {
        if (suggestions.nombre) setNombre(suggestions.nombre);
        if (suggestions.descripcion) setDescripcion(suggestions.descripcion);
        if (suggestions.observacion) setObservacion(suggestions.observacion);
    };

    return (
        <div className="highlight-modal__overlay fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/50 p-6">
            <form className="highlight-finding-modal w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl" onSubmit={handleSubmit}>
                <div className="highlight-finding-modal__header mb-5 flex items-center justify-between gap-4 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-slate-900">
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <h2>Registrar hallazgo desde subrayado</h2>
                        <AISuggestButton 
                            onSuggest={handleSuggest} 
                            onApply={handleApplySuggestions} 
                            iconOnly 
                        />
                    </div>
                    <button type="button" onClick={onClose} className="rounded-full bg-slate-100 px-3 py-1 text-xl font-bold text-slate-600 hover:bg-slate-200">
                        ×
                    </button>
                </div>

                <div className="highlight-finding-modal__selected mb-5 rounded-xl bg-yellow-50 p-4 text-sm text-slate-700 [&_p]:mt-2 [&_p]:max-h-28 [&_p]:overflow-y-auto [&_p]:text-slate-600">
                    <strong>Texto subrayado:</strong>
                    <p>{selectedText}</p>
                </div>

                <div className="highlight-finding-modal__grid highlight-finding-modal__grid--two">
                    <div className="highlight-finding-modal__group mb-4 flex flex-col gap-2 [&_label]:text-sm [&_label]:font-semibold [&_label]:text-slate-700">
                        <label>Código del hallazgo</label>
                        <input
                            value={codigo}
                            onChange={(event) => setCodigo(event.target.value)}
                            placeholder="Ej. H-001"
                        />
                    </div>

                    <div className="highlight-finding-modal__group mb-4 flex flex-col gap-2 [&_label]:text-sm [&_label]:font-semibold [&_label]:text-slate-700">
                        <label>Nombre del hallazgo</label>
                        <input
                            value={nombre}
                            onChange={(event) => setNombre(event.target.value)}
                            placeholder="Ej. Ausencia de procedimiento documentado"
                        />
                    </div>
                </div>

                <div className="highlight-finding-modal__group mb-4 flex flex-col gap-2 [&_label]:text-sm [&_label]:font-semibold [&_label]:text-slate-700">
                    <label>Subtítulo del documento</label>
                    <input
                        value={subtitulo}
                        onChange={(event) => setSubtitulo(event.target.value)}
                        placeholder="Ej. Gestión de operaciones"
                    />
                </div>

                <div className="highlight-finding-modal__group mb-4 flex flex-col gap-2 [&_label]:text-sm [&_label]:font-semibold [&_label]:text-slate-700">
                    <label>Descripción</label>
                    <textarea
                        rows={5}
                        value={descripcion}
                        onChange={(event) => setDescripcion(event.target.value)}
                        placeholder="Describe el hallazgo identificado"
                    />
                </div>

                <div className="highlight-finding-modal__group mb-4 flex flex-col gap-2 [&_label]:text-sm [&_label]:font-semibold [&_label]:text-slate-700">
                    <label>Observación del subrayado</label>
                    <textarea
                        rows={3}
                        value={observacion}
                        onChange={(event) => setObservacion(event.target.value)}
                        placeholder="Comentario u observación sobre el texto subrayado"
                    />
                </div>

                <div className="highlight-finding-modal__actions mt-6 flex flex-wrap gap-3 [&_button]:rounded-xl [&_button]:bg-blue-600 [&_button]:px-5 [&_button]:py-3 [&_button]:text-sm [&_button]:font-semibold [&_button]:text-white [&_button]:hover:bg-blue-700 [&_button]:disabled:bg-blue-300">
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