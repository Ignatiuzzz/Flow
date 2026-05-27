import "../../styles/components/documents/HighlightActionPopup.css";

interface HighlightActionPopupProps {
    selectedText: string;
    position: {
        x: number;
        y: number;
    };
    onRegisterFinding: () => void;
    onRelateEvidence: () => void;
    onCreateNote: () => void;
    onClose: () => void;
}

function HighlightActionPopup({
    selectedText,
    position,
    onRegisterFinding,
    onRelateEvidence,
    onCreateNote,
    onClose,
}: HighlightActionPopupProps) {
    return (
        <div
            className="highlight-popup"
            style={{
                top: position.y,
                left: position.x,
            }}
        >
            <div className="highlight-popup__header">
                <h3>Texto seleccionado</h3>
                <button type="button" onClick={onClose}>
                    ×
                </button>
            </div>

            <p className="highlight-popup__text">
                {selectedText.length > 160
                    ? `${selectedText.slice(0, 160)}...`
                    : selectedText}
            </p>

            <div className="highlight-popup__actions">
                <button type="button" onClick={onRegisterFinding}>
                    Registrar Hallazgo
                </button>

                <button type="button" onClick={onRelateEvidence}>
                    Relacionar Evidencia
                </button>

                <button type="button" onClick={onCreateNote}>
                    Nota
                </button>
            </div>
        </div>
    );
}

export default HighlightActionPopup;