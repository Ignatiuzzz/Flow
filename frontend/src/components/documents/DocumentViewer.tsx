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
    <section className="document-viewer">
      <div className="document-viewer__toolbar">
        <div>
          <h2>{documentName}</h2>
          <p>
            Activa el resaltador para crear subrayados o el borrador para
            eliminarlos.
          </p>
        </div>

        <div className="document-viewer__tools">
          <button
            type="button"
            className={
              activeTool === "highlight"
                ? "document-viewer__tool-button document-viewer__tool-button--highlight document-viewer__tool-button--active"
                : "document-viewer__tool-button document-viewer__tool-button--highlight"
            }
            onClick={() => toggleTool("highlight")}
            title="Resaltador"
            aria-label="Activar resaltador"
          >
            <svg
              className="document-viewer__tool-icon"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M4 20h16v2H4v-2Z" />
              <path d="M15.2 3.4 20.6 8.8 9.7 19.7H4.3v-5.4L15.2 3.4Z" />
              <path d="M16.6 2 22 7.4l-1.4 1.4-5.4-5.4L16.6 2Z" />
            </svg>
          </button>

          <button
            type="button"
            className={
              activeTool === "erase"
                ? "document-viewer__tool-button document-viewer__tool-button--erase document-viewer__tool-button--active"
                : "document-viewer__tool-button document-viewer__tool-button--erase"
            }
            onClick={() => toggleTool("erase")}
            title="Borrador"
            aria-label="Activar borrador"
          >
            <svg
              className="document-viewer__tool-icon"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M16.2 3.8 21 8.6 10.8 18.8H6L3 15.8 16.2 3.8Z" />
              <path d="M5.2 20h15.6v2H5.2v-2Z" />
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
              <div className="document-viewer__page" key={`page_${pageNumber}`}>
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