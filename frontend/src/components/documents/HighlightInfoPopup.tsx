import { HighlightRelations } from "../../types/highlight";
import "../../styles/components/documents/HighlightInfoPopup.css";

interface HighlightInfoPopupProps {
  relationsList: HighlightRelations[];
  position: {
    x: number;
    y: number;
  };
  onClose: () => void;
}

function HighlightInfoPopup({
  relationsList,
  position,
  onClose,
}: HighlightInfoPopupProps) {
  return (
    <div
      className="highlight-info-popup"
      style={{
        top: position.y,
        left: position.x,
      }}
    >
      <div className="highlight-info-popup__header">
        <h3>Relaciones del subrayado</h3>
        <button type="button" onClick={onClose}>
          ×
        </button>
      </div>

      <div className="highlight-info-popup__list">
        {relationsList.map((relations) => {
          const { subrayado, hallazgo, evidencia, nota } = relations;

          return (
            <div key={subrayado.id} className="highlight-info-popup__item">
              <div className="highlight-info-popup__section">
                <span className="highlight-info-popup__badge">
                  {subrayado.tipo}
                </span>

                <p>{subrayado.textoSubrayado}</p>

                {subrayado.observacion && (
                  <small>Observación: {subrayado.observacion}</small>
                )}
              </div>

              {hallazgo && (
                <div className="highlight-info-popup__relation">
                  <strong>Hallazgo vinculado</strong>
                  <p>
                    {hallazgo.codigo} - {hallazgo.nombre}
                  </p>
                </div>
              )}

              {evidencia && (
                <div className="highlight-info-popup__relation">
                  <strong>Evidencia vinculada</strong>
                  <p>
                    {evidencia.codigo} - {evidencia.nombre}
                  </p>
                </div>
              )}

              {nota && (
                <div className="highlight-info-popup__relation">
                  <strong>Nota vinculada</strong>
                  <p>{nota.subtitulo || nota.texto}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default HighlightInfoPopup;