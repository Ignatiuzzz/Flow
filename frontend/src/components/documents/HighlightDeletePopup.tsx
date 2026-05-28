import { HighlightRelations } from "../../types/highlight";
import "../../styles/components/documents/HighlightDeletePopup.css";

interface HighlightDeletePopupProps {
  relationsList: HighlightRelations[];
  position: {
    x: number;
    y: number;
  };
  onDeleteOne: (highlightId: string) => Promise<void>;
  onDeleteAll: () => Promise<void>;
  onClose: () => void;
}

function HighlightDeletePopup({
  relationsList,
  position,
  onDeleteOne,
  onDeleteAll,
  onClose,
}: HighlightDeletePopupProps) {
  return (
    <div
      className="highlight-delete-popup fixed z-[75] w-96 rounded-2xl border border-red-100 bg-white p-4 shadow-2xl"
      style={{
        top: position.y,
        left: position.x,
      }}
    >
      <div className="highlight-delete-popup__header mb-3 flex items-center justify-between gap-3 [&_h3]:text-sm [&_h3]:font-bold [&_h3]:text-slate-900 [&_button]:flex [&_button]:h-7 [&_button]:w-7 [&_button]:items-center [&_button]:justify-center [&_button]:rounded-full [&_button]:bg-slate-100 [&_button]:text-lg [&_button]:font-bold [&_button]:text-slate-600 [&_button]:transition [&_button]:hover:bg-red-100 [&_button]:hover:text-red-700">
        <h3>Borrar subrayado</h3>
        <button type="button" onClick={onClose}>
          ×
        </button>
      </div>

      <p className="highlight-delete-popup__description mb-3 rounded-xl bg-red-50 p-3 text-xs leading-relaxed text-red-700">
        Hay varios subrayados en esta zona. Elige cuál deseas eliminar o borra
        todos.
      </p>

      <div className="highlight-delete-popup__list mb-4 flex max-h-64 flex-col gap-2 overflow-y-auto">
        {relationsList.map((relations) => {
          const { subrayado, hallazgo, evidencia, nota } = relations;

          const label =
            hallazgo?.nombre ||
            evidencia?.nombre ||
            nota?.subtitulo ||
            nota?.texto ||
            subrayado.textoSubrayado;

          return (
            <div key={subrayado.id} className="highlight-delete-popup__item flex items-start justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3 [&_span]:inline-flex [&_span]:rounded-full [&_span]:bg-yellow-100 [&_span]:px-2 [&_span]:py-1 [&_span]:text-[11px] [&_span]:font-bold [&_span]:text-yellow-800 [&_p]:mt-2 [&_p]:line-clamp-2 [&_p]:text-sm [&_p]:font-semibold [&_p]:text-slate-800 [&_button]:shrink-0 [&_button]:rounded-lg [&_button]:bg-red-600 [&_button]:px-3 [&_button]:py-2 [&_button]:text-xs [&_button]:font-bold [&_button]:text-white [&_button]:transition [&_button]:hover:bg-red-700">
              <div>
                <span>{subrayado.tipo}</span>
                <p>{label}</p>
              </div>

              <button
                type="button"
                onClick={() => onDeleteOne(subrayado.id)}
              >
                Borrar
              </button>
            </div>
          );
        })}
      </div>

      <div className="highlight-delete-popup__actions flex flex-wrap gap-2 [&_button]:rounded-xl [&_button]:px-4 [&_button]:py-2 [&_button]:text-sm [&_button]:font-semibold [&_button]:transition [&_button:first-child]:bg-red-600 [&_button:first-child]:text-white [&_button:first-child]:hover:bg-red-700">
        <button type="button" onClick={onDeleteAll}>
          Borrar todos
        </button>

        <button type="button" onClick={onClose}>
          Cancelar
        </button>
      </div>
    </div>
  );
}

export default HighlightDeletePopup;