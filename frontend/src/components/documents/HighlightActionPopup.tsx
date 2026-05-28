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
      className="highlight-popup fixed z-50 w-80 rounded-3xl border border-white/30 bg-white/80 backdrop-blur-lg p-5 shadow-2xl"
      style={{
        top: position.y,
        left: position.x,
      }}
    >
      <div className="highlight-popup__header mb-3 flex items-center justify-between gap-3 [&_h3]:text-sm [&_h3]:font-bold [&_h3]:text-slate-900 [&_button]:flex [&_button]:h-7 [&_button]:w-7 [&_button]:items-center [&_button]:justify-center [&_button]:rounded-full [&_button]:bg-slate-100 [&_button]:text-lg [&_button]:font-bold [&_button]:text-slate-600 [&_button]:transition [&_button]:hover:bg-red-100 [&_button]:hover:text-red-700">
        <h3>Acción del subrayado</h3>
        <button type="button" onClick={onClose}>
          ×
        </button>
      </div>

      <p className="highlight-popup__text mb-4 max-h-24 overflow-y-auto rounded-xl bg-yellow-50 p-3 text-xs leading-relaxed text-slate-700">
        {selectedText.length > 160
          ? `${selectedText.slice(0, 160)}...`
          : selectedText}
      </p>

      <div className="highlight-popup__actions flex flex-col gap-2 [&_button]:rounded-xl [&_button]:bg-orange-600 [&_button]:px-4 [&_button]:py-2.5 [&_button]:text-sm [&_button]:font-semibold [&_button]:text-white [&_button]:transition-all [&_button]:hover:bg-orange-700 [&_button]:hover:-translate-y-0.5 [&_button]:hover:shadow-lg">
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