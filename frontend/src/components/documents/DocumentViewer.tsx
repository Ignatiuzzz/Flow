import { useRef, useState } from "react";
import { Document as PdfDocument, Page, pdfjs } from "react-pdf";
import HighlightActionPopup from "./HighlightActionPopup";
import {
  Highlight,
  HighlightCoordinates,
  HighlightPageCoordinates,
  HighlightRect,
} from "../../types/highlight";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import "../../styles/components/documents/DocumentViewer.css";
import { Eraser, Highlighter, Minus, Plus } from "lucide-react";

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

type ViewerTool = "none" | "highlight" | "erase";

interface DocumentViewerProps {
  fileUrl: string;
  documentName: string;
  savedHighlights: Highlight[];
  onRegisterFinding?: (
    selectedText: string,
    coordinates: HighlightCoordinates
  ) => void;
  onRelateEvidence?: (
    selectedText: string,
    coordinates: HighlightCoordinates
  ) => void;
  onCreateNote?: (
    selectedText: string,
    coordinates: HighlightCoordinates
  ) => void;
  onSavedHighlightClick?: (
    highlightIds: string[],
    position: { x: number; y: number }
  ) => void;
  onEraseHighlightClick?: (
    highlightIds: string[],
    position: { x: number; y: number }
  ) => void;
}

interface TemporaryHighlight {
  id: string;
  coordinates: HighlightCoordinates;
}

function DocumentViewer({
  fileUrl,
  documentName,
  savedHighlights,
  onRegisterFinding,
  onRelateEvidence,
  onCreateNote,
  onSavedHighlightClick,
  onEraseHighlightClick,
}: DocumentViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [scale, setScale] = useState(1);
  const [activeTool, setActiveTool] = useState<ViewerTool>("none");

  const [selectedText, setSelectedText] = useState("");
  const [selectedCoordinates, setSelectedCoordinates] =
    useState<HighlightCoordinates | null>(null);

  const [temporaryHighlight, setTemporaryHighlight] =
    useState<TemporaryHighlight | null>(null);

  const [popupPosition, setPopupPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const pageCanvasRefs = useRef<Record<number, HTMLDivElement | null>>({});

  const handleLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const clearTemporaryHighlight = () => {
    setTemporaryHighlight(null);
    setSelectedText("");
    setSelectedCoordinates(null);
    setPopupPosition(null);
    window.getSelection()?.removeAllRanges();
  };

  const handleZoomIn = () => {
    setScale((previousScale) => Math.min(previousScale + 0.15, 2.5));
    clearTemporaryHighlight();
  };

  const handleZoomOut = () => {
    setScale((previousScale) => Math.max(previousScale - 0.15, 0.7));
    clearTemporaryHighlight();
  };

  const toggleTool = (tool: ViewerTool) => {
    clearTemporaryHighlight();

    setActiveTool((currentTool) => {
      if (currentTool === tool) return "none";
      return tool;
    });
  };

  const getPageFromPoint = (x: number, y: number): number | null => {
    const elements = document.elementsFromPoint(x, y);

    const pageCanvasElement = elements.find((element) =>
      element.classList.contains("document-viewer__page-canvas")
    ) as HTMLElement | undefined;

    if (!pageCanvasElement) return null;

    const pageNumber = pageCanvasElement.dataset.pageNumber;

    return pageNumber ? Number(pageNumber) : null;
  };

  const normalizeRect = (rect: HighlightRect): HighlightRect => {
    return {
      x: rect.x / scale,
      y: rect.y / scale,
      width: rect.width / scale,
      height: rect.height / scale,
    };
  };

  const scaleRect = (rect: HighlightRect): HighlightRect => {
    return {
      x: rect.x * scale,
      y: rect.y * scale,
      width: rect.width * scale,
      height: rect.height * scale,
    };
  };

  const buildCoordinatesFromRange = (range: Range): HighlightCoordinates => {
    const pageMap = new Map<number, HighlightRect[]>();

    const rects = Array.from(range.getClientRects()).filter(
      (rect) => rect.width > 0 && rect.height > 0
    );

    rects.forEach((rect) => {
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const pageNumber = getPageFromPoint(centerX, centerY);

      if (!pageNumber) return;

      const pageCanvasElement = pageCanvasRefs.current[pageNumber];

      if (!pageCanvasElement) return;

      const pageCanvasRect = pageCanvasElement.getBoundingClientRect();

      const visibleRect: HighlightRect = {
        x: rect.left - pageCanvasRect.left,
        y: rect.top - pageCanvasRect.top,
        width: rect.width,
        height: rect.height,
      };

      const normalizedRect = normalizeRect(visibleRect);

      const currentRects = pageMap.get(pageNumber) || [];
      currentRects.push(normalizedRect);
      pageMap.set(pageNumber, currentRects);
    });

    const paginas: HighlightPageCoordinates[] = Array.from(
      pageMap.entries()
    ).map(([pagina, rects]) => ({
      pagina,
      rects,
    }));

    return {
      paginas,
    };
  };

  const calculatePopupPosition = (range: Range) => {
    const selectionRects = Array.from(range.getClientRects()).filter(
      (rect) => rect.width > 0 && rect.height > 0
    );

    const lastRect = selectionRects[selectionRects.length - 1];

    if (!lastRect) return null;

    return {
      x: Math.min(lastRect.right + 12, window.innerWidth - 340),
      y: Math.min(Math.max(lastRect.top, 12), window.innerHeight - 260),
    };
  };

  const handleMouseUp = () => {
    if (activeTool !== "highlight") return;

    const selection = window.getSelection();
    const text = selection?.toString().trim();

    if (!selection || !text || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const coordinates = buildCoordinatesFromRange(range);
    const nextPopupPosition = calculatePopupPosition(range);

    if (coordinates.paginas.length === 0 || !nextPopupPosition) return;

    const highlightId = `temporary-${Date.now()}`;

    setTemporaryHighlight({
      id: highlightId,
      coordinates,
    });

    setSelectedText(text);
    setSelectedCoordinates(coordinates);
    setPopupPosition(nextPopupPosition);

    window.getSelection()?.removeAllRanges();
  };

  const handleRegisterFinding = () => {
    if (!selectedText || !selectedCoordinates) return;

    onRegisterFinding?.(selectedText, selectedCoordinates);
    clearTemporaryHighlight();
  };

  const handleRelateEvidence = () => {
    if (!selectedText || !selectedCoordinates) return;

    onRelateEvidence?.(selectedText, selectedCoordinates);
    clearTemporaryHighlight();
  };

  const handleCreateNote = () => {
    if (!selectedText || !selectedCoordinates) return;

    onCreateNote?.(selectedText, selectedCoordinates);
    clearTemporaryHighlight();
  };

  const getHighlightsForPage = (pageNumber: number) => {
    const saved = savedHighlights
      .filter((highlight) =>
        highlight.coordenadas?.paginas?.some(
          (page) => page.pagina === pageNumber
        )
      )
      .map((highlight) => ({
        id: highlight.id,
        status: "saved" as const,
        coordinates: highlight.coordenadas as HighlightCoordinates,
      }));

    const temporary =
      temporaryHighlight?.coordinates.paginas.some(
        (page) => page.pagina === pageNumber
      )
        ? [
          {
            id: temporaryHighlight.id,
            status: "temporary" as const,
            coordinates: temporaryHighlight.coordinates,
          },
        ]
        : [];

    return [...saved, ...temporary];
  };

  const getSavedHighlightIdsAtPoint = (
    pageNumber: number,
    visibleX: number,
    visibleY: number
  ): string[] => {
    const normalizedX = visibleX / scale;
    const normalizedY = visibleY / scale;

    return savedHighlights
      .filter((highlight) => {
        const pageCoordinates = highlight.coordenadas?.paginas?.find(
          (page) => page.pagina === pageNumber
        );

        if (!pageCoordinates) return false;

        return pageCoordinates.rects.some((rect) => {
          const withinX =
            normalizedX >= rect.x && normalizedX <= rect.x + rect.width;
          const withinY =
            normalizedY >= rect.y && normalizedY <= rect.y + rect.height;

          return withinX && withinY;
        });
      })
      .map((highlight) => highlight.id);
  };

  const handleSavedRectClick = (
    pageNumber: number,
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.stopPropagation();

    const pageCanvasElement = pageCanvasRefs.current[pageNumber];

    if (!pageCanvasElement) return;

    const pageCanvasRect = pageCanvasElement.getBoundingClientRect();

    const visibleX = event.clientX - pageCanvasRect.left;
    const visibleY = event.clientY - pageCanvasRect.top;

    const relatedHighlightIds = getSavedHighlightIdsAtPoint(
      pageNumber,
      visibleX,
      visibleY
    );

    if (relatedHighlightIds.length === 0) return;

    const position = {
      x: Math.min(event.clientX + 12, window.innerWidth - 410),
      y: Math.max(event.clientY - 20, 12),
    };

    if (activeTool === "erase") {
      onEraseHighlightClick?.(relatedHighlightIds, position);
      return;
    }

    onSavedHighlightClick?.(relatedHighlightIds, position);
  };

  const renderHighlightRects = (pageNumber: number) => {
    const highlights = getHighlightsForPage(pageNumber);

    return highlights.flatMap((highlight) => {
      const pageCoordinates = highlight.coordinates.paginas.find(
        (page) => page.pagina === pageNumber
      );

      if (!pageCoordinates) return [];

      return pageCoordinates.rects.map((rect, index) => {
        const visibleRect = scaleRect(rect);

        return (
          <button
            type="button"
            key={`${highlight.id}-${index}`}
            className={
              highlight.status === "temporary"
                ? "document-viewer__highlight-rect document-viewer__highlight-rect--temporary"
                : activeTool === "erase"
                  ? "document-viewer__highlight-rect document-viewer__highlight-rect--saved document-viewer__highlight-rect--eraser-hover"
                  : "document-viewer__highlight-rect document-viewer__highlight-rect--saved"
            }
            style={{
              left: visibleRect.x,
              top: visibleRect.y,
              width: visibleRect.width,
              height: visibleRect.height,
            }}
            onClick={(event) => {
              if (highlight.status !== "saved") return;
              handleSavedRectClick(pageNumber, event);
            }}
            aria-label={
              activeTool === "erase"
                ? "Borrar subrayado"
                : "Ver detalle del subrayado"
            }
          />
        );
      });
    });
  };

  return (
    <section className="document-viewer w-full min-h-screen bg-slate-100 text-slate-900">
      <div className="document-viewer__toolbar sticky top-0 z-30 mb-6 border-b border-slate-200 bg-white px-5 py-4 shadow-sm flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between [&_h2]:mb-1 [&_h2]:max-w-3xl [&_h2]:truncate [&_h2]:text-lg [&_h2]:font-extrabold [&_h2]:tracking-tight [&_h2]:text-slate-950 [&_p]:text-sm [&_p]:leading-5 [&_p]:text-slate-500">
        <div>
          <h2>{documentName}</h2>
          <p>
            Activa el resaltador para crear subrayados o el borrador para
            eliminarlos.
          </p>
        </div>

        <div className="document-viewer__tools flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between xl:justify-end">
  <div className="document-viewer__tool-group rounded-2xl border border-slate-200 bg-slate-50 p-2 sm:flex-row sm:items-center">
    <span className="document-viewer__tool-label text-xs font-bold uppercase tracking-wide text-slate-400">Herramientas</span>

    <button
      type="button"
      className={
        activeTool === "highlight"
          ? "document-viewer__tool-button document-viewer__tool-button--highlight document-viewer__tool-button--active"
          : "document-viewer__tool-button document-viewer__tool-button--highlight"
      }
      onClick={() => toggleTool("highlight")}
      title="Resaltar texto"
      aria-label="Activar resaltador"
    >
      <Highlighter className="document-viewer__tool-icon h-5 w-5" strokeWidth={2.4} />
      <span>Resaltar</span>
    </button>

    <button
      type="button"
      className={
        activeTool === "erase"
          ? "document-viewer__tool-button document-viewer__tool-button--erase document-viewer__tool-button--active"
          : "document-viewer__tool-button document-viewer__tool-button--erase"
      }
      onClick={() => toggleTool("erase")}
      title="Borrar subrayado"
      aria-label="Activar borrador"
    >
      <Eraser className="document-viewer__tool-icon h-5 w-5" strokeWidth={2.4} />
      <span>Borrar</span>
    </button>
  </div>

  <div className="document-viewer__zoom-group rounded-2xl border border-slate-200 bg-white p-2 shadow-sm sm:flex-row sm:items-center">
    <span className="document-viewer__tool-label text-xs font-bold uppercase tracking-wide text-slate-400">Zoom</span>

    <div className="document-viewer__zoom flex items-center gap-2 [&_button]:flex [&_button]:h-10 [&_button]:w-10 [&_button]:items-center [&_button]:justify-center [&_button]:rounded-xl [&_button]:border [&_button]:border-slate-200 [&_button]:bg-slate-700 [&_button]:text-lg [&_button]:font-bold [&_button]:text-white [&_button]:shadow-sm [&_button]:transition [&_button]:hover:bg-slate-600 [&_span]:min-w-16 [&_span]:rounded-xl [&_span]:border [&_span]:border-slate-200 [&_span]:bg-white [&_span]:px-4 [&_span]:py-2 [&_span]:text-center [&_span]:text-sm [&_span]:font-extrabold [&_span]:text-slate-700">
      <button type="button" onClick={handleZoomOut} aria-label="Alejar">
        <Minus size={18} strokeWidth={3} />
      </button>

      <span>{Math.round(scale * 100)}%</span>

      <button type="button" onClick={handleZoomIn} aria-label="Acercar">
        <Plus size={18} strokeWidth={3} />
      </button>
    </div>
  </div>
</div>
      </div>

      <div
        className={
          activeTool === "highlight"
            ? "document-viewer__content document-viewer__content--highlighting"
            : activeTool === "erase"
              ? "document-viewer__content document-viewer__content--erasing"
              : "document-viewer__content"
        }
        onMouseUp={handleMouseUp}
      >
        <PdfDocument
          file={fileUrl}
          onLoadSuccess={handleLoadSuccess}
          loading={<p className="document-viewer__message rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center text-slate-500">Cargando PDF...</p>}
          error={
            <p className="document-viewer__message document-viewer__message--error rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center text-slate-500 border-red-200 bg-red-50 text-red-700">
              No se pudo cargar el PDF.
            </p>
          }
        >
          {Array.from(new Array(numPages), (_item, index) => {
            const pageNumber = index + 1;

            return (
              <div className="document-viewer__page relative rounded-2xl border border-slate-300 bg-white p-4 shadow-xl" key={`page_${pageNumber}`}>
                <span className="document-viewer__page-number mb-3 inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-500">
                  Página {pageNumber}
                </span>

                <div
                  className="document-viewer__page-canvas relative overflow-hidden rounded-xl bg-white"
                  data-page-number={pageNumber}
                  ref={(element) => {
                    pageCanvasRefs.current[pageNumber] = element;
                  }}
                >
                  <Page
                    pageNumber={pageNumber}
                    scale={scale}
                    renderTextLayer
                    renderAnnotationLayer
                  />

                  <div className="document-viewer__highlight-layer pointer-events-none absolute inset-0 z-20">
                    {renderHighlightRects(pageNumber)}
                  </div>
                </div>
              </div>
            );
          })}
        </PdfDocument>
      </div>

      {popupPosition && selectedText && (
        <HighlightActionPopup
          selectedText={selectedText}
          position={popupPosition}
          onRegisterFinding={handleRegisterFinding}
          onRelateEvidence={handleRelateEvidence}
          onCreateNote={handleCreateNote}
          onClose={clearTemporaryHighlight}
        />
      )}
    </section>
  );
}

export default DocumentViewer;