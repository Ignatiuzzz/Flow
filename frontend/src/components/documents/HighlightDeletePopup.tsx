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
      className="highlight-delete-popup"
      style={{
        top: position.y,
        left: position.x,
      }}
    >
      <div className="highlight-delete-popup__header">
        <h3>Borrar subrayado</h3>
        <button type="button" onClick={onClose}>
          ×
        </button>
      </div>

      <p className="highlight-delete-popup__description">
        Hay varios subrayados en esta zona. Elige cuál deseas eliminar o borra
        todos.
      </p>

      <div className="highlight-delete-popup__list">
        {relationsList.map((relations) => {
          const { subrayado, hallazgo, evidencia, nota } = relations;

          const label =
            hallazgo?.nombre ||
            evidencia?.nombre ||
            nota?.subtitulo ||
            nota?.texto ||
            subrayado.textoSubrayado;

          return (
            <div key={subrayado.id} className="highlight-delete-popup__item">
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

      <div className="highlight-delete-popup__actions">
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