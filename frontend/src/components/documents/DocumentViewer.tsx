import { useRef, useState } from "react";
import { Document as PdfDocument, Page, pdfjs } from "react-pdf";
import HighlightActionPopup from "./HighlightActionPopup";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import "../../styles/components/documents/DocumentViewer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface DocumentViewerProps {
  fileUrl: string;
  documentName: string;
  onRegisterFinding?: (selectedText: string) => void;
  onRelateEvidence?: (selectedText: string) => void;
  onCreateNote?: (selectedText: string) => void;
}

function DocumentViewer({
  fileUrl,
  documentName,
  onRegisterFinding,
  onRelateEvidence,
  onCreateNote,
}: DocumentViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [scale, setScale] = useState(1);

  const [selectedText, setSelectedText] = useState("");
  const [highlightButtonPosition, setHighlightButtonPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const [popupPosition, setPopupPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const selectedRangeRef = useRef<Range | null>(null);

  const handleLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const handleZoomIn = () => {
    setScale((previousScale) => Math.min(previousScale + 0.15, 2.5));
  };

  const handleZoomOut = () => {
    setScale((previousScale) => Math.max(previousScale - 0.15, 0.7));
  };

  const handleMouseUp = () => {
    const selection = window.getSelection();
    const text = selection?.toString().trim();

    if (!selection || !text || selection.rangeCount === 0) {
      setHighlightButtonPosition(null);
      return;
    }

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    if (!rect || rect.width === 0 || rect.height === 0) {
      setHighlightButtonPosition(null);
      return;
    }

    selectedRangeRef.current = range.cloneRange();
    setSelectedText(text);

    setPopupPosition(null);

    setHighlightButtonPosition({
      x: Math.min(rect.right + 10, window.innerWidth - 130),
      y: Math.max(rect.top - 6, 10),
    });
  };

  const applyVisualHighlight = () => {
    const range = selectedRangeRef.current;

    if (!range || !selectedText) return;

    try {
      const mark = document.createElement("mark");
      mark.className = "document-viewer__selection-highlight";
      range.surroundContents(mark);
    } catch (error) {
      console.warn(
        "No se pudo envolver exactamente el texto seleccionado. Se continuará con el flujo.",
        error
      );
    }
  };

  const handleHighlightClick = () => {
    if (!selectedText || !highlightButtonPosition) return;

    applyVisualHighlight();

    setPopupPosition({
      x: Math.min(highlightButtonPosition.x, window.innerWidth - 340),
      y: Math.min(highlightButtonPosition.y + 44, window.innerHeight - 260),
    });

    setHighlightButtonPosition(null);
  };

  const closePopup = () => {
    setSelectedText("");
    setPopupPosition(null);
    setHighlightButtonPosition(null);
    selectedRangeRef.current = null;
    window.getSelection()?.removeAllRanges();
  };

  return (
    <section className="document-viewer">
      <div className="document-viewer__toolbar">
        <div>
          <h2>{documentName}</h2>
          <p>
            Selecciona texto dentro del PDF y presiona “Subrayar” para registrar
            una acción.
          </p>
        </div>

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

      <div className="document-viewer__content" onMouseUp={handleMouseUp}>
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
          {Array.from(new Array(numPages), (_item, index) => (
            <div className="document-viewer__page" key={`page_${index + 1}`}>
              <span className="document-viewer__page-number">
                Página {index + 1}
              </span>

              <Page
                pageNumber={index + 1}
                scale={scale}
                renderTextLayer
                renderAnnotationLayer
              />
            </div>
          ))}
        </PdfDocument>
      </div>

      {highlightButtonPosition && selectedText && (
        <button
          type="button"
          className="document-viewer__highlight-button"
          style={{
            top: highlightButtonPosition.y,
            left: highlightButtonPosition.x,
          }}
          onClick={handleHighlightClick}
        >
          Subrayar
        </button>
      )}

      {popupPosition && selectedText && (
        <HighlightActionPopup
          selectedText={selectedText}
          position={popupPosition}
          onRegisterFinding={() => {
            onRegisterFinding?.(selectedText);
            closePopup();
          }}
          onRelateEvidence={() => {
            onRelateEvidence?.(selectedText);
            closePopup();
          }}
          onCreateNote={() => {
            onCreateNote?.(selectedText);
            closePopup();
          }}
          onClose={closePopup}
        />
      )}
    </section>
  );
}

export default DocumentViewer;