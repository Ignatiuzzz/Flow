import { useState } from "react";
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
  const [popupPosition, setPopupPosition] = useState<{ x: number; y: number } | null>(
    null
  );

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

    if (!selection || !text) {
      return;
    }

    const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;

    if (!range) {
      return;
    }

    const rect = range.getBoundingClientRect();

    setSelectedText(text);
    setPopupPosition({
      x: Math.min(rect.left + window.scrollX, window.innerWidth - 340),
      y: rect.bottom + window.scrollY + 12,
    });
  };

  const closePopup = () => {
    setSelectedText("");
    setPopupPosition(null);
    window.getSelection()?.removeAllRanges();
  };

  return (
    <section className="document-viewer">
      <div className="document-viewer__toolbar">
        <div>
          <h2>{documentName}</h2>
          <p>Selecciona texto dentro del PDF para registrar una acción.</p>
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