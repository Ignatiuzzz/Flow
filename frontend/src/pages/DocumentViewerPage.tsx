import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { documentApi } from "../api/documentApi";
import { evidenceApi } from "../api/evidenceApi";
import { findingApi } from "../api/findingApi";
import { highlightApi } from "../api/highlightApi";
import { noteApi } from "../api/noteApi";
import DocumentViewer from "../components/documents/DocumentViewer";
import HighlightEvidenceModal from "../components/documents/HighlightEvidenceModal";
import HighlightFindingModal from "../components/documents/HighlightFindingModal";
import HighlightInfoPopup from "../components/documents/HighlightInfoPopup";
import HighlightNoteModal from "../components/documents/HighlightNoteModal";
import { AuditDocument } from "../types/document";
import { Evidence } from "../types/evidence";
import { Finding } from "../types/finding";
import {
  Highlight,
  HighlightCoordinates,
  HighlightRelations,
} from "../types/highlight";
import "../styles/pages/DocumentViewerPage.css";

type HighlightMode = "finding" | "evidence" | "note" | null;

function DocumentViewerPage() {
  const { projectId, documentId } = useParams();
  const navigate = useNavigate();

  const [documentData, setDocumentData] = useState<AuditDocument | null>(null);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [evidences, setEvidences] = useState<Evidence[]>([]);
  const [highlights, setHighlights] = useState<Highlight[]>([]);

  const [selectedText, setSelectedText] = useState("");
  const [selectedCoordinates, setSelectedCoordinates] =
    useState<HighlightCoordinates | null>(null);

  const [mode, setMode] = useState<HighlightMode>(null);
  const [loading, setLoading] = useState(false);

  const [selectedRelationsList, setSelectedRelationsList] = useState<
    HighlightRelations[]
  >([]);
  const [relationsPosition, setRelationsPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const currentProjectId = projectId || "";
  const currentDocumentId = documentId || "";

  const loadPageData = async () => {
    if (!currentProjectId || !currentDocumentId) return;

    try {
      setLoading(true);

      const [
        documentResponse,
        findingsResponse,
        evidencesResponse,
        highlightsResponse,
      ] = await Promise.all([
        documentApi.getById(currentDocumentId),
        findingApi.getByProject(currentProjectId),
        evidenceApi.getByProject(currentProjectId),
        highlightApi.getByDocument(currentDocumentId),
      ]);

      setDocumentData(documentResponse);
      setFindings(findingsResponse);
      setEvidences(evidencesResponse);
      setHighlights(highlightsResponse);
    } catch (error) {
      console.error(error);
      alert("No se pudo cargar la información del visor.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPageData();
  }, [currentProjectId, currentDocumentId]);

  const closeModal = () => {
    setMode(null);
  };

  const clearSelection = () => {
    setSelectedText("");
    setSelectedCoordinates(null);
    setMode(null);
  };

  const closeRelationsPopup = () => {
    setSelectedRelationsList([]);
    setRelationsPosition(null);
  };

  const handleSavedHighlightClick = async (
    highlightIds: string[],
    position: { x: number; y: number }
  ) => {
    try {
      const relations = await Promise.all(
        highlightIds.map((highlightId) => highlightApi.getRelations(highlightId))
      );

      setSelectedRelationsList(relations);
      setRelationsPosition(position);
    } catch (error) {
      console.error(error);
      alert("No se pudieron cargar las relaciones del subrayado.");
    }
  };

  const fileUrl = currentDocumentId
    ? documentApi.fileUrl(currentDocumentId)
    : "";

  return (
    <main className="document-viewer-page">
      <button
        className="document-viewer-page__back"
        onClick={() => navigate(`/projects/${currentProjectId}/documents`)}
      >
        Volver a documentos
      </button>

      {loading && (
        <p className="document-viewer-page__message">Cargando documento...</p>
      )}

      {!loading && !documentData && (
        <p className="document-viewer-page__message">
          No se encontró el documento.
        </p>
      )}

      {!loading && documentData && (
        <DocumentViewer
          fileUrl={fileUrl}
          documentName={documentData.nombreOriginal}
          savedHighlights={highlights}
          onSavedHighlightClick={handleSavedHighlightClick}
          onRegisterFinding={(text, coordinates) => {
            closeRelationsPopup();
            setSelectedText(text);
            setSelectedCoordinates(coordinates);
            setMode("finding");
          }}
          onRelateEvidence={(text, coordinates) => {
            closeRelationsPopup();
            setSelectedText(text);
            setSelectedCoordinates(coordinates);
            setMode("evidence");
          }}
          onCreateNote={(text, coordinates) => {
            closeRelationsPopup();
            setSelectedText(text);
            setSelectedCoordinates(coordinates);
            setMode("note");
          }}
        />
      )}

      {selectedRelationsList.length > 0 && relationsPosition && (
        <HighlightInfoPopup
          relationsList={selectedRelationsList}
          position={relationsPosition}
          onClose={closeRelationsPopup}
        />
      )}

      {mode === "finding" && selectedText && selectedCoordinates && (
        <HighlightFindingModal
          selectedText={selectedText}
          onClose={closeModal}
          onSubmit={async (data) => {
            const generatedCode = `H-DOC-${Date.now()}`;

            await findingApi.createFromHighlight({
              proyectoId: currentProjectId,
              documentoId: currentDocumentId,
              textoSubrayado: selectedText,
              coordenadas: selectedCoordinates,
              subtitulo: "",
              observacion: data.observacion,
              nombre: data.nombre,
              codigo: generatedCode,
              descripcion: data.descripcion,
              criterio: "",
              objetivo: "",
              causa: "",
              efecto: "",
              conclusion: "",
              impacto: 1,
              urgencia: 1,
              justificacionRiesgo: "",
              recomendaciones: "",
            });

            alert("Hallazgo creado desde subrayado.");
            await loadPageData();
            clearSelection();
          }}
        />
      )}

      {mode === "evidence" && selectedText && selectedCoordinates && (
        <HighlightEvidenceModal
          selectedText={selectedText}
          evidences={evidences}
          onClose={closeModal}
          onSubmit={async (data) => {
            await evidenceApi.relateFromHighlight({
              proyectoId: currentProjectId,
              documentoId: currentDocumentId,
              evidenciaId: data.evidenciaId,
              textoSubrayado: selectedText,
              coordenadas: selectedCoordinates,
              subtitulo: data.subtitulo,
              observacion: data.observacion,
            });

            alert("Evidencia relacionada al subrayado.");
            await loadPageData();
            clearSelection();
          }}
        />
      )}

      {mode === "note" && selectedText && selectedCoordinates && (
        <HighlightNoteModal
          selectedText={selectedText}
          findings={findings}
          onClose={closeModal}
          onSubmit={async (data) => {
            await noteApi.createFromHighlight({
              proyectoId: currentProjectId,
              documentoId: currentDocumentId,
              hallazgoId: data.hallazgoId,
              textoSubrayado: selectedText,
              coordenadas: selectedCoordinates,
              subtitulo: data.subtitulo,
            });

            alert("Nota creada desde subrayado.");
            await loadPageData();
            clearSelection();
          }}
        />
      )}
    </main>
  );
}

export default DocumentViewerPage;