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

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

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
}: DocumentViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [scale, setScale] = useState(1);
  const [isHighlighterActive, setIsHighlighterActive] = useState(false);

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

  const getPageFromPoint = (x: number, y: number): number | null => {
    const elements = document.elementsFromPoint(x, y);

    const pageCanvasElement = elements.find((element) =>
      element.classList.contains("document-viewer__page-canvas")
    ) as HTMLElement | undefined;

    if (!pageCanvasElement) return null;

    const pageNumber = pageCanvasElement.dataset.pageNumber;

    return pageNumber ? Number(pageNumber) : null;
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

      const relativeRect: HighlightRect = {
        x: rect.left - pageCanvasRect.left,
        y: rect.top - pageCanvasRect.top,
        width: rect.width,
        height: rect.height,
      };

      const currentRects = pageMap.get(pageNumber) || [];
      currentRects.push(relativeRect);
      pageMap.set(pageNumber, currentRects);
    });

    const paginas: HighlightPageCoordinates[] = Array.from(pageMap.entries()).map(
      ([pagina, rects]) => ({
        pagina,
        rects,
      })
    );

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
    if (!isHighlighterActive) return;

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
    x: number,
    y: number
  ): string[] => {
    return savedHighlights
      .filter((highlight) => {
        const pageCoordinates = highlight.coordenadas?.paginas?.find(
          (page) => page.pagina === pageNumber
        );

        if (!pageCoordinates) return false;

        return pageCoordinates.rects.some((rect) => {
          const withinX = x >= rect.x && x <= rect.x + rect.width;
          const withinY = y >= rect.y && y <= rect.y + rect.height;

          return withinX && withinY;
        });
      })
      .map((highlight) => highlight.id);
  };

  const renderHighlightRects = (pageNumber: number) => {
    const highlights = getHighlightsForPage(pageNumber);

    return highlights.flatMap((highlight) => {
      const pageCoordinates = highlight.coordinates.paginas.find(
        (page) => page.pagina === pageNumber
      );

      if (!pageCoordinates) return [];

      return pageCoordinates.rects.map((rect, index) => (
        <button
          type="button"
          key={`${highlight.id}-${index}`}
          className={
            highlight.status === "temporary"
              ? "document-viewer__highlight-rect document-viewer__highlight-rect--temporary"
              : "document-viewer__highlight-rect document-viewer__highlight-rect--saved"
          }
          style={{
            left: rect.x,
            top: rect.y,
            width: rect.width,
            height: rect.height,
          }}
          onClick={(event) => {
            if (highlight.status !== "saved") return;

            event.stopPropagation();

            const pageCanvasElement = pageCanvasRefs.current[pageNumber];

            if (!pageCanvasElement) return;

            const pageCanvasRect = pageCanvasElement.getBoundingClientRect();

            const relativeX = event.clientX - pageCanvasRect.left;
            const relativeY = event.clientY - pageCanvasRect.top;

            const relatedHighlightIds = getSavedHighlightIdsAtPoint(
              pageNumber,
              relativeX,
              relativeY
            );

            if (relatedHighlightIds.length === 0) return;

            onSavedHighlightClick?.(relatedHighlightIds, {
              x: Math.min(event.clientX + 12, window.innerWidth - 410),
              y: Math.max(event.clientY - 20, 12),
            });
          }}
          aria-label="Ver detalle del subrayado"
        />
      ));
    });
  };

  return (
    <section className="document-viewer">
      <div className="document-viewer__toolbar">
        <div>
          <h2>{documentName}</h2>
          <p>
            Activa el resaltador, selecciona texto dentro del PDF y elige una
            acción.
          </p>
        </div>

        <div className="document-viewer__tools">
          <button
            type="button"
            className={
              isHighlighterActive
                ? "document-viewer__highlighter document-viewer__highlighter--active"
                : "document-viewer__highlighter"
            }
            onClick={() => setIsHighlighterActive((current) => !current)}
            title="Resaltador"
            aria-label="Activar resaltador"
          >
            <svg
              className="document-viewer__highlighter-icon"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M4 20h16v2H4v-2Z" />
              <path d="M15.2 3.4 20.6 8.8 9.7 19.7H4.3v-5.4L15.2 3.4Z" />
              <path d="M16.6 2 22 7.4l-1.4 1.4-5.4-5.4L16.6 2Z" />
            </svg>
          </button>

          <div className="document-viewer__zoom">
            <button type="button" onClick={handleZoomOut}>
              -
            </button>

            <span>{Math.round(scale * 100)}%</span>

            <button type="button" onClick={handleZoomIn}>
              +
            </button>
          </div>
        </div>
      </div>

      <div
        className={
          isHighlighterActive
            ? "document-viewer__content document-viewer__content--highlighting"
            : "document-viewer__content"
        }
        onMouseUp={handleMouseUp}
      >
        <PdfDocument
          file={fileUrl}
          onLoadSuccess={handleLoadSuccess}
          loading={<p className="document-viewer__message">Cargando PDF...</p>}
          error={
            <p className="document-viewer__message document-viewer__message--error">
              No se pudo cargar el PDF.
            </p>
          }
        >
          {Array.from(new Array(numPages), (_item, index) => {
            const pageNumber = index + 1;

            return (
              <div
                className="document-viewer__page"
                key={`page_${pageNumber}`}
              >
                <span className="document-viewer__page-number">
                  Página {pageNumber}
                </span>

                <div
                  className="document-viewer__page-canvas"
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

                  <div className="document-viewer__highlight-layer">
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