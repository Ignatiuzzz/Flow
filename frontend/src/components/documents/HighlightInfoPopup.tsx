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
      className="highlight-info-popup fixed z-[65] w-96 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl"
      style={{
        top: position.y,
        left: position.x,
      }}
    >
      <div className="highlight-info-popup__header mb-3 flex items-center justify-between gap-3 [&_h3]:text-sm [&_h3]:font-bold [&_h3]:text-slate-900 [&_button]:flex [&_button]:h-7 [&_button]:w-7 [&_button]:items-center [&_button]:justify-center [&_button]:rounded-full [&_button]:bg-slate-100 [&_button]:text-lg [&_button]:font-bold [&_button]:text-slate-600 [&_button]:transition [&_button]:hover:bg-red-100 [&_button]:hover:text-red-700">
        <h3>Relaciones del subrayado</h3>
        <button type="button" onClick={onClose}>
          ×
        </button>
      </div>

      <div className="highlight-info-popup__list flex max-h-[70vh] flex-col gap-3 overflow-y-auto">
        {relationsList.map((relations) => {
          const { subrayado, hallazgo, evidencia, nota } = relations;

          return (
            <div key={subrayado.id} className="highlight-info-popup__item rounded-2xl border border-slate-100 bg-white p-2">
              <div className="highlight-info-popup__section mb-3 rounded-xl bg-yellow-50 p-3 text-sm text-slate-700 [&_p]:mt-2 [&_p]:max-h-24 [&_p]:overflow-y-auto [&_p]:text-xs [&_p]:leading-relaxed [&_p]:text-slate-600 [&_small]:mt-2 [&_small]:block [&_small]:text-xs [&_small]:font-medium [&_small]:text-slate-500">
                <span className="highlight-info-popup__badge inline-flex rounded-full bg-yellow-100 px-3 py-1 text-xs font-bold text-yellow-800">
                  {subrayado.tipo}
                </span>

                <p>{subrayado.textoSubrayado}</p>

                {subrayado.observacion && (
                  <small>Observación: {subrayado.observacion}</small>
                )}
              </div>

              {hallazgo && (
                <div className="highlight-info-popup__relation mb-2 rounded-xl border border-slate-100 bg-slate-50 p-3 [&_strong]:block [&_strong]:text-xs [&_strong]:font-bold [&_strong]:uppercase [&_strong]:tracking-wide [&_strong]:text-slate-500 [&_p]:mt-1 [&_p]:text-sm [&_p]:font-semibold [&_p]:text-slate-800">
                  <strong>Hallazgo vinculado</strong>
                  <p>
                    {hallazgo.codigo} - {hallazgo.nombre}
                  </p>
                </div>
              )}

              {evidencia && (
                <div className="highlight-info-popup__relation mb-2 rounded-xl border border-slate-100 bg-slate-50 p-3 [&_strong]:block [&_strong]:text-xs [&_strong]:font-bold [&_strong]:uppercase [&_strong]:tracking-wide [&_strong]:text-slate-500 [&_p]:mt-1 [&_p]:text-sm [&_p]:font-semibold [&_p]:text-slate-800">
                  <strong>Evidencia vinculada</strong>
                  <p>
                    {evidencia.codigo} - {evidencia.nombre}
                  </p>
                </div>
              )}

              {nota && (
                <div className="highlight-info-popup__relation mb-2 rounded-xl border border-slate-100 bg-slate-50 p-3 [&_strong]:block [&_strong]:text-xs [&_strong]:font-bold [&_strong]:uppercase [&_strong]:tracking-wide [&_strong]:text-slate-500 [&_p]:mt-1 [&_p]:text-sm [&_p]:font-semibold [&_p]:text-slate-800">
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